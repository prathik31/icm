package com.telecom.technician_service.repository;

import com.telecom.technician_service.entity.TechnicianSchedule;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface TechnicianScheduleRepository extends JpaRepository<TechnicianSchedule, String> {
    Optional<TechnicianSchedule> findByCrId(String crId);
}
