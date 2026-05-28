package com.telecom.runbook.service;

import java.util.List;

import com.telecom.runbook.dto.EligibleRunbookCrDTO;
import com.telecom.runbook.dto.RunbookGenerationResponseDTO;
import com.telecom.runbook.dto.RunbookDetailDTO;
import com.telecom.runbook.dto.RunbookSummaryDTO;

public interface RunbookService {

    List<EligibleRunbookCrDTO> getEligibleCrs();

    List<RunbookSummaryDTO> getRunbooks();

    RunbookDetailDTO getRunbookByCrId(String crId);

    RunbookGenerationResponseDTO generateRunbook(String crId);
}