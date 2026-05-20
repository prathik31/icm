const AlertMessage = ({ type = 'info', message }) => {
  const className =
    type === 'error'
      ? 'bg-rose-50 border-rose-200 text-rose-900'
      : type === 'success'
      ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
      : 'bg-sky-50 border-sky-200 text-sky-900'

  return (
    <div className={`rounded-2xl border px-4 py-3 text-sm ${className}`}>
      <pre className="m-0 whitespace-pre-wrap break-words font-normal">{String(message)}</pre>
    </div>
  )
}

export default AlertMessage
