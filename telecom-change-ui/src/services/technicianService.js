import * as technicianApi from '../api/technicianApi'
import { fetchRunbookDetails } from '../api/runbookApi'

const normalizeTask = (task) => {
  if (!task) return null

  const changeRequest =
    task.changeRequest ||
    task.change_request ||
    task.changeRequestDetails ||
    task.change_request_details ||
    task.payload?.changeRequest ||
    task.payload?.change_request ||
    task.request ||
    task.data ||
    {}

  const assessment =
    task.assessment ||
    task.riskAssessment ||
    task.risk_assessment ||
    changeRequest.assessment ||
    changeRequest.riskAssessment ||
    changeRequest.risk_assessment ||
    changeRequest.assessment_detail ||
    changeRequest.risk ||
    {}

  const rawRunbook =
    task.runbook ||
    task.generatedRunbook ||
    task.runbookDetails ||
    task.runbook_detail ||
    {}

  const runbook = {
    ...rawRunbook,
    preChecks: rawRunbook.preChecks || rawRunbook.pre_checks || [],
    executionSteps:
      rawRunbook.executionSteps || rawRunbook.execution_steps || [],
    validationSteps:
      rawRunbook.validationSteps || rawRunbook.validation_steps || rawRunbook.validation || [],
    rollbackSteps:
      rawRunbook.rollbackSteps || rawRunbook.rollback_steps || rawRunbook.rollback || [],
    monitoringGuidance:
      rawRunbook.monitoringGuidance || rawRunbook.monitoring_guidance || rawRunbook.monitoring || [],
    escalationConditions:
      rawRunbook.escalationConditions || rawRunbook.escalation_conditions || rawRunbook.escalation || [],
  }

  const scheduledStart =
    task.scheduledStart ||
    task.scheduled_start ||
    changeRequest.scheduledStart ||
    changeRequest.scheduled_start ||
    task.schedule?.scheduledStart ||
    task.schedule?.scheduled_start ||
    null

  const scheduledEnd =
    task.scheduledEnd ||
    task.scheduled_end ||
    changeRequest.scheduledEnd ||
    changeRequest.scheduled_end ||
    task.schedule?.scheduledEnd ||
    task.schedule?.scheduled_end ||
    null

  const schedule = {
    ...(task.schedule || task.scheduled || {}),
    executionDate:
      task.schedule?.executionDate ||
      task.schedule?.execution_date ||
      scheduledStart ||
      null,
    executionTime:
      task.schedule?.executionTime ||
      task.schedule?.execution_time ||
      scheduledStart ||
      null,
  }

  const normalizedAssessment = {
    ...assessment,
    riskLevel: assessment.riskLevel || assessment.risk_level || assessment.riskRating || assessment.risk_rating,
    riskScore: assessment.riskScore ?? assessment.risk_score ?? assessment.score ?? assessment.score,
    blastRadius: assessment.blastRadius || assessment.blast_radius,
    confidence:
      assessment.confidence ?? assessment.confidenceScore ?? assessment.confidence_score ?? null,
    executiveSummary:
      assessment.executiveSummary ||
      assessment.executive_summary ||
      assessment.summary ||
      null,
    technicalAnalysis:
      assessment.technicalAnalysis ||
      assessment.technical_analysis ||
      assessment.reasoning ||
      null,
    cabGuidance: assessment.cabGuidance || assessment.cab_guidance || null,
  }

  const status =
    (task.status || task.assignmentStatus || task.assignment_status || task.executionStatus || task.execution_status || task.state || 'UNKNOWN')
      .toString()
      .toUpperCase()

  const assignedTechnician =
    task.assignedTechnician ||
    task.technician ||
    task.assignee ||
    task.assignedTo ||
    (task.technicianId ? { id: task.technicianId, name: task.technicianId } : null)

  return {
    id:
      task.crId ||
      task.id ||
      task.changeRequestId ||
      task.requestId ||
      changeRequest.crId ||
      changeRequest.id ||
      null,
    title:
      task.title ||
      task.name ||
      changeRequest.title ||
      changeRequest.name ||
      changeRequest.crTitle ||
      changeRequest.requestTitle ||
      null,
    description:
      task.description ||
      task.summary ||
      changeRequest.description ||
      changeRequest.summary ||
      changeRequest.details ||
      null,
    region:
      task.region ||
      task.location ||
      changeRequest.region ||
      changeRequest.location ||
      changeRequest.site ||
      null,
    domain:
      task.domain ||
      task.domainName ||
      changeRequest.domain ||
      changeRequest.domainName ||
      changeRequest.serviceDomain ||
      null,
    changeType:
      task.changeType ||
      task.change_type ||
      changeRequest.changeType ||
      changeRequest.change_type ||
      task.type ||
      changeRequest.type ||
      changeRequest.changeRequestType ||
      null,
    risk:
      task.riskLevel ||
      task.risk_level ||
      task.riskRating ||
      task.risk_rating ||
      normalizedAssessment.riskLevel ||
      null,
    riskScore:
      task.riskScore ??
      task.risk_score ??
      normalizedAssessment.riskScore ??
      null,
    status,
    assignmentStatus: task.assignmentStatus || task.assignment_status || null,
    executionStatus: task.executionStatus || task.execution_status || null,
    assignedTechnician: {
      ...assignedTechnician,
      name: assignedTechnician?.name || assignedTechnician?.fullName || assignedTechnician?.email || assignedTechnician?.id || null,
      email: assignedTechnician?.email || assignedTechnician?.userEmail || null,
      role: assignedTechnician?.role || assignedTechnician?.title || 'TECHNICIAN',
    },
    technicianId: task.technicianId || task.technician_id || assignedTechnician?.id || null,
    assignedBy: task.assignedBy || task.assigned_by || null,
    assignedAt: task.assignedAt || task.assigned_at || null,
    scheduledStart,
    scheduledEnd,
    etaMinutes:
      scheduledStart && scheduledEnd
        ? Math.max(0, Math.round((new Date(scheduledEnd) - new Date(scheduledStart)) / 60000))
        : null,
    scheduleStatus:
      task.scheduleStatus || task.schedule_status || schedule.status || null,
    schedule,
    executionStart: task.executionStart || task.execution_start || null,
    executionEnd: task.executionEnd || task.execution_end || null,
    rollbackRequired: task.rollbackRequired ?? task.rollback_required ?? false,
    notes: task.notes || task.note || null,
    assessment: normalizedAssessment,
    runbook,
    executionNotes: task.executionNotes || task.execution_notes || null,
    completedAt: task.completedAt || task.completed_at || null,
    createdAt: task.createdAt || task.created_at || null,
  }
}

