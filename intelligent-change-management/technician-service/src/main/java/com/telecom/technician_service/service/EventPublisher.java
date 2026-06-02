package com.telecom.technician_service.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Component;

import java.util.Map;

@Component
public class EventPublisher {

    private final KafkaTemplate<String, String> kafkaTemplate;
    private final ObjectMapper objectMapper;

    public EventPublisher(KafkaTemplate<String, String> kafkaTemplate, ObjectMapper objectMapper) {
        this.kafkaTemplate = kafkaTemplate;
        this.objectMapper = objectMapper;
    }

    public void publishTechnicianAssigned(String crId, String technicianId) {
        publish("cr.technician.assigned", Map.of(
                "crId", crId,
                "technicianId", technicianId,
                "status", "TECHNICIAN_ASSIGNED"
        ));
    }

    public void publishExecutionStarted(String crId, String technicianId) {
        publish("cr.execution.started", Map.of(
                "crId", crId,
                "technicianId", technicianId,
                "startedAt", java.time.OffsetDateTime.now().toString()
        ));
    }

    public void publishExecutionCompleted(String crId, String technicianId) {
        publish("cr.execution.completed", Map.of(
                "crId", crId,
                "technicianId", technicianId,
                "completedAt", java.time.OffsetDateTime.now().toString(),
                "result", "SUCCESS"
        ));
    }

    private void publish(String topic, Map<String, Object> payload) {
        try {
            kafkaTemplate.send(topic, objectMapper.writeValueAsString(payload));
        } catch (JsonProcessingException e) {
            throw new RuntimeException("Unable to serialize Kafka payload", e);
        }
    }
}
