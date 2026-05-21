import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { confirmRisk, getAssessment, getChangeRequestById, submitChangeRequest } from '../services/crService'
import { useDataContext } from '../context/DataContext'
import { useAuth } from '../context/AuthContext'
import AlertMessage from '../components/AlertMessage'
import Loader from '../components/Loader'
import StatusBadge from '../components/StatusBadge'
import RiskBadge from '../components/RiskBadge'
import RiskAssessmentCard from '../components/risk/RiskAssessmentCard'
import Card from '../components/ui/Card'
import Timeline from '../components/Timeline'

const CRDetails = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { role, email, name } = useAuth()
  const [request, setRequest] = useState(null)
  const [assessment, setAssessment] = useState(null)
  const [loadingAssessment, setLoadingAssessment] = useState(false)
  const [assessmentError, setAssessmentError] = useState(null)
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)
  const [message, setMessage] = useState(null)
  const { refreshAll } = useDataContext()

  const loadRequest = async () => {
    setLoading(true)
    setMessage(null)
    setAssessmentError(null)
    try {
      const data = await getChangeRequestById(id)
      setRequest(data)
      setLoadingAssessment(true)
      try {
        const a = await getAssessment(id)
        console.log('Assessment response:', a)
        setAssessment(a)
        if (!a) {
          setAssessmentError('No risk assessment available.')
        }
      } catch (e) {
        console.warn('[CRDetails] assessment fetch failed', e)
        setAssessmentError('No risk assessment available.')
      } finally {
        setLoadingAssessment(false)
      }
    } catch (err) {
      setMessage(err?.message || 'Unable to load change request.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (id) {
      loadRequest()
    }
  }, [id])

  const handleSubmit = async () => {
    setActionLoading(true)
    setMessage(null)
    try {
      await submitChangeRequest(id)
      await loadRequest()
      await refreshAll()
    } catch (err) {
      setMessage(err?.message || 'Unable to submit request.')
    } finally {
      setActionLoading(false)
    }
  }

  const handleConfirmRisk = async () => {
    setActionLoading(true)
    setMessage(null)
    try {
      await confirmRisk(id)
      await loadRequest()
      await refreshAll()
    } catch (err) {
      setMessage(err?.message || 'Unable to confirm risk.')
    } finally {
      setActionLoading(false)
    }
  }

  const assessmentData = assessment || request?.assessment || request?.riskAssessment || request?.assessment_detail || request?.risk || null
  const riskRating =
    assessmentData?.riskLevel || assessmentData?.risk_level || request?.riskRating || request?.riskLevel || 'UNKNOWN'
  const blastRadius = assessmentData?.blastRadius || assessmentData?.blast_radius || request?.blastRadius || 'N/A'
  const timelineEvents = useMemo(() => {
    return [
      { title: 'Request created', description: request?.description || 'Initial request submitted', date: request?.createdAt, variant: 'Created' },
      { title: 'Submitted for assessment', description: 'Request entered the risk analysis queue.', date: request?.submittedAt, variant: 'Submitted' },
      { title: 'Risk analysis completed', description: 'AI risk engine evaluated the change request.', date: request?.analyzedAt || request?.analysisCompletedAt, variant: 'Analyzed' },
      { title: 'Risk confirmed', description: 'Risk profile confirmed and ready for approval.', date: request?.riskConfirmedAt, variant: 'Confirmed' },
      { title: 'Final decision', description: 'Approval or rejection has been recorded.', date: request?.approvedAt || request?.rejectedAt, variant: request?.approvedAt ? 'Approved' : request?.rejectedAt ? 'Rejected' : undefined },
    ].filter((event) => event.date)
  }, [request])

  if (loading) return <Loader />

  if (!request) {
    return (
      <div className="rounded-3xl border border-slate-200 bg-white p-8 text-slate-700 shadow-sm">
        <p className="text-sm">Change request not found.</p>
      </div>
    )
  }

  const canSubmit = request.status === 'DRAFT'
  const canConfirmRisk = ['ENGINEER', 'ADMIN'].includes(role) && request.status === 'ANALYZED'

  return (
    <div className="space-y-6">
      <Card
        title={request.title || 'Change request details'}
        actions={
          <div className="flex flex-wrap items-center gap-3">
            <StatusBadge status={request.status || 'UNKNOWN'} />
            {riskRating && <RiskBadge level={riskRating} />}
          </div>
        }
      >
        <p className="mt-1 text-sm text-slate-600">{request.description || 'No description provided.'}</p>
      </Card>

      {message && <AlertMessage type="error" message={message} />}

      <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <div className="space-y-6">
          <Card title="Request details">
            <dl className="grid gap-4 text-sm text-slate-600">
              <div>
                <dt className="font-semibold text-slate-900">Domain</dt>
                <dd>{request.domain || '—'}</dd>
              </div>
              <div>
                <dt className="font-semibold text-slate-900">Change type</dt>
                <dd>{request.changeType || '—'}</dd>
              </div>
              <div>
                <dt className="font-semibold text-slate-900">Region</dt>
                <dd>{request.region || '—'}</dd>
              </div>
              <div>
                <dt className="font-semibold text-slate-900">Scheduled window</dt>
                <dd>{request.scheduledStart || '—'} to {request.scheduledEnd || '—'}</dd>
              </div>
              <div>
                <dt className="font-semibold text-slate-900">Rollback available</dt>
                <dd>{request.rollbackAvailable ? 'Yes' : 'No'}</dd>
              </div>
              <div>
                <dt className="font-semibold text-slate-900">Requested by</dt>
                <dd>
                  {name || email || request.requestedByEmail || request.createdBy || request.requestedByUserId || '—'}
                </dd>
              </div>
            </dl>
          </Card>

          {['ANALYZED', 'RISK_CONFIRMED', 'APPROVED', 'RUNNING', 'COMPLETED', 'FAILED']
            .includes(request?.status) && (
              <RiskAssessmentCard
                assessment={assessmentData}
                requestStatus={request?.status}
                loading={loadingAssessment}
                error={assessmentError}
              />
            )}

          <Card title="Change assets">
            <div className="space-y-4">
              {Array.isArray(request.assets) && request.assets.length > 0 ? (
                request.assets.map((asset, index) => (
                  <div key={index} className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                    <p className="text-sm font-semibold text-slate-900">{asset.assetType || 'Asset'}</p>
                    <p className="text-sm text-slate-600">ID: {asset.assetId || '—'}</p>
                    <p className="text-sm text-slate-600">Host: {asset.hostname || '—'}</p>
                  </div>
                ))
              ) : (
                <p className="text-sm text-slate-600">No assets associated with this request.</p>
              )}
            </div>
          </Card>
        </div>

        <div className="space-y-6">
          <Card title="Workflow timeline">
            {timelineEvents.length ? (
              <Timeline events={timelineEvents} />
            ) : (
              <p className="text-sm text-slate-600">Timeline data will appear after the request progresses through the workflow.</p>
            )}
          </Card>

          <Card title="Business justification">
            <p className="text-sm leading-7 text-slate-600">{request.businessJustification || 'No justification has been provided.'}</p>
          </Card>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <button
          type="button"
          disabled={actionLoading || !canSubmit}
          onClick={handleSubmit}
          className="rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400"
        >
          {actionLoading ? 'Submitting…' : canSubmit ? 'Submit CR' : 'Submit not available'}
        </button>
        {canConfirmRisk && (
          <button
            type="button"
            disabled={actionLoading}
            onClick={handleConfirmRisk}
            className="rounded-2xl bg-amber-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-amber-600 disabled:cursor-not-allowed disabled:bg-amber-300"
          >
            {actionLoading ? 'Confirming…' : 'Confirm risk'}
          </button>
        )}
      </div>

      <button
        type="button"
        onClick={() => navigate(-1)}
        className="text-sm font-semibold text-slate-700 hover:text-slate-900"
      >
        Back to list
      </button>
    </div>
  )
}

export default CRDetails
