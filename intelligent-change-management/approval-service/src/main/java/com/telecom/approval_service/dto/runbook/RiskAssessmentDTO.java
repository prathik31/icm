package com.telecom.approval_service.dto.runbook;

import java.util.List;

import com.fasterxml.jackson.databind.PropertyNamingStrategies;
import com.fasterxml.jackson.databind.annotation.JsonNaming;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonNaming(PropertyNamingStrategies.SnakeCaseStrategy.class)
public class RiskAssessmentDTO {

    private Double riskScore;

    private String riskLevel;

    private String blastRadius;

    private Double confidence;

    private List<String> recommendations;

    private List<String> riskIndicators;
}