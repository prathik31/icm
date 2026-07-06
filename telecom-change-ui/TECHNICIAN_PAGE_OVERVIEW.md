# Technician Page and Approver-to-Technician Workflow

## Purpose
This document explains the Technician page and related Approver workflow in the Telecom Change UI. It covers:
- Frontend file structure and component behavior
- Frontend service / API call flow
- Backend Technician Service APIs and responses
- Backend database tables and entity fields
- Approver -> Technician handoff flow
- Runbook fetch / normalization logic

---

## 1. Frontend structure

### 1.1 Key folders and files

- `telecom-change-ui/src/pages/technician/`
  - `TechnicianTasks.jsx` - technician task list page
  - `TechnicianTaskDetails.jsx` - detailed technician view with runbook content
  - `TechnicianSchedule.jsx` - scheduling page for a technician task
  - `TechnicianExecution.jsx` - execution control page
  - `TechnicianHistory.jsx` - execution history page
- `telecom-change-ui/src/hooks/`
  - `useTechnicianTasks.js` - hook for loading task list data
- `telecom-change-ui/src/services/`
  - `technicianService.js` - normalized technician page data and API orchestrator
  - `runbookService.js` - runbook-specific service logic
- `telecom-change-ui/src/api/`
  - `technicianApi.js` - low-level HTTP calls to technician backend
  - `runbookApi.js` - low-level HTTP calls to runbook backend
- `telecom-change-ui/src/App.jsx` - route definitions and role-based page access
- `telecom-change-ui/src/pages/ApprovalDetails.jsx` - approver UI that assigns technicians after approval
- `telecom-change-ui/src/components/TechnicianAssignmentModal.jsx` - modal used by approver to select a technician

### 1.2 Routes involved

From `src/App.jsx`:
- `/technician/dashboard` → `TechnicianDashboard`
- `/technician/tasks` → `TechnicianTasks`
- `/technician/tasks/:crId` → `TechnicianTaskDetails`
- `/technician/tasks/:crId/schedule` → `TechnicianSchedule`
- `/technician/tasks/:crId/execute` → `TechnicianExecution`
- `/technician/history` → `TechnicianHistory`

Approver-only routes:
- `/approvals/pending` → `ApprovalsPending`
- `/approvals/:flowId` → `ApprovalDetails`

Protected access:
- Technician pages require role `TECHNICIAN` or `ADMIN`
- Approver pages require role `APPROVER` or `ADMIN`

---

## 2. Technician task list flow

### 2.1 `TechnicianTasks.jsx`

This page is the technician landing page for assigned work.

Behavior:
- Uses `useTechnicianTasks()` hook.
- Renders a table of tasks.
- Each row has a `View` button that navigates to `/technician/tasks/${task.id}`.

Displayed columns:
- `CR ID`
- `Title`
- `Region`
- `Risk`
- `Status`

### 2.2 `useTechnicianTasks.js`

This hook:
- Calls `getMyTasks()` from `technicianService`
- Stores:
  - `tasks`
  - `loading`
  - `error`
- Loads once on mount

If loading, the page shows `Loader`.
If there is an error, it shows `AlertMessage`.

---

## 3. Technician task details page

### 3.1 `TechnicianTaskDetails.jsx`

This page renders detailed information for a single technician assignment.

Key behavior:
- Reads `crId` from `useParams()`.
- Calls `getTaskDetails(crId)` to load the task and assignment details.
- Then calls `getRunbookDetails(runbookId)` to load the runbook.
- Uses `console.log('TASK', data)` and `console.log('RUNBOOK', runbookData)` for debug visibility.
- Renders these sections:
  - Change request summary
  - Risk assessment
  - Generated runbook
  - Assigned technician
  - Execution status
- Adds loading / error state for both technician task and runbook fetch.

State variables in the component:
- `task` - normalized task details
- `runbookDetails` - runbook detail response
- `loading` - task loading state
- `error` - task error state
- `runbookLoading` - runbook loading state
- `runbookError` - runbook error state

### 3.2 Runbook rendering

`TechnicianTaskDetails` renders the following runbook sections:
- `Pre Checks`
- `Execution Steps`
- `Validation Steps`
- `Rollback Steps`
- `Monitoring Guidance`
- `Escalation Conditions`

