package com.telecom.change_request_service.dto;

import java.time.LocalDateTime;

import com.telecom.change_request_service.enums.Status;

import lombok.Data;

@Data
public class ChangeRequestResponseDTO {

    private String crId;
    private String title;
    private String description;
    private String domain;
    private String changeType;
    private String region;
    private Status status;
    private LocalDateTime scheduledStart;
    private LocalDateTime scheduledEnd;
    private Boolean rollbackAvailable;
    private String businessJustification;
    private String requestedByUserId;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}