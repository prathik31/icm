import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useApprovals } from '../hooks/useApprovals'
import Loader from '../components/Loader'
import StatusBadge from '../components/StatusBadge'
import RiskBadge from '../components/RiskBadge'
import Table from '../components/ui/Table'
import EmptyState from '../components/EmptyState'

const ApprovalsPending = () => {
  const { approvals, loading, error, refresh } = useApprovals()
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('ALL')

  const mapAssessmentToApproval = (a) => ({
    riskRating: a.riskLevel || a.risk_level || a.riskRating,
    confidence: a.confidence ?? null,
    blastRadius: a.blastRadius || a.blast_radius || null,
  })

  const statusOptions = useMemo(() => ['ALL', ...new Set(approvals.map((item) => (item.status || 'PENDING').toUpperCase()))], [approvals])

  const filteredApprovals = useMemo(() => {
    return approvals
      .filter((approval) => {
        const text = `${approval.changeRequestId || approval.crId || ''} ${approval.status || ''} ${approval.riskRating || approval.riskLevel || ''}`.toLowerCase()
        return text.includes(searchTerm.toLowerCase())
      })
      .filter((approval) => {
        if (statusFilter === 'ALL') return true
        return (approval.status || 'PENDING').toUpperCase() === statusFilter
      })
      .sort((a, b) => new Date(b.updatedAt || b.createdAt || 0) - new Date(a.updatedAt || a.createdAt || 0))
  }, [approvals, searchTerm, statusFilter])

  if (loading) return <Loader message="Fetching pending approvals..." />

  return (
    <div className="space-y-6">
      <div className="grid gap-4 lg:grid-cols-[1fr_auto]">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h1 className="text-2xl font-semibold text-slate-900">Pending approvals</h1>
          <p className="mt-2 text-sm text-slate-600">Review requests that require approval decisions and audit readiness.</p>
        </div>
        <Link to="/approvals/history" className="inline-flex items-center justify-center rounded-2xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white hover:bg-slate-800">
          Approval history
        </Link>
      </div>

      <div className="grid gap-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm md:grid-cols-[1fr_auto_auto]">
        <label className="block">
          <span className="text-sm font-medium text-slate-700">Search approvals</span>
          <input
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder="Search by CR ID or risk"
            className="mt-2 w-full rounded-3xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-slate-900"
          />
        </label>
        <label className="block">
          <span className="text-sm font-medium text-slate-700">Filter status</span>
          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
            className="mt-2 w-full rounded-3xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-slate-900"
          >
            {statusOptions.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </label>
      </div>

      {error && (
        <div className="rounded-3xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800">
          <div>{error}</div>
          <button
            type="button"
            onClick={refresh}
            className="mt-3 inline-flex rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-900 shadow-sm hover:bg-slate-100"
          >
            Retry
          </button>
        </div>
      )}

      {filteredApprovals.length === 0 ? (
        <EmptyState
          title="No approvals awaiting review"
          description="There are no active approval tasks matching your search and filter criteria."
        />
      ) : (
        <Table
          columns={[
            { key: 'crId', title: 'CR ID' },
            { key: 'risk', title: 'Risk' },
            { key: 'confidence', title: 'Confidence' },
            { key: 'blastRadius', title: 'Blast radius' },
            { key: 'status', title: 'Status' },
            { key: 'action', title: '' },
          ]}
          rows={filteredApprovals}
          renderRow={(approval) => {
            const requestId = approval.changeRequestId || approval.crId || '—'
            const risk = approval.assessment?.riskLevel || approval.riskRating || approval.riskLevel || 'UNKNOWN'
            return (
              <tr key={approval.flowId || approval.id || requestId} className="hover:bg-slate-50">
                <td className="px-6 py-4 text-slate-900">{requestId}</td>
                <td className="px-6 py-4"><RiskBadge level={risk} /></td>
                <td className="px-6 py-4 text-slate-700">{approval.confidence ? `${approval.confidence}%` : '—'}</td>
                <td className="px-6 py-4 text-slate-700">{approval.blastRadius || '—'}</td>
                <td className="px-6 py-4"><StatusBadge status={approval.status || 'PENDING'} /></td>
                <td className="px-6 py-4">
                  <Link
                    to={`/approvals/${requestId}`}
                    className="inline-flex rounded-2xl bg-slate-900 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-800"
                  >
                    Review
                  </Link>
                </td>
              </tr>
            )
          }}
        />
      )}
    </div>
  )
}

export default ApprovalsPending
