import * as approvalApi from '../api/approvalApi'

const normalizeAssessment = (assessment) => {
  if (!assessment) return null
  return {
    riskLevel: assessment.riskLevel || assessment.risk_level || assessment.riskRating || assessment.risk_rating || null,
    riskScore: assessment.riskScore ?? assessment.risk_score ?? null,
    confidence:
      assessment.confidence != null
        ? assessment.confidence
        : assessment.confidenceScore != null
        ? assessment.confidenceScore
        : null,
    blastRadius: assessment.blastRadius || assessment.blast_radius || null,
    recommendations: Array.isArray(assessment.recommendations)
      ? assessment.recommendations
      : assessment.recommendation
      ? [assessment.recommendation]
      : [],
    reasons: Array.isArray(assessment.reasons)
      ? assessment.reasons
      : assessment.reason
      ? [assessment.reason]
      : [],
  }
}

const normalizeApproval = (approval) => {
  if (!approval) return null
  const changeRequestId =
    approval.changeRequestId || approval.crId || approval.requestId || approval.changeRequest?.id || null
  const approver =
    approval.approver ||
    approval.approvedBy ||
    approval.approverEmail ||
    approval.approver_email ||
    approval.approver_email_address ||
    approval.approver?.email ||
    null
  const updated =
    approval.updated ||
    approval.updatedAt ||
    approval.completedAt ||
    approval.updated_at ||
    approval.completed_at ||
    approval.lastUpdated ||
    approval.lastUpdatedAt ||
    null

  return {
    ...approval,
    crId: approval.crId || changeRequestId || null,
    changeRequestId,
    status: (approval.status || approval.state || 'PENDING').toUpperCase(),
    decision: approval.decision || approval.approvalAction || approval.action || null,
    approver,
    approvedBy: approver,
    updated,
    updatedAt: updated,
    assessment: normalizeAssessment(approval.assessment || approval.changeRequest?.assessment || approval.changeRequest?.riskAssessment),
    confidence: approval.confidence ?? approval.assessment?.confidence ?? null,
    blastRadius:
      approval.blastRadius || approval.blast_radius || approval.assessment?.blastRadius || approval.assessment?.blast_radius || null,
  }
}

const logResponse = (label, data) => {
  if (import.meta.env.DEV) {
    console.debug(`[approvalService] ${label}`, data)
  }
}

export const listPendingApprovals = async () => {
  try {
    const data = await approvalApi.fetchPendingApprovals()
    const approvals = Array.isArray(data) ? data.map(normalizeApproval) : []
    logResponse('listPendingApprovals', approvals)
    return approvals
  } catch (error) {
    console.error('[approvalService] listPendingApprovals failed', error)
    throw error
  }
}

export const getApprovalDetails = async (flowId) => {
  try {
    const data = await approvalApi.fetchApprovalDetails(flowId)
    const approval = normalizeApproval(data)
    logResponse('getApprovalDetails', approval)
    return approval
  } catch (error) {
    console.error('[approvalService] getApprovalDetails failed', error)
    throw error
  }
}

export const listApprovalHistory = async () => {
  try {
    const data = await approvalApi.fetchApprovalHistory()
    const approvals = Array.isArray(data) ? data.map(normalizeApproval) : []
    logResponse('listApprovalHistory', approvals)
    return approvals
  } catch (error) {
    console.error('[approvalService] listApprovalHistory failed', error)
    throw error
  }
}

export const approveFlow = async (flowId, comment) => {
  try {
    const data = await approvalApi.approveFlow(flowId, comment)
    logResponse('approveFlow', data)
    return data
  } catch (error) {
    console.error('[approvalService] approveFlow failed', error)
    throw error
  }
}

export const rejectFlow = async (flowId, comment) => {
  try {
    const data = await approvalApi.rejectFlow(flowId, comment)
    logResponse('rejectFlow', data)
    return data
  } catch (error) {
    console.error('[approvalService] rejectFlow failed', error)
    throw error
  }
}
