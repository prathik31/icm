package com.telecom.change_request_service.entity;

import java.time.LocalDateTime;

import com.telecom.change_request_service.enums.BlastRadius;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Data;

@Entity
@Table(name = "cr_assessments")
@Data
public class CrAssessment {

    @Id
    @Column(name = "assessment_id")
    private String assessmentId;

    @Column(name = "cr_id")
    private String crId;

    @Column(name = "risk_score")
    private Double riskScore;

    @Column(name = "risk_level")
    private String riskLevel;

    @Enumerated(EnumType.STRING)
    @Column(name = "blast_radius")
    private BlastRadius blastRadius;

    @Column(name = "confidence")
    private Double confidence;

    @Column(name = "executive_summary", columnDefinition = "TEXT")
    private String executiveSummary;

    @Column(name = "technical_analysis", columnDefinition = "TEXT")
    private String technicalAnalysis;

    @Column(name = "cab_guidance", columnDefinition = "TEXT")
    private String cabGuidance;

    @Column(name = "recommendations_json", columnDefinition = "TEXT")
    private String recommendationsJson;

    @Column(name = "risk_indicators_json", columnDefinition = "TEXT")
    private String riskIndicatorsJson;

    @Column(name = "model_version")
    private String modelVersion;

    @Column(name = "assessed_at")
    private LocalDateTime assessedAt;
}