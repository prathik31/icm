import { Link } from 'react-router-dom'

const NotFound = () => {
  return (
    <div className="mx-auto max-w-3xl rounded-3xl border border-slate-200 bg-white p-12 shadow-sm text-center">
      <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-500">404</p>
      <h1 className="mt-6 text-3xl font-semibold text-slate-900">Page not found</h1>
      <p className="mt-3 text-sm leading-7 text-slate-600">The page you’re looking for can’t be found. Check the URL or return to the dashboard.</p>
      <Link to="/dashboard" className="mt-8 inline-flex rounded-2xl bg-slate-900 px-6 py-3 text-sm font-semibold text-white hover:bg-slate-800">
        Back to dashboard
      </Link>
    </div>
  )
}

export default NotFound
