// Mock Exam & ANBK Simulation Engine — Phase 9
// Sesuai prd.md §24–25, agent-prompt.md §60, dan DECISIONS.md (D-018).

import type { Question } from './domain.ts'
import { recordQuestionResult } from './mistakes.ts'
import { evaluateAnswer } from './question-evaluator.ts'

export interface ExamPreset {
  id: string
  title: string
  subtitle: string
  durationMinutes: number
  questionCount: number
  targetScore: number
  icon: string
  badge: string
}

export const EXAM_PRESETS: ExamPreset[] = [
  {
    id: 'anbk_complete',
    title: 'Simulasi Lengkap ANBK / Asesmen Akhir',
    subtitle: '15 Soal • Literasi & Numerasi SMP Kelas 9',
    durationMinutes: 25,
    questionCount: 15,
    targetScore: 75,
    icon: '🏛️',
    badge: 'Standar Nasional',
  },
  {
    id: 'mipa_focus',
    title: 'Simulasi Fokus MIPA (Matematika & IPA)',
    subtitle: '10 Soal • Aljabar, Geometri, & Listrik Dinamis',
    durationMinutes: 15,
    questionCount: 10,
    targetScore: 80,
    icon: '🔬',
    badge: 'Sains & Hitungan',
  },
  {
    id: 'quick_test',
    title: 'Uji Cepat Kesiapan Ujian (Sprint)',
    subtitle: '5 Soal • Refleks Berpikir Kritis Cepat',
    durationMinutes: 8,
    questionCount: 5,
    targetScore: 70,
    icon: '⚡',
    badge: 'Kilat 8 Menit',
  },
]

export type PaletteStatus = 'answered' | 'flagged' | 'unanswered'

export interface ExamSessionState {
  presetId: string
  presetTitle: string
  questions: Question[]
  currentIndex: number
  answers: Record<string, string[]> // questionId -> studentAnswer
  flagged: Record<string, boolean> // questionId -> isFlagged / ragu-ragu
  startTime: number
  durationSeconds: number
  remainingSeconds: number
  isSubmitted: boolean
}

export interface ExamResultSummary {
  id: string
  presetId: string
  presetTitle: string
  timestamp: number
  totalQuestions: number
  correctCount: number
  wrongCount: number
  unansweredCount: number
  score: number // 0 - 100
  passed: boolean
  earnedXP: number
  timeSpentSeconds: number
  strongTopics: string[]
  needsPracticeTopics: string[]
  questionBreakdown: {
    questionId: string
    prompt: string
    subjectId: string
    isCorrect: boolean
    studentAnswer: string[]
    correctAnswer: string[]
    explanation: string
  }[]
}

const EXAM_HISTORY_KEY = 'pla.exam_history.v1'

/**
 * Inisialisasi sesi ujian baru dari preset
 */
export function initExamSession(
  preset: ExamPreset,
  availableQuestions: Question[],
): ExamSessionState {
  let pool = [...availableQuestions]

  // Filter sesuai preset jika MIPA
  if (preset.id === 'mipa_focus') {
    pool = pool.filter((q) => q.subjectId === 'matematika' || q.subjectId === 'ipa')
  }

  // Jika pool kurang dari questionCount, gandakan / gunakan seluruh pool yang ada
  if (pool.length === 0) pool = [...availableQuestions]

  // Acak urutan soal
  const shuffled = [...pool].sort(() => 0.5 - Math.random())
  const selected = shuffled.slice(0, Math.min(preset.questionCount, shuffled.length))

  return {
    presetId: preset.id,
    presetTitle: preset.title,
    questions: selected,
    currentIndex: 0,
    answers: {},
    flagged: {},
    startTime: Date.now(),
    durationSeconds: preset.durationMinutes * 60,
    remainingSeconds: preset.durationMinutes * 60,
    isSubmitted: false,
  }
}

/**
 * Dapatkan status palet untuk nomor soal tertentu
 */
export function getPaletteStatus(
  state: ExamSessionState,
  questionId: string,
): PaletteStatus {
  const isFlagged = Boolean(state.flagged[questionId])
  const answer = state.answers[questionId]
  const isAnswered = Boolean(answer && answer.length > 0)

  if (isFlagged) return 'flagged'
  if (isAnswered) return 'answered'
  return 'unanswered'
}

/**
 * Evaluasi dan selesaikan ujian (Auto-Scoring & Topic Analysis)
 */
