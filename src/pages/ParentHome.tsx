import { Navigate, NavLink, Outlet } from 'react-router-dom'
import { useProfile } from '../lib/auth'

const NAV = [
  { to: '/parent', label: 'Ringkasan', icon: '📊', end: true },
  { to: '/parent/progress', label: 'Perkembangan', icon: '📈', end: false },
  { to: '/parent/mistakes', label: 'Kesalahan', icon: '🧩', end: false },
]

/* Visual language sama (token Stitch) tapi konteks beda:
   tenang, editorial, tanpa gamifikasi (DESIGN.md Parent Analytics). */
export function ParentHome() {
  const { active, logout } = useProfile()
  if (!active) return <Navigate to="/login?role=parent" replace />

  return (
    <div className="app-canvas">
      <header className="sticky top-0 z-30 bg-canvas/85 backdrop-blur-md px-4 pt-4 pb-2">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[11px] font-semibold text-slate-500">Parent Area</p>
            <h1 className="h-title leading-6">Halo, {active.name}</h1>
          </div>
          <button onClick={logout} className="chip bg-surface-high text-slate-600 cursor-pointer">
            Keluar
          </button>
        </div>
      </header>

      <main className="px-4 py-4">
        <Outlet />
      </main>

      <nav className="dock">
        {NAV.map((n) => (
          <NavLink key={n.to} to={n.to} end={n.end} className={({ isActive }) => `dock-item ${isActive ? 'active' : ''}`}>
            <span className="text-lg leading-none">{n.icon}</span>
            {n.label}
          </NavLink>
        ))}
      </nav>
    </div>
  )
}