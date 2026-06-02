package com.telecom.technician_service.dto;

import lombok.Builder;
import lombok.Data;
import java.time.LocalDateTime;
import java.util.Map;

@Data
@Builder
public class TaskDetailsResponse {
    private String crId;
    private Map<String, Object> changeRequest;
    private Map<String, Object> assessment;
    private Map<String, Object> runbook;
    private String assignmentStatus;
    private String technicianId;
    private String assignedBy;
    private LocalDateTime assignedAt;
    private LocalDateTime scheduledStart;
    private LocalDateTime scheduledEnd;
    private String scheduleStatus;
    private String executionStatus;
    private LocalDateTime executionStart;
    private LocalDateTime executionEnd;
    private Boolean rollbackRequired;
    private String notes;
}
