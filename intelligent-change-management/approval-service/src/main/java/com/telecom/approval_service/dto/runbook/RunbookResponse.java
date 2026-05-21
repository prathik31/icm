package com.telecom.approval_service.dto.runbook;

import java.util.List;

import com.fasterxml.jackson.databind.PropertyNamingStrategies;
import com.fasterxml.jackson.databind.annotation.JsonNaming;

import lombok.Data;

@Data
@JsonNaming(PropertyNamingStrategies.SnakeCaseStrategy.class)
public class RunbookResponse {

    private String runbookId;

    private String crId;

    private String generatedAt;

    private String title;

    private Integer estimatedDurationMins;

    private String riskLevel;

    private String blastRadius;

    private String riskNotes;

    private List<String> preChecks;

    private List<ExecutionStepDTO> executionSteps;

    private List<String> validationSteps;

    private List<String> rollbackSteps;

    private List<String> monitoringGuidance;

    private List<String> escalationConditions;

    private List<RagSourceDTO> ragSources;

    private String generatedBy;

}
