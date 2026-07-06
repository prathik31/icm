package com.telecom.technician_service.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.telecom.technician_service.entity.Technician;

public interface TechnicianRepository extends JpaRepository<Technician, String> {
    Optional<Technician> findByEmployeeCode(String employeeCode);
    List<Technician> findByActiveTrue();
}