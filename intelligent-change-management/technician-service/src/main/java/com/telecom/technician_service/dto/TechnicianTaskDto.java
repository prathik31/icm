package com.telecom.technician_service.dto;

import java.time.LocalDateTime;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class TechnicianTaskDto {
    private String crId;
    private String technicianId;
    private String title;
    private String region;
    private String domain;
    private String changeType;
    private String riskLevel;
    private Double riskScore;
    private String assignmentStatus;
    private LocalDateTime assignedAt;
    private LocalDateTime scheduledStart;
    private LocalDateTime scheduledEnd;
    private String executionStatus;
}
