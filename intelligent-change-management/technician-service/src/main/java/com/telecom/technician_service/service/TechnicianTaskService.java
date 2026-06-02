package com.telecom.technician_service.service;

import com.telecom.technician_service.dto.CompleteExecutionRequest;
import com.telecom.technician_service.dto.DashboardResponse;
import com.telecom.technician_service.dto.ScheduleRequest;
import com.telecom.technician_service.dto.TaskDetailsResponse;
import com.telecom.technician_service.dto.TechnicianTaskDto;
import com.telecom.technician_service.entity.AssignmentStatus;
import com.telecom.technician_service.entity.ExecutionLog;
import com.telecom.technician_service.entity.ExecutionStatus;
import com.telecom.technician_service.entity.TechnicianAssignment;
import com.telecom.technician_service.entity.TechnicianSchedule;
import com.telecom.technician_service.entity.Technician;
import com.telecom.technician_service.exception.InvalidAssignmentException;
import com.telecom.technician_service.exception.ResourceNotFoundException;
import com.telecom.technician_service.repository.ExecutionLogRepository;
import com.telecom.technician_service.repository.TechnicianAssignmentRepository;
import com.telecom.technician_service.repository.TechnicianRepository;
import com.telecom.technician_service.repository.TechnicianScheduleRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class TechnicianTaskService {

    private final TechnicianAssignmentRepository assignmentRepository;
    private final TechnicianScheduleRepository scheduleRepository;
    private final ExecutionLogRepository executionLogRepository;
    private final TechnicianRepository technicianRepository;
    private final ExternalServiceClient externalServiceClient;
    private final EventPublisher eventPublisher;

    public TechnicianTaskService(TechnicianAssignmentRepository assignmentRepository,
                                 TechnicianScheduleRepository scheduleRepository,
                                 ExecutionLogRepository executionLogRepository,
                                 TechnicianRepository technicianRepository,
                                 ExternalServiceClient externalServiceClient,
                                 EventPublisher eventPublisher) {
        this.assignmentRepository = assignmentRepository;
        this.scheduleRepository = scheduleRepository;
        this.executionLogRepository = executionLogRepository;
        this.technicianRepository = technicianRepository;
        this.externalServiceClient = externalServiceClient;
        this.eventPublisher = eventPublisher;
    }

    @Transactional
    public TechnicianAssignment assignTechnician(String crId, String technicianId, String assignedBy) {
        Technician technician = technicianRepository.findById(technicianId)
                .orElseThrow(() -> new ResourceNotFoundException("Technician not found: " + technicianId));

        TechnicianAssignment assignment = assignmentRepository.findByCrId(crId)
                .orElse(TechnicianAssignment.builder()
                        .assignmentId(UUID.randomUUID().toString())
                        .crId(crId)
                        .build());

        assignment.setTechnicianId(technician.getTechnicianId());
        assignment.setAssignedBy(assignedBy);
        assignment.setAssignedAt(LocalDateTime.now());
        assignment.setStatus(AssignmentStatus.ASSIGNED);
        assignment = assignmentRepository.save(assignment);

        eventPublisher.publishTechnicianAssigned(crId, technicianId);
        return assignment;
    }

    public List<TechnicianTaskDto> listMyTasks(String technicianId) {
        return assignmentRepository.findByTechnicianId(technicianId).stream()
                .map(this::toTechnicianTaskDto)
                .collect(Collectors.toList());
    }

    public TaskDetailsResponse getTaskDetails(String crId) {
        TechnicianAssignment assignment = assignmentRepository.findByCrId(crId)
                .orElseThrow(() -> new ResourceNotFoundException("Assignment not found for CR: " + crId));

        Map<String, Object> changeRequest = externalServiceClient.fetchChangeRequest(crId);
        Map<String, Object> assessment = externalServiceClient.fetchAssessment(crId);
        Map<String, Object> runbook = externalServiceClient.fetchRunbook(crId);
        TechnicianSchedule schedule = scheduleRepository.findByCrId(crId).orElse(null);
        ExecutionLog executionLog = executionLogRepository.findFirstByCrIdAndTechnicianIdAndExecutionStatus(crId, assignment.getTechnicianId(), ExecutionStatus.IN_EXECUTION)
                .orElse(null);

        return TaskDetailsResponse.builder()
                .crId(crId)
                .changeRequest(changeRequest)
                .assessment(assessment)
                .runbook(runbook)
                .assignmentStatus(assignment.getStatus().name())
                .technicianId(assignment.getTechnicianId())
                .assignedBy(assignment.getAssignedBy())
                .assignedAt(assignment.getAssignedAt())
                .scheduledStart(schedule != null ? schedule.getScheduledStart() : null)
                .scheduledEnd(schedule != null ? schedule.getScheduledEnd() : null)
                .scheduleStatus(schedule != null ? schedule.getStatus().name() : null)
                .executionStatus(executionLog != null ? executionLog.getExecutionStatus().name() : null)
                .executionStart(executionLog != null ? executionLog.getExecutionStart() : null)
                .executionEnd(executionLog != null ? executionLog.getExecutionEnd() : null)
                .rollbackRequired(executionLog != null ? executionLog.getRollbackRequired() : null)
                .notes(executionLog != null ? executionLog.getNotes() : null)
                .build();
    }

    @Transactional
    public TechnicianSchedule scheduleTask(String crId, ScheduleRequest request, String technicianId) {
        TechnicianAssignment assignment = assignmentRepository.findByCrId(crId)
                .orElseThrow(() -> new ResourceNotFoundException("Assignment not found for CR: " + crId));

        if (!technicianId.equals(assignment.getTechnicianId())) {
            throw new InvalidAssignmentException("Technician does not own this assignment");
        }

        if (request.getScheduledEnd().isBefore(request.getScheduledStart())) {
            throw new InvalidAssignmentException("scheduledEnd must be after scheduledStart");
        }

        TechnicianSchedule schedule = scheduleRepository.findByCrId(crId)
                .orElse(TechnicianSchedule.builder()
                        .scheduleId(UUID.randomUUID().toString())
                        .crId(crId)
                        .createdAt(LocalDateTime.now())
                        .build());

        schedule.setScheduledStart(request.getScheduledStart());
        schedule.setScheduledEnd(request.getScheduledEnd());
        schedule.setStatus(com.telecom.technician_service.entity.ScheduleStatus.SCHEDULED);

        assignment.setStatus(AssignmentStatus.SCHEDULED);
        assignmentRepository.save(assignment);
        return scheduleRepository.save(schedule);
    }

    @Transactional
    public ExecutionLog startExecution(String crId, String technicianId) {
        TechnicianAssignment assignment = assignmentRepository.findByCrId(crId)
                .orElseThrow(() -> new ResourceNotFoundException("Assignment not found for CR: " + crId));

        if (!technicianId.equals(assignment.getTechnicianId())) {
            throw new InvalidAssignmentException("Technician does not own this assignment");
        }

        assignment.setStatus(AssignmentStatus.IN_EXECUTION);
        assignmentRepository.save(assignment);

        ExecutionLog executionLog = ExecutionLog.builder()
                .executionId(UUID.randomUUID().toString())
                .crId(crId)
                .technicianId(technicianId)
                .executionStart(LocalDateTime.now())
                .executionStatus(ExecutionStatus.IN_EXECUTION)
                .rollbackRequired(false)
                .createdAt(LocalDateTime.now())
                .build();

        eventPublisher.publishExecutionStarted(crId, technicianId);
        return executionLogRepository.save(executionLog);
    }

    @Transactional
    public ExecutionLog completeExecution(String crId, CompleteExecutionRequest request, String technicianId) {
        TechnicianAssignment assignment = assignmentRepository.findByCrId(crId)
                .orElseThrow(() -> new ResourceNotFoundException("Assignment not found for CR: " + crId));

        if (!technicianId.equals(assignment.getTechnicianId())) {
            throw new InvalidAssignmentException("Technician does not own this assignment");
        }

        ExecutionLog executionLog = executionLogRepository.findFirstByCrIdAndTechnicianIdAndExecutionStatus(crId, technicianId, ExecutionStatus.IN_EXECUTION)
                .orElseThrow(() -> new InvalidAssignmentException("No active execution found for CR: " + crId));

        executionLog.setExecutionEnd(LocalDateTime.now());
        executionLog.setExecutionStatus(ExecutionStatus.COMPLETED);
        executionLog.setNotes(request.getNotes());
        executionLog.setRollbackRequired(request.getRollbackRequired());

        assignment.setStatus(AssignmentStatus.COMPLETED);
        assignmentRepository.save(assignment);

        ExecutionLog completed = executionLogRepository.save(executionLog);
        eventPublisher.publishExecutionCompleted(crId, technicianId);
        return completed;
    }

    public List<ExecutionLog> findExecutionHistory(String technicianId) {
        return executionLogRepository.findByTechnicianId(technicianId).stream()
                .filter(log -> log.getExecutionStatus() == ExecutionStatus.COMPLETED)
                .collect(Collectors.toList());
    }

    public DashboardResponse getDashboard() {
        long assigned = assignmentRepository.findByStatus(AssignmentStatus.ASSIGNED).size();
        long scheduled = assignmentRepository.findByStatus(AssignmentStatus.SCHEDULED).size();
        long inExecution = assignmentRepository.findByStatus(AssignmentStatus.IN_EXECUTION).size();
        long completed = assignmentRepository.findByStatus(AssignmentStatus.COMPLETED).size();
        return new DashboardResponse(assigned, scheduled, inExecution, completed);
    }

    private TechnicianTaskDto toTechnicianTaskDto(TechnicianAssignment assignment) {
        TechnicianSchedule schedule = scheduleRepository.findByCrId(assignment.getCrId()).orElse(null);
        ExecutionLog executionLog = executionLogRepository.findFirstByCrIdAndTechnicianIdAndExecutionStatus(assignment.getCrId(), assignment.getTechnicianId(), ExecutionStatus.IN_EXECUTION)
                .orElse(null);
        return TechnicianTaskDto.builder()
                .crId(assignment.getCrId())
                .technicianId(assignment.getTechnicianId())
                .assignmentStatus(assignment.getStatus().name())
                .assignedAt(assignment.getAssignedAt())
                .scheduledStart(schedule != null ? schedule.getScheduledStart() : null)
                .scheduledEnd(schedule != null ? schedule.getScheduledEnd() : null)
                .executionStatus(executionLog != null ? executionLog.getExecutionStatus().name() : null)
                .build();
    }
}
