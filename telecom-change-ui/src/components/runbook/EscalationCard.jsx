export const EscalationCard = ({ condition, index }) => {
  const getSeverityColor = (severity) => {
    switch ((severity || '').toUpperCase()) {
      case 'CRITICAL':
        return 'bg-red-100 text-red-700 border-red-300'
      case 'HIGH':
        return 'bg-orange-100 text-orange-700 border-orange-300'
      case 'MEDIUM':
        return 'bg-yellow-100 text-yellow-700 border-yellow-300'
      default:
        return 'bg-blue-100 text-blue-700 border-blue-300'
    }
  }

  const getSeverityBg = (severity) => {
    switch ((severity || '').toUpperCase()) {
      case 'CRITICAL':
        return 'bg-red-50'
      case 'HIGH':
        return 'bg-orange-50'
      case 'MEDIUM':
        return 'bg-yellow-50'
      default:
        return 'bg-blue-50'
    }
  }

  return (
    <div className={`rounded-lg border-2 ${getSeverityColor(condition.severity)} p-4 ${getSeverityBg(condition.severity)}`}>
      <div className="mb-2 flex items-center justify-between">
        <h4 className="font-semibold">{condition.trigger || 'Escalation Trigger'}</h4>
        {condition.severity && (
          <span className={`rounded-full px-2 py-1 text-xs font-bold ${getSeverityColor(condition.severity)}`}>
            {condition.severity}
          </span>
        )}
      </div>

      {condition.description && (
        <p className="mb-3 text-sm">{condition.description}</p>
      )}

      {condition.metrics && (
        <div className="mb-3 space-y-1">
          <p className="text-xs font-medium uppercase">Detection:</p>
          {Array.isArray(condition.metrics) ? (
            condition.metrics.map((metric, idx) => (
              <p key={idx} className="text-xs">
                • {metric}
              </p>
            ))
          ) : (
            <p className="text-xs">• {condition.metrics}</p>
          )}
        </div>
      )}

      {condition.action && (
        <div className="rounded bg-slate-100 p-2 text-xs font-mono">
          <p className="font-bold">Action: {condition.action}</p>
        </div>
      )}

      {condition.contactTeam && (
        <div className="mt-3 border-t-2 pt-2 text-xs font-semibold">
          📞 Contact: {condition.contactTeam}
        </div>
      )}
    </div>
  )
}
