export const RollbackSection = ({ rollbackPlan }) => {
  if (!rollbackPlan) return null

  return (
    <div className="rounded-lg border border-red-200 bg-red-50 p-6">
      <h3 className="mb-4 text-lg font-semibold text-red-900">
        ⚠ Rollback Plan
      </h3>
      {rollbackPlan.description && (
        <p className="mb-4 text-sm text-red-800">
          {rollbackPlan.description}
        </p>
      )}
      {Array.isArray(rollbackPlan.steps) && rollbackPlan.steps.length > 0 && (
        <div className="space-y-3">
          {rollbackPlan.steps.map((step, idx) => (
            <div key={idx} className="rounded bg-red-100 p-3">
              <p className="mb-2 text-sm font-medium text-red-900">
                {step.order && `${step.order}. `}
                {step.action || step.title}
              </p>
              {step.command && (
                <div className="mb-2 rounded bg-slate-900 p-2 font-mono text-xs text-slate-100">
                  {step.command}
                </div>
              )}
              {step.description && (
                <p className="text-xs text-red-800">{step.description}</p>
              )}
            </div>
          ))}
        </div>
      )}
      {rollbackPlan.estimatedDuration && (
        <div className="mt-4 rounded bg-red-100 p-3 text-sm text-red-800">
          <strong>Estimated Duration:</strong> {rollbackPlan.estimatedDuration}
        </div>
      )}
    </div>
  )
}
