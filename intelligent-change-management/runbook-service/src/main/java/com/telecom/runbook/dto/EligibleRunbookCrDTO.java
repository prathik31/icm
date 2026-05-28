package com.telecom.runbook.dto;

import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class EligibleRunbookCrDTO {

    private String crId;
    private String title;
    private String riskLevel;
    private String blastRadius;
    private String status;
    private LocalDateTime createdAt;
    private Boolean runbookGenerated;
}