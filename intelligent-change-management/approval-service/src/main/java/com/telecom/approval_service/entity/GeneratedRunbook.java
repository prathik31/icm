package com.telecom.approval_service.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "generated_runbooks")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GeneratedRunbook {

    @Id
    @Column(name = "runbook_id")
    private String runbookId;

    @Column(name = "cr_id", nullable = false)
    private String crId;

    @Column(name = "flow_id", nullable = false)
    private String flowId;

    @Column(name = "title", nullable = false)
    private String title;

    @Column(name = "objective")
    private String objective;

    @Column(name = "pre_execution_steps", columnDefinition = "JSON")
    private String preExecutionStepsJson;

    @Column(name = "execution_steps", columnDefinition = "JSON")
    private String executionStepsJson;

    @Column(name = "post_execution_steps", columnDefinition = "JSON")
    private String postExecutionStepsJson;

    @Column(name = "rollback_steps", columnDefinition = "JSON")
    private String rollbackStepsJson;

    @Column(name = "estimated_duration")
    private String estimatedDuration;

    @Column(name = "risk_mitigation")
    private String riskMitigation;

    @Column(name = "critical_checkpoints", columnDefinition = "JSON")
    private String criticalCheckpointsJson;

    @Column(name = "rag_sources", columnDefinition = "JSON")
    private String ragSourcesJson;

    @Column(name = "status")
    private String status;

    @Column(name = "generated_at", nullable = false)
    private LocalDateTime generatedAt;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

}
