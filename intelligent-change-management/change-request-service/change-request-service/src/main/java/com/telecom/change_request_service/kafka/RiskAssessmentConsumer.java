package com.telecom.change_request_service.kafka;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;

import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.telecom.change_request_service.dto.event.RiskAssessmentEvent;
import com.telecom.change_request_service.entity.ChangeRequest;
import com.telecom.change_request_service.entity.CrAssessment;
import com.telecom.change_request_service.enums.BlastRadius;
import com.telecom.change_request_service.enums.Status;
import com.telecom.change_request_service.repository.ChangeRequestRepository;
import com.telecom.change_request_service.repository.CrAssessmentRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class RiskAssessmentConsumer {

    private final CrAssessmentRepository repository;

    private final ChangeRequestRepository changeRequestRepository;

    private final ObjectMapper objectMapper;

    @KafkaListener(
        topics = "ai.risk.completed",
        groupId = "change-request-service"
    )
    public void consume(RiskAssessmentEvent event)
            throws JsonProcessingException {

        log.info("Received AI Risk Assessment for CR: {}", event.getCrId());

        CrAssessment assessment = new CrAssessment();

        assessment.setAssessmentId(
            UUID.randomUUID().toString()
        );

        assessment.setCrId(event.getCrId());

        assessment.setRiskScore(event.getRiskScore());

        assessment.setRiskLevel(event.getRiskLevel());

        if (event.getBlastRadius() != null) {
            try {
                assessment.setBlastRadius(BlastRadius.valueOf(event.getBlastRadius()));
            } catch (IllegalArgumentException iae) {
                log.warn("Unknown blast radius '{}' — leaving null", event.getBlastRadius());
            }
        }

        assessment.setConfidence(event.getConfidence());

        assessment.setExecutiveSummary(event.getExecutiveSummary());

        assessment.setTechnicalAnalysis(event.getTechnicalAnalysis());

        assessment.setCabGuidance(event.getCabGuidance());

        assessment.setRecommendationsJson(
            objectMapper.writeValueAsString(event.getRecommendations())
        );

        assessment.setRiskIndicatorsJson(
            objectMapper.writeValueAsString(event.getRiskIndicators())
        );

        System.out.println(event.getModelMetadata());

        assessment.setModelVersion(
            event.getModelMetadata() != null
                ? event.getModelMetadata().getPredictionEngine()
                : "unknown"
        );

        assessment.setAssessedAt(LocalDateTime.now());

        repository.save(assessment);

        Optional<ChangeRequest> maybeChangeRequest = changeRequestRepository.findById(event.getCrId());
        if (maybeChangeRequest.isPresent()) {
            ChangeRequest changeRequest = maybeChangeRequest.get();
            changeRequest.setStatus(Status.ANALYZED);
            changeRequest.setUpdatedAt(LocalDateTime.now());
            changeRequestRepository.save(changeRequest);
            log.info("CR {} status updated to ANALYZED", event.getCrId());
        } else {
            log.warn("CR {} not found when saving risk assessment", event.getCrId());
        }

        log.info(
            "Risk Assessment Saved Successfully for CR: {}",
            event.getCrId()
        );
    }
}