import axios from './axios'

const RUNBOOK_BASE = 'http://localhost:9096/v1/runbooks'

export const fetchEligibleCRs = async () => {
  const response = await axios.get(`${RUNBOOK_BASE}/eligible-crs`)
  return response.data
}

export const generateRunbook = async (crId) => {
  const response = await axios.post(`${RUNBOOK_BASE}/generate/${crId}`)
  return response.data
}

export const fetchRunbooks = async () => {
  const response = await axios.get(RUNBOOK_BASE)
  return response.data
}

export const fetchRunbookDetails = async (crId) => {
  const response = await axios.get(`${RUNBOOK_BASE}/${crId}`)
  return response.data
}
