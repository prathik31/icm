package com.telecom.runbook.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.telecom.runbook.entity.GeneratedRunbook;

public interface GeneratedRunbookRepository extends JpaRepository<GeneratedRunbook, String> {

    List<GeneratedRunbook> findAllByOrderByGeneratedAtDesc();

    Optional<GeneratedRunbook> findFirstByCrIdOrderByGeneratedAtDesc(String crId);

    boolean existsByCrId(String crId);
}