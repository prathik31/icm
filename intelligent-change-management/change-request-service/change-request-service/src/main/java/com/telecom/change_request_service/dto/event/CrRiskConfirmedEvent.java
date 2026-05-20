package com.telecom.change_request_service.dto.event;

import lombok.Data;

import com.fasterxml.jackson.databind.PropertyNamingStrategies;
import com.fasterxml.jackson.databind.annotation.JsonNaming;

@Data
@JsonNaming(
    PropertyNamingStrategies.SnakeCaseStrategy.class
)
public class CrRiskConfirmedEvent {

    private String crId;

    private String riskLevel;

    private Integer riskScore;

    private String requestedByUserId;
}
