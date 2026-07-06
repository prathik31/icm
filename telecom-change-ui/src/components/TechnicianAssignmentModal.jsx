import { useMemo } from 'react'

const TechnicianAssignmentModal = ({
  isOpen,
  technicians,
  selectedTechnicianId,
  onSelect,
  onAssign,
  onCancel,
  loading,
  error,
  crRegion,
  crSpecialization,
}) => {
  if (!isOpen) return null

  const sortedTechnicians = useMemo(() => {
    const regionMatch = (tech) =>
      crRegion && tech.region && crRegion.toLowerCase() === tech.region.toLowerCase() ? 1 : 0
    const specializationMatch = (tech) =>
      crSpecialization && tech.specialization && crSpecialization.toLowerCase() === tech.specialization.toLowerCase() ? 1 : 0

    return [...technicians].sort((a, b) => {
      const regionDiff = regionMatch(b) - regionMatch(a)
      if (regionDiff !== 0) return regionDiff

      const specializationDiff = specializationMatch(b) - specializationMatch(a)
      if (specializationDiff !== 0) return specializationDiff

      return (b.experienceYears || 0) - (a.experienceYears || 0)
    })
  }, [technicians, crRegion, crSpecialization])

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 px-4 py-6">
      <div className="w-full max-w-2xl rounded-3xl bg-white p-6 shadow-2xl">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-slate-900">Assign Technician</h2>
          <button type="button" onClick={onCancel} className="text-slate-500 transition hover:text-slate-900">Close</button>
        </div>

        <p className="mt-3 text-sm text-slate-600">Select an available technician to assign this approved change request.</p>

        <div className="mt-5 space-y-3">
          {sortedTechnicians.length === 0 ? (
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">No technicians are available.</div>
          ) : (
            sortedTechnicians.map((tech) => {
              const isRecommended =
                crRegion && tech.region && crRegion.toLowerCase() === tech.region.toLowerCase()

              return (
                <label
                  key={tech.id}
                  className="flex cursor-pointer flex-col gap-4 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 transition hover:bg-slate-100"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <input
                        type="radio"
                        name="technician"
                        value={tech.id}
                        checked={selectedTechnicianId === tech.id}
                        onChange={() => onSelect(tech.id)}
                        className="mt-1 h-4 w-4 text-blue-600"
                      />
                      <div>
                        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-900">
                          {tech.code || tech.id || '—'}
                        </p>
                        <p className="text-base font-semibold text-slate-900">{tech.name}</p>
                        <p className="text-sm text-slate-500">{tech.email || '—'}</p>
                      </div>
                    </div>
                    {isRecommended && (
                      <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700">
                        Recommended
                      </span>
                    )}
                  </div>

                  <div className="grid gap-2 text-sm text-slate-600 sm:grid-cols-2">
                    {tech.region && (
                      <p className="flex items-center gap-2">📍 <span>{tech.region}</span></p>
                    )}
                    {tech.specialization && (
                      <p className="flex items-center gap-2">🔧 <span>{tech.specialization}</span></p>
                    )}
                    {typeof tech.experienceYears === 'number' && (
                      <p className="flex items-center gap-2">⭐ <span>{tech.experienceYears} Years Experience</span></p>
                    )}
                    {tech.certifications && (
                      <p className="flex items-center gap-2">🎓 <span>{tech.certifications}</span></p>
                    )}
                  </div>

                  <div>
                    <span className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-slate-700">
                      {tech.status || tech.availabilityStatus || 'UNKNOWN'}
                    </span>
                  </div>
                </label>
              )
            })
          )}
        </div>

        {error && <div className="mt-4 rounded-2xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-800">{error}</div>}

        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-2xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={!selectedTechnicianId || loading}
            onClick={onAssign}
            className="rounded-2xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300"
          >
            {loading ? 'Assigning…' : 'Assign'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default TechnicianAssignmentModal
