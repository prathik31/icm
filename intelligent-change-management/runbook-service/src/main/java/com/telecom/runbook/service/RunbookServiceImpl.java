package com.telecom.runbook.service;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Locale;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;

import com.telecom.runbook.client.ChangeRequestClient;
import com.telecom.runbook.dto.EligibleRunbookCrDTO;
import com.telecom.runbook.dto.ChangeRequestDTO;
import com.telecom.runbook.dto.CrAssetDTO;
import com.telecom.runbook.dto.CrAssessmentDTO;
import com.telecom.runbook.dto.RunbookDetailDTO;
import com.telecom.runbook.dto.RunbookGenerationResponseDTO;
import com.telecom.runbook.dto.RunbookSummaryDTO;
import com.telecom.runbook.dto.RunbookGenerateRequestDTO;
import com.telecom.runbook.dto.RunbookGenerateResponseDTO;
import com.telecom.runbook.dto.RiskAssessmentDTO;
import com.telecom.runbook.entity.GeneratedRunbook;
import com.telecom.runbook.exception.RunbookNotFoundException;
import com.telecom.runbook.mapper.RunbookMapper;
import com.telecom.runbook.repository.GeneratedRunbookRepository;
import org.springframework.web.client.RestTemplate;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@Slf4j
@RequiredArgsConstructor
public class RunbookServiceImpl implements RunbookService {

    private static final String APPROVED_STATUS = "APPROVED";
    private static final DateTimeFormatter ISO_LOCAL_DATE_TIME = DateTimeFormatter.ISO_LOCAL_DATE_TIME;

    private final GeneratedRunbookRepository generatedRunbookRepository;
    private final ChangeRequestClient changeRequestClient;
    private final RunbookMapper runbookMapper;
    private final ObjectMapper objectMapper;

    @Value("${clients.python-agent.url:http://localhost:8101}")
    private String pythonAgentUrl;

    public void setPythonAgentUrl(String pythonAgentUrl) {
        this.pythonAgentUrl = pythonAgentUrl;
    }

    @Override
    public List<EligibleRunbookCrDTO> getEligibleCrs() {
        return changeRequestClient.getAllChangeRequests().stream()
                .filter(this::isEligibleForRunbook)
                .map(this::toEligibleRunbookCr)
                .toList();
    }

    @Override
    public List<RunbookSummaryDTO> getRunbooks() {
        return generatedRunbookRepository.findAllByOrderByGeneratedAtDesc().stream()
                .map(runbookMapper::toSummaryDto)
                .toList();
    }

    @Override
    public RunbookDetailDTO getRunbookByCrId(String crId) {
        GeneratedRunbook runbook = generatedRunbookRepository.findFirstByCrIdOrderByGeneratedAtDesc(crId)
                .orElseThrow(() -> new RunbookNotFoundException("Runbook not found for crId: " + crId));
        return runbookMapper.toDetailDto(runbook);
    }

