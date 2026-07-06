import { useEffect, useState } from 'react'
import { getExecutionHistory } from '../../services/technicianService'
import Loader from '../../components/Loader'
import Table from '../../components/ui/Table'
import Card from '../../components/ui/Card'
import EmptyState from '../../components/EmptyState'
import AlertMessage from '../../components/AlertMessage'

const TechnicianHistory = () => {
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const loadHistory = async () => {
      setLoading(true)
      setError(null)
      try {
        const data = await getExecutionHistory()
        setHistory(data)
      } catch (err) {
        setError(err?.message || 'Unable to load execution history.')
      } finally {
        setLoading(false)
      }
    }

    loadHistory()
  }, [])

  if (loading) return <Loader />

  return (
    <div className="space-y-6">
      <Card title="Execution history">
        <p className="text-sm text-slate-600">Review completed tasks, rollback outcomes, and execution notes.</p>
      </Card>

      {error && <AlertMessage type="error" message={error} />}

      {history.length === 0 ? (
        <EmptyState
          title="No execution history available"
          description="No completed technician executions were found."
        />
      ) : (
        <Table
          columns={[
            { key: 'id', title: 'CR ID' },
            { key: 'title', title: 'Title' },
            { key: 'region', title: 'Region' },
            { key: 'risk', title: 'Risk' },
            { key: 'completedAt', title: 'Completed At' },
            { key: 'executionStatus', title: 'Execution Status' },
            { key: 'rollbackRequired', title: 'Rollback' },
            { key: 'actions', title: 'Actions', className: 'text-right' },
          ]}
          rows={history}
          renderRow={(task) => (
            <tr key={task.id} className="hover:bg-slate-50">
              <td className="px-6 py-4 text-slate-900">{task.id}</td>
              <td className="px-6 py-4 text-slate-600">{task.title || 'Untitled request'}</td>
              <td className="px-6 py-4 text-slate-600">{task.region || '—'}</td>
              <td className="px-6 py-4 text-slate-600">{task.risk || '—'}</td>
              <td className="px-6 py-4 text-slate-600">{task.completedAt ? new Date(task.completedAt).toLocaleString() : '—'}</td>
              <td className="px-6 py-4 text-slate-600">{task.executionStatus || '—'}</td>
              <td className="px-6 py-4 text-slate-600">{task.rollbackRequired ? 'Yes' : 'No'}</td>
              <td className="px-6 py-4 text-right">
                <a href={`/technician/tasks/${task.id}/execute`} className="inline-flex rounded-2xl bg-slate-900 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-800">View</a>
              </td>
            </tr>
          )}
        />
      )}
    </div>
  )
}

export default TechnicianHistory
