import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useDashboard } from '../hooks/useDashboard'
import Card from '../components/ui/Card'
import StatusBadge from '../components/StatusBadge'
import RiskBadge from '../components/RiskBadge'
import EmptyState from '../components/EmptyState'

const statPlaceholder = (
  <span className="inline-block h-10 w-20 animate-pulse rounded-xl bg-slate-200" />
)

const Dashboard = () => {
  const { role } = useAuth()
  const {
    requests,
    approvals,
    totals,
    loadingRequests,
    loadingApprovals,
    errorRequests,
    errorApprovals,
    refreshRequests,
    refreshApprovals,
    refreshAll,
  } = useDashboard()

  const summaryRequests = useMemo(() => requests.slice(0, 3), [requests])
  const recentApprovals = useMemo(() => approvals.slice(0, 3), [approvals])

  const summaryError = errorRequests || errorApprovals
  const breadcrumbError = [errorRequests && `Requests: ${errorRequests}`, errorApprovals && `Approvals: ${errorApprovals}`]
    .filter(Boolean)
    .join(' | ')

  const renderWidgetError = (message, retry) => (
    <div className="rounded-3xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-900">
      <div>{message}</div>
      <button
        type="button"
        onClick={retry}
        className="mt-3 inline-flex rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-900 shadow-sm hover:bg-slate-100"
      >
        Retry
      </button>
    </div>
  )

  const renderListPlaceholder = () => (
    <div className="space-y-4">
      {[1, 2, 3].map((item) => (
        <div key={item} className="rounded-3xl border border-slate-200 bg-slate-50 p-4 shadow-sm">
          <div className="h-5 w-32 rounded bg-slate-200" />
          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            <div className="h-4 w-full rounded bg-slate-200" />
            <div className="h-4 w-3/4 rounded bg-slate-200" />
          </div>
        </div>
      ))}
    </div>
  )

  return (
    <div className="space-y-6">
      <div className="grid gap-6 xl:grid-cols-[1.8fr_1fr]">
        <Card title="Workflow summary">
          <div className="flex flex-col gap-3 text-sm text-slate-600">
            <p>Monitor the change request pipeline, risk posture, and approvals at a glance.</p>
            {summaryError && (
              <div className="rounded-3xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-900">
                {breadcrumbError}
                <button
                  type="button"
                  onClick={refreshAll}
                  className="ml-3 inline-flex rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-900 shadow-sm hover:bg-slate-100"
                >
                  Retry all
                </button>
              </div>
            )}
          </div>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-sm text-slate-500">Total CRs</p>
              <div className="mt-3 text-3xl font-semibold text-slate-900">
                {loadingRequests ? statPlaceholder : totals.total}
              </div>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-sm text-slate-500">Pending approvals</p>
              <div className="mt-3 text-3xl font-semibold text-slate-900">
                {loadingApprovals ? statPlaceholder : totals.pendingApprovals}
              </div>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-sm text-slate-500">Approved CRs</p>
              <div className="mt-3 text-3xl font-semibold text-slate-900">
                {loadingRequests ? statPlaceholder : totals.approved}
              </div>
            </div>
          </div>
        </Card>

        <Card title="Role actions">
          <div className="space-y-4 text-sm text-slate-600">
            {(role === 'ENGINEER' || role === 'ADMIN') && (
              <div className="rounded-3xl border border-slate-200 bg-white p-4">
                <p className="font-semibold text-slate-900">Engineer workflow</p>
                <p className="mt-2 leading-6">Create, submit, and confirm risk for change requests before they enter the approval queue.</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  <Link to="/cr/create" className="rounded-2xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800">
                    Create CR
                  </Link>
                  <Link to="/cr/list" className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-semibold text-slate-900 hover:bg-slate-100">
                    My requests
                  </Link>
                </div>
              </div>
            )}

            {(role === 'APPROVER' || role === 'ADMIN') && (
              <div className="rounded-3xl border border-slate-200 bg-white p-4">
                <p className="font-semibold text-slate-900">Approver workflow</p>
                <p className="mt-2 leading-6">Review pending approvals, evaluate risk summaries, and make timely decisions.</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  <Link to="/approvals/pending" className="rounded-2xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800">
                    Pending approvals
                  </Link>
                  <Link to="/approvals/history" className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-semibold text-slate-900 hover:bg-slate-100">
                    Approval history
                  </Link>
                </div>
              </div>
            )}
          </div>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-slate-900">Submitted</p>
              <div className="mt-2 text-3xl font-semibold text-slate-900">
                {loadingRequests ? statPlaceholder : totals.submitted}
              </div>
            </div>
            <div className="rounded-3xl bg-sky-100 px-3 py-2 text-sm font-semibold text-sky-700">Live</div>
          </div>
        </div>
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-slate-900">Analyzed</p>
              <div className="mt-2 text-3xl font-semibold text-slate-900">
                {loadingRequests ? statPlaceholder : totals.analyzed}
              </div>
            </div>
            <div className="rounded-3xl bg-amber-100 px-3 py-2 text-sm font-semibold text-amber-700">Review</div>
          </div>
        </div>
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-slate-900">Risk confirmed</p>
              <div className="mt-2 text-3xl font-semibold text-slate-900">
                {loadingRequests ? statPlaceholder : totals.confirmed}
              </div>
            </div>
            <div className="rounded-3xl bg-sky-100 px-3 py-2 text-sm font-semibold text-sky-700">Ready</div>
          </div>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        <Card title="Recent requests">
          {loadingRequests ? (
            renderListPlaceholder()
          ) : errorRequests ? (
            renderWidgetError(errorRequests, refreshRequests)
          ) : summaryRequests.length === 0 ? (
            <EmptyState
              title="No requests yet"
              description="Create your first change request and get risk analysis started."
            />
          ) : (
            <div className="space-y-4">
              {summaryRequests.map((request) => (
                <div key={request.id || request.crId} className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="font-semibold text-slate-900">{request.title || 'Change request'}</p>
                      <p className="mt-1 text-sm text-slate-600">{request.region || 'No region specified'}</p>
                    </div>
                    <div className="text-right">
                      <div className="mb-2"><StatusBadge status={request.status || 'UNKNOWN'} /></div>
                      <div className="flex items-center gap-3">
                        <RiskBadge level={request.assessment?.riskLevel || request.riskRating || request.riskLevel || 'UNKNOWN'} />
                        <div className="text-sm text-slate-600">{request.riskScore ?? '—'}</div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card title="Recent approvals">
          {loadingApprovals ? (
            renderListPlaceholder()
          ) : errorApprovals ? (
            renderWidgetError(errorApprovals, refreshApprovals)
          ) : recentApprovals.length === 0 ? (
            <EmptyState
              title="No approvals waiting"
              description="The approval queue is clear. Monitor for new submissions."
            />
          ) : (
            <div className="space-y-4">
              {recentApprovals.map((item) => (
                <div key={item.flowId || item.id} className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-semibold text-slate-900">CR {item.changeRequestId || item.crId}</p>
                    <StatusBadge status={item.status || 'PENDING'} />
                  </div>
                  <div className="mt-2 flex items-center gap-2 text-sm text-slate-600">
                    <RiskBadge level={item.riskRating || item.riskLevel || 'UNKNOWN'} />
                    <span>{item.blastRadius || 'No blast radius'}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}

export default Dashboard