It uses:
- `normalizeList(items)` to support:
  - arrays
  - single values
  - `null` / `undefined`
- `formatRunbookItem(item)` to avoid raw object rendering by extracting `text`, `description`, `step`, or `name`.

If no items exist, it shows `No details available.`

### 3.3 Data sources used by the page

From the API layer:
- Task details: `getTaskDetails(crId)`
- Separate runbook fetch: `getRunbookDetails(runbookId)`

From `task` object:
- `task.assessment` / `task.riskAssessment`
- `task.runbook`
- `task.assignedTechnician`
- `task.schedule` and scheduling fields
- `task.status`

From `runbookDetails` object:
- `preChecks`
- `executionSteps`
- `validationSteps`
- `rollbackSteps`
- `monitoringGuidance`
- `escalationConditions`

### 3.4 Buttons and navigation

The page provides:
- `Schedule execution` → `/technician/tasks/${crId}/schedule`
- `Open execution` → `/technician/tasks/${crId}/execute`
- `Back to task list` → `/technician/tasks`

---

## 4. Frontend service / API call chain

### 4.1 `telecom-change-ui/src/services/technicianService.js`

This file is the main technician data adapter.

Important exported functions:
- `getTechnicianList()`
- `getTechnicianDashboard()`
- `getMyTasks()`
- `getTaskDetails(crId)`
- `getRunbookDetails(crId)`
- `scheduleTask(crId, payload)`
- `startTaskExecution(crId)`
- `completeTaskExecution(crId, payload)`
- `getExecutionHistory()`
- `assignTechnician(crId, technicianId)`

It also contains normalization logic for:
- task payloads
- runbook payloads
- assessment payloads
- schedule fields
- technician assignment and status

Normalization supports backend payload variations such as:
- `changeRequest` / `change_request`
- `riskAssessment` / `risk_assessment`
- `runbook` / `generatedRunbook` / `runbookDetails` / `runbook_detail`
- `preChecks` / `pre_checks`
- `executionSteps` / `execution_steps`
- `validationSteps` / `validation_steps` / `validation`
- `rollbackSteps` / `rollback_steps` / `rollback`
- `monitoringGuidance` / `monitoring_guidance`
- `escalationConditions` / `escalation_conditions`

### 4.2 `telecom-change-ui/src/api/technicianApi.js`

Low-level HTTP methods:
- `fetchTechnicianList()` → `GET ${TECHNICIAN_API}/v1/technicians/list`
- `fetchTechnicianDashboard()` → `GET ${TECHNICIAN_API}/v1/technicians/dashboard`
- `fetchMyTasks()` → `GET ${TECHNICIAN_API}/v1/technicians/my-tasks`
- `fetchTaskDetails(crId)` → `GET ${TECHNICIAN_API}/v1/technicians/task/${crId}`
- `scheduleTask(crId, payload)` → `POST ${TECHNICIAN_API}/v1/technicians/${crId}/schedule`
- `startExecution(crId)` → `POST ${TECHNICIAN_API}/v1/technicians/${crId}/start`
- `completeExecution(crId, payload)` → `POST ${TECHNICIAN_API}/v1/technicians/${crId}/complete`
- `fetchExecutionHistory()` → `GET ${TECHNICIAN_API}/v1/technicians/execution-history`
- `assignTechnician(crId, payload)` → `POST ${TECHNICIAN_API}/v1/technicians/assign/${crId}`

### 4.3 `telecom-change-ui/src/api/runbookApi.js`

Runbook backend endpoints:
- `fetchEligibleCRs()` → `GET http://localhost:9096/v1/runbooks/eligible-crs`
- `generateRunbook(crId)` → `POST http://localhost:9096/v1/runbooks/generate/${crId}`
- `fetchRunbooks()` → `GET http://localhost:9096/v1/runbooks`
- `fetchRunbookDetails(crId)` → `GET http://localhost:9096/v1/runbooks/${crId}`

### 4.4 Approver assignment flow

`ApprovalDetails.jsx` uses:
- `getTechnicianList()` - load available technicians for assignment
- `assignTechnician(approval.crId, selectedTechnicianId)` - assign selected technician to an approved CR

The assignment modal appears after an approver approves a flow.

---

## 5. Backend Technician Service APIs

### 5.1 `TechnicianController.java`

