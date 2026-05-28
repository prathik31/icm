package com.telecom.runbook.entity;

import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "generated_runbooks")
@Getter
@Setter
public class GeneratedRunbook {

    @Id
    @Column(name = "runbook_id")
    private String runbookId;

    @Column(name = "cr_id", nullable = false)
    private String crId;

    @Column(name = "title", nullable = false)
    private String title;

    @Column(name = "generated_at")
    private LocalDateTime generatedAt;

    @Column(name = "estimated_duration_mins")
    private Integer estimatedDurationMins;

    @Column(name = "risk_level")
    private String riskLevel;

    @Column(name = "blast_radius")
    private String blastRadius;

    @Column(name = "risk_notes", columnDefinition = "TEXT")
    private String riskNotes;

    @Column(name = "pre_checks", columnDefinition = "TEXT")
    private String preChecks;

    @Column(name = "execution_steps", columnDefinition = "TEXT")
    private String executionSteps;

    @Column(name = "validation_steps", columnDefinition = "TEXT")
    private String validationSteps;

    @Column(name = "rollback_steps", columnDefinition = "TEXT")
    private String rollbackSteps;

    @Column(name = "monitoring_guidance", columnDefinition = "TEXT")
    private String monitoringGuidance;

    @Column(name = "escalation_conditions", columnDefinition = "TEXT")
    private String escalationConditions;

    @Column(name = "rag_sources", columnDefinition = "TEXT")
    private String ragSources;

    @Column(name = "generated_by")
    private String generatedBy;

    @Column(name = "created_at")
    private LocalDateTime createdAt;
}