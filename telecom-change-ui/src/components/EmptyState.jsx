const EmptyState = ({ title, description, action }) => {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-10 text-center shadow-sm">
      <div className="mx-auto max-w-xl">
        <p className="text-sm font-semibold uppercase tracking-wide text-slate-400">Empty state</p>
        <h2 className="mt-4 text-2xl font-semibold text-slate-900">{title}</h2>
        <p className="mt-3 text-sm leading-7 text-slate-600">{description}</p>
        {action && <div className="mt-6">{action}</div>}
      </div>
    </div>
  )
}

export default EmptyState
