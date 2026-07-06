package com.telecom.technician_service.dto;

import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DashboardResponse {
    private long totalTasks;
    private long assigned;
    private long scheduled;
    private long inExecution;
    private long completed;
    private List<TechnicianTaskDto> recentTasks;
}
