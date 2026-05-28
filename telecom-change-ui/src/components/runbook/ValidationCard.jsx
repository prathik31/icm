export const ValidationCard = ({ item, index }) => {
  return (
    <div className="rounded-lg border border-green-200 bg-green-50 p-4">
      <div className="mb-3 flex items-center gap-2">
        <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-green-100 text-xs font-semibold text-green-700">
          ✓
        </span>
        <h4 className="font-semibold text-green-900">{item.action || item.title || 'Validation'}</h4>
      </div>
      {(item.action || item.description || item.title) && (
        <p className="mb-2 text-sm text-green-800">{item.action || item.description || item.title}</p>
      )}
      {item.command && (
        <div className="mb-3 rounded bg-slate-900 p-3 font-mono text-xs text-slate-100">
          <div className="mb-1 text-slate-400">$</div>
          {item.command}
        </div>
      )}
      {(item.expected_output || item.expectedOutput) && (
        <div className="text-sm">
          <p className="mb-1 font-medium text-green-900">Expected Result:</p>
          <p className="text-green-800">{item.expected_output || item.expectedOutput}</p>
        </div>
      )}
    </div>
  )
}
