package com.telecom.technician_service.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class CompleteExecutionRequest {

    private String notes;

    @NotNull(message = "rollbackRequired is required")
    private Boolean rollbackRequired;
}
