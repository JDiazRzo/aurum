import { NavLink } from 'react-router-dom'

const NAV = [
  { to: '/dashboard',    icon: '◈', label: 'Inicio'      },
  { to: '/transactions', icon: '⇅', label: 'Movimientos' },
  { to: '/budgets',      icon: '◎', label: 'Presupuesto' },
  { to: '/chat',         icon: '◉', label: 'Asistente'   },
]

export const BottomBar = () => (
  <nav className="fixed bottom-0 left-0 right-0 bg-surface border-t border-border z-50 flex">
    {NAV.map(({ to, icon, label }) => (
      <NavLink key={to} to={to} className={({ isActive }) => `
        flex-1 flex flex-col items-center justify-center py-3 gap-1
        text-[10px] transition-all no-underline
        ${isActive ? 'text-gold' : 'text-muted'}
      `}>
        <span className="text-xl">{icon}</span>
        {label}
      </NavLink>
    ))}
  </nav>
)