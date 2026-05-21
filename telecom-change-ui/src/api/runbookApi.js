import axiosClient from './axiosClient'
import { APPROVAL_API } from '../config/api'

export const fetchRunbooks = async () => {
  const response = await axiosClient.get(`${APPROVAL_API}/v1/runbooks`)
  return response.data
}

export const fetchRunbookDetails = async (crId) => {
  const response = await axiosClient.get(`${APPROVAL_API}/v1/runbooks/${crId}`)
  return response.data
}
