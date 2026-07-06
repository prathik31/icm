import axiosClient from './axiosClient'
import { TECHNICIAN_API } from '../config/api'

export const fetchTechnicianList = async () => {
  const response = await axiosClient.get(`${TECHNICIAN_API}/v1/technicians/list`)
  return response.data
}

export const fetchTechnicianDashboard = async () => {
  const response = await axiosClient.get(`${TECHNICIAN_API}/v1/technicians/dashboard`)
  return response.data
}

export const fetchTechnicianProfile = async () => {
  const response = await axiosClient.get(`${TECHNICIAN_API}/v1/technicians/me`)
  return response.data
}

export const fetchMyTasks = async () => {
  const response = await axiosClient.get(`${TECHNICIAN_API}/v1/technicians/my-tasks`)
  return response.data
}

export const fetchTaskDetails = async (crId) => {
  const response = await axiosClient.get(`${TECHNICIAN_API}/v1/technicians/task/${crId}`)
  return response.data
}

export const scheduleTask = async (crId, payload) => {
  const response = await axiosClient.post(`${TECHNICIAN_API}/v1/technicians/${crId}/schedule`, payload)
  return response.data
}

export const startExecution = async (crId) => {
  const response = await axiosClient.post(`${TECHNICIAN_API}/v1/technicians/${crId}/start`)
  return response.data
}

export const completeExecution = async (crId, payload) => {
  const response = await axiosClient.post(`${TECHNICIAN_API}/v1/technicians/${crId}/complete`, payload)
  return response.data
}

export const fetchExecutionHistory = async () => {
  const response = await axiosClient.get(`${TECHNICIAN_API}/v1/technicians/execution-history`)
  return response.data
}

export const assignTechnician = async (crId, payload) => {
  const response = await axiosClient.post(`${TECHNICIAN_API}/v1/technicians/assign/${crId}`, payload)
  return response.data
}
