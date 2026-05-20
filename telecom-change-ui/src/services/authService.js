import * as authApi from '../api/authApi'

const logResponse = (label, data) => {
  console.debug(`[authService] ${label}`, data)
}

export const login = async (credentials) => {
  try {
    const data = await authApi.login(credentials)
    logResponse('login success', data)
    return data
  } catch (error) {
    console.error('[authService] login failed', error)
    throw error
  }
}

export const register = async (payload) => {
  try {
    const data = await authApi.register(payload)
    logResponse('register success', data)
    return data
  } catch (error) {
    console.error('[authService] register failed', error)
    throw error
  }
}
