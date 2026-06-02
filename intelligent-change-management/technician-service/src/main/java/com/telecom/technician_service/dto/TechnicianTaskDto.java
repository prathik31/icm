package com.telecom.technician_service.dto;

import lombok.Builder;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@Builder
public class TechnicianTaskDto {
    private String crId;
    private String technicianId;
    private String assignmentStatus;
    private LocalDateTime assignedAt;
    private LocalDateTime scheduledStart;
    private LocalDateTime scheduledEnd;
    private String executionStatus;
}
