CREATE TABLE IF NOT EXISTS technicians (
  technician_id VARCHAR(36) NOT NULL,
  employee_code VARCHAR(100) NOT NULL UNIQUE,
  full_name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  region VARCHAR(100) NOT NULL,
  specialization VARCHAR(100) NOT NULL,
  experience_years INT,
  certifications VARCHAR(512),
  availability_status VARCHAR(50),
  current_workload INT,
  active BOOLEAN NOT NULL,
  created_at DATETIME NOT NULL,
  PRIMARY KEY (technician_id)
);

CREATE TABLE IF NOT EXISTS technician_assignments (
  assignment_id VARCHAR(36) NOT NULL,
  cr_id VARCHAR(100) NOT NULL,
  technician_id VARCHAR(36),
  assigned_by VARCHAR(100),
  assigned_at DATETIME,
  status VARCHAR(50) NOT NULL,
  PRIMARY KEY (assignment_id),
  INDEX idx_assignment_cr_id (cr_id),
  INDEX idx_assignment_technician_id (technician_id)
);

CREATE TABLE IF NOT EXISTS technician_schedules (
  schedule_id VARCHAR(36) NOT NULL,
  cr_id VARCHAR(100) NOT NULL,
  scheduled_start DATETIME NOT NULL,
  scheduled_end DATETIME NOT NULL,
  status VARCHAR(50) NOT NULL,
  created_at DATETIME NOT NULL,
  PRIMARY KEY (schedule_id),
  INDEX idx_schedule_cr_id (cr_id)
);

CREATE TABLE IF NOT EXISTS execution_logs (
  execution_id VARCHAR(36) NOT NULL,
  cr_id VARCHAR(100) NOT NULL,
  technician_id VARCHAR(36) NOT NULL,
  execution_start DATETIME NOT NULL,
  execution_end DATETIME,
  execution_status VARCHAR(50) NOT NULL,
  notes VARCHAR(1024),
  rollback_required BOOLEAN,
  created_at DATETIME NOT NULL,
  PRIMARY KEY (execution_id),
  INDEX idx_execution_cr_id (cr_id),
  INDEX idx_execution_technician_id (technician_id)
);
