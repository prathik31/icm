-- Change Requests table
CREATE TABLE IF NOT EXISTS change_requests (
    cr_id VARCHAR(255) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    domain VARCHAR(255),
    change_type VARCHAR(255),
    region VARCHAR(255),
    status VARCHAR(50),
    scheduled_start DATETIME,
    scheduled_end DATETIME,
    rollback_available BOOLEAN,
    business_justification TEXT,
    requested_by_user_id VARCHAR(255),
    created_at DATETIME,
    updated_at DATETIME
);

-- CR Assets table
CREATE TABLE IF NOT EXISTS cr_assets (
    asset_row_id VARCHAR(255) PRIMARY KEY,
    cr_id VARCHAR(255),
    asset_type VARCHAR(255),
    asset_id VARCHAR(255),
    hostname VARCHAR(255),
    created_at DATETIME
);

-- CR Assessments table
CREATE TABLE IF NOT EXISTS cr_assessments (
    assessment_id VARCHAR(255) PRIMARY KEY,
    cr_id VARCHAR(255),
    risk_score DOUBLE,
    risk_level VARCHAR(255),
    blast_radius VARCHAR(50),
    confidence DOUBLE,
    executive_summary TEXT,
    technical_analysis TEXT,
    cab_guidance TEXT,
    recommendations_json TEXT,
    risk_indicators_json TEXT,
    model_version VARCHAR(255),
    assessed_at DATETIME
);

-- CR Audit Logs table
CREATE TABLE IF NOT EXISTS cr_audit_logs (
    log_id VARCHAR(255) PRIMARY KEY,
    cr_id VARCHAR(255),
    action_type VARCHAR(255),
    old_status VARCHAR(50),
    new_status VARCHAR(50),
    acted_by_user_id VARCHAR(255),
    remarks TEXT,
    created_at DATETIME
);

-- Network Inventory table - Enterprise asset registry
-- Authoritative source for infrastructure assets
-- Used by CR impact analysis, blast radius simulation, topology intelligence, monitoring, runbooks
CREATE TABLE IF NOT EXISTS network_inventory (
    asset_id VARCHAR(255) PRIMARY KEY COMMENT 'Unique identifier (ROUTER-001, SWITCH-005, etc.)',
    asset_type VARCHAR(100) COMMENT 'Router, Switch, Server, LoadBalancer, Firewall, Database',
    domain VARCHAR(100) COMMENT 'NETWORK, COMPUTE, STORAGE, DATABASE, SECURITY',
    tier VARCHAR(100) COMMENT 'CORE, DISTRIBUTION, ACCESS, DMZ, INTERNAL',
    hostname VARCHAR(255) COMMENT 'FQDN (prod-rtr-01.example.com)',
    region VARCHAR(100) COMMENT 'US-East-1, EU-West-1, APAC, Mumbai, etc.',
    datacenter VARCHAR(100) COMMENT 'DC-01, DC-Mumbai-02, etc.',
    vendor VARCHAR(100) COMMENT 'Cisco, Juniper, Dell, HP, etc.',
    model VARCHAR(255) COMMENT 'ASR 9000, Catalyst 9300, etc.',
    os_version VARCHAR(255) COMMENT 'IOS-XE 16.12, Windows Server 2019, Ubuntu 20.04',
    criticality_level VARCHAR(100) COMMENT 'CRITICAL, HIGH, MEDIUM, LOW',
    is_core_infrastructure BOOLEAN DEFAULT FALSE COMMENT 'Part of backbone/core network',
    is_internet_facing BOOLEAN DEFAULT FALSE COMMENT 'Directly exposed to internet',
    redundancy_available BOOLEAN DEFAULT FALSE COMMENT 'Backup/failover exists',
    redundancy_peer_id VARCHAR(255) COMMENT 'ID of redundant pair',
    connected_asset_count INT COMMENT 'Number of connected devices',
    region_hub_weight INT COMMENT 'Importance score in region topology',
    supports_rollback BOOLEAN DEFAULT TRUE COMMENT 'Can configuration be rolled back',
    current_os_version VARCHAR(255) COMMENT 'Currently running OS version',
    uptime_sla_pct DOUBLE COMMENT 'SLA commitment (99.9, 99.99, etc.)',
    max_capacity_pct DOUBLE COMMENT 'Current utilization %',
    commissioned_date DATE COMMENT 'When asset was deployed',
    is_active BOOLEAN DEFAULT TRUE COMMENT 'Still in service',
    
    INDEX idx_region (region),
    INDEX idx_domain (domain),
    INDEX idx_asset_type (asset_type),
    INDEX idx_hostname (hostname),
    INDEX idx_is_active (is_active),
    INDEX idx_criticality (criticality_level),
    INDEX idx_tier (tier)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Enterprise network inventory - authoritative source for infrastructure assets used in CR impact analysis and topology intelligence';