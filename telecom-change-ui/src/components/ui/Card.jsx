import React from 'react'

const Card = ({ children, className = '', title, actions }) => {
  return (
    <div className={`rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md ${className}`}>
      {title && (
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
          {actions && <div className="flex items-center gap-2">{actions}</div>}
        </div>
      )}
      <div>{children}</div>
    </div>
  )
}

export default Card
