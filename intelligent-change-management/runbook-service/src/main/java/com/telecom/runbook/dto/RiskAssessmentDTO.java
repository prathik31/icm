package com.telecom.runbook.dto;

import java.util.List;

import com.fasterxml.jackson.databind.PropertyNamingStrategies;
import com.fasterxml.jackson.databind.annotation.JsonNaming;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@JsonNaming(PropertyNamingStrategies.SnakeCaseStrategy.class)
public class RiskAssessmentDTO {

    private Double riskScore;
    private String riskLevel;
    private String blastRadius;
    private Double confidence;
    private String executiveSummary;
    private String technicalAnalysis;
    private String cabGuidance;
    private List<String> recommendations;
    private List<String> riskIndicators;
}