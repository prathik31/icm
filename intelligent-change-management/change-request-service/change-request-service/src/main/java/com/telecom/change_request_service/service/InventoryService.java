package com.telecom.change_request_service.service;

import com.telecom.change_request_service.dto.AssetResponseDTO;
import com.telecom.change_request_service.entity.NetworkInventoryAsset;
import com.telecom.change_request_service.repository.NetworkInventoryRepository;

import lombok.RequiredArgsConstructor;

import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class InventoryService {

    private final NetworkInventoryRepository repository;

    public List<AssetResponseDTO> getAssets(
            String region,
            String domain
    ) {

        List<NetworkInventoryAsset> assets;

        if (region != null && !region.isBlank()) {

            assets =
                repository.findByRegionAndIsActiveTrue(region);

        } else if (domain != null && !domain.isBlank()) {

            assets =
                repository.findByDomainAndIsActiveTrue(domain);

        } else {

            assets =
                repository.findByIsActiveTrue();
        }

        return assets
            .stream()
            .map(this::mapToDTO)
            .collect(Collectors.toList());
    }

    public List<AssetResponseDTO> searchAssets(
            String query
    ) {

        List<NetworkInventoryAsset> assets =
            repository.findByAssetIdContainingIgnoreCaseAndIsActiveTrue(query);

        return assets
            .stream()
            .map(this::mapToDTO)
            .collect(Collectors.toList());
    }

    private AssetResponseDTO mapToDTO(
            NetworkInventoryAsset asset
    ) {

        AssetResponseDTO dto =
            new AssetResponseDTO();

        dto.setAssetId(asset.getAssetId());

        dto.setAssetType(asset.getAssetType());

        dto.setDomain(asset.getDomain());

        dto.setTier(asset.getTier());

        dto.setHostname(asset.getHostname());

        dto.setRegion(asset.getRegion());

        dto.setDatacenter(asset.getDatacenter());

        dto.setVendor(asset.getVendor());

        dto.setModel(asset.getModel());

        dto.setCriticalityLevel(
            asset.getCriticalityLevel()
        );

        dto.setIsCoreInfrastructure(
            asset.getIsCoreInfrastructure()
        );

        dto.setIsInternetFacing(
            asset.getIsInternetFacing()
        );

        dto.setRedundancyAvailable(
            asset.getRedundancyAvailable()
        );

        dto.setConnectedAssetCount(
            asset.getConnectedAssetCount()
        );

        dto.setRegionHubWeight(
            asset.getRegionHubWeight()
        );

        dto.setSupportsRollback(
            asset.getSupportsRollback()
        );

        dto.setIsActive(asset.getIsActive());

        return dto;
    }
}