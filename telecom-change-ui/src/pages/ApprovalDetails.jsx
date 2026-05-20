import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { approveFlow, getApprovalDetails, rejectFlow } from '../services/approvalService'
import { getAssessment, getChangeRequestById } from '../services/crService'
import { useDataContext } from '../context/DataContext'
import Loader from '../components/Loader'
import AlertMessage from '../components/AlertMessage'
import StatusBadge from '../components/StatusBadge'
import RiskBadge from '../components/RiskBadge'
import RiskAssessmentCard from '../components/risk/RiskAssessmentCard'
import Card from '../components/ui/Card'
import Timeline from '../components/Timeline'

const ApprovalDetails = () => {
  const { crId } = useParams()
  const navigate = useNavigate()
  const [approval, setApproval] = useState(null)
  const [request, setRequest] = useState(null)
  const [assessment, setAssessment] = useState(null)
  const [assessmentError, setAssessmentError] = useState(null)
  const [comment, setComment] = useState('')
  const [loading, setLoading] = useState(true)
  const [loadingAssessment, setLoadingAssessment] = useState(false)
  const [actionLoading, setActionLoading] = useState(false)
  const [message, setMessage] = useState(null)
  const { refreshAll } = useDataContext()

  const loadApproval = async () => {
    setLoading(true)
    setLoadingAssessment(true)
    setMessage(null)
    setAssessmentError(null)

    let approvalData = null
    try {
      approvalData = await getApprovalDetails(crId)
      setApproval(approvalData)
    } catch (err) {
      setMessage(err?.message || 'Unable to load approval details.')
    }

    try {
      const [crResult, assessmentResult] = await Promise.allSettled([
        getChangeRequestById(crId),
        getAssessment(crId),
      ])

      if (crResult.status === 'fulfilled') {
        console.log('Approval CR:', crResult.value)
        setRequest(crResult.value)
      } else {
        console.warn('[ApprovalDetails] getChangeRequestById failed', crResult.reason)
      }

      if (assessmentResult.status === 'fulfilled') {
        console.log('Approval Assessment:', assessmentResult.value)
        setAssessment(assessmentResult.value)
        if (!assessmentResult.value) {
          setAssessmentError('No risk assessment available.')
        }
      } else {
        console.warn('[ApprovalDetails] getAssessment failed', assessmentResult.reason)
        setAssessmentError('No risk assessment available.')
      }
    } catch (err) {
      console.warn('[ApprovalDetails] assessment loading failed', err)
      setAssessmentError('No risk assessment available.')
    } finally {
      setLoading(false)
      setLoadingAssessment(false)
    }
  }

  useEffect(() => {
    loadApproval()
  }, [crId])

  const handleAction = async (mode) => {
    if (!approval) return
    setActionLoading(true)
    setMessage(null)
    try {
      const flowId = approval.flowId || approval.id
      if (mode === 'approve') {
        await approveFlow(flowId, comment)
      } else {
        await rejectFlow(flowId, comment)
      }
      await refreshAll()
      navigate('/approvals/pending')
    } catch (err) {
      setMessage(err?.message || 'Unable to complete approval action.')
    } finally {
      setActionLoading(false)
    }
  }

  const requestData = request || approval?.changeRequest || approval?.request || {}
  const assessmentData = assessment || approval?.assessment || requestData?.assessment || approval?.changeRequest?.assessment || approval?.changeRequest?.riskAssessment || null
  const riskRating =
    assessmentData?.riskLevel || assessmentData?.risk_level || requestData?.riskRating || requestData?.riskLevel || approval?.riskRating || approval?.riskLevel || 'UNKNOWN'
  const normalizedRiskRating = (riskRating || '').toUpperCase()
  const blastRadius =
    assessmentData?.blastRadius || assessmentData?.blast_radius || requestData?.blastRadius || requestData?.blast_radius || approval?.blastRadius || 'N/A'

  const timelineEvents = useMemo(() => {
    const steps = approval?.approvalSteps || approval?.steps || approval?.history || []
    if (Array.isArray(steps) && steps.length > 0) {
      return steps.map((step, index) => ({
        title: step.name || step.step || `Step ${index + 1}`,
        description: step.notes || step.comment || step.description || 'Approval workflow event',
        date: step.date || step.completedAt || step.updatedAt,
        variant: step.status || step.state,
      }))
    }
    return [
      { title: 'Approval requested', description: 'This request is waiting for an approver decision.', date: approval?.createdAt || approval?.submittedAt, variant: 'Pending' },
      { title: 'Review readiness', description: request?.riskRating ? `Risk rating is ${request.riskRating}` : 'Risk information is being evaluated.', date: approval?.updatedAt, variant: request?.riskRating },
    ].filter((item) => item.date)
  }, [approval, request])

  if (loading) return <Loader />

  if (!approval) {
    return (
      <div className="rounded-3xl border border-slate-200 bg-white p-8 text-slate-700 shadow-sm">
        <p className="text-sm">Approval flow not found.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Card
        title={requestData.title || 'Approval details'}
        actions={
          <div className="flex flex-wrap items-center gap-3">
            <StatusBadge status={approval.status || 'PENDING'} />
            <RiskBadge level={riskRating} />
          </div>
        }
      >
        <p className="mt-1 text-sm text-slate-600">
          Review the request summary, risk posture, and decision notes before submitting approval or rejection.
        </p>
      </Card>

      {['HIGH', 'CRITICAL'].includes(normalizedRiskRating) && (
        <div className="rounded-3xl border border-orange-200 bg-orange-50 p-4 text-sm text-orange-900">
          This request has a high-risk assessment. Review the AI guidance carefully before making your approval decision.
        </div>
      )}

      {message && <AlertMessage type="error" message={message} />}

      <div className="grid gap-6 lg:grid-cols-[1.6fr_1fr]">
        <div className="space-y-6">
          <Card title="Request summary">
            <div className="space-y-4 text-sm text-slate-600">
              <div>
                <p className="text-sm font-semibold text-slate-900">Title</p>
                <p>{requestData.title || requestData.description || 'No summary available.'}</p>
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-900">Change ID</p>
                <p>{requestData.id || requestData.changeRequestId || crId}</p>
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-900">Risk rating</p>
                {normalizedRiskRating !== 'UNKNOWN' ? (
                  <RiskBadge level={riskRating} />
                ) : (
                  <p className="text-sm text-slate-600">Not assessed</p>
                )}
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-900">Submitted by</p>
                <p>{requestData.requestedByUserId || requestData.submittedBy || '—'}</p>
              </div>
            </div>
          </Card>

          <Card title="Approval workflow">
            <div className="space-y-3 text-sm text-slate-600">
              <p>{approval.comments || approval.notes || 'Use the form below to record your approval notes and decision.'}</p>
              <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-sm font-semibold text-slate-900">Approver</p>
                <p>{approval.approver || approval.assignedTo || 'Unassigned'}</p>
              </div>
            </div>
          </Card>

          <Card title="Change request details">
            <dl className="grid gap-4 text-sm text-slate-600">
              <div>
                <dt className="font-semibold text-slate-900">Domain</dt>
                <dd>{requestData.domain || '—'}</dd>
              </div>
              <div>
                <dt className="font-semibold text-slate-900">Change type</dt>
                <dd>{requestData.changeType || requestData.change_type || '—'}</dd>
              </div>
              <div>
                <dt className="font-semibold text-slate-900">Region</dt>
                <dd>{requestData.region || '—'}</dd>
              </div>
              <div>
                <dt className="font-semibold text-slate-900">Scheduled window</dt>
                <dd>{requestData.scheduledStart || requestData.scheduled_start || '—'} to {requestData.scheduledEnd || requestData.scheduled_end || '—'}</dd>
              </div>
              <div>
                <dt className="font-semibold text-slate-900">Rollback available</dt>
                <dd>{requestData.rollbackAvailable ? 'Yes' : 'No'}</dd>
              </div>
              <div>
                <dt className="font-semibold text-slate-900">Requested by</dt>
                <dd>{requestData.requestedByUserId || requestData.createdBy || requestData.submittedBy || '—'}</dd>
              </div>
            </dl>
          </Card>

          <Card title="Business justification">
            <p className="text-sm leading-7 text-slate-600">{requestData.businessJustification || requestData.business_justification || 'No justification has been provided.'}</p>
          </Card>
        </div>

        <RiskAssessmentCard
          assessment={assessmentData}
          requestStatus={requestData.status || requestData.state || approval?.status}
          loading={loadingAssessment}
          error={assessmentError}
        />
      </div>

      <Card title="Audit timeline">
        {timelineEvents.length ? (
          <Timeline events={timelineEvents} />
        ) : (
          <p className="text-sm text-slate-600">No timeline information is available for this approval flow.</p>
        )}
      </Card>

      <Card title="Decision comments">
        <textarea
          value={comment}
          onChange={(event) => setComment(event.target.value)}
          placeholder="Add a comment for the final decision"
          rows={5}
          className="w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-900"
        />
      </Card>

      <div className="grid gap-4 sm:grid-cols-2">
        <button
          type="button"
          disabled={actionLoading}
          onClick={() => handleAction('approve')}
          className="rounded-2xl bg-emerald-700 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-600 disabled:cursor-not-allowed disabled:bg-emerald-300"
        >
          {actionLoading ? 'Processing…' : 'Approve'}
        </button>
        <button
          type="button"
          disabled={actionLoading}
          onClick={() => handleAction('reject')}
          className="rounded-2xl bg-rose-700 px-5 py-3 text-sm font-semibold text-white transition hover:bg-rose-600 disabled:cursor-not-allowed disabled:bg-rose-300"
        >
          {actionLoading ? 'Processing…' : 'Reject'}
        </button>
      </div>

      <button
        type="button"
        onClick={() => navigate(-1)}
        className="text-sm font-semibold text-slate-700 hover:text-slate-900"
      >
        Back to approvals
      </button>
    </div>
  )
}

export default ApprovalDetails
