package com.telecom.runbook.dto;

import java.time.LocalDateTime;

import com.fasterxml.jackson.annotation.JsonProperty;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class RunbookGenerateResponseDTO {

    @JsonProperty("runbook_id")
    private String runbookId;

    @JsonProperty("cr_id")
    private String crId;

    private String status;

    private String title;

    @JsonProperty("estimated_duration_mins")
    private Integer estimatedDurationMins;

    @JsonProperty("risk_level")
    private String riskLevel;

    @JsonProperty("blast_radius")
    private String blastRadius;

    @JsonProperty("risk_notes")
    private Object riskNotes;

    @JsonProperty("pre_checks")
    private Object preChecks;

    @JsonProperty("execution_steps")
    private Object executionSteps;

    @JsonProperty("validation_steps")
    private Object validationSteps;

    @JsonProperty("rollback_steps")
    private Object rollbackSteps;

    @JsonProperty("monitoring_guidance")
    private Object monitoringGuidance;

    @JsonProperty("escalation_conditions")
    private Object escalationConditions;

    @JsonProperty("rag_sources")
    private Object ragSources;

    @JsonProperty("generated_by")
    private String generatedBy;

    @JsonProperty("generated_at")
    private LocalDateTime generatedAt;
}