import axios from 'axios'

class ApiError extends Error {
  constructor(message, details = {}) {
    super(message)
    this.name = 'ApiError'
    Object.assign(this, details)
  }
}

const extractUrl = (value) => (typeof value === 'string' ? value : '')
const getServiceName = (url = '') => {
  if (url.includes('/auth')) return 'Authentication service'
  if (url.includes('/approvals')) return 'Approval service'
  if (url.includes('/change-requests')) return 'Change request service'
  return 'Backend'
}

const isNetworkError = (error) => !error.response && Boolean(error.request)
const isCorsFailure = (error) => isNetworkError(error) && error.message === 'Network Error'

const parseErrorMessage = (error) => {
  const url = extractUrl(error.config?.url)
  const serviceName = getServiceName(url)

  if (error.response) {
    const status = error.response.status
    const payload = error.response.data || {}
    const backendMessage = `${payload.message || payload.error || payload.detail || payload.title || ''}`.trim()

    if (status === 401) return 'Authentication expired'
    if (status === 403) return 'You are not authorized to access this resource.'
    if (status === 503 || status === 504) return `${serviceName} unavailable`
    if (backendMessage) return backendMessage
    return `Request failed with status ${status}`
  }

  if (isCorsFailure(error)) {
    return `${serviceName} cannot be reached due to a network or CORS failure.`
  }

  if (isNetworkError(error)) {
    return `${serviceName} unavailable`
  }

  return error.message || 'Unable to connect to backend'
}

const normalizeError = (error) => {
  const message = parseErrorMessage(error)
  const url = extractUrl(error.config?.url)
  return new ApiError(message, {
    status: error.response?.status,
    url,
    code: error.code,
    isNetworkError: isNetworkError(error),
    isCorsError: isCorsFailure(error),
    originalError: error,
  })
}

const axiosInstance = axios.create({
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
})

axiosInstance.interceptors.request.use(
  (config) => {
    const fullUrl = `${config.baseURL || ''}${config.url || ''}`
    console.log('API REQUEST:', fullUrl)
    if (config.headers) {
      const token = localStorage.getItem('telecomAuthToken')
      if (token) {
        config.headers.Authorization = `Bearer ${token}`
      }
    }
    config.__retryCount = config.__retryCount ?? 0
    return config
  },
  (error) => Promise.reject(normalizeError(error)),
)

axiosInstance.interceptors.response.use(
  (response) => {
    if (import.meta.env.DEV) {
      console.debug('[API response]', response.config.method?.toUpperCase(), response.config.url, response.status)
    }
    return response
  },
  (error) => {
    const apiError = normalizeError(error)
    if (apiError.status === 401 && !apiError.url.includes('/auth/login') && !apiError.url.includes('/auth/register')) {
      localStorage.removeItem('telecomAuthToken')
      window.dispatchEvent(new CustomEvent('api:authExpired'))
    }
    if (apiError.status !== 403) {
      console.error('[API error]', apiError.url, apiError.message)
    }
    return Promise.reject(apiError)
  },
)

export default axiosInstance
export { ApiError }
