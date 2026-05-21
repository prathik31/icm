import { useEffect, useState } from 'react'
import { fetchChangeRequests } from '../api/crApi'
import { Link } from 'react-router-dom'

export default function ApprovedChanges() {

  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {

    async function load() {

      try {

        const data =
          await fetchChangeRequests()

        const approved =
          data.filter(
            (cr) =>
              cr.status === 'APPROVED'
          )

        setRequests(approved)

      } catch (err) {

        console.error(
          'Failed to load approved CRs',
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
        Loading approved changes...
      </div>
    )
  }

  return (

    <div className="space-y-6 p-6">

      <div>

        <h1 className="text-3xl font-bold text-slate-900">
          Approved Changes
        </h1>

        <p className="mt-2 text-slate-600">
          Successfully approved and execution-ready changes.
        </p>

      </div>

      <div className="grid gap-6">

        {requests.map((request) => (

          <div
            key={request.crId}
            className="rounded-2xl border border-emerald-200 bg-white p-6 shadow-sm"
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
                APPROVED
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
                  Type
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

            <div className="mt-6 flex gap-3">

              <Link
                to={`/cr/details/${request.crId}`}
                className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
              >
                View CR
              </Link>

              <Link
                to={`/runbooks/${request.crId}`}
                className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
              >
                View Runbook
              </Link>

            </div>

          </div>

        ))}

      </div>

    </div>
  )
}