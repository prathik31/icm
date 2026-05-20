package com.telecom.change_request_service.repository;

import com.telecom.change_request_service.entity.ChangeRequest;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ChangeRequestRepository extends JpaRepository<ChangeRequest, String> {
}