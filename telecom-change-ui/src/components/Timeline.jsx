const Timeline = ({ events }) => {
  if (!events?.length) {
    return null
  }

  return (
    <div className="flow-root rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="-mb-8">
        {events.map((event, index) => (
          <div key={`${event.title}-${index}`} className="relative sm:pl-8">
            <div className="absolute left-3 top-3 h-2.5 w-2.5 rounded-full bg-slate-900" />
            <div className="ml-8 border-l border-slate-200 pl-6 pb-8">
              <div className="flex flex-wrap items-center gap-2 text-sm text-slate-500">
                <span>{event.date || 'Unknown date'}</span>
                {event.variant && (
                  <span className="rounded-full bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-700">{event.variant}</span>
                )}
              </div>
              <h3 className="mt-3 font-semibold text-slate-900">{event.title}</h3>
              <p className="mt-2 text-sm leading-6 text-slate-600">{event.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default Timeline
