package com.telecom.runbook.client.dto;

import java.time.LocalDateTime;
import java.util.List;

import com.telecom.runbook.dto.CrAssetDTO;

import lombok.Data;

@Data
public class ChangeRequestResponseDTO {

    private String crId;
    private String title;
    private String description;
    private String domain;
    private String changeType;
    private String region;
    private String status;
    private LocalDateTime scheduledStart;
    private LocalDateTime scheduledEnd;
    private Boolean rollbackAvailable;
    private String businessJustification;
    private List<CrAssetDTO> assets;
    private String requestedByUserId;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}