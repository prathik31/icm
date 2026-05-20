package com.telecom.approval_service.service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.telecom.approval_service.dto.ApprovalDetailsDTO;
import com.telecom.approval_service.dto.ApprovalStepDTO;
import com.telecom.approval_service.dto.PendingApprovalDTO;
import com.telecom.approval_service.entity.ApprovalDecision;
import com.telecom.approval_service.entity.ApprovalFlow;
import com.telecom.approval_service.exception.ResourceNotFoundException;
import com.telecom.approval_service.kafka.event.ApprovalDecisionEvent;
import com.telecom.approval_service.kafka.event.CrRiskConfirmedEvent;
import com.telecom.approval_service.kafka.producer.ApprovalDecisionProducer;
import com.telecom.approval_service.repository.ApprovalDecisionRepository;
import com.telecom.approval_service.repository.ApprovalFlowRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class ApprovalWorkflowService {

	private final ApprovalFlowRepository approvalFlowRepository;
	private final ApprovalDecisionRepository approvalDecisionRepository;
	private final ApprovalDecisionProducer approvalDecisionProducer;

	@Transactional
	public void handleRiskConfirmedEvent(CrRiskConfirmedEvent event) {
		approvalFlowRepository.findByCrId(event.getCrId()).ifPresentOrElse(existing -> {
			log.info("Approval flow already exists for CR {}, ignoring duplicate event", event.getCrId());
		}, () -> {
			ApprovalFlow flow = ApprovalFlow.builder().flowId(UUID.randomUUID().toString()).crId(event.getCrId())
					.riskLevel(event.getRiskLevel()).riskScore(event.getRiskScore()).status("IN_PROGRESS")
					.createdAt(LocalDateTime.now()).updatedAt(LocalDateTime.now()).build();
			approvalFlowRepository.save(flow);
			log.info("Created approval flow {} for CR {}", flow.getFlowId(), event.getCrId());
		});
	}

	public List<PendingApprovalDTO> getPendingApprovals() {
		return approvalFlowRepository.findByStatus("IN_PROGRESS").stream().map(this::mapToPending)
				.collect(Collectors.toList());
	}

	public ApprovalDetailsDTO getApprovalDetails(String crId) {
		ApprovalFlow flow = approvalFlowRepository.findByCrId(crId)
				.orElseThrow(() -> new ResourceNotFoundException("Approval flow not found for CR: " + crId));
		return mapToDetails(flow);
	}

	@Transactional
	public ApprovalDetailsDTO approve(String flowId, String approverUserId, String approverRole, String comment) {
		ApprovalFlow flow = approvalFlowRepository.findByFlowId(flowId)
				.orElseThrow(() -> new ResourceNotFoundException("Approval flow not found: " + flowId));

		if (!"IN_PROGRESS".equals(flow.getStatus())) {
			throw new RuntimeException("Only IN_PROGRESS approvals can be approved");
		}

		flow.setStatus("APPROVED");
		flow.setUpdatedAt(LocalDateTime.now());
		approvalFlowRepository.save(flow);

		ApprovalDecision decision = ApprovalDecision.builder().flowId(flowId).approverUserId(approverUserId)
				.approverRole(approverRole).outcome("APPROVED").comment(comment).decisionAt(LocalDateTime.now())
				.build();
		approvalDecisionRepository.save(decision);

		publishDecision(flow, decision);
		return mapToDetails(flow);
	}

	@Transactional
	public ApprovalDetailsDTO reject(String flowId, String approverUserId, String approverRole, String comment) {
		ApprovalFlow flow = approvalFlowRepository.findByFlowId(flowId)
				.orElseThrow(() -> new ResourceNotFoundException("Approval flow not found: " + flowId));

		if (!"IN_PROGRESS".equals(flow.getStatus())) {
			throw new RuntimeException("Only IN_PROGRESS approvals can be rejected");
		}

		flow.setStatus("REJECTED");
		flow.setUpdatedAt(LocalDateTime.now());
		approvalFlowRepository.save(flow);

		ApprovalDecision decision = ApprovalDecision.builder().flowId(flowId).approverUserId(approverUserId)
				.approverRole(approverRole).outcome("REJECTED").comment(comment).decisionAt(LocalDateTime.now())
				.build();
		approvalDecisionRepository.save(decision);

		publishDecision(flow, decision);
		return mapToDetails(flow);
	}

	private void publishDecision(ApprovalFlow flow, ApprovalDecision decision) {
		ApprovalDecisionEvent event = ApprovalDecisionEvent.builder().flowId(flow.getFlowId()).crId(flow.getCrId())
				.outcome(decision.getOutcome()).approverUserId(decision.getApproverUserId())
				.approverRole(decision.getApproverRole()).comment(decision.getComment())
				.decisionAt(decision.getDecisionAt()).build();
		approvalDecisionProducer.publishApprovalDecision(event);
	}

	private ApprovalDetailsDTO mapToDetails(ApprovalFlow flow) {
		ApprovalDetailsDTO details = new ApprovalDetailsDTO();
		details.setFlowId(flow.getFlowId());
		details.setCrId(flow.getCrId());
		details.setRiskLevel(flow.getRiskLevel());
		details.setRiskScore(flow.getRiskScore());
		details.setStatus(flow.getStatus());
		List<ApprovalStepDTO> steps = approvalDecisionRepository.findByFlowIdOrderByDecisionAtAsc(flow.getFlowId())
				.stream().map(decision -> {
					ApprovalStepDTO step = new ApprovalStepDTO();
					step.setApproverUserId(decision.getApproverUserId());
					step.setApproverRole(decision.getApproverRole());
					step.setOutcome(decision.getOutcome());
					step.setComment(decision.getComment());
					step.setDecisionAt(decision.getDecisionAt());
					return step;
				}).collect(Collectors.toList());
		details.setSteps(steps);
		return details;
	}

	private PendingApprovalDTO mapToPending(ApprovalFlow flow) {
		PendingApprovalDTO pending = new PendingApprovalDTO();
		pending.setFlowId(flow.getFlowId());
		pending.setCrId(flow.getCrId());
		pending.setRiskLevel(flow.getRiskLevel());
		pending.setRiskScore(flow.getRiskScore());
		pending.setStatus(flow.getStatus());
		return pending;
	}
}
