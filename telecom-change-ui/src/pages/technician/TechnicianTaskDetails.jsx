import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { getTaskDetails, getRunbookDetails } from '../../services/technicianService'
import Loader from '../../components/Loader'
import Card from '../../components/ui/Card'
import AlertMessage from '../../components/AlertMessage'
import RiskAssessmentCard from '../../components/risk/RiskAssessmentCard'

const TechnicianTaskDetails = () => {
  const { crId } = useParams()
  const navigate = useNavigate()
  const [task, setTask] = useState(null)
  const [runbookDetails, setRunbookDetails] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [runbookLoading, setRunbookLoading] = useState(false)
  const [runbookError, setRunbookError] = useState(null)
  const [riskOpen, setRiskOpen] = useState(true)

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      setError(null)
      setRunbookError(null)
      setRunbookDetails(null)

      try {
        const data = await getTaskDetails(crId)
        console.log('TASK', data)
        setTask(data)

        const runbookId = data?.id || data?.crId || crId
        if (runbookId) {
          setRunbookLoading(true)
          try {
            const runbookData = await getRunbookDetails(runbookId)
            console.log('RUNBOOK', runbookData)
            setRunbookDetails(runbookData)
          } catch (runbookErr) {
            console.error('Failed to load runbook', runbookErr)
            setRunbookError(runbookErr?.message || 'Unable to load runbook.')
          } finally {
            setRunbookLoading(false)
          }
        }
      } catch (err) {
        setError(err?.message || 'Unable to load task details.')
      } finally {
        setLoading(false)
      }
    }

    if (crId) {
      load()
    }
  }, [crId])

  if (loading) return <Loader />

  if (!task) {
    return <AlertMessage type="error" message={error || 'Task not found.'} />
  }

  const risk = task.assessment || task.riskAssessment || {}
  const runbook = runbookDetails || task.runbook || {}
  console.log('RUNBOOK', runbook)
  const assignedTechnician = task.assignedTechnician || {}

  const startTime = task.scheduledStart || task.scheduled_start || task.schedule?.scheduledStart || task.schedule?.scheduled_start || null
  const endTime = task.scheduledEnd || task.scheduled_end || task.schedule?.scheduledEnd || task.schedule?.scheduled_end || null
  const etaMinutes = task.etaMinutes != null ? task.etaMinutes : startTime && endTime ? Math.max(0, Math.round((new Date(endTime) - new Date(startTime)) / 60000)) : null

  const normalizeList = (items) => {
    if (items == null) return []
    if (Array.isArray(items)) return items.filter((item) => item != null)
    if (typeof items === 'string') {
      try {
        const parsed = JSON.parse(items)
        if (Array.isArray(parsed)) return parsed.filter((item) => item != null)
        if (parsed != null) return [parsed]
      } catch (error) {
        return [items]
      }
    }
    return [items]
  }

  const RUNBOOK_PREVIEW_LIMIT = 2
  const runbookPreviewSections = [
    runbook.preChecks || [],
    runbook.executionSteps || [],
    runbook.validationSteps || [],
    runbook.rollbackSteps || [],
    runbook.monitoringGuidance || [],
    runbook.escalationConditions || [],
  ]
  const hasExtendedRunbook = runbookPreviewSections.some((section) => normalizeList(section).length > RUNBOOK_PREVIEW_LIMIT)

  const renderRunbookSection = (items, itemRenderer, emptyMessage = 'No details available.', limit = RUNBOOK_PREVIEW_LIMIT) => {
    const normalizedItems = normalizeList(items)
    if (!normalizedItems.length) return <p className="text-sm text-slate-500">{emptyMessage}</p>
    const displayedItems = normalizedItems.slice(0, limit)
    return (
      <>
        <ul className="space-y-2 text-sm text-slate-600">
          {displayedItems.map((item, index) => (
            <li key={index} className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
              {itemRenderer(item, index)}
            </li>
          ))}
        </ul>
        {normalizedItems.length > limit && (
          <p className="text-xs text-slate-500">Showing first {limit} of {normalizedItems.length} items. View the full runbook to see all details.</p>
        )}
      </>
    )
  }

  const renderPreChecks = (items, limit = 5) =>
    renderRunbookSection(items, (item, index) => {
      const number = item?.check_number ?? item?.number ?? index + 1
      const description = item?.check_description || item?.description || item?.desc
      const command = item?.check_command || item?.command
      const expected = item?.check_expected_output || item?.expected_output || item?.expectedOutput || item?.expected
      return (
        <div className="space-y-2">
          <div className="font-semibold text-slate-900">Pre Check #{number}</div>
          {description && <div>Description: {description}</div>}
          {command && <div>Command: {command}</div>}
          {expected && <div>Expected: {expected}</div>}
        </div>
      )
    })

  const renderExecutionSteps = (items, limit = 5) =>
    renderRunbookSection(items, (item, index) => {
      const number = item?.step_number ?? item?.stepNumber ?? item?.number ?? index + 1
      const action = item?.action || item?.step || item?.description || item?.text
      const expected = item?.expected_output || item?.expectedOutput || item?.expected
      const rollback = item?.rollback_action || item?.rollbackAction || item?.rollback
      const timeout = item?.timeout_seconds || item?.timeoutSeconds || item?.timeout
      return (
        <div className="space-y-2">
          <div className="font-semibold text-slate-900">Step #{number}</div>
          {action && <div>Action: {action}</div>}
          {expected && <div>Expected: {expected}</div>}
          {rollback && <div>Rollback: {rollback}</div>}
          {timeout != null && <div>Timeout: {timeout}s</div>}
        </div>
      )
    })

  const renderValidationSteps = (items, limit = 5) =>
    renderRunbookSection(items, (item, index) => {
      const number = item?.validation_number ?? item?.validationNumber ?? item?.number ?? index + 1
      const description = item?.validation_description || item?.description || item?.validationDescription || item?.desc
      const command = item?.validation_command || item?.command
      const expected = item?.validation_expected_output || item?.expected_output || item?.expectedOutput || item?.expected
      return (
        <div className="space-y-2">
          <div className="font-semibold text-slate-900">Validation Step #{number}</div>
          {description && <div>Description: {description}</div>}
          {command && <div>Command: {command}</div>}
          {expected && <div>Expected: {expected}</div>}
        </div>
      )
    })

  const renderRollbackSteps = (items, limit = 5) =>
    renderRunbookSection(items, (item, index) => {
      const number = item?.rollback_number ?? item?.rollbackNumber ?? item?.number ?? index + 1
      const description = item?.rollback_description || item?.description || item?.rollbackDescription || item?.desc
      const command = item?.rollback_command || item?.command
      const expected = item?.rollback_expected_output || item?.expected_output || item?.expectedOutput || item?.expected
      return (
        <div className="space-y-2">
          <div className="font-semibold text-slate-900">Rollback Step #{number}</div>
          {description && <div>Description: {description}</div>}
          {command && <div>Command: {command}</div>}
          {expected && <div>Expected: {expected}</div>}
        </div>
      )
    })

  const renderMonitoringGuidance = (items, limit = 5) =>
    renderRunbookSection(items, (item, index) => {
      const number = item?.monitoring_number ?? item?.monitoringNumber ?? item?.number ?? index + 1
      const description = item?.monitoring_description || item?.description || item?.monitoringDescription || item?.desc
      const command = item?.monitoring_command || item?.command
      const expected = item?.monitoring_expected_output || item?.expected_output || item?.expectedOutput || item?.expected
      return (
        <div className="space-y-2">
          <div className="font-semibold text-slate-900">Monitoring Guidance #{number}</div>
          {description && <div>Description: {description}</div>}
          {command && <div>Command: {command}</div>}
          {expected && <div>Expected: {expected}</div>}
        </div>
      )
    })

  const renderEscalationConditions = (items, limit = 5) =>
    renderRunbookSection(items, (item, index) => {
      const number = item?.escalation_number ?? item?.escalationNumber ?? item?.number ?? index + 1
      const description = item?.escalation_description || item?.description || item?.escalationDescription || item?.desc
      const command = item?.escalation_command || item?.command
      const expected = item?.escalation_expected_output || item?.expected_output || item?.expectedOutput || item?.expected
      return (
        <div className="space-y-2">
          <div className="font-semibold text-slate-900">Escalation Condition #{number}</div>
          {description && <div>Description: {description}</div>}
          {command && <div>Command: {command}</div>}
          {expected && <div>Expected: {expected}</div>}
        </div>
      )
    })

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">Task details</h1>
            <p className="mt-2 text-sm text-slate-600">View request, assessment, and runbook information for this assigned task.</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => navigate(`/technician/tasks/${crId}/execute`)}
              className="rounded-2xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
            >
              Open execution
            </button>
          </div>
        </div>
      </div>

      {error && <AlertMessage type="error" message={error} />}

      <div className="grid gap-6 lg:grid-cols-[1.4fr_0.6fr]">
        <div className="space-y-6">
          <Card title="Change request">
            <dl className="grid gap-4 text-sm text-slate-600">
              <div>
                <dt className="font-semibold text-slate-900">Title</dt>
                <dd>{task.title || 'Untitled request'}</dd>
              </div>
              <div>
                <dt className="font-semibold text-slate-900">Description</dt>
                <dd>{task.description || task.summary || 'No description available.'}</dd>
              </div>
              <div>
                <dt className="font-semibold text-slate-900">Domain</dt>
                <dd>{task.domain || '—'}</dd>
              </div>
              <div>
                <dt className="font-semibold text-slate-900">Region</dt>
                <dd>{task.region || '—'}</dd>
              </div>
              <div>
                <dt className="font-semibold text-slate-900">Change type</dt>
                <dd>{task.changeType || task.change_type || task.type || '—'}</dd>
              </div>
              <div>
                <dt className="font-semibold text-slate-900">Scheduled Start</dt>
                <dd>{startTime ? new Date(startTime).toLocaleString() : 'Not scheduled'}</dd>
              </div>
              <div>
                <dt className="font-semibold text-slate-900">Scheduled End</dt>
                <dd>{endTime ? new Date(endTime).toLocaleString() : 'Not scheduled'}</dd>
              </div>
              <div>
                <dt className="font-semibold text-slate-900">ETA</dt>
                <dd>{etaMinutes != null ? `${etaMinutes} minutes` : 'Not available'}</dd>
              </div>
            </dl>
          </Card>

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">Risk assessment</h2>
                <p className="mt-1 text-sm text-slate-600">Toggle risk details for the current request.</p>
              </div>
              <button
                type="button"
                onClick={() => setRiskOpen((open) => !open)}
                className="rounded-2xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"
              >
                {riskOpen ? 'Hide risk' : 'View risk'}
              </button>
            </div>
          </div>

          {riskOpen ? (
            <RiskAssessmentCard assessment={risk} loading={false} error={runbookError && 'Unable to load risk assessment.'} />
          ) : (
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6 text-sm text-slate-600">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <p className="font-semibold text-slate-900">Risk level</p>
                  <p>{risk?.riskLevel || 'Unknown'}</p>
                </div>
                <div>
                  <p className="font-semibold text-slate-900">Risk score</p>
                  <p>{risk?.riskScore != null ? risk.riskScore : '—'}</p>
                </div>
                <div>
                  <p className="font-semibold text-slate-900">Blast radius</p>
                  <p>{risk?.blastRadius || 'N/A'}</p>
                </div>
                <div>
                  <p className="font-semibold text-slate-900">Confidence</p>
                  <p>{risk?.confidence != null ? `${Math.round(risk.confidence * 100)}%` : 'Unknown'}</p>
                </div>
              </div>
            </div>
          )}

          <Card title="Generated runbook">
            <div className="space-y-5 text-sm text-slate-600">
              {runbookLoading && <p className="text-sm text-slate-500">Loading runbook...</p>}
              {runbookError && <AlertMessage type="warning" message={runbookError} />}
              <div>
                <p className="font-semibold text-slate-900">Pre checks</p>
                {renderPreChecks(runbook.preChecks || [], 5)}
              </div>
              <div>
                <p className="font-semibold text-slate-900">Execution steps</p>
                {renderExecutionSteps(runbook.executionSteps || [], 5)}
              </div>
                  <div>
                <p className="font-semibold text-slate-900">Validation steps</p>
                {renderValidationSteps(runbook.validationSteps || [])}
              </div>
              <div>
                <p className="font-semibold text-slate-900">Rollback steps</p>
                {renderRollbackSteps(runbook.rollbackSteps || [])}
              </div>
              <div>
                <p className="font-semibold text-slate-900">Monitoring guidance</p>
                {renderMonitoringGuidance(runbook.monitoringGuidance || [])}
              </div>
              <div>
                <p className="font-semibold text-slate-900">Escalation conditions</p>
                {renderEscalationConditions(runbook.escalationConditions || [])}
              </div>
              {hasExtendedRunbook && (
                <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
                  <p className="font-semibold text-slate-900">Runbook preview is shortened for readability.</p>
                  <p>Use the button below to open the full runbook with all sections and steps.</p>
                </div>
              )}
              <div>
                <button
                  type="button"
                  onClick={() => navigate(`/runbooks/${task.id}`)}
                  className="rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
                >
                  View full runbook
                </button>
              </div>
            </div>
          </Card>
        </div>

        <div className="space-y-6">
          <Card title="Assigned technician">
            <div className="space-y-3 text-sm text-slate-600">
              <div>
                <p className="font-semibold text-slate-900">Name</p>
                <p>{assignedTechnician?.name || 'Unassigned'}</p>
              </div>
              <div>
                <p className="font-semibold text-slate-900">Email</p>
                <p>{assignedTechnician?.email || 'N/A'}</p>
              </div>
              <div>
                <p className="font-semibold text-slate-900">Region</p>
                <p>{assignedTechnician?.region || 'N/A'}</p>
              </div>
              <div>
                <p className="font-semibold text-slate-900">Specialization</p>
                <p>{assignedTechnician?.specialization || 'N/A'}</p>
              </div>
              <div>
                <p className="font-semibold text-slate-900">Experience</p>
                <p>{assignedTechnician?.experienceYears != null ? `${assignedTechnician.experienceYears} years` : 'N/A'}</p>
              </div>
              <div>
                <p className="font-semibold text-slate-900">Certifications</p>
                <p>{assignedTechnician?.certifications || 'None'}</p>
              </div>
              <div>
                <p className="font-semibold text-slate-900">Availability</p>
                <p>{assignedTechnician?.availabilityStatus || assignedTechnician?.status || 'Unknown'}</p>
              </div>
              <div>
                <p className="font-semibold text-slate-900">Assignment status</p>
                <p>{task.assignmentStatus || task.status || 'UNKNOWN'}</p>
              </div>
            </div>
          </Card>

          <Card title="Execution status">
            <div className="space-y-3 text-sm text-slate-600">
              <div>
                <p className="font-semibold text-slate-900">Current status</p>
                <p>{task.executionStatus || task.status || 'UNKNOWN'}</p>
              </div>
              <div>
                <p className="font-semibold text-slate-900">Last updated</p>
                <p>{task.completedAt ? new Date(task.completedAt).toLocaleString() : task.updatedAt ? new Date(task.updatedAt).toLocaleString() : '—'}</p>
              </div>
            </div>
          </Card>
        </div>
      </div>

      <button
        type="button"
        onClick={() => navigate('/technician/tasks')}
        className="text-sm font-semibold text-slate-700 hover:text-slate-900"
      >
        Back to task list
      </button>
    </div>
  )
}

export default TechnicianTaskDetails
