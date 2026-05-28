package com.telecom.change_request_service.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.Query;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.repository.query.Param;

import com.telecom.change_request_service.entity.CrAssessment;

public interface CrAssessmentRepository extends JpaRepository<CrAssessment, String> {

    Optional<CrAssessment> findByCrId(String crId);

    Optional<CrAssessment> findFirstByCrIdOrderByAssessedAtDesc(String crId);

    @Query("""
            SELECT ca
            FROM CrAssessment ca
            WHERE ca.crId = :crId
            ORDER BY ca.assessedAt DESC
            """)
    List<CrAssessment> findLatestByCrId(@Param("crId") String crId);
}
