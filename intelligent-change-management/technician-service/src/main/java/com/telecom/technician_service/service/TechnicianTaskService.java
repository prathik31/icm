package com.telecom.technician_service.service;

import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.telecom.technician_service.dto.CompleteExecutionRequest;
import com.telecom.technician_service.dto.DashboardResponse;
import com.telecom.technician_service.dto.ExecutionHistoryResponse;
import com.telecom.technician_service.dto.ScheduleRequest;
import com.telecom.technician_service.dto.TaskDetailsResponse;
import com.telecom.technician_service.dto.TechnicianDto;
import com.telecom.technician_service.dto.TechnicianTaskDto;
import com.telecom.technician_service.entity.AssignmentStatus;
import com.telecom.technician_service.entity.ExecutionLog;
import com.telecom.technician_service.entity.ExecutionStatus;
import com.telecom.technician_service.entity.Technician;
import com.telecom.technician_service.entity.TechnicianAssignment;
import com.telecom.technician_service.entity.TechnicianSchedule;
import com.telecom.technician_service.exception.InvalidAssignmentException;
import com.telecom.technician_service.exception.ResourceNotFoundException;
import com.telecom.technician_service.repository.ExecutionLogRepository;
import com.telecom.technician_service.repository.TechnicianAssignmentRepository;
import com.telecom.technician_service.repository.TechnicianRepository;
import com.telecom.technician_service.repository.TechnicianScheduleRepository;

import lombok.extern.slf4j.Slf4j;

