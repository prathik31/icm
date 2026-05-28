import { Link } from 'react-router-dom'
import StatusBadge from './StatusBadge'
import RiskBadge from './RiskBadge'
import Card from './ui/Card'

const ApprovalCard = ({ approval }) => {
  return (
    <Card className="h-full" title={`CR ${approval.crId}`}>
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div className="text-sm text-slate-600">Flow: <span className="font-medium text-slate-800">{approval.flowId}</span></div>
          <div className="flex items-center gap-2">
            <RiskBadge level={approval.riskLevel} />
            <StatusBadge status={approval.status} />
          </div>
        </div>

        <div className="text-sm text-slate-600">Score: <span className="font-medium text-slate-800">{approval.riskScore ?? 'N/A'}</span></div>

        <div className="mt-2">
          <Link
            to={`/approvals/${approval.flowId}`}
            className="inline-flex rounded-md bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
          >
            View approval
          </Link>
        </div>
      </div>
    </Card>
  )
}

export default ApprovalCard
