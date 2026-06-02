package com.telecom.technician_service.repository;

import com.telecom.technician_service.entity.ExecutionLog;
import com.telecom.technician_service.entity.ExecutionStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface ExecutionLogRepository extends JpaRepository<ExecutionLog, String> {
    Optional<ExecutionLog> findFirstByCrIdAndTechnicianIdAndExecutionStatus(String crId, String technicianId, ExecutionStatus executionStatus);
    List<ExecutionLog> findByTechnicianIdAndExecutionStatus(String technicianId, ExecutionStatus executionStatus);
    List<ExecutionLog> findByTechnicianId(String technicianId);
}
