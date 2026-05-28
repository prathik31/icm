import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { fetchEligibleCRs, generateRunbook } from '../api/runbookApi'
import { sortByLatest } from '../utils/sortByLatest'

const Runbooks = () => {
  const [crs, setCrs] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [generatingCrId, setGeneratingCrId] = useState(null)
  const navigate = useNavigate()

  useEffect(() => {
    loadCRs()
  }, [])

  const loadCRs = async () => {
    try {
      const data = await fetchEligibleCRs()
      setCrs(sortByLatest(Array.isArray(data) ? data : [], ['generatedAt', 'createdAt', 'updatedAt']))
    } catch (err) {
      setError(err?.message || 'Unable to load eligible change requests.')
    } finally {
      setLoading(false)
    }
  }

  const handleGenerate = async (crId) => {
    try {
      setGeneratingCrId(crId)
      await generateRunbook(crId)
      navigate(`/runbooks/${crId}`)
    } catch (err) {
      console.error(err)
      alert('Runbook generation failed')
    } finally {
      setGeneratingCrId(null)
    }
  }

  const hasGeneratedRunbook = (cr) => Boolean(
    cr?.runbookGenerated ||
    cr?.hasRunbook ||
    cr?.generatedRunbook ||
    cr?.runbookId ||
    cr?.runbook
  )

  if (loading) {
    return <div className="p-6">Loading...</div>
  }

  return (
    <div className="p-6">

      <h1 className="text-3xl font-bold mb-6">
        Eligible Change Requests
      </h1>

      {error && (
        <div className="mb-6 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800">
          {error}
        </div>
      )}

      <div className="grid gap-6">

        {crs.map((cr) => (
          (() => {
            const runbookGenerated = Boolean(cr.runbookGenerated || cr.hasRunbook || cr.generatedRunbook || cr.runbookId || cr.runbook)

            return (

          <div
            key={cr.crId}
            className="bg-white rounded-2xl shadow p-6 border"
          >

            <div className="flex justify-between items-start gap-4">

              <div>

                <h2 className="text-2xl font-semibold">
                  {cr.title}
                </h2>

                <p className="text-sm text-slate-500 mt-2 font-medium">
                  Created:{" "}
                  {new Date(cr.createdAt).toLocaleString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                    hour: "numeric",
                    minute: "2-digit",
                  })}
                </p>

                <p className="text-gray-600 mt-2">
                  {cr.domain} • {cr.region}
                </p>

                <div className="flex gap-2 mt-4 flex-wrap">

                  <span className="badge-risk bg-red-100 text-red-700 px-3 py-1 rounded-full text-sm font-semibold">
                    {cr.riskLevel} RISK
                  </span>

                  <span className="badge-radius bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full text-sm font-semibold">
                    {cr.blastRadius}
                  </span>

                  {runbookGenerated && (
                    <span className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-sm font-semibold">
                      RUNBOOK GENERATED
                    </span>
                  )}

                </div>

              </div>

              {runbookGenerated ? (
                <button
                  onClick={() => navigate(`/runbooks/${cr.crId}`)}
                  className="bg-slate-900 hover:bg-black text-white px-6 py-3 rounded-xl font-semibold"
                >
                  View Runbook
                </button>
              ) : (
                <button
                  onClick={() => handleGenerate(cr.crId)}
                  disabled={generatingCrId === cr.crId}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-semibold disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {generatingCrId === cr.crId ? 'Generating...' : 'Generate Runbook'}
                </button>
              )}

            </div>

          </div>

            )
          })()

        ))}

      </div>

      {crs.length === 0 && (
        <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 text-slate-600">
          No eligible change requests available.
        </div>
      )}

    </div>
  )
}

export default Runbooks
