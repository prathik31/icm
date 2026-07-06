import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { getTaskDetails, scheduleTask } from '../../services/technicianService'
import Loader from '../../components/Loader'
import Card from '../../components/ui/Card'
import AlertMessage from '../../components/AlertMessage'

const TechnicianSchedule = () => {
  const { crId } = useParams()
  const navigate = useNavigate()

  const [scheduledStartDate, setScheduledStartDate] = useState('')
  const [scheduledStartTime, setScheduledStartTime] = useState('')

  const [scheduledEndDate, setScheduledEndDate] = useState('')
  const [scheduledEndTime, setScheduledEndTime] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    const loadTask = async () => {
      setLoading(true)
      setError(null)

      try {
        const data = await getTaskDetails(crId)

        if (data?.scheduledStart) {
          const start = new Date(data.scheduledStart)

          setScheduledStartDate(start.toISOString().split('T')[0])
          setScheduledStartTime(start.toTimeString().slice(0, 5))
        }

        if (data?.scheduledEnd) {
          const end = new Date(data.scheduledEnd)

          setScheduledEndDate(end.toISOString().split('T')[0])
          setScheduledEndTime(end.toTimeString().slice(0, 5))
        }
      } catch (err) {
        setError(err?.message || 'Unable to load task schedule.')
      } finally {
        setLoading(false)
      }
    }

    if (crId) {
      loadTask()
    }
  }, [crId])

  const handleSubmit = async (event) => {
    event.preventDefault()

    if (
      !scheduledStartDate ||
      !scheduledStartTime ||
      !scheduledEndDate ||
      !scheduledEndTime
    ) {
      setError('Please provide start and end schedule.')
      return
    }

    const start = new Date(
      `${scheduledStartDate}T${scheduledStartTime}`
    )

    const end = new Date(
      `${scheduledEndDate}T${scheduledEndTime}`
    )

    if (end <= start) {
      setError('Scheduled end must be after scheduled start.')
      return
    }

    setSaving(true)
    setError(null)

    try {
      const payload = {
        scheduledStart: `${scheduledStartDate}T${scheduledStartTime}:00`,
        scheduledEnd: `${scheduledEndDate}T${scheduledEndTime}:00`,
      }

      await scheduleTask(crId, payload)

      navigate(`/technician/tasks/${crId}/execute`)
    } catch (err) {
      console.error(err)
      setError(err?.message || 'Unable to schedule execution.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <Loader />

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-semibold text-slate-900">
          Schedule Execution
        </h1>

        <p className="mt-2 text-sm text-slate-600">
          Define the execution window for this network change.
        </p>
      </div>

      {error && (
        <AlertMessage
          type="error"
          message={error}
        />
      )}

      <Card>
        <form
          onSubmit={handleSubmit}
          className="space-y-6"
        >
          <div className="grid gap-6 md:grid-cols-2">
            <label className="space-y-2 text-sm text-slate-700">
              <span>Scheduled Start Date</span>

              <input
                type="date"
                value={scheduledStartDate}
                onChange={(e) =>
                  setScheduledStartDate(e.target.value)
                }
                className="w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-slate-900"
              />
            </label>

            <label className="space-y-2 text-sm text-slate-700">
              <span>Scheduled Start Time</span>

              <input
                type="time"
                value={scheduledStartTime}
                onChange={(e) =>
                  setScheduledStartTime(e.target.value)
                }
                className="w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-slate-900"
              />
            </label>

            <label className="space-y-2 text-sm text-slate-700">
              <span>Scheduled End Date</span>

              <input
                type="date"
                value={scheduledEndDate}
                onChange={(e) =>
                  setScheduledEndDate(e.target.value)
                }
                className="w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-slate-900"
              />
            </label>

            <label className="space-y-2 text-sm text-slate-700">
              <span>Scheduled End Time</span>

              <input
                type="time"
                value={scheduledEndTime}
                onChange={(e) =>
                  setScheduledEndTime(e.target.value)
                }
                className="w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-slate-900"
              />
            </label>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="rounded-2xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={saving}
              className="rounded-2xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300"
            >
              {saving ? 'Scheduling...' : 'Schedule Execution'}
            </button>
          </div>
        </form>
      </Card>
    </div>
  )
}

export default TechnicianSchedule