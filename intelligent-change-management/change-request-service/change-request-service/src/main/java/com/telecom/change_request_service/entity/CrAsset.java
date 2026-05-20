package com.telecom.change_request_service.entity;

import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Data;

@Entity
@Table(name = "cr_assets")
@Data
public class CrAsset {

    @Id
    @Column(name = "asset_row_id")
    private String assetRowId;

    @Column(name = "cr_id")
    private String crId;

    @Column(name = "asset_type")
    private String assetType;

    @Column(name = "asset_id")
    private String assetId;

    private String hostname;

    @Column(name = "created_at")
    private LocalDateTime createdAt;
}