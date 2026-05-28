package com.telecom.runbook.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.telecom.runbook.dto.EligibleRunbookCrDTO;
import com.telecom.runbook.dto.HealthResponseDTO;
import com.telecom.runbook.dto.RunbookGenerationResponseDTO;
import com.telecom.runbook.dto.RunbookDetailDTO;
import com.telecom.runbook.dto.RunbookSummaryDTO;
import com.telecom.runbook.service.RunbookService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/v1/runbooks")
@RequiredArgsConstructor
public class RunbookController {

    private final RunbookService runbookService;

    @GetMapping("/health")
    public ResponseEntity<HealthResponseDTO> health() {
        return ResponseEntity.ok(new HealthResponseDTO("RUNBOOK SERVICE UP"));
    }

    @GetMapping("/eligible-crs")
    public ResponseEntity<List<EligibleRunbookCrDTO>> getEligibleCrs() {
        return ResponseEntity.ok(runbookService.getEligibleCrs());
    }

    @GetMapping
    public ResponseEntity<List<RunbookSummaryDTO>> getRunbooks() {
        return ResponseEntity.ok(runbookService.getRunbooks());
    }

    @GetMapping("/{crId}")
    public ResponseEntity<RunbookDetailDTO> getRunbookByCrId(@PathVariable String crId) {
        return ResponseEntity.ok(runbookService.getRunbookByCrId(crId));
    }

    @PostMapping("/generate/{crId}")
    public ResponseEntity<RunbookGenerationResponseDTO> generateRunbook(@PathVariable String crId) {
        return ResponseEntity.ok(runbookService.generateRunbook(crId));
    }
}