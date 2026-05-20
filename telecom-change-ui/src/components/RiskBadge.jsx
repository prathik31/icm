const RiskBadge = ({ level }) => {
  const normalized = (level || '').toUpperCase()
  const className =
    normalized === 'CRITICAL'
      ? 'bg-red-100 text-red-700'
      : normalized === 'HIGH'
      ? 'bg-orange-100 text-orange-700'
      : normalized === 'MEDIUM'
      ? 'bg-amber-100 text-amber-700'
      : normalized === 'LOW'
      ? 'bg-green-100 text-green-700'
      : 'bg-slate-100 text-slate-700'

  return <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${className}`}>{level || 'UNKNOWN'}</span>
}

export default RiskBadge
