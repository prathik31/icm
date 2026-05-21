import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  fetchChangeRequests,
  fetchAssessment
} from '../api/crApi'

export default function RiskAssessments() {

  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {

    async function fetchRequests() {

      try {

        const data = await fetchChangeRequests()

        const filtered = data.filter(
          (cr) =>
            cr.status === 'ANALYZED' ||
            cr.status === 'SUBMITTED' ||
            cr.status === 'RISK_CONFIRMED'
        )

        const enriched = await Promise.all(

          filtered.map(async (cr) => {

            try {

              const assessment =
                await fetchAssessment(cr.crId)

              return {
                ...cr,
                assessment,
              }

            } catch {

              return cr
            }
          })
        )

        // sort by most recent created/updated first
        enriched.sort((a, b) => new Date(b.createdAt || b.updatedAt || 0) - new Date(a.createdAt || a.updatedAt || 0))
        setRequests(enriched)

      } catch (err) {

        console.error('Failed to fetch risk assessments', err)

      } finally {

        setLoading(false)
      }
    }

    fetchRequests()

  }, [])

  if (loading) {
    return (
      <div className="p-6 text-slate-700">
        Loading risk assessments...
      </div>
    )
  }

  return (
    <div className="space-y-6 p-6">

      <div>
        <h1 className="text-3xl font-bold text-slate-900">
          Risk Assessments
        </h1>

        <p className="mt-2 text-slate-600">
          Review AI-generated operational risk analysis for submitted change requests.
        </p>
      </div>

      <div className="grid gap-6">

        {requests.map((request) => (

          <div
            key={request.crId}
            className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
          >

            <div className="flex items-center justify-between">

              <div>
                <h2 className="text-xl font-semibold text-slate-900">
                  {request.title}
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  {request.crId}
                </p>
              </div>

              <div className="rounded-full bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700">
                {request.status}
              </div>

            </div>

            <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-4">

              <div>
                <p className="text-xs uppercase text-slate-500">
                  Risk Level
                </p>

                <p className="mt-1 font-semibold text-slate-900">
                  {request.assessment?.riskLevel || 'Pending'}
                </p>
              </div>

              <div>
                <p className="text-xs uppercase text-slate-500">
                  Risk Score
                </p>

                <p className="mt-1 font-semibold text-slate-900">
                  {request.assessment?.riskScore || '—'}
                </p>
              </div>

              <div>
                <p className="text-xs uppercase text-slate-500">
                  Blast Radius
                </p>

                <p className="mt-1 font-semibold text-slate-900">
                  {request.assessment?.blastRadius || '—'}
                </p>
              </div>

              <div>
                <p className="text-xs uppercase text-slate-500">
                  Confidence
                </p>

                <p className="mt-1 font-semibold text-slate-900">
                  {request.assessment?.confidence || '—'}
                </p>
              </div>

            </div>

            <div className="mt-6 flex items-center gap-4">

              <Link
                to={`/cr/details/${request.crId}`}
                className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
              >
                View Details
              </Link>

            </div>

          </div>

        ))}

      </div>

    </div>
  )
}