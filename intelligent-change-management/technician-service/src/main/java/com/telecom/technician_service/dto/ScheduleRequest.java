package com.telecom.technician_service.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;
import java.time.LocalDateTime;

@Data
public class ScheduleRequest {

    @NotNull(message = "scheduledStart is required")
    private LocalDateTime scheduledStart;

    @NotNull(message = "scheduledEnd is required")
    private LocalDateTime scheduledEnd;
}
