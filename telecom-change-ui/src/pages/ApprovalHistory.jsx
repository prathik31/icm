import { useEffect, useState } from 'react'
import { listApprovalHistory } from '../services/approvalService'
import Loader from '../components/Loader'
import Table from '../components/ui/Table'
import EmptyState from '../components/EmptyState'
import { sortByLatest } from '../utils/sortByLatest'

const ApprovalHistory = () => {
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const loadHistory = async () => {
      setLoading(true)
      setError(null)
      try {
        const data = await listApprovalHistory()
        setHistory(sortByLatest(data || [], ['updatedAt', 'updated', 'completedAt', 'steps.0.decisionAt', 'createdAt']))
      } catch (err) {
        setError(err?.message || 'Unable to load approval history.')
      } finally {
        setLoading(false)
      }
    }

    loadHistory()
  }, [])

  if (loading) {
    return <Loader />
  }

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-semibold text-slate-900">Approval history</h1>
        <p className="mt-2 text-sm text-slate-600">Browse completed approval decisions and audit trails for historic requests.</p>
      </div>

      {error && (
        <div className="rounded-3xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800">{error}</div>
      )}

      {history.length === 0 ? (
        <EmptyState
          title="No approval history available"
          description="There are no completed approvals in the current timeframe. Check back after approvals are processed."
        />
      ) : (
        <Table
          columns={[
            { key: 'crId', title: 'Change request' },
            { key: 'status', title: 'Status' },
            { key: 'decision', title: 'Decision' },
            { key: 'approver', title: 'Approver' },
            { key: 'updated', title: 'Updated' },
          ]}
          rows={history}
          emptyMessage="No approvals found."
          renderRow={(item) => (
            <tr key={item.id || item.flowId || item.changeRequestId || item.crId} className="hover:bg-slate-50">
              <td className="px-6 py-4 text-slate-900">{item.crId || item.changeRequestId || '—'}</td>
              <td className="px-6 py-4 text-slate-600">{item.status || '—'}</td>
              <td className="px-6 py-4 text-slate-600">{item.steps?.[0]?.outcome || '—'}</td>
              <td className="px-6 py-4 text-slate-600">{item.steps?.[0]?.approverEmail || '—'}</td>
              <td className="px-6 py-4 text-slate-600">{item.steps?.[0]?.decisionAt ? new Date(item.steps[0].decisionAt).toLocaleString() : '—'}</td>
            </tr>
          )}
        />
      )}
    </div>
  )
}

export default ApprovalHistory
