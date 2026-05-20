import { NavLink } from 'react-router-dom'
import { Home, FilePlus, ClipboardList, Clock, ListChecks } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

const navigation = [
  { label: 'Dashboard', path: '/dashboard', icon: Home },
  { label: 'Create CR', path: '/cr/create', icon: FilePlus, roles: ['ENGINEER', 'ADMIN'] },
  { label: 'My CRs', path: '/cr/list', icon: ClipboardList },
  { label: 'Pending Approvals', path: '/approvals/pending', icon: Clock, roles: ['APPROVER', 'ADMIN'] },
  { label: 'Approval History', path: '/approvals/history', icon: ListChecks, roles: ['APPROVER', 'ADMIN'] },
]

const Sidebar = () => {
  const { role } = useAuth()

  return (
    <aside className="hidden lg:flex lg:w-64 lg:flex-col lg:gap-6 lg:border-r lg:border-slate-200 lg:bg-white lg:px-4 lg:py-6">
      <div className="px-2">
        <div className="flex items-center gap-3 px-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 text-white font-semibold">TC</div>
          <div>
            <div className="text-sm font-semibold text-slate-900">Telecom Change</div>
            <div className="text-xs text-slate-500">AI Change Workflow</div>
          </div>
        </div>
      </div>

      <nav className="mt-6 flex flex-1 flex-col gap-2 px-2">
        {navigation.map((item) => {
          if (item.roles && !item.roles.includes(role)) return null
          const Icon = item.icon
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `group flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition ${
                  isActive ? 'bg-blue-100 text-blue-700' : 'text-slate-700 hover:bg-blue-50 hover:text-slate-900'
                }`
              }
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </NavLink>
          )
        })}
      </nav>

      <div className="mt-auto px-3">
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-600">
          <div className="font-semibold text-slate-900">Workflow support</div>
          <p className="mt-2 text-xs">Track the request lifecycle from draft through risk confirmation and approvals.</p>
        </div>
      </div>
    </aside>
  )
}

export default Sidebar
