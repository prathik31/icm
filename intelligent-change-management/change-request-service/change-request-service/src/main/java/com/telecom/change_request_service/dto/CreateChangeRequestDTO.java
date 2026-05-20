package com.telecom.change_request_service.dto;

import java.time.LocalDateTime;
import java.util.List;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class CreateChangeRequestDTO {

    @NotBlank(message = "Title is required")
    private String title;

    @NotBlank(message = "Description is required")
    private String description;

    @NotBlank(message = "Domain is required")
    private String domain;

    @NotBlank(message = "Change Type is required")
    private String changeType;

    @NotBlank(message = "Region is required")
    private String region;

    @NotNull(message = "Scheduled Start is required")
    private LocalDateTime scheduledStart;

    @NotNull(message = "Scheduled End is required")
    private LocalDateTime scheduledEnd;

    @NotNull(message = "Rollback Available is required")
    private Boolean rollbackAvailable;

    @NotBlank(message = "Business Justification is required")
    private String businessJustification;

    @NotEmpty(message = "Assets are required")
    private List<AssetDTO> assets;

    private String requestedByUserId;
}