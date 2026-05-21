# API and Database Mapping Reference

This document reflects the current codebase and summarizes:
- HTTP APIs by service
- request and response DTO shapes
- persistence mappings (entity to table and key columns)
- important cross-service side effects

## Common Auth Behavior
- JWT-aware services read Authorization: Bearer <token>.
- JwtFilter extracts userId and role and stores them on HttpServletRequest attributes.
- Role checks are enforced in controllers/service flows as described below.

---

## Auth Service
Base path: /auth

### POST /auth/register
- Request body: RegisterRequestDTO
  - name (required)
  - email (required, email)
  - password (required, min length 6)
- Response body: AuthResponseDTO
  - token
- Current status code in controller: 200 OK

### POST /auth/login
- Request body: LoginRequestDTO
  - email (required)
  - password (required)
- Response body: AuthResponseDTO
  - token
- Current status code in controller: 200 OK

### Persistence
Entity: com.telecom.entity.User
Table: users
- id (PK, String UUID via @PrePersist)
- name
- email (unique)
- passwordHash
- role (ENGINEER, APPROVER, ADMIN)
- isActive
- createdAt

---

## Change Request Service
Base paths:
- /v1/change-requests
- /v1/assets
- /v1/audit-logs

Role checks in controller:
- POST /v1/change-requests: ENGINEER
- POST /v1/change-requests/{id}/submit: ENGINEER
- POST /v1/change-requests/{id}/confirm-risk: ENGINEER
- GET endpoints currently do not enforce role checks in controller.

### POST /v1/change-requests
- Request body: CreateChangeRequestDTO
  - title
  - description
  - domain
  - changeType
  - region
  - scheduledStart
  - scheduledEnd
  - rollbackAvailable
  - businessJustification
  - assets: AssetDTO[]
    - assetType
    - assetId
    - hostname
  - requestedByUserId is set from JWT userId in controller
- Response body: ChangeRequestResponseDTO
  - crId
  - title
  - description
  - domain
  - changeType
  - region
  - status
  - scheduledStart
  - scheduledEnd
  - rollbackAvailable
  - businessJustification
  - requestedByUserId
  - createdAt
  - updatedAt
  - assets: AssetResponseDTO[]

### POST /v1/change-requests/{id}/submit
- Response body: SubmitChangeRequestResponseDTO
  - crId
  - status
- Behavior:
  - DRAFT -> SUBMITTED
  - audit log write
  - publishes ChangeRequestEvent to Kafka

### POST /v1/change-requests/{id}/confirm-risk
- Response body: SubmitChangeRequestResponseDTO
  - crId
  - status
- Behavior:
  - ANALYZED -> RISK_CONFIRMED
  - audit log write
  - publishes CrRiskConfirmedEvent
  - loads latest assessment using findFirstByCrIdOrderByCreatedAtDesc

### GET /v1/change-requests
- Response body: ChangeRequestResponseDTO[]

### GET /v1/change-requests/{id}
- Response body: ChangeRequestResponseDTO

### GET /v1/change-requests/{crId}/assessment
- Response body: CrAssessmentResponseDTO
  - assessmentId
  - crId
  - riskScore
  - riskLevel
  - blastRadius
  - confidence
  - executiveSummary
  - technicalAnalysis
  - cabGuidance
  - recommendations
  - riskIndicators
  - generatedAt
- Behavior:
  - loads latest row by crId ordered by createdAt desc

### GET /v1/assets?region=&domain=
- Response body: AssetResponseDTO[]

### GET /v1/assets/search?q=
- Response body: AssetResponseDTO[]

### GET /v1/audit-logs
- Response body: CrAuditLog[]

### Change Request Persistence

Entity: ChangeRequest
Table: change_requests
- cr_id (PK)
- title
- description
- domain
- change_type
- region
- status
- scheduled_start
- scheduled_end
- rollback_available
- business_justification
- requested_by_user_id
- created_at
- updated_at

Entity: CrAsset
Table: cr_assets
- asset_row_id (PK)
- cr_id
- asset_type
- asset_id
- hostname
- created_at

Entity: CrAssessment
Table: cr_assessments
- assessment_id (PK)
- cr_id
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

Entity: CrAuditLog
Table: cr_audit_logs
- log_id (PK)
- cr_id
- action_type
- old_status
- new_status
- acted_by_user_id
- remarks
- created_at

Entity: NetworkInventoryAsset
Table: network_inventory
- asset_id (PK)
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

---

## Approval Service
Base path: /v1/approvals

Role checks in controller:
- GET /pending: APPROVER
- GET /history: APPROVER or ADMIN
- GET /{crId}: APPROVER or ADMIN
- POST /{flowId}/approve: APPROVER or ADMIN
- POST /{flowId}/reject: APPROVER or ADMIN

### GET /v1/approvals/pending
- Response body: PendingApprovalDTO[]
  - flowId
  - crId
  - riskLevel
  - riskScore
  - status

### GET /v1/approvals/history
- Response body: ApprovalDetailsDTO[]

### GET /v1/approvals/{crId}
- Response body: ApprovalDetailsDTO

### POST /v1/approvals/{flowId}/approve
- Request body: ApprovalDecisionRequestDTO
  - comment
- Response body: ApprovalDetailsDTO
- Behavior:
  - IN_PROGRESS -> APPROVED
  - persists decision row
  - publishes ApprovalDecisionEvent
  - triggers runbook generation side effect (best effort)

### POST /v1/approvals/{flowId}/reject
- Request body: ApprovalDecisionRequestDTO
  - comment
- Response body: ApprovalDetailsDTO
- Behavior:
  - IN_PROGRESS -> REJECTED
  - persists decision row
  - publishes ApprovalDecisionEvent

### Runbook Side Effect (No Public Approval-Service Endpoint)
Approval service currently has no runbook controller endpoint.
Runbook generation is internal and happens from ApprovalWorkflowService after approve.

Runbook generation flow:
- fetches CR details: GET http://localhost:9004/v1/change-requests/{crId}
- fetches assessment: GET http://localhost:9004/v1/change-requests/{crId}/assessment
- builds nested snake_case RunbookGenerateRequest
- POSTs to Python runbook service: http://localhost:8101/v1/runbooks/generate
- persists generated data to generated_runbooks

### Approval Persistence

Entity: ApprovalFlow
Table: approval_flow
- id (PK, auto)
- flowId
- crId
- riskLevel
- riskScore
- status
- createdAt
- updatedAt

Entity: ApprovalDecision
Table: approval_decision
- id (PK, auto)
- flowId
- approverUserId
- approverRole
- outcome
- comment
- decisionAt

Entity: GeneratedRunbook
Table: generated_runbooks
- runbook_id (PK)
- cr_id
- flow_id
- title
- objective
- pre_execution_steps (JSON)
- execution_steps (JSON)
- post_execution_steps (JSON)
- rollback_steps (JSON)
- estimated_duration
- risk_mitigation
- critical_checkpoints (JSON)
- status
- generated_at
- created_at

---

## Quick Table Mapping Summary
- users -> User
- change_requests -> ChangeRequest
- cr_assets -> CrAsset
- cr_assessments -> CrAssessment (created_at used for latest assessment ordering)
- cr_audit_logs -> CrAuditLog
- network_inventory -> NetworkInventoryAsset
- approval_flow -> ApprovalFlow
- approval_decision -> ApprovalDecision
- generated_runbooks -> GeneratedRunbook
