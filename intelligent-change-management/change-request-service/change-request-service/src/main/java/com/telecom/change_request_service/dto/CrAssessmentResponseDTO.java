package com.telecom.change_request_service.dto;

import java.time.LocalDateTime;
import java.util.List;

import com.telecom.change_request_service.enums.BlastRadius;

import lombok.Data;

@Data
public class CrAssessmentResponseDTO {

    private String assessmentId;
    private String crId;
    private Double riskScore;
    private String riskLevel;
    private BlastRadius blastRadius;
    private Double confidence;
    private String executiveSummary;
    private String technicalAnalysis;
    private String cabGuidance;
    private List<String> recommendations;
    private List<String> riskIndicators;
    private LocalDateTime generatedAt;
}
