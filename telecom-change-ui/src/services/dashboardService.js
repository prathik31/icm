import * as crService from './crService'
import * as approvalService from './approvalService'

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

export const fetchDashboardData = async () => {
  const [requests, approvals] = await Promise.all([
    crService.listChangeRequests(),
    approvalService.listPendingApprovals(),
  ])
  const totals = computeTotals(requests, approvals)
  console.debug('[dashboardService] fetchDashboardData', { requests: requests.length, approvals: approvals.length, totals })
  return { requests, approvals, totals }
}
