package com.telecom.change_request_service.dto.event;

import lombok.Data;

import java.util.List;

import com.fasterxml.jackson.databind.PropertyNamingStrategies;
import com.fasterxml.jackson.databind.annotation.JsonNaming;

@Data
@JsonNaming(
    PropertyNamingStrategies.SnakeCaseStrategy.class
)
public class RiskAssessmentEvent {

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

    private GroundingEvidence groundingEvidence;

    private ModelMetadata modelMetadata;

    @Data
    public static class GroundingEvidence {

        private Integer similarChangesAnalyzed;

        private Integer similarChangesWithOutages;

        private Integer similarChangesWithRollbacks;

        private Integer similarChangesFailed;
    }

    @Data
    @JsonNaming(
        PropertyNamingStrategies.SnakeCaseStrategy.class
    )
    public static class ModelMetadata {

        private String predictionEngine;

        private String reasoningEngine;

        private Boolean groundingEnabled;
    }
}
