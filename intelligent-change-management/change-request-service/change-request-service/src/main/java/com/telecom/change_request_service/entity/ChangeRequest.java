package com.telecom.change_request_service.entity;

import java.time.LocalDateTime;

import com.telecom.change_request_service.enums.Status;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Data;

@Entity
@Table(name = "change_requests")
@Data
public class ChangeRequest {

    @Id
    @Column(name = "cr_id")
    private String crId;

    private String title;
    private String description;
    private String domain;

    @Column(name = "change_type")
    private String changeType;

    private String region;

    @Enumerated(EnumType.STRING)
    private Status status;

    @Column(name = "scheduled_start")
    private LocalDateTime scheduledStart;

    @Column(name = "scheduled_end")
    private LocalDateTime scheduledEnd;

    @Column(name = "rollback_available")
    private Boolean rollbackAvailable;

    @Column(name = "business_justification")
    private String businessJustification;

    @Column(name = "requested_by_user_id")
    private String requestedByUserId;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}