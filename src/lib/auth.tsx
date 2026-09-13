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

// Profil default (Albert mulai dari Level 1 dan 0 XP)
const PROFILES: (Profile & { pin: string })[] = [
  { id: 'albert', name: 'Albert', role: 'student', pin: '1234', avatar: '🐉', level: 1, xp: 0 },
  { id: 'parent', name: 'Orang Tua', role: 'parent', pin: '9999', avatar: '🛡️', level: 0, xp: 0 },
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
      const p = PROFILES.find((x) => x.id === id)
      if (!p) return false

      let customPin: string | null = null
      try {
        customPin = localStorage.getItem(`pla.pin.${id}`)
      } catch {}

      // Menerima 9999 atau 0000 untuk Orang Tua, 1234 untuk Siswa, dan PIN kustom dari localStorage
      const isValid =
        (customPin && pin === customPin) ||
        pin === p.pin ||
        (id === 'parent' && (pin === '9999' || pin === '0000')) ||
        (id === 'albert' && pin === '1234')

      if (!isValid) return false

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