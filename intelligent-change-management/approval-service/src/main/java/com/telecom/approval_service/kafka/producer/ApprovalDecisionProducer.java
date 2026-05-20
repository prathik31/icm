package com.telecom.approval_service.kafka.producer;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;

import com.telecom.approval_service.kafka.event.ApprovalDecisionEvent;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class ApprovalDecisionProducer {

	private final KafkaTemplate<String, ApprovalDecisionEvent> kafkaTemplate;

	@Value("${app.kafka.approval-decision-topic:approval-events}")
	private String defaultTopic;

	public void publishApprovalDecision(ApprovalDecisionEvent event) {
		String topic = "REJECTED".equals(event.getOutcome()) ? "cr.rejected" : "cr.approved";

		kafkaTemplate.send(topic, event).whenComplete((result, ex) -> {
			if (ex != null) {
				log.error("Failed to publish approval decision for CR {}: {}", event.getCrId(), ex.getMessage(), ex);
			} else {
				log.info("Published approval decision for CR {} with outcome {}", event.getCrId(), event.getOutcome());
			}
		});
	}
}
