import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getChangeRequestById, getAssessment } from '../services/crService'
import Loader from '../components/Loader'
import Card from '../components/ui/Card'
import EmptyState from '../components/EmptyState'

const CRRisk = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [request, setRequest] = useState(null)
  const [assessment, setAssessment] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      setError(null)
      try {
        const r = await getChangeRequestById(id)
        setRequest(r)
        const a = await getAssessment(id)
        setAssessment(a)
      } catch (err) {
        setError(err?.message || 'Unable to load risk assessment.')
      } finally {
        setLoading(false)
      }
    }
    if (id) load()
  }, [id])

  if (loading) return <Loader />

  if (!request) return (
    <div className="rounded-3xl border border-slate-200 bg-white p-8 text-slate-700 shadow-sm">
      <p className="text-sm">Change request not found.</p>
    </div>
  )

  if (!assessment) return (
    <EmptyState title="No assessment" description="No risk assessment is available for this change request." />
  )

  const riskLevel = assessment.riskLevel || assessment.risk_level || assessment.riskRating || 'UNKNOWN'
  const riskScore = assessment.riskScore ?? assessment.risk_score ?? '—'
  const blastRadius = assessment.blastRadius || assessment.blast_radius || '—'
  const confidence = assessment.confidence ?? assessment.confidenceScore ?? '—'

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-[1fr_auto]">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Risk assessment</h1>
          <p className="mt-1 text-sm text-slate-500">Executive and technical risk summary for CR {id}.</p>
        </div>
        <div>
          <button onClick={() => navigate(-1)} className="inline-flex items-center justify-center rounded-lg bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-900">Back</button>
        </div>
      </div>

      <Card title={`CR ${id} — ${request.title || 'Change request'}`}>
        <div className="grid gap-4 text-sm text-slate-700">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <dt className="font-semibold text-slate-900">Risk level</dt>
              <dd>{riskLevel}</dd>
            </div>
            <div>
              <dt className="font-semibold text-slate-900">Risk score</dt>
              <dd>{riskScore}</dd>
            </div>
            <div>
              <dt className="font-semibold text-slate-900">Blast radius</dt>
              <dd>{blastRadius}</dd>
            </div>
            <div>
              <dt className="font-semibold text-slate-900">Confidence</dt>
              <dd>{confidence}</dd>
            </div>
          </div>

          <div>
            <dt className="font-semibold text-slate-900">Executive summary</dt>
            <dd className="text-sm text-slate-600">{assessment.executiveSummary || assessment.executive_summary || '—'}</dd>
          </div>

          <div>
            <dt className="font-semibold text-slate-900">Technical analysis</dt>
            <dd className="text-sm text-slate-600">{assessment.technicalAnalysis || assessment.technical_analysis || '—'}</dd>
          </div>

          <div>
            <dt className="font-semibold text-slate-900">CAB guidance</dt>
            <dd className="text-sm text-slate-600">{assessment.cabGuidance || assessment.cab_guidance || '—'}</dd>
          </div>

          <div>
            <dt className="font-semibold text-slate-900">Recommendations</dt>
            <dd className="text-sm text-slate-600">
              {Array.isArray(assessment.recommendations) ? (
                <ul className="list-disc pl-5">
                  {assessment.recommendations.map((r, i) => <li key={i}>{typeof r === 'string' ? r : JSON.stringify(r)}</li>)}
                </ul>
              ) : (
                assessment.recommendations || '—'
              )}
            </dd>
          </div>

          <div>
            <dt className="font-semibold text-slate-900">Indicators</dt>
            <dd className="text-sm text-slate-600">{Array.isArray(assessment.indicators) ? assessment.indicators.join(', ') : assessment.indicators || '—'}</dd>
          </div>
        </div>
      </Card>
    </div>
  )
}

export default CRRisk
