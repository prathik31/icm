package com.telecom.technician_service.repository;

import com.telecom.technician_service.entity.AssignmentStatus;
import com.telecom.technician_service.entity.TechnicianAssignment;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface TechnicianAssignmentRepository extends JpaRepository<TechnicianAssignment, String> {
    Optional<TechnicianAssignment> findByCrId(String crId);
    List<TechnicianAssignment> findByTechnicianId(String technicianId);
    List<TechnicianAssignment> findByStatus(AssignmentStatus status);
}
