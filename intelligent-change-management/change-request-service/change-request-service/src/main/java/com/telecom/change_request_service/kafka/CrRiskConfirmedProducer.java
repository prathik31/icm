package com.telecom.change_request_service.kafka;

import com.telecom.change_request_service.dto.event.CrRiskConfirmedEvent;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class CrRiskConfirmedProducer {

    private final KafkaTemplate<String, CrRiskConfirmedEvent> kafkaTemplate;

    @Value("${app.kafka.cr-risk-confirmed-topic:cr.risk_confirmed}")
    private String topic;

    public void publishCrRiskConfirmed(CrRiskConfirmedEvent event) {
        kafkaTemplate.send(topic, event).whenComplete((result, ex) -> {
            if (ex != null) {
                log.error("Failed to publish CR risk confirmed event: {}", event.getCrId(), ex);
            } else {
                log.info("Published CR risk confirmed event: {}", event.getCrId());
            }
        });
    }
}
