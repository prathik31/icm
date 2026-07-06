import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import { Toaster } from 'react-hot-toast'
import { AuthProvider, useAuth } from './context/AuthContext'
import { DataProvider, useDataContext } from './context/DataContext'
import ProtectedRoute from './components/ProtectedRoute'
import Navbar from './components/Navbar'
import Sidebar from './components/Sidebar'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import CRCreate from './pages/CRCreate'
import CRList from './pages/CRList'
import CRDetails from './pages/CRDetails'
import RiskAssessments from './pages/RiskAssessments'
import CRRisk from './pages/CRRisk'
import Runbooks from './pages/Runbooks'
import RunbookDetails from './pages/RunbookDetails'
import ApprovalsPending from './pages/ApprovalsPending'
import ApprovalDetails from './pages/ApprovalDetails'
import ApprovalHistory from './pages/ApprovalHistory'
import TechnicianDashboard from './pages/technician/TechnicianDashboard'
import TechnicianTasks from './pages/technician/TechnicianTasks'
import TechnicianTaskDetails from './pages/technician/TechnicianTaskDetails'
import TechnicianSchedule from './pages/technician/TechnicianSchedule'
import TechnicianExecution from './pages/technician/TechnicianExecution'
import TechnicianHistory from './pages/technician/TechnicianHistory'
import TechnicianProfile from './pages/technician/TechnicianProfile'
import Unauthorized from './pages/Unauthorized'
import NotFound from './pages/NotFound'

const Layout = ({ children }) => {
  const { token } = useAuth()
  const { pathname } = useLocation()
  const { refreshAll } = useDataContext()

  useEffect(() => {
    if (!token) return
    refreshAll()
  }, [pathname, token, refreshAll])

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4500,
          style: {
            borderRadius: '1rem',
            background: '#ffffff',
            color: '#0f172a',
            boxShadow: '0 20px 45px rgba(15, 23, 42, 0.12)',
            border: '1px solid #e2e8f0',
          },
          success: {
            iconTheme: {
              primary: '#0f172a',
              secondary: '#ecfccb',
            },
          },
          error: {
            iconTheme: {
              primary: '#ef4444',
              secondary: '#fee2e2',
            },
          },
          loading: {
            iconTheme: {
              primary: '#2563eb',
              secondary: '#dbeafe',
            },
          },
        }}
      />
      <Navbar />
      <div className="mx-auto flex w-full max-w-[1560px] gap-6 px-4 py-6 lg:px-8">
        {token && <Sidebar />}
        <main className="flex-1 max-w-full">
          <div className="mx-auto w-full max-w-7xl">{children}</div>
        </main>
      </div>
    </div>
  )
}

function App() {
  return (
    <AuthProvider>
      <DataProvider>
        <Router>
          <Layout>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />

              <Route element={<ProtectedRoute />}>
                <Route path="/" element={<Navigate to="/dashboard" replace />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/cr/list" element={<CRList />} />
                <Route path="/risk-assessments" element={<RiskAssessments />} />
                <Route path="/runbooks" element={<Runbooks />} />
                <Route path="/runbooks/:crId" element={<RunbookDetails />} />
                <Route path="/cr/:id/risk" element={<CRRisk />} />
                <Route path="/cr/details/:id" element={<CRDetails />} />
              </Route>

              <Route element={<ProtectedRoute allowedRoles={['ENGINEER', 'ADMIN']} />}>
                <Route path="/cr/create" element={<CRCreate />} />
              </Route>

              <Route element={<ProtectedRoute allowedRoles={['TECHNICIAN', 'ADMIN']} />}>
                <Route path="/technician/dashboard" element={<TechnicianDashboard />} />
                <Route path="/technician/profile" element={<TechnicianProfile />} />
                <Route path="/technician/tasks" element={<TechnicianTasks />} />
                <Route path="/technician/tasks/:crId" element={<TechnicianTaskDetails />} />
                <Route path="/technician/tasks/:crId/schedule" element={<TechnicianSchedule />} />
                <Route path="/technician/tasks/:crId/execute" element={<TechnicianExecution />} />
                <Route path="/technician/history" element={<TechnicianHistory />} />
              </Route>

              <Route element={<ProtectedRoute allowedRoles={['APPROVER', 'ADMIN']} />}>
                <Route path="/approvals/pending" element={<ApprovalsPending />} />
                <Route path="/approvals/:flowId" element={<ApprovalDetails />} />
                <Route path="/approvals/history" element={<ApprovalHistory />} />
              </Route>

              <Route path="/unauthorized" element={<Unauthorized />} />
              <Route path="/*" element={<NotFound />} />
            </Routes>
          </Layout>
        </Router>
      </DataProvider>
    </AuthProvider>
  )
}

export default App
