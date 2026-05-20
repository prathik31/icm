package com.telecom.change_request_service.dto;

import lombok.Data;

@Data
public class AssetResponseDTO {

    private String assetId;

    private String assetType;

    private String domain;

    private String tier;

    private String hostname;

    private String region;

    private String datacenter;

    private String vendor;

    private String model;

    private String criticalityLevel;

    private Boolean isCoreInfrastructure;

    private Boolean isInternetFacing;

    private Boolean redundancyAvailable;

    private Integer connectedAssetCount;

    private Integer regionHubWeight;

    private Boolean supportsRollback;

    private Boolean isActive;
}