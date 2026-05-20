package com.telecom.change_request_service.entity;

import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Data;

@Entity
@Table(name = "cr_audit_logs")
@Data
public class CrAuditLog {

    @Id
    @Column(name = "log_id")
    private String logId;

    @Column(name = "cr_id")
    private String crId;

    @Column(name = "action_type")
    private String actionType;

    @Column(name = "old_status")
    private String oldStatus;

    @Column(name = "new_status")
    private String newStatus;

    @Column(name = "acted_by_user_id")
    private String actedByUserId;

    private String remarks;

    @Column(name = "created_at")
    private LocalDateTime createdAt;
}