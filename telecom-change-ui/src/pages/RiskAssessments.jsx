import { useEffect, useState } from 'react'
import axiosClient from '../api/axiosClient'
import { CR_API } from '../config/api'

export default function RiskAssessments() {
  const [riskAssessments, setRiskAssessments] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchRequests() {
      try {
        const response = await axiosClient.get(`${CR_API}/v1/change-requests`)
        console.log(response)
        console.log(response.data?.[0]?.riskAssessment)
        setRiskAssessments(response.data)
      } catch (err) {
        console.error('Failed to fetch risk assessments', err)
      } finally {
        setLoading(false)
      }
    }

    fetchRequests()
  }, [])

  if (loading) {
    return <div className="p-6 text-slate-700">Loading risk assessments...</div>
  }

  return (
    <div className="p-8">

      <div className="mb-8">
        <h1 className="text-4xl font-bold text-slate-900">
          Risk Assessments
        </h1>

        <p className="text-slate-500 mt-2">
          Review AI-generated operational risk analysis.
        </p>
      </div>

      <div className="space-y-6">

        {riskAssessments?.length > 0 ? (

          riskAssessments.map((cr) => (

            <div
              key={cr.crId}
              className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6"
            >

              {/* HEADER */}

              <div className="flex items-start justify-between mb-5">

                <div>
                  <h2 className="text-2xl font-bold text-slate-900">
                    {cr.title}
                  </h2>

                  <p className="text-slate-500 mt-1">
                    {cr.description}
                  </p>
                </div>

                <div className="px-4 py-2 rounded-full bg-yellow-100 text-yellow-700 font-semibold">
                  {cr.riskAssessment?.riskLevel}
                </div>

              </div>

              {/* METRICS */}

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">

                <div>
                  <p className="text-xs text-slate-400">
                    Risk Score
                  </p>

                  <p className="font-bold text-lg">
                    {cr.riskAssessment?.riskScore}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-slate-400">
                    Blast Radius
                  </p>

                  <p className="font-semibold">
                    {cr.riskAssessment?.blastRadius}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-slate-400">
                    Confidence
                  </p>

                  <p className="font-semibold">
                    {Math.round(
                      (cr.riskAssessment?.confidence || 0) * 100
                    )}%
                  </p>
                </div>

                <div>
                  <p className="text-xs text-slate-400">
                    Region
                  </p>

                  <p className="font-semibold">
                    {cr.region}
                  </p>
                </div>

              </div>

              {/* EXECUTIVE SUMMARY */}

              <div className="mb-5">

                <h3 className="font-semibold text-slate-900 mb-2">
                  Executive Summary
                </h3>

                <p className="text-slate-600 leading-7">
                  {cr.riskAssessment?.executiveSummary}
                </p>

              </div>

              {/* TECHNICAL ANALYSIS */}

              <div className="mb-5">

                <h3 className="font-semibold text-slate-900 mb-2">
                  Technical Analysis
                </h3>

                <p className="text-slate-600 leading-7">
                  {cr.riskAssessment?.technicalAnalysis}
                </p>

              </div>

              {/* RECOMMENDATIONS */}

              <div className="mb-5">

                <h3 className="font-semibold text-slate-900 mb-2">
                  Recommendations
                </h3>

                <ul className="list-disc ml-6 text-slate-700 space-y-1">

                  {cr.riskAssessment?.recommendations?.map((rec, idx) => (
                    <li key={idx}>
                      {rec}
                    </li>
                  ))}

                </ul>

              </div>

              {/* INDICATORS */}

              <div>

                <h3 className="font-semibold text-slate-900 mb-2">
                  Risk Indicators
                </h3>

                <div className="flex flex-wrap gap-2">

                  {cr.riskAssessment?.riskIndicators?.map((indicator, idx) => (

                    <span
                      key={idx}
                      className="px-3 py-1 rounded-full bg-red-100 text-red-700 text-sm font-medium"
                    >
                      {indicator}
                    </span>

                  ))}

                </div>

              </div>

            </div>

          ))

        ) : (

          <div className="text-slate-500">
            No risk assessments found.
          </div>

        )}

      </div>

    </div>
  )
}