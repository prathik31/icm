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
@Table(name = "technician_assignments")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TechnicianAssignment {

    @Id
    @Column(name = "assignment_id", length = 36)
    private String assignmentId;

    @Column(name = "cr_id", nullable = false)
    private String crId;

    @Column(name = "technician_id")
    private String technicianId;

    @Column(name = "assigned_by")
    private String assignedBy;

    @Column(name = "assigned_at")
    private LocalDateTime assignedAt;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private AssignmentStatus status;
}
