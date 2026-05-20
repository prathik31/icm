package com.telecom.change_request_service.dto.event;

import lombok.Data;

import java.util.List;

import com.fasterxml.jackson.databind.PropertyNamingStrategies;
import com.fasterxml.jackson.databind.annotation.JsonNaming;

@Data
@JsonNaming(
    PropertyNamingStrategies.SnakeCaseStrategy.class
)
public class ChangeRequestEvent {

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

    private Integer assetCount;

    private Boolean isPeakHours;

    private Boolean isWeekend;

    private Integer durationMinutes;

    private Boolean hasCoreAsset;

    private Boolean anyInternetFacing;

    private Boolean allAssetsRedundant;

    private String maxAssetCriticality;

    private List<String> assetIds;
}
