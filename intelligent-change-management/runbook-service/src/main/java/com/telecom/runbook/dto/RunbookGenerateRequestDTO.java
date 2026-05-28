package com.telecom.runbook.dto;

import java.util.List;

import com.fasterxml.jackson.annotation.JsonProperty;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class RunbookGenerateRequestDTO {

    @JsonProperty("cr_id")
    private String crId;

    private String title;

    private String description;

    @JsonProperty("change_type")
    private String changeType;

    private String domain;

    private String region;

    @JsonProperty("scheduled_start")
    private String scheduledStart;

    @JsonProperty("scheduled_end")
    private String scheduledEnd;

    @JsonProperty("rollback_available")
    private Boolean rollbackAvailable;

    @JsonProperty("business_justification")
    private String businessJustification;

    @JsonProperty("asset_ids")
    private List<String> assetIds;

    @JsonProperty("risk_assessment")
    private RiskAssessmentDTO riskAssessment;
}