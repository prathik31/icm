package com.telecom.runbook.dto;

import java.time.LocalDateTime;

import lombok.Data;

@Data
public class RunbookSummaryDTO {

    private String runbookId;
    private String crId;
    private String title;
    private LocalDateTime generatedAt;
    private Integer estimatedDurationMins;
    private String riskLevel;
    private String blastRadius;
    private String generatedBy;
}