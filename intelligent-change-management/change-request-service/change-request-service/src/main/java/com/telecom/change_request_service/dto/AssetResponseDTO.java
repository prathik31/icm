package com.telecom.change_request_service.dto;

import lombok.Data;

@Data
public class AssetResponseDTO {

    private String assetType;

    private String assetId;

    private String hostname;
}