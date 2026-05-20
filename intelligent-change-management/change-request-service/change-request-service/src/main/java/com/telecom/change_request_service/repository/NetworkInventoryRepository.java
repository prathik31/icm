package com.telecom.change_request_service.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.telecom.change_request_service.entity.NetworkInventoryAsset;

@Repository
public interface NetworkInventoryRepository extends JpaRepository<NetworkInventoryAsset, String> {

    List<NetworkInventoryAsset> findByRegionAndIsActiveTrue(String region);

    List<NetworkInventoryAsset> findByDomainAndIsActiveTrue(String domain);

    List<NetworkInventoryAsset> findByIsActiveTrue();

    List<NetworkInventoryAsset> findByAssetIdContainingIgnoreCaseAndIsActiveTrue(String assetId);
}
