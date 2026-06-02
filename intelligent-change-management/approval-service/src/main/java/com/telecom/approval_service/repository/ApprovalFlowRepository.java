package com.telecom.approval_service.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.telecom.approval_service.entity.ApprovalFlow;

@Repository
public interface ApprovalFlowRepository extends JpaRepository<ApprovalFlow, Long> {
	Optional<ApprovalFlow> findByCrId(String crId);

	Optional<ApprovalFlow> findByFlowId(String flowId);

	List<ApprovalFlow> findByStatus(String status);

	List<ApprovalFlow> findByStatusIn(List<String> statuses);
}
