package com.telecom.approval_service.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TestApprovalRequestDTO {
    @NotBlank
    private String crId;

    @NotBlank
    private String riskLevel;

    @NotNull
    private Double riskScore;
}
