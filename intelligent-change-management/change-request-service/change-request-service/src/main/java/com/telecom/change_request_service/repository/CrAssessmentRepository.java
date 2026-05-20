package com.telecom.change_request_service.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.telecom.change_request_service.entity.CrAssessment;

public interface CrAssessmentRepository extends JpaRepository<CrAssessment, String> {

    Optional<CrAssessment> findByCrId(String crId);

    Optional<CrAssessment> findFirstByCrIdOrderByAssessedAtDesc(String crId);
}
