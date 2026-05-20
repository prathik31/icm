import axiosClient from './axiosClient'
import { CR_API } from '../config/api'

export const fetchChangeRequests = async () => {
  const response = await axiosClient.get(`${CR_API}/v1/change-requests`)
  return response.data
}

export const fetchChangeRequest = async (id) => {
  const response = await axiosClient.get(`${CR_API}/v1/change-requests/${id}`)
  return response.data
}

export const fetchAssessment = async (crId) => {
  const url = `${CR_API}/v1/change-requests/${crId}/assessment`
  try {
    const resp = await axiosClient.get(url)
    const payload = resp?.data ?? null
    if (!payload) return null
    if (payload.assessment) return payload.assessment
    if (payload.data) return payload.data
    return payload
  } catch (err) {
    console.warn('[crApi] fetchAssessment failed', url, err)
    return null
  }
}

export const createChangeRequest = async (payload) => {
  const response = await axiosClient.post(`${CR_API}/v1/change-requests`, payload)
  return response.data
}

export const submitChangeRequest = async (id) => {
  const response = await axiosClient.post(`${CR_API}/v1/change-requests/${id}/submit`)
  return response.data
}

export const confirmRisk = async (id) => {
  const response = await axiosClient.post(`${CR_API}/v1/change-requests/${id}/confirm-risk`)
  return response.data
}
