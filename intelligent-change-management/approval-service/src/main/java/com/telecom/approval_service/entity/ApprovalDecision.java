package com.telecom.approval_service.entity;

import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "approval_decision")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ApprovalDecision {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@Column(nullable = false, length = 36)
	private String flowId;

	@Column(length = 255)
	private String approverUserId;

	@Column(length = 50)
	private String approverRole;

	@Column(nullable = false, length = 50)
	private String outcome;

	@Column(columnDefinition = "TEXT")
	private String comment;

	@Column(nullable = false)
	private LocalDateTime decisionAt;

}
