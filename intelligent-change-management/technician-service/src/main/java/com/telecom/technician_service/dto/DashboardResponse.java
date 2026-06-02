package com.telecom.technician_service.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class DashboardResponse {
    private long assigned;
    private long scheduled;
    private long inExecution;
    private long completed;
}
