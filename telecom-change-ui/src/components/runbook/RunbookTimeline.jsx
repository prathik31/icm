export default function RunbookTimeline({ steps }) {
  return (
    <div className="space-y-4">
      {steps.map((step, idx) => (
        <div key={step.id} className="flex items-start gap-4">
          <div className="flex flex-col items-center">
            <div className="h-8 w-8 rounded-full bg-slate-900 text-white flex items-center justify-center">{idx + 1}</div>
            {idx !== steps.length - 1 && <div className="h-full w-px bg-slate-200 flex-1" />}
          </div>
          <div className="flex-1 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="font-semibold">{step.action || step.title || `Step ${idx + 1}`}</div>
              <div className="text-xs text-slate-500">{step.timeout_seconds ?? step.timeout}</div>
            </div>
            <div className="mt-2 text-sm text-slate-700"><pre className="whitespace-pre-wrap">{step.command}</pre></div>
            <div className="mt-2 text-sm text-slate-600">Expected: {step.expected_output || step.expectedOutput || step.expected}</div>
            {(step.rollback_action || step.rollbackAction || step.rollback) && <div className="mt-2 text-sm text-rose-600">Rollback: {step.rollback_action || step.rollbackAction || step.rollback}</div>}
          </div>
        </div>
      ))}
    </div>
  )
}
