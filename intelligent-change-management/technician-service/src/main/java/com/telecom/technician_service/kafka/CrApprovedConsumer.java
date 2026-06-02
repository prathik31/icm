package com.telecom.technician_service.kafka;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.telecom.technician_service.entity.AssignmentStatus;
import com.telecom.technician_service.entity.TechnicianAssignment;
import com.telecom.technician_service.repository.TechnicianAssignmentRepository;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.UUID;

@Component
public class CrApprovedConsumer {

    private final TechnicianAssignmentRepository assignmentRepository;
    private final ObjectMapper objectMapper;

    public CrApprovedConsumer(TechnicianAssignmentRepository assignmentRepository, ObjectMapper objectMapper) {
        this.assignmentRepository = assignmentRepository;
        this.objectMapper = objectMapper;
    }

    @KafkaListener(topics = "cr.approved", groupId = "technician-service-group")
    public void receive(String message) {
        try {
            Map<String, Object> payload = objectMapper.readValue(message, new TypeReference<>() {
            });
            String crId = payload.getOrDefault("crId", "").toString();
            String status = payload.getOrDefault("status", "").toString();
            if (!"APPROVED".equalsIgnoreCase(status) || crId.isBlank()) {
                return;
            }

            assignmentRepository.findByCrId(crId).orElseGet(() -> {
                TechnicianAssignment assignment = TechnicianAssignment.builder()
                        .assignmentId(UUID.randomUUID().toString())
                        .crId(crId)
                        .assignedAt(LocalDateTime.now())
                        .assignedBy("SYSTEM")
                        .status(AssignmentStatus.ASSIGNED)
                        .build();
                return assignmentRepository.save(assignment);
            });
        } catch (JsonProcessingException ignored) {
        }
    }
}
