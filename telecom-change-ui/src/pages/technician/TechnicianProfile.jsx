import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getTechnicianProfile } from '../../services/technicianService'
import Card from '../../components/ui/Card'
import Loader from '../../components/Loader'
import AlertMessage from '../../components/AlertMessage'
import EmptyState from '../../components/EmptyState'

const TechnicianProfile = () => {
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const navigate = useNavigate()

  useEffect(() => {
    const loadProfile = async () => {
      setLoading(true)
      setError(null)
      try {
        const data = await getTechnicianProfile()
        setProfile(data)
      } catch (err) {
        setError(err?.message || 'Unable to load technician profile.')
      } finally {
        setLoading(false)
      }
    }

    loadProfile()
  }, [])

  if (loading) return <Loader />

  if (error) return <AlertMessage type="error" message={error} />

  if (!profile) {
    return (
      <Card title="Technician profile">
        <EmptyState
          title="Profile not found"
          description="No technician profile was found for your account. Please contact your administrator."
        />
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-semibold text-slate-900">Technician profile</h1>
        <p className="mt-2 text-sm text-slate-600">Review your profile and current coverage details.</p>
      </div>

      <Card title="Profile details">
        <dl className="grid gap-4 text-sm text-slate-600 sm:grid-cols-2">
          <div>
            <dt className="font-semibold text-slate-900">Name</dt>
            <dd>{profile.name || 'N/A'}</dd>
          </div>
          <div>
            <dt className="font-semibold text-slate-900">Technician code</dt>
            <dd>{profile.code || 'N/A'}</dd>
          </div>
          <div>
            <dt className="font-semibold text-slate-900">Email</dt>
            <dd>{profile.email || 'N/A'}</dd>
          </div>
          <div>
            <dt className="font-semibold text-slate-900">Region</dt>
            <dd>{profile.region || 'N/A'}</dd>
          </div>
          <div>
            <dt className="font-semibold text-slate-900">Specialization</dt>
            <dd>{profile.specialization || 'N/A'}</dd>
          </div>
          <div>
            <dt className="font-semibold text-slate-900">Experience</dt>
            <dd>{profile.experienceYears != null ? `${profile.experienceYears} years` : 'N/A'}</dd>
          </div>
          <div className="sm:col-span-2">
            <dt className="font-semibold text-slate-900">Certifications</dt>
            <dd>{profile.certifications || 'None'}</dd>
          </div>
          <div>
            <dt className="font-semibold text-slate-900">Availability</dt>
            <dd>{profile.availabilityStatus || profile.status || 'N/A'}</dd>
          </div>
          <div>
            <dt className="font-semibold text-slate-900">Current workload</dt>
            <dd>{profile.currentWorkload != null ? profile.currentWorkload : 'N/A'}</dd>
          </div>
        </dl>
      </Card>

      <Card title="Actions">
        <div className="space-y-3 text-sm text-slate-600">
          <button
            type="button"
            onClick={() => navigate('/technician/tasks')}
            className="w-full rounded-2xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
          >
            View my tasks
          </button>
          <button
            type="button"
            onClick={() => navigate('/technician/dashboard')}
            className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
          >
            Open technician dashboard
          </button>
        </div>
      </Card>
    </div>
  )
}

export default TechnicianProfile
