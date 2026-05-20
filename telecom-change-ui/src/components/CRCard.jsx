import { Link } from 'react-router-dom'
import StatusBadge from './StatusBadge'
import RiskBadge from './RiskBadge'
import Card from './ui/Card'

const CRCard = ({ request }) => {
  return (
    <Card className="h-full" title={request.title} actions={null}>
      <div className="flex flex-col gap-2">
        <p className="text-sm text-slate-600">{request.description}</p>

        <div className="mt-3 flex items-center justify-between gap-4">
          <div className="text-sm text-slate-600">
            <div>Region: <span className="font-medium text-slate-800">{request.region || 'N/A'}</span></div>
            <div>Type: <span className="font-medium text-slate-800">{request.changeType || 'N/A'}</span></div>
          </div>
          <div className="flex items-center gap-3">
            <StatusBadge status={request.status} />
            {request.riskLevel && <RiskBadge level={request.riskLevel} />}
          </div>
        </div>

        <div className="mt-4">
          <Link
            to={`/cr/details/${request.crId || request.id}`}
            className="inline-flex rounded-md bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
          >
            View details
          </Link>
        </div>
      </div>
    </Card>
  )
}

export default CRCard
