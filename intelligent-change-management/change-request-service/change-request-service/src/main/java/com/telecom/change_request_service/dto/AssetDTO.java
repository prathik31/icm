package com.telecom.change_request_service.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class AssetDTO {

    @NotBlank(message = "Asset Type is required")
    private String assetType;

    @NotBlank(message = "Asset ID is required")
    private String assetId;

    @NotBlank(message = "Hostname is required")
    private String hostname;
}