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

        dto.setAssetType(asset.getAssetType());

        dto.setAssetId(asset.getAssetId());

        dto.setHostname(asset.getHostname());

        return dto;
    }
}