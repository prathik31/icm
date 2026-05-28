package com.telecom.runbook.client;

import java.util.List;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

import com.telecom.runbook.dto.ChangeRequestDTO;
import com.telecom.runbook.dto.CrAssessmentDTO;

@FeignClient(
        name = "change-request-service",
        url = "${change-request-service.url:http://localhost:9004}"
)
public interface ChangeRequestClient {

    @GetMapping("/v1/change-requests")
    List<ChangeRequestDTO> getAllChangeRequests();

    @GetMapping("/v1/change-requests/{crId}")
    ChangeRequestDTO getChangeRequest(@PathVariable("crId") String crId);

    @GetMapping("/v1/change-requests/{crId}/assessment")
    CrAssessmentDTO getAssessment(@PathVariable("crId") String crId);
}