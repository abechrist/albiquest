// Logika murni evaluasi soal, normalisasi jawaban, dan kalkulasi XP (Phase 4).
// Terpisah dari React/JSX agar 100% dapat diuji secara unit test (Node.js/Vitest/Playwright).

import type { Question } from './domain'

/** Normalisasi string untuk pencocokan teks bebas */
export function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[.,/#!$%^&*;:{}=\-_`~()?"'+]/g, '')
    .replace(/\s+/g, ' ')
}

/** Helper pemisah opsi matching "Kiri | Kanan" */
export function parseMatchingOptions(options: string[]): { left: string; right: string }[] {
  return options.map((opt) => {
    const parts = opt.split('|').map((s) => s.trim())
    return {
      left: parts[0] ?? '',
      right: parts[1] ?? '',
    }
  })
}

/** Evaluasi validitas jawaban untuk seluruh 6 tipe soal */
export function evaluateAnswer(question: Question, studentAnswer: unknown): boolean {
  if (studentAnswer === undefined || studentAnswer === null) return false

  switch (question.type) {
    case 'mcq': {
      // studentAnswer: array index pilihan (e.g. ['0']) atau array teks pilihan
      const selected = Array.isArray(studentAnswer)
        ? studentAnswer.map(String)
        : [String(studentAnswer)]
      if (selected.length === 0) return false

      // Cek apakah question.answer berisi index numerik (e.g. ["0"])
      const isAnswerIndex = question.answer.every((a) => /^\d+$/.test(a))
      if (isAnswerIndex) {
        if (selected.length !== question.answer.length) return false
        const sortedSelected = [...selected].sort()
        const sortedAnswer = [...question.answer].sort()
        return sortedSelected.every((val, idx) => val === sortedAnswer[idx])
      }

      // Jika jawaban dicocokkan berdasarkan teks pilihan
      const normAnswer = question.answer.map((a) => normalizeText(a))
      const normSelected = selected.map((s) => normalizeText(s))
      if (normSelected.length !== normAnswer.length) return false
      return normSelected.every((val) => normAnswer.includes(val))
    }

    case 'true_false': {
      // studentAnswer: 'true' atau 'false'
      const val = String(studentAnswer).toLowerCase().trim()
      const expected = String(question.answer[0] ?? '').toLowerCase().trim()
      return val === expected
    }

    case 'short': {
      // studentAnswer: string input teks
      const val = normalizeText(String(studentAnswer))
      if (!val) return false
      // question.answer berisi daftar kata kunci / alternatif jawaban benar
      return question.answer.some((ans) => {
        const normExpected = normalizeText(ans)
        return val === normExpected || val.includes(normExpected) || normExpected.includes(val)
      })
    }

    case 'numeric': {
      // studentAnswer: string/number
      const raw = String(studentAnswer).replace(',', '.').trim()
      const val = Number.parseFloat(raw)
      if (Number.isNaN(val)) return false
      const expectedRaw = String(question.answer[0] ?? '').replace(',', '.').trim()
      const expected = Number.parseFloat(expectedRaw)
      if (Number.isNaN(expected)) return false
      // Toleransi floating point 1e-4
      return Math.abs(val - expected) < 0.0001
    }

    case 'matching': {
      // studentAnswer: Record<string, string> (leftItem -> selectedRightItem)
      if (typeof studentAnswer !== 'object' || studentAnswer === null) return false
      const pairs = studentAnswer as Record<string, string>

      const correctPairs = parseMatchingOptions(question.options)
      if (Object.keys(pairs).length !== correctPairs.length) return false

      return correctPairs.every(({ left, right }) => {
        const studentRight = pairs[left]
        return studentRight !== undefined && studentRight === right
      })
    }

    case 'ordering': {
      // studentAnswer: string[] berisi urutan teks
      if (!Array.isArray(studentAnswer)) return false
      if (studentAnswer.length !== question.answer.length) return false
      return studentAnswer.every((item, idx) => item === question.answer[idx])
    }

    default:
      return false
  }
}

/** Hitung perolehan XP berdasarkan kesulitan, jumlah percobaan, dan hint */
export function calculateEarnedXP(
  question: Question,
  isCorrect: boolean,
  unlockedHintLevel: number,
  attempts: number,
): number {
  if (!isCorrect) return 0

  // Base XP dari difficulty: Tingkat 1 = 10 XP, Tingkat 2 = 20 XP, Tingkat 3 = 30 XP
  const baseXP = question.xp ?? (question.difficulty === 1 ? 10 : question.difficulty === 2 ? 20 : 30)

  // Penalti -5 XP jika membuka hint level 2 (PRD §19 / Stitch)
  const hintPenalty = unlockedHintLevel > 1 ? 5 : 0

  // Sedikit penalti jika butuh berkali-kali percobaan (maksimal -5 XP)
  const attemptPenalty = attempts > 1 ? Math.min((attempts - 1) * 2, 5) : 0

  return Math.max(baseXP - hintPenalty - attemptPenalty, 5)
}
