import * as runbookApi from '../api/runbookApi'

const normalizeRunbook = (runbook) => {
  if (!runbook) return null
  return {
    ...runbook,
    crId: runbook.crId || runbook.id || null,
    title: runbook.title || runbook.crTitle || 'Untitled Runbook',
    riskLevel: runbook.riskLevel || runbook.risk_level || 'UNKNOWN',
    blastRadius: runbook.blastRadius || runbook.blast_radius || 'UNKNOWN',
    estimatedDurationMins: runbook.estimatedDurationMins || runbook.estimated_duration_mins || runbook.duration || runbook.durationMins || null,
    duration: runbook.duration || runbook.durationMins || runbook.estimatedDurationMins || runbook.estimated_duration_mins || null,
    status: (runbook.status || 'DRAFT').toUpperCase(),
    generatedAt: runbook.generatedAt || runbook.generated_at || runbook.createdAt || null,
    generatedBy: runbook.generatedBy || runbook.generated_by || 'AI Agent',
    prechecks: Array.isArray(runbook.prechecks) ? runbook.prechecks : runbook.precheckSteps || [],
    executionSteps: Array.isArray(runbook.executionSteps) ? runbook.executionSteps : runbook.execution_steps || [],
    validationSteps: Array.isArray(runbook.validationSteps) ? runbook.validationSteps : runbook.validation_steps || [],
    rollbackPlan: runbook.rollbackPlan || runbook.rollback_plan || null,
    monitoringGuidance: runbook.monitoringGuidance || runbook.monitoring_guidance || null,
    escalationConditions: Array.isArray(runbook.escalationConditions) ? runbook.escalationConditions : runbook.escalation_conditions || [],
  }
}

const logResponse = (label, data) => {
  if (import.meta.env.DEV) {
    console.debug(`[runbookService] ${label}`, data)
  }
}

export const listRunbooks = async () => {
  try {
    const data = await runbookApi.fetchRunbooks()
    const runbooks = Array.isArray(data) ? data.map(normalizeRunbook) : []
    logResponse('listRunbooks', runbooks)
    return runbooks
  } catch (error) {
    console.error('[runbookService] listRunbooks failed', error)
    throw error
  }
}

export const getRunbookDetails = async (crId) => {
  try {
    const data = await runbookApi.fetchRunbookDetails(crId)
    const runbook = normalizeRunbook(data)
    logResponse('getRunbookDetails', runbook)
    return runbook
  } catch (error) {
    console.error('[runbookService] getRunbookDetails failed', error)
    throw error
  }
}
