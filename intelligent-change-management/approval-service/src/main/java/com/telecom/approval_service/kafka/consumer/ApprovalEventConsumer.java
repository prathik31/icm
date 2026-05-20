package com.telecom.approval_service.kafka.consumer;

import org.springframework.beans.factory.annotation.Value;
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

	@Value("${app.kafka.cr-risk-confirmed-topic:cr.risk_confirmed}")
	private String riskConfirmedTopic;

	@KafkaListener(topics = "#{'${app.kafka.cr-risk-confirmed-topic:cr.risk_confirmed}'}", groupId = "approval-group")
	public void consume(CrRiskConfirmedEvent event) {
		log.info("Received {} event for CR {}", riskConfirmedTopic, event.getCrId());
		approvalWorkflowService.handleRiskConfirmedEvent(event);
	}
}
