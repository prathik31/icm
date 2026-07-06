package com.telecom.approval_service.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import com.telecom.approval_service.dto.ApprovalDecisionRequestDTO;
import com.telecom.approval_service.dto.ApprovalDetailsDTO;
import com.telecom.approval_service.dto.PendingApprovalDTO;
import com.telecom.approval_service.dto.TestApprovalRequestDTO;
import com.telecom.approval_service.kafka.event.CrRiskConfirmedEvent;
import com.telecom.approval_service.service.ApprovalWorkflowService;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@RestController
@RequestMapping("/v1/approvals")
@RequiredArgsConstructor
@Slf4j
public class ApprovalController {

	private final ApprovalWorkflowService approvalWorkflowService;
	private final KafkaTemplate<String, Object> kafkaTemplate;

	@Value("${app.kafka.cr-risk-confirmed-topic:cr.risk_confirmed}")
	private String crRiskConfirmedTopic;

	@GetMapping("/pending")
	public ResponseEntity<List<PendingApprovalDTO>> getPendingApprovals(HttpServletRequest request) {
		validateRole(request, "APPROVER");
		return ResponseEntity.ok(approvalWorkflowService.getPendingApprovals());
	}

	@PostMapping("/internal/test-approval")
	public ResponseEntity<PendingApprovalDTO> createTestApproval(@Valid @RequestBody TestApprovalRequestDTO requestBody) {
		CrRiskConfirmedEvent event = CrRiskConfirmedEvent.builder()
				.crId(requestBody.getCrId())
				.riskLevel(requestBody.getRiskLevel())
				.riskScore(requestBody.getRiskScore())
				.build();
		approvalWorkflowService.handleRiskConfirmedEvent(event);
		PendingApprovalDTO pendingApproval = approvalWorkflowService.getPendingApprovals().stream()
				.filter(p -> p.getCrId().equals(requestBody.getCrId()))
				.findFirst()
				.orElseThrow(() -> new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR,
					"Approval flow was not created for CR: " + requestBody.getCrId()));
		return ResponseEntity.ok(pendingApproval);
	}

	@PostMapping("/internal/test-publish")
	public ResponseEntity<String> publishTestEvent(@Valid @RequestBody TestApprovalRequestDTO requestBody) {
		CrRiskConfirmedEvent event = CrRiskConfirmedEvent.builder()
				.crId(requestBody.getCrId())
				.riskLevel(requestBody.getRiskLevel())
				.riskScore(requestBody.getRiskScore())
				.build();
		log.info("Publishing test risk confirmed event: {}", event);
		kafkaTemplate.send(crRiskConfirmedTopic, event).whenComplete((result, ex) -> {
			if (ex != null) {
				log.error("Failed to publish test risk confirmed event for CR {}", requestBody.getCrId(), ex);
			} else {
				log.info("Published test risk confirmed event for CR {} to topic {}", requestBody.getCrId(), crRiskConfirmedTopic);
			}
		});
		return ResponseEntity.ok("Published test risk confirmed event for CR: " + requestBody.getCrId());
	}

	@GetMapping("/history")
	public ResponseEntity<List<ApprovalDetailsDTO>> history(HttpServletRequest request) {
		validateAnyApproverOrAdmin(request);
		return ResponseEntity.ok(approvalWorkflowService.getApprovalHistory());
	}

	@GetMapping("/{flowId}")
	public ResponseEntity<ApprovalDetailsDTO> getApprovalDetails(@PathVariable String flowId,
			HttpServletRequest request) {
		log.info("Fetching approval flow: {}", flowId);
		validateAnyApproverOrAdmin(request);
		return ResponseEntity.ok(approvalWorkflowService.getApprovalDetails(flowId));
	}

	@PostMapping("/{flowId}/approve")
	public ResponseEntity<ApprovalDetailsDTO> approve(@PathVariable String flowId,
			@Valid @RequestBody ApprovalDecisionRequestDTO requestBody, HttpServletRequest request) {

		String userId = validateApproverOrAdmin(request);
		String role = getRole(request);
		String approverEmail = getApproverEmail(request);
		ApprovalDetailsDTO response = approvalWorkflowService.approve(flowId, userId, role, approverEmail, requestBody.getComment());
		return ResponseEntity.ok(response);
	}

	@PostMapping("/{flowId}/reject")
	public ResponseEntity<ApprovalDetailsDTO> reject(@PathVariable String flowId,
			@Valid @RequestBody ApprovalDecisionRequestDTO requestBody, HttpServletRequest request) {

		String userId = validateApproverOrAdmin(request);
		String role = getRole(request);
		String approverEmail = getApproverEmail(request);
		ApprovalDetailsDTO response = approvalWorkflowService.reject(flowId, userId, role, approverEmail, requestBody.getComment());
		return ResponseEntity.ok(response);
	}

	private String getRole(HttpServletRequest request) {
		Object role = request.getAttribute("role");
		return role == null ? null : role.toString();
	}

	private String validateApproverOrAdmin(HttpServletRequest request) {
		String userId = (String) request.getAttribute("userId");
		String role = getRole(request);
		if (userId == null || role == null) {
			throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Missing or invalid JWT");
		}
		if (!"APPROVER".equals(role) && !"ADMIN".equals(role)) {
			throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Access denied");
		}
		return userId;
	}

	private String getApproverEmail(HttpServletRequest request) {
		Object email = request.getAttribute("email");
		if (email != null) {
			return email.toString();
		}
		Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
		return authentication != null ? authentication.getName() : null;
	}

	private void validateRole(HttpServletRequest request, String requiredRole) {
		String role = getRole(request);
		if (role == null || !role.equals(requiredRole)) {
			throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Access denied. Required role: " + requiredRole);
		}
	}

	private void validateAnyApproverOrAdmin(HttpServletRequest request) {
		String role = getRole(request);
		if (role == null || (!"APPROVER".equals(role) && !"ADMIN".equals(role))) {
			throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Access denied");
		}
	}
}
