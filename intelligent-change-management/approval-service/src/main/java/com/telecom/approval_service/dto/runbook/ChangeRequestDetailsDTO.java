package com.telecom.approval_service.dto.runbook;

import java.util.List;

import lombok.Data;

@Data
public class ChangeRequestDetailsDTO {

    private String crId;

    private String title;

    private String description;

    private String domain;

    private String changeType;

    private String region;

    private String status;

    private String scheduledStart;

    private String scheduledEnd;

    private Boolean rollbackAvailable;

    private String businessJustification;

    private List<ChangeRequestAssetDTO> assets;
}