Base path: `/v1/technicians`

Endpoints:
- `GET /list` - list available technicians (APPROVER only)
- `POST /assign/{crId}` - assign a technician for a CR (APPROVER only)
- `GET /my-tasks` - get tasks for current technician
- `GET /task/{crId}` - get full task details for a CR
- `POST /{crId}/schedule` - schedule a task (TECHNICIAN only)
- `POST /{crId}/start` - start execution (TECHNICIAN only)
- `POST /{crId}/complete` - complete execution (TECHNICIAN only)
- `GET /execution-history` - completed execution history (TECHNICIAN only)
- `GET /dashboard` - technician dashboard counts

### 5.2 `TechnicianTaskService.java`

Core logic:
- `assignTechnician(crId, technicianId, assignedBy)`
  - creates or updates `TechnicianAssignment`
  - sets `status = ASSIGNED`
  - saves assignment to DB
- `listMyTasks(technicianId)`
  - returns assigned tasks for a technician
  - maps assignments to `TechnicianTaskDto`
- `getTaskDetails(crId)`
  - loads assignment by `crId`
  - fetches external change request, assessment, and runbook data
  - loads schedule and active execution log
  - returns `TaskDetailsResponse`
- `scheduleTask(crId, request, technicianId)`
  - checks assignment authorization
  - validates scheduled window
  - saves or updates `TechnicianSchedule`
  - updates assignment status to `SCHEDULED`
- `startExecution(crId, technicianId)`
  - checks authorization
  - updates assignment status to `IN_EXECUTION`
  - creates `ExecutionLog` with `IN_EXECUTION`
- `completeExecution(crId, request, technicianId)`
  - checks authorization
  - finalizes active execution log to `COMPLETED`
  - updates assignment status to `COMPLETED`
- `findExecutionHistory(technicianId)`
  - returns completed `ExecutionLog` records
- `getDashboard()`
  - counts assignments grouped by status
- `listAvailableTechnicians()`
  - returns active technicians

### 5.3 External runbook integration

`ExternalServiceClient.java` fetches external data using configured service URLs:
- `fetchChangeRequest(crId)` → `${changeRequestServiceUrl}/v1/change-requests/${crId}`
- `fetchAssessment(crId)` → `${changeRequestServiceUrl}/v1/change-requests/${crId}/assessment`
- `fetchRunbook(crId)` → `${runbookServiceUrl}/v1/runbooks/${crId}`

The runbook is returned as a generic `Map<String, Object>` and attached to the `TaskDetailsResponse`.

### 5.4 `TaskDetailsResponse.java`

Fields returned by `GET /task/{crId}`:
- `crId` (string)
- `changeRequest` (Map)
- `assessment` (Map)
- `runbook` (Map)
- assignment metadata
- schedule metadata
- execution metadata
- `rollbackRequired`
- `notes`

The frontend normalizes these fields before rendering.

---

## 6. Backend database tables and columns

These entities define the Technician Service persistence model.

### 6.1 `technician_assignments`
From `TechnicianAssignment.java`:
- `assignment_id` (PK, UUID string)
- `cr_id` (change request id)
- `technician_id`
- `assigned_by`
- `assigned_at` (timestamp)
- `status` (enum: `ASSIGNED`, `SCHEDULED`, `IN_EXECUTION`, `COMPLETED`)

### 6.2 `technician_schedules`
From `TechnicianSchedule.java`:
- `schedule_id` (PK, UUID string)
- `cr_id`
- `scheduled_start` (timestamp)
- `scheduled_end` (timestamp)
- `status` (enum: `SCHEDULED`)
- `created_at` (timestamp)

### 6.3 `execution_logs`
From `ExecutionLog.java`:
- `execution_id` (PK, UUID string)
- `cr_id`
- `technician_id`
- `execution_start` (timestamp)
- `execution_end` (timestamp)
- `execution_status` (enum: `IN_EXECUTION`, `COMPLETED`)
- `notes` (nullable text)
- `rollback_required` (boolean)
- `created_at` (timestamp)

### 6.4 `technicians`
From `Technician.java`:
- `technician_id` (PK, UUID string)
- `employee_code`
- `full_name`
- `email`
- `region`
- `specialization`
- `experience_years`
- `certifications`
- `availability_status`
- `current_workload`
- `active` (boolean)
- `created_at`

