import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { listRunbooks } from '../services/runbookService'
import Loader from '../components/Loader'
import EmptyState from '../components/EmptyState'

const Runbooks = () => {
  const [runbooks, setRunbooks] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const loadRunbooks = async () => {
      setLoading(true)
      setError(null)
      try {
        const data = await listRunbooks()
        setRunbooks(data || [])
      } catch (err) {
        setError(err?.message || 'Unable to load runbooks.')
      } finally {
        setLoading(false)
      }
    }

    loadRunbooks()
  }, [])

  if (loading) {
    return <Loader />
  }

  const getRiskColor = (level) => {
    switch ((level || '').toUpperCase()) {
      case 'CRITICAL':
        return 'bg-red-100 text-red-700'
      case 'HIGH':
        return 'bg-orange-100 text-orange-700'
      case 'MEDIUM':
        return 'bg-yellow-100 text-yellow-700'
      case 'LOW':
        return 'bg-green-100 text-green-700'
      default:
        return 'bg-slate-100 text-slate-700'
    }
  }

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-semibold text-slate-900">AI Runbooks</h1>
        <p className="mt-2 text-sm text-slate-600">
          AI-generated operational runbooks for approved change requests. Pre-checks, execution steps, validation, and rollback procedures.
        </p>
      </div>

      {error && (
        <div className="rounded-3xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800">{error}</div>
      )}

      {runbooks.length === 0 ? (
        <EmptyState
          title="No runbooks available"
          description="Runbooks are generated after change requests are approved. Check back after approvals are processed."
        />
      ) : (
        <div className="grid gap-4">
          {runbooks.map((runbook) => (
            <Link
              key={runbook.crId}
              to={`/runbooks/${runbook.crId}`}
              className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all hover:border-blue-300 hover:shadow-md"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h2 className="text-lg font-semibold text-slate-900 transition-colors group-hover:text-blue-600">
                    {runbook.title}
                  </h2>
                  <p className="mt-1 text-sm text-slate-500">{runbook.crId}</p>
                </div>
                <div className="ml-4 flex items-center gap-2">
                  <span className={`rounded-full px-3 py-1 text-xs font-semibold ${getRiskColor(runbook.riskLevel)}`}>
                    {runbook.riskLevel}
                  </span>
                  <span className="text-slate-400">→</span>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-4">
                <div>
                  <p className="text-xs uppercase text-slate-500">Blast Radius</p>
                  <p className="mt-1 font-semibold text-slate-900">{runbook.blastRadius || '—'}</p>
                </div>
                <div>
                  <p className="text-xs uppercase text-slate-500">Duration</p>
                  <p className="mt-1 font-semibold text-slate-900">{runbook.duration ? `${runbook.duration} mins` : '—'}</p>
                </div>
                <div>
                  <p className="text-xs uppercase text-slate-500">Generated</p>
                  <p className="mt-1 font-semibold text-slate-900">
                    {runbook.generatedAt ? new Date(runbook.generatedAt).toLocaleDateString() : '—'}
                  </p>
                </div>
                <div>
                  <p className="text-xs uppercase text-slate-500">Status</p>
                  <p className="mt-1 font-semibold text-slate-900">{runbook.status || '—'}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}

export default Runbooks
