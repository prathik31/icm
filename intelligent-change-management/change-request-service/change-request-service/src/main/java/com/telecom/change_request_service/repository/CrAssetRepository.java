package com.telecom.change_request_service.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

import com.telecom.change_request_service.entity.CrAsset;

public interface CrAssetRepository extends JpaRepository<CrAsset, String> {
	List<CrAsset> findByCrId(String crId);
}