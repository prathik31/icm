import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useCRs } from '../hooks/useCRs'
import Loader from '../components/Loader'
import StatusBadge from '../components/StatusBadge'
import RiskBadge from '../components/RiskBadge'
import Table from '../components/ui/Table'
import EmptyState from '../components/EmptyState'

const CRList = () => {
  const { requests, loading, error, refresh } = useCRs()
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('ALL')

  const mapAssessmentToRequest = (a) => {
    return {
      riskRating: a.riskLevel || a.risk_level || a.riskRating || a.risk_score || a.riskScore,
      riskScore: a.riskScore ?? a.risk_score ?? null,
      blastRadius: a.blastRadius || a.blast_radius || a.blast_radius || null,
      recommendations: a.recommendations || a.recommendation || null,
    }
  }

  const statusOptions = useMemo(() => {
    return ['ALL', ...new Set(requests.map((request) => (request.status || 'UNKNOWN').toUpperCase()))]
  }, [requests])

  const filteredRequests = useMemo(() => {
    return requests
      .filter((request) => {
        const searchValue = `${request.title || ''} ${request.description || ''} ${request.region || ''}`.toLowerCase()
        return searchValue.includes(searchTerm.toLowerCase())
      })
      .filter((request) => {
        if (statusFilter === 'ALL') return true
        return (request.status || 'UNKNOWN').toUpperCase() === statusFilter
      })
      .sort((a, b) => new Date(b.createdAt || b.updatedAt || 0) - new Date(a.createdAt || a.updatedAt || 0))
  }, [requests, searchTerm, statusFilter])

  if (loading) return <Loader message="Loading change requests..." />

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-[1fr_auto] lg:grid-cols-[1fr_auto_auto] xl:grid-cols-[1fr_auto_auto_auto]">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Change request inventory</h1>
          <p className="mt-1 text-sm text-slate-500">Search, filter, and monitor the complete request lifecycle.</p>
        </div>
        <Link to="/cr/create" className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700">
          New change request
        </Link>
      </div>

      <div className="grid gap-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm md:grid-cols-[1fr_auto_auto]">
        <label className="block">
          <span className="text-sm font-medium text-slate-700">Search</span>
          <input
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder="Search by title, region, or status"
            className="mt-2 w-full rounded-3xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-slate-900"
          />
        </label>
        <label className="block">
          <span className="text-sm font-medium text-slate-700">Status</span>
          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
            className="mt-2 w-full rounded-3xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-slate-900"
          >
            {statusOptions.map((option) => (
              <option key={option} value={option}>{option}</option>
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

      {filteredRequests.length === 0 ? (
        <EmptyState
          title="No change requests found"
          description="Try a different search term or create a new request to begin the approval workflow."
          action={
            <Link to="/cr/create" className="rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white hover:bg-slate-800">
              Create request
            </Link>
          }
        />
      ) : (
        <Table
          columns={[
            { key: 'id', title: 'CR ID' },
            { key: 'title', title: 'Title' },
            { key: 'status', title: 'Status' },
            { key: 'risk', title: 'Risk Level' },
            { key: 'riskScore', title: 'Risk Score' },
            { key: 'region', title: 'Region' },
            { key: 'createdAt', title: 'Created' },
            { key: 'actions', title: 'Actions' },
          ]}
          rows={filteredRequests}
          renderRow={(request) => {
            const requestId = request.id || request.crId
            const status = (request.status || request.approvalStatus || 'UNKNOWN').toUpperCase()
            const risk = request.assessment?.riskLevel || request.riskRating || request.riskLevel || request.risk || 'UNKNOWN'
            return (
              <tr key={requestId} className="hover:bg-slate-50">
                <td className="px-6 py-4 text-slate-900">{requestId}</td>
                <td className="px-6 py-4 text-slate-900">{request.title || 'Untitled request'}</td>
                <td className="px-6 py-4"><StatusBadge status={status} /></td>
                <td className="px-6 py-4"><RiskBadge level={risk} /></td>
                <td className="px-6 py-4 text-slate-700">{request.riskScore ?? '—'}</td>
                <td className="px-6 py-4 text-slate-700">{request.region || '—'}</td>
                <td className="px-6 py-4 text-slate-600">{new Date(request.createdAt || request.updatedAt || '').toLocaleDateString() || '—'}</td>
                <td className="px-6 py-4">
                  <Link
                    to={`/cr/details/${requestId}`}
                    className="inline-flex rounded-2xl bg-slate-900 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-800"
                  >
                    View
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

export default CRList
