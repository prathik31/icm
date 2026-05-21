package com.telecom.approval_service.dto;

import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ApprovalStepDTO {
	private String approverUserId;
	private String approverRole;
	private String approverEmail;
	private String outcome;
	private String comment;
	private LocalDateTime decisionAt;
}
