package com.telecom.approval_service.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.telecom.approval_service.entity.ApprovalDecision;

@Repository
public interface ApprovalDecisionRepository extends JpaRepository<ApprovalDecision, Long> {
	List<ApprovalDecision> findByFlowIdOrderByDecisionAtAsc(String flowId);

	List<ApprovalDecision> findByFlowId(String flowId);

	Optional<ApprovalDecision> findTopByFlowIdOrderByDecisionAtDesc(String flowId);
}
