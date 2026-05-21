package com.telecom.approval_service.dto.runbook;

import com.fasterxml.jackson.databind.PropertyNamingStrategies;
import com.fasterxml.jackson.databind.annotation.JsonNaming;

import lombok.Data;

@Data
@JsonNaming(PropertyNamingStrategies.SnakeCaseStrategy.class)
public class ExecutionStepDTO {

    private Integer stepNumber;

    private String action;

    private String expectedOutput;

    private String rollbackAction;

    private Integer timeoutSeconds;
}