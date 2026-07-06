import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getTechnicianDashboard } from '../../services/technicianService'
import Card from '../../components/ui/Card'
import Loader from '../../components/Loader'
import Table from '../../components/ui/Table'
import EmptyState from '../../components/EmptyState'
import AlertMessage from '../../components/AlertMessage'

const TechnicianDashboard = () => {
  const [dashboard, setDashboard] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const navigate = useNavigate()

  useEffect(() => {
    const loadDashboard = async () => {
      setLoading(true)
      setError(null)
      try {
        const data = await getTechnicianDashboard()
        setDashboard(data)
      } catch (err) {
        setError(err?.message || 'Unable to load technician dashboard.')
      } finally {
        setLoading(false)
      }
    }

    loadDashboard()
  }, [])

  if (loading) return <Loader />

  const summary = dashboard || {
    totalTasks: 0,
    scheduled: 0,
    inProgress: 0,
    completed: 0,
    recentTasks: [],
  }

  const recentTasks = summary.recentTasks || []
  const scheduledTasks = recentTasks.filter((task) => task.scheduledStart)
  const hasTasks = summary.totalTasks > 0
  const hasScheduledTasks = scheduledTasks.length > 0

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-semibold text-slate-900">Technician workload</h1>
        <p className="mt-2 text-sm text-slate-600">Review assigned tasks and runbook execution status for your team.</p>
      </div>

      {error && <AlertMessage type="error" message={error} />}

      <div className="grid gap-4 md:grid-cols-3">
        {[
          { label: 'Assigned', value: summary.totalTasks },
          { label: 'In progress', value: summary.inProgress },
          { label: 'Completed', value: summary.completed },
        ].map((widget) => (
          <div key={widget.label} className="rounded-3xl border border-slate-200 bg-white p-6 text-center shadow-sm">
            <p className="text-sm text-slate-500">{widget.label}</p>
            <p className="mt-3 text-3xl font-semibold text-slate-900">{widget.value}</p>
          </div>
        ))}
      </div>

      {hasTasks ? (
        <>
          <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
            <Card title="Today's execution queue">
              <div className="space-y-4">
                {recentTasks.slice(0, 5).map((task) => (
                  <div key={task.id} className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                    <p className="font-semibold text-slate-900">{task.title || 'Untitled request'}</p>
                    <p className="text-sm text-slate-600">{task.region || '—'}</p>
                    <p className="mt-2 text-xs uppercase tracking-[0.16em] text-slate-500">{task.status}</p>
                  </div>
                ))}
              </div>
            </Card>

            {hasScheduledTasks && (
              <Card title="Upcoming scheduled work">
                <div className="space-y-4">
                  {scheduledTasks.slice(0, 5).map((task) => (
                    <div key={task.id} className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                      <p className="text-sm font-semibold text-slate-900">{task.title || 'Untitled request'}</p>
                      <p className="mt-1 text-sm text-slate-600">{task.scheduledStart ? new Date(task.scheduledStart).toLocaleString() : '—'}</p>
                    </div>
                  ))}
                </div>
              </Card>
            )}
          </div>

          <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
            <Card title="Recent executions">
              <div className="space-y-4">
                {recentTasks.slice(0, 5).map((task) => (
                  <div key={task.id} className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                    <p className="font-semibold text-slate-900">{task.title || 'Untitled request'}</p>
                    <p className="text-sm text-slate-600">{task.executionStatus || task.status || '—'}</p>
                  </div>
                ))}
              </div>
            </Card>

            <Card title="Runbook statistics">
              <div className="space-y-4 text-sm text-slate-600">
                <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-xs uppercase tracking-[0.16em] text-slate-500">Assigned tasks</p>
                  <p className="mt-2 text-2xl font-semibold text-slate-900">{summary.totalTasks}</p>
                </div>
                <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-xs uppercase tracking-[0.16em] text-slate-500">Open tasks</p>
                  <p className="mt-2 text-2xl font-semibold text-slate-900">{summary.inProgress}</p>
                </div>
                <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-xs uppercase tracking-[0.16em] text-slate-500">Completed tasks</p>
                  <p className="mt-2 text-2xl font-semibold text-slate-900">{summary.completed}</p>
                </div>
              </div>
            </Card>
          </div>

          <div className="grid gap-6 lg:grid-cols-[1.6fr_1fr]">
            <Card title="Recent tasks">
              <Table
                columns={[
                  { key: 'id', title: 'CR ID' },
                  { key: 'title', title: 'Title' },
                  { key: 'status', title: 'Status' },
                  { key: 'risk', title: 'Risk' },
                  { key: 'region', title: 'Region' },
                ]}
                rows={recentTasks}
                renderRow={(task) => (
                  <tr key={task.id} className="hover:bg-slate-50">
                    <td className="px-6 py-4 text-slate-900">{task.id}</td>
                    <td className="px-6 py-4 text-slate-600">{task.title}</td>
                    <td className="px-6 py-4 text-slate-600">{task.status}</td>
                    <td className="px-6 py-4 text-slate-600">{task.risk}</td>
                    <td className="px-6 py-4 text-slate-600">{task.region}</td>
                  </tr>
                )}
              />
            </Card>

            <Card title="Quick actions">
              <div className="space-y-3 text-sm text-slate-600">
                <button
                  type="button"
                  onClick={() => navigate('/technician/tasks')}
                  className="w-full rounded-2xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
                >
                  View tasks
                </button>
                <button
                  type="button"
                  onClick={() => navigate('/technician/history')}
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
                >
                  Execution history
                </button>
              </div>
            </Card>
          </div>
        </>
      ) : (
        <div className="grid gap-6 lg:grid-cols-[1fr_1fr]">
          <Card title="No assignments yet">
            <EmptyState
              title="No technician assignments"
              description="You have not been assigned any tasks yet. Check your profile or await new work from the approval team."
            />
          </Card>
          <Card title="Quick actions">
            <div className="space-y-3 text-sm text-slate-600">
              <button
                type="button"
                onClick={() => navigate('/technician/tasks')}
                className="w-full rounded-2xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
              >
                View tasks
              </button>
              <button
                type="button"
                onClick={() => navigate('/technician/profile')}
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
              >
                View profile
              </button>
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}

export default TechnicianDashboard
