export const PreCheckCard = ({ item, index }) => {
  return (
    <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
      <div className="mb-3 flex items-start justify-between">
        <div className="flex items-center gap-2">
          <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-blue-100 text-xs font-semibold text-blue-700">
            {index + 1}
          </span>
          <h4 className="font-semibold text-slate-900">{item.action || item.title || 'Pre-check'}</h4>
        </div>
        {item.timeout && (
          <span className="rounded-full bg-yellow-100 px-2 py-1 text-xs font-medium text-yellow-700">
            {item.timeout}
          </span>
        )}
      </div>
      {item.command && (
        <div className="mb-3 rounded bg-slate-900 p-3 font-mono text-xs text-slate-100">
          <div className="mb-1 text-slate-400">$</div>
          {item.command}
        </div>
      )}
      {(item.expected_output || item.expectedOutput) && (
        <div className="text-sm text-slate-600">
          <p className="mb-1 font-medium text-slate-700">Expected Output:</p>
          <p className="text-slate-600">{item.expected_output || item.expectedOutput}</p>
        </div>
      )}
    </div>
  )
}
