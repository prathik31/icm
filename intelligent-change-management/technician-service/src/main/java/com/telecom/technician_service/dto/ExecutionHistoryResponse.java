package com.telecom.technician_service.dto;

import java.time.LocalDateTime;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class ExecutionHistoryResponse {
    private String crId;
    private String title;
    private String region;
    private String riskLevel;
    private Double riskScore;
    private LocalDateTime completedAt;
    private String executionStatus;
    private Boolean rollbackRequired;
    private String notes;
}
