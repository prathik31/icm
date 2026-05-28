import { Link, useLocation, useNavigate } from 'react-router-dom'
import { LogOut, UserCircle } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useDataContext } from '../context/DataContext'

const Navbar = () => {
  const { token, logout, role, email, name } = useAuth()
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const { refreshAll } = useDataContext()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white">
      <div className="mx-auto flex max-w-[1560px] items-center justify-between gap-4 px-6 py-4">
        <Link
          to="/dashboard"
          onClick={() => {
            if (pathname === '/dashboard') refreshAll()
          }}
          className="flex items-center gap-3"
        >
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-500 to-indigo-600 text-lg font-semibold text-white shadow-sm">
            TC
          </div>
          <div>
            <p className="text-base font-semibold text-slate-900">Telecom Change Management</p>
            <p className="text-sm text-slate-500">Enterprise AI change workflow</p>
          </div>
        </Link>

        <div className="flex flex-1 items-center justify-end gap-4 sm:gap-6">
          {token ? (
            <div className="flex items-center gap-3 rounded-3xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm text-slate-700">
              <div className="flex items-center gap-3">
                <UserCircle className="h-5 w-5 text-slate-500" />
                <div className="min-w-[160px]">
                  <div className="font-semibold text-slate-900 text-sm">{name ?? email ?? 'Unknown user'}</div>
                  <div className="text-xs uppercase tracking-[0.12em] text-slate-500">{role || 'USER'}</div>
                </div>
              </div>
            </div>
          ) : null}

          {token ? (
            <button
              type="button"
              onClick={handleLogout}
              className="inline-flex items-center gap-2 rounded-2xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"
            >
              <LogOut className="h-4 w-4" />
              Logout
            </button>
          ) : (
            <div className="flex items-center gap-3">
              <Link className="text-sm font-medium text-slate-700 hover:text-slate-900" to="/login">
                Login
              </Link>
              <Link className="rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-900 hover:bg-slate-50" to="/register">
                Register
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}

export default Navbar
