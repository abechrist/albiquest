// Progress belajar per perangkat (D-003: lokal tanpa sync).
// ponytail: kalau nanti butuh tanggal/XP per penyelesaian (Phase 6), ganti
// string[] jadi Record<lessonId, {at: string; xp: number}> — localStorage
// lama cukup diabaikan (data tidak kritis).
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'

const KEY = 'pla.progress'

interface ProgressValue {
  completed: Set<string>
  complete: (lessonId: string) => void
  count: number
}

const Ctx = createContext<ProgressValue>({ completed: new Set(), complete: () => {}, count: 0 })

function load(): string[] {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return []
    const v: unknown = JSON.parse(raw)
    return Array.isArray(v) ? v.filter((x): x is string => typeof x === 'string') : []
  } catch {
    return []
  }
}

export function ProgressProvider({ children }: { children: ReactNode }) {
  const [ids, setIds] = useState<string[]>(load)
  useEffect(() => {
    localStorage.setItem(KEY, JSON.stringify(ids))
  }, [ids])
  const complete = useCallback((lessonId: string) => {
    setIds((prev) => (prev.includes(lessonId) ? prev : [...prev, lessonId]))
  }, [])
  const value = useMemo<ProgressValue>(
    () => ({ completed: new Set(ids), complete, count: ids.length }),
    [ids, complete],
  )
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export function useProgress() {
  return useContext(Ctx)
}