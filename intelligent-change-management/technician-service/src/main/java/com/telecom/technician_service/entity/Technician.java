package com.telecom.technician_service.entity;

import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "technicians")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Technician {

    @Id
    @Column(name = "technician_id", length = 36)
    private String technicianId;

    @Column(name = "employee_code", nullable = false, unique = true)
    private String employeeCode;

    @Column(name = "full_name", nullable = false)
    private String fullName;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(nullable = false)
    private String region;

    @Column(nullable = false)
    private String specialization;

    @Column(name = "experience_years")
    private Integer experienceYears;

    @Column(length = 512)
    private String certifications;

    @Column(name = "availability_status")
    private String availabilityStatus;

    @Column(name = "current_workload")
    private Integer currentWorkload;

    @Column(nullable = false)
    private Boolean active;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;
}