    @Override
    public RunbookGenerationResponseDTO generateRunbook(String crId) {
        ChangeRequestDTO changeRequest = changeRequestClient.getChangeRequest(crId);
        CrAssessmentDTO assessment = changeRequestClient.getAssessment(crId);
        // Build payload as a snake_case Map and filter out nulls to satisfy FastAPI/Pydantic
        var payload = new java.util.LinkedHashMap<String, Object>();

        payload.put("cr_id", changeRequest.getCrId());
        putIfNonNull(payload, "title", changeRequest.getTitle());
        putIfNonNull(payload, "description", changeRequest.getDescription());
        putIfNonNull(payload, "domain", changeRequest.getDomain());
        putIfNonNull(payload, "change_type", changeRequest.getChangeType());
        putIfNonNull(payload, "region", changeRequest.getRegion());
        putIfNonNull(payload, "scheduled_start", formatDateTime(changeRequest.getScheduledStart()));
        putIfNonNull(payload, "scheduled_end", formatDateTime(changeRequest.getScheduledEnd()));
        putIfNonNull(payload, "rollback_available", changeRequest.getRollbackAvailable());
        putIfNonNull(payload, "business_justification", changeRequest.getBusinessJustification());

        // assets -> asset_ids (list of strings)
        java.util.List<String> assetIds = changeRequest.getAssets() == null
                ? java.util.List.of()
                : changeRequest.getAssets().stream().map(CrAssetDTO::getAssetId).toList();
        payload.put("asset_ids", assetIds);

        // risk_assessment nested object
        if (assessment != null) {
            var risk = new java.util.LinkedHashMap<String, Object>();
            putIfNonNull(risk, "risk_score", assessment.getRiskScore());
            putIfNonNull(risk, "risk_level", assessment.getRiskLevel());
            putIfNonNull(risk, "blast_radius", assessment.getBlastRadius());
            putIfNonNull(risk, "confidence", assessment.getConfidence());
            putIfNonNull(risk, "executive_summary", assessment.getExecutiveSummary());
            putIfNonNull(risk, "technical_analysis", assessment.getTechnicalAnalysis());
            putIfNonNull(risk, "cab_guidance", assessment.getCabGuidance());
            putIfNonNull(risk, "recommendations", assessment.getRecommendations());
            putIfNonNull(risk, "risk_indicators", assessment.getRiskIndicators());
            payload.put("risk_assessment", risk);
        }

        RestTemplate restTemplate = new RestTemplate();
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        // Use a copy of the injected ObjectMapper but omit nulls during serialization
        com.fasterxml.jackson.databind.ObjectMapper mapper = objectMapper.copy();
        mapper.setSerializationInclusion(com.fasterxml.jackson.annotation.JsonInclude.Include.NON_NULL);

        RunbookGenerateResponseDTO response;
        try {
            String url = pythonAgentUrl + "/v1/runbooks/generate";
            String payloadJson = mapper.writeValueAsString(payload);
            System.out.println("========== RUNBOOK REQUEST ==========");
            System.out.println(payloadJson);
            System.out.println("=====================================");
            log.info("Calling Python agent at {} with payload: {}", url, payloadJson);

            HttpEntity<String> entity = new HttpEntity<>(payloadJson, headers);

            org.springframework.http.ResponseEntity<String> resp = restTemplate.postForEntity(url, entity, String.class);

            String respBody = resp.getBody();
            log.info("Python agent response status: {} body: {}", resp.getStatusCode(), respBody);

            System.out.println("=================================");
            System.out.println("PYTHON RESPONSE BODY");
            System.out.println(respBody);
            System.out.println("=================================");

            if (resp.getStatusCode().is2xxSuccessful() && respBody != null) {
                response = mapper.readValue(respBody, RunbookGenerateResponseDTO.class);
                System.out.println("========== PYTHON RESPONSE ==========");
                System.out.println("RunbookId = " + response.getRunbookId());
                System.out.println("CrId = " + response.getCrId());
                System.out.println("Title = " + response.getTitle());
                System.out.println("RiskLevel = " + response.getRiskLevel());
                System.out.println("ExecutionSteps = " + response.getExecutionSteps());
                System.out.println("=================================");
            } else {
                throw new RuntimeException("Runbook agent returned non-OK status: " + resp.getStatusCode());
            }

        } catch (org.springframework.web.client.HttpClientErrorException e) {
            String body = e.getResponseBodyAsString();
            log.error("Python agent returned HTTP error {} with body: {}", e.getStatusCode(), body, e);
            throw new RuntimeException("Python agent error: " + e.getStatusCode() + " body: " + body, e);
        } catch (Exception e) {
            log.error("Failed to call Python runbook agent", e);
            throw new RuntimeException("Failed to call Python runbook agent", e);
        }

        GeneratedRunbook runbook = new GeneratedRunbook();
        runbook.setRunbookId(UUID.randomUUID().toString());
        runbook.setCrId(crId);
        runbook.setTitle(response.getTitle() != null ? response.getTitle() : changeRequest.getTitle());
        runbook.setGeneratedAt(LocalDateTime.now());
        runbook.setEstimatedDurationMins(response.getEstimatedDurationMins());
        runbook.setRiskLevel(response.getRiskLevel());
        runbook.setBlastRadius(response.getBlastRadius());
        runbook.setRiskNotes(stringify(response.getRiskNotes()));
        runbook.setPreChecks(stringify(response.getPreChecks()));
        runbook.setExecutionSteps(stringify(response.getExecutionSteps()));
        runbook.setValidationSteps(stringify(response.getValidationSteps()));
        runbook.setRollbackSteps(stringify(response.getRollbackSteps()));
        runbook.setMonitoringGuidance(stringify(response.getMonitoringGuidance()));
        runbook.setEscalationConditions(stringify(response.getEscalationConditions()));
        runbook.setRagSources(stringify(response.getRagSources()));
        runbook.setGeneratedBy(response.getGeneratedBy());
        runbook.setCreatedAt(LocalDateTime.now());

        System.out.println("========== BEFORE SAVE ==========");
        System.out.println("CR ID = " + runbook.getCrId());
        System.out.println("TITLE = " + runbook.getTitle());
        System.out.println("RUNBOOK ID = " + runbook.getRunbookId());
        System.out.println("=================================");

        GeneratedRunbook saved = generatedRunbookRepository.saveAndFlush(runbook);

        System.out.println("========== SAVED ==========");
        System.out.println(saved.getRunbookId());
        System.out.println("=================================");

        return new RunbookGenerationResponseDTO(saved.getRunbookId(), saved.getCrId(), "GENERATED");
    }

    private boolean isEligibleForRunbook(ChangeRequestDTO changeRequest) {
        if (changeRequest == null || changeRequest.getStatus() == null) {
            return false;
        }
        return APPROVED_STATUS.equals(changeRequest.getStatus().toUpperCase(Locale.ROOT));
    }

    private EligibleRunbookCrDTO toEligibleRunbookCr(ChangeRequestDTO changeRequest) {
        CrAssessmentDTO assessment = changeRequestClient.getAssessment(changeRequest.getCrId());
        return new EligibleRunbookCrDTO(
                changeRequest.getCrId(),
                changeRequest.getTitle(),
                assessment != null ? assessment.getRiskLevel() : null,
                assessment != null ? assessment.getBlastRadius() : null,
                changeRequest.getStatus(),
                changeRequest.getCreatedAt(),
                generatedRunbookRepository.existsByCrId(changeRequest.getCrId())
        );
    }

    private String stringify(Object value) {
        if (value == null) {
            return null;
        }
        try {
            return objectMapper.writeValueAsString(value);
        } catch (JsonProcessingException exception) {
            throw new RuntimeException("Failed to serialize runbook field", exception);
        }
    }

    private void putIfNonNull(java.util.Map<String, Object> map, String key, Object value) {
        if (value == null) {
            return;
        }
        if (value instanceof String s) {
            if (s.isBlank()) return;
        }
        map.put(key, value);
    }

    private String formatDateTime(LocalDateTime dateTime) {
        return dateTime == null ? null : dateTime.format(ISO_LOCAL_DATE_TIME);
    }
}