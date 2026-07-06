package com.telecom.technician_service.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestClientResponseException;
import org.springframework.web.client.RestTemplate;

import java.util.Collections;
import java.util.Map;

import lombok.extern.slf4j.Slf4j;

@Slf4j
@Component
public class ExternalServiceClient {

    private final RestTemplate restTemplate;
    private final String changeRequestServiceUrl;
    private final String runbookServiceUrl;

    public ExternalServiceClient(RestTemplate restTemplate,
                                 @Value("${external.change-request-service.url}") String changeRequestServiceUrl,
                                 @Value("${external.runbook-service.url}") String runbookServiceUrl) {
        this.restTemplate = restTemplate;
        this.changeRequestServiceUrl = changeRequestServiceUrl;
        this.runbookServiceUrl = runbookServiceUrl;
    }

    public Map<String, Object> fetchChangeRequest(String crId) {
        return getForObject(changeRequestServiceUrl + "/v1/change-requests/" + crId);
    }

    public Map<String, Object> fetchAssessment(String crId) {
        return getForObject(changeRequestServiceUrl + "/v1/change-requests/" + crId + "/assessment");
    }

    public Map<String, Object> fetchRunbook(String crId) {
        return getForObject(runbookServiceUrl + "/v1/runbooks/" + crId);
    }

    private Map<String, Object> getForObject(String url) {
        try {
            ResponseEntity<Map<String, Object>> response = restTemplate.exchange(
                    url,
                    HttpMethod.GET,
                    null,
                    new ParameterizedTypeReference<>() {
                    }
            );
            return response.getBody() != null ? response.getBody() : Collections.emptyMap();
        } catch (RestClientResponseException ex) {
            log.error("External service request failed: url={}, status={}, responseBody={}", url, ex.getRawStatusCode(), ex.getResponseBodyAsString(), ex);
            return null;
        } catch (RestClientException ex) {
            log.error("External service request failed: url={}, error={}", url, ex.getMessage(), ex);
            return null;
        }
    }
}
