import { useNavigate } from 'react-router-dom'
import useTechnicianTasks from '../../hooks/useTechnicianTasks'
import Loader from '../../components/Loader'
import Table from '../../components/ui/Table'
import EmptyState from '../../components/EmptyState'
import AlertMessage from '../../components/AlertMessage'
import Card from '../../components/ui/Card'

const TechnicianTasks = () => {
  const { tasks, loading, error } = useTechnicianTasks()
  const navigate = useNavigate()

  if (loading) return <Loader />

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-semibold text-slate-900">My tasks</h1>
        <p className="mt-2 text-sm text-slate-600">Browse the work assigned to you and open tasks for execution control.</p>
      </div>

      {error && <AlertMessage type="error" message={error} />}

      <Card>
        <Table
          columns={[
            { key: 'id', title: 'CR ID' },
            { key: 'title', title: 'Title' },
            { key: 'region', title: 'Region' },
            { key: 'risk', title: 'Risk Level' },
            { key: 'riskScore', title: 'Risk Score' },
            { key: 'status', title: 'Status' },
            { key: 'actions', title: 'Actions', className: 'text-right' },
          ]}
          rows={tasks}
          emptyMessage="No tasks are assigned to you right now."
          renderRow={(task) => (
            <tr key={task.id} className="hover:bg-slate-50">
              <td className="px-6 py-4 text-slate-900">{task.id}</td>
              <td className="px-6 py-4 text-slate-600">{task.title || 'Untitled request'}</td>
              <td className="px-6 py-4 text-slate-600">{task.region || '—'}</td>
              <td className="px-6 py-4 text-slate-600">{task.risk || '—'}</td>
              <td className="px-6 py-4 text-slate-600">{task.riskScore != null ? task.riskScore : '—'}</td>
              <td className="px-6 py-4 text-slate-600">{task.status}</td>
              <td className="px-6 py-4 text-right">
                <button
                  type="button"
                  onClick={() => navigate(`/technician/tasks/${task.id}`)}
                  className="rounded-2xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"
                >
                  View
                </button>
              </td>
            </tr>
          )}
        />
      </Card>
    </div>
  )
}

export default TechnicianTasks
