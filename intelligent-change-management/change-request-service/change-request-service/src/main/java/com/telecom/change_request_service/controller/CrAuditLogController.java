package com.telecom.change_request_service.controller;

import com.telecom.change_request_service.entity.CrAuditLog;
import com.telecom.change_request_service.repository.CrAuditLogRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/v1/audit-logs")
public class CrAuditLogController {

    @Autowired
    private CrAuditLogRepository crAuditLogRepository;

    @GetMapping
    public ResponseEntity<List<CrAuditLog>> getAllAuditLogs() {
        List<CrAuditLog> logs = crAuditLogRepository.findAll();
        return ResponseEntity.ok(logs);
    }
}