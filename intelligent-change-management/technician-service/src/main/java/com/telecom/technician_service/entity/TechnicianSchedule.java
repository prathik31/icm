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
@Table(name = "technician_schedules")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TechnicianSchedule {

    @Id
    @Column(name = "schedule_id", length = 36)
    private String scheduleId;

    @Column(name = "cr_id", nullable = false)
    private String crId;

    @Column(name = "scheduled_start", nullable = false)
    private LocalDateTime scheduledStart;

    @Column(name = "scheduled_end", nullable = false)
    private LocalDateTime scheduledEnd;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ScheduleStatus status;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;
}
