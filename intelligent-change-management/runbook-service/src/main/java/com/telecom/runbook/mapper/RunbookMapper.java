package com.telecom.runbook.mapper;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.NullNode;
import com.fasterxml.jackson.databind.node.TextNode;
import com.telecom.runbook.dto.RunbookDetailDTO;
import com.telecom.runbook.dto.RunbookSummaryDTO;
import com.telecom.runbook.entity.GeneratedRunbook;

import org.springframework.stereotype.Component;

@Component
public class RunbookMapper {

    private final ObjectMapper objectMapper;

    public RunbookMapper(ObjectMapper objectMapper) {
        this.objectMapper = objectMapper;
    }

    public RunbookSummaryDTO toSummaryDto(GeneratedRunbook runbook) {
        RunbookSummaryDTO dto = new RunbookSummaryDTO();
        dto.setRunbookId(runbook.getRunbookId());
        dto.setCrId(runbook.getCrId());
        dto.setTitle(runbook.getTitle());
        dto.setGeneratedAt(runbook.getGeneratedAt());
        dto.setEstimatedDurationMins(runbook.getEstimatedDurationMins());
        dto.setRiskLevel(runbook.getRiskLevel());
        dto.setBlastRadius(runbook.getBlastRadius());
        dto.setGeneratedBy(runbook.getGeneratedBy());
        return dto;
    }

    public RunbookDetailDTO toDetailDto(GeneratedRunbook runbook) {
        RunbookDetailDTO dto = new RunbookDetailDTO();
        dto.setRunbookId(runbook.getRunbookId());
        dto.setCrId(runbook.getCrId());
        dto.setTitle(runbook.getTitle());
        dto.setGeneratedAt(runbook.getGeneratedAt());
        dto.setEstimatedDurationMins(runbook.getEstimatedDurationMins());
        dto.setRiskLevel(runbook.getRiskLevel());
        dto.setBlastRadius(runbook.getBlastRadius());
        dto.setRiskNotes(parseJson(runbook.getRiskNotes()));
        dto.setPreChecks(parseJson(runbook.getPreChecks()));
        dto.setExecutionSteps(parseJson(runbook.getExecutionSteps()));
        dto.setValidationSteps(parseJson(runbook.getValidationSteps()));
        dto.setRollbackSteps(parseJson(runbook.getRollbackSteps()));
        dto.setMonitoringGuidance(parseJson(runbook.getMonitoringGuidance()));
        dto.setEscalationConditions(parseJson(runbook.getEscalationConditions()));
        dto.setRagSources(parseJson(runbook.getRagSources()));
        dto.setGeneratedBy(runbook.getGeneratedBy());
        dto.setCreatedAt(runbook.getCreatedAt());
        return dto;
    }

    private JsonNode parseJson(String value) {
        if (value == null || value.isBlank()) {
            return NullNode.getInstance();
        }
        try {
            return objectMapper.readTree(value);
        } catch (Exception exception) {
            return TextNode.valueOf(value);
        }
    }
}