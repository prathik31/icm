package com.telecom.approval_service.service;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.telecom.approval_service.dto.runbook.ChangeRequestAssessmentDTO;
import com.telecom.approval_service.dto.runbook.ChangeRequestAssetDTO;
import com.telecom.approval_service.dto.runbook.ChangeRequestDetailsDTO;
import com.telecom.approval_service.dto.runbook.ExecutionStepDTO;
import com.telecom.approval_service.dto.runbook.RagSourceDTO;
import com.telecom.approval_service.dto.runbook.RunbookGenerateRequest;
import com.telecom.approval_service.dto.runbook.RunbookResponse;
import com.telecom.approval_service.dto.runbook.RiskAssessmentDTO;
import com.telecom.approval_service.entity.ApprovalFlow;
import com.telecom.approval_service.entity.GeneratedRunbook;
import com.telecom.approval_service.exception.ResourceNotFoundException;
import com.telecom.approval_service.repository.ApprovalFlowRepository;
import com.telecom.approval_service.repository.GeneratedRunbookRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class RunbookGenerationService {

    private final RestTemplate restTemplate;

    private final GeneratedRunbookRepository runbookRepository;

    private final ApprovalFlowRepository approvalFlowRepository;

    private final ObjectMapper objectMapper;

    @Value("${runbook.service.url:http://localhost:8101}")
    private String runbookServiceUrl;

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public GeneratedRunbook generateRunbook(RunbookGenerateRequest request, String flowId) {

        try {

            log.info("Generating runbook for CR: {}", request.getCrId());

            System.out.println(objectMapper.writeValueAsString(request));

            String url = runbookServiceUrl + "/v1/runbooks/generate";

            RunbookResponse response = restTemplate.postForObject(
                url,
                request,
                RunbookResponse.class
            );

            if (response == null) {
                throw new RuntimeException("No runbook response from service");
            }

            GeneratedRunbook runbook = GeneratedRunbook.builder()
                    .runbookId(UUID.randomUUID().toString())
                    .crId(request.getCrId())
                    .flowId(flowId)
                    .title(response.getTitle())
                    .objective(response.getRiskNotes())
                    .preExecutionStepsJson(serializeList(response.getPreChecks()))
                    .executionStepsJson(serializeList(response.getExecutionSteps()))
                    .postExecutionStepsJson(serializeList(response.getValidationSteps()))
                    .rollbackStepsJson(serializeList(response.getRollbackSteps()))
                    .estimatedDuration(response.getEstimatedDurationMins() != null
                        ? response.getEstimatedDurationMins().toString()
                        : null)
                    .riskMitigation(serializeList(response.getMonitoringGuidance()))
                    .criticalCheckpointsJson(serializeList(response.getEscalationConditions()))
                    .ragSourcesJson(serializeList(response.getRagSources()))
                    .status("GENERATED")
                    .generatedAt(LocalDateTime.now())
                    .createdAt(LocalDateTime.now())
                    .build();

            GeneratedRunbook saved = runbookRepository.save(runbook);

            log.info("Runbook generated successfully for CR: {} with ID: {}", 
                    request.getCrId(), saved.getRunbookId());

            return saved;

        } catch (Exception ex) {

            log.error("Failed to generate runbook for CR: {}", request.getCrId(), ex);

            throw new RuntimeException("Runbook generation failed: " + ex.getMessage(), ex);

        }

    }

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public GeneratedRunbook generateRunbook(String crId) {

        ApprovalFlow flow = approvalFlowRepository.findByCrId(crId)
                .orElseThrow(() -> new ResourceNotFoundException("Approval flow not found for CR: " + crId));

        String crUrl = "http://localhost:9004/v1/change-requests/" + flow.getCrId();

        ChangeRequestDetailsDTO cr = restTemplate.getForObject(
            crUrl,
            ChangeRequestDetailsDTO.class
        );

        if (cr == null) {
            throw new RuntimeException("No change request details returned for CR: " + flow.getCrId());
        }

        String assessmentUrl = "http://localhost:9004/v1/change-requests/" + flow.getCrId() + "/assessment";

        ChangeRequestAssessmentDTO assessment = restTemplate.getForObject(
            assessmentUrl,
            ChangeRequestAssessmentDTO.class
        );

        if (assessment == null) {
            throw new RuntimeException("No assessment details returned for CR: " + flow.getCrId());
        }

        RiskAssessmentDTO riskAssessment = RiskAssessmentDTO.builder()
            .riskScore(assessment.getRiskScore())
            .riskLevel(assessment.getRiskLevel())
            .blastRadius(assessment.getBlastRadius())
            .confidence(assessment.getConfidence())
            .recommendations(assessment.getRecommendations())
            .riskIndicators(assessment.getRiskIndicators())
            .build();

        List<String> assetIds = cr.getAssets() == null
            ? Collections.emptyList()
            : cr.getAssets().stream()
                .map(ChangeRequestAssetDTO::getAssetId)
                .collect(Collectors.toList());

        RunbookGenerateRequest request =
            RunbookGenerateRequest.builder()
                .crId(cr.getCrId())
                .title(cr.getTitle())
                .description(cr.getDescription())
                .changeType(cr.getChangeType())
                .domain(cr.getDomain())
                .region(cr.getRegion())
                .scheduledStart(cr.getScheduledStart())
                .scheduledEnd(cr.getScheduledEnd())
                .rollbackAvailable(cr.getRollbackAvailable())
                .businessJustification(cr.getBusinessJustification())
                .assetIds(assetIds)
                .riskAssessment(riskAssessment)
                .build();

        return generateRunbook(request, flow.getFlowId());

    }

    private String serializeList(Object list) throws JsonProcessingException {

        if (list == null) {
            return "[]";
        }

        return objectMapper.writeValueAsString(list);

    }

}
