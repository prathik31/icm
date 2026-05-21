package com.telecom.approval_service.dto.runbook;

import com.fasterxml.jackson.databind.PropertyNamingStrategies;
import com.fasterxml.jackson.databind.annotation.JsonNaming;

import lombok.Data;

@Data
@JsonNaming(PropertyNamingStrategies.SnakeCaseStrategy.class)
public class RagSourceDTO {

    private String runbookId;

    private String title;

    private String domain;

    private String changeType;
}