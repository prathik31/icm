# Complete API Reference - Intelligent Change Management System

**Version:** 1.0.0  
**Last Updated:** May 28, 2026

This document provides a complete reference for all REST API endpoints across all services, including request/response formats, role requirements, and database mappings.

---

## Table of Contents

1. [Auth Service](#auth-service)
2. [Change Request Service](#change-request-service)
3. [Approval Service](#approval-service)
4. [Runbook Service](#runbook-service)
5. [Common Patterns](#common-patterns)
6. [Error Handling](#error-handling)

---

## Auth Service

**Base URL:** `http://localhost:9003`  
**Port:** 9003

### Authentication Notes

- No JWT required for registration/login
- All other services require JWT token returned by login/register
- Token format: `Authorization: Bearer <token>`
- Expiration: 24 hours
- Roles: `ENGINEER`, `APPROVER`, `ADMIN`

### POST /auth/register

Register a new user.

**Request:**
```json
{
  "name": "string (required)",
  "email": "string (required, valid email)",
  "password": "string (required, min 6 chars)"
}
```

**Response (200 OK):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Errors:**
- 400: Validation failed (invalid email, short password)
- 409: Email already exists
- 500: Server error

**Database Impact:**
- Inserts row into `users` table
- Generates UUID for `id`
- Stores password hash
- Default role: assigned based on registration logic

---

### POST /auth/login

Authenticate user and receive JWT token.

**Request:**
```json
{
  "email": "string (required)",
  "password": "string (required)"
}
```

**Response (200 OK):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Errors:**
- 400: Missing email or password
- 401: Invalid credentials
- 500: Server error

**JWT Token Contents:**
- User ID (sub)
- User email
- User role
- Expiration time
- Algorithm: HS256

---

## Change Request Service

**Base URL:** `http://localhost:9004`  
**Port:** 9004  
**Database:** icm_db (tables: change_requests, cr_assets, cr_assessments, cr_audit_logs)

### Core Concepts

- **Status Flow:** DRAFT → SUBMITTED → ANALYZED → RISK_CONFIRMED → APPROVED/REJECTED
- **Events:** Publishing to Kafka topics on state changes
- **Audit:** All state transitions logged to cr_audit_logs table
- **Assets:** CRs can have multiple associated assets

---

### POST /v1/change-requests

Create a new change request (DRAFT status).

**Authorization:** Bearer token (ENGINEER or ADMIN)

**Request:**
```json
{
  "title": "string (required)",
  "description": "string (required)",
  "domain": "string (required, e.g., 'database', 'network')",
  "changeType": "string (required, e.g., 'MIGRATION', 'PATCH', 'UPGRADE')",
  "region": "string (required, e.g., 'us-east-1')",
  "scheduledStart": "ISO8601 (required)",
  "scheduledEnd": "ISO8601 (required)",
  "rollbackAvailable": "boolean (required)",
  "businessJustification": "string (required)",
  "assets": [
    {
      "assetType": "string",
      "assetId": "string",
      "hostname": "string"
    }
  ]
}
```

**Response (201 Created):**
```json
{
  "crId": "uuid",
  "title": "string",
  "description": "string",
  "domain": "string",
  "changeType": "string",
  "region": "string",
  "status": "DRAFT",
  "scheduledStart": "ISO8601",
  "scheduledEnd": "ISO8601",
  "rollbackAvailable": boolean,
  "businessJustification": "string",
  "requestedByUserId": "uuid",
  "createdAt": "ISO8601",
  "updatedAt": "ISO8601",
  "assets": [
    {
      "assetType": "string",
      "assetId": "string",
      "hostname": "string"
    }
  ]
}
```

**Database:**
- Inserts into `change_requests` table with status = 'DRAFT'
- Inserts associated rows into `cr_assets` table
- Inserts audit log entry into `cr_audit_logs` table
- No Kafka event published

---

### POST /v1/change-requests/{id}/submit

Submit a change request for risk assessment (status: DRAFT → SUBMITTED).

**Authorization:** Bearer token (ENGINEER or ADMIN)

**URL Parameters:**
- `id`: Change request UUID

**Response (200 OK):**
```json
{
  "crId": "uuid",
  "status": "SUBMITTED"
}
```

**Side Effects:**
- Updates `change_requests` status to SUBMITTED
- Publishes `ChangeRequestEvent` to Kafka topic `change-requests`
- Inserts audit log entry
- Event consumed by external AI engine for risk assessment

**Errors:**
- 400: Invalid state transition
- 404: CR not found
- 403: Unauthorized role
- 500: Kafka publish failed

---

### POST /v1/change-requests/{id}/confirm-risk

Confirm risk assessment (status: ANALYZED → RISK_CONFIRMED).

**Authorization:** Bearer token (ENGINEER or ADMIN)

**URL Parameters:**
- `id`: Change request UUID

**Response (200 OK):**
```json
{
  "crId": "uuid",
  "status": "RISK_CONFIRMED"
}
```

**Side Effects:**
- Updates status to RISK_CONFIRMED
- Publishes `CrRiskConfirmedEvent` to Kafka topic `cr.risk_confirmed`
- Inserts audit log entry
- Approval workflow initiated

---

### GET /v1/change-requests

Get all change requests.

**Authorization:** Bearer token (any role)

**Query Parameters:** None

**Response (200 OK):**
```json
[
  {
    "crId": "uuid",
    "title": "string",
    "description": "string",
    "domain": "string",
    "changeType": "string",
    "region": "string",
    "status": "DRAFT|SUBMITTED|ANALYZED|RISK_CONFIRMED|APPROVED|REJECTED",
    "scheduledStart": "ISO8601",
    "scheduledEnd": "ISO8601",
    "rollbackAvailable": boolean,
    "businessJustification": "string",
    "requestedByUserId": "uuid",
    "createdAt": "ISO8601",
    "updatedAt": "ISO8601",
    "assets": [],
    "riskAssessment": {
      "assessmentId": "uuid",
      "crId": "uuid",
      "riskScore": 65,
      "riskLevel": "HIGH",
      "blastRadius": "REGIONAL",
      "confidence": 0.92,
      "executiveSummary": "string",
      "technicalAnalysis": "string",
      "cabGuidance": "string",
      "recommendations": [],
      "riskIndicators": [],
      "generatedAt": "ISO8601"
    }
  }
]
```

**Database:** Queries `change_requests` table, includes latest `cr_assessments` row if available

---

### GET /v1/change-requests/{id}

Get change request details by ID.

**Authorization:** Bearer token (any role)

**URL Parameters:**
- `id`: Change request UUID

**Response (200 OK):**
```json
{
  "crId": "uuid",
  "title": "string",
  ... (same as GET /v1/change-requests)
}
```

**Errors:**
- 404: CR not found

---

### GET /v1/change-requests/{crId}/assessment

Get the latest risk assessment for a change request.

**Authorization:** Bearer token (any role)

**URL Parameters:**
- `crId`: Change request UUID

**Response (200 OK):**
```json
{
  "assessmentId": "uuid",
  "crId": "uuid",
  "riskScore": 65,
  "riskLevel": "HIGH",
  "blastRadius": "REGIONAL",
  "confidence": 0.92,
  "executiveSummary": "Based on analysis, this change has elevated risk...",
  "technicalAnalysis": "The migration affects 5 nodes...",
  "cabGuidance": "Recommend pre-change communication...",
  "recommendations": [
    "Perform dry-run in staging",
    "Have rollback procedure ready",
    "Schedule maintenance window"
  ],
  "riskIndicators": [
    "High traffic impact",
    "Critical asset involved"
  ],
  "generatedAt": "ISO8601"
}
```

**Database:**
- Queries `cr_assessments` table
- Selects row with latest `created_at` timestamp for given `cr_id`
- Populated by Kafka consumer from AI engine

**Errors:**
- 404: CR not found or no assessment exists

---

### GET /v1/assets

Get network inventory assets with optional filters.

**Authorization:** Bearer token (any role)

**Query Parameters:**
- `region`: Optional region filter (e.g., 'us-east-1')
- `domain`: Optional domain filter (e.g., 'database', 'network')

**Response (200 OK):**
```json
[
  {
    "assetId": "uuid",
    "assetType": "database",
    "domain": "database",
    "tier": "production",
    "hostname": "db-prod-01.example.com",
    "region": "us-east-1",
    "datacenter": "VA1",
    "vendor": "MySQL",
    "model": "MySQL 8.0",
    "osVersion": "ubuntu-20.04",
    "criticalityLevel": "CRITICAL",
    "isCoreInfrastructure": true,
    "isInternetFacing": false,
    "redundancyAvailable": true,
    "redundancyPeerId": "uuid",
    "connectedAssetCount": 12,
    "regionHubWeight": 0.95,
    "supportsRollback": true,
    "currentOsVersion": "ubuntu-20.04",
    "uptimeSlaPercent": 99.99,
    "maxCapacityPercent": 85,
    "commissionedDate": "2024-01-15",
    "isActive": true
  }
]
```

**Database:** Queries `network_inventory` table with optional WHERE filters

---

### GET /v1/assets/search

Search assets by keyword.

**Authorization:** Bearer token (any role)

**Query Parameters:**
- `q`: Search term (searches hostname, assetId, asset_type)

**Response (200 OK):** Same format as GET /v1/assets

**Database:** Full-text search on `network_inventory` table

---

### GET /v1/audit-logs

Get all audit log entries.

**Authorization:** Bearer token (any role)

**Response (200 OK):**
```json
[
  {
    "logId": "uuid",
    "crId": "uuid",
    "actionType": "CREATE|SUBMIT|ASSESS|CONFIRM_RISK|APPROVE|REJECT",
    "oldStatus": "DRAFT",
    "newStatus": "SUBMITTED",
    "actedByUserId": "uuid",
    "remarks": "Submitted for risk assessment",
    "createdAt": "ISO8601"
  }
]
```

**Database:** Queries `cr_audit_logs` table

---

## Approval Service

**Base URL:** `http://localhost:9005`  
**Port:** 9005  
**Database:** icm_db (tables: approval_flow, approval_decision, generated_runbooks)

### Prerequisites

- Approval workflows are initiated automatically when CR status is RISK_CONFIRMED
- Approvers must have APPROVER or ADMIN role
- Runs on port 9005

---

### GET /v1/approvals/pending

Get pending approvals for the current approver.

**Authorization:** Bearer token (APPROVER or ADMIN required)

**Response (200 OK):**
```json
[
  {
    "flowId": "uuid",
    "crId": "uuid",
    "riskLevel": "HIGH",
    "riskScore": 75,
    "status": "IN_PROGRESS"
  }
]
```

**Database:**
- Queries `approval_flow` table
- Filters by status = 'IN_PROGRESS'
- Includes corresponding CR data from `change_requests` table

**Errors:**
- 403: User not authorized (not APPROVER or ADMIN)

---

### GET /v1/approvals/history

Get historical approval decisions.

**Authorization:** Bearer token (APPROVER or ADMIN required)

**Response (200 OK):**
```json
[
  {
    "flowId": "uuid",
    "crId": "uuid",
    "riskLevel": "HIGH",
    "riskScore": 75,
    "status": "APPROVED|REJECTED",
    "approverUserId": "uuid",
    "approverRole": "APPROVER",
    "outcome": "APPROVED",
    "comment": "Risk is acceptable with monitoring",
    "decisionAt": "ISO8601"
  }
]
```

**Database:**
- Queries `approval_flow` and `approval_decision` tables
- Filters by completed approvals (status != IN_PROGRESS)

---

### GET /v1/approvals/{crId}

Get approval details for a specific change request.

**Authorization:** Bearer token (APPROVER or ADMIN required)

**URL Parameters:**
- `crId`: Change request UUID

**Response (200 OK):** Same format as GET /v1/approvals/history entry

**Errors:**
- 404: Approval not found
- 403: Unauthorized

---

### POST /v1/approvals/{flowId}/approve

Approve a change request.

**Authorization:** Bearer token (APPROVER or ADMIN required)

**URL Parameters:**
- `flowId`: Approval flow UUID

**Request:**
```json
{
  "comment": "string (optional)"
}
```

**Response (200 OK):**
```json
{
  "flowId": "uuid",
  "crId": "uuid",
  "status": "APPROVED",
  "approverUserId": "uuid",
  "outcome": "APPROVED",
  "comment": "string",
  "decisionAt": "ISO8601"
}
```

**Side Effects:**
1. Updates `approval_flow` status to APPROVED
2. Inserts decision row into `approval_decision` table
3. Publishes `ApprovalDecisionEvent` to Kafka topic `approval-events`
4. **Triggers automatic runbook generation:**
   - Fetches CR details from Change Request Service
   - Fetches risk assessment
   - POSTs to Python AI engine at `http://localhost:8101/v1/runbooks/generate`
   - Stores generated runbook to `generated_runbooks` table
5. Updates CR status to APPROVED

**Database Changes:**
- `approval_flow`: status updated to APPROVED
- `approval_decision`: new row inserted
- `change_requests`: status updated to APPROVED
- `generated_runbooks`: new runbook created (async)

**Errors:**
- 404: Flow not found
- 400: Invalid state (already approved/rejected)
- 403: Unauthorized

---

### POST /v1/approvals/{flowId}/reject

Reject a change request.

**Authorization:** Bearer token (APPROVER or ADMIN required)

**URL Parameters:**
- `flowId`: Approval flow UUID

**Request:**
```json
{
  "comment": "string (optional)"
}
```

**Response (200 OK):**
```json
{
  "flowId": "uuid",
  "crId": "uuid",
  "status": "REJECTED",
  "approverUserId": "uuid",
  "outcome": "REJECTED",
  "comment": "string",
  "decisionAt": "ISO8601"
}
```

**Side Effects:**
1. Updates `approval_flow` status to REJECTED
2. Inserts decision row into `approval_decision` table
3. Publishes `ApprovalDecisionEvent` to Kafka
4. Updates CR status to REJECTED
5. No runbook generated

**Errors:**
- 404: Flow not found
- 400: Invalid state
- 403: Unauthorized

---

## Runbook Service

**Base URL:** `http://localhost:9096`  
**Port:** 9096  
**Database:** icm_db (table: generated_runbooks)

### Concepts

- Runbooks are automatically generated when an approval is granted
- Service fetches data from Change Request Service and AI engine
- Stores complete runbook execution plan to database

---

### GET /v1/runbooks/health

Health check endpoint.

**Authorization:** None required

**Response (200 OK):**
```json
{
  "message": "RUNBOOK SERVICE UP"
}
```

---

### GET /v1/runbooks/eligible-crs

Get change requests eligible for runbook generation.

**Authorization:** None required

**Criteria:**
- Status = APPROVED
- No existing generated runbook
- Risk assessment available

**Response (200 OK):**
```json
[
  {
    "crId": "uuid",
    "title": "string",
    "status": "APPROVED",
    "riskScore": 75,
    "riskLevel": "HIGH",
    "createdAt": "ISO8601"
  }
]
```

**Database:** 
- Queries `change_requests` and `generated_runbooks` tables
- Ordered by creation date descending

---

### GET /v1/runbooks

Get all generated runbooks.

**Authorization:** None required

**Response (200 OK):**
```json
[
  {
    "runbookId": "uuid",
    "crId": "uuid",
    "title": "string",
    "objective": "string",
    "estimatedDurationMins": 120,
    "riskLevel": "HIGH",
    "blastRadius": "REGIONAL",
    "status": "GENERATED",
    "generatedAt": "ISO8601"
  }
]
```

---

### GET /v1/runbooks/{crId}

Get runbook details for a specific change request.

**Authorization:** None required

**URL Parameters:**
- `crId`: Change request UUID

**Response (200 OK):**
```json
{
  "runbookId": "uuid",
  "crId": "uuid",
  "title": "Database Migration Runbook",
  "objective": "Migrate MySQL from 5.7 to 8.0 in production",
  "preChecks": [
    {
      "step": 1,
      "action": "Verify backup completion",
      "expectedResult": "Backup size > 100GB",
      "timeoutMins": 10
    }
  ],
  "executionSteps": [
    {
      "step": 1,
      "action": "Stop application services",
      "expectedResult": "All services stopped",
      "timeoutMins": 5,
      "rollbackAction": "Restart services"
    }
  ],
  "validationSteps": [
    {
      "step": 1,
      "action": "Verify database connection",
      "expectedResult": "Connection successful",
      "timeoutMins": 5
    }
  ],
  "rollbackSteps": [
    {
      "step": 1,
      "action": "Restore from backup",
      "expectedResult": "Database restored",
      "timeoutMins": 30
    }
  ],
  "monitoringGuidance": {
    "metrics": ["CPU", "Memory", "Connections"],
    "alertThresholds": {"CPU": 80, "Memory": 85},
    "checkIntervalSecs": 60
  },
  "escalationConditions": [
    "CPU > 90%",
    "Memory > 95%",
    "Connection errors > 5 per minute"
  ],
  "ragSources": [
    {
      "source": "MySQL Migration Guide v8.0",
      "relevance": 0.95,
      "excerpt": "..."
    }
  ],
  "estimatedDurationMins": 120,
  "riskLevel": "HIGH",
  "blastRadius": "REGIONAL",
  "riskNotes": "This change affects customer-facing database",
  "generatedBy": "AI Engine v1.0",
  "createdAt": "ISO8601"
}
```

**Database:** Queries `generated_runbooks` table

**Errors:**
- 404: Runbook not found

---

### POST /v1/runbooks/generate/{crId}

Manually trigger runbook generation for a change request.

**Authorization:** None required

**URL Parameters:**
- `crId`: Change request UUID

**Response (200 OK):**
```json
{
  "runbookId": "uuid",
  "crId": "uuid",
  "status": "GENERATED",
  "title": "string"
}
```

**Process:**
1. Fetches CR details from Change Request Service
2. Fetches risk assessment from Change Request Service
3. Builds request with snake_case JSON formatting
4. POSTs to external AI engine: `http://localhost:8101/v1/runbooks/generate`
5. Persists response to `generated_runbooks` table
6. Returns generation status

**Database:**
- Inserts row into `generated_runbooks` table
- All complex fields (pre_checks, execution_steps, etc.) stored as JSON

**Errors:**
- 404: CR not found or assessment missing
- 500: AI engine unavailable

---

## Common Patterns

### Request Headers

All endpoints require these headers for authenticated requests:

```
Content-Type: application/json
Authorization: Bearer <jwt_token>
```

### Response Envelope

All responses follow this pattern:

**Success (2xx):**
```json
{
  "data": { ... } or [ ... ]
}
```

**Error (4xx, 5xx):**
```json
{
  "error": "Error message",
  "message": "Detailed explanation",
  "timestamp": "ISO8601"
}
```

### JWT Token Usage

1. Register or login to get token
2. Include in Authorization header: `Bearer eyJhbGciOiJIUzI1NiIs...`
3. Token automatically validates role permissions
4. Expired tokens return 401 Unauthorized

### Database Timestamps

- All timestamps in ISO8601 format
- Stored in UTC in database
- Returned as strings in API responses

### Pagination

Current API does not support pagination. All list endpoints return complete results.

---

## Error Handling

### HTTP Status Codes

| Code | Meaning | Common Causes |
|------|---------|---------------|
| 200 | OK | Request successful |
| 201 | Created | Resource created |
| 400 | Bad Request | Invalid request format, validation failed |
| 401 | Unauthorized | Missing/invalid JWT token |
| 403 | Forbidden | Insufficient permissions for role |
| 404 | Not Found | Resource doesn't exist |
| 409 | Conflict | Duplicate resource, invalid state transition |
| 500 | Server Error | Unexpected server error |
| 503 | Service Unavailable | Database/Kafka connection issues |

### Common Error Responses

**Invalid JWT:**
```json
{
  "error": "Unauthorized",
  "message": "Invalid or expired token"
}
```

**Insufficient Permissions:**
```json
{
  "error": "Forbidden",
  "message": "Access denied. Required role: APPROVER"
}
```

**Resource Not Found:**
```json
{
  "error": "Not Found",
  "message": "Change request not found: uuid"
}
```

**Invalid State Transition:**
```json
{
  "error": "Bad Request",
  "message": "Cannot transition from DRAFT to APPROVED. Invalid state."
}
```

**Validation Error:**
```json
{
  "error": "Bad Request",
  "validationErrors": {
    "title": "Title is required",
    "email": "Invalid email format"
  }
}
```

