package com.telecom.approval_service.controller;

import java.util.List;

import jakarta.servlet.http.HttpServletRequest;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import com.telecom.approval_service.entity.GeneratedRunbook;
import com.telecom.approval_service.repository.GeneratedRunbookRepository;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/v1/runbooks")
@RequiredArgsConstructor
public class RunbookController {

	private final GeneratedRunbookRepository runbookRepository;

	@GetMapping
	public ResponseEntity<List<GeneratedRunbook>> getAllRunbooks(HttpServletRequest request) {
		validateEngineerOrApprover(request);
		List<GeneratedRunbook> runbooks = runbookRepository.findAll();
		return ResponseEntity.ok(runbooks);
	}

	@GetMapping("/{runbookId}")
	public ResponseEntity<GeneratedRunbook> getRunbookById(@PathVariable String runbookId,
			HttpServletRequest request) {
		validateEngineerOrApprover(request);
		GeneratedRunbook runbook = runbookRepository.findByRunbookId(runbookId)
				.orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
						"Runbook not found: " + runbookId));
		return ResponseEntity.ok(runbook);
	}

	@GetMapping("/cr/{crId}")
	public ResponseEntity<List<GeneratedRunbook>> getRunbooksByCrId(@PathVariable String crId,
			HttpServletRequest request) {
		validateEngineerOrApprover(request);
		List<GeneratedRunbook> runbooks = runbookRepository.findByCrIdOrderByGeneratedAtDesc(crId);
		return ResponseEntity.ok(runbooks);
	}

	private void validateEngineerOrApprover(HttpServletRequest request) {
		String role = (String) request.getAttribute("role");
		if (role == null || (!"ENGINEER".equals(role) && !"APPROVER".equals(role) && !"ADMIN".equals(role))) {
			throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Access denied");
		}
	}
}
