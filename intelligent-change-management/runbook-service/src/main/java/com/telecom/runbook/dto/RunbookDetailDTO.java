package com.telecom.runbook.dto;

import java.time.LocalDateTime;

import com.fasterxml.jackson.databind.JsonNode;

import lombok.Data;

@Data
public class RunbookDetailDTO {

    private String runbookId;
    private String crId;
    private String title;
    private LocalDateTime generatedAt;
    private Integer estimatedDurationMins;
    private String riskLevel;
    private String blastRadius;
    private JsonNode riskNotes;
    private JsonNode preChecks;
    private JsonNode executionSteps;
    private JsonNode validationSteps;
    private JsonNode rollbackSteps;
    private JsonNode monitoringGuidance;
    private JsonNode escalationConditions;
    private JsonNode ragSources;
    private String generatedBy;
    private LocalDateTime createdAt;
}