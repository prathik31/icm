import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import * as authApi from '../api/authApi'

const AuthContext = createContext(null)
const STORAGE_KEY = 'telecomAuthToken'

const decodeJwtPayload = (token) => {
  if (!token) return null
  try {
    const base64Url = token.split('.')[1]
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => `%${(`00${c.charCodeAt(0).toString(16)}`).slice(-2)}`)
        .join(''),
    )
    return JSON.parse(jsonPayload)
  } catch (error) {
    return null
  }
}

const buildUserFromToken = (payload) => {
  if (!payload) return null
  return {
    userId: payload.userId || payload.sub || payload.uid || null,
    email: payload.email || payload.username || null,
    role: payload.role || (payload.roles?.[0] ?? null),
    name: payload.name || payload.fullName || null,
  }
}

const getTokenValue = (result) => result?.token || result?.accessToken || result?.authToken || result

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => localStorage.getItem(STORAGE_KEY))
  const [user, setUser] = useState(() => {
    const tokenValue = localStorage.getItem(STORAGE_KEY)
    return tokenValue ? buildUserFromToken(decodeJwtPayload(tokenValue)) : null
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (token) {
      localStorage.setItem(STORAGE_KEY, token)
      setUser(buildUserFromToken(decodeJwtPayload(token)))
    } else {
      localStorage.removeItem(STORAGE_KEY)
      setUser(null)
    }
  }, [token])

  useEffect(() => {
    const onAuthExpired = () => {
      setError('Authentication expired')
      setToken(null)
    }

    window.addEventListener('api:authExpired', onAuthExpired)
    return () => {
      window.removeEventListener('api:authExpired', onAuthExpired)
    }
  }, [])

  const login = async (credentials) => {
    setLoading(true)
    setError(null)
    try {
      const result = await authApi.login(credentials)
      const receivedToken = getTokenValue(result)
      setToken(receivedToken)
      return receivedToken
    } catch (err) {
      setError(err?.message || 'Login failed')
      throw err
    } finally {
      setLoading(false)
    }
  }

  const register = async (payload) => {
    setLoading(true)
    setError(null)
    try {
      const result = await authApi.register(payload)
      const receivedToken = getTokenValue(result)
      setToken(receivedToken)
      return receivedToken
    } catch (err) {
      setError(err?.message || 'Registration failed')
      throw err
    } finally {
      setLoading(false)
    }
  }

  const logout = () => {
    setToken(null)
    setError(null)
  }

  const role = user?.role || null
  const userId = user?.userId || null
  const email = user?.email || null
  const name = user?.name || null

  const value = useMemo(
    () => ({ token, userId, email, name, role, loading, error, login, register, logout, setError }),
    [token, userId, email, name, role, loading, error],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}
