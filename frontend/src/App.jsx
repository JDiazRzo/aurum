import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext.jsx'
import { Login }        from './pages/auth/Login.jsx'
import { Register }     from './pages/auth/Register.jsx'
import { Dashboard }    from './pages/dashboard/Dashboard.jsx'
import { Transactions } from './pages/transactions/Transactions.jsx'
import { Budgets }      from './pages/budgets/Budgets.jsx'
import { Chat } from './pages/chat/Chat.jsx'

const PrivateRoute = ({ children }) => {
  const { profile, loading } = useAuth()
  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--black)' }}>
      <div style={{ fontFamily: 'var(--font-display)', fontSize: 32, color: 'var(--gold)', letterSpacing: 4 }}>AURUM</div>
    </div>
  )
  return profile ? children : <Navigate to="/login" replace />
}

const App = () => (
  <AuthProvider>
    <Routes>
      <Route path="/login"    element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/dashboard"    element={<PrivateRoute><Dashboard /></PrivateRoute>} />
      <Route path="/transactions" element={<PrivateRoute><Transactions /></PrivateRoute>} />
      <Route path="/budgets"      element={<PrivateRoute><Budgets /></PrivateRoute>} />
      <Route path="/chat" element={<PrivateRoute><Chat /></PrivateRoute>} />
      <Route path="*"             element={<Navigate to="/dashboard" replace />} />
    </Routes>
  </AuthProvider>
)

export default App
