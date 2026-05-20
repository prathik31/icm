package com.telecom.change_request_service.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

/**
 * Enterprise network inventory asset entity.
 * Represents infrastructure components (routers, switches, servers, etc.)
 * Available for change impact analysis, blast radius calculation, and topology intelligence.
 */
@Entity
@Table(name = "network_inventory", indexes = {
    @Index(name = "idx_region", columnList = "region"),
    @Index(name = "idx_domain", columnList = "domain"),
    @Index(name = "idx_asset_type", columnList = "asset_type"),
    @Index(name = "idx_hostname", columnList = "hostname"),
    @Index(name = "idx_is_active", columnList = "is_active")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
public class NetworkInventoryAsset {

    @Id
    @Column(name = "asset_id", length = 255)
    private String assetId;  // Unique identifier (ROUTER-001, SWITCH-005, etc.)

    @Column(name = "asset_type", length = 100)
    private String assetType;  // Router, Switch, Server, LoadBalancer, Firewall, etc.

    @Column(name = "domain", length = 100)
    private String domain;  // NETWORK, COMPUTE, STORAGE, DATABASE, SECURITY

    @Column(name = "tier", length = 100)
    private String tier;  // CORE, DISTRIBUTION, ACCESS, DMZ, INTERNAL

    @Column(name = "hostname", length = 255)
    private String hostname;  // FQDN (prod-rtr-01.example.com)

    @Column(name = "region", length = 100)
    private String region;  // US-East-1, EU-West-1, APAC, Mumbai, etc.

    @Column(name = "datacenter", length = 100)
    private String datacenter;  // DC-01, DC-Mumbai-02, etc.

    @Column(name = "vendor", length = 100)
    private String vendor;  // Cisco, Juniper, Dell, HP, etc.

    @Column(name = "model", length = 255)
    private String model;  // ASR 9000, Catalyst 9300, etc.

    @Column(name = "os_version", length = 255)
    private String osVersion;  // IOS-XE 16.12, Windows Server 2019, Ubuntu 20.04, etc.

    @Column(name = "criticality_level", length = 100)
    private String criticalityLevel;  // CRITICAL, HIGH, MEDIUM, LOW

    @Column(name = "is_core_infrastructure")
    private Boolean isCoreInfrastructure;  // Part of backbone/core network

    @Column(name = "is_internet_facing")
    private Boolean isInternetFacing;  // Directly exposed to internet

    @Column(name = "redundancy_available")
    private Boolean redundancyAvailable;  // Backup/failover exists

    @Column(name = "redundancy_peer_id", length = 255)
    private String redundancyPeerId;  // ID of redundant pair

    @Column(name = "connected_asset_count")
    private Integer connectedAssetCount;  // Number of connected devices

    @Column(name = "region_hub_weight")
    private Integer regionHubWeight;  // Importance score in region topology

    @Column(name = "supports_rollback")
    private Boolean supportsRollback;  // Can configuration be rolled back

    @Column(name = "current_os_version", length = 255)
    private String currentOsVersion;  // Currently running OS version

    @Column(name = "uptime_sla_pct")
    private Double uptimeSlaPercentage;  // SLA commitment (99.9%, 99.99%, etc.)

    @Column(name = "max_capacity_pct")
    private Double maxCapacityPercentage;  // Current utilization %

    @Column(name = "commissioned_date")
    private LocalDate commissionedDate;  // When asset was deployed

    @Column(name = "is_active")
    private Boolean isActive;  // Still in service
}
