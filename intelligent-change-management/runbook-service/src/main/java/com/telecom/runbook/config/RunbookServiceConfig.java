package com.telecom.runbook.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.telecom.runbook.client.ChangeRequestClient;
import com.telecom.runbook.mapper.RunbookMapper;
import com.telecom.runbook.repository.GeneratedRunbookRepository;
import com.telecom.runbook.service.RunbookService;
import com.telecom.runbook.service.RunbookServiceImpl;

@Configuration
public class RunbookServiceConfig {

    @Bean
    @Primary
    public RunbookService runbookService(
            GeneratedRunbookRepository generatedRunbookRepository,
            ChangeRequestClient changeRequestClient,
            RunbookMapper runbookMapper,
            ObjectMapper objectMapper,
            @Value("${clients.python-agent.url:http://localhost:8101}") String pythonAgentUrl) {

        RunbookServiceImpl service = new RunbookServiceImpl(
                generatedRunbookRepository,
                changeRequestClient,
                runbookMapper,
                objectMapper);
        service.setPythonAgentUrl(pythonAgentUrl);
        return service;
    }
}