export function evaluateExamSubmission(
  state: ExamSessionState,
  finishTime: number = Date.now(),
): ExamResultSummary {
  let correctCount = 0
  let wrongCount = 0
  let unansweredCount = 0

  const topicResults: Record<string, { correct: number; total: number }> = {}

  const questionBreakdown = state.questions.map((q) => {
    const studentAns = state.answers[q.id]
    const hasAnswer = studentAns && studentAns.length > 0

    let isCorrect = false
    if (hasAnswer) {
      isCorrect = evaluateAnswer(q, studentAns)
    }

    if (!hasAnswer) {
      unansweredCount++
    } else if (isCorrect) {
      correctCount++
    } else {
      wrongCount++
    }

    // Catat ke bank kesalahan jika salah atau tidak dijawab
    if (!isCorrect) {
      recordQuestionResult({
        question: q,
        studentAnswer: studentAns || ['(Tidak dijawab)'],
        isCorrect: false,
      })
    }

    // Klasifikasi topik
    const topicKey = q.subjectId.toUpperCase()
    if (!topicResults[topicKey]) {
      topicResults[topicKey] = { correct: 0, total: 0 }
    }
    topicResults[topicKey].total++
    if (isCorrect) {
      topicResults[topicKey].correct++
    }

    return {
      questionId: q.id,
      prompt: q.prompt,
      subjectId: q.subjectId,
      isCorrect,
      studentAnswer: studentAns || [],
      correctAnswer: q.answer,
      explanation: q.explanation || 'Simak kembali materi konsep terkait modul ini.',
    }
  })

  const total = state.questions.length
  const score = total > 0 ? Math.round((correctCount / total) * 100) : 0
  const passed = score >= 70

  // Analisis Strong Topics vs Needs Practice
  const strongTopics: string[] = []
  const needsPracticeTopics: string[] = []

  Object.entries(topicResults).forEach(([topic, stats]) => {
    const pct = (stats.correct / stats.total) * 100
    if (pct >= 75) {
      strongTopics.push(`${topic} (${Math.round(pct)}%)`)
    } else {
      needsPracticeTopics.push(`${topic} (${Math.round(pct)}%)`)
    }
  })

  const timeSpent = Math.max(0, Math.round((finishTime - state.startTime) / 1000))
  const earnedXP = passed ? 100 + Math.round(score * 0.5) : 40

  const summary: ExamResultSummary = {
    id: `exam-${Date.now()}`,
    presetId: state.presetId,
    presetTitle: state.presetTitle,
    timestamp: finishTime,
    totalQuestions: total,
    correctCount,
    wrongCount,
    unansweredCount,
    score,
    passed,
    earnedXP,
    timeSpentSeconds: timeSpent,
    strongTopics,
    needsPracticeTopics,
    questionBreakdown,
  }

  // Simpan ke storage lokal
  saveExamResult(summary)

  return summary
}

function getActiveExamStudentId(): string {
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

/**
 * Menyimpan riwayat hasil ujian ke localStorage (per siswa)
 */
export function saveExamResult(summary: ExamResultSummary, studentId?: string): void {
  try {
    if (typeof window === 'undefined' || !window.localStorage) return
    const sid = studentId || getActiveExamStudentId()
    const key = `pla.exam_history_${sid}.v1`
    const existing = getStoredExamHistory(sid)
    const updated = [summary, ...existing].slice(0, 20) // simpan 20 riwayat terakhir
    localStorage.setItem(key, JSON.stringify(updated))
    if (sid === 'albert') {
      localStorage.setItem(EXAM_HISTORY_KEY, JSON.stringify(updated))
    }
    window.dispatchEvent(new CustomEvent('pla:exam-updated'))
  } catch (err) {
    console.error('Gagal menyimpan riwayat ujian:', err)
  }
}

/**
 * Mengambil daftar riwayat ujian yang pernah dikerjakan (per siswa)
 */
export function getStoredExamHistory(studentId?: string): ExamResultSummary[] {
  try {
    if (typeof window === 'undefined' || !window.localStorage) return []
    const sid = studentId || getActiveExamStudentId()
    const key = `pla.exam_history_${sid}.v1`
    const raw =
      localStorage.getItem(key) ||
      (sid === 'albert' ? localStorage.getItem(EXAM_HISTORY_KEY) : null)
    if (!raw) return []
    return JSON.parse(raw) as ExamResultSummary[]
  } catch {
    return []
  }
}
