CREATE TABLE IF NOT EXISTS approval_flow (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  flow_id VARCHAR(36) NOT NULL UNIQUE,
  cr_id VARCHAR(36) NOT NULL,
  risk_level VARCHAR(100),
  risk_score INT,
  status VARCHAR(50) NOT NULL,
  created_at TIMESTAMP NOT NULL,
  updated_at TIMESTAMP NOT NULL,
  INDEX idx_cr_id (cr_id),
  INDEX idx_status (status)
);

CREATE TABLE IF NOT EXISTS approval_decision (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  flow_id VARCHAR(36) NOT NULL,
  approver_user_id VARCHAR(255),
  approver_role VARCHAR(50),
  outcome VARCHAR(50) NOT NULL,
  comment TEXT,
  decision_at TIMESTAMP NOT NULL,
  CONSTRAINT fk_approval_flow FOREIGN KEY (flow_id) REFERENCES approval_flow(flow_id),
  INDEX idx_flow_id (flow_id)
);

CREATE TABLE IF NOT EXISTS generated_runbooks (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  runbook_id VARCHAR(36) NOT NULL UNIQUE,
  cr_id VARCHAR(36) NOT NULL,
  flow_id VARCHAR(36) NOT NULL,
  title VARCHAR(255) NOT NULL,
  objective TEXT,
  pre_execution_steps JSON,
  execution_steps JSON,
  post_execution_steps JSON,
  rollback_steps JSON,
  estimated_duration VARCHAR(50),
  risk_mitigation TEXT,
  critical_checkpoints JSON,
  rag_sources JSON,
  status VARCHAR(50),
  generated_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP NOT NULL,
  CONSTRAINT fk_approval_flow_runbook FOREIGN KEY (flow_id) REFERENCES approval_flow(flow_id),
  INDEX idx_cr_id (cr_id),
  INDEX idx_flow_id (flow_id),
  INDEX idx_status (status)
);
