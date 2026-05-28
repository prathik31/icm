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

@Service
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

        RunbookGenerateRequestDTO request = new RunbookGenerateRequestDTO();
        request.setCrId(changeRequest.getCrId());
        request.setTitle(changeRequest.getTitle());
        request.setDescription(changeRequest.getDescription());
        request.setDomain(changeRequest.getDomain());
        request.setChangeType(changeRequest.getChangeType());
        request.setRegion(changeRequest.getRegion());
        request.setScheduledStart(formatDateTime(changeRequest.getScheduledStart()));
        request.setScheduledEnd(formatDateTime(changeRequest.getScheduledEnd()));
        request.setRollbackAvailable(changeRequest.getRollbackAvailable());
        request.setBusinessJustification(changeRequest.getBusinessJustification());
        request.setAssetIds(
            changeRequest.getAssets() == null
                ? List.of()
                : changeRequest.getAssets().stream()
                    .map(CrAssetDTO::getAssetId)
                    .toList());
        request.setRiskAssessment(new RiskAssessmentDTO(
            assessment.getRiskScore(),
            assessment.getRiskLevel(),
            assessment.getBlastRadius(),
            assessment.getConfidence(),
            assessment.getExecutiveSummary(),
            assessment.getTechnicalAnalysis(),
            assessment.getCabGuidance(),
            assessment.getRecommendations(),
            assessment.getRiskIndicators()));

        RestTemplate restTemplate = new RestTemplate();
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        HttpEntity<RunbookGenerateRequestDTO> entity = new HttpEntity<>(request, headers);

        RunbookGenerateResponseDTO response = restTemplate.postForObject(
                pythonAgentUrl + "/v1/runbooks/generate",
                entity,
                RunbookGenerateResponseDTO.class);

        if (response == null) {
            throw new RuntimeException("No runbook generation response returned from python agent");
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

        generatedRunbookRepository.save(runbook);

        return new RunbookGenerationResponseDTO(runbook.getRunbookId(), runbook.getCrId(), "GENERATED");
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

    private String formatDateTime(LocalDateTime dateTime) {
        return dateTime == null ? null : dateTime.format(ISO_LOCAL_DATE_TIME);
    }
}