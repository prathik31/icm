import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import useExecutionStatus from '../../hooks/useExecutionStatus'
import { startTaskExecution, completeTaskExecution } from '../../services/technicianService'
import Loader from '../../components/Loader'
import Card from '../../components/ui/Card'
import AlertMessage from '../../components/AlertMessage'

const TechnicianExecution = () => {
  const { crId } = useParams()
  const navigate = useNavigate()
  const { task, loading, error, refresh } = useExecutionStatus(crId)
  const [executionNotes, setExecutionNotes] = useState('')
  const [rollbackRequired, setRollbackRequired] = useState(false)
  const [actionLoading, setActionLoading] = useState(false)
  const [message, setMessage] = useState(null)

  if (loading) return <Loader />

  if (!task) {
    return <AlertMessage type="error" message={error || 'Execution task not found.'} />
  }

  const status = task.status || 'UNKNOWN'
  const isStarted = status === 'IN_EXECUTION' || status === 'RUNNING'
  const isCompleted = status === 'COMPLETED'

  const handleStart = async () => {
    setActionLoading(true)
    setMessage(null)
    try {
      await startTaskExecution(crId)
      await refresh()
      setMessage('Execution started successfully.')
    } catch (err) {
      setMessage(err?.message || 'Unable to start execution.')
    } finally {
      setActionLoading(false)
    }
  }

  const handleComplete = async () => {
    setActionLoading(true)
    setMessage(null)
    try {
      await completeTaskExecution(crId, { executionNotes, rollbackRequired })
      await refresh()
      setMessage('Execution completed successfully.')
    } catch (err) {
      setMessage(err?.message || 'Unable to complete execution.')
    } finally {
      setActionLoading(false)
    }
  }

  const timeline = [
    { label: 'Scheduled', active: ['SCHEDULED', 'ASSIGNED'].includes(status) || isStarted || isCompleted },
    { label: 'Started', active: isStarted || isCompleted },
    { label: 'Running', active: isStarted },
    { label: 'Completed', active: isCompleted },
  ]

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-semibold text-slate-900">Execution</h1>
        <p className="mt-2 text-sm text-slate-600">Track the live execution state and complete the task when work is finished.</p>
      </div>

      {message && <AlertMessage type="success" message={message} />}
      {error && <AlertMessage type="error" message={error} />}

      <Card title="Execution timeline">
        <div className="grid gap-3 sm:grid-cols-4">
          {timeline.map((step) => (
            <div key={step.label} className={`rounded-3xl border p-4 text-center text-sm ${step.active ? 'border-blue-500 bg-blue-50 text-slate-900' : 'border-slate-200 bg-white text-slate-500'}`}>
              <div className="font-semibold">{step.label}</div>
            </div>
          ))}
        </div>
      </Card>

      <Card title="Execution details">
        <div className="space-y-4 text-sm text-slate-600">
          <div>
            <p className="font-semibold text-slate-900">Current status</p>
            <p>{status}</p>
          </div>
          <div>
            <p className="font-semibold text-slate-900">Schedule</p>
            <p>{task.schedule?.executionDate || task.scheduledStart || 'Not scheduled'} {task.schedule?.executionTime || task.scheduledStart || ''}</p>
          </div>
          <div>
            <p className="font-semibold text-slate-900">Assigned technician</p>
            <p>{task.assignedTechnician?.name || task.assignedTechnician || 'Unassigned'}</p>
          </div>
        </div>
      </Card>

      {(status === 'SCHEDULED' || status === 'ASSIGNED') && (
        <Card title="Start execution">
          <button
            type="button"
            disabled={actionLoading}
            onClick={handleStart}
            className="rounded-2xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300"
          >
            {actionLoading ? 'Starting…' : 'Start execution'}
          </button>
        </Card>
      )}

      {(isStarted || status === 'RUNNING') && (
        <Card title="Complete execution">
          <div className="space-y-4">
            <label className="space-y-2 text-sm text-slate-700">
              <span>Execution notes</span>
              <textarea
                value={executionNotes}
                onChange={(event) => setExecutionNotes(event.target.value)}
                rows={5}
                className="w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-slate-900"
              />
            </label>
            <label className="inline-flex items-center gap-3 text-sm text-slate-700">
              <input
                type="checkbox"
                checked={rollbackRequired}
                onChange={(event) => setRollbackRequired(event.target.checked)}
                className="h-4 w-4 text-blue-600"
              />
              Rollback required
            </label>
            <button
              type="button"
              disabled={actionLoading}
              onClick={handleComplete}
              className="rounded-2xl bg-emerald-700 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-600 disabled:cursor-not-allowed disabled:bg-emerald-300"
            >
              {actionLoading ? 'Completing…' : 'Complete execution'}
            </button>
          </div>
        </Card>
      )}

      <button
        type="button"
        onClick={() => navigate(`/technician/tasks/${crId}`)}
        className="text-sm font-semibold text-slate-700 hover:text-slate-900"
      >
        Back to task details
      </button>
    </div>
  )
}

export default TechnicianExecution
