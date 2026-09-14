// Reusable Question Engine — Phase 4
// Mendukung 6 tipe soal: MCQ, True/False, Short Answer, Numeric, Matching, Ordering.
// Sesuai agent-prompt.md §55, prd.md §17–19, dan Stitch interactive_practice_feedback.

import { useCallback, useMemo, useState } from 'react'
import type { Question } from './domain'
import { recordQuestionResult } from './mistakes.ts'
import { useProfile } from './auth.tsx'

export interface QuestionEngineState {
  /** Nilai jawaban siswa saat ini */
  currentAnswer: unknown
  /** null = belum submit, true = benar, false = salah */
  isCorrect: boolean | null
  /** Berapa kali siswa sudah submit */
  attempts: number
  /** Level hint yang sudah dibuka (1 = hint awal, 2 = hint mendalam) */
  unlockedHintLevel: number
  /** XP yang diperoleh setelah berhasil */
  earnedXP: number
  /** Pesan feedback edukatif */
  feedback: string
  /** Status apakah jawaban siap untuk disubmit */
  canSubmit: boolean
}

// ============================================================================
// 1. RE-EXPORT PURE EVALUATION LOGIC
// ============================================================================

export {
  normalizeText,
  evaluateAnswer,
  calculateEarnedXP,
  parseMatchingOptions,
} from './question-evaluator'

import {
  evaluateAnswer,
  calculateEarnedXP,
  parseMatchingOptions,
} from './question-evaluator'

// ============================================================================
// 2. REUSABLE QUESTION ENGINE HOOK
// ============================================================================

