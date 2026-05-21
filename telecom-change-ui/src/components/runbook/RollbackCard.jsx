export default function RollbackCard({ step }) {
  return (
    <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 shadow-sm">
      <div className="font-semibold text-rose-700">{step.title}</div>
      <div className="mt-2 text-sm text-rose-700"><pre className="whitespace-pre-wrap">{step.command}</pre></div>
      <div className="mt-2 text-sm text-rose-600">Expected: {step.expected}</div>
    </div>
  )
}
