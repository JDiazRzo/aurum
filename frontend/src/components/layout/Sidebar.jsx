import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext.jsx'

const NAV = [
  { to: '/dashboard',    icon: '◈', label: 'Dashboard'     },
  { to: '/transactions', icon: '⇅', label: 'Movimientos'   },
  { to: '/budgets',      icon: '◎', label: 'Presupuesto'   },
  { to: '/chat',         icon: '◉', label: 'Asistente'     }, 
]

export const Sidebar = () => {
  const { profile, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => { logout(); navigate('/login') }

  return (
    <aside style={{
      width: 220, minHeight: '100vh', background: 'var(--surface)',
      borderRight: '1px solid var(--border)', display: 'flex',
      flexDirection: 'column', padding: '2rem 1.25rem',
      position: 'fixed', top: 0, left: 0,
    }}>
      {/* Logo */}
      <div style={{ marginBottom: '2.5rem' }}>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: 26, color: 'var(--gold)', letterSpacing: 4, fontWeight: 700 }}>
          AURUM
        </div>
        <div style={{ fontSize: 11, color: 'var(--text-dim)', letterSpacing: 1, marginTop: 2 }}>
          ASISTENTE FINANCIERO
        </div>
      </div>

      {/* Navegación */}
      <nav style={{ display: 'flex', flexDirection: 'column', gap: 4, flex: 1 }}>
        {NAV.map(({ to, icon, label }) => (
          <NavLink key={to} to={to} style={({ isActive }) => ({
            display: 'flex', alignItems: 'center', gap: 12,
            padding: '10px 14px', borderRadius: 'var(--radius-md)',
            textDecoration: 'none', fontSize: 14, fontWeight: 400,
            transition: 'all .2s',
            background: isActive ? 'var(--gold-bg)' : 'transparent',
            color:      isActive ? 'var(--gold)' : 'var(--text-muted)',
            border:     isActive ? '1px solid var(--border2)' : '1px solid transparent',
          })}>
            <span style={{ fontSize: 16 }}>{icon}</span>
            {label}
          </NavLink>
        ))}
      </nav>

      {/* Perfil */}
      <div style={{ borderTop: '1px solid var(--border)', paddingTop: '1rem' }}>
        <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 4 }}>
          {profile?.full_name || 'Usuario'}
        </div>
        <button onClick={handleLogout} style={{
          background: 'none', border: 'none', color: 'var(--text-dim)',
          fontSize: 12, padding: 0, cursor: 'pointer',
          transition: 'color .2s',
        }}
          onMouseEnter={e => e.target.style.color = 'var(--danger)'}
          onMouseLeave={e => e.target.style.color = 'var(--text-dim)'}
        >
          Cerrar sesión
        </button>
      </div>
    </aside>
  )
}
