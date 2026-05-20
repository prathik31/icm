package com.telecom.change_request_service.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.telecom.change_request_service.dto.ChangeRequestResponseDTO;
import com.telecom.change_request_service.dto.CrAssessmentResponseDTO;
import com.telecom.change_request_service.dto.CreateChangeRequestDTO;
import com.telecom.change_request_service.dto.SubmitChangeRequestResponseDTO;
import com.telecom.change_request_service.exception.InvalidRoleException;
import com.telecom.change_request_service.service.ChangeRequestService;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/v1/change-requests")
@RequiredArgsConstructor
public class ChangeRequestController {

    private final ChangeRequestService changeRequestService;

    private void validateRole(HttpServletRequest request, String requiredRole) {
        String role = (String) request.getAttribute("role");
        if (role == null || !role.equals(requiredRole)) {
            throw new InvalidRoleException("Access denied. Required role: " + requiredRole);
        }
    }

    @PostMapping
    public ResponseEntity<ChangeRequestResponseDTO> createChangeRequest(@Valid @RequestBody CreateChangeRequestDTO dto, HttpServletRequest request) {
        validateRole(request, "ENGINEER");
        String userId = (String) request.getAttribute("userId");
        dto.setRequestedByUserId(userId);
        ChangeRequestResponseDTO response = changeRequestService.createChangeRequest(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PostMapping("/{id}/submit")
    public ResponseEntity<SubmitChangeRequestResponseDTO> submitChangeRequest(@PathVariable String id, HttpServletRequest request) {
        validateRole(request, "ENGINEER");
        String userId = (String) request.getAttribute("userId");
        SubmitChangeRequestResponseDTO response = changeRequestService.submitChangeRequest(id, userId);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/{id}/confirm-risk")
    public ResponseEntity<SubmitChangeRequestResponseDTO> confirmRisk(@PathVariable String id, HttpServletRequest request) {
        validateRole(request, "ENGINEER");
        String userId = (String) request.getAttribute("userId");
        SubmitChangeRequestResponseDTO response = changeRequestService.confirmRisk(id, userId);
        return ResponseEntity.ok(response);
    }

    @GetMapping
    public ResponseEntity<List<ChangeRequestResponseDTO>> getAllChangeRequests() {
        List<ChangeRequestResponseDTO> response = changeRequestService.getAllChangeRequests();
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}")
    public ResponseEntity<ChangeRequestResponseDTO> getChangeRequestById(@PathVariable String id) {
        ChangeRequestResponseDTO response = changeRequestService.getChangeRequestById(id);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{crId}/assessment")
    public ResponseEntity<CrAssessmentResponseDTO> getAssessmentByCrId(@PathVariable String crId) {
        CrAssessmentResponseDTO response = changeRequestService.getAssessmentByCrId(crId);
        return ResponseEntity.ok(response);
    }
}