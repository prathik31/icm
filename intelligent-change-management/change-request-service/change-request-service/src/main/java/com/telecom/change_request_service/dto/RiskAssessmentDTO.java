package com.telecom.change_request_service.dto;

import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
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