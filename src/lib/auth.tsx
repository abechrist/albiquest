import { createContext, useContext, useEffect, useState } from 'react'

export type Role = 'student' | 'parent'

export interface Profile {
  id: string
  name: string
  role: Role
  avatar: string
  level: number
  xp: number
}

// Profil default Phase 1. ponytail: PIN akan di-hash & bisa diganti lewat UI profil
// (Phase 5) — saat itu pindah ke IndexedDB (D-002) bersama progress store.
const PROFILES: (Profile & { pin: string })[] = [
  { id: 'albert', name: 'Albert', role: 'student', pin: '1234', avatar: '🐉', level: 7, xp: 1250 },
  { id: 'parent', name: 'Orang Tua', role: 'parent', pin: '0000', avatar: '🛡️', level: 0, xp: 0 },
]

const STORAGE_KEY = 'pla.profile'

interface AuthValue {
  active: Profile | null
  login: (id: string, pin: string) => boolean
  logout: () => void
}

const AuthCtx = createContext<AuthValue>({
  active: null,
  login: () => false,
  logout: () => {},
})

export function ProfileProvider({ children }: { children: React.ReactNode }) {
  const [active, setActive] = useState<Profile | null>(() => {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as Profile) : null
  })

  useEffect(() => {
    if (active) localStorage.setItem(STORAGE_KEY, JSON.stringify(active))
    else localStorage.removeItem(STORAGE_KEY)
  }, [active])

  const value: AuthValue = {
    active,
    login: (id, pin) => {
      const p = PROFILES.find((x) => x.id === id && x.pin === pin)
      if (!p) return false
      setActive({ id: p.id, name: p.name, role: p.role, avatar: p.avatar, level: p.level, xp: p.xp })
      return true
    },
    logout: () => setActive(null),
  }

  return <AuthCtx.Provider value={value}>{children}</AuthCtx.Provider>
}

export function useProfile() {
  return useContext(AuthCtx)
}