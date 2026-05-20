import * as crApi from '../api/crApi'

const normalizeAssessment = (assessment) => {
  if (!assessment) return null
  return {
    riskLevel: assessment.riskLevel || assessment.risk_level || assessment.riskRating || assessment.risk_rating || 'UNKNOWN',
    riskScore: assessment.riskScore ?? assessment.risk_score ?? 0,
    confidence:
      assessment.confidence != null
        ? assessment.confidence
        : assessment.confidenceScore != null
        ? assessment.confidenceScore
        : null,
    blastRadius: assessment.blastRadius || assessment.blast_radius || 'N/A',
    executiveSummary:
      assessment.executiveSummary || assessment.executive_summary || assessment.summary || 'No executive summary available.',
    technicalAnalysis:
      assessment.technicalAnalysis || assessment.technical_analysis || assessment.reasoning || 'No technical analysis available.',
    cabGuidance: assessment.cabGuidance || assessment.cab_guidance || 'No CAB guidance available.',
    recommendations: Array.isArray(assessment.recommendations)
      ? assessment.recommendations
      : assessment.recommendation
      ? [assessment.recommendation]
      : [],
    riskIndicators: Array.isArray(assessment.riskIndicators)
      ? assessment.riskIndicators
      : Array.isArray(assessment.risk_indicators)
      ? assessment.risk_indicators
      : [],
    reasons: Array.isArray(assessment.reasons)
      ? assessment.reasons
      : assessment.reason
      ? [assessment.reason]
      : [],
  }
}

const normalizeRequest = (request) => {
  if (!request) return null
  const assessmentSource = request.assessment || request.riskAssessment || request.assessment_detail || request.risk || null
  return {
    ...request,
    id: request.id || request.crId || request.changeRequestId || request.requestId || null,
    status: (request.status || request.approvalStatus || request.requestStatus || 'UNKNOWN').toUpperCase(),
    assessment: normalizeAssessment(assessmentSource),
    riskScore:
      request.assessment?.riskScore ?? request.riskScore ?? request.risk_score ?? request.riskScore ?? null,
    blastRadius:
      request.assessment?.blastRadius ?? request.blastRadius ?? request.blast_radius ?? null,
  }
}

const logResponse = (label, data) => {
  console.debug(`[crService] ${label}`, data)
}

export const listChangeRequests = async () => {
  try {
    const data = await crApi.fetchChangeRequests()
    const requests = Array.isArray(data) ? data.map(normalizeRequest) : []
    logResponse('listChangeRequests', requests)
    return requests
  } catch (error) {
    console.error('[crService] listChangeRequests failed', error)
    throw error
  }
}

export const getChangeRequestById = async (id) => {
  try {
    const data = await crApi.fetchChangeRequest(id)
    const request = normalizeRequest(data)
    logResponse('getChangeRequestById', request)
    return request
  } catch (error) {
    console.error('[crService] getChangeRequestById failed', error)
    throw error
  }
}

export const getAssessment = async (id) => {
  try {
    const data = await crApi.fetchAssessment(id)
    const assessment = normalizeAssessment(data)
    logResponse('getAssessment', assessment)
    return assessment
  } catch (error) {
    console.warn('[crService] getAssessment failed', error)
    return null
  }
}

export const createChangeRequest = async (payload) => {
  try {
    const data = await crApi.createChangeRequest(payload)
    logResponse('createChangeRequest', data)
    return data
  } catch (error) {
    console.error('[crService] createChangeRequest failed', error)
    throw error
  }
}

export const submitChangeRequest = async (id) => {
  try {
    const data = await crApi.submitChangeRequest(id)
    logResponse('submitChangeRequest', data)
    return data
  } catch (error) {
    console.error('[crService] submitChangeRequest failed', error)
    throw error
  }
}

export const confirmRisk = async (id) => {
  try {
    const data = await crApi.confirmRisk(id)
    logResponse('confirmRisk', data)
    return data
  } catch (error) {
    console.error('[crService] confirmRisk failed', error)
    throw error
  }
}
