import { useMemo } from 'react'
import { useDataContext } from '../context/DataContext'

const computeTotals = (requests, approvals) => {
  const statusCounts = requests.reduce((acc, request) => {
    const status = (request.status || 'UNKNOWN').toUpperCase()
    acc[status] = (acc[status] || 0) + 1
    return acc
  }, {})

  return {
    total: requests.length,
    analyzed: statusCounts.ANALYZED || 0,
    confirmed: statusCounts.RISK_CONFIRMED || 0,
    approved: statusCounts.APPROVED || 0,
    rejected: statusCounts.REJECTED || 0,
    pendingApprovals: statusCounts.RISK_CONFIRMED || 0,
  }
}

export const useDashboard = () => {
  const {
    requests,
    approvals,
    loadingRequests,
    loadingApprovals,
    errorRequests,
    errorApprovals,
    refreshRequests,
    refreshApprovals,
    refreshAll,
  } = useDataContext()

  const totals = useMemo(() => computeTotals(requests, approvals), [requests, approvals])

  return {
    requests,
    approvals,
    totals,
    loadingRequests,
    loadingApprovals,
    errorRequests,
    errorApprovals,
    refreshRequests,
    refreshApprovals,
    refreshAll,
  }
}
