package com.telecom.approval_service.kafka.event;

import java.time.LocalDateTime;

import com.fasterxml.jackson.databind.PropertyNamingStrategies;
import com.fasterxml.jackson.databind.annotation.JsonNaming;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@JsonNaming(PropertyNamingStrategies.SnakeCaseStrategy.class)
public class ApprovalDecisionEvent {
	private String flowId;
	private String crId;
	private String outcome;
	private String approverUserId;
	private String approverRole;
	private String comment;
	private LocalDateTime decisionAt;
}
