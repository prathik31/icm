package com.telecom.change_request_service.controller;

import com.telecom.change_request_service.dto.AssetResponseDTO;
import com.telecom.change_request_service.service.InventoryService;

import lombok.RequiredArgsConstructor;

import org.springframework.http.ResponseEntity;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/v1/assets")
@RequiredArgsConstructor
public class InventoryController {

    private final InventoryService inventoryService;

    @GetMapping
    public ResponseEntity<List<AssetResponseDTO>>
        getAssets(
            @RequestParam(required = false)
            String region,

            @RequestParam(required = false)
            String domain
        ) {

        return ResponseEntity.ok(
            inventoryService.getAssets(
                region,
                domain
            )
        );
    }

    @GetMapping("/search")
    public ResponseEntity<List<AssetResponseDTO>>
        searchAssets(
            @RequestParam String q
        ) {

        return ResponseEntity.ok(
            inventoryService.searchAssets(q)
        );
    }
}