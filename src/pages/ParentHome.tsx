import { useState } from 'react'
import { Navigate, NavLink, Outlet } from 'react-router-dom'
import { useProfile } from '../lib/auth'

const NAV = [
  { to: '/parent', label: 'Ringkasan', icon: '📊', end: true },
  { to: '/parent/progress', label: 'Perkembangan', icon: '📈', end: false },
  { to: '/parent/mistakes', label: 'Kesalahan', icon: '🧩', end: false },
]

export interface ParentContextType {
  selectedChild: 'albert' | 'jasmine'
  setSelectedChild: (id: 'albert' | 'jasmine') => void
}

/* Visual language sama (token Stitch) tapi konteks beda:
   tenang, editorial, tanpa gamifikasi (DESIGN.md Parent Analytics). */
export function ParentHome() {
  const { active, logout } = useProfile()

  // State anak yang sedang dipantau di Parent Cockpit
  const [selectedChild, setSelectedChildState] = useState<'albert' | 'jasmine'>(() => {
    try {
      const raw = localStorage.getItem('pla.parent_selected_child')
      if (raw === 'jasmine' || raw === 'albert') return raw
    } catch {}
    return 'albert'
  })

  const setSelectedChild = (id: 'albert' | 'jasmine') => {
    setSelectedChildState(id)
    try {
      localStorage.setItem('pla.parent_selected_child', id)
    } catch {}
  }

  if (!active) return <Navigate to="/login?role=parent" replace />

  return (
    <div className="app-canvas">
      <header className="sticky top-0 z-30 bg-canvas/90 backdrop-blur-md px-4 pt-4 pb-3 border-b border-slate-200/60">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Parent Cockpit Hub
            </p>
            <h1 className="h-title leading-6">Halo, {active.name} 👋</h1>
          </div>
          <button onClick={logout} className="chip bg-surface-high text-slate-600 hover:bg-slate-200 cursor-pointer">
            Keluar
          </button>
        </div>

        {/* Child Switcher Tabs */}
        <div className="mt-3 flex items-center gap-1.5 rounded-2xl bg-slate-200/70 p-1 shadow-inner">
          <button
            type="button"
            onClick={() => setSelectedChild('albert')}
            className={`flex-1 flex items-center justify-center gap-1.5 rounded-xl py-2 text-xs font-black transition-all cursor-pointer ${
              selectedChild === 'albert'
                ? 'bg-white text-indigo-700 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span>👦🏻</span>
            <span>Albert (Kelas 9)</span>
          </button>
          <button
            type="button"
            onClick={() => setSelectedChild('jasmine')}
            className={`flex-1 flex items-center justify-center gap-1.5 rounded-xl py-2 text-xs font-black transition-all cursor-pointer ${
              selectedChild === 'jasmine'
                ? 'bg-white text-pink-700 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span>🌸</span>
            <span>Jasmine (Kelas 8)</span>
          </button>
        </div>
      </header>

      <main className="px-4 py-4">
        <Outlet context={{ selectedChild, setSelectedChild } satisfies ParentContextType} />
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