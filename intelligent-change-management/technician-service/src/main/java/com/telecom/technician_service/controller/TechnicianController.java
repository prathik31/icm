package com.telecom.technician_service.controller;

import com.telecom.technician_service.dto.AssignTechnicianRequest;
import com.telecom.technician_service.dto.CompleteExecutionRequest;
import com.telecom.technician_service.dto.DashboardResponse;
import com.telecom.technician_service.dto.ScheduleRequest;
import com.telecom.technician_service.dto.TaskDetailsResponse;
import com.telecom.technician_service.dto.TechnicianTaskDto;
import com.telecom.technician_service.entity.ExecutionLog;
import com.telecom.technician_service.entity.TechnicianAssignment;
import com.telecom.technician_service.security.AuthUtil;
import com.telecom.technician_service.service.TechnicianTaskService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/v1/technicians")
public class TechnicianController {

    private final TechnicianTaskService taskService;

    public TechnicianController(TechnicianTaskService taskService) {
        this.taskService = taskService;
    }

    @PostMapping("/assign/{crId}")
    @PreAuthorize("hasRole('APPROVER')")
    public ResponseEntity<TechnicianAssignment> assignTechnician(@PathVariable String crId,
                                                                 @Valid @RequestBody AssignTechnicianRequest request) {
        String userId = AuthUtil.getCurrentUserId();
        TechnicianAssignment assignment = taskService.assignTechnician(crId, request.getTechnicianId(), userId);
        return ResponseEntity.ok(assignment);
    }

    @GetMapping("/my-tasks")
    @PreAuthorize("hasRole('TECHNICIAN')")
    public ResponseEntity<List<TechnicianTaskDto>> getMyTasks() {
        String technicianId = AuthUtil.getCurrentUserId();
        return ResponseEntity.ok(taskService.listMyTasks(technicianId));
    }

    @GetMapping("/task/{crId}")
    public ResponseEntity<TaskDetailsResponse> getTaskDetails(@PathVariable String crId) {
        return ResponseEntity.ok(taskService.getTaskDetails(crId));
    }

    @PostMapping("/{crId}/schedule")
    @PreAuthorize("hasRole('TECHNICIAN')")
    public ResponseEntity<?> scheduleTask(@PathVariable String crId,
                                          @Valid @RequestBody ScheduleRequest request) {
        String technicianId = AuthUtil.getCurrentUserId();
        return ResponseEntity.ok(taskService.scheduleTask(crId, request, technicianId));
    }

    @PostMapping("/{crId}/start")
    @PreAuthorize("hasRole('TECHNICIAN')")
    public ResponseEntity<ExecutionLog> startExecution(@PathVariable String crId) {
        String technicianId = AuthUtil.getCurrentUserId();
        return ResponseEntity.ok(taskService.startExecution(crId, technicianId));
    }

    @PostMapping("/{crId}/complete")
    @PreAuthorize("hasRole('TECHNICIAN')")
    public ResponseEntity<ExecutionLog> completeExecution(@PathVariable String crId,
                                                          @Valid @RequestBody CompleteExecutionRequest request) {
        String technicianId = AuthUtil.getCurrentUserId();
        return ResponseEntity.ok(taskService.completeExecution(crId, request, technicianId));
    }

    @GetMapping("/execution-history")
    @PreAuthorize("hasRole('TECHNICIAN')")
    public ResponseEntity<List<ExecutionLog>> getExecutionHistory() {
        String technicianId = AuthUtil.getCurrentUserId();
        return ResponseEntity.ok(taskService.findExecutionHistory(technicianId));
    }

    @GetMapping("/dashboard")
    public ResponseEntity<DashboardResponse> getDashboard() {
        return ResponseEntity.ok(taskService.getDashboard());
    }
}
