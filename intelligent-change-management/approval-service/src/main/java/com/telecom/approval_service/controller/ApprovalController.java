package com.telecom.approval_service.controller;

import java.util.List;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
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
import com.telecom.approval_service.service.ApprovalWorkflowService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/v1/approvals")
@RequiredArgsConstructor
public class ApprovalController {

	private final ApprovalWorkflowService approvalWorkflowService;

	@GetMapping("/pending")
	public ResponseEntity<List<PendingApprovalDTO>> getPendingApprovals(HttpServletRequest request) {
		validateRole(request, "APPROVER");
		return ResponseEntity.ok(approvalWorkflowService.getPendingApprovals());
	}

	@GetMapping("/history")
	public ResponseEntity<List<ApprovalDetailsDTO>> history(HttpServletRequest request) {
		validateAnyApproverOrAdmin(request);
		return ResponseEntity.ok(approvalWorkflowService.getApprovalHistory());
	}

	@GetMapping("/{crId}")
	public ResponseEntity<ApprovalDetailsDTO> getApprovalDetails(@PathVariable String crId,
			HttpServletRequest request) {
		validateAnyApproverOrAdmin(request);
		return ResponseEntity.ok(approvalWorkflowService.getApprovalDetails(crId));
	}

	@PostMapping("/{flowId}/approve")
	public ResponseEntity<ApprovalDetailsDTO> approve(@PathVariable String flowId,
			@Valid @RequestBody ApprovalDecisionRequestDTO requestBody, HttpServletRequest request) {

		String userId = validateApproverOrAdmin(request);
		String role = getRole(request);
		ApprovalDetailsDTO response = approvalWorkflowService.approve(flowId, userId, role, requestBody.getComment());
		return ResponseEntity.ok(response);
	}

	@PostMapping("/{flowId}/reject")
	public ResponseEntity<ApprovalDetailsDTO> reject(@PathVariable String flowId,
			@Valid @RequestBody ApprovalDecisionRequestDTO requestBody, HttpServletRequest request) {

		String userId = validateApproverOrAdmin(request);
		String role = getRole(request);
		ApprovalDetailsDTO response = approvalWorkflowService.reject(flowId, userId, role, requestBody.getComment());
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
