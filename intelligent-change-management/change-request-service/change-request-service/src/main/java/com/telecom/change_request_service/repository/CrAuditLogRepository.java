package com.telecom.change_request_service.repository;

import com.telecom.change_request_service.entity.CrAuditLog;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CrAuditLogRepository extends JpaRepository<CrAuditLog, String> {
}