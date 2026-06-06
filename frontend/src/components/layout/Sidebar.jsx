import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext.jsx'

const NAV = [
  { to: '/dashboard',    icon: '◈', label: 'Dashboard'   },
  { to: '/transactions', icon: '⇅', label: 'Movimientos' },
  { to: '/budgets',      icon: '◎', label: 'Presupuesto' },
  { to: '/chat',         icon: '◉', label: 'Asistente'   },
]

export const Sidebar = () => {
  const { profile, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => { logout(); navigate('/login') }

  return (
    <aside className="w-[220px] min-h-screen bg-surface border-r border-border fixed top-0 left-0 flex flex-col px-5 py-8">
      {/* Logo */}
      <div className="mb-10">
        <div className="font-display text-[26px] text-gold tracking-[4px] font-bold">
          AURUM
        </div>
        <div className="text-[11px] text-dim tracking-[1px] mt-0.5">
          ASISTENTE FINANCIERO
        </div>
      </div>

      {/* Navegación */}
      <nav className="flex flex-col gap-1 flex-1">
        {NAV.map(({ to, icon, label }) => (
          <NavLink key={to} to={to} className={({ isActive }) => `
            flex items-center gap-3 px-3.5 py-2.5 rounded-md
            text-sm transition-all duration-200 no-underline
            ${isActive
              ? 'bg-gold-bg text-gold border border-border2'
              : 'text-muted border border-transparent hover:text-gold hover:bg-gold-bg'
            }
          `}>
            <span className="text-base">{icon}</span>
            {label}
          </NavLink>
        ))}
      </nav>

      {/* Perfil */}
      <div className="border-t border-border pt-4">
        <div className="text-sm text-muted mb-1">
          {profile?.full_name || 'Usuario'}
        </div>
        <button
          onClick={handleLogout}
          className="text-xs text-dim bg-transparent border-none p-0 cursor-pointer transition-colors duration-200 hover:text-danger"
        >
          Cerrar sesión
        </button>
      </div>
    </aside>
  )
}