---

## 7. Approver -> Technician handoff flow

### 7.1 Approver action

In `ApprovalDetails.jsx`:
- The approver loads flow details via `getApprovalDetails(flowId)`.
- After clicking `Approve`, the page opens `TechnicianAssignmentModal`.
- It loads technicians via `getTechnicianList()`.
- The approver selects one and calls `assignTechnician(approval.crId, selectedTechnicianId)`.

This maps to backend:
- `POST /v1/technicians/assign/{crId}`
- Stores or updates `technician_assignments` with `status = ASSIGNED`
- Associates `technician_id` and `assigned_by`

### 7.2 Technician task discovery

A technician authenticated user sees assigned work via:
- `GET /v1/technicians/my-tasks`

Backend returns a list of `TechnicianTaskDto` objects built from assignment state plus schedule and execution status.

### 7.3 Task detail and runbook rendering

On `/technician/tasks/:crId`:
- `TechnicianTaskDetails.jsx` calls `GET /v1/technicians/task/{crId}`
- The backend assembles:
  - assignment data from `technician_assignments`
  - change request data from change request service
  - assessment data from change request service
  - runbook data from runbook service
  - schedule from `technician_schedules`
  - active execution log from `execution_logs`
- The frontend then separately fetches `GET /v1/runbooks/{crId}` from the runbook service for direct runbook detail.
- The UI renders normalized runbook sections.

---

## 8. Runbook data handling

### 8.1 Backend stores runbook externally

The Technician Service does not persist runbook content in its own DB tables.
Instead, it fetches runbook content from the external runbook service using `ExternalServiceClient.fetchRunbook(crId)`.

### 8.2 Frontend normalization

`technicianService.js` normalizes runbook shapes into these frontend fields:
- `preChecks`
- `executionSteps`
- `validationSteps`
- `rollbackSteps`
- `monitoringGuidance`
- `escalationConditions`

Normalization supports backend payload options like:
- `pre_checks`
- `execution_steps`
- `validation_steps`
- `rollback_steps`
- `monitoring_guidance`
- `escalation_conditions`

### 8.3 Rendering logic

The technician details page:
- uses `renderList()` to display array items or single values
- avoids printing raw objects directly
- gracefully handles missing or empty arrays

---

## 9. Key files summary

### Frontend
- `src/pages/technician/TechnicianTasks.jsx`
- `src/pages/technician/TechnicianTaskDetails.jsx`
- `src/hooks/useTechnicianTasks.js`
- `src/services/technicianService.js`
- `src/api/technicianApi.js`
- `src/api/runbookApi.js`
- `src/pages/ApprovalDetails.jsx`
- `src/components/TechnicianAssignmentModal.jsx`
- `src/App.jsx`

### Backend
- `technician-service/src/main/java/com/telecom/technician_service/controller/TechnicianController.java`
- `technician-service/src/main/java/com/telecom/technician_service/service/TechnicianTaskService.java`
- `technician-service/src/main/java/com/telecom/technician_service/service/ExternalServiceClient.java`
- `technician-service/src/main/java/com/telecom/technician_service/dto/TaskDetailsResponse.java`
- `technician-service/src/main/java/com/telecom/technician_service/entity/TechnicianAssignment.java`
- `technician-service/src/main/java/com/telecom/technician_service/entity/TechnicianSchedule.java`
- `technician-service/src/main/java/com/telecom/technician_service/entity/ExecutionLog.java`
- `technician-service/src/main/java/com/telecom/technician_service/entity/Technician.java`

---

## 10. How to replicate this system

To reproduce the Technician page workflow from scratch, implement:
1. Technician assignment storage with `technician_assignments`
2. Technician scheduling with `technician_schedules`
3. Execution logs with `execution_logs`
4. Approver assignment UI and API call to `POST /v1/technicians/assign/{crId}`
5. Technician task list API `/v1/technicians/my-tasks`
6. Technician task detail API `/v1/technicians/task/{crId}` that merges assignment, schedule, execution, CR, assessment, and runbook data
7. Frontend task list and task details pages with the route structure shown above
8. Runbook integration using `GET /v1/runbooks/{crId}` and normalize the result for frontend render

This document is intentionally detailed so you can rebuild the workflow end-to-end.