export function useQuestionEngine(
  question: Question,
  onComplete?: (result: { isCorrect: boolean; xpEarned: number }) => void,
) {
  const { addXP } = useProfile()

  // Inisialisasi state awal jawaban sesuai tipe soal
  const initialAnswer = useMemo(() => {
    switch (question.type) {
      case 'mcq':
        return [] as string[]
      case 'true_false':
        return ''
      case 'short':
      case 'numeric':
        return ''
      case 'matching':
        return {} as Record<string, string>
      case 'ordering':
        // Gunakan opsi jika ada (bisa dalam urutan acak)
        return [...(question.options.length > 0 ? question.options : question.answer)]
      default:
        return null
    }
  }, [question])

  const [currentAnswer, setCurrentAnswer] = useState<unknown>(initialAnswer)
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null)
  const [attempts, setAttempts] = useState(0)
  const [unlockedHintLevel, setUnlockedHintLevel] = useState(1) // Level 1 gratis
  const [earnedXP, setEarnedXP] = useState(0)
  const [feedback, setFeedback] = useState('')

  // Menentukan apakah tombol submit aktif
  const canSubmit = useMemo(() => {
    if (isCorrect !== null) return false
    switch (question.type) {
      case 'mcq':
        return Array.isArray(currentAnswer) && currentAnswer.length > 0
      case 'true_false':
        return typeof currentAnswer === 'string' && currentAnswer !== ''
      case 'short':
      case 'numeric':
        return typeof currentAnswer === 'string' && currentAnswer.trim() !== ''
      case 'matching': {
        const pairs = (currentAnswer as Record<string, string>) || {}
        const total = parseMatchingOptions(question.options).length
        return Object.keys(pairs).length === total
      }
      case 'ordering':
        return Array.isArray(currentAnswer) && currentAnswer.length > 0
      default:
        return false
    }
  }, [question, currentAnswer, isCorrect])

  // Evaluasi dan submit
  const submit = useCallback(() => {
    const nextAttempts = attempts + 1
    setAttempts(nextAttempts)

    const correct = evaluateAnswer(question, currentAnswer)
    setIsCorrect(correct)

    // Catat otomatis ke Bank Kesalahan (Phase 5)
    recordQuestionResult({
      question,
      studentAnswer: currentAnswer,
      isCorrect: correct,
      hintUsed: unlockedHintLevel > 1,
      attempts: nextAttempts,
    })

    if (correct) {
      const xp = calculateEarnedXP(question, true, unlockedHintLevel, nextAttempts)
      setEarnedXP(xp)
      setFeedback('Tepat sekali! Pemahaman konsepmu sangat bagus.')
      addXP(xp)
      if (onComplete) {
        onComplete({ isCorrect: true, xpEarned: xp })
      }
    } else {
      setEarnedXP(0)
      setFeedback(
        question.explanation
          ? 'Jawabanmu belum tepat. Simak penjelasan dan coba kembali!'
          : 'Belum tepat. Coba periksa kembali langkah perhitunganmu.',
      )
      if (onComplete) {
        onComplete({ isCorrect: false, xpEarned: 0 })
      }
    }
  }, [question, currentAnswer, attempts, unlockedHintLevel, onComplete, addXP])

  // Reset untuk coba lagi
  const retry = useCallback(() => {
    setIsCorrect(null)
    setFeedback('')
  }, [])

  // Buka level petunjuk berikutnya (-5 XP trade-off)
  const unlockNextHint = useCallback(() => {
    setUnlockedHintLevel((lvl) => lvl + 1)
  }, [])

  // Setters untuk masing-masing tipe
  const setMcqOption = useCallback((optIndexOrVal: string) => {
    setCurrentAnswer((prev: unknown) => {
      const list = Array.isArray(prev) ? prev : []
      if (list.includes(optIndexOrVal)) {
        return list.filter((i) => i !== optIndexOrVal)
      }
      return [optIndexOrVal] // default single choice
    })
  }, [])

  const setTrueFalseValue = useCallback((val: 'true' | 'false') => {
    setCurrentAnswer(val)
  }, [])

  const setTextValue = useCallback((val: string) => {
    setCurrentAnswer(val)
  }, [])

  const setMatchingPair = useCallback((left: string, right: string) => {
    setCurrentAnswer((prev: unknown) => {
      const existing = (prev as Record<string, string>) || {}
      return { ...existing, [left]: right }
    })
  }, [])

  const reorderList = useCallback((fromIndex: number, toIndex: number) => {
    setCurrentAnswer((prev: unknown) => {
      if (!Array.isArray(prev)) return prev
      const updated = [...prev]
      const [moved] = updated.splice(fromIndex, 1)
      updated.splice(toIndex, 0, moved)
      return updated
    })
  }, [])

  return {
    state: {
      currentAnswer,
      isCorrect,
      attempts,
      unlockedHintLevel,
      earnedXP,
      feedback,
      canSubmit,
    },
    submit,
    retry,
    unlockNextHint,
    setMcqOption,
    setTrueFalseValue,
    setTextValue,
    setMatchingPair,
    reorderList,
  }
}

// ============================================================================
// 3. UI RENDERER COMPONENTS (STITCH STYLE)
// ============================================================================

