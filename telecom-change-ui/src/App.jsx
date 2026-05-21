import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import { DataProvider } from './context/DataContext'
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
import Runbooks from './pages/Runbooks'
import RunbookDetails from './pages/RunbookDetails'
import ApprovalsPending from './pages/ApprovalsPending'
import ApprovalDetails from './pages/ApprovalDetails'
import ApprovalHistory from './pages/ApprovalHistory'
import Unauthorized from './pages/Unauthorized'
import NotFound from './pages/NotFound'

const Layout = ({ children }) => {
  const { token } = useAuth()

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
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
                <Route path="/cr/details/:id" element={<CRDetails />} />
              </Route>

              <Route element={<ProtectedRoute allowedRoles={['ENGINEER', 'ADMIN']} />}>
                <Route path="/cr/create" element={<CRCreate />} />
              </Route>

              <Route element={<ProtectedRoute allowedRoles={['APPROVER', 'ADMIN']} />}>
                <Route path="/approvals/pending" element={<ApprovalsPending />} />
                <Route path="/approvals/:crId" element={<ApprovalDetails />} />
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
