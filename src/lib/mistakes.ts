// Store lokal Bank Kesalahan (Error Bank / My Mistakes) — Phase 5
// Sesuai prd.md §20–21, agent-prompt.md §56, dan Stitch my_mistakes_review_bank.

import { useCallback, useEffect, useState } from 'react'
import type { Question } from './domain'

export interface MistakeRecord {
  id: string
  questionId: string
  subjectId: string
  topicId?: string
  lessonId?: string
  timestamp: number
  /** Jawaban yang diberikan siswa saat salah */
  studentAnswer: unknown
  /** Kunci jawaban resmi */
  correctAnswer: unknown
  /** Jumlah percobaan salah */
  attempts: number
  /** Apakah siswa sempat menggunakan hint */
  hintUsed: boolean
  /** Status: 'needs_review' = belum dikuasai, 'mastered' = sudah berhasil di-retry */
  status: 'needs_review' | 'mastered'
  /** Berapa kali sudah di-review */
  reviewCount: number
  /** Timestamp terakhir kali di-review */
  lastReviewedAt?: number
}

const STORAGE_KEY = 'pla.mistakes.v1'
const MISTAKES_EVENT = 'pla:mistakes-updated'

// In-memory cache jika localStorage tidak tersedia (e.g. testing)
let memoryStore: MistakeRecord[] = []

function isBrowser(): boolean {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined'
}

export function getActiveMistakesStudentId(): string {
  if (typeof window === 'undefined') return 'albert'
  try {
    const raw = localStorage.getItem('pla.profile')
    if (raw) {
      const p = JSON.parse(raw)
      if (p?.id && (p.id === 'albert' || p.id === 'jasmine')) return p.id
    }
  } catch {}
  return 'albert'
}

