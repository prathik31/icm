package com.telecom.change_request_service.service;

import java.time.LocalDateTime;
import java.util.UUID;

import org.springframework.stereotype.Service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.telecom.change_request_service.entity.CrAuditLog;
import com.telecom.change_request_service.repository.CrAuditLogRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuditService {

    private final CrAuditLogRepository crAuditLogRepository;
    private final ObjectMapper objectMapper;

    public void logAction(String crId, String actionType, String actedByUserId, String remarks) {
        CrAuditLog auditLog = new CrAuditLog();
        auditLog.setLogId(UUID.randomUUID().toString());
        auditLog.setCrId(crId);
        auditLog.setActionType(actionType);
        auditLog.setActedByUserId(actedByUserId);
        auditLog.setRemarks(remarks);
        auditLog.setCreatedAt(LocalDateTime.now());

        crAuditLogRepository.save(auditLog);

        log.info("Audit log created: {} for CR {} by {}", actionType, crId, actedByUserId);
    }
}