package com.telecom.change_request_service.service;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.telecom.change_request_service.dto.AssetResponseDTO;
import com.telecom.change_request_service.dto.AssetDTO;
import com.telecom.change_request_service.dto.ChangeRequestResponseDTO;
import com.telecom.change_request_service.dto.CrAssessmentResponseDTO;
import com.telecom.change_request_service.dto.CreateChangeRequestDTO;
import com.telecom.change_request_service.dto.RiskAssessmentDTO;
import com.telecom.change_request_service.dto.SubmitChangeRequestResponseDTO;
import com.telecom.change_request_service.dto.event.ChangeRequestEvent;
import com.telecom.change_request_service.dto.event.CrRiskConfirmedEvent;
import com.telecom.change_request_service.entity.ChangeRequest;
import com.telecom.change_request_service.entity.CrAssessment;
import com.telecom.change_request_service.entity.CrAsset;
import com.telecom.change_request_service.enums.CrAuditLogAction;
import com.telecom.change_request_service.enums.Status;
import com.telecom.change_request_service.exception.InvalidStateException;
import com.telecom.change_request_service.exception.ResourceNotFoundException;
import com.telecom.change_request_service.kafka.ChangeRequestProducer;
import com.telecom.change_request_service.kafka.CrRiskConfirmedProducer;
import com.telecom.change_request_service.mapper.ChangeRequestEventMapper;
import com.telecom.change_request_service.repository.ChangeRequestRepository;
import com.telecom.change_request_service.repository.CrAssessmentRepository;
import com.telecom.change_request_service.repository.CrAssetRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ChangeRequestService {

    private final ChangeRequestRepository changeRequestRepository;
    private final CrAssetRepository crAssetRepository;
    private final CrAssessmentRepository crAssessmentRepository;
    private final AuditService auditService;
    private final ObjectMapper objectMapper;
    private final ChangeRequestProducer producer;
    private final CrRiskConfirmedProducer riskConfirmedProducer;
    private final ChangeRequestEventMapper eventMapper;

    public ChangeRequestResponseDTO createChangeRequest(CreateChangeRequestDTO dto) {
        ChangeRequest changeRequest = new ChangeRequest();
        changeRequest.setCrId(UUID.randomUUID().toString());
        changeRequest.setTitle(dto.getTitle());
        changeRequest.setDescription(dto.getDescription());
        changeRequest.setDomain(dto.getDomain());
        changeRequest.setChangeType(dto.getChangeType());
        changeRequest.setRegion(dto.getRegion());
        changeRequest.setStatus(Status.DRAFT);
        changeRequest.setScheduledStart(dto.getScheduledStart());
        changeRequest.setScheduledEnd(dto.getScheduledEnd());
        changeRequest.setRollbackAvailable(dto.getRollbackAvailable());
        changeRequest.setBusinessJustification(dto.getBusinessJustification());
        changeRequest.setRequestedByUserId(dto.getRequestedByUserId());
        LocalDateTime now = LocalDateTime.now();
        changeRequest.setCreatedAt(now);
        changeRequest.setUpdatedAt(now);

        ChangeRequest saved = changeRequestRepository.save(changeRequest);

        // Save assets
        for (AssetDTO assetDto : dto.getAssets()) {
            CrAsset asset = new CrAsset();
            asset.setAssetRowId(UUID.randomUUID().toString());
            asset.setCrId(saved.getCrId());
            asset.setAssetType(assetDto.getAssetType());
            asset.setAssetId(assetDto.getAssetId());
            asset.setHostname(assetDto.getHostname());
            asset.setCreatedAt(now);
            crAssetRepository.save(asset);
        }

        // Audit log
        Map<String, Object> metadata = new HashMap<>();
        metadata.put("title", dto.getTitle());
        String remarks = "";
        try {
            remarks = objectMapper.writeValueAsString(metadata);
        } catch (JsonProcessingException e) {
            // handle or log
        }
        auditService.logAction(saved.getCrId(), CrAuditLogAction.CR_CREATED.name(), dto.getRequestedByUserId(), remarks);

        return mapToResponseDTO(saved);
    }

    public SubmitChangeRequestResponseDTO submitChangeRequest(String id, String userId) {
        ChangeRequest changeRequest = changeRequestRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("ChangeRequest not found with id: " + id));

        if (changeRequest.getStatus() != Status.DRAFT) {
            throw new InvalidStateException("Only DRAFT can be submitted");
        }

        Status oldStatus = changeRequest.getStatus();
        changeRequest.setStatus(Status.SUBMITTED);
        changeRequest.setUpdatedAt(LocalDateTime.now());

        ChangeRequest saved = changeRequestRepository.save(changeRequest);

        // Audit log
        Map<String, Object> metadata = new HashMap<>();
        metadata.put("oldStatus", oldStatus.name());
        metadata.put("newStatus", Status.SUBMITTED.name());
        String remarks = "";
        try {
            remarks = objectMapper.writeValueAsString(metadata);
        } catch (JsonProcessingException e) {
            // handle or log
        }
        auditService.logAction(saved.getCrId(), CrAuditLogAction.CR_SUBMITTED.name(), userId, remarks);

        try {

            ChangeRequestEvent event =
                eventMapper.toEvent(saved);

            producer.publishChangeRequest(
                event
            );

        } catch (Exception ex) {

            System.err.println(

                "Failed to publish submitted CR event: "
                + ex.getMessage()
            );
        }

        SubmitChangeRequestResponseDTO response = new SubmitChangeRequestResponseDTO();
        response.setCrId(saved.getCrId());
        response.setStatus(saved.getStatus());
        return response;
    }

    public SubmitChangeRequestResponseDTO confirmRisk(String id, String userId) {
        ChangeRequest changeRequest = changeRequestRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("ChangeRequest not found with id: " + id));

        if (changeRequest.getStatus() != Status.ANALYZED) {
            throw new InvalidStateException("Only ANALYZED can be risk confirmed");
        }

        Status oldStatus = changeRequest.getStatus();
        changeRequest.setStatus(Status.RISK_CONFIRMED);
        changeRequest.setUpdatedAt(LocalDateTime.now());

        ChangeRequest saved = changeRequestRepository.save(changeRequest);

        // Audit log
        Map<String, Object> metadata = new HashMap<>();
        metadata.put("oldStatus", oldStatus.name());
        metadata.put("newStatus", Status.RISK_CONFIRMED.name());
        String remarks = "";
        try {
            remarks = objectMapper.writeValueAsString(metadata);
        } catch (JsonProcessingException e) {
            // handle or log
        }
        auditService.logAction(saved.getCrId(), CrAuditLogAction.RISK_CONFIRMED.name(), userId, remarks);

        SubmitChangeRequestResponseDTO response = new SubmitChangeRequestResponseDTO();
        response.setCrId(saved.getCrId());
        response.setStatus(saved.getStatus());

        CrRiskConfirmedEvent riskEvent = new CrRiskConfirmedEvent();
        riskEvent.setCrId(saved.getCrId());
        riskEvent.setRequestedByUserId(userId);
        crAssessmentRepository.findFirstByCrIdOrderByAssessedAtDesc(saved.getCrId())
            .ifPresent(assessment -> {
                riskEvent.setRiskLevel(assessment.getRiskLevel());
                if (assessment.getRiskScore() != null) {
                    riskEvent.setRiskScore(assessment.getRiskScore().intValue());
                }
            });

        riskConfirmedProducer.publishCrRiskConfirmed(riskEvent);

        return response;
    }

    public SubmitChangeRequestResponseDTO approveChangeRequest(String id) {
        ChangeRequest changeRequest = changeRequestRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("ChangeRequest not found with id: " + id));

        if (changeRequest.getStatus() != Status.RISK_CONFIRMED) {
            throw new InvalidStateException("Only RISK_CONFIRMED change requests can be approved");
        }

        changeRequest.setStatus(Status.APPROVED);
        changeRequest.setUpdatedAt(LocalDateTime.now());

        ChangeRequest saved = changeRequestRepository.save(changeRequest);

        SubmitChangeRequestResponseDTO response = new SubmitChangeRequestResponseDTO();
        response.setCrId(saved.getCrId());
        response.setStatus(saved.getStatus());
        return response;
    }

    public List<ChangeRequestResponseDTO> getAllChangeRequests() {
        List<ChangeRequest> changeRequests = changeRequestRepository.findAllByOrderByCreatedAtDesc();
        return changeRequests.stream()
                .map(this::mapToResponseDTO)
                .collect(Collectors.toList());
    }

    public ChangeRequestResponseDTO getChangeRequestById(String id) {
        ChangeRequest changeRequest = changeRequestRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("ChangeRequest not found with id: " + id));
        return mapToResponseDTO(changeRequest);
    }

    public CrAssessmentResponseDTO getAssessmentByCrId(String crId) {
        CrAssessment assessment = crAssessmentRepository
            .findFirstByCrIdOrderByAssessedAtDesc(crId)
                .orElseThrow(() -> new ResourceNotFoundException("Assessment not found"));

        CrAssessmentResponseDTO dto = new CrAssessmentResponseDTO();
        dto.setAssessmentId(assessment.getAssessmentId());
        dto.setCrId(assessment.getCrId());
        dto.setRiskScore(assessment.getRiskScore());
        dto.setRiskLevel(assessment.getRiskLevel());
        dto.setBlastRadius(assessment.getBlastRadius());
        dto.setConfidence(assessment.getConfidence());
        dto.setExecutiveSummary(assessment.getExecutiveSummary());
        dto.setTechnicalAnalysis(assessment.getTechnicalAnalysis());
        dto.setCabGuidance(assessment.getCabGuidance());
        dto.setGeneratedAt(assessment.getAssessedAt());

        try {
            dto.setRecommendations(objectMapper.readValue(
                    assessment.getRecommendationsJson() != null ? assessment.getRecommendationsJson() : "[]",
                    new TypeReference<List<String>>() {}));
        } catch (JsonProcessingException e) {
            dto.setRecommendations(List.of());
        }

        try {
            dto.setRiskIndicators(objectMapper.readValue(
                    assessment.getRiskIndicatorsJson() != null ? assessment.getRiskIndicatorsJson() : "[]",
                    new TypeReference<List<String>>() {}));
        } catch (JsonProcessingException e) {
            dto.setRiskIndicators(List.of());
        }

        return dto;
    }

    private ChangeRequestResponseDTO mapToResponseDTO(ChangeRequest entity) {
        ChangeRequestResponseDTO dto = new ChangeRequestResponseDTO();
        dto.setCrId(entity.getCrId());
        dto.setTitle(entity.getTitle());
        dto.setDescription(entity.getDescription());
        dto.setDomain(entity.getDomain());
        dto.setChangeType(entity.getChangeType());
        dto.setRegion(entity.getRegion());
        dto.setStatus(entity.getStatus());
        dto.setScheduledStart(entity.getScheduledStart());
        dto.setScheduledEnd(entity.getScheduledEnd());
        dto.setRollbackAvailable(entity.getRollbackAvailable());
        dto.setBusinessJustification(entity.getBusinessJustification());
        dto.setRequestedByUserId(entity.getRequestedByUserId());
        dto.setCreatedAt(entity.getCreatedAt());
        dto.setUpdatedAt(entity.getUpdatedAt());

        List<CrAsset> assets = crAssetRepository.findByCrId(entity.getCrId());

        List<AssetResponseDTO> assetDTOs = assets.stream()
                .map(asset -> {
                    AssetResponseDTO assetDTO = new AssetResponseDTO();
                    assetDTO.setAssetType(asset.getAssetType());
                    assetDTO.setAssetId(asset.getAssetId());
                    assetDTO.setHostname(asset.getHostname());
                    return assetDTO;
                })
                .collect(Collectors.toList());

        dto.setAssets(assetDTOs);
        dto.setRiskAssessment(loadRiskAssessment(entity.getCrId()));
        return dto;
    }

    private RiskAssessmentDTO loadRiskAssessment(String crId) {
        return crAssessmentRepository.findLatestByCrId(crId).stream()
                .findFirst()
                .map(assessment -> {
                    List<String> recommendations = readJsonList(assessment.getRecommendationsJson());
                    List<String> riskIndicators = readJsonList(assessment.getRiskIndicatorsJson());
                    return new RiskAssessmentDTO(
                            assessment.getRiskScore(),
                            assessment.getRiskLevel(),
                            assessment.getBlastRadius() != null ? assessment.getBlastRadius().name() : null,
                            assessment.getConfidence(),
                            assessment.getExecutiveSummary(),
                            assessment.getTechnicalAnalysis(),
                            assessment.getCabGuidance(),
                            recommendations,
                            riskIndicators);
                })
                .orElse(null);
    }

    private List<String> readJsonList(String json) {
        try {
            return objectMapper.readValue(
                    json != null ? json : "[]",
                    new TypeReference<List<String>>() {});
        } catch (JsonProcessingException e) {
            return List.of();
        }
    }
}