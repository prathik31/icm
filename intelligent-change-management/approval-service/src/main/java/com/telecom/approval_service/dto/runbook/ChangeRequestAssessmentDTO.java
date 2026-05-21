package com.telecom.approval_service.dto.runbook;

import java.util.List;

import lombok.Data;

@Data
public class ChangeRequestAssessmentDTO {

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

    private String generatedAt;
}