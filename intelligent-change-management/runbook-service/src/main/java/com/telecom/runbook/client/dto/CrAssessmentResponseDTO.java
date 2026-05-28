package com.telecom.runbook.client.dto;

import java.time.LocalDateTime;
import java.util.List;

import lombok.Data;

@Data
public class CrAssessmentResponseDTO {

    private String assessmentId;
    private String crId;
    private Double riskScore;
    private String riskLevel;
    private String blastRadius;
    private Double confidence;
    private String executiveSummary;
    private String technicalAnalysis;
    private String cabGuidance;
    private List<String> recommendations;
    private List<String> riskIndicators;
    private LocalDateTime generatedAt;
}