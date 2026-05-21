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
public class RunbookGenerateRequest {

    private String crId;

    private String title;

    private String description;

    private String domain;

    private String changeType;

    private String region;

    private String scheduledStart;

    private String scheduledEnd;

    private Boolean rollbackAvailable;

    private String businessJustification;

    private List<String> assetIds;

    private RiskAssessmentDTO riskAssessment;
}
