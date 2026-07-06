Migration checklist — UI changes and QA steps

Overview
- This checklist documents UI updates applied to the Telecom Change frontend and provides QA steps to validate each change.

Summary of changes
- Removed "Risk Assessments" from Engineer sidebar; adjusted workflow text.
- Updated CR list columns: removed Risk Level and Risk Score; added Region, Created, Action (View).
- Removed the manual "Confirm Risk" step from UI and timeline.
- Fixed approver email rendering to use normalized `approver` field.
- Added a Risk Assessment detail page at `/cr/:id/risk` and a "View risk" button on the CR details page.
- Added "Runbooks" nav item for Approver and Admin; runbook generation and details pages available at `/runbooks` and `/runbooks/:crId`.
- Hid `My CRs` from the Technician role and removed the Technician Dashboard nav item.
- Adjusted Technician dashboard labels to match the approved lifecycle (Ready / Executing / Completed).
- Improved Technician task DTO normalization to expose `region`, `domain`, `changeType`, and `risk` consistently.
- Improved runbook rendering to explicitly show `action`, `expected_output`, `rollback_action`, and `timeout_seconds` when present.
- Added execution history actions linking rows to the detailed execution page for review.
- Created this migration checklist and QA steps.

Files changed (high level)
- `src/components/Sidebar.jsx`
- `src/pages/CRList.jsx`
- `src/pages/CRDetails.jsx`
- `src/pages/CRRisk.jsx` (new)
- `src/pages/Runbooks.jsx` (existing wired)
- `src/pages/technician/TechnicianDashboard.jsx`
- `src/pages/technician/TechnicianTasks.jsx`
- `src/pages/technician/TechnicianTaskDetails.jsx`
- `src/pages/technician/TechnicianExecution.jsx`
- `src/pages/technician/TechnicianHistory.jsx`
- `src/services/technicianService.js`
- `src/services/approvalService.js`
- `src/pages/ApprovalHistory.jsx`
- `src/components/StatusBadge.jsx`

Quick verification (frontend)
1. Start the frontend:

   npm install
   npm run dev

2. Authenticate as different roles (ENGINEER, APPROVER, TECHNICIAN):
   - Verify sidebar items per role:
     - ENGINEER: Dashboard, Create CR, My CRs
     - APPROVER: Runbooks, Pending Approvals, Approval History
     - TECHNICIAN: My Tasks, Execution History (no "My CRs" or Technician Dashboard)

3. CR list (`/cr/list`):
   - Columns: CR ID, Title, Status, Region, Created, Action
   - Click "View" opens details

4. CR details (`/cr/details/:id`):
   - No "Confirm risk" button
   - "View risk" button links to `/cr/:id/risk`
   - Risk assessment card renders when available

5. Risk assessment page (`/cr/:id/risk`):
   - Shows Risk Level, Risk Score, Blast Radius, Confidence, Executive Summary, Technical Analysis, CAB Guidance, Recommendations, Indicators

6. Runbooks (`/runbooks` and `/runbooks/:crId`):
   - Generate and view runbooks for eligible CRs
   - Approver role can see Runbooks nav

7. Technician task details and execution:
   - `TechnicianTaskDetails` shows Region, Domain, Change Type, Risk
   - Runbook step items display detailed fields (action, expected, rollback, timeout) when present
   - Execution page (`/technician/tasks/:crId/execute`) shows start/complete workflow
   - Execution history shows a "View" action linking to the execution page

Backend assumptions / caveats
- These are frontend-only changes. If some fields are missing in API responses (e.g., `domain`, `changeType`, `runbook` objects), the frontend normalizes using multiple fallbacks. Where data is not present, backend changes will be required.

Suggested QA checklist
- Smoke test: walk a CR from create → submit → analysis → approval paths and verify UI updates reflect backend events.
- Runbook test: generate a runbook for an eligible CR and verify details render with expected fields.
- Execution test: assign a technician, schedule, start, and complete a task — verify timeline and execution history reflect actions.
- Cross-role test: login as each role and verify sidebar visibility and access control for routes.

If you want, I can also:
- Open a PR with these changes and a summary diff.
- Run the frontend locally and perform the smoke tests listed above.

---
Generated on 2026-06-03
