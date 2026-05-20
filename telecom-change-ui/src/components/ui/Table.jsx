const Table = ({ columns, rows, renderRow, emptyMessage }) => {
  return (
    <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
      <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
        <thead className="bg-slate-50">
          <tr>
            {columns.map((column) => (
              <th key={column.key} className={`px-6 py-4 font-semibold text-slate-700 ${column.className || ''}`}>
                {column.title}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200 bg-white">
          {rows.length ? rows.map((item) => renderRow(item)) : (
            <tr>
              <td colSpan={columns.length} className="px-6 py-10 text-center text-sm text-slate-500">
                {emptyMessage || 'No results found.'}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  )
}

export default Table
