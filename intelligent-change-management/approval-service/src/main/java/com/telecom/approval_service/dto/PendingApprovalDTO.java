package com.telecom.approval_service.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PendingApprovalDTO {
	private String flowId;
	private String crId;
	private String title;
	private String region;
	private String riskLevel;
	private Double riskScore;
	private String status;
}
