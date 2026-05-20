package com.telecom.approval_service.dto;

import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ApprovalDetailsDTO {
	private String flowId;
	private String crId;
	private String riskLevel;
	private Integer riskScore;
	private String status;
	private List<ApprovalStepDTO> steps;
}