/** Ambil seluruh data kesalahan dari storage (per siswa) */
export function getStoredMistakes(studentId?: string): MistakeRecord[] {
  if (!isBrowser()) return [...memoryStore]
  const sid = studentId || getActiveMistakesStudentId()
  const key = `pla.mistakes_${sid}.v1`
  try {
    const raw =
      window.localStorage.getItem(key) ||
      (sid === 'albert' ? window.localStorage.getItem(STORAGE_KEY) : null)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

/** Simpan seluruh data kesalahan ke storage (per siswa) */
export function saveMistakes(mistakes: MistakeRecord[], studentId?: string): void {
  if (!isBrowser()) {
    memoryStore = [...mistakes]
    return
  }
  const sid = studentId || getActiveMistakesStudentId()
  const key = `pla.mistakes_${sid}.v1`
  try {
    window.localStorage.setItem(key, JSON.stringify(mistakes))
    if (sid === 'albert') {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(mistakes))
    }
    window.dispatchEvent(new Event(MISTAKES_EVENT))
  } catch (err) {
    console.error('Gagal menyimpan data mistakes:', err)
  }
}

/** Catat hasil jawaban siswa (otomatis deteksi benar / salah) */
export function recordQuestionResult({
  question,
  studentAnswer,
  isCorrect,
  hintUsed = false,
  attempts = 1,
  studentId,
}: {
  question: Question
  studentAnswer: unknown
  isCorrect: boolean
  hintUsed?: boolean
  attempts?: number
  studentId?: string
}): { record?: MistakeRecord; status: 'recorded_mistake' | 'marked_mastered' | 'unmodified' } {
  const sid = studentId || getActiveMistakesStudentId()
  const current = getStoredMistakes(sid)
  const existingIndex = current.findIndex((m) => m.questionId === question.id)

  if (!isCorrect) {
    // Siswa salah menjawab -> simpan / perbarui ke bank kesalahan
    if (existingIndex >= 0) {
      const existing = current[existingIndex]
      const updated: MistakeRecord = {
        ...existing,
        studentAnswer,
        attempts: existing.attempts + attempts,
        hintUsed: existing.hintUsed || hintUsed,
        status: 'needs_review',
        timestamp: Date.now(),
      }
      current[existingIndex] = updated
      saveMistakes(current, sid)
      return { record: updated, status: 'recorded_mistake' }
    } else {
      const created: MistakeRecord = {
        id: `mst-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        questionId: question.id,
        subjectId: question.subjectId,
        lessonId: question.lessonId,
        timestamp: Date.now(),
        studentAnswer,
        correctAnswer: question.answer,
        attempts,
        hintUsed,
        status: 'needs_review',
        reviewCount: 0,
      }
      current.unshift(created)
      saveMistakes(current, sid)
      return { record: created, status: 'recorded_mistake' }
    }
  } else {
    // Siswa berhasil menjawab benar -> jika sebelumnya salah, tandai sebagai mastered!
    if (existingIndex >= 0 && current[existingIndex].status === 'needs_review') {
      const existing = current[existingIndex]
      const updated: MistakeRecord = {
        ...existing,
        status: 'mastered',
        reviewCount: existing.reviewCount + 1,
        lastReviewedAt: Date.now(),
      }
      current[existingIndex] = updated
      saveMistakes(current, sid)
      return { record: updated, status: 'marked_mastered' }
    }
  }

  return { status: 'unmodified' }
}

/** Ringkasan statistik Bank Kesalahan */
export function getMistakesStats(mistakes?: MistakeRecord[]): {
  needsReview: number
  mastered: number
  total: number
  retryAccuracy: number
} {
  const list = mistakes ?? getStoredMistakes()
  const needsReview = list.filter((m) => m.status === 'needs_review').length
  const mastered = list.filter((m) => m.status === 'mastered').length
  const total = list.length

  // Akurasi retry = persentase kesalahan yang berhasil dikuasai
  const retryAccuracy = total > 0 ? Math.round((mastered / total) * 100) : 100

  return {
    needsReview,
    mastered,
    total,
    retryAccuracy,
  }
}

/** Seed beberapa contoh kesalahan awal (jika storage masih kosong) agar siswa dapat langsung mencoba Bank Salah */
export function seedInitialMistakesIfEmpty(questions: Question[], studentId?: string): void {
  const sid = studentId || getActiveMistakesStudentId()
  const current = getStoredMistakes(sid)
  if (current.length > 0 || questions.length === 0) return

  // Contoh: ambil 2 soal untuk dijadikan riwayat latihan awal
  const sample1 = questions.find((q) => q.id === 'q-pk-1' || q.id === 'q-k8-pola-1')
  const sample2 = questions.find((q) => q.id === 'q-st-1' || q.id === 'q-k8-newton-1')

  const initial: MistakeRecord[] = []

  if (sample1) {
    initial.push({
      id: `mst-init-1-${sid}`,
      questionId: sample1.id,
      subjectId: sample1.subjectId,
      lessonId: sample1.lessonId,
      timestamp: Date.now() - 2 * 24 * 60 * 60 * 1000, // 2 hari lalu
      studentAnswer: ['1'],
      correctAnswer: sample1.answer,
      attempts: 2,
      hintUsed: true,
      status: 'needs_review',
      reviewCount: 0,
    })
  }

  if (sample2) {
    initial.push({
      id: `mst-init-2-${sid}`,
      questionId: sample2.id,
      subjectId: sample2.subjectId,
      lessonId: sample2.lessonId,
      timestamp: Date.now() - 1 * 24 * 60 * 60 * 1000, // kemarin
      studentAnswer: '5',
      correctAnswer: sample2.answer,
      attempts: 1,
      hintUsed: false,
      status: 'needs_review',
      reviewCount: 0,
    })
  }

  if (initial.length > 0) {
    saveMistakes(initial, sid)
  }
}

/** Hook React untuk berlangganan state Bank Kesalahan */
export function useMistakes(studentId?: string) {
  const resolvedStudentId = studentId || getActiveMistakesStudentId()
  const [mistakes, setMistakes] = useState<MistakeRecord[]>(() =>
    getStoredMistakes(resolvedStudentId),
  )

  useEffect(() => {
    setMistakes(getStoredMistakes(resolvedStudentId))
  }, [resolvedStudentId])

  useEffect(() => {
    const handleUpdate = () => {
      setMistakes(getStoredMistakes(resolvedStudentId))
    }

    if (typeof window !== 'undefined') {
      window.addEventListener(MISTAKES_EVENT, handleUpdate)
      window.addEventListener('storage', handleUpdate)
    }

    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener(MISTAKES_EVENT, handleUpdate)
        window.removeEventListener('storage', handleUpdate)
      }
    }
  }, [resolvedStudentId])

  const recordResult = useCallback(
    (params: Parameters<typeof recordQuestionResult>[0]) => {
      const res = recordQuestionResult({ ...params, studentId: resolvedStudentId })
      setMistakes(getStoredMistakes(resolvedStudentId))
      return res
    },
    [resolvedStudentId],
  )

  const stats = getMistakesStats(mistakes)

  return {
    mistakes,
    stats,
    recordResult,
  }
}
