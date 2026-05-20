import Card from '../ui/Card'
import RiskBadge from '../RiskBadge'

const RiskAssessmentCard = ({ assessment, requestStatus, loading, error }) => {
  const riskRating = assessment?.riskLevel || assessment?.risk_level || assessment?.riskRating || assessment?.risk_rating || 'UNKNOWN'
  const blastRadius = assessment?.blastRadius || assessment?.blast_radius || assessment?.radius || 'N/A'
  const riskScore = assessment?.riskScore ?? assessment?.risk_score ?? assessment?.score ?? '—'
  const confidence = assessment?.confidence ?? assessment?.confidenceScore ?? null
  const recommendations = Array.isArray(assessment?.recommendations)
    ? assessment.recommendations
    : assessment?.recommendation
    ? [assessment.recommendation]
    : []
  const riskIndicators = Array.isArray(assessment?.riskIndicators)
    ? assessment.riskIndicators
    : Array.isArray(assessment?.risk_indicators)
    ? assessment.risk_indicators
    : []
  const executiveSummary =
    assessment?.executiveSummary || assessment?.executive_summary || assessment?.summary || 'No executive summary available.'
  const technicalAnalysis =
    assessment?.technicalAnalysis || assessment?.technical_analysis || assessment?.reasoning || 'No technical analysis available.'
  const cabGuidance = assessment?.cabGuidance || assessment?.cab_guidance || 'No CAB guidance available.'
  const hasAssessment = !!(
    assessment &&
    (assessment.riskLevel || assessment.risk_level || assessment.riskScore || assessment.risk_score || blastRadius || recommendations.length || riskIndicators.length || executiveSummary || technicalAnalysis)
  )

  return (
    <Card title="Risk assessment summary">
      {loading ? (
        <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6 text-sm text-slate-600">Loading assessment...</div>
      ) : error ? (
        <div className="rounded-3xl border border-rose-200 bg-rose-50 p-6 text-sm text-rose-900">{error}</div>
      ) : hasAssessment ? (
        <div className="space-y-6 text-sm text-slate-600">
          <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Risk level</p>
              <div className="mt-3 flex items-center gap-2">
                <RiskBadge level={riskRating} />
                <span className="text-sm font-semibold text-slate-900">{riskRating}</span>
              </div>
            </div>
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Blast radius</p>
              <p className="mt-3 text-sm font-semibold text-slate-900">{blastRadius}</p>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Risk score</p>
              <p className="mt-3 text-2xl font-semibold text-slate-900">{riskScore}</p>
            </div>
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Confidence</p>
              <p className="mt-3 text-sm font-semibold text-slate-900">
                {confidence != null ? `${Math.round(confidence * 100)}%` : 'Unknown'}
              </p>
              <div className="mt-3 h-3 overflow-hidden rounded-full bg-slate-200">
                <div
                  className="h-full rounded-full bg-slate-900 transition-all"
                  style={{ width: `${confidence != null ? Math.min(100, Math.max(0, confidence * 100)) : 0}%` }}
                />
              </div>
            </div>
          </div>

          <div className="grid gap-4 xl:grid-cols-2">
            <div className="space-y-3 rounded-3xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Executive summary</p>
              <p className="text-sm leading-7 text-slate-700">{executiveSummary}</p>
            </div>
            <div className="space-y-3 rounded-3xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Technical analysis</p>
              <p className="text-sm leading-7 text-slate-700">{technicalAnalysis}</p>
            </div>
          </div>

          <div className="space-y-4 rounded-3xl border border-slate-200 bg-slate-50 p-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">CAB guidance</p>
              <p className="mt-3 text-sm leading-7 text-slate-700">{cabGuidance}</p>
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Recommendations</p>
              {recommendations.length ? (
                <ul className="mt-3 space-y-2 list-disc pl-5 text-sm text-slate-700">
                  {recommendations.map((item, index) => (
                    <li key={index}>{item}</li>
                  ))}
                </ul>
              ) : (
                <p className="mt-3 text-sm text-slate-600">No recommendations available.</p>
              )}
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Risk indicators</p>
              {riskIndicators.length ? (
                <div className="mt-3 flex flex-wrap gap-2">
                  {riskIndicators.map((indicator, index) => (
                    <span key={index} className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                      {indicator}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="mt-3 text-sm text-slate-600">No risk indicators available.</p>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6 text-sm text-slate-600">No risk assessment available.</div>
      )}
    </Card>
  )
}

export default RiskAssessmentCard
