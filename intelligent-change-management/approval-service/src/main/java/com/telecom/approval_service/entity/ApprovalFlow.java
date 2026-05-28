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
@Table(name = "approval_flow")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ApprovalFlow {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@Column(nullable = false, unique = true, length = 36)
	private String flowId;

	@Column(nullable = false, length = 36)
	private String crId;

	@Column(length = 100)
	private String riskLevel;

	private Double riskScore;

	@Column(nullable = false, length = 50)
	private String status;

	@Column(nullable = false)
	private LocalDateTime createdAt;

	@Column(nullable = false)
	private LocalDateTime updatedAt;

}
