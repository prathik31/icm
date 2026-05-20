# Intelligent Change Management System - Complete LLD Documentation

**Version:** 1.0.0 (Production)  
**Last Updated:** May 11, 2026  
**Status:** Active Development with Kafka Integration & AI Processing  

---

## 📋 Table of Contents

1. [Project Overview](#project-overview)
2. [System Architecture & Data Flow](#system-architecture--data-flow)
3. [Technology Stack](#technology-stack)
4. [Prerequisites & System Setup](#prerequisites--system-setup)
5. [Project Folder Structure](#project-folder-structure)
6. [Database Schema & Tables](#database-schema--tables)
7. [Complete API Documentation](#complete-api-documentation)
8. [Kafka Event Contracts](#kafka-event-contracts)
9. [Data Models & DTOs](#data-models--dtos)
10. [Configuration Guide](#configuration-guide)
11. [Building & Deployment](#building--deployment)
12. [Microservice Startup Guide](#microservice-startup-guide)
13. [Integration Workflows](#integration-workflows)
14. [Troubleshooting & Debug](#troubleshooting--debug)

---

## 🏗️ Project Overview

**intelligent-change-management** is an enterprise-grade, microservices-based platform for managing infrastructure changes in telecom environments. It orchestrates change requests (CRs) from creation through AI-driven risk assessment to implementation.

### Key Features

✅ **Change Request Management** - Create, submit, track, and audit change requests  
✅ **AI Risk Assessment** - Async Kafka-based integration with Python AI engine  
✅ **Cross-Language Serialization** - Java ↔ Python event contracts with snake_case mapping  
✅ **Audit Trail** - Complete state transition logging for compliance  
✅ **Multi-Service Architecture** - Auth, approval, notifications, monitoring, runbooks  
✅ **API Gateway** - Central entry point with request routing and load balancing  
✅ **Production-Ready** - Error handling, logging, transaction management  

### Business Context

Change management is critical in telecom infrastructure. This system enables:
- **Risk Visibility** - AI analyzes changes before execution
- **Compliance** - Audit trail for regulatory requirements
- **Efficiency** - Automated risk assessment vs manual review
- **Reliability** - Rollback planning and asset tracking

---

## 🔄 System Architecture & Data Flow

### Complete Data Flow Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                            EXTERNAL CLIENTS                                 │
│                    (REST API Consumers, Dashboards)                         │
└────────────────────────────────┬────────────────────────────────────────────┘
                                 │ HTTPS / REST
                                 ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                          API GATEWAY (Port 9001)                            │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐  │
│  │ Request Validation │ Authentication │ Rate Limiting │ Routing       │  │
│  └────┬──────────────────────────────────────────────────┬─────────────┘  │
└───────┼──────────────────────────────────────────────────┼────────────────┘
        │                                                  │
        ▼                                                  ▼
┌──────────────────────────────────────────┐  ┌──────────────────────────────┐
│   AUTH SERVICE (Port 9003)               │  │ CHANGE REQUEST SERVICE       │
│ ┌──────────────────────────────────────┐ │  │ (Port 9004)                  │
│ │ • User Registration                  │ │  │                              │
│ │ • JWT Token Generation               │ │  │ ┌──────────────────────────┐│
│ │ • Token Validation                   │ │  │ │ ChangeRequestController ││
│ │                                      │ │  │ │ • Create CR (DRAFT)      ││
│ │ DTOs: RegisterRequest,              │ │  │ │ • Submit CR (SUBMITTED)  ││
│ │        LoginRequest, AuthResponse    │ │  │ │ • List CRs               ││
│ └──────────────────────────────────────┘ │  │ │ • Get CR details         ││
│                                          │  │ │ • Get Risk Assessment    ││
│ DB: users, auth_logs                    │  │ └──────────────────────────┘│
└──────────────────────────────────────────┘  │                              │
                                              │ ┌──────────────────────────┐│
                                              │ │ ChangeRequestService     ││
                                              │ │ (Business Logic)         ││
                                              │ │ • State transitions      ││
                                              │ │ • Kafka publishing       ││
                                              │ │ • Asset association      ││
                                              │ └────────┬─────────────────┘│
                                              │          │                   │
                                              │  ┌───────▼─────────────────┐│
                                              │  │ Kafka Producer          ││
                                              │  │ Topic: change-requests  ││
                                              │  └────────┬────────────────┘│
                                              │           │                  │
                                              │ ┌─────────▼──────────────┐│
                                              │ │ Kafka Consumer        ││
                                              │ │ Topic: ai.risk.xxx    ││
                                              │ │ Persists assessments  ││
                                              │ └──────────┬────────────┘│
                                              │            │              │
                                              │ ┌──────────▼────────────┐│
                                              │ │ Repositories:         ││
                                              │ │ • ChangeRequestRepo   ││
                                              │ │ • CrAssetRepository   ││
                                              │ │ • CrAssessmentRepo    ││
                                              │ │ • CrAuditLogRepository││
                                              │ └──────────┬────────────┘│
                                              │            │              │
                                              └────────────┼──────────────┘
                                                           │
                                                           ▼
                                           ┌───────────────────────────────┐
                                           │    MySQL Database             │
                                           │  (Port 3306)                  │
                                           │                               │
                                           │ Tables:                       │
                                           │ • change_requests             │
                                           │ • cr_assets                   │
                                           │ • cr_assessments              │
                                           │ • cr_audit_logs               │
                                           │ • users                       │
                                           └───────────────────────────────┘
                    │
                    │ Kafka Topic: change-requests
                    │ (ChangeRequestEvent as JSON)
                    ▼
┌────────────────────────────────────────────────────────┐
│  KAFKA BROKER (localhost:9092)                         │
│                                                        │
│  Topics:                                               │
│  • change-requests (Producer: Java)                    │
│  • ai.risk.completed (Consumer: Java)                 │
└────────────────────────┬───────────────────────────────┘
                         │
                         │ Listens to: change-requests
                         │ Publishes to: ai.risk.completed
                         ▼
        ┌────────────────────────────────────┐
        │  PYTHON AI ENGINE (External)       │
        │                                    │
        │ • Risk Scoring Algorithm           │
        │ • Grounding Evidence Collection    │
        │ • Recommendation Generation        │
        │ • Model Versioning                 │
        │                                    │
        │ Input: ChangeRequestEvent          │
        │ Output: RiskAssessmentEvent        │
        └────────────────────────────────────┘

Other Services (Parallel):
├─ APPROVAL SERVICE (9002)
├─ NOTIFICATION SERVICE (9007)
├─ MONITORING SERVICE (9006)
├─ RUNBOOK SERVICE (9008)
└─ AI GATEWAY SERVICE (9000)
```

### Step-by-Step Event Flow

1. **Client Creates CR** → `POST /api/change-requests` → CR saved as **DRAFT** (no Kafka event)
2. **Client Submits CR** → `PUT /api/change-requests/{id}/submit` → Status: **SUBMITTED** + **Publish Event**
3. **Event Published** → `ChangeRequestEvent` sent to Kafka topic `change-requests`
4. **Python AI Processes** → Consumes event from `change-requests`, analyzes CR
5. **AI Response Published** → `RiskAssessmentEvent` sent to Kafka topic `ai.risk.completed`
6. **Java Consumes Assessment** → `RiskAssessmentConsumer` receives event
7. **Persists Assessment** → Maps to `CrAssessment` entity, saves to MySQL
8. **Client Queries Result** → `GET /api/change-requests/{id}/assessment` → Returns assessment

---

## 🔧 Technology Stack

| Component | Version | Purpose | Config |
|-----------|---------|---------|--------|
| **Java** | 17 LTS | Runtime | JAVA_HOME env var |
| **Spring Boot** | 3.5.13 | Framework | pom.xml |
| **Spring Kafka** | 3.x | Messaging | application.yml |
| **Hibernate** | 6.6.45 | ORM/JPA | pom.xml, application.yml |
| **MySQL** | 8.0.45 | Database | jdbc:mysql://localhost:3306 |
| **Jackson** | 2.x | JSON Processing | @JsonNaming annotations |
| **Lombok** | 1.x | Code Generation | @Data, @Slf4j, @RequiredArgsConstructor |
| **Maven** | 3.9.x | Build Tool | mvnw.cmd (Windows), mvnw (Unix) |
| **Kafka** | Latest | Message Broker | localhost:9092 |
| **Log4j2** | 2.x | Logging | application.yml config |

---

## 📦 Prerequisites & System Setup

### 1.1 System Requirements Checklist

- [ ] **OS:** Windows 10/11, macOS 11+, or Linux (Ubuntu 20.04+)
- [ ] **RAM:** Minimum 8GB (16GB recommended)
- [ ] **Disk:** 50GB free space
- [ ] **Network:** Port access for 9000-9008 (services), 3306 (MySQL), 9092 (Kafka), 2181 (Zookeeper)

### 1.2 Java 17 Installation

**Windows (PowerShell):**
```powershell
# Option A: Using chocolatey
choco install openjdk17

# Option B: Download from Oracle
# https://www.oracle.com/java/technologies/javase/jdk17-archive-downloads.html
# Add to PATH: C:\Program Files\Java\jdk-17.x.x\bin

# Verify
java -version
# openjdk version "17.0.x"
```

**macOS (Homebrew):**
```bash
brew install openjdk@17
export JAVA_HOME=/usr/local/opt/openjdk@17/libexec/openjdk.jdk/Contents/Home
echo $JAVA_HOME  # Verify path
java -version
```

**Linux (Ubuntu):**
```bash
sudo apt update
sudo apt install openjdk-17-jdk
java -version
```

### 1.3 Maven Installation

**Windows:**
```powershell
# Using Chocolatey
choco install maven

# Or manually download: https://maven.apache.org/download.cgi
# Add to PATH: C:\Program Files\Apache\maven\bin
mvn -v  # Verify
```

**macOS:**
```bash
brew install maven
mvn -v  # Verify: Apache Maven 3.9.x
```

**Linux:**
```bash
sudo apt install maven
mvn -v
```

### 1.4 MySQL 8.0 Setup

**Windows (Docker - Recommended):**
```powershell
# Install Docker Desktop from https://www.docker.com/products/docker-desktop

# Run MySQL container
docker run --name mysql-intelligent-change `
  -e MYSQL_ROOT_PASSWORD=Contract@1968 `
  -e MYSQL_DATABASE=intelligent_change_management `
  -p 3306:3306 `
  -d mysql:8.0

# Verify
docker ps | findstr mysql
```

**macOS (Homebrew):**
```bash
brew install mysql@8.0
brew services start mysql@8.0
mysql_secure_installation
# Password: Contract@1968
```

**Linux (Ubuntu):**
```bash
sudo apt install mysql-server-8.0
sudo mysql_secure_installation
# Set root password: Contract@1968
```

**Verify MySQL Access:**
```bash
mysql -u root -p
# Password: Contract@1968

CREATE DATABASE IF NOT EXISTS intelligent_change_management;
USE intelligent_change_management;
SHOW TABLES;  # Should be empty initially
```

### 1.5 Kafka Setup (Docker Compose - Recommended)

**Create `docker-compose.yml`:**
```yaml
version: '3.8'

services:
  zookeeper:
    image: confluentinc/cp-zookeeper:7.5.0
    environment:
      ZOOKEEPER_CLIENT_PORT: 2181
      ZOOKEEPER_TICK_TIME: 2000
    ports:
      - "2181:2181"
    networks:
      - kafka-network

  kafka:
    image: confluentinc/cp-kafka:7.5.0
    depends_on:
      - zookeeper
    ports:
      - "9092:9092"
      - "9101:9101"
    environment:
      KAFKA_BROKER_ID: 1
      KAFKA_ZOOKEEPER_CONNECT: zookeeper:2181
      KAFKA_ADVERTISED_LISTENERS: PLAINTEXT://localhost:9092,PLAINTEXT_INTERNAL://kafka:29092
      KAFKA_LISTENER_SECURITY_PROTOCOL_MAP: PLAINTEXT:PLAINTEXT,PLAINTEXT_INTERNAL:PLAINTEXT
      KAFKA_INTER_BROKER_LISTENER_NAME: PLAINTEXT_INTERNAL
      KAFKA_OFFSETS_TOPIC_REPLICATION_FACTOR: 1
      KAFKA_AUTO_CREATE_TOPICS_ENABLE: 'true'
    networks:
      - kafka-network

networks:
  kafka-network:
    driver: bridge
```

**Start Kafka:**
```bash
docker-compose up -d

# Wait 10 seconds for Kafka to fully start
# Verify
docker ps | grep kafka
```

**Create Topics:**
```bash
# Change-requests topic (producer)
docker exec kafka kafka-topics \
  --bootstrap-server localhost:9092 \
  --create \
  --topic change-requests \
  --partitions 1 \
  --replication-factor 1

# AI risk completed topic (consumer)
docker exec kafka kafka-topics \
  --bootstrap-server localhost:9092 \
  --create \
  --topic ai.risk.completed \
  --partitions 1 \
  --replication-factor 1

# List topics to verify
docker exec kafka kafka-topics \
  --bootstrap-server localhost:9092 \
  --list
```

---

## 📁 Project Folder Structure

```
intelligent-change-management/                          [ROOT]
│
├── README.md                                            [THIS FILE]
│
├── agent/                                              [Agent/Automation]
│   └── (AI agent configurations)
│
├── ai-gateway-service/                                 [AI Gateway Service - Port 9000]
│   ├── ai-gateway-service/
│   │   ├── pom.xml
│   │   ├── mvnw, mvnw.cmd
│   │   ├── src/main/
│   │   │   ├── java/com/telecom/ai_gateway_service/
│   │   │   │   ├── AiGatewayServiceApplication.java   [@SpringBootApplication]
│   │   │   │   ├── controller/                        [REST Controllers]
│   │   │   │   ├── service/                           [Business Logic]
│   │   │   │   ├── dto/                               [DTOs]
│   │   │   │   └── entity/                            [JPA Entities]
│   │   │   └── resources/
│   │   │       ├── application.yml                    [Config: port 9000]
│   │   │       └── schema.sql
│   │   └── src/test/
│   └── target/                                        [Build Output]
│
├── api-gateway/                                        [API Gateway - Port 9001]
│   ├── api-gateway/
│   │   ├── pom.xml
│   │   ├── mvnw, mvnw.cmd
│   │   ├── src/main/
│   │   │   ├── java/com/telecom/api_gateway/
│   │   │   │   ├── ApiGatewayApplication.java        [@SpringBootApplication]
│   │   │   │   ├── config/                           [Gateway Config, Routes]
│   │   │   │   ├── filter/                           [Auth, Logging Filters]
│   │   │   │   ├── dto/
│   │   │   │   └── exception/
│   │   │   └── resources/
│   │   │       ├── application.yml                   [Config: port 9001, routes]
│   │   │       └── (route definitions)
│   │   └── src/test/
│   └── target/
│
├── approval-service/                                   [Approval Service - Port 9002]
│   ├── approval-service/
│   │   ├── pom.xml
│   │   ├── src/main/java/com/telecom/approval_service/
│   │   │   ├── ApprovalServiceApplication.java
│   │   │   ├── controller/                           [Approval endpoints]
│   │   │   ├── service/
│   │   │   ├── entity/
│   │   │   │   ├── Approval.java
│   │   │   │   └── ApprovalAudit.java
│   │   │   └── repository/
│   │   └── resources/
│   │       ├── application.yml                       [Config: port 9002]
│   │       └── schema.sql                            [Approval tables]
│   └── target/
│
├── auth-service/                                       [Auth Service - Port 9003]
│   ├── auth-service/
│   │   ├── pom.xml
│   │   ├── src/main/java/com/telecom/auth_service/
│   │   │   ├── AuthServiceApplication.java
│   │   │   ├── controller/
│   │   │   │   └── AuthController.java                [POST /auth/register, /auth/login]
│   │   │   ├── service/
│   │   │   │   └── AuthService.java
│   │   │   ├── config/
│   │   │   │   └── JwtUtil.java                      [JWT Token utility]
│   │   │   ├── dto/
│   │   │   │   ├── RegisterRequestDTO.java
│   │   │   │   ├── LoginRequestDTO.java
│   │   │   │   └── AuthResponseDTO.java
│   │   │   ├── entity/
│   │   │   │   └── User.java                         [@Entity table: users]
│   │   │   └── repository/
│   │   │       └── UserRepository.java
│   │   └── resources/
│   │       ├── application.yml                       [Config: port 9003, JWT settings]
│   │       └── schema.sql                            [Users table]
│   └── target/
│
├── change-request-service/                             [MAIN: Change Request Service - Port 9004]
│   ├── change-request-service/
│   │   ├── pom.xml                                    [Dependencies: spring-kafka, mysql, jpa]
│   │   ├── mvnw, mvnw.cmd
│   │   ├── src/main/
│   │   │   ├── java/com/telecom/change_request_service/
│   │   │   │   │
│   │   │   │   ├── ChangeRequestServiceApplication.java
│   │   │   │   │   └── @SpringBootApplication, starts Kafka consumer
│   │   │   │   │
│   │   │   │   ├── controller/
│   │   │   │   │   ├── ChangeRequestController.java
│   │   │   │   │   │   ├── POST   /api/change-requests
│   │   │   │   │   │   ├── GET    /api/change-requests
│   │   │   │   │   │   ├── GET    /api/change-requests/{id}
│   │   │   │   │   │   ├── PUT    /api/change-requests/{id}
│   │   │   │   │   │   ├── PUT    /api/change-requests/{id}/submit  [KAFKA PUBLISH]
│   │   │   │   │   │   └── GET    /api/change-requests/{id}/assessment
│   │   │   │   │   └── CrAuditLogController.java
│   │   │   │   │       └── GET    /api/audit-logs
│   │   │   │   │
│   │   │   │   ├── service/
│   │   │   │   │   ├── ChangeRequestService.java
│   │   │   │   │   │   ├── createChangeRequest()  [DRAFT status, no publish]
│   │   │   │   │   │   ├── submitChangeRequest()  [SUBMITTED status, PUBLISHES to Kafka]
│   │   │   │   │   │   ├── updateChangeRequest()
│   │   │   │   │   │   ├── getChangeRequest()
│   │   │   │   │   │   └── getChangeRequestAssessment()
│   │   │   │   │   └── (other services)
│   │   │   │   │
│   │   │   │   ├── kafka/
│   │   │   │   │   ├── ChangeRequestProducer.java
│   │   │   │   │   │   └── publishChangeRequest(ChangeRequestEvent)
│   │   │   │   │   │       ├── Topic: "change-requests"
│   │   │   │   │   │       └── Async with callback logging
│   │   │   │   │   │
│   │   │   │   │   └── RiskAssessmentConsumer.java
│   │   │   │   │       └── @KafkaListener(topics = "ai.risk.completed")
│   │   │   │   │           ├── Maps RiskAssessmentEvent → CrAssessment
│   │   │   │   │           └── Persists to MySQL cr_assessments table
│   │   │   │   │
│   │   │   │   ├── mapper/
│   │   │   │   │   └── ChangeRequestEventMapper.java
│   │   │   │   │       ├── toEvent(ChangeRequest)     [Entity → DTO]
│   │   │   │   │       ├── Computes durationMinutes
│   │   │   │   │       ├── Computes isWeekend
│   │   │   │   │       ├── Computes isPeakHours
│   │   │   │   │       └── Fetches assetIds from DB
│   │   │   │   │
│   │   │   │   ├── entity/
│   │   │   │   │   ├── ChangeRequest.java
│   │   │   │   │   │   └── @Table(name = "change_requests")
│   │   │   │   │   │       Columns: crId, title, description, domain, changeType, region,
│   │   │   │   │   │       status, scheduledStart, scheduledEnd, rollbackAvailable,
│   │   │   │   │   │       businessJustification, requestedByUserId, createdAt, updatedAt
│   │   │   │   │   │
│   │   │   │   │   ├── CrAsset.java
│   │   │   │   │   │   └── @Table(name = "cr_assets")
│   │   │   │   │   │       Columns: assetRowId, crId, assetType, assetId, hostname, createdAt
│   │   │   │   │   │
│   │   │   │   │   ├── CrAssessment.java
│   │   │   │   │   │   └── @Table(name = "cr_assessments")
│   │   │   │   │   │       Columns: assessmentId, crId, riskScore, riskLevel, blastRadius,
│   │   │   │   │   │       confidence, executiveSummary, technicalAnalysis, cabGuidance,
│   │   │   │   │   │       recommendationsJson, riskIndicatorsJson, modelVersion, assessedAt
│   │   │   │   │   │       Fields have @Column mappings for explicit ORM mapping
│   │   │   │   │   │
│   │   │   │   │   └── CrAuditLog.java
│   │   │   │   │       └── @Table(name = "cr_audit_logs")
│   │   │   │   │           Columns: logId, crId, actionType, oldStatus, newStatus,
│   │   │   │   │           actedByUserId, remarks, createdAt
│   │   │   │   │
│   │   │   │   ├── dto/
│   │   │   │   │   ├── event/
│   │   │   │   │   │   ├── ChangeRequestEvent.java
│   │   │   │   │   │   │   @JsonNaming(SnakeCaseStrategy) - for Python interop
│   │   │   │   │   │   │   Fields: cr_id, title, description, domain, change_type, region,
│   │   │   │   │   │   │   status, scheduled_start, scheduled_end, rollback_available,
│   │   │   │   │   │   │   business_justification, requested_by_user_id, asset_ids, asset_count,
│   │   │   │   │   │   │   duration_minutes, is_weekend, is_peak_hours, created_at, updated_at
│   │   │   │   │   │   │
│   │   │   │   │   │   └── RiskAssessmentEvent.java
│   │   │   │   │   │       @JsonNaming(SnakeCaseStrategy)
│   │   │   │   │   │       Fields: assessment_id, cr_id, risk_score, risk_level, blast_radius,
│   │   │   │   │   │       confidence, executive_summary, technical_analysis, cab_guidance,
│   │   │   │   │   │       recommendations[], risk_indicators[], grounding_evidence (nested),
│   │   │   │   │   │       model_metadata (nested), assessed_at
│   │   │   │   │   │
│   │   │   │   │   └── request/
│   │   │   │   │       ├── CreateChangeRequestRequest.java
│   │   │   │   │       ├── UpdateChangeRequestRequest.java
│   │   │   │   │       └── (other request DTOs)
│   │   │   │   │
│   │   │   │   ├── repository/
│   │   │   │   │   ├── ChangeRequestRepository.java
│   │   │   │   │   │   └── JpaRepository<ChangeRequest, String>
│   │   │   │   │   │
│   │   │   │   │   ├── CrAssetRepository.java
│   │   │   │   │   │   ├── JpaRepository<CrAsset, String>
│   │   │   │   │   │   └── findByCrId(String)  [Custom finder]
│   │   │   │   │   │
│   │   │   │   │   ├── CrAssessmentRepository.java
│   │   │   │   │   │   └── JpaRepository<CrAssessment, String>
│   │   │   │   │   │
│   │   │   │   │   └── CrAuditLogRepository.java
│   │   │   │   │       └── JpaRepository<CrAuditLog, String>
│   │   │   │   │
│   │   │   │   ├── enums/
│   │   │   │   │   └── BlastRadius.java
│   │   │   │   │       ├── LOCAL   (single device)
│   │   │   │   │       ├── MEDIUM  (region)
│   │   │   │   │       ├── HIGH    (multiple regions)
│   │   │   │   │       └── GLOBAL  (all infrastructure)
│   │   │   │   │
│   │   │   │   ├── exception/
│   │   │   │   │   └── (custom exception classes)
│   │   │   │   │
│   │   │   │   └── util/
│   │   │   │       └── (utility classes)
│   │   │   │
│   │   │   └── resources/
│   │   │       ├── application.yml                    [COMPREHENSIVE CONFIG]
│   │   │       │   ├── spring.datasource.*            (MySQL)
│   │   │       │   ├── spring.jpa.*                   (Hibernate)
│   │   │       │   ├── spring.kafka.*                 (Kafka producer/consumer)
│   │   │       │   ├── spring.sql.init.*              (DB initialization)
│   │   │       │   ├── server.port: 9004
│   │   │       │   ├── jwt.*                          (JWT settings)
│   │   │       │   └── app.kafka.*                    (topic names)
│   │   │       │
│   │   │       └── schema.sql                         [DDL: All 4 tables]
│   │   │           ├── CREATE TABLE change_requests
│   │   │           ├── CREATE TABLE cr_assets
│   │   │           ├── CREATE TABLE cr_assessments     [AI assessments]
│   │   │           └── CREATE TABLE cr_audit_logs
│   │   │
│   │   └── src/test/
│   │       └── (unit & integration tests)
│   │
│   └── target/                                        [Build output: JAR, classes]
│
├── common-lib/                                         [Shared Library - Port 9005]
│   ├── common-lib/
│   │   ├── pom.xml
│   │   ├── src/main/java/com/telecom/common_lib/
│   │   │   ├── CommonLibApplication.java
│   │   │   ├── dto/                                  [Shared DTOs]
│   │   │   ├── entity/                               [Shared entities]
│   │   │   ├── util/                                 [Common utilities]
│   │   │   └── exception/                            [Common exceptions]
│   │   └── resources/
│   │       ├── application.yml                       [Config: port 9005]
│   │       └── schema.sql
│   └── target/
│
├── contracts/                                          [API Contracts / Schemas]
│   └── (OpenAPI specs, message schemas, etc.)
│
├── messaging/                                          [Messaging Config]
│   └── (Kafka configs, message definitions)
│
├── monitoring-service/                                 [Monitoring Service - Port 9006]
│   ├── monitoring-service/
│   │   ├── pom.xml
│   │   ├── src/main/java/com/telecom/monitoring_service/
│   │   │   ├── MonitoringServiceApplication.java
│   │   │   ├── controller/                           [Monitoring endpoints]
│   │   │   ├── service/
│   │   │   ├── entity/                               [Metrics, alerts]
│   │   │   └── repository/
│   │   └── resources/
│   │       ├── application.yml                       [Config: port 9006]
│   │       └── schema.sql
│   └── target/
│
├── notification-service/                              [Notification Service - Port 9007]
│   ├── notification-service/
│   │   ├── pom.xml
│   │   ├── src/main/java/com/telecom/notification_service/
│   │   │   ├── NotificationServiceApplication.java
│   │   │   ├── controller/
│   │   │   ├── service/
│   │   │   │   └── NotificationService.java         [Email, SMS, Slack, etc.]
│   │   │   ├── entity/                              [Notification logs]
│   │   │   └── repository/
│   │   └── resources/
│   │       ├── application.yml                       [Config: port 9007]
│   │       └── schema.sql
│   └── target/
│
├── runbook-service/                                   [Runbook Service - Port 9008]
│   ├── runbook-service/
│   │   ├── pom.xml
│   │   ├── src/main/java/com/telecom/runbook_service/
│   │   │   ├── RunbookServiceApplication.java
│   │   │   ├── controller/                          [Runbook endpoints]
│   │   │   ├── service/
│   │   │   ├── entity/                              [Runbooks, procedures]
│   │   │   └── repository/
│   │   └── resources/
│   │       ├── application.yml                       [Config: port 9008]
│   │       └── schema.sql
│   └── target/
│
└── .gitignore                                         [Git ignore rules]
```

**Key Directory Purposes:**

| Directory | Purpose |
|-----------|---------|
| `change-request-service` | **MAIN MICROSERVICE** - CR management & Kafka integration |
| `auth-service` | User authentication & JWT tokens |
| `api-gateway` | Central request router & load balancer |
| `approval-service` | CR approval workflows |
| `notification-service` | Email, SMS, and alerts |
| `monitoring-service` | Health checks & metrics |
| `runbook-service` | Runbook management & execution |
| `common-lib` | Shared utilities & DTOs |
| `contracts` | API contract definitions |
| `messaging` | Kafka topic & event schemas |

---

## 🗄️ Database Schema & Tables

### Complete Database Setup

**Database:** `intelligent_change_management` (MySQL 8.0.45)

```sql
-- Create database
CREATE DATABASE IF NOT EXISTS intelligent_change_management
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE intelligent_change_management;
```

### Table 1: `change_requests` (Primary CR table)

```sql
CREATE TABLE IF NOT EXISTS change_requests (
    cr_id VARCHAR(255) PRIMARY KEY
        COMMENT 'Unique change request identifier (UUID or custom ID)',
    title VARCHAR(255) NOT NULL
        COMMENT 'CR title/summary',
    description TEXT
        COMMENT 'Detailed description of changes',
    domain VARCHAR(255)
        COMMENT 'Business domain: Network, Compute, Storage, Database',
    change_type VARCHAR(255)
        COMMENT 'Change type: Feature, Patch, Hotfix, Emergency, Config',
    region VARCHAR(255)
        COMMENT 'Geographic region: US-East-1, EU-West-1, APAC',
    status VARCHAR(50)
        COMMENT 'Status: DRAFT, SUBMITTED, APPROVED, REJECTED, COMPLETED, FAILED',
    scheduled_start DATETIME
        COMMENT 'Planned start time (ISO 8601)',
    scheduled_end DATETIME
        COMMENT 'Planned end time (ISO 8601)',
    rollback_available BOOLEAN
        COMMENT 'Whether rollback capability exists',
    business_justification TEXT
        COMMENT 'Business reason for change',
    requested_by_user_id VARCHAR(255)
        COMMENT 'User ID who created the CR',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        COMMENT 'Creation timestamp',
    updated_at DATETIME ON UPDATE CURRENT_TIMESTAMP
        COMMENT 'Last update timestamp',
    
    INDEX idx_status (status),
    INDEX idx_created_at (created_at),
    INDEX idx_region (region)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Stores all change requests';
```

**Field Details:**

| Field | Type | Nullable | Default | Description |
|-------|------|----------|---------|-------------|
| cr_id | VARCHAR(255) | No | - | Primary key; UUID or custom identifier |
| title | VARCHAR(255) | No | - | Short descriptive title (50-100 chars) |
| description | TEXT | Yes | NULL | Full details; supports markup |
| domain | VARCHAR(255) | Yes | NULL | e.g., "Network", "Database", "Compute" |
| change_type | VARCHAR(255) | Yes | NULL | e.g., "Feature", "Emergency", "Patch" |
| region | VARCHAR(255) | Yes | NULL | e.g., "US-East-1", "Global" |
| status | VARCHAR(50) | Yes | DRAFT | Workflow state; indexed for filtering |
| scheduled_start | DATETIME | Yes | NULL | Start time; must be future time |
| scheduled_end | DATETIME | Yes | NULL | End time; must be after start time |
| rollback_available | BOOLEAN | Yes | FALSE | Rollback capability flag |
| business_justification | TEXT | Yes | NULL | Why change is needed; compliance justification |
| requested_by_user_id | VARCHAR(255) | Yes | NULL | FK to users table (implicit) |
| created_at | DATETIME | No | NOW() | Auto-populated; immutable after insert |
| updated_at | DATETIME | No | NOW() | Auto-updated on every change |

### Table 2: `cr_assets` (Assets affected by CR)

```sql
CREATE TABLE IF NOT EXISTS cr_assets (
    asset_row_id VARCHAR(255) PRIMARY KEY
        COMMENT 'Unique row identifier (UUID)',
    cr_id VARCHAR(255) NOT NULL
        COMMENT 'Foreign key to change_requests.cr_id',
    asset_type VARCHAR(255)
        COMMENT 'Asset type: Server, Router, Switch, Database, LoadBalancer',
    asset_id VARCHAR(255)
        COMMENT 'Unique asset identifier/name',
    hostname VARCHAR(255)
        COMMENT 'Hostname (for servers)',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        COMMENT 'When asset was added to CR',
    
    FOREIGN KEY (cr_id) REFERENCES change_requests(cr_id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,
    INDEX idx_cr_id (cr_id),
    INDEX idx_asset_id (asset_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Infrastructure assets affected by CRs';
```

**Field Details:**

| Field | Type | Nullable | Key | Description |
|-------|------|----------|-----|-------------|
| asset_row_id | VARCHAR(255) | No | PK | UUID for each row |
| cr_id | VARCHAR(255) | No | FK | Links to change_requests |
| asset_type | VARCHAR(255) | Yes | - | Type classification |
| asset_id | VARCHAR(255) | Yes | IDX | Asset's unique identifier |
| hostname | VARCHAR(255) | Yes | - | FQDN or IP (for servers) |
| created_at | DATETIME | No | - | Row creation time |

**Example Data:**
```sql
INSERT INTO cr_assets (asset_row_id, cr_id, asset_type, asset_id, hostname)
VALUES 
('ASSET-001', 'CR-20260511-001', 'Server', 'server-db-01', 'prod-db-01.example.com'),
('ASSET-002', 'CR-20260511-001', 'Router', 'rtr-core-01', 'rtr-core.example.com');
```

### Table 3: `cr_assessments` (AI Risk Assessments)

```sql
CREATE TABLE IF NOT EXISTS cr_assessments (
    assessment_id VARCHAR(255) PRIMARY KEY
        COMMENT 'Unique assessment ID (generated by consumer)',
    cr_id VARCHAR(255) NOT NULL
        COMMENT 'Foreign key to change_requests.cr_id',
    risk_score DOUBLE
        COMMENT 'Normalized risk score (0.0 to 1.0)',
    risk_level VARCHAR(255)
        COMMENT 'Risk level: LOW, MEDIUM, HIGH, CRITICAL',
    blast_radius VARCHAR(50)
        COMMENT 'Impact scope: LOCAL, MEDIUM, HIGH, GLOBAL',
    confidence DOUBLE
        COMMENT 'Model confidence (0.0 to 1.0)',
    executive_summary TEXT
        COMMENT 'AI-generated summary for executives',
    technical_analysis TEXT
        COMMENT 'Detailed technical reasoning',
    cab_guidance TEXT
        COMMENT 'Guidance for Change Advisory Board',
    recommendations_json TEXT
        COMMENT 'JSON array of recommendations',
    risk_indicators_json TEXT
        COMMENT 'JSON array of risk factors',
    model_version VARCHAR(255)
        COMMENT 'AI model version used',
    assessed_at DATETIME
        COMMENT 'When assessment was generated',
    
    FOREIGN KEY (cr_id) REFERENCES change_requests(cr_id)
        ON DELETE CASCADE,
    INDEX idx_cr_id (cr_id),
    INDEX idx_risk_level (risk_level),
    INDEX idx_assessed_at (assessed_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='AI-generated risk assessments for CRs';
```

**Field Details:**

| Field | Type | Nullable | Description |
|-------|------|----------|-------------|
| assessment_id | VARCHAR(255) | No | UUID; generated by RiskAssessmentConsumer |
| cr_id | VARCHAR(255) | No | Foreign key to CR; indexed for fast lookup |
| risk_score | DOUBLE | Yes | 0.0=no risk, 1.0=critical; used for sorting |
| risk_level | VARCHAR(255) | Yes | Categorical: LOW, MEDIUM, HIGH, CRITICAL |
| blast_radius | VARCHAR(50) | Yes | Enum: LOCAL, MEDIUM, HIGH, GLOBAL |
| confidence | DOUBLE | Yes | Model's confidence (0.0 to 1.0); higher=more reliable |
| executive_summary | TEXT | Yes | Non-technical summary; use in dashboards |
| technical_analysis | TEXT | Yes | Detailed reasoning; for technical leads |
| cab_guidance | TEXT | Yes | Specific actions for CAB review |
| recommendations_json | TEXT | Yes | JSON-serialized List<String> |
| risk_indicators_json | TEXT | Yes | JSON-serialized List<String> |
| model_version | VARCHAR(255) | Yes | e.g., "xgboost-hybrid-v3"; for audit |
| assessed_at | DATETIME | Yes | Timestamp of assessment generation |

**Example JSON Fields:**
```json
// recommendations_json
["Implement gradual rollout (50% → 100% over 2hrs)",
 "Monitor error rates and latency during window",
 "Have instant rollback plan ready"]

// risk_indicators_json
["Affects critical transaction path (85% of volume)",
 "Large dataset (250GB+)",
 "3 external service dependencies"]
```

### Table 4: `cr_audit_logs` (Audit Trail)

```sql
CREATE TABLE IF NOT EXISTS cr_audit_logs (
    log_id VARCHAR(255) PRIMARY KEY
        COMMENT 'Unique log entry ID (UUID)',
    cr_id VARCHAR(255) NOT NULL
        COMMENT 'Foreign key to change_requests.cr_id',
    action_type VARCHAR(255)
        COMMENT 'Action: CREATE, SUBMIT, APPROVE, REJECT, COMPLETE, CANCEL',
    old_status VARCHAR(50)
        COMMENT 'Status before action',
    new_status VARCHAR(50)
        COMMENT 'Status after action',
    acted_by_user_id VARCHAR(255)
        COMMENT 'User who performed the action',
    remarks TEXT
        COMMENT 'Additional notes/comments',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        COMMENT 'When action was logged',
    
    FOREIGN KEY (cr_id) REFERENCES change_requests(cr_id)
        ON DELETE CASCADE,
    INDEX idx_cr_id (cr_id),
    INDEX idx_action_type (action_type),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Audit trail of all CR state transitions';
```

**Field Details:**

| Field | Type | Nullable | Description |
|-------|------|----------|-------------|
| log_id | VARCHAR(255) | No | UUID for each log entry |
| cr_id | VARCHAR(255) | No | Links to CR; indexed for audit trails |
| action_type | VARCHAR(255) | Yes | What action was performed; used for filtering |
| old_status | VARCHAR(50) | Yes | Status before the action |
| new_status | VARCHAR(50) | Yes | Status after the action |
| acted_by_user_id | VARCHAR(255) | Yes | User/service account; for accountability |
| remarks | TEXT | Yes | Optional explanation |
| created_at | DATETIME | No | Auto-populated; immutable |

---

## 📡 Complete API Documentation

### Base URL
```
http://localhost:9004/api
```

### Authentication
All endpoints (except health check) require JWT Bearer token:
```
Authorization: Bearer <JWT_TOKEN>
```

**Obtain JWT Token:**
```bash
curl -X POST http://localhost:9003/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "securePassword123"
  }'

# Response: {"token": "eyJhbGciOiJIUzI1NiIs..."}
```

---

### API Endpoint 1: Create Change Request

**Endpoint:** `POST /api/change-requests`

**Description:**  
Creates a new change request in **DRAFT** status. The CR is not published to Kafka at this stage — it's only persisted to the database. Assets can be included in the request body.

**Authentication:** Required (role: ENGINEER)

**Request Headers:**
```
Content-Type: application/json
Authorization: Bearer <JWT_TOKEN>
```

**Request Body:**
```json
{
  "title": "Database Migration to MySQL 8.0",
  "description": "Migrate production database from MySQL 5.7 to 8.0 with zero downtime. Involves:\n- Primary DB failover\n- Replica setup\n- Schema validation\n- Performance tuning",
  "domain": "Database",
  "changeType": "Feature",
  "region": "US-East-1",
  "scheduledStart": "2026-06-01T02:00:00Z",
  "scheduledEnd": "2026-06-01T06:00:00Z",
  "rollbackAvailable": true,
  "businessJustification": "MySQL 8.0 provides 30% performance improvement, enhanced security features (caching, encryption), and compliance with SOC2 audit requirements",
  "assets": [
    {
      "assetType": "Server",
      "assetId": "prod-db-01",
      "hostname": "prod-db-primary.example.com"
    },
    {
      "assetType": "Server",
      "assetId": "prod-db-02",
      "hostname": "prod-db-replica.example.com"
    },
    {
      "assetType": "LoadBalancer",
      "assetId": "lb-db-east",
      "hostname": "lb-db.example.com"
    }
  ]
}
```

**Field Definitions:**

| Field | Type | Required | Max Length | Example | Notes |
|-------|------|----------|-----------|---------|-------|
| title | String | Yes | 255 | "Database Migration to MySQL 8.0" | Descriptive; displayed in dashboards |
| description | String | Yes | 65535 | "Migrate production database..." | Full details; supports markdown |
| domain | String | Yes | 255 | "Database", "Network", "Compute" | Business unit classification |
| changeType | String | Yes | 255 | "Feature", "Patch", "Hotfix", "Emergency" | Nature of change |
| region | String | Yes | 255 | "US-East-1", "Global" | Geographic scope |
| scheduledStart | ISO 8601 DateTime | Yes | - | "2026-06-01T02:00:00Z" | Must be future date |
| scheduledEnd | ISO 8601 DateTime | Yes | - | "2026-06-01T06:00:00Z" | Must be > scheduledStart |
| rollbackAvailable | Boolean | Yes | - | true, false | Whether rollback plan exists |
| businessJustification | String | Yes | 65535 | "Security fix for CVE..." | Why change is needed |
| assets | Array | No | - | [{ assetType, assetId, hostname }] | Infrastructure affected |

**Response (Success 201 Created):**
```json
{
  "crId": "CR-20260511-001",
  "title": "Database Migration to MySQL 8.0",
  "description": "Migrate production database from MySQL 5.7 to 8.0 with zero downtime...",
  "domain": "Database",
  "changeType": "Feature",
  "region": "US-East-1",
  "status": "DRAFT",
  "scheduledStart": "2026-06-01T02:00:00Z",
  "scheduledEnd": "2026-06-01T06:00:00Z",
  "rollbackAvailable": true,
  "businessJustification": "MySQL 8.0 provides 30% performance improvement...",
  "requestedByUserId": "user-123",
  "createdAt": "2026-05-11T12:30:00Z",
  "updatedAt": "2026-05-11T12:30:00Z",
  "assets": [
    {
      "assetRowId": "ASSET-001",
      "crId": "CR-20260511-001",
      "assetType": "Server",
      "assetId": "prod-db-01",
      "hostname": "prod-db-primary.example.com",
      "createdAt": "2026-05-11T12:30:00Z"
    },
    {
      "assetRowId": "ASSET-002",
      "crId": "CR-20260511-001",
      "assetType": "Server",
      "assetId": "prod-db-02",
      "hostname": "prod-db-replica.example.com",
      "createdAt": "2026-05-11T12:30:00Z"
    },
    {
      "assetRowId": "ASSET-003",
      "crId": "CR-20260511-001",
      "assetType": "LoadBalancer",
      "assetId": "lb-db-east",
      "hostname": "lb-db.example.com",
      "createdAt": "2026-05-11T12:30:00Z"
    }
  ]
}
```

**Response (Error 400 Bad Request):**
```json
{
  "error": "VALIDATION_ERROR",
  "message": "scheduledEnd must be after scheduledStart",
  "details": {
    "field": "scheduledEnd",
    "value": "2026-06-01T01:00:00Z",
    "reason": "End time is before start time"
  },
  "timestamp": "2026-05-11T12:30:00Z"
}
```

**Response (Error 401 Unauthorized):**
```json
{
  "error": "UNAUTHORIZED",
  "message": "Invalid or expired token",
  "timestamp": "2026-05-11T12:31:00Z"
}
```

**Response (Error 403 Forbidden):**
```json
{
  "error": "FORBIDDEN",
  "message": "User role 'VIEWER' is not authorized to create CRs. Required: ENGINEER",
  "timestamp": "2026-05-11T12:31:00Z"
}
```

---

### API Endpoint 2: Get Change Request

**Endpoint:** `GET /api/change-requests/{crId}`

**Description:**  
Retrieves a specific CR with all details including assets but NOT the assessment (use separate endpoint for assessment).

**Path Parameters:**
```
crId: String (required) - Change request ID (e.g., "CR-20260511-001")
```

**Example Request:**
```bash
curl -X GET http://localhost:9004/api/change-requests/CR-20260511-001 \
  -H "Authorization: Bearer <JWT_TOKEN>"
```

**Response (Success 200 OK):**
```json
{
  "crId": "CR-20260511-001",
  "title": "Database Migration to MySQL 8.0",
  "description": "Migrate production database from MySQL 5.7 to 8.0 with zero downtime...",
  "domain": "Database",
  "changeType": "Feature",
  "region": "US-East-1",
  "status": "DRAFT",
  "scheduledStart": "2026-06-01T02:00:00Z",
  "scheduledEnd": "2026-06-01T06:00:00Z",
  "rollbackAvailable": true,
  "businessJustification": "MySQL 8.0 provides 30% performance improvement...",
  "requestedByUserId": "user-123",
  "createdAt": "2026-05-11T12:30:00Z",
  "updatedAt": "2026-05-11T12:30:00Z",
  "assets": [
    {
      "assetRowId": "ASSET-001",
      "crId": "CR-20260511-001",
      "assetType": "Server",
      "assetId": "prod-db-01",
      "hostname": "prod-db-primary.example.com"
    }
  ]
}
```

**Response (Error 404 Not Found):**
```json
{
  "error": "NOT_FOUND",
  "message": "Change request 'CR-NONEXISTENT' not found",
  "timestamp": "2026-05-11T12:31:00Z"
}
```

---

### API Endpoint 3: List Change Requests

**Endpoint:** `GET /api/change-requests`

**Description:**  
Retrieves paginated list of all CRs with optional filtering and sorting.

**Query Parameters:**

| Parameter | Type | Default | Required | Description | Example |
|-----------|------|---------|----------|-------------|---------|
| page | Integer | 0 | No | Page number (0-indexed) | ?page=0 |
| size | Integer | 20 | No | Items per page (max 100) | ?size=10 |
| status | String | - | No | Filter by status | ?status=SUBMITTED |
| domain | String | - | No | Filter by domain | ?domain=Database |
| sortBy | String | createdAt | No | Sort field | ?sortBy=createdAt |
| sortOrder | String | DESC | No | ASC or DESC | ?sortOrder=DESC |

**Example Requests:**
```bash
# Get page 0 with 10 items, filtering by SUBMITTED status
curl -X GET "http://localhost:9004/api/change-requests?page=0&size=10&status=SUBMITTED&sortOrder=DESC" \
  -H "Authorization: Bearer <JWT_TOKEN>"

# Get all Database domain CRs, sorted by risk score
curl -X GET "http://localhost:9004/api/change-requests?domain=Database&sortBy=riskScore" \
  -H "Authorization: Bearer <JWT_TOKEN>"
```

**Response (Success 200 OK):**
```json
{
  "content": [
    {
      "crId": "CR-20260511-002",
      "title": "Network Switch Firmware Upgrade",
      "status": "SUBMITTED",
      "domain": "Network",
      "region": "US-East-1",
      "createdAt": "2026-05-11T11:00:00Z"
    },
    {
      "crId": "CR-20260511-001",
      "title": "Database Migration to MySQL 8.0",
      "status": "SUBMITTED",
      "domain": "Database",
      "region": "US-East-1",
      "createdAt": "2026-05-11T12:30:00Z"
    }
  ],
  "pageNumber": 0,
  "pageSize": 10,
  "totalElements": 45,
  "totalPages": 5,
  "isFirstPage": true,
  "isLastPage": false
}
```

---

### API Endpoint 4: Update Change Request

**Endpoint:** `PUT /api/change-requests/{crId}`

**Description:**  
Updates CR details. Only allowed when CR is in **DRAFT** status. Once submitted, CR cannot be edited (new version must be created).

**Authentication:** Required (role: ENGINEER)

**Request Body (all fields optional):**
```json
{
  "title": "Database Migration to MySQL 8.0 (Updated Schedule)",
  "description": "Updated description with new testing procedures...",
  "scheduledStart": "2026-06-02T02:00:00Z",
  "scheduledEnd": "2026-06-02T06:00:00Z",
  "rollbackAvailable": true,
  "businessJustification": "Updated justification..."
}
```

**Response (Success 200 OK):**
```json
{
  "crId": "CR-20260511-001",
  "title": "Database Migration to MySQL 8.0 (Updated Schedule)",
  "status": "DRAFT",
  "updatedAt": "2026-05-11T12:35:00Z"
}
```

**Response (Error 409 Conflict):**
```json
{
  "error": "CONFLICT",
  "message": "Cannot update CR in 'SUBMITTED' status. Status must be DRAFT to edit.",
  "currentStatus": "SUBMITTED",
  "timestamp": "2026-05-11T12:36:00Z"
}
```

---

### API Endpoint 5: Submit Change Request (KAFKA PUBLISH)

**Endpoint:** `PUT /api/change-requests/{crId}/submit`

**Description:**  
**CRITICAL ENDPOINT:** Submits CR for approval and **publishes a `ChangeRequestEvent` to Kafka topic `change-requests`**. This is the gate for AI processing — nothing is published until CR is SUBMITTED.

**Authentication:** Required (role: ENGINEER)

**Request Body:**
```json
{
  "remarks": "Ready for CAB review and AI risk assessment"
}
```

**Process:**
1. Validate CR exists and is in DRAFT status
2. Change status to SUBMITTED
3. **Publish `ChangeRequestEvent` to Kafka topic `change-requests`**
4. Log audit entry
5. Return confirmation

**Kafka Event Published:**
```json
{
  "cr_id": "CR-20260511-001",
  "title": "Database Migration to MySQL 8.0",
  "description": "Migrate production database from MySQL 5.7 to 8.0...",
  "domain": "Database",
  "change_type": "Feature",
  "region": "US-East-1",
  "status": "SUBMITTED",
  "scheduled_start": "2026-06-01T02:00:00Z",
  "scheduled_end": "2026-06-01T06:00:00Z",
  "rollback_available": true,
  "business_justification": "MySQL 8.0 provides 30% performance improvement...",
  "requested_by_user_id": "user-123",
  "asset_ids": ["prod-db-01", "prod-db-02", "lb-db-east"],
  "asset_count": 3,
  "duration_minutes": 240,
  "is_weekend": false,
  "is_peak_hours": false,
  "created_at": "2026-05-11T12:30:00Z",
  "updated_at": "2026-05-11T12:40:00Z"
}
```

**Response (Success 200 OK):**
```json
{
  "crId": "CR-20260511-001",
  "status": "SUBMITTED",
  "updatedAt": "2026-05-11T12:40:00Z",
  "message": "CR submitted successfully. Event published to Kafka for AI processing. Assessment will be available shortly.",
  "kafkaMessageId": "change-requests-partition-0-offset-42"
}
```

**Response (Error 400 Bad Request):**
```json
{
  "error": "INVALID_STATE",
  "message": "Cannot submit CR that is not in DRAFT status",
  "currentStatus": "SUBMITTED",
  "timestamp": "2026-05-11T12:41:00Z"
}
```

---

### API Endpoint 6: Get CR Risk Assessment (AI Results)

**Endpoint:** `GET /api/change-requests/{crId}/assessment`

**Description:**  
Retrieves AI risk assessment results for a CR. Results are populated **asynchronously** after Python AI consumer processes the Kafka event. If assessment is not yet available, returns pending status.

**Authentication:** Required

**Example Request:**
```bash
curl -X GET http://localhost:9004/api/change-requests/CR-20260511-001/assessment \
  -H "Authorization: Bearer <JWT_TOKEN>"
```

**Response (Success 200 OK - Assessment Available):**
```json
{
  "assessmentId": "ASSESS-20260511-001",
  "crId": "CR-20260511-001",
  "riskScore": 0.72,
  "riskLevel": "HIGH",
  "blastRadius": "HIGH",
  "confidence": 0.89,
  "executiveSummary": "Database migration to MySQL 8.0 poses elevated risk due to large data volume (250GB+) and critical transaction path involvement. The change affects 85% of daily transaction volume. However, comprehensive testing and staged rollout approach mitigate risk. Recommend proceeding with enhanced monitoring.",
  "technicalAnalysis": "Analysis of similar changes identified 3 critical dependencies requiring pre-migration validation:\n1. Replication lag during sync may cause brief transaction delays (< 100ms)\n2. Schema changes are backward compatible; rollback complexity is moderate\n3. Performance testing shows 30% improvement in query latency post-migration\n\nRisk factors:\n- Large dataset replication time (estimated 4 hours)\n- 2 external service dependencies with API integrations\n- Peak transaction hours overlap (02:00 UTC = 10 PM EST business hours)\n\nMitigation:\n- Parallel environment for 24 hours post-migration\n- Automated rollback triggers on error rates > 1%\n- Pre-cutover failover test on replica",
  "cabGuidance": "1. Ensure DBA team availability throughout 4-hour window\n2. Test failover procedures on replica 24 hours before cutover\n3. Consider running parallel environment for 24-48 hours\n4. Brief notify dependent teams (Finance, Analytics, Operations) of potential latency\n5. Have instant rollback plan validated and tested\n6. Schedule 30-minute post-migration data consistency check",
  "recommendations": [
    "Implement gradual rollout in waves: Stage 1 (50% → 75%) over 1 hour, Stage 2 (75% → 100%) over 1 hour",
    "Monitor replication lag and transaction latency continuously during migration",
    "Have instant rollback plan validated and ready; test on duplicate environment first",
    "Conduct post-migration data consistency checks within 30 minutes",
    "Schedule follow-up performance analysis 24 hours post-migration",
    "Document rollback procedures and success criteria"
  ],
  "riskIndicators": [
    "Change affects critical transaction path (85% of daily volume)",
    "Large dataset involved (250GB+)",
    "3 external service dependencies with API integrations",
    "Scheduled during business hours in EST timezone",
    "Requires 4-hour maintenance window",
    "Replication setup complexity (2-phase commit)"
  ],
  "groundingEvidence": {
    "similarChangesAnalyzed": 12,
    "similarChangesWithOutages": 2,
    "similarChangesWithRollbacks": 1,
    "similarChangesFailed": 0
  },
  "modelMetadata": {
    "predictionEngine": "xgboost-hybrid-intelligence-v3",
    "reasoningEngine": "causal-impact-v2",
    "groundingEnabled": true
  },
  "assessedAt": "2026-05-11T12:42:00Z"
}
```

**Response (Success 200 OK - Assessment Pending):**
```json
{
  "assessmentId": null,
  "crId": "CR-20260511-001",
  "status": "PENDING",
  "message": "AI assessment is being processed. Check back in 30-60 seconds.",
  "estimatedCompletionTime": "2026-05-11T12:45:00Z"
}
```

**Response (Error 404 Not Found):**
```json
{
  "error": "NOT_FOUND",
  "message": "Change request 'CR-20260511-001' not found",
  "timestamp": "2026-05-11T12:43:00Z"
}
```

---

### API Endpoint 7: Get Audit Logs

**Endpoint:** `GET /api/audit-logs`

**Description:**  
Retrieves audit trail of all CR state transitions and actions. Useful for compliance and debugging.

**Query Parameters:**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| crId | String | - | Filter by CR ID |
| actionType | String | - | Filter by action (CREATE, SUBMIT, APPROVE, REJECT) |
| page | Integer | 0 | Page number |
| size | Integer | 20 | Items per page |
| sortOrder | String | DESC | ASC or DESC |

**Example Requests:**
```bash
# Get all actions for a specific CR
curl -X GET "http://localhost:9004/api/audit-logs?crId=CR-20260511-001&sortOrder=DESC" \
  -H "Authorization: Bearer <JWT_TOKEN>"

# Get all SUBMIT actions
curl -X GET "http://localhost:9004/api/audit-logs?actionType=SUBMIT" \
  -H "Authorization: Bearer <JWT_TOKEN>"
```

**Response (Success 200 OK):**
```json
{
  "content": [
    {
      "logId": "LOG-001",
      "crId": "CR-20260511-001",
      "actionType": "SUBMIT",
      "oldStatus": "DRAFT",
      "newStatus": "SUBMITTED",
      "actedByUserId": "user-123",
      "remarks": "Ready for CAB review and AI risk assessment",
      "createdAt": "2026-05-11T12:40:00Z"
    },
    {
      "logId": "LOG-002",
      "crId": "CR-20260511-001",
      "actionType": "CREATE",
      "oldStatus": null,
      "newStatus": "DRAFT",
      "actedByUserId": "user-123",
      "remarks": "CR created in DRAFT status",
      "createdAt": "2026-05-11T12:30:00Z"
    }
  ],
  "pageNumber": 0,
  "pageSize": 20,
  "totalElements": 2
}
```

---

### API Endpoint 8: Health Check (No Auth Required)

**Endpoint:** `GET /api/health`

**Description:**  
Health check endpoint. No authentication required. Used for monitoring and load balancer health checks.

**Response (Success 200 OK):**
```json
{
  "status": "UP",
  "timestamp": "2026-05-11T12:44:00Z",
  "components": {
    "db": "UP",
    "kafka": "UP",
    "diskSpace": "UP"
  }
}
```

---

## 🔗 Kafka Event Contracts

### Topic 1: `change-requests` (Producer)

**Direction:** Java (Producer) → Kafka → Python (Consumer)

**Publishing Trigger:** Only when CR transitions to **SUBMITTED** status

**Message Format (JSON - sent as string):**
```json
{
  "cr_id": "CR-20260511-001",
  "title": "Database Migration to MySQL 8.0",
  "description": "Migrate production database from MySQL 5.7 to 8.0 with zero downtime",
  "domain": "Database",
  "change_type": "Feature",
  "region": "US-East-1",
  "status": "SUBMITTED",
  "scheduled_start": "2026-06-01T02:00:00Z",
  "scheduled_end": "2026-06-01T06:00:00Z",
  "rollback_available": true,
  "business_justification": "MySQL 8.0 provides improved performance, security, and compliance features",
  "requested_by_user_id": "user-123",
  "asset_ids": ["server-01", "server-02", "db-primary"],
  "asset_count": 3,
  "duration_minutes": 240,
  "is_weekend": false,
  "is_peak_hours": false,
  "created_at": "2026-05-11T12:30:00Z",
  "updated_at": "2026-05-11T12:40:00Z"
}
```

**Serialization:**
- **Key:** `cr_id` (String)
- **Value:** JSON (ChangeRequestEvent)
- **Format:** UTF-8 JSON string

**Java DTO Class:**
```
com.telecom.change_request_service.dto.event.ChangeRequestEvent
```

**Naming Convention:**
- camelCase in Java → snake_case in JSON (via `@JsonNaming(PropertyNamingStrategies.SnakeCaseStrategy.class)`)

**Field Mapping Reference:**

| Java Field | JSON Field | Type | Computed | Example |
|-----------|-----------|------|----------|---------|
| crId | cr_id | String | No | "CR-20260511-001" |
| title | title | String | No | "Database Migration..." |
| description | description | String | No | "Detailed description..." |
| domain | domain | String | No | "Database" |
| changeType | change_type | String | No | "Feature" |
| region | region | String | No | "US-East-1" |
| status | status | String | No | "SUBMITTED" |
| scheduledStart | scheduled_start | ISO DateTime | No | "2026-06-01T02:00:00Z" |
| scheduledEnd | scheduled_end | ISO DateTime | No | "2026-06-01T06:00:00Z" |
| rollbackAvailable | rollback_available | Boolean | No | true |
| businessJustification | business_justification | String | No | "Security fix..." |
| requestedByUserId | requested_by_user_id | String | No | "user-123" |
| assetIds | asset_ids | String[] | Yes | ["server-01", "server-02"] |
| assetCount | asset_count | Integer | Yes | 3 |
| durationMinutes | duration_minutes | Integer | Yes | 240 |
| isWeekend | is_weekend | Boolean | Yes | false |
| isPeakHours | is_peak_hours | Boolean | Yes | false |
| createdAt | created_at | ISO DateTime | No | "2026-05-11T12:30:00Z" |
| updatedAt | updated_at | ISO DateTime | No | "2026-05-11T12:40:00Z" |

**Computed Fields (calculated by ChangeRequestEventMapper):**
- **durationMinutes:** `ChronoUnit.MINUTES.between(scheduledStart, scheduledEnd)`
- **isWeekend:** `DayOfWeek.SATURDAY or SUNDAY`
- **isPeakHours:** `hour >= 14 and hour <= 20` (2 PM to 8 PM UTC)
- **assetIds:** Fetched from `cr_assets` table via `CrAssetRepository.findByCrId()`
- **assetCount:** Length of assetIds list

---

### Topic 2: `ai.risk.completed` (Consumer)

**Direction:** Python (Producer) → Kafka → Java (Consumer)

**Listening Consumer:** `RiskAssessmentConsumer` (always listening 24/7)

**Message Format (JSON - received as string):**
```json
{
  "assessment_id": "ASSESS-20260511-001",
  "cr_id": "CR-20260511-001",
  "risk_score": 0.72,
  "risk_level": "HIGH",
  "blast_radius": "HIGH",
  "confidence": 0.89,
  "executive_summary": "Database migration poses elevated risk due to large data volume and critical transaction path involvement. Recommend staged rollout with monitoring.",
  "technical_analysis": "Analysis identified 3 critical dependencies requiring pre-migration validation. Table replication lag during sync may cause brief transaction delays. Schema changes are backward compatible but rollback complexity is moderate.",
  "cab_guidance": "1. Ensure DBA team availability during execution. 2. Test failover procedures before window. 3. Consider running parallel environment for 24 hours. 4. Notify dependent teams of potential latency.",
  "recommendations": [
    "Implement gradual rollout in waves (50% → 100% over 2 hours)",
    "Monitor replication lag and transaction latency during migration",
    "Have instant rollback plan validated and ready",
    "Conduct post-migration data consistency checks",
    "Schedule follow-up performance analysis 24 hours post-migration"
  ],
  "risk_indicators": [
    "Change affects critical transaction path (85% of daily volume)",
    "Large dataset involved (250GB+)",
    "3 external service dependencies with API integrations",
    "Scheduled during business hours risk window"
  ],
  "grounding_evidence": {
    "similar_changes_analyzed": 12,
    "similar_changes_with_outages": 2,
    "similar_changes_with_rollbacks": 1,
    "similar_changes_failed": 0
  },
  "model_metadata": {
    "prediction_engine": "xgboost-hybrid-intelligence-v3",
    "reasoning_engine": "causal-impact-v2",
    "grounding_enabled": true
  },
  "assessed_at": "2026-05-11T12:42:00Z"
}
```

**Java DTO Class:**
```
com.telecom.change_request_service.dto.event.RiskAssessmentEvent
```

**Nested Classes:**

**GroundingEvidence:**
```java
@Data
@JsonNaming(PropertyNamingStrategies.SnakeCaseStrategy.class)
public static class GroundingEvidence {
    private Integer similarChangesAnalyzed;
    private Integer similarChangesWithOutages;
    private Integer similarChangesWithRollbacks;
    private Integer similarChangesFailed;
}
```

**ModelMetadata:**
```java
@Data
@JsonNaming(PropertyNamingStrategies.SnakeCaseStrategy.class)
public static class ModelMetadata {
    private String predictionEngine;
    private String reasoningEngine;
    private Boolean groundingEnabled;
}
```

**Field Mapping & Persistence:**

| JSON Field | Java Field | Persisted As | DB Column | Type |
|-----------|-----------|--------------|-----------|------|
| assessment_id | assessmentId | assessmentId | assessment_id | VARCHAR(255) |
| cr_id | crId | crId | cr_id | VARCHAR(255) |
| risk_score | riskScore | riskScore | risk_score | DOUBLE |
| risk_level | riskLevel | riskLevel | risk_level | VARCHAR(255) |
| blast_radius | blastRadius | blastRadius (enum) | blast_radius | VARCHAR(50) |
| confidence | confidence | confidence | confidence | DOUBLE |
| executive_summary | executiveSummary | executiveSummary | executive_summary | TEXT |
| technical_analysis | technicalAnalysis | technicalAnalysis | technical_analysis | TEXT |
| cab_guidance | cabGuidance | cabGuidance | cab_guidance | TEXT |
| recommendations | recommendations | recommendationsJson (serialized) | recommendations_json | TEXT |
| risk_indicators | riskIndicators | riskIndicatorsJson (serialized) | risk_indicators_json | TEXT |
| grounding_evidence | groundingEvidence | (not persisted) | - | - |
| model_metadata | modelMetadata | modelMetadata.predictionEngine → modelVersion | model_version | VARCHAR(255) |
| assessed_at | assessedAt | assessedAt | assessed_at | DATETIME |

**Consumer Processing (Java):**
```java
@KafkaListener(topics = "ai.risk.completed", groupId = "change-request-service")
public void consume(RiskAssessmentEvent event) {
    // 1. Deserialize JSON → RiskAssessmentEvent
    // 2. Map to CrAssessment entity
    // 3. Handle enum conversion: BlastRadius.valueOf(event.getBlastRadius())
    // 4. Serialize arrays to JSON: recommendations → recommendationsJson
    // 5. Extract modelVersion from modelMetadata
    // 6. Persist to MySQL cr_assessments table
}
```

---

## 📊 Data Models & DTOs

### DTO: ChangeRequestEvent (Producer/Outgoing)

**File:** `src/main/java/com/telecom/change_request_service/dto/event/ChangeRequestEvent.java`

**Purpose:** Published to Kafka topic `change-requests`

**Annotations:**
```java
@Data
@NoArgsConstructor
@AllArgsConstructor
@JsonNaming(PropertyNamingStrategies.SnakeCaseStrategy.class)
```

**Complete Field Definition:**
```java
public class ChangeRequestEvent {
    // Core CR fields
    private String crId;                      // cr_id in JSON
    private String title;
    private String description;
    private String domain;
    private String changeType;                // change_type in JSON
    private String region;
    private String status;
    
    // Schedule fields
    private LocalDateTime scheduledStart;     // scheduled_start in JSON
    private LocalDateTime scheduledEnd;       // scheduled_end in JSON
    
    // Flags
    private Boolean rollbackAvailable;        // rollback_available in JSON
    
    // Narrative fields
    private String businessJustification;     // business_justification in JSON
    private String requestedByUserId;         // requested_by_user_id in JSON
    
    // Asset information (aggregated from cr_assets table)
    private List<String> assetIds;            // asset_ids in JSON (computed)
    private Integer assetCount;               // asset_count in JSON (computed)
    
    // ML Feature fields (computed by mapper)
    private Integer durationMinutes;          // duration_minutes in JSON
    private Boolean isWeekend;                // is_weekend in JSON
    private Boolean isPeakHours;              // is_peak_hours in JSON
    
    // Timestamps
    private LocalDateTime createdAt;          // created_at in JSON
    private LocalDateTime updatedAt;          // updated_at in JSON
}
```

---

### DTO: RiskAssessmentEvent (Consumer/Incoming)

**File:** `src/main/java/com/telecom/change_request_service/dto/event/RiskAssessmentEvent.java`

**Purpose:** Received from Kafka topic `ai.risk.completed`

**Annotations:**
```java
@Data
@NoArgsConstructor
@AllArgsConstructor
@JsonNaming(PropertyNamingStrategies.SnakeCaseStrategy.class)
```

**Complete Field Definition:**
```java
public class RiskAssessmentEvent {
    // Assessment identification
    private String assessmentId;              // assessment_id in JSON
    private String crId;                      // cr_id in JSON
    
    // Risk metrics
    private Double riskScore;                 // risk_score in JSON (0.0 to 1.0)
    private String riskLevel;                 // risk_level in JSON
    private String blastRadius;               // blast_radius in JSON (enum: LOCAL, MEDIUM, HIGH, GLOBAL)
    private Double confidence;                // Model confidence (0.0 to 1.0)
    
    // Narrative assessments
    private String executiveSummary;          // executive_summary in JSON
    private String technicalAnalysis;         // technical_analysis in JSON
    private String cabGuidance;               // cab_guidance in JSON
    
    // Collections
    private List<String> recommendations;     // recommendations in JSON (array of strings)
    private List<String> riskIndicators;      // risk_indicators in JSON (array of strings)
    
    // Nested objects
    private GroundingEvidence groundingEvidence;
    private ModelMetadata modelMetadata;
    
    // Timestamp
    private String assessedAt;                // assessed_at in JSON (ISO 8601 string)
    
    // Nested DTO: GroundingEvidence
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @JsonNaming(PropertyNamingStrategies.SnakeCaseStrategy.class)
    public static class GroundingEvidence {
        private Integer similarChangesAnalyzed;         // similar_changes_analyzed in JSON
        private Integer similarChangesWithOutages;      // similar_changes_with_outages in JSON
        private Integer similarChangesWithRollbacks;    // similar_changes_with_rollbacks in JSON
        private Integer similarChangesFailed;           // similar_changes_failed in JSON
    }
    
    // Nested DTO: ModelMetadata
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @JsonNaming(PropertyNamingStrategies.SnakeCaseStrategy.class)
    public static class ModelMetadata {
        private String predictionEngine;       // prediction_engine in JSON
        private String reasoningEngine;        // reasoning_engine in JSON
        private Boolean groundingEnabled;      // grounding_enabled in JSON
    }
}
```

---

### Entity: ChangeRequest

**File:** `src/main/java/com/telecom/change_request_service/entity/ChangeRequest.java`

**Annotations:**
```java
@Entity
@Table(name = "change_requests")
@Data
@NoArgsConstructor
@AllArgsConstructor
```

**Complete Field Definition:**
```java
public class ChangeRequest {
    @Id
    @Column(name = "cr_id")
    private String crId;
    
    @Column(name = "title", nullable = false, length = 255)
    private String title;
    
    @Column(name = "description", columnDefinition = "TEXT")
    private String description;
    
    @Column(name = "domain", length = 255)
    private String domain;
    
    @Column(name = "change_type", length = 255)
    private String changeType;
    
    @Column(name = "region", length = 255)
    private String region;
    
    @Column(name = "status", length = 50)
    private String status;  // DRAFT, SUBMITTED, APPROVED, REJECTED, COMPLETED, FAILED
    
    @Column(name = "scheduled_start")
    private LocalDateTime scheduledStart;
    
    @Column(name = "scheduled_end")
    private LocalDateTime scheduledEnd;
    
    @Column(name = "rollback_available")
    private Boolean rollbackAvailable;
    
    @Column(name = "business_justification", columnDefinition = "TEXT")
    private String businessJustification;
    
    @Column(name = "requested_by_user_id", length = 255)
    private String requestedByUserId;
    
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
    
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}
```

---

### Entity: CrAsset

**File:** `src/main/java/com/telecom/change_request_service/entity/CrAsset.java`

**Annotations:**
```java
@Entity
@Table(name = "cr_assets")
@Data
@NoArgsConstructor
@AllArgsConstructor
```

**Fields:**
```java
@Id
@Column(name = "asset_row_id")
private String assetRowId;

@Column(name = "cr_id", nullable = false)
private String crId;

@Column(name = "asset_type", length = 255)
private String assetType;

@Column(name = "asset_id", length = 255)
private String assetId;

@Column(name = "hostname", length = 255)
private String hostname;

@Column(name = "created_at")
private LocalDateTime createdAt;
```

---

### Entity: CrAssessment

**File:** `src/main/java/com/telecom/change_request_service/entity/CrAssessment.java`

**Annotations:**
```java
@Entity
@Table(name = "cr_assessments")
@Data
@NoArgsConstructor
@AllArgsConstructor
```

**Fields:**
```java
@Id
@Column(name = "assessment_id")
private String assessmentId;

@Column(name = "cr_id")
private String crId;

@Column(name = "risk_score")
private Double riskScore;

@Column(name = "risk_level")
private String riskLevel;

@Enumerated(EnumType.STRING)
@Column(name = "blast_radius", length = 50)
private BlastRadius blastRadius;  // Enum: LOCAL, MEDIUM, HIGH, GLOBAL

@Column(name = "confidence")
private Double confidence;

@Column(name = "executive_summary", columnDefinition = "TEXT")
private String executiveSummary;

@Column(name = "technical_analysis", columnDefinition = "TEXT")
private String technicalAnalysis;

@Column(name = "cab_guidance", columnDefinition = "TEXT")
private String cabGuidance;

@Column(name = "recommendations_json", columnDefinition = "TEXT")
private String recommendationsJson;  // JSON serialized List<String>

@Column(name = "risk_indicators_json", columnDefinition = "TEXT")
private String riskIndicatorsJson;   // JSON serialized List<String>

@Column(name = "model_version")
private String modelVersion;

@Column(name = "assessed_at")
private LocalDateTime assessedAt;
```

---

### Entity: CrAuditLog

**File:** `src/main/java/com/telecom/change_request_service/entity/CrAuditLog.java`

**Annotations:**
```java
@Entity
@Table(name = "cr_audit_logs")
@Data
@NoArgsConstructor
@AllArgsConstructor
```

**Fields:**
```java
@Id
@Column(name = "log_id")
private String logId;

@Column(name = "cr_id", nullable = false)
private String crId;

@Column(name = "action_type", length = 255)
private String actionType;  // CREATE, SUBMIT, APPROVE, REJECT, COMPLETE

@Column(name = "old_status", length = 50)
private String oldStatus;

@Column(name = "new_status", length = 50)
private String newStatus;

@Column(name = "acted_by_user_id", length = 255)
private String actedByUserId;

@Column(name = "remarks", columnDefinition = "TEXT")
private String remarks;

@Column(name = "created_at")
private LocalDateTime createdAt;
```

---

### Enum: BlastRadius

**File:** `src/main/java/com/telecom/change_request_service/enums/BlastRadius.java`

```java
public enum BlastRadius {
    LOCAL,      // Impact isolated to single system/device
    MEDIUM,     // Impact affects region or specific zone
    HIGH,       // Impact affects multiple regions
    GLOBAL      // Impact affects all infrastructure
}
```

---

## ⚙️ Configuration Guide

### application.yml (Comprehensive Configuration)

**File:** `src/main/resources/application.yml`

```yaml
spring:
  application:
    name: change-request-service
    version: 1.0.0

  # ============================================
  # DATABASE CONFIGURATION
  # ============================================
  datasource:
    url: jdbc:mysql://localhost:3306/intelligent_change_management
    username: root
    password: Contract@1968
    driver-class-name: com.mysql.cj.jdbc.Driver
    hikari:
      maximum-pool-size: 10
      minimum-idle: 2
      connection-timeout: 20000
      idle-timeout: 300000
      max-lifetime: 1200000

  # ============================================
  # JPA / HIBERNATE CONFIGURATION
  # ============================================
  jpa:
    database-platform: org.hibernate.dialect.MySQL8Dialect
    hibernate:
      ddl-auto: none  # Don't auto-create; use schema.sql
    show-sql: true
    properties:
      hibernate:
        dialect: org.hibernate.dialect.MySQLDialect
        format_sql: true
        use_sql_comments: true
        jdbc.fetch_size: 50
        jdbc.batch_size: 20
        order_inserts: true
        order_updates: true

  # ============================================
  # SQL INITIALIZATION
  # ============================================
  sql:
    init:
      mode: always  # Run schema.sql on every startup
      schema-locations: classpath:schema.sql
      data-locations: classpath:data.sql (if exists)

  # ============================================
  # KAFKA CONFIGURATION
  # ============================================
  kafka:
    bootstrap-servers: localhost:9092
    
    # Producer Configuration
    producer:
      key-serializer: org.apache.kafka.common.serialization.StringSerializer
      value-serializer: org.springframework.kafka.support.serializer.JsonSerializer
      acks: all
      retries: 3
      properties:
        linger.ms: 10
        batch.size: 16384

    # Consumer Configuration
    consumer:
      group-id: change-request-service
      auto-offset-reset: latest
      max-poll-records: 100
      key-deserializer: org.apache.kafka.common.serialization.StringDeserializer
      value-deserializer: org.springframework.kafka.support.serializer.JsonDeserializer
      
      # CRITICAL: Cross-language serialization settings
      properties:
        # Allow all packages (restrict in production)
        spring.json.trusted.packages: "*"
        
        # Explicit default type (don't rely on Python's type headers)
        spring.json.value.default.type: com.telecom.change_request_service.dto.event.RiskAssessmentEvent
        
        # Disable type header reliance
        spring.json.use.type.headers: false

  # ============================================
  # LOGGING CONFIGURATION
  # ============================================
  jpa:
    open-in-view: false

logging:
  level:
    root: INFO
    com.telecom.change_request_service: DEBUG
    org.springframework.kafka: INFO
    org.springframework.data.jpa: DEBUG
    org.hibernate.SQL: DEBUG
    org.hibernate.type.descriptor.sql.BasicBinder: TRACE
  pattern:
    console: "%d{yyyy-MM-dd HH:mm:ss} - %msg%n"
    file: "%d{yyyy-MM-dd HH:mm:ss} [%thread] %-5level %logger{36} - %msg%n"

# ============================================
# SERVER CONFIGURATION
# ============================================
server:
  port: 9004
  servlet:
    context-path: /
  compression:
    enabled: true
    min-response-size: 1024

# ============================================
# JWT CONFIGURATION
# ============================================
jwt:
  secret: mySecretKey1234567890123456789012345678901234567890
  expiration: 86400000  # 24 hours in milliseconds

# ============================================
# APPLICATION-SPECIFIC PROPERTIES
# ============================================
app:
  kafka:
    change-request-topic: change-requests
    risk-assessment-topic: ai.risk.completed
  cors:
    allowed-origins: "*"
    allowed-methods: "GET,POST,PUT,DELETE"
    allowed-headers: "*"
```

**Configuration Explanation:**

| Setting | Value | Explanation |
|---------|-------|-------------|
| `spring.jpa.hibernate.ddl-auto` | `none` | Don't auto-create tables; rely on schema.sql for explicit DDL |
| `spring.sql.init.mode` | `always` | Always execute schema.sql on startup (safe with ddl-auto=none) |
| `spring.kafka.producer.acks` | `all` | Wait for all replicas to acknowledge before returning (max durability) |
| `spring.kafka.consumer.auto-offset-reset` | `latest` | Start from latest message if consumer group has no offset |
| `spring.json.use.type.headers` | `false` | Don't rely on Kafka type headers from Python |
| `spring.json.value.default.type` | `RiskAssessmentEvent` | Explicit deserialization target class |
| `spring.json.trusted.packages` | `"*"` | Development setting; restrict in production |
| `server.port` | `9004` | Unique port for change-request-service |
| `jwt.expiration` | `86400000` | 24 hours = 86,400,000 milliseconds |

---

## 🛠️ Building & Deployment

### Build Steps

```bash
# Step 1: Clone repository
git clone https://github.com/yourorg/intelligent-change-management.git
cd intelligent-change-management

# Step 2: Navigate to change-request-service
cd change-request-service/change-request-service

# Step 3: Clean and build (skip tests for speed)
./mvnw clean install -DskipTests

# Expected output:
# [INFO] Scanning for projects...
# [INFO] Building change-request-service 0.0.1-SNAPSHOT
# ...
# [INFO] BUILD SUCCESS
# [INFO] Total time: XX.XXX s

# Step 4: Verify JAR was created
ls -lh target/change-request-service-0.0.1-SNAPSHOT.jar
# Output: -rw-r--r-- xxx change-request-service-0.0.1-SNAPSHOT.jar
```

### With Tests

```bash
# Run all tests
./mvnw clean install

# Run specific test class
./mvnw test -Dtest=ChangeRequestServiceTest

# Run with coverage
./mvnw clean install jacoco:report
```

### Build Artifacts

```
target/
├── change-request-service-0.0.1-SNAPSHOT.jar       [Executable JAR]
├── change-request-service-0.0.1-SNAPSHOT-sources.jar
├── classes/                                         [Compiled bytecode]
│   ├── application.yml
│   ├── schema.sql
│   └── com/telecom/change_request_service/...
├── generated-sources/                              [Generated code]
├── maven-archiver/
└── surefire-reports/                               [Test reports]
```

---

## 🚀 Microservice Startup Guide

### Startup Order (All Services)

Start services in this order to ensure dependencies are available:

```
1. MySQL (Database)
2. Kafka + Zookeeper
3. auth-service (Port 9003) ← Provides JWT tokens
4. change-request-service (Port 9004) ← Main service
5. approval-service (Port 9002)
6. notification-service (Port 9007)
7. monitoring-service (Port 9006)
8. runbook-service (Port 9008)
9. api-gateway (Port 9001) ← Routes all requests
10. ai-gateway-service (Port 9000)
```

### Start change-request-service

**Option 1: Maven Spring Boot Plugin (Development)**
```bash
cd change-request-service/change-request-service
./mvnw spring-boot:run

# Logs:
# ...
# Tomcat started on port 9004 (http) with context path '/'
# Started ChangeRequestServiceApplication in X.XXX seconds
# Change-request-service: Subscribed to topic(s): ai.risk.completed
```

**Option 2: Direct JAR Execution (Production)**
```bash
java -jar target/change-request-service-0.0.1-SNAPSHOT.jar

# With custom JVM options:
java -Xmx1024m -Xms512m \
  -Dspring.datasource.url=jdbc:mysql://localhost:3306/intelligent_change_management \
  -Dspring.kafka.bootstrap-servers=localhost:9092 \
  -jar target/change-request-service-0.0.1-SNAPSHOT.jar
```

**Option 3: Docker**
```bash
docker build -t change-request-service:1.0.0 .
docker run -p 9004:9004 \
  -e SPRING_DATASOURCE_URL=jdbc:mysql://mysql:3306/intelligent_change_management \
  -e SPRING_DATASOURCE_USERNAME=root \
  -e SPRING_DATASOURCE_PASSWORD=Contract@1968 \
  -e SPRING_KAFKA_BOOTSTRAP_SERVERS=kafka:9092 \
  change-request-service:1.0.0
```

### Verify Service is Running

```bash
# Check health endpoint (no auth required)
curl -X GET http://localhost:9004/api/health

# Response:
# {"status":"UP","timestamp":"2026-05-11T12:44:00Z","components":{"db":"UP","kafka":"UP"}}

# Check Kafka consumer
# Should see in logs: "Subscribed to topic(s): ai.risk.completed"

# List Kafka topics (from Docker)
docker exec kafka kafka-topics \
  --bootstrap-server localhost:9092 \
  --list
```

---

## 🔄 Integration Workflows

### Complete End-to-End Workflow Example

```bash
#!/bin/bash
set -e

# Configuration
API_URL="http://localhost:9004/api"
AUTH_URL="http://localhost:9003/auth"
JWT_TOKEN=""

# Step 1: Get JWT Token
echo "1. Getting JWT token..."
TOKEN_RESPONSE=$(curl -s -X POST $AUTH_URL/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "engineer@example.com",
    "password": "SecurePassword123"
  }')

JWT_TOKEN=$(echo $TOKEN_RESPONSE | jq -r '.token')
echo "✅ Token: ${JWT_TOKEN:0:20}..."

# Step 2: Create Change Request (DRAFT)
echo "2. Creating CR in DRAFT status..."
CR_RESPONSE=$(curl -s -X POST $API_URL/change-requests \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -d '{
    "title": "Database Migration to MySQL 8.0",
    "description": "Production database upgrade with zero downtime",
    "domain": "Database",
    "changeType": "Feature",
    "region": "US-East-1",
    "scheduledStart": "2026-06-01T02:00:00Z",
    "scheduledEnd": "2026-06-01T06:00:00Z",
    "rollbackAvailable": true,
    "businessJustification": "Security and performance improvements",
    "assets": [
      {"assetType":"Server","assetId":"db-primary","hostname":"prod-db-01.example.com"},
      {"assetType":"Server","assetId":"db-replica","hostname":"prod-db-02.example.com"}
    ]
  }')

CR_ID=$(echo $CR_RESPONSE | jq -r '.crId')
echo "✅ Created CR: $CR_ID"

# Step 3: Submit CR (Triggers Kafka Publish)
echo "3. Submitting CR (publishes to Kafka)..."
curl -s -X PUT $API_URL/change-requests/$CR_ID/submit \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -d '{"remarks": "Ready for AI assessment"}' | jq '.'
echo "✅ CR submitted"

# Step 4: Wait for Python AI to process (simulate)
echo "4. Waiting for AI assessment (30 seconds)..."
sleep 30

# Step 5: Retrieve Assessment
echo "5. Retrieving AI assessment results..."
ASSESSMENT=$(curl -s -X GET $API_URL/change-requests/$CR_ID/assessment \
  -H "Authorization: Bearer $JWT_TOKEN")

RISK_LEVEL=$(echo $ASSESSMENT | jq -r '.riskLevel // "PENDING"')
RISK_SCORE=$(echo $ASSESSMENT | jq -r '.riskScore // "N/A"')

echo "✅ Assessment Complete"
echo "   Risk Level: $RISK_LEVEL"
echo "   Risk Score: $RISK_SCORE"

# Step 6: View Full Assessment
echo "6. Full Assessment Details:"
echo $ASSESSMENT | jq '.'

echo "✅ End-to-End Workflow Complete!"
```

---

## 🐛 Troubleshooting & Debug

### Issue 1: Port 9004 Already in Use

**Error:**
```
ERROR: Address already in use: bind
```

**Solution:**
```bash
# Find process using port 9004
lsof -i :9004
# Output: java 12345 user 123u IPv6 0x... TCP *:9004 (LISTEN)

# Kill process
kill -9 12345

# Or let OS choose different port:
java -Dserver.port=9005 -jar target/...jar
```

### Issue 2: MySQL Connection Refused

**Error:**
```
ERROR: Connection refused to host: localhost:3306
```

**Solution:**
```bash
# Verify MySQL is running
mysql -u root -p -e "SELECT 1;"

# Check credentials in application.yml
grep -A 3 "datasource:" src/main/resources/application.yml

# Verify database exists
mysql -u root -p intelligent_change_management -e "SHOW TABLES;"
```

### Issue 3: Kafka Broker Unreachable

**Error:**
```
ERROR: Bootstrap failed: Unknown host 'localhost:9092'
```

**Solution:**
```bash
# Verify Kafka is running
docker ps | grep kafka

# Check Kafka broker logs
docker logs <kafka-container-id>

# Verify topics exist
docker exec kafka kafka-topics --bootstrap-server localhost:9092 --list

# If topics missing, create them:
docker exec kafka kafka-topics --bootstrap-server localhost:9092 \
  --create --topic change-requests --partitions 1 --replication-factor 1
```

### Issue 4: No Rows Updated

**Error:**
```
SQL Warning Code: 0, SQLState: null
No rows updated
```

**Solution:**
```bash
# Verify CR exists
mysql intelligent_change_management -u root -p
SELECT * FROM change_requests WHERE cr_id = 'CR-20260511-001';

# If empty, CR wasn't created properly. Re-create:
curl -X POST http://localhost:9004/api/change-requests ... -w "\nStatus: %{http_code}\n"
```

### Issue 5: Kafka Message Not Published

**Error:**
```
# No message appears in topic
docker exec kafka kafka-console-consumer --bootstrap-server localhost:9092 \
  --topic change-requests --from-beginning
# (output: empty)
```

**Solution:**
```bash
# Verify CR is in SUBMITTED status
curl http://localhost:9004/api/change-requests/CR-20260511-001 \
  -H "Authorization: Bearer $TOKEN" | jq '.status'

# If DRAFT, submit first:
curl -X PUT http://localhost:9004/api/change-requests/CR-20260511-001/submit ...

# Check application logs for Kafka errors
./mvnw spring-boot:run 2>&1 | grep -i "kafka\|topic"
```

### Debug Mode

```bash
# Enable debug logging
./mvnw spring-boot:run \
  -Dlogging.level.org.springframework.kafka=DEBUG \
  -Dlogging.level.com.telecom.change_request_service=DEBUG

# Watch Kafka messages in real-time
docker exec kafka kafka-console-consumer \
  --bootstrap-server localhost:9092 \
  --topic change-requests \
  --property print.key=true \
  --from-beginning

# Monitor database queries
tail -f target/change-request-service.log | grep "SELECT\|INSERT\|UPDATE"
```

---

## ✅ Summary & Checklist

### Pre-Launch Checklist

- [ ] Java 17 installed and `JAVA_HOME` set
- [ ] Maven 3.9.x installed
- [ ] MySQL 8.0 running on localhost:3306
- [ ] `intelligent_change_management` database created
- [ ] Kafka + Zookeeper running on localhost:9092 and localhost:2181
- [ ] Topics created: `change-requests` and `ai.risk.completed`
- [ ] Service built successfully (`./mvnw clean install -DskipTests`)
- [ ] No port conflicts (9004 available)
- [ ] Application.yml configured with correct credentials

### Post-Launch Verification

- [ ] Service starts on port 9004
- [ ] `/api/health` returns 200 OK
- [ ] Kafka consumer subscribes to `ai.risk.completed` topic
- [ ] Can create CR via POST /api/change-requests
- [ ] Can submit CR via PUT /api/change-requests/{id}/submit
- [ ] Message appears in Kafka `change-requests` topic
- [ ] Logs show "Received AI Risk Assessment" after AI processes

---

**Document Version:** 1.0.0  
**Last Updated:** May 11, 2026  
**Maintained By:** Development Team  
**Status:** Production Ready  

For questions or updates, contact the development team or create an issue in the repository.