/** Opsi Pilihan Ganda (MCQ) dengan tombol taktil bergaya game */
export function McqRenderer({
  question,
  engine,
}: {
  question: Question
  engine: ReturnType<typeof useQuestionEngine>
}) {
  const { state, setMcqOption } = engine
  const selected = Array.isArray(state.currentAnswer) ? state.currentAnswer : []
  const letters = ['A', 'B', 'C', 'D', 'E']

  return (
    <div className="flex flex-col gap-3">
      {question.options.map((option, idx) => {
        const optKey = String(idx)
        const isSelected = selected.includes(optKey) || selected.includes(option)
        const isSubmitted = state.isCorrect !== null
        const isAnswerTarget =
          question.answer.includes(optKey) || question.answer.includes(option)

        // Styling status: normal, selected, correct, wrong
        let borderShadow = 'shadow-[0_3px_0_0_#dae2fd]'
        let cardBg = 'bg-white hover:bg-slate-50'
        let badgeBg = 'bg-slate-100 text-primary'
        let textColor = 'text-slate-800 font-medium'

        if (isSelected && !isSubmitted) {
          borderShadow = 'shadow-[0_3px_0_0_#3323cc]'
          cardBg = 'bg-primary/5 border-primary/50'
          badgeBg = 'bg-primary text-white shadow-sm'
          textColor = 'text-primary font-bold'
        } else if (isSubmitted) {
          if (isAnswerTarget) {
            borderShadow = 'shadow-[0_3px_0_0_#00714d]'
            cardBg = 'bg-emerald-50 border-emerald-400'
            badgeBg = 'bg-emerald-600 text-white shadow-sm'
            textColor = 'text-emerald-950 font-bold'
          } else if (isSelected && !state.isCorrect) {
            borderShadow = 'shadow-[0_3px_0_0_#ba1a1a]'
            cardBg = 'bg-rose-50 border-rose-400'
            badgeBg = 'bg-rose-600 text-white'
            textColor = 'text-rose-950 font-bold'
          }
        }

        return (
          <button
            key={idx}
            type="button"
            disabled={isSubmitted}
            onClick={() => setMcqOption(optKey)}
            className={`group w-full text-left p-4 sm:p-4.5 rounded-2xl border border-slate-200/80 ${cardBg} ${borderShadow} active:translate-y-0.5 transition-all flex items-center justify-between gap-3.5 cursor-pointer disabled:cursor-default min-h-[56px]`}
          >
            <div className="flex items-center gap-3.5 min-w-0">
              <span
                className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center text-sm sm:text-base font-black flex-shrink-0 transition-colors ${badgeBg}`}
              >
                {letters[idx] ?? idx + 1}
              </span>
              <span className={`text-sm sm:text-base leading-snug ${textColor}`}>{option}</span>
            </div>

            {/* Icon status */}
            <div className="flex-shrink-0">
              {isSubmitted && isAnswerTarget ? (
                <div className="w-7 h-7 rounded-full bg-emerald-600 text-white flex items-center justify-center shadow-sm">
                  <span className="text-sm font-black">✓</span>
                </div>
              ) : isSubmitted && isSelected && !state.isCorrect ? (
                <div className="w-7 h-7 rounded-full bg-rose-600 text-white flex items-center justify-center">
                  <span className="text-sm font-black">✕</span>
                </div>
              ) : (
                <div
                  className={`w-6 h-6 rounded-full border-2 transition-colors ${
                    isSelected ? 'border-primary bg-primary/20' : 'border-slate-300'
                  }`}
                />
              )}
            </div>
          </button>
        )
      })}
    </div>
  )
}

/** Benar / Salah (True/False) dengan kartu besar interaktif */
export function TrueFalseRenderer({
  question,
  engine,
}: {
  question: Question
  engine: ReturnType<typeof useQuestionEngine>
}) {
  const { state, setTrueFalseValue } = engine
  const isSubmitted = state.isCorrect !== null
  const selected = state.currentAnswer as string

  const choices: { value: 'true' | 'false'; label: string; icon: string }[] = [
    { value: 'true', label: 'Benar', icon: '✓' },
    { value: 'false', label: 'Salah', icon: '✕' },
  ]

  return (
    <div className="grid grid-cols-2 gap-3.5">
      {choices.map((c) => {
        const isSelected = selected === c.value
        const isAnswer = String(question.answer[0]).toLowerCase() === c.value

        let btnClass = 'bg-white border-slate-200 text-slate-700 shadow-[0_3px_0_0_#dae2fd]'
        if (isSelected && !isSubmitted) {
          btnClass = 'bg-primary/10 border-primary text-primary font-bold shadow-[0_3px_0_0_#3323cc]'
        } else if (isSubmitted) {
          if (isAnswer) {
            btnClass = 'bg-emerald-50 border-emerald-500 text-emerald-900 font-bold shadow-[0_3px_0_0_#00714d]'
          } else if (isSelected && !state.isCorrect) {
            btnClass = 'bg-rose-50 border-rose-500 text-rose-900 font-bold shadow-[0_3px_0_0_#ba1a1a]'
          }
        }

        return (
          <button
            key={c.value}
            type="button"
            disabled={isSubmitted}
            onClick={() => setTrueFalseValue(c.value)}
            className={`p-5 rounded-2xl border flex flex-col items-center justify-center gap-2 cursor-pointer active:translate-y-0.5 transition-all min-h-[76px] ${btnClass}`}
          >
            <span className="text-3xl font-black">{c.icon}</span>
            <span className="text-base font-bold">{c.label}</span>
          </button>
        )
      })}
    </div>
  )
}

/** Isian Singkat (Short Answer) */
export function ShortAnswerRenderer({
  engine,
}: {
  question: Question
  engine: ReturnType<typeof useQuestionEngine>
}) {
  const { state, setTextValue, submit } = engine
  const isSubmitted = state.isCorrect !== null
  const value = (state.currentAnswer as string) || ''

  return (
    <div className="space-y-2.5">
      <div className="relative">
        <input
          type="text"
          value={value}
          disabled={isSubmitted}
          onChange={(e) => setTextValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && state.canSubmit) submit()
          }}
          placeholder="Tuliskan jawabanmu di sini..."
          className="w-full px-4 py-3.5 rounded-xl bg-white border border-slate-300 text-base focus:outline-none focus:ring-2 focus:ring-primary shadow-sm disabled:bg-slate-100 min-h-[48px]"
        />
        {value && !isSubmitted && (
          <button
            type="button"
            onClick={() => setTextValue('')}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs sm:text-sm font-bold text-slate-400 hover:text-slate-600 p-1"
          >
            Bersihkan
          </button>
        )}
      </div>
      <p className="text-xs text-slate-500">
        💡 Tips: Gunakan kata kunci singkat dan padat (huruf besar/kecil tidak berpengaruh).
      </p>
    </div>
  )
}

/** Angka (Numeric) dengan validasi presisi */
export function NumericRenderer({
  engine,
}: {
  question: Question
  engine: ReturnType<typeof useQuestionEngine>
}) {
  const { state, setTextValue, submit } = engine
  const isSubmitted = state.isCorrect !== null
  const value = (state.currentAnswer as string) || ''

  return (
    <div className="space-y-2.5">
      <div className="flex items-center gap-2">
        <input
          type="number"
          step="any"
          value={value}
          disabled={isSubmitted}
          onChange={(e) => setTextValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && state.canSubmit) submit()
          }}
          placeholder="Masukkan angka..."
          className="flex-1 px-4 py-3.5 rounded-xl bg-white border border-slate-300 text-base font-semibold focus:outline-none focus:ring-2 focus:ring-primary shadow-sm tabular-nums disabled:bg-slate-100 min-h-[48px]"
        />
      </div>
      <p className="text-xs text-slate-500">
        Ketikkan angka penyelesaian (gunakan titik atau koma untuk pecahan desimal).
      </p>
    </div>
  )
}

/** Menjodohkan (Matching) dengan pemilih pasangan interaktif */
export function MatchingRenderer({
  question,
  engine,
}: {
  question: Question
  engine: ReturnType<typeof useQuestionEngine>
}) {
  const { state, setMatchingPair } = engine
  const isSubmitted = state.isCorrect !== null
  const pairs = (state.currentAnswer as Record<string, string>) || {}

  const parsed = useMemo(() => parseMatchingOptions(question.options), [question.options])
  const leftItems = useMemo(() => parsed.map((p) => p.left), [parsed])
  const rightItems = useMemo(() => parsed.map((p) => p.right), [parsed])

  const [selectedLeft, setSelectedLeft] = useState<string | null>(null)

  const handleLeftClick = (left: string) => {
    if (isSubmitted) return
    setSelectedLeft(left === selectedLeft ? null : left)
  }

  const handleRightClick = (right: string) => {
    if (isSubmitted || !selectedLeft) return
    setMatchingPair(selectedLeft, right)
    setSelectedLeft(null)
  }

  return (
    <div className="space-y-3">
      <p className="text-xs text-slate-500">
        Pilih salah satu item di kolom kiri, lalu ketuk pasangannya di kolom kanan:
      </p>

      <div className="grid grid-cols-2 gap-2.5">
        {/* Kolom Kiri */}
        <div className="space-y-2">
          <span className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 px-1">
            Konsep / Pernyataan
          </span>
          {leftItems.map((left, idx) => {
            const isTarget = selectedLeft === left
            const matchedRight = pairs[left]

            let btnClass = 'bg-white border-slate-200 text-slate-800 shadow-[0_2px_0_0_#dae2fd]'
            if (isTarget) {
              btnClass = 'bg-primary text-white border-primary shadow-[0_2px_0_0_#3323cc]'
            } else if (matchedRight) {
              btnClass = 'bg-slate-50 border-primary/30 text-primary font-medium'
            }

            return (
              <button
                key={idx}
                type="button"
                disabled={isSubmitted}
                onClick={() => handleLeftClick(left)}
                className={`w-full p-2.5 rounded-xl border text-left text-xs transition-all cursor-pointer ${btnClass}`}
              >
                <span className="font-bold mr-1">{idx + 1}.</span> {left}
                {matchedRight && (
                  <span className="block mt-1 text-[10px] text-emerald-600 truncate">
                    ↳ {matchedRight}
                  </span>
                )}
              </button>
            )
          })}
        </div>

        {/* Kolom Kanan */}
        <div className="space-y-2">
          <span className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 px-1">
            Pasangan / Satuan
          </span>
          {rightItems.map((right, idx) => {
            const isUsed = Object.values(pairs).includes(right)

            return (
              <button
                key={idx}
                type="button"
                disabled={isSubmitted || !selectedLeft}
                onClick={() => handleRightClick(right)}
                className={`w-full p-2.5 rounded-xl border text-left text-xs transition-all cursor-pointer ${
                  isUsed
                    ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                    : selectedLeft
                      ? 'bg-amber-50/60 border-amber-300 text-slate-700 hover:bg-amber-100'
                      : 'bg-white border-slate-200 text-slate-400'
                }`}
              >
                {right}
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}

/** Mengurutkan (Ordering) dengan tombol Reorder naik/turun */
export function OrderingRenderer({
  engine,
}: {
  question: Question
  engine: ReturnType<typeof useQuestionEngine>
}) {
  const { state, reorderList } = engine
  const isSubmitted = state.isCorrect !== null
  const items = (Array.isArray(state.currentAnswer) ? state.currentAnswer : []) as string[]

  return (
    <div className="space-y-2">
      <p className="text-xs text-slate-500">
        Susun urutan yang tepat menggunakan tombol panah naik/turun:
      </p>

      <div className="space-y-2">
        {items.map((item, idx) => (
          <div
            key={idx}
            className="flex items-center justify-between gap-2 p-3 rounded-xl bg-white border border-slate-200 shadow-sm"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <span className="w-6 h-6 rounded-full bg-indigo-50 text-primary font-bold text-xs flex items-center justify-center flex-shrink-0">
                {idx + 1}
              </span>
              <span className="text-xs text-slate-800 leading-snug">{item}</span>
            </div>

            {!isSubmitted && (
              <div className="flex items-center gap-1 flex-shrink-0">
                <button
                  type="button"
                  disabled={idx === 0}
                  onClick={() => reorderList(idx, idx - 1)}
                  className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 disabled:opacity-30 disabled:hover:bg-slate-100 text-xs cursor-pointer"
                  title="Pindah ke atas"
                >
                  ▲
                </button>
                <button
                  type="button"
                  disabled={idx === items.length - 1}
                  onClick={() => reorderList(idx, idx + 1)}
                  className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 disabled:opacity-30 disabled:hover:bg-slate-100 text-xs cursor-pointer"
                  title="Pindah ke bawah"
                >
                  ▼
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

// ============================================================================
// 4. PROGRESSIVE HINT ACCORDION (PRD §19 / STITCH)
// ============================================================================

export function ProgressiveHintsAccordion({
  question,
  engine,
}: {
  question: Question
  engine: ReturnType<typeof useQuestionEngine>
}) {
  const { state, unlockNextHint } = engine
  const [isOpen, setIsOpen] = useState(false)

  // Ambil daftar hint dari question atau buat tier dari penjelasan
  const hints = useMemo(() => {
    if (question.hints && question.hints.length > 0) return question.hints
    if (question.explanation) {
      const parts = question.explanation.split('. ')
      return [parts[0] + '.', parts.slice(1).join('. ')].filter(Boolean)
    }
    return ['Perhatikan kata kunci dan konsep utama materi ini.']
  }, [question])

  return (
    <div className="rounded-xl border border-amber-200/80 bg-amber-50/40 p-3.5 space-y-2">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between text-left cursor-pointer"
      >
        <div className="flex items-center gap-2">
          <span className="text-base">💡</span>
          <span className="text-xs font-bold text-amber-900">Petunjuk Bertahap</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] font-semibold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full">
            Tingkat {Math.min(state.unlockedHintLevel, hints.length)}/{hints.length}
          </span>
          <span className="text-xs text-amber-700">{isOpen ? '▲' : '▼'}</span>
        </div>
      </button>

      {isOpen && (
        <div className="space-y-2 pt-1 border-t border-amber-200/60">
          {/* Hint Tier 1 (Selalu Terbuka) */}
          <div className="p-2.5 rounded-lg bg-amber-100/60 flex items-start gap-2">
            <span className="w-4 h-4 rounded-full bg-amber-300 text-amber-900 text-[10px] font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
              1
            </span>
            <div className="flex-1 text-xs text-amber-900 leading-relaxed">
              <span className="font-semibold block mb-0.5 text-[11px]">Petunjuk Konsep:</span>
              {hints[0]}
            </div>
          </div>

          {/* Hint Tier 2 (Unlockable) */}
          {hints.length > 1 && (
            <div>
              {state.unlockedHintLevel >= 2 ? (
                <div className="p-2.5 rounded-lg bg-amber-200/60 flex items-start gap-2">
                  <span className="w-4 h-4 rounded-full bg-amber-400 text-amber-950 text-[10px] font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                    2
                  </span>
                  <div className="flex-1 text-xs text-amber-950 leading-relaxed">
                    <span className="font-semibold block mb-0.5 text-[11px]">Petunjuk Operasional:</span>
                    {hints[1]}
                  </div>
                </div>
              ) : (
                <div className="p-2.5 rounded-lg bg-white/70 border border-dashed border-amber-300 flex items-center justify-between gap-2">
                  <span className="text-xs text-amber-800 italic">Petunjuk lanjutan terkunci...</span>
                  <button
                    type="button"
                    onClick={unlockNextHint}
                    className="px-2.5 py-1 rounded-full bg-amber-200 hover:bg-amber-300 text-amber-900 text-[11px] font-bold active:scale-95 transition-transform flex items-center gap-1 cursor-pointer"
                  >
                    <span>🔓 Buka (-5 XP)</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// ============================================================================
// 5. EDUCATIONAL FEEDBACK DRAWER (PRD §18 / STITCH)
// ============================================================================

export function FeedbackDrawer({
  question,
  engine,
  onNext,
}: {
  question: Question
  engine: ReturnType<typeof useQuestionEngine>
  onNext?: () => void
}) {
  const { state, retry } = engine
  if (state.isCorrect === null) return null

  const isSuccess = state.isCorrect

  return (
    <div className="rounded-2xl bg-white shadow-xl border border-slate-200 overflow-hidden mt-4 animate-in fade-in slide-in-from-bottom duration-300">
      {/* Header Banner */}
      <div
        className={`p-3.5 flex items-center justify-between ${
          isSuccess
            ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white'
            : 'bg-gradient-to-r from-rose-500 to-amber-500 text-white'
        }`}
      >
        <div className="flex items-center gap-2.5">
          <span className="text-2xl">{isSuccess ? '🎉' : '💡'}</span>
          <div>
            <h4 className="font-bold text-sm leading-tight">
              {isSuccess ? 'Hebat, Albert!' : 'Belum Tepat, Coba Lagi!'}
            </h4>
            <p className="text-[11px] opacity-90">
              {isSuccess ? 'Tepat sasaran!' : 'Setiap kesalahan membuatmu semakin pintar.'}
            </p>
          </div>
        </div>

        {isSuccess && (
          <div className="px-3 py-1 rounded-full bg-white text-emerald-700 font-black text-sm shadow-sm">
            +{state.earnedXP} XP
          </div>
        )}
      </div>

      {/* Body Penjelasan */}
      <div className="p-4 space-y-3">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
            Penjelasan Konsep:
          </span>
          <p className="text-xs text-slate-700 leading-relaxed">
            {question.explanation || state.feedback}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
          {!isSuccess && (
            <button
              type="button"
              onClick={retry}
              className="flex-1 py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs active:translate-y-0.5 transition-all text-center cursor-pointer"
            >
              🔄 Coba Lagi
            </button>
          )}

          {onNext && (
            <button
              type="button"
              onClick={onNext}
              className={`flex-1 py-2.5 px-4 rounded-xl font-bold text-xs text-white shadow-sm active:translate-y-0.5 transition-all text-center cursor-pointer ${
                isSuccess ? 'bg-primary hover:bg-indigo-700' : 'bg-slate-800 hover:bg-slate-900'
              }`}
            >
              Lanjut Soal Berikutnya ➔
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

// ============================================================================
// 6. MASTER QUESTION RENDERER
// ============================================================================

export function QuestionRenderer({
  question,
  engine,
  onNext,
}: {
  question: Question
  engine: ReturnType<typeof useQuestionEngine>
  onNext?: () => void
}) {
  const { state, submit } = engine

  return (
    <div className="space-y-4">
      {/* Kartu Soal */}
      <div className="card p-5 sm:p-6 space-y-4">
        {/* Header Metadata Soal */}
        <div className="flex items-center justify-between text-xs sm:text-sm">
          <span className="px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 font-bold text-xs">
            {question.difficulty === 1 ? 'Mudah' : question.difficulty === 2 ? 'Sedang' : 'Tantangan'}
          </span>
          <div className="flex items-center gap-1.5 font-black text-amber-600 bg-amber-50 px-3 py-1 rounded-full text-xs">
            <span>⭐</span>
            <span>+{question.difficulty * 10} XP</span>
          </div>
        </div>

        {/* Teks Prompt */}
        <p className="text-base sm:text-lg font-bold text-slate-900 leading-relaxed">{question.prompt}</p>

        {/* Komponen Input Spesifik Tipe Soal */}
        <div className="pt-2">
          {question.type === 'mcq' && <McqRenderer question={question} engine={engine} />}
          {question.type === 'true_false' && (
            <TrueFalseRenderer question={question} engine={engine} />
          )}
          {question.type === 'short' && <ShortAnswerRenderer question={question} engine={engine} />}
          {question.type === 'numeric' && <NumericRenderer question={question} engine={engine} />}
          {question.type === 'matching' && (
            <MatchingRenderer question={question} engine={engine} />
          )}
          {question.type === 'ordering' && (
            <OrderingRenderer question={question} engine={engine} />
          )}
        </div>

        {/* Tombol Kirim Jawaban (jika belum dijawab) */}
        {state.isCorrect === null && (
          <button
            type="button"
            disabled={!state.canSubmit}
            onClick={submit}
            className="w-full mt-4 py-3.5 px-5 rounded-2xl bg-primary text-white font-extrabold text-sm sm:text-base shadow-[0_4px_0_0_#3323cc] active:translate-y-0.5 active:shadow-[0_1px_0_0_#3323cc] disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none transition-all cursor-pointer min-h-[50px]"
          >
            Kirim Jawaban ⚔️
          </button>
        )}
      </div>

      {/* Accordion Petunjuk Bertahap */}
      <ProgressiveHintsAccordion question={question} engine={engine} />

      {/* Drawer Hasil Edukatif */}
      <FeedbackDrawer question={question} engine={engine} onNext={onNext} />
    </div>
  )
}