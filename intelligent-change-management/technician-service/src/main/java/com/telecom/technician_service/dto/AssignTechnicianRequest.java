package com.telecom.technician_service.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class AssignTechnicianRequest {

    @NotBlank(message = "technicianId is required")
    private String technicianId;
}
