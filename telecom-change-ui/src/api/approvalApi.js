import axiosClient from './axiosClient'
import { APPROVAL_API } from '../config/api'

export const fetchPendingApprovals = async () => {
  const response = await axiosClient.get(`${APPROVAL_API}/v1/approvals/pending`)
  return response.data
}

export const fetchApprovalDetails = async (flowId) => {
  const response = await axiosClient.get(`${APPROVAL_API}/v1/approvals/${flowId}`)
  return response.data
}

export const fetchApprovalHistory = async () => {
  const response = await axiosClient.get(`${APPROVAL_API}/v1/approvals/history`)
  return response.data
}

export const approveFlow = async (flowId, comment) => {
  const response = await axiosClient.post(`${APPROVAL_API}/v1/approvals/${flowId}/approve`, {
    comment,
  })
  return response.data
}

export const rejectFlow = async (flowId, comment) => {
  const response = await axiosClient.post(`${APPROVAL_API}/v1/approvals/${flowId}/reject`, {
    comment,
  })
  return response.data
}
