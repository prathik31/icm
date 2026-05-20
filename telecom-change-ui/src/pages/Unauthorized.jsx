import { Link } from 'react-router-dom'

const Unauthorized = () => {
  return (
    <div className="mx-auto max-w-3xl rounded-3xl border border-rose-200 bg-white p-12 shadow-sm">
      <div className="text-center">
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-rose-600">Unauthorized</p>
        <h1 className="mt-6 text-3xl font-semibold text-slate-900">Access denied</h1>
        <p className="mt-3 text-sm leading-7 text-slate-600">You don’t have permission to view this section. Please return to your dashboard or contact your administrator.</p>
        <Link to="/dashboard" className="mt-8 inline-flex rounded-2xl bg-slate-900 px-6 py-3 text-sm font-semibold text-white hover:bg-slate-800">
          Back to dashboard
        </Link>
      </div>
    </div>
  )
}

export default Unauthorized