const normalizeDashboard = (payload) => {
  if (!payload) return {
    totalTasks: 0,
    scheduled: 0,
    inProgress: 0,
    completed: 0,
    recentTasks: [],
  }

  return {
    totalTasks: (payload.totalTasks ?? payload.total_tasks ?? payload.total ?? payload.assigned) || 0,
    scheduled: (payload.scheduled ?? payload.scheduledTasks ?? payload.scheduled_tasks) || 0,
    inProgress: (payload.inProgress ?? payload.in_progress ?? payload.inProgressTasks ?? payload.inExecution) || 0,
    completed: (payload.completed ?? payload.completedTasks ?? payload.completed_tasks) || 0,
    recentTasks: Array.isArray(payload.recentTasks)
      ? payload.recentTasks.map(normalizeTask)
      : Array.isArray(payload.tasks)
      ? payload.tasks.slice(0, 5).map(normalizeTask)
      : [],
  }
}

const normalizeTechnician = (technician) => {
  if (!technician) return null
  return {
    id: technician.id || technician.techId || technician.technicianId || null,
    code:
      technician.technicianCode ||
      technician.employeeCode ||
      technician.technicianId ||
      technician.id ||
      null,
    name:
      technician.name ||
      technician.fullName ||
      technician.technicianName ||
      technician.email ||
      'Unnamed Technician',
    email:
      technician.email ||
      technician.userEmail ||
      technician.user_email ||
      null,
    region:
      technician.region ||
      technician.location ||
      technician.site ||
      null,
    specialization:
      technician.specialization ||
      technician.skill ||
      technician.discipline ||
      null,
    experienceYears:
      technician.experienceYears ||
      technician.experience_years ||
      technician.yearsOfExperience ||
      null,
    certifications:
      technician.certifications ||
      technician.certs ||
      technician.certification ||
      null,
    status:
      technician.status ||
      technician.availabilityStatus ||
      technician.availability ||
      null,
    availabilityStatus:
      technician.availabilityStatus ||
      technician.status ||
      null,
  }
}

