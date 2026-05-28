export const ExecutionStep = ({ step, index }) => {
  const getStatusColor = (status) => {
    switch ((status || '').toUpperCase()) {
      case 'COMPLETED':
        return 'bg-green-100 text-green-700'
      case 'FAILED':
        return 'bg-red-100 text-red-700'
      case 'IN_PROGRESS':
        return 'bg-blue-100 text-blue-700'
      default:
        return 'bg-slate-100 text-slate-700'
    }
  }

  return (
    <div className="flex gap-4">
      <div className="flex flex-col items-center">
        <div className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-blue-300 bg-blue-50 font-semibold text-blue-700">
          {index + 1}
        </div>
        {index < 99 && <div className="mt-2 h-16 border-l-2 border-slate-200" />}
      </div>
      <div className="flex-1 pb-8">
        <div className="mb-3 flex items-center justify-between">
          <h4 className="font-semibold text-slate-900">{step.action || step.title || 'Step'}</h4>
          {step.status && (
            <span className={`rounded-full px-2 py-1 text-xs font-medium ${getStatusColor(step.status)}`}>
              {step.status}
            </span>
          )}
        </div>
        {step.command && (
          <div className="mb-3 rounded bg-slate-900 p-3 font-mono text-xs text-slate-100">
            <div className="mb-1 text-slate-400">$</div>
            {step.command}
          </div>
        )}
        {(step.action || step.description || step.title) && (
          <p className="mb-2 text-sm text-slate-600">{step.action || step.description || step.title}</p>
        )}
        {(step.expected_output || step.expectedOutput) && (
          <div className="mb-2 text-sm">
            <p className="mb-1 font-medium text-slate-700">Expected Output:</p>
            <p className="text-slate-600">{step.expected_output || step.expectedOutput}</p>
          </div>
        )}
        {(step.rollback_action || step.rollbackAction || step.rollback) && (
          <div className="mt-3 border-l-2 border-orange-300 bg-orange-50 p-3 text-sm">
            <p className="mb-1 font-medium text-orange-900">Rollback:</p>
            <p className="text-orange-800">{step.rollback_action || step.rollbackAction || step.rollback}</p>
          </div>
        )}
      </div>
    </div>
  )
}
