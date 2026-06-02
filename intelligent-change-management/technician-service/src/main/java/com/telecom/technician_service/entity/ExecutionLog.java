package com.telecom.technician_service.entity;

import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "execution_logs")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ExecutionLog {

    @Id
    @Column(name = "execution_id", length = 36)
    private String executionId;

    @Column(name = "cr_id", nullable = false)
    private String crId;

    @Column(name = "technician_id", nullable = false)
    private String technicianId;

    @Column(name = "execution_start", nullable = false)
    private LocalDateTime executionStart;

    @Column(name = "execution_end")
    private LocalDateTime executionEnd;

    @Enumerated(EnumType.STRING)
    @Column(name = "execution_status", nullable = false)
    private ExecutionStatus executionStatus;

    @Column(length = 1024)
    private String notes;

    @Column(name = "rollback_required")
    private Boolean rollbackRequired;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;
}