const normalizeRunbook = (rawRunbook) => {
  if (!rawRunbook) return null
  return {
    ...rawRunbook,
    preChecks: rawRunbook.preChecks || rawRunbook.pre_checks || [],
    executionSteps: rawRunbook.executionSteps || rawRunbook.execution_steps || [],
    validationSteps:
      rawRunbook.validationSteps || rawRunbook.validation_steps || rawRunbook.validation || [],
    rollbackSteps:
      rawRunbook.rollbackSteps || rawRunbook.rollback_steps || rawRunbook.rollback || [],
    monitoringGuidance:
      rawRunbook.monitoringGuidance || rawRunbook.monitoring_guidance || rawRunbook.monitoring || [],
    escalationConditions:
      rawRunbook.escalationConditions || rawRunbook.escalation_conditions || rawRunbook.escalation || [],
  }
}

export const getRunbookDetails = async (crId) => {
  try {
    const data = await fetchRunbookDetails(crId)
    return normalizeRunbook(data)
  } catch (error) {
    console.error('[technicianService] getRunbookDetails failed', error)
    throw error
  }
}

export const getTechnicianList = async () => {
  try {
    const data = await technicianApi.fetchTechnicianList()
    return Array.isArray(data) ? data.map(normalizeTechnician) : []
  } catch (error) {
    console.error('[technicianService] getTechnicianList failed', error)
    throw error
  }
}

export const getTechnicianDashboard = async () => {
  try {
    const data = await technicianApi.fetchTechnicianDashboard()
    return normalizeDashboard(data)
  } catch (error) {
    console.error('[technicianService] getTechnicianDashboard failed', error)
    throw error
  }
}

export const getTechnicianProfile = async () => {
  try {
    const data = await technicianApi.fetchTechnicianProfile()
    return normalizeTechnician(data)
  } catch (error) {
    console.error('[technicianService] getTechnicianProfile failed', error)
    throw error
  }
}

export const getMyTasks = async () => {
  try {
    const data = await technicianApi.fetchMyTasks()
    const tasks = Array.isArray(data) ? data.map(normalizeTask) : []
    return tasks
  } catch (error) {
    console.error('[technicianService] getMyTasks failed', error)
    throw error
  }
}

export const getTaskDetails = async (crId) => {
  try {
    const data = await technicianApi.fetchTaskDetails(crId)
    return normalizeTask(data)
  } catch (error) {
    console.error('[technicianService] getTaskDetails failed', error)
    throw error
  }
}

export const scheduleTask = async (crId, payload) => {
  try {
    const data = await technicianApi.scheduleTask(crId, payload)
    return data
  } catch (error) {
    console.error('[technicianService] scheduleTask failed', error)
    throw error
  }
}

export const startTaskExecution = async (crId) => {
  try {
    const data = await technicianApi.startExecution(crId)
    return data
  } catch (error) {
    console.error('[technicianService] startTaskExecution failed', error)
    throw error
  }
}

export const completeTaskExecution = async (crId, payload) => {
  try {
    const data = await technicianApi.completeExecution(crId, payload)
    return data
  } catch (error) {
    console.error('[technicianService] completeTaskExecution failed', error)
    throw error
  }
}

export const getExecutionHistory = async () => {
  try {
    const data = await technicianApi.fetchExecutionHistory()
    return Array.isArray(data) ? data.map(normalizeTask) : []
  } catch (error) {
    console.error('[technicianService] getExecutionHistory failed', error)
    throw error
  }
}

export const assignTechnician = async (crId, technicianId) => {
  try {
    const data = await technicianApi.assignTechnician(crId, { technicianId })
    return data
  } catch (error) {
    console.error('[technicianService] assignTechnician failed', error)
    throw error
  }
}
