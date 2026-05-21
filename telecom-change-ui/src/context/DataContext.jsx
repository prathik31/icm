import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { useAuth } from './AuthContext'
import * as crService from '../services/crService'
import * as approvalService from '../services/approvalService'

const DataContext = createContext(null)

export const DataProvider = ({ children }) => {
  const { role } = useAuth()
  const [requests, setRequests] = useState([])
  const [approvals, setApprovals] = useState([])
  const [loadingRequests, setLoadingRequests] = useState(false)
  const [loadingApprovals, setLoadingApprovals] = useState(false)
  const [errorRequests, setErrorRequests] = useState(null)
  const [errorApprovals, setErrorApprovals] = useState(null)

  const loadRequests = async () => {
    setLoadingRequests(true)
    setErrorRequests(null)
    try {
      const data = await crService.listChangeRequests()
      setRequests(data || [])
      return data || []
    } catch (error) {
      setErrorRequests(error?.message || 'Unable to load change requests.')
      throw error
    } finally {
      setLoadingRequests(false)
    }
  }

  const loadApprovals = async () => {
    setLoadingApprovals(true)
    setErrorApprovals(null)
    try {
      const data = await approvalService.listPendingApprovals()
      setApprovals(data || [])
      return data || []
    } catch (error) {
      setErrorApprovals(error?.message || 'Unable to load approvals.')
      throw error
    } finally {
      setLoadingApprovals(false)
    }
  }

  const refreshAll = async () => {
    const tasksToRun = [loadRequests()]
    if (role === 'APPROVER' || role === 'ADMIN') {
      tasksToRun.push(loadApprovals())
    }
    const results = await Promise.allSettled(tasksToRun)
    results.forEach((result, index) => {
      if (result.status === 'rejected') {
        const label = index === 0 ? 'loadRequests' : 'loadApprovals'
        console.warn(`[DataContext] ${label} failed`, result.reason)
      }
    })
  }

  useEffect(() => {
    refreshAll()
  }, [])

  const contextValue = useMemo(
    () => ({
      requests,
      approvals,
      loadingRequests,
      loadingApprovals,
      errorRequests,
      errorApprovals,
      refreshRequests: loadRequests,
      refreshApprovals: loadApprovals,
      refreshAll,
    }),
    [requests, approvals, loadingRequests, loadingApprovals, errorRequests, errorApprovals],
  )

  return <DataContext.Provider value={contextValue}>{children}</DataContext.Provider>
}

export const useDataContext = () => {
  const context = useContext(DataContext)
  if (!context) {
    throw new Error('useDataContext must be used within DataProvider')
  }
  return context
}
