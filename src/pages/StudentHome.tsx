import { Navigate, NavLink, Outlet } from 'react-router-dom'
import { useProfile } from '../lib/auth'

const NAV = [
  { to: '/student', label: 'Perjalanan', icon: '🗺️', end: true },
  { to: '/student/subjects', label: 'Mapel', icon: '📚', end: false },
  { to: '/student/practice', label: 'Latihan', icon: '⚔️', end: false },
  { to: '/student/mistakes', label: 'Kesalahan', icon: '🧠', end: false },
  { to: '/student/profile', label: 'Saya', icon: '👑', end: false },
]

export function StudentHome() {
  const { active, logout } = useProfile()
  if (!active) return <Navigate to="/login?role=student" replace />

  const xpMax = 2000
  const xpPct = Math.min(100, Math.round((active.xp / xpMax) * 100))

  return (
    <div className="app-canvas">
      {/* Top bar: streak/XP ala DESIGN.md */}
      <header className="sticky top-0 z-30 bg-canvas/85 backdrop-blur-md px-4 pt-4 pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">{active.avatar}</span>
            <div>
              <p className="text-[11px] font-semibold text-slate-500">Petualang Level {active.level}</p>
              <p className="h-title leading-6">{active.name}</p>
            </div>
          </div>
          <button
            onClick={logout}
            className="chip bg-surface-high text-slate-600 cursor-pointer"
          >
            Keluar
          </button>
        </div>
        <div className="mt-3 flex items-center gap-2">
          <div className="track flex-1">
            <div className="track-fill" style={{ width: `${xpPct}%` }} />
          </div>
          <span className="chip bg-amber-100 text-amber-700 text-[11px] tabular">
            🔥 {active.xp} XP
          </span>
        </div>
      </header>

      <main className="px-4 py-4">
        <Outlet />
      </main>

      {/* Floating dock (DESIGN.md Bottom Navigation Bar) */}
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