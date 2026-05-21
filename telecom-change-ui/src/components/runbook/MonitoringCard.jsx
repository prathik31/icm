export const MonitoringCard = ({ guidance }) => {
  if (!guidance) return null

  const frequencyColor = (freq) => {
    if (!freq) return 'bg-slate-100 text-slate-700'
    const lower = freq.toLowerCase()
    if (lower.includes('5')) return 'bg-red-100 text-red-700'
    if (lower.includes('15')) return 'bg-orange-100 text-orange-700'
    if (lower.includes('30')) return 'bg-yellow-100 text-yellow-700'
    if (lower.includes('60')) return 'bg-blue-100 text-blue-700'
    return 'bg-slate-100 text-slate-700'
  }

  return (
    <div className="space-y-4">
      {guidance.metrics && Array.isArray(guidance.metrics) && (
        <div className="grid gap-3 md:grid-cols-2">
          {guidance.metrics.map((metric, idx) => (
            <div key={idx} className="rounded-lg border border-slate-200 bg-white p-4">
              <h4 className="mb-2 font-semibold text-slate-900">{metric.name || 'Metric'}</h4>
              <p className="mb-2 text-sm text-slate-600">{metric.description || 'Monitor this metric'}</p>
              {metric.threshold && (
                <p className="text-xs font-mono text-slate-700">
                  Threshold: <span className="font-semibold">{metric.threshold}</span>
                </p>
              )}
              {metric.frequency && (
                <span className={`mt-2 inline-block rounded-full px-2 py-1 text-xs font-medium ${frequencyColor(metric.frequency)}`}>
                  {metric.frequency}
                </span>
              )}
            </div>
          ))}
        </div>
      )}

      {guidance.checklist && Array.isArray(guidance.checklist) && (
        <div className="space-y-2">
          <h4 className="font-semibold text-slate-900">Monitoring Checklist</h4>
          {guidance.checklist.map((item, idx) => (
            <div key={idx} className="flex items-start gap-2">
              <span className="mt-1 inline-flex h-5 w-5 items-center justify-center rounded-full bg-blue-100 text-xs font-semibold text-blue-700">
                ✓
              </span>
              <p className="text-sm text-slate-700">{item}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
