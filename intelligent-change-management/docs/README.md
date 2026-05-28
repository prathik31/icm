# Intelligent Change Management System

**Version:** 1.0.0  
**Last Updated:** May 28, 2026  
**Status:** Production - Microservices Architecture with Kafka Integration

---

## 📋 Table of Contents

1. [Project Overview](#project-overview)
2. [System Architecture](#system-architecture)
3. [Technology Stack](#technology-stack)
4. [Prerequisites & Setup](#prerequisites--setup)
5. [Running the Services](#running-the-services)
6. [API Quick Reference](#api-quick-reference)
7. [Database Schema](#database-schema)
8. [Kafka Integration](#kafka-integration)
9. [Authentication](#authentication)

---

## 🏗️ Project Overview

**Intelligent Change Management System** is a microservices-based platform for managing infrastructure changes in telecom environments. It orchestrates change requests from creation through risk assessment to approval and runbook generation.

### Deployed Services

| Service | Port | Purpose |
|---------|------|---------|
| **Auth Service** | 9003 | User registration and JWT authentication |
| **Change Request Service** | 9004 | Change request management and lifecycle |
| **Approval Service** | 9005 | Approval workflows and runbook generation |
| **Runbook Service** | 9096 | Runbook generation and management |

### Key Features

✅ **Change Request Management** - Create, submit, track CRs  
✅ **AI Risk Assessment** - Async Kafka-based integration with AI engine  
✅ **Approval Workflows** - Multi-stage approval with audit trails  
✅ **Runbook Generation** - Automated runbook creation  
✅ **Complete Audit Logging** - All state transitions logged  
✅ **JWT Authentication** - Secure role-based access  

---

## 🔄 System Architecture

### Service Interactions

```
┌──────────────────────────────────────────────────────────────┐
│                      External Clients                        │
└────────────┬─────────────────────────────────────┬───────────┘
             │                                     │
      POST /auth/*                     /v1/change-requests/*
             │                                     │
        ┌────▼────┐    ┌──────────────────────┐   │
        │   Auth   │    │  Change Request      │◄──┘
        │Service   │    │  Service             │
        │ (9003)   │    │  (9004)              │
        └────┬─────┘    └────────┬─────────────┘
             │                   │
             │                   ├─► /v1/audit-logs
             │                   ├─► /v1/assets
             │                   └─► /v1/change-requests/{id}/assessment
             │
             └─ Returns: JWT Token
                (Used in all requests)

                    Kafka Topics
                    ┌──────────────────────────┐
                    │ change-requests          │
                    │ ai.risk.completed        │
                    │ cr.risk_confirmed        │
                    │ approval-events          │
                    └──────────────────────────┘
                              │
              ┌───────────────┼───────────────┐
              │               │               │
          ┌───▼────┐   ┌────┐▼────┐   ┌────┐▼────┐
          │Approval│   │Runbook   │   │ AI │      │
          │Service │   │Service   │   │Eng │      │
          │(9005)  │   │(9096)    │   │(8101)   │
          └────────┘   └──────────┘   └─────────┘

                      MySQL Database
                      (localhost:3306)
                      Database: icm_db
```

### Event Flow

1. User creates CR → `POST /v1/change-requests` → **DRAFT status**
2. User submits CR → `POST /v1/change-requests/{id}/submit` → **SUBMITTED + Kafka event**
3. AI Engine processes → Analyzes change, publishes risk assessment
4. Java consumes assessment → Persists to `cr_assessments` table
5. Frontend queries → `GET /v1/change-requests/{id}/assessment` → Returns assessment
6. Approver approves → `POST /v1/approvals/{flowId}/approve` → Triggers runbook generation
7. Runbook service generates → Stores to `generated_runbooks` table

---

## 🔧 Technology Stack

| Component | Version | Purpose |
|-----------|---------|---------|
| **Java** | 17 LTS | Runtime |
| **Spring Boot** | 3.5.13 | Framework |
| **Spring Kafka** | 3.x | Message streaming |
| **Hibernate/JPA** | 6.6.45 | ORM |
| **MySQL** | 8.0.45 | Database |
| **Maven** | 3.9+ | Build tool |
| **Kafka** | Latest | Message broker |
| **Lombok** | 1.x | Code generation |

---

## 📦 Prerequisites & Setup

### System Requirements

- **OS:** Windows 10+, macOS 11+, or Linux (Ubuntu 20.04+)
- **RAM:** 8GB minimum (16GB recommended)
- **Disk:** 50GB free space
- **Ports needed:** 3306 (MySQL), 9092 (Kafka), 9003-9005, 9096 (services)

### Java 17 Installation

**Windows (PowerShell):**
```powershell
choco install openjdk17
java -version  # Verify
```

**macOS:**
```bash
brew install openjdk@17
export JAVA_HOME=/usr/local/opt/openjdk@17/libexec/openjdk.jdk/Contents/Home
```

**Linux (Ubuntu):**
```bash
sudo apt install openjdk-17-jdk
java -version
```

### MySQL 8.0 Setup

**Docker (Recommended):**
```bash
docker run --name mysql-icm \
  -e MYSQL_ROOT_PASSWORD=Contract@1968 \
  -e MYSQL_DATABASE=icm_db \
  -p 3306:3306 \
  -d mysql:8.0

# Verify
docker exec mysql-icm mysql -u root -pContract@1968 -e "SHOW DATABASES;"
```

### Kafka Setup

**Docker Compose:**
```bash
# Create docker-compose.yml with Zookeeper and Kafka
docker-compose up -d

# Create topics
docker exec kafka kafka-topics \
  --bootstrap-server localhost:9092 \
  --create \
  --topic change-requests \
  --partitions 1 \
  --replication-factor 1

docker exec kafka kafka-topics \
  --bootstrap-server localhost:9092 \
  --create \
  --topic ai.risk.completed \
  --partitions 1 \
  --replication-factor 1
```

---

## 🚀 Running the Services

### Build All Services

```bash
cd approval-service
./mvnw.cmd clean package -DskipTests

cd ../auth-service/auth-service
./mvnw.cmd clean package -DskipTests

cd ../../change-request-service/change-request-service
./mvnw.cmd clean package -DskipTests

cd ../../runbook-service
./mvnw.cmd clean package -DskipTests
```

### Start Services (from project root)

**Auth Service:**
```bash
cd auth-service/auth-service
java -jar target/auth-service-0.0.1-SNAPSHOT.jar
# Runs on port 9003
```

**Change Request Service:**
```bash
cd change-request-service/change-request-service
java -jar target/change-request-service-0.0.1-SNAPSHOT.jar
# Runs on port 9004
```

**Approval Service:**
```bash
cd approval-service
java -jar target/approval-service-0.0.1-SNAPSHOT.jar
# Runs on port 9005
```

**Runbook Service:**
```bash
cd runbook-service
java -jar target/runbook-service-0.0.1-SNAPSHOT.jar
# Runs on port 9096
```

### Or use VS Code Run Tasks

Each service has a run configuration available through VS Code's Run menu.

---

## 📡 API Quick Reference

### Auth Service (Port 9003)

**Register User:**
```bash
POST /auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "SecurePass123"
}
```

**Login:**
```bash
POST /auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "SecurePass123"
}

Response:
{
  "token": "eyJhbGciOiJIUzI1NiIs..."
}
```

### Change Request Service (Port 9004)

**Create Change Request:**
```bash
POST /v1/change-requests
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Database Migration",
  "description": "Upgrade MySQL from 5.7 to 8.0",
  "domain": "database",
  "changeType": "MIGRATION",
  "region": "us-east-1",
  "scheduledStart": "2026-06-01T10:00:00Z",
  "scheduledEnd": "2026-06-01T14:00:00Z",
  "rollbackAvailable": true,
  "businessJustification": "Performance improvement",
  "assets": [
    {
      "assetType": "database",
      "assetId": "mysql-prod-01",
      "hostname": "db-prod-01.example.com"
    }
  ]
}
```

**Submit Change Request (Triggers AI Analysis):**
```bash
POST /v1/change-requests/{id}/submit
Authorization: Bearer <token>
```

**Get All Change Requests:**
```bash
GET /v1/change-requests
Authorization: Bearer <token>
```

**Get CR Details:**
```bash
GET /v1/change-requests/{id}
Authorization: Bearer <token>
```

**Get Risk Assessment:**
```bash
GET /v1/change-requests/{id}/assessment
Authorization: Bearer <token>
```

**Get Assets:**
```bash
GET /v1/assets?region=us-east-1&domain=database
Authorization: Bearer <token>
```

**Search Assets:**
```bash
GET /v1/assets/search?q=mysql
Authorization: Bearer <token>
```

**Get Audit Logs:**
```bash
GET /v1/audit-logs
Authorization: Bearer <token>
```

### Approval Service (Port 9005)

**Get Pending Approvals:**
```bash
GET /v1/approvals/pending
Authorization: Bearer <token>
```

**Get Approval History:**
```bash
GET /v1/approvals/history
Authorization: Bearer <token>
```

**Get Approval Details:**
```bash
GET /v1/approvals/{crId}
Authorization: Bearer <token>
```

**Approve Change Request:**
```bash
POST /v1/approvals/{flowId}/approve
Authorization: Bearer <token>
Content-Type: application/json

{
  "comment": "Approved. Risk is acceptable."
}
```

**Reject Change Request:**
```bash
POST /v1/approvals/{flowId}/reject
Authorization: Bearer <token>
Content-Type: application/json

{
  "comment": "Blast radius too high. Need more planning."
}
```

### Runbook Service (Port 9096)

**Get Health:**
```bash
GET /v1/runbooks/health
```

**Get Eligible CRs for Runbook:**
```bash
GET /v1/runbooks/eligible-crs
```

**Get All Runbooks:**
```bash
GET /v1/runbooks
```

**Get Runbook Details:**
```bash
GET /v1/runbooks/{crId}
```

**Generate Runbook:**
```bash
POST /v1/runbooks/generate/{crId}
```

---

## 📊 Database Schema

### Core Tables

**users**
```sql
- id (UUID, PK)
- name
- email (UNIQUE)
- passwordHash
- role (ENGINEER, APPROVER, ADMIN)
- isActive
- createdAt
- updatedAt
```

**change_requests**
```sql
- cr_id (UUID, PK)
- title
- description
- domain
- change_type
- region
- status (DRAFT, SUBMITTED, ANALYZED, RISK_CONFIRMED, APPROVED, REJECTED)
- scheduled_start
- scheduled_end
- rollback_available
- business_justification
- requested_by_user_id (FK → users.id)
- created_at
- updated_at
```

**cr_assets**
```sql
- asset_row_id (UUID, PK)
- cr_id (FK → change_requests.cr_id)
- asset_type
- asset_id
- hostname
- created_at
```

**cr_assessments**
```sql
- assessment_id (UUID, PK)
- cr_id (FK → change_requests.cr_id)
- risk_score
- risk_level
- blast_radius
- confidence
- executive_summary
- technical_analysis
- cab_guidance
- recommendations_json
- risk_indicators_json
- model_version
- created_at
```

**cr_audit_logs**
```sql
- log_id (UUID, PK)
- cr_id (FK → change_requests.cr_id)
- action_type
- old_status
- new_status
- acted_by_user_id (FK → users.id)
- remarks
- created_at
```

**approval_flow**
```sql
- id (auto, PK)
- flowId (UUID)
- crId (FK → change_requests.cr_id)
- riskLevel
- riskScore
- status (IN_PROGRESS, APPROVED, REJECTED)
- createdAt
- updatedAt
```

**approval_decision**
```sql
- id (auto, PK)
- flowId (FK → approval_flow.flowId)
- approverUserId (FK → users.id)
- approverRole
- outcome (APPROVED, REJECTED)
- comment
- decisionAt
```

**generated_runbooks**
```sql
- runbook_id (UUID, PK)
- cr_id (FK → change_requests.cr_id)
- flow_id
- title
- objective
- pre_checks (JSON)
- execution_steps (JSON)
- validation_steps (JSON)
- rollback_steps (JSON)
- monitoring_guidance (JSON)
- escalation_conditions (JSON)
- rag_sources (JSON)
- risk_level
- blast_radius
- estimated_duration_mins
- risk_notes
- generated_by
- created_at
```

**network_inventory**
```sql
- asset_id (UUID, PK)
- asset_type
- domain
- tier
- hostname
- region
- datacenter
- vendor
- model
- os_version
- criticality_level
- is_core_infrastructure
- is_internet_facing
- redundancy_available
- redundancy_peer_id
- connected_asset_count
- region_hub_weight
- supports_rollback
- current_os_version
- uptime_sla_pct
- max_capacity_pct
- commissioned_date
- is_active
```

---

## 📨 Kafka Integration

### Topics

| Topic | Producer | Consumer | Purpose |
|-------|----------|----------|---------|
| `change-requests` | Change Request Service | External AI Engine | CR submitted for analysis |
| `ai.risk.completed` | External AI Engine | Change Request Service | Risk assessment results |
| `cr.risk_confirmed` | Change Request Service | Approval Service | Risk confirmed event |
| `approval-events` | Approval Service | (downstream) | Approval decisions |

### Event Formats

**ChangeRequestEvent:**
```json
{
  "crId": "uuid",
  "title": "Database Migration",
  "description": "...",
  "domain": "database",
  "changeType": "MIGRATION",
  "region": "us-east-1",
  "scheduledStart": "2026-06-01T10:00:00Z",
  "scheduledEnd": "2026-06-01T14:00:00Z",
  "rollbackAvailable": true,
  "businessJustification": "...",
  "requestedByUserId": "user-uuid",
  "durationMinutes": 240,
  "assets": [
    {
      "assetType": "database",
      "assetId": "mysql-01",
      "hostname": "db-prod-01.example.com"
    }
  ]
}
```

**RiskAssessmentEvent:**
```json
{
  "crId": "uuid",
  "riskScore": 65,
  "riskLevel": "HIGH",
  "blastRadius": "REGIONAL",
  "confidence": 0.92,
  "executiveSummary": "...",
  "technicalAnalysis": "...",
  "cabGuidance": "...",
  "recommendations": ["...", "..."],
  "riskIndicators": ["..."],
  "modelVersion": "v1.0"
}
```

---

## 🔐 Authentication

All service endpoints (except health checks) require JWT authentication.

### Authentication Flow

1. **Register/Login** → Auth Service returns JWT token
2. **Include JWT in requests** → `Authorization: Bearer <token>`
3. **JWT validation** → Automatic in all secured endpoints
4. **Role-based access** → Enforced at endpoint level

### JWT Details

- **Algorithm:** HS256
- **Secret:** Configured in application properties
- **Expiration:** 24 hours (86400000 ms)
- **Role mapping:** ENGINEER, APPROVER, ADMIN

### Role-Based Endpoint Access

| Endpoint | ENGINEER | APPROVER | ADMIN |
|----------|----------|----------|-------|
| POST /v1/change-requests | ✅ | ❌ | ✅ |
| POST /v1/change-requests/{id}/submit | ✅ | ❌ | ✅ |
| POST /v1/change-requests/{id}/confirm-risk | ✅ | ❌ | ✅ |
| GET /v1/approvals/pending | ❌ | ✅ | ✅ |
| POST /v1/approvals/{flowId}/approve | ❌ | ✅ | ✅ |
| POST /v1/approvals/{flowId}/reject | ❌ | ✅ | ✅ |

---

## 🔧 Configuration

All services use `application.yml` or `application.properties` for configuration:

```yaml
# Database
spring.datasource.url: jdbc:mysql://localhost:3306/icm_db
spring.datasource.username: root
spring.datasource.password: Contract@1968

# Kafka
spring.kafka.bootstrap-servers: localhost:9092
spring.kafka.producer.key-serializer: org.apache.kafka.common.serialization.StringSerializer
spring.kafka.consumer.group-id: <service-name>-group

# Server Port
server.port: <service-specific-port>

# JWT
jwt.secret: mySecretKey1234567890123456789012345678901234567890
jwt.expiration: 86400000
```

---

## 🐛 Troubleshooting

### Connection Issues

**MySQL not connecting:**
```bash
# Check if MySQL is running
docker ps | grep mysql

# Verify credentials
docker exec mysql-icm mysql -u root -pContract@1968 -e "SHOW DATABASES;"
```

**Kafka not responding:**
```bash
# Check Kafka is running
docker ps | grep kafka

# Check topic existence
docker exec kafka kafka-topics --bootstrap-server localhost:9092 --list
```

### Service Won't Start

1. **Check port is not in use:** `netstat -ano | findstr :9003` (Windows)
2. **Verify JDK installation:** `java -version`
3. **Check application logs** for specific error messages

### Database Errors

All services initialize schema automatically via `schema.sql`. If errors occur:
```bash
# Manually create database and grant permissions
mysql -u root -pContract@1968 -e "CREATE DATABASE IF NOT EXISTS icm_db;"
mysql -u root -pContract@1968 -e "GRANT ALL ON icm_db.* TO 'root'@'localhost';"
```

---

## 📚 Additional Resources

- See [APIs.md](./APIs.md) for detailed API reference
- Each service directory contains `src/main/resources/schema.sql` for table definitions
- Kafka topics and consumers configured in service `application.yml` files

