import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import type { Question } from '../lib/domain.ts'
import { seedInitialMistakesIfEmpty, useMistakes } from '../lib/mistakes.ts'
import { QuestionRenderer, useQuestionEngine } from '../lib/question-engine.tsx'
import { useData } from '../lib/store.tsx'

import { useProfile } from '../lib/auth.tsx'

// Arena Latihan (Practice Arena) — Phase 5
// Sesuai prd.md §11 & §20, agent-prompt.md §56, dan Stitch interactive_practice_feedback.

export function PracticePage() {
  const { data, loading } = useData()
  const { active } = useProfile()
  const { mistakes, stats } = useMistakes(active?.id)

  const currentGrade = active?.grade ?? 9
  const gradeQuestions = (data?.questions ?? []).filter(
    (q) => (q.grade ?? 9) === currentGrade,
  )

  // Sesi latihan aktif (null = di menu arena latihan)
  const [activeSession, setActiveSession] = useState<{
    title: string
    questions: Question[]
    currentIndex: number
    totalXP: number
    correctCount: number
    isFinished: boolean
  } | null>(null)

  // Seed contoh kesalahan jika store masih kosong agar siswa bisa langsung mencoba fitur Spaced Review
  useEffect(() => {
    if (gradeQuestions.length > 0) {
      seedInitialMistakesIfEmpty(gradeQuestions, active?.id)
    }
  }, [gradeQuestions, active?.id])

  if (loading) return <p className="py-10 text-center text-sm text-slate-400">Memuat arena latihan…</p>
  if (!data) return null

  // 1. Memulai Latihan Kilat (5 soal acak sesuai grade)
  const startQuickPractice = () => {
    const pool = gradeQuestions.length > 0 ? gradeQuestions : data.questions
    const shuffled = [...pool].sort(() => 0.5 - Math.random())
    const selected = shuffled.slice(0, Math.min(5, shuffled.length))
    if (selected.length === 0) return

    setActiveSession({
      title: `⚡ Latihan Kilat Kelas ${currentGrade} (5 Soal)`,
      questions: selected,
      currentIndex: 0,
      totalXP: 0,
      correctCount: 0,
      isFinished: false,
    })
  }

  // 2. Memulai Spaced Review (Khusus soal yang ada di Bank Salah)
  const startMistakesReview = () => {
    const mistakeQuestionIds = new Set(
      mistakes.filter((m) => m.status === 'needs_review').map((m) => m.questionId),
    )
    const reviewQuestions = gradeQuestions.filter((q) => mistakeQuestionIds.has(q.id))

    // Fallback jika tidak ada atau belum ada kesalahan aktif, gunakan 3 soal pertama
    const questionsToUse = reviewQuestions.length > 0 ? reviewQuestions : gradeQuestions.slice(0, 3)

    setActiveSession({
      title: `🧠 Spaced Review Kelas ${currentGrade} (Evaluasi Kesalahan)`,
      questions: questionsToUse,
      currentIndex: 0,
      totalXP: 0,
      correctCount: 0,
      isFinished: false,
    })
  }

  // 3. Memulai Latihan per Mapel
  const startSubjectPractice = (subjectId: string, subjectName: string) => {
    const subjectQuestions = gradeQuestions.filter((q) => q.subjectId === subjectId)
    if (subjectQuestions.length === 0) return

    setActiveSession({
      title: `🎯 Latihan ${subjectName} (Kls ${currentGrade})`,
      questions: subjectQuestions,
      currentIndex: 0,
      totalXP: 0,
      correctCount: 0,
      isFinished: false,
    })
  }

  // JIKA SEDANG DALAM SESI LATIHAN AKTIF:
  if (activeSession) {
    if (activeSession.isFinished) {
      return (
        <div className="card p-6 text-center space-y-4 animate-in zoom-in-95 duration-200">
          <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-3xl mx-auto shadow-sm">
            🏆
          </div>

          <div className="space-y-1">
            <h2 className="text-xl font-black text-slate-900">Sesi Latihan Selesai!</h2>
            <p className="text-xs text-slate-500">
              Kerja bagus! Kamu telah menyelesaikan sesi {activeSession.title}.
            </p>
          </div>

          {/* Statistik Sesi */}
          <div className="grid grid-cols-2 gap-3 py-2">
            <div className="p-3 rounded-xl bg-amber-50 border border-amber-100 text-center">
              <span className="block text-xl font-black text-amber-600">+{activeSession.totalXP}</span>
              <span className="text-[11px] font-semibold text-slate-500">Total XP Diperoleh</span>
            </div>
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-100 text-center">
              <span className="block text-xl font-black text-emerald-600">
                {activeSession.correctCount} / {activeSession.questions.length}
              </span>
              <span className="text-[11px] font-semibold text-slate-500">Jawaban Tepat</span>
            </div>
          </div>

          <div className="flex flex-col gap-2 pt-2">
            <button
              type="button"
              onClick={() => setActiveSession(null)}
              className="btn-primary w-full py-3 text-sm cursor-pointer"
            >
              Kembali ke Menu Latihan
            </button>
            <Link
              to="/student/mistakes"
              className="py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs text-center transition-colors"
            >
              Lihat Evaluasi di Bank Salah ➔
            </Link>
          </div>
        </div>
      )
    }

    const currentQuestion = activeSession.questions[activeSession.currentIndex]
    const currentNum = activeSession.currentIndex + 1
    const totalNum = activeSession.questions.length
    const progressPercent = Math.round((currentNum / totalNum) * 100)

    const handleNextQuestion = () => {
      if (activeSession.currentIndex + 1 < activeSession.questions.length) {
        setActiveSession((prev) =>
          prev
            ? {
                ...prev,
                currentIndex: prev.currentIndex + 1,
              }
            : null,
        )
      } else {
        setActiveSession((prev) => (prev ? { ...prev, isFinished: true } : null))
      }
    }

    const handleQuestionComplete = ({ isCorrect, xpEarned }: { isCorrect: boolean; xpEarned: number }) => {
      setActiveSession((prev) => {
        if (!prev) return null
        return {
          ...prev,
          totalXP: prev.totalXP + xpEarned,
          correctCount: prev.correctCount + (isCorrect ? 1 : 0),
        }
      })
    }

    return (
      <div className="space-y-3 pb-8">
        {/* Top Session Bar */}
        <div className="card p-3 space-y-2.5">
          <div className="flex items-center justify-between gap-2">
            <button
              type="button"
              onClick={() => setActiveSession(null)}
              className="flex items-center gap-1.5 px-2.5 py-1 bg-surface-container rounded-full text-primary hover:bg-slate-200 text-[11px] font-bold uppercase transition-colors cursor-pointer"
            >
              <span>✕</span>
              <span>Keluar Sesi</span>
            </button>

            <span className="text-xs font-bold text-slate-700 truncate">{activeSession.title}</span>

            {/* Stamina Hati */}
            <div className="flex items-center gap-0.5 px-2 py-0.5 bg-rose-50 rounded-full text-xs">
              <span>❤️</span>
              <span>❤️</span>
              <span>❤️</span>
            </div>
          </div>

          {/* Segmented Level Progress Bar */}
          <div className="flex items-center justify-between gap-3 pt-0.5">
            <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-primary to-emerald-400 rounded-full transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <span className="text-[11px] text-slate-500 flex-shrink-0">
              Soal <strong className="text-slate-800">{currentNum}</strong> dari {totalNum}
            </span>
          </div>
        </div>

        {/* Runner Soal */}
        <PracticeQuestionRunner
          key={currentQuestion.id}
          question={currentQuestion}
          onComplete={handleQuestionComplete}
          onNext={handleNextQuestion}
        />
      </div>
    )
  }

  // TAMPILAN UTAMA ARENA LATIHAN (MENU SELECTION):
  return (
    <div className="space-y-4 pb-8">
      {/* Banner Utama Arena Latihan */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-600 via-indigo-700 to-primary p-5 text-white shadow-lg">
        <div className="relative z-10 space-y-2">
          <div className="flex items-center justify-between">
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-white/20 text-white font-bold text-[11px] backdrop-blur-sm">
              ⚔️ Arena Latihan Albert
            </span>
            <div className="flex items-center gap-1 text-amber-300 font-bold text-xs bg-black/20 px-2 py-0.5 rounded-full">
              <span>🔥</span>
              <span>Streak 7 Hari</span>
            </div>
          </div>

          <h2 className="text-lg font-black tracking-tight text-white">
            Tingkatkan Penguasaan Materi
          </h2>
          <p className="text-xs text-indigo-100 leading-relaxed">
            Pilih mode latihan untuk mengasah ketelitian berpikir, mengingat rumus, dan memperkuat konsep ujian.
          </p>

          {/* Status Bank Salah */}
          {stats.needsReview > 0 && (
            <div className="pt-2">
              <Link
                to="/student/mistakes"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-400 text-amber-950 text-xs font-bold shadow-sm hover:bg-amber-300 transition-colors"
              >
                <span>⚠️ Ada {stats.needsReview} soal di Bank Salah</span>
                <span>➔</span>
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Mode Latihan Utama */}
      <div className="space-y-2.5">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 px-1">
          Pilih Mode Latihan
        </h3>

        <div className="grid grid-cols-1 gap-2.5">
          {/* Mode 1: Latihan Kilat */}
          <button
            type="button"
            onClick={startQuickPractice}
            className="group p-4 rounded-2xl bg-white border border-slate-200/80 shadow-[0_3px_0_0_#dae2fd] active:translate-y-0.5 active:shadow-[0_1px_0_0_#dae2fd] transition-all flex items-center justify-between text-left cursor-pointer"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center text-2xl group-hover:scale-105 transition-transform flex-shrink-0">
                ⚡
              </div>
              <div className="space-y-0.5">
                <h4 className="text-sm font-bold text-slate-900 group-hover:text-primary transition-colors">
                  Latihan Kilat 5 Soal
                </h4>
                <p className="text-xs text-slate-500">
                  Kombinasi acak soal Matematika, IPA, dan Bahasa Indonesia.
                </p>
              </div>
            </div>
            <span className="text-xs font-bold text-primary px-3 py-1 rounded-full bg-indigo-50 flex-shrink-0">
              Mulai ➔
            </span>
          </button>

          {/* Mode 2: Spaced Review (Kesalahan) */}
          <button
            type="button"
            onClick={startMistakesReview}
            className="group p-4 rounded-2xl bg-white border border-slate-200/80 shadow-[0_3px_0_0_#dae2fd] active:translate-y-0.5 active:shadow-[0_1px_0_0_#dae2fd] transition-all flex items-center justify-between text-left cursor-pointer"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center text-2xl group-hover:scale-105 transition-transform flex-shrink-0">
                🧠
              </div>
              <div className="space-y-0.5">
                <div className="flex items-center gap-1.5">
                  <h4 className="text-sm font-bold text-slate-900 group-hover:text-primary transition-colors">
                    Spaced Review (Bank Salah)
                  </h4>
                  {stats.needsReview > 0 && (
                    <span className="px-1.5 py-0.5 rounded-full bg-rose-500 text-white text-[10px] font-bold">
                      {stats.needsReview}
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-500">
                  Ulangi kembali soal-soal yang pernah kamu jawab kurang tepat.
                </p>
              </div>
            </div>
            <span className="text-xs font-bold text-rose-600 px-3 py-1 rounded-full bg-rose-50 flex-shrink-0">
              Review ➔
            </span>
          </button>
        </div>
      </div>

      {/* Mode 3: Latihan Berdasarkan Mata Pelajaran */}
      <div className="space-y-2.5 pt-1">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 px-1">
          Latihan per Mata Pelajaran
        </h3>

        <div className="grid grid-cols-2 gap-2.5">
          {data.subjects
            .filter((s) => s.status === 'active')
            .map((sub) => {
              const questionCount = data.questions.filter((q) => q.subjectId === sub.id).length
              return (
                <button
                  key={sub.id}
                  type="button"
                  onClick={() => startSubjectPractice(sub.id, sub.name)}
                  className="p-3.5 rounded-xl bg-white border border-slate-200/80 shadow-[0_2px_0_0_#dae2fd] active:translate-y-0.5 text-left transition-all hover:border-primary/50 cursor-pointer flex flex-col justify-between h-28"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-2xl">{sub.emoji}</span>
                    <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
                      {questionCount} Soal
                    </span>
                  </div>

                  <div>
                    <h4 className="text-xs font-bold text-slate-900 truncate">{sub.name}</h4>
                    <span className="text-[10px] text-primary font-semibold">Mulai Latihan ➔</span>
                  </div>
                </button>
              )
            })}
        </div>
      </div>
    </div>
  )
}

/** Runner khusus untuk soal dalam sesi latihan aktif */
function PracticeQuestionRunner({
  question,
  onComplete,
  onNext,
}: {
  question: Question
  onComplete: (res: { isCorrect: boolean; xpEarned: number }) => void
  onNext: () => void
}) {
  const engine = useQuestionEngine(question, onComplete)
  return <QuestionRenderer question={question} engine={engine} onNext={onNext} />
}
