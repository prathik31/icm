package com.telecom.runbook.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class RunbookGenerationResponseDTO {

    private String runbookId;
    private String crId;
    private String status;
}