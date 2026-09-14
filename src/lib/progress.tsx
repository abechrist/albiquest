// Progress belajar per perangkat terisolasi per siswa (albert vs jasmine).
// D-003: lokal tanpa sync, namespaced per hero.
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { useProfile } from './auth'

interface ProgressValue {
  completed: Set<string>
  complete: (lessonId: string) => void
  count: number
}

const Ctx = createContext<ProgressValue>({ completed: new Set(), complete: () => {}, count: 0 })

/** Ambil daftar lesson id yang telah diselesaikan untuk siswa tertentu */
export function getStoredCompletedLessons(studentId = 'albert'): Set<string> {
  if (typeof window === 'undefined' || !window.localStorage) return new Set()
  try {
    const key = `pla.progress_${studentId}`
    const raw =
      localStorage.getItem(key) ||
      (studentId === 'albert' ? localStorage.getItem('pla.progress') : null)
    if (!raw) return new Set()
    const v: unknown = JSON.parse(raw)
    const list = Array.isArray(v) ? v.filter((x): x is string => typeof x === 'string') : []
    return new Set(list)
  } catch {
    return new Set()
  }
}

export function ProgressProvider({ children }: { children: ReactNode }) {
  const { active } = useProfile()
  const studentId = active?.id || 'albert'
  const key = `pla.progress_${studentId}`

  const [ids, setIds] = useState<string[]>(() => {
    try {
      const raw =
        localStorage.getItem(key) ||
        (studentId === 'albert' ? localStorage.getItem('pla.progress') : null)
      if (!raw) return []
      const v: unknown = JSON.parse(raw)
      return Array.isArray(v) ? v.filter((x): x is string => typeof x === 'string') : []
    } catch {
      return []
    }
  })

  // Sinkronisasi ulang saat profil / pahlawan aktif berganti
  useEffect(() => {
    try {
      const raw =
        localStorage.getItem(key) ||
        (studentId === 'albert' ? localStorage.getItem('pla.progress') : null)
      if (!raw) {
        setIds([])
      } else {
        const v: unknown = JSON.parse(raw)
        setIds(Array.isArray(v) ? v.filter((x): x is string => typeof x === 'string') : [])
      }
    } catch {
      setIds([])
    }
  }, [key, studentId])

  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(ids))
      if (studentId === 'albert') {
        localStorage.setItem('pla.progress', JSON.stringify(ids))
      }
    } catch {}
  }, [ids, key, studentId])

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