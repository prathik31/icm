const StatusBadge = ({ status }) => {
  const normalized = (status || '').toUpperCase()
  const className =
    normalized === 'DRAFT'
      ? 'bg-slate-100 text-slate-700'
      : normalized === 'SUBMITTED'
      ? 'bg-blue-100 text-blue-700'
      : normalized === 'ANALYZED'
      ? 'bg-amber-100 text-amber-700'
      : normalized === 'RISK_CONFIRMED'
      ? 'bg-orange-100 text-orange-700'
      : normalized === 'PENDING'
      ? 'bg-blue-100 text-blue-700'
      : normalized === 'APPROVED'
      ? 'bg-green-100 text-green-700'
      : normalized === 'REJECTED'
      ? 'bg-red-100 text-red-700'
      : 'bg-slate-100 text-slate-700'

  return <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${className}`}>{status || 'UNKNOWN'}</span>
}

export default StatusBadge
