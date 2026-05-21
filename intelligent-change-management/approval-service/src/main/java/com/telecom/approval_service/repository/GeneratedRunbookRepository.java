package com.telecom.approval_service.repository;

import com.telecom.approval_service.entity.GeneratedRunbook;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface GeneratedRunbookRepository extends JpaRepository<GeneratedRunbook, String> {

    Optional<GeneratedRunbook> findByCrId(String crId);

    Optional<GeneratedRunbook> findByFlowId(String flowId);

    Optional<GeneratedRunbook> findByRunbookId(String runbookId);

    List<GeneratedRunbook> findByCrIdOrderByGeneratedAtDesc(String crId);

}
