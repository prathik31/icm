import axiosClient from './axiosClient'
import { AUTH_API } from '../config/api'

export const login = async (payload) => {
  const response = await axiosClient.post(`${AUTH_API}/auth/login`, payload)
  return response.data
}

export const register = async (payload) => {
  const response = await axiosClient.post(`${AUTH_API}/auth/register`, payload)
  return response.data
}
