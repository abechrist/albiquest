import { createContext, useCallback, useContext, useEffect, useState } from 'react'

export type Role = 'student' | 'parent'

export interface Profile {
  id: string
  name: string
  role: Role
  avatar: string
  level: number
  xp: number
}

// Profil default Phase 1.
const PROFILES: (Profile & { pin: string })[] = [
  { id: 'albert', name: 'Albert', role: 'student', pin: '1234', avatar: '🐉', level: 7, xp: 1250 },
  { id: 'parent', name: 'Orang Tua', role: 'parent', pin: '0000', avatar: '🛡️', level: 0, xp: 0 },
]

const STORAGE_KEY = 'pla.profile'

interface AuthValue {
  active: Profile | null
  login: (id: string, pin: string) => boolean
  logout: () => void
  addXP: (amount: number) => void
}

const AuthCtx = createContext<AuthValue>({
  active: null,
  login: () => false,
  logout: () => {},
  addXP: () => {},
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

  const addXP = useCallback((amount: number) => {
    if (amount <= 0) return
    setActive((prev) => {
      if (!prev) return null
      const nextXp = prev.xp + amount
      const nextLevel = Math.max(prev.level, Math.floor(nextXp / 200) + 1)
      const updated = {
        ...prev,
        xp: nextXp,
        level: nextLevel,
      }
      try {
        localStorage.setItem(`${STORAGE_KEY}_saved_${prev.id}`, JSON.stringify({ xp: nextXp, level: nextLevel }))
      } catch {}
      return updated
    })
  }, [])

  const value: AuthValue = {
    active,
    login: (id, pin) => {
      const p = PROFILES.find((x) => x.id === id && x.pin === pin)
      if (!p) return false
      let savedData: { xp: number; level: number } | null = null
      try {
        const raw = localStorage.getItem(`${STORAGE_KEY}_saved_${id}`)
        if (raw) savedData = JSON.parse(raw)
      } catch {}
      setActive({
        id: p.id,
        name: p.name,
        role: p.role,
        avatar: p.avatar,
        level: savedData?.level ?? p.level,
        xp: savedData?.xp ?? p.xp,
      })
      return true
    },
    logout: () => setActive(null),
    addXP,
  }

  return <AuthCtx.Provider value={value}>{children}</AuthCtx.Provider>
}

export function useProfile() {
  return useContext(AuthCtx)
}