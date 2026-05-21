package com.telecom.approval_service.dto.runbook;

import lombok.Data;

@Data
public class ChangeRequestAssetDTO {

    private String assetType;

    private String assetId;

    private String hostname;
}