const Loader = ({ message = 'Loading...' }) => {
  return (
    <div className="flex min-h-[180px] items-center justify-center rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex items-center gap-3 text-slate-700">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-300 border-t-slate-900" />
        <span>{message}</span>
      </div>
    </div>
  )
}

export default Loader
