package com.telecom.technician_service.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TechnicianDto {

    private String technicianId;
    private String technicianCode;
    private String fullName;
    private String name;
    private String email;
    private String region;
    private String specialization;
    private Integer experienceYears;
    private String certifications;
    private String status;
    private String availabilityStatus;
    private Integer currentWorkload;
}
