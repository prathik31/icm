package com.telecom.change_request_service.dto.event;

import lombok.Data;

import java.util.List;

import com.fasterxml.jackson.annotation.JsonAlias;
import com.fasterxml.jackson.databind.PropertyNamingStrategies;
import com.fasterxml.jackson.databind.annotation.JsonNaming;

@Data
@JsonNaming(
    PropertyNamingStrategies.SnakeCaseStrategy.class
)
public class RiskAssessmentEvent {

    @JsonAlias({"assessment_id", "assessmentId"})
    private String assessmentId;

    @JsonAlias({"cr_id", "crId"})
    private String crId;

    @JsonAlias({"risk_score", "riskScore"})
    private Double riskScore;

    @JsonAlias({"risk_level", "riskLevel"})
    private String riskLevel;

    @JsonAlias({"blast_radius", "blastRadius"})
    private String blastRadius;

    @JsonAlias({"confidence", "confidence"})
    private Double confidence;

    @JsonAlias({"executive_summary", "executiveSummary"})
    private String executiveSummary;

    @JsonAlias({"technical_analysis", "technicalAnalysis"})
    private String technicalAnalysis;

    @JsonAlias({"cab_guidance", "cabGuidance"})
    private String cabGuidance;

    @JsonAlias({"recommendations", "recommendations"})
    private List<String> recommendations;

    @JsonAlias({"risk_indicators", "riskIndicators"})
    private List<String> riskIndicators;

    @JsonAlias({"grounding_evidence", "groundingEvidence"})
    private GroundingEvidence groundingEvidence;

    @JsonAlias({"model_metadata", "modelMetadata"})
    private ModelMetadata modelMetadata;

    @Data
    public static class GroundingEvidence {

        @JsonAlias({"similar_changes_analyzed", "similarChangesAnalyzed"})
        private Integer similarChangesAnalyzed;

        @JsonAlias({"similar_changes_with_outages", "similarChangesWithOutages"})
        private Integer similarChangesWithOutages;

        @JsonAlias({"similar_changes_with_rollbacks", "similarChangesWithRollbacks"})
        private Integer similarChangesWithRollbacks;

        @JsonAlias({"similar_changes_failed", "similarChangesFailed"})
        private Integer similarChangesFailed;
    }

    @Data
    @JsonNaming(
        PropertyNamingStrategies.SnakeCaseStrategy.class
    )
    public static class ModelMetadata {

        @JsonAlias({"prediction_engine", "predictionEngine"})
        private String predictionEngine;

        @JsonAlias({"reasoning_engine", "reasoningEngine"})
        private String reasoningEngine;

        @JsonAlias({"grounding_enabled", "groundingEnabled"})
        private Boolean groundingEnabled;
    }
}
