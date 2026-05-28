import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { useAuth } from './AuthContext'
import * as crService from '../services/crService'
import * as approvalService from '../services/approvalService'
import { sortByLatest } from '../utils/sortByLatest'

const DataContext = createContext(null)

export const DataProvider = ({ children }) => {
  const { role } = useAuth()
  const [requests, setRequests] = useState([])
  const [approvals, setApprovals] = useState([])
  const [loadingRequests, setLoadingRequests] = useState(false)
  const [loadingApprovals, setLoadingApprovals] = useState(false)
  const [errorRequests, setErrorRequests] = useState(null)
  const [errorApprovals, setErrorApprovals] = useState(null)

  const loadRequests = useCallback(async () => {
    setLoadingRequests(true)
    setErrorRequests(null)
    try {
      const data = await crService.listChangeRequests()
      const sorted = sortByLatest(data || [], ['submittedAt', 'updatedAt'])
      setRequests(sorted)
      return sorted
    } catch (error) {
      setErrorRequests(error?.message || 'Unable to load change requests.')
      throw error
    } finally {
      setLoadingRequests(false)
    }
  }, [])

  const loadApprovals = useCallback(async () => {
    setLoadingApprovals(true)
    setErrorApprovals(null)
    try {
      const data = await approvalService.listPendingApprovals()
      const sorted = sortByLatest(data || [], ['updatedAt', 'updated', 'completedAt', 'createdAt'])
      setApprovals(sorted)
      return sorted
    } catch (error) {
      setErrorApprovals(error?.message || 'Unable to load approvals.')
      throw error
    } finally {
      setLoadingApprovals(false)
    }
  }, [])

  const refreshAll = useCallback(async () => {
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
  }, [loadApprovals, loadRequests, role])

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
    [requests, approvals, loadingRequests, loadingApprovals, errorRequests, errorApprovals, loadRequests, loadApprovals, refreshAll],
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
