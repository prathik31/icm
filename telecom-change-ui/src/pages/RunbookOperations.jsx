import { useEffect, useState } from 'react'
import { fetchChangeRequests } from '../api/crApi'
import { sortByLatest } from '../utils/sortByLatest'

export default function RunbookOperations() {

  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {

    async function load() {

      try {

        const data = await fetchChangeRequests()

        const filtered = data.filter(

          (cr) =>
            cr.status === 'APPROVED' ||
            cr.status === 'RUNBOOK_READY'
        )

        setRequests(sortByLatest(filtered, ['updatedAt', 'createdAt']))

      } catch (err) {

        console.error(
          'Failed to load runbook operations',
          err
        )

      } finally {

        setLoading(false)
      }
    }

    load()

  }, [])

  if (loading) {

    return (
      <div className="p-6">
        Loading runbook operations...
      </div>
    )
  }

  return (

    <div className="space-y-6 p-6">

      <div>

        <h1 className="text-3xl font-bold text-slate-900">
          Runbook Operations
        </h1>

        <p className="mt-2 text-slate-600">
          AI-generated execution procedures for approved changes.
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

              <div className="rounded-full bg-emerald-100 px-4 py-2 text-sm font-semibold text-emerald-700">
                {request.status}
              </div>

            </div>

            <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-4">

              <div>

                <p className="text-xs uppercase text-slate-500">
                  Domain
                </p>

                <p className="mt-1 font-semibold text-slate-900">
                  {request.domain}
                </p>

              </div>

              <div>

                <p className="text-xs uppercase text-slate-500">
                  Region
                </p>

                <p className="mt-1 font-semibold text-slate-900">
                  {request.region}
                </p>

              </div>

              <div>

                <p className="text-xs uppercase text-slate-500">
                  Change Type
                </p>

                <p className="mt-1 font-semibold text-slate-900">
                  {request.changeType}
                </p>

              </div>

              <div>

                <p className="text-xs uppercase text-slate-500">
                  Rollback
                </p>

                <p className="mt-1 font-semibold text-slate-900">
                  {request.rollbackAvailable
                    ? 'Available'
                    : 'Unavailable'}
                </p>

              </div>

            </div>

            <div className="mt-6">

              <button
                className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
              >
                View Generated Runbook
              </button>

            </div>

          </div>

        ))}

      </div>

    </div>
  )
}