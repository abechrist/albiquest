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
      {/* Top bar: streak/XP ala DESIGN.md — dengan safe area PWA */}
      <header className="sticky top-0 z-30 bg-canvas/90 backdrop-blur-md px-4 sm:px-6 md:px-8 pt-[calc(0.75rem+env(safe-area-inset-top,0px))] pb-3 border-b border-slate-200/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-3xl sm:text-4xl select-none">{active.avatar}</span>
            <div>
              <p className="text-xs sm:text-sm font-bold text-slate-500">Petualang Level {active.level}</p>
              <h1 className="text-lg sm:text-xl font-extrabold text-slate-900 leading-tight">{active.name}</h1>
            </div>
          </div>
          <button
            onClick={logout}
            className="chip bg-surface-high text-slate-700 hover:bg-slate-200 cursor-pointer font-bold px-3.5 py-1.5 text-xs sm:text-sm"
          >
            Keluar
          </button>
        </div>
        <div className="mt-3 flex items-center gap-2.5">
          <div className="track flex-1 !h-3.5">
            <div className="track-fill" style={{ width: `${xpPct}%` }} />
          </div>
          <span className="chip bg-amber-100 text-amber-800 text-xs sm:text-sm font-bold tabular">
            🔥 {active.xp} XP
          </span>
        </div>
      </header>

      <main className="px-4 sm:px-6 md:px-8 py-4 sm:py-6">
        <Outlet />
      </main>

      {/* Floating dock (DESIGN.md Bottom Navigation Bar) */}
      <nav className="dock">
        {NAV.map((n) => (
          <NavLink key={n.to} to={n.to} end={n.end} className={({ isActive }) => `dock-item ${isActive ? 'active' : ''}`}>
            <span className="text-xl md:text-2xl leading-none">{n.icon}</span>
            <span>{n.label}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  )
}