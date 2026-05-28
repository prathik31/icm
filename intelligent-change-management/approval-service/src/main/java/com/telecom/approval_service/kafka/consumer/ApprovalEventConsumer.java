package com.telecom.approval_service.kafka.consumer;

import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.annotation.PostConstruct;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Service;

import com.telecom.approval_service.kafka.event.CrRiskConfirmedEvent;
import com.telecom.approval_service.service.ApprovalWorkflowService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class ApprovalEventConsumer {

	private final ApprovalWorkflowService approvalWorkflowService;
	private final ObjectMapper objectMapper = new ObjectMapper();

	@PostConstruct
	public void init() {
		log.info("Approval consumer initialized");
		log.info("Listening topic: cr.risk_confirmed");
	}

	@KafkaListener(topics = "#{'${app.kafka.cr-risk-confirmed-topic:cr.risk_confirmed}'}", groupId = "approval-group-v2")
	public void consume(String rawMessage) {
		log.info("RAW MESSAGE RECEIVED: {}", rawMessage);
		try {
			CrRiskConfirmedEvent event = objectMapper.readValue(rawMessage, CrRiskConfirmedEvent.class);
			log.info("Parsed risk confirmed event: {}", event);
			approvalWorkflowService.handleRiskConfirmedEvent(event);
			log.info("Approval flow processed for CR: {}", event.getCrId());
		} catch (Exception e) {
			log.error("Kafka consume failed", e);
		}
	}
}