@Slf4j
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
        log.info("CR Response = {}", changeRequest);
        log.info("Assessment Response = {}", assessment);
        log.info("Runbook Response = {}", runbook);
        TechnicianSchedule schedule = scheduleRepository.findByCrId(crId).orElse(null);
        ExecutionLog executionLog = executionLogRepository.findFirstByCrIdAndTechnicianIdAndExecutionStatus(crId, assignment.getTechnicianId(), ExecutionStatus.IN_EXECUTION)
                .orElse(null);

        Technician technician = technicianRepository.findById(assignment.getTechnicianId()).orElse(null);
        TechnicianDto assignedTechnician = technician != null ? toTechnicianDto(technician) : null;

        return TaskDetailsResponse.builder()
                .crId(crId)
                .changeRequest(changeRequest)
                .assessment(assessment)
                .runbook(runbook)
                .assignmentStatus(assignment.getStatus().name())
                .technicianId(assignment.getTechnicianId())
                .assignedTechnician(assignedTechnician)
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

    public List<ExecutionHistoryResponse> findExecutionHistory(String technicianId) {
        return executionLogRepository.findByTechnicianId(technicianId).stream()
                .filter(log -> log.getExecutionStatus() == ExecutionStatus.COMPLETED)
                .map(this::toExecutionHistoryResponse)
                .collect(Collectors.toList());
    }

    public DashboardResponse getDashboard(String technicianId) {
        List<TechnicianAssignment> assignments = assignmentRepository.findByTechnicianId(technicianId);

        long assigned = assignments.stream()
                .filter(assignment -> assignment.getStatus() == AssignmentStatus.ASSIGNED)
                .count();
        long scheduled = assignments.stream()
                .filter(assignment -> assignment.getStatus() == AssignmentStatus.SCHEDULED)
                .count();
        long inExecution = assignments.stream()
                .filter(assignment -> assignment.getStatus() == AssignmentStatus.IN_EXECUTION)
                .count();
        long completed = assignments.stream()
                .filter(assignment -> assignment.getStatus() == AssignmentStatus.COMPLETED)
                .count();

        List<TechnicianTaskDto> recentTasks = assignments.stream()
                .sorted(Comparator.comparing(this::getTaskSortKey, Comparator.nullsLast(Comparator.naturalOrder())).reversed())
                .map(this::toTechnicianTaskDto)
                .limit(5)
                .collect(Collectors.toList());

        return DashboardResponse.builder()
                .totalTasks(assignments.size())
                .assigned(assigned)
                .scheduled(scheduled)
                .inExecution(inExecution)
                .completed(completed)
                .recentTasks(recentTasks)
                .build();
    }

    private LocalDateTime getTaskSortKey(TechnicianAssignment assignment) {
        TechnicianSchedule schedule = scheduleRepository.findByCrId(assignment.getCrId()).orElse(null);
        if (schedule != null && schedule.getScheduledStart() != null) {
            return schedule.getScheduledStart();
        }
        return assignment.getAssignedAt();
    }

    private TechnicianDto toTechnicianDto(Technician technician) {
        return TechnicianDto.builder()
                .technicianId(technician.getTechnicianId())
                .technicianCode(technician.getEmployeeCode())
                .fullName(technician.getFullName())
                .name(technician.getFullName())
                .email(technician.getEmail())
                .region(technician.getRegion())
                .specialization(technician.getSpecialization())
                .experienceYears(technician.getExperienceYears())
                .certifications(technician.getCertifications())
                .availabilityStatus(technician.getAvailabilityStatus())
                .status(technician.getAvailabilityStatus())
                .currentWorkload(technician.getCurrentWorkload())
                .build();
    }

    public List<TechnicianDto> listAvailableTechnicians() {
        return technicianRepository.findByActiveTrue().stream()
                .map(technician -> TechnicianDto.builder()
                        .technicianId(technician.getTechnicianId())
                        .technicianCode(technician.getEmployeeCode())
                        .fullName(technician.getFullName())
                        .name(technician.getFullName())
                        .email(technician.getEmail())
                        .region(technician.getRegion())
                        .specialization(technician.getSpecialization())
                        .experienceYears(technician.getExperienceYears())
                        .certifications(technician.getCertifications())
                        .availabilityStatus(technician.getAvailabilityStatus())
                        .status(technician.getAvailabilityStatus())
                        .currentWorkload(technician.getCurrentWorkload())
                        .build())
                .collect(Collectors.toList());
    }

    public TechnicianDto getTechnicianProfile(String technicianId) {
        return technicianRepository.findById(technicianId)
                .map(this::toTechnicianDto)
                .orElseThrow(() -> new ResourceNotFoundException("Technician not found: " + technicianId));
    }

    private TechnicianTaskDto toTechnicianTaskDto(TechnicianAssignment assignment) {
        TechnicianSchedule schedule = scheduleRepository.findByCrId(assignment.getCrId()).orElse(null);
        ExecutionLog executionLog = executionLogRepository.findFirstByCrIdAndTechnicianIdAndExecutionStatus(assignment.getCrId(), assignment.getTechnicianId(), ExecutionStatus.IN_EXECUTION)
                .orElse(null);
        Map<String, Object> changeRequest = externalServiceClient.fetchChangeRequest(assignment.getCrId());
        Map<String, Object> riskAssessment = changeRequest != null
                ? (Map<String, Object>) changeRequest.getOrDefault("riskAssessment", changeRequest.get("risk_assessment"))
                : null;

        return TechnicianTaskDto.builder()
                .crId(assignment.getCrId())
                .technicianId(assignment.getTechnicianId())
                .title(changeRequest != null ? (String) changeRequest.get("title") : null)
                .region(changeRequest != null ? (String) changeRequest.get("region") : null)
                .domain(changeRequest != null ? (String) changeRequest.get("domain") : null)
                .changeType(changeRequest != null ? (String) changeRequest.get("changeType") : null)
                .riskLevel(riskAssessment != null ? (String) riskAssessment.get("riskLevel") : null)
                .riskScore(riskAssessment != null ? (Double) riskAssessment.get("riskScore") : null)
                .assignmentStatus(assignment.getStatus().name())
                .assignedAt(assignment.getAssignedAt())
                .scheduledStart(schedule != null ? schedule.getScheduledStart() : null)
                .scheduledEnd(schedule != null ? schedule.getScheduledEnd() : null)
                .executionStatus(executionLog != null ? executionLog.getExecutionStatus().name() : null)
                .build();
    }

    private ExecutionHistoryResponse toExecutionHistoryResponse(ExecutionLog log) {
        Map<String, Object> changeRequest = externalServiceClient.fetchChangeRequest(log.getCrId());
        Map<String, Object> riskAssessment = changeRequest != null
                ? (Map<String, Object>) changeRequest.getOrDefault("riskAssessment", changeRequest.get("risk_assessment"))
                : null;

        return ExecutionHistoryResponse.builder()
                .crId(log.getCrId())
                .title(changeRequest != null ? (String) changeRequest.get("title") : null)
                .region(changeRequest != null ? (String) changeRequest.get("region") : null)
                .riskLevel(riskAssessment != null ? (String) riskAssessment.get("riskLevel") : null)
                .riskScore(riskAssessment != null ? (Double) riskAssessment.get("riskScore") : null)
                .completedAt(log.getExecutionEnd())
                .executionStatus(log.getExecutionStatus().name())
                .rollbackRequired(log.getRollbackRequired())
                .notes(log.getNotes())
                .build();
    }
}
