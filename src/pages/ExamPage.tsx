// Halaman Simulasi Ujian ANBK & AKM (Mock Exam) — Phase 9
// Sesuai prd.md §24–25, agent-prompt.md §60, dan desain Stitch taktil.

import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useProfile } from '../lib/auth'
import {
  evaluateExamSubmission,
  EXAM_PRESETS,
  getPaletteStatus,
  getStoredExamHistory,
  initExamSession,
  type ExamPreset,
  type ExamResultSummary,
  type ExamSessionState,
} from '../lib/mock-exam'
import { useData } from '../lib/store'

export function ExamPage() {
  const { data } = useData()
  const { active, addXP } = useProfile()
  const currentGrade = active?.grade ?? 9
  const questions = (data?.questions ?? []).filter(
    (q) => (q.grade ?? 9) === currentGrade,
  )

  // View mode: 'lobby' | 'exam' | 'result'
  const [view, setView] = useState<'lobby' | 'exam' | 'result'>('lobby')
  const [selectedPreset, setSelectedPreset] = useState<ExamPreset>(EXAM_PRESETS[0])
  const [session, setSession] = useState<ExamSessionState | null>(null)
  const [result, setResult] = useState<ExamResultSummary | null>(null)
  const [history, setHistory] = useState<ExamResultSummary[]>(() =>
    getStoredExamHistory(active?.id),
  )

  useEffect(() => {
    setHistory(getStoredExamHistory(active?.id))
  }, [active?.id])

  // Modals & UI states
  const [showSubmitModal, setShowSubmitModal] = useState<boolean>(false)
  const [showPaletteDrawer, setShowPaletteDrawer] = useState<boolean>(false)

  // Selesaikan ujian
  const handleFinishExam = useCallback(
    (currentSession: ExamSessionState | null = session) => {
      if (!currentSession) return
      const summary = evaluateExamSubmission(currentSession)
      addXP(summary.earnedXP)
      setResult(summary)
      setHistory(getStoredExamHistory(active?.id))
      setView('result')
      setShowSubmitModal(false)
    },
    [session, addXP, active?.id],
  )

  // Timer countdown
  useEffect(() => {
    if (view !== 'exam' || !session || session.isSubmitted) return

    const timer = setInterval(() => {
      setSession((prev) => {
        if (!prev || prev.isSubmitted) return prev
        const remaining = prev.remainingSeconds - 1
        if (remaining <= 0) {
          clearInterval(timer)
          // Auto submit saat waktu habis
          handleFinishExam(prev)
          return { ...prev, remainingSeconds: 0, isSubmitted: true }
        }
        return { ...prev, remainingSeconds: remaining }
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [view, session?.isSubmitted, handleFinishExam])

  // Mulai ujian
  const handleStartExam = () => {
    if (questions.length === 0) return
    const newSession = initExamSession(selectedPreset, questions)
    setSession(newSession)
    setView('exam')
    setShowSubmitModal(false)
  }

  // Pilih jawaban untuk soal saat ini
  const handleSelectOption = (option: string) => {
    if (!session) return
    const currentQ = session.questions[session.currentIndex]
    setSession({
      ...session,
      answers: {
        ...session.answers,
        [currentQ.id]: [option],
      },
    })
  }

  // Toggle flag ragu-ragu
  const handleToggleFlag = () => {
    if (!session) return
    const currentQ = session.questions[session.currentIndex]
    const isFlagged = Boolean(session.flagged[currentQ.id])
    setSession({
      ...session,
      flagged: {
        ...session.flagged,
        [currentQ.id]: !isFlagged,
      },
    })
  }

  // Format detik ke MM:SS
  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60)
    const s = secs % 60
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
  }

  return (
    <div className="min-h-screen bg-slate-950 pb-[calc(6rem+env(safe-area-inset-bottom,24px))] text-slate-100 selection:bg-indigo-500/30">
      {/* ========================================================================= */}
      {/* 1. LOBBY & SETUP VIEW                                                     */}
      {/* ========================================================================= */}
      {view === 'lobby' && (
        <>
          <header className="sticky top-0 z-30 border-b border-slate-800/80 bg-slate-900/90 px-4 py-3.5 pt-[calc(0.875rem+env(safe-area-inset-top,0px))] backdrop-blur-md">
            <div className="mx-auto flex max-w-4xl items-center justify-between">
              <div className="flex items-center gap-3">
                <Link
                  to="/student"
                  className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-700 bg-slate-800 text-slate-300 transition-colors hover:bg-slate-700"
                >
                  ←
                </Link>
                <div>
                  <h1 className="text-base sm:text-lg font-bold tracking-tight text-white flex items-center gap-2">
                    <span>🏛️ Simulasi Ujian ANBK & Asesmen SMP</span>
                  </h1>
                  <p className="text-xs sm:text-sm text-slate-400">Latihan ujian resmi terstandar dengan sistem timer & palet soal</p>
                </div>
              </div>
            </div>
          </header>

          <main className="mx-auto max-w-4xl px-4 sm:px-6 pt-6 space-y-6">
            {/* Hero Card */}
            <div className="relative overflow-hidden rounded-3xl border border-indigo-500/30 bg-gradient-to-br from-indigo-950 via-slate-900 to-slate-950 p-6 sm:p-8 shadow-2xl">
              <div className="relative z-10">
                <div className="inline-flex items-center gap-1.5 rounded-full border border-indigo-400/30 bg-indigo-500/10 px-3.5 py-1 text-xs font-semibold text-indigo-300">
                  <span>📝 Standar Asesmen Nasional SMP Kelas {currentGrade}</span>
                </div>
                <h2 className="mt-3 text-2xl sm:text-3xl font-black text-white">
                  Siap Hadapi Ujian dengan Percaya Diri!
                </h2>
                <p className="mt-2 text-xs sm:text-sm text-slate-300 max-w-xl leading-relaxed">
                  Uji kesiapan akademikmu dalam suasana simulasi ujian yang realistis. Dilengkapi palet navigasi, tanda ragu-ragu, dan evaluasi penguasaan materi otomatis.
                </p>
              </div>
            </div>

            {/* Pilihan Paket Ujian */}
            <section className="space-y-3">
              <h3 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-400">
                Pilih Paket Simulasi
              </h3>
              <div className="grid gap-3.5 sm:grid-cols-3">
                {EXAM_PRESETS.map((preset) => (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => setSelectedPreset(preset)}
                    className={`flex flex-col justify-between rounded-2xl p-5 text-left transition-all cursor-pointer min-h-[160px] ${
                      selectedPreset.id === preset.id
                        ? 'border-2 border-indigo-500 bg-indigo-950/40 text-white shadow-[0_4px_0_0_#4338ca]'
                        : 'border border-slate-800 bg-slate-900/60 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-3xl">{preset.icon}</span>
                        <span className="rounded-full bg-slate-800 px-2.5 py-0.5 text-xs font-bold text-indigo-300">
                          {preset.badge}
                        </span>
                      </div>
                      <h4 className="mt-3 font-bold text-white text-base sm:text-lg">{preset.title}</h4>
                      <p className="mt-1 text-xs sm:text-sm text-slate-400 leading-relaxed">{preset.subtitle}</p>
                    </div>

                    <div className="mt-4 border-t border-slate-800/80 pt-2.5 flex items-center justify-between text-xs sm:text-sm">
                      <span className="text-amber-400 font-bold">⏱️ {preset.durationMinutes} Menit</span>
                      <span className="text-slate-400">{preset.questionCount} Soal</span>
                    </div>
                  </button>
                ))}
              </div>
            </section>

            {/* Panduan Pengerjaan */}
            <section className="rounded-2xl border border-slate-800 bg-slate-900/40 p-5 space-y-2.5">
              <h4 className="text-xs sm:text-sm font-bold text-slate-200 flex items-center gap-1.5">
                <span>💡</span> Tata Tertib & Ketentuan Simulasi
              </h4>
              <ul className="text-xs sm:text-sm text-slate-400 space-y-1.5 list-disc list-inside leading-relaxed">
                <li>Timer otomatis menghitung mundur segera setelah ujian dimulai.</li>
                <li>Gunakan palet nomor soal untuk memeriksa status (Terjawab, Ragu-ragu, Kosong).</li>
                <li>Soal yang keliru otomatis dicatat ke Bank Kesalahan untuk perbaikan mandiri.</li>
                <li>Ujian otomatis dikumpulkan ketika waktu habis (00:00).</li>
              </ul>
            </section>

            {/* Tombol Mulai */}
            <div>
              <button
                type="button"
                onClick={handleStartExam}
                className="w-full rounded-2xl border-b-4 border-indigo-700 bg-indigo-600 py-4 text-base font-black text-white shadow-xl transition-all hover:bg-indigo-500 active:translate-y-1 flex items-center justify-center gap-2 cursor-pointer min-h-[56px]"
              >
                <span>Mulai {selectedPreset.title}</span>
                <span>🚀</span>
              </button>
            </div>

            {/* Riwayat Ujian Sebelumnya */}
            {history.length > 0 && (
              <section className="space-y-3 pt-4 border-t border-slate-800">
                <h3 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-400">
                  Riwayat Simulasi Terakhir
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                  {history.slice(0, 4).map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-900/80 p-3.5"
                    >
                      <div>
                        <p className="text-xs sm:text-sm font-bold text-white">{item.presetTitle}</p>
                        <p className="text-xs text-slate-400 mt-0.5">
                          {new Date(item.timestamp).toLocaleDateString('id-ID')} • {item.correctCount} benar dari {item.totalQuestions} soal
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-black ${
                            item.passed ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
                          }`}
                        >
                          Skor {item.score}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </main>
        </>
      )}

      {/* ========================================================================= */}
      {/* 2. LIVE EXAM VIEW                                                         */}
      {/* ========================================================================= */}
      {view === 'exam' && session && (
        <>
          {/* Sticky Exam Bar: Timer, Title, Submit */}
          <header className="sticky top-0 z-40 border-b border-slate-800/80 bg-slate-900/95 px-4 py-3 pt-[calc(0.75rem+env(safe-area-inset-top,0px))] backdrop-blur-md">
            <div className="mx-auto flex max-w-4xl items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowPaletteDrawer(!showPaletteDrawer)}
                  className="rounded-xl border border-slate-700 bg-slate-800 px-3.5 sm:px-4 py-2 text-xs sm:text-sm font-bold text-slate-200 hover:bg-slate-700 flex items-center gap-2 cursor-pointer min-h-[42px]"
                >
                  <span>📋</span>
                  <span>Palet Soal</span>
                  <span className="rounded-md bg-slate-700 px-2 py-0.5 text-xs text-indigo-300 font-bold">
                    {session.currentIndex + 1}/{session.questions.length}
                  </span>
                </button>
              </div>

              {/* Timer Countdown */}
              <div
                className={`flex items-center gap-1.5 px-3.5 sm:px-4 py-2 rounded-xl border text-xs sm:text-sm font-black min-h-[42px] ${
                  session.remainingSeconds <= 180
                    ? 'border-rose-500/50 bg-rose-950/40 text-rose-400 animate-pulse'
                    : 'border-slate-700 bg-slate-800 text-amber-300'
                }`}
              >
                <span>⏱️</span>
                <span>{formatTime(session.remainingSeconds)}</span>
              </div>

              <button
                type="button"
                onClick={() => setShowSubmitModal(true)}
                className="rounded-xl border-b-2 border-emerald-700 bg-emerald-600 px-4 sm:px-5 py-2 text-xs sm:text-sm font-black text-white hover:bg-emerald-500 active:translate-y-0.5 transition-all cursor-pointer min-h-[42px]"
              >
                Kumpulkan 🏁
              </button>
            </div>
          </header>

          <main className="mx-auto max-w-4xl px-4 sm:px-6 pt-6 space-y-6">
            {/* Palet Drawer Dropdown jika dibuka */}
            {showPaletteDrawer && (
              <div className="rounded-3xl border border-slate-800 bg-slate-900 p-5 sm:p-6 shadow-2xl space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <span className="text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-400">
                    Nomor Soal
                  </span>
                  <div className="flex items-center gap-3.5 text-xs font-semibold">
                    <span className="flex items-center gap-1.5 text-emerald-400">
                      <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" /> Terjawab
                    </span>
                    <span className="flex items-center gap-1.5 text-amber-400">
                      <span className="h-2.5 w-2.5 rounded-full bg-amber-500" /> Ragu
                    </span>
                    <span className="flex items-center gap-1.5 text-slate-400">
                      <span className="h-2.5 w-2.5 rounded-full bg-slate-700" /> Kosong
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-5 sm:grid-cols-8 md:grid-cols-10 gap-2.5">
                  {session.questions.map((q, idx) => {
                    const status = getPaletteStatus(session, q.id)
                    const isCurrent = session.currentIndex === idx

                    return (
                      <button
                        key={q.id}
                        type="button"
                        onClick={() => {
                          setSession({ ...session, currentIndex: idx })
                          setShowPaletteDrawer(false)
                        }}
                        className={`h-11 rounded-xl font-black text-sm sm:text-base transition-all cursor-pointer ${
                          isCurrent
                            ? 'ring-2 ring-white ring-offset-2 ring-offset-slate-900'
                            : ''
                        } ${
                          status === 'flagged'
                            ? 'bg-amber-500 text-amber-950'
                            : status === 'answered'
                            ? 'bg-emerald-600 text-white'
                            : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                        }`}
                      >
                        {idx + 1}
                      </button>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Soal Aktif */}
            {session.questions[session.currentIndex] && (
              <div className="rounded-3xl border border-slate-800 bg-slate-900 p-5 sm:p-7 space-y-6">
                <div className="flex items-center justify-between border-b border-slate-800/80 pb-3.5">
                  <div className="flex items-center gap-2.5">
                    <span className="text-sm sm:text-base font-bold text-white">
                      Soal Nomor {session.currentIndex + 1}
                    </span>
                    <span className="rounded-md bg-indigo-500/20 px-2.5 py-1 text-xs font-bold text-indigo-300 uppercase">
                      {session.questions[session.currentIndex].subjectId}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={handleToggleFlag}
                    className={`flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs sm:text-sm font-bold transition-colors cursor-pointer min-h-[40px] ${
                      session.flagged[session.questions[session.currentIndex].id]
                        ? 'bg-amber-400 text-amber-950'
                        : 'bg-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    <span>⭐</span>
                    <span>
                      {session.flagged[session.questions[session.currentIndex].id]
                        ? 'Ragu-ragu (Aktif)'
                        : 'Tandai Ragu'}
                    </span>
                  </button>
                </div>

                {/* Teks Pertanyaan */}
                <div className="rounded-2xl bg-slate-950 p-5 sm:p-6 border border-slate-800/80">
                  <p className="text-base sm:text-lg font-medium text-white leading-relaxed">
                    {session.questions[session.currentIndex].prompt}
                  </p>
                </div>

                {/* Opsi Pilihan */}
                <div className="grid gap-3">
                  {session.questions[session.currentIndex].options.map((opt, idx) => {
                    const currentAnswer = session.answers[session.questions[session.currentIndex].id]
                    const isSelected = currentAnswer && currentAnswer.includes(opt)

                    return (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleSelectOption(opt)}
                        className={`flex items-center gap-3.5 sm:gap-4 w-full rounded-2xl p-4 sm:p-5 text-left text-sm sm:text-base font-semibold transition-all min-h-[58px] cursor-pointer ${
                          isSelected
                            ? 'border-2 border-indigo-500 bg-indigo-950/50 text-white shadow-[0_3px_0_0_#4338ca]'
                            : 'border border-slate-800 bg-slate-950/60 text-slate-300 hover:border-slate-700 hover:bg-slate-800/40'
                        }`}
                      >
                        <span
                          className={`flex h-8 w-8 sm:h-9 sm:w-9 shrink-0 items-center justify-center rounded-xl text-xs sm:text-sm font-black transition-colors ${
                            isSelected
                              ? 'bg-indigo-600 text-white'
                              : 'bg-slate-800 text-slate-400'
                          }`}
                        >
                          {String.fromCharCode(65 + idx)}
                        </span>
                        <span className="leading-relaxed">{opt}</span>
                      </button>
                    )
                  })}
                </div>

                {/* Tombol Navigasi Bawah */}
                <div className="flex items-center justify-between pt-4 border-t border-slate-800">
                  <button
                    type="button"
                    disabled={session.currentIndex === 0}
                    onClick={() => setSession({ ...session, currentIndex: session.currentIndex - 1 })}
                    className="rounded-xl border border-slate-700 bg-slate-800 px-5 sm:px-6 py-3 text-xs sm:text-sm font-bold text-slate-300 hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer min-h-[46px]"
                  >
                    ← Sebelumnya
                  </button>

                  {session.currentIndex < session.questions.length - 1 ? (
                    <button
                      type="button"
                      onClick={() => setSession({ ...session, currentIndex: session.currentIndex + 1 })}
                      className="rounded-xl border-b-2 border-indigo-700 bg-indigo-600 px-5 sm:px-6 py-3 text-xs sm:text-sm font-bold text-white hover:bg-indigo-500 active:translate-y-0.5 cursor-pointer min-h-[46px]"
                    >
                      Selanjutnya →
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setShowSubmitModal(true)}
                      className="rounded-xl border-b-2 border-emerald-700 bg-emerald-600 px-5 sm:px-6 py-3 text-xs sm:text-sm font-bold text-white hover:bg-emerald-500 active:translate-y-0.5 cursor-pointer min-h-[46px]"
                    >
                      Selesai Ujian 🏁
                    </button>
                  )}
                </div>
              </div>
            )}
          </main>

          {/* Modal Konfirmasi Submit */}
          {showSubmitModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
              <div className="w-full max-w-md rounded-3xl border border-slate-800 bg-slate-900 p-6 sm:p-7 text-center space-y-4 shadow-2xl">
                <span className="text-4xl inline-block">🏁</span>
                <h3 className="text-lg sm:text-xl font-black text-white">Kumpulkan Jawaban Ujian?</h3>

                {/* Ringkasan status */}
                {(() => {
                  const total = session.questions.length
                  const answered = Object.keys(session.answers).length
                  const flagged = Object.values(session.flagged).filter(Boolean).length
                  const empty = total - answered

                  return (
                    <div className="rounded-2xl bg-slate-950 p-4 sm:p-5 border border-slate-800 text-xs sm:text-sm space-y-2.5 text-left">
                      <div className="flex justify-between">
                        <span className="text-slate-400">Total Soal:</span>
                        <span className="font-bold text-white">{total}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Sudah Terjawab:</span>
                        <span className="font-bold text-emerald-400">{answered}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Masih Kosong:</span>
                        <span className="font-bold text-rose-400">{empty}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Bertanda Ragu-ragu:</span>
                        <span className="font-bold text-amber-400">{flagged}</span>
                      </div>
                    </div>
                  )
                })()}

                <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                  Setelah dikumpulkan, hasil skormu akan langsung dihitung dan jawaban yang salah akan disimpan ke Bank Kesalahan.
                </p>

                <div className="flex justify-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowSubmitModal(false)}
                    className="rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-xs sm:text-sm font-bold text-slate-300 hover:bg-slate-700 cursor-pointer min-h-[46px]"
                  >
                    Periksa Kembali
                  </button>
                  <button
                    type="button"
                    onClick={() => handleFinishExam()}
                    className="rounded-xl border-b-2 border-emerald-700 bg-emerald-600 px-5 py-3 text-xs sm:text-sm font-black text-white hover:bg-emerald-500 active:translate-y-0.5 cursor-pointer min-h-[46px]"
                  >
                    Ya, Kumpulkan Sekarang!
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {/* ========================================================================= */}
      {/* 3. EXAM RESULT & DIAGNOSTIC REPORT                                        */}
      {/* ========================================================================= */}
      {view === 'result' && result && (
        <>
          <header className="sticky top-0 z-30 border-b border-slate-800/80 bg-slate-900/90 px-4 py-3.5 pt-[calc(0.875rem+env(safe-area-inset-top,0px))] backdrop-blur-md">
            <div className="mx-auto flex max-w-4xl items-center justify-between">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setView('lobby')}
                  className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-700 bg-slate-800 text-slate-300 transition-colors hover:bg-slate-700 cursor-pointer"
                >
                  ←
                </button>
                <h1 className="text-base sm:text-lg font-bold tracking-tight text-white">
                  Laporan Hasil Simulasi Ujian
                </h1>
              </div>
              <Link
                to="/student"
                className="rounded-xl border border-slate-700 bg-slate-800 px-3.5 py-2 text-xs sm:text-sm font-semibold text-slate-300 hover:bg-slate-700"
              >
                Beranda
              </Link>
            </div>
          </header>

          <main className="mx-auto max-w-4xl px-4 sm:px-6 pt-6 space-y-6">
            {/* Score Hero Card */}
            <div
              className={`rounded-3xl border-2 p-6 sm:p-8 text-center space-y-4 shadow-2xl ${
                result.passed
                  ? 'border-emerald-500/40 bg-gradient-to-br from-emerald-950/50 via-slate-900 to-slate-950'
                  : 'border-amber-500/40 bg-gradient-to-br from-amber-950/50 via-slate-900 to-slate-950'
              }`}
            >
              <span className="text-5xl sm:text-6xl inline-block">{result.passed ? '🎉' : '📚'}</span>
              <div>
                <span className="text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-400">
                  {result.presetTitle}
                </span>
                <div className="mt-2 flex items-baseline justify-center gap-2">
                  <span className="text-5xl sm:text-6xl font-black text-white">{result.score}</span>
                  <span className="text-xl sm:text-2xl font-bold text-slate-500">/ 100</span>
                </div>
                <p className="mt-1 text-sm sm:text-base font-bold text-indigo-300">
                  {result.passed ? 'Lulus dengan Kriteria Memuaskan 🏆' : 'Perlu Penguatan Materi Lanjutan 🎯'}
                </p>
              </div>

              <div className="inline-flex items-center gap-2 rounded-full bg-indigo-500/20 px-4 py-1.5 text-xs sm:text-sm font-bold text-indigo-300 border border-indigo-500/30">
                +{result.earnedXP} XP Telah Ditambahkan ke Profil! ⭐
              </div>

              {/* Grid 4 Metrik */}
              <div className="grid grid-cols-4 gap-2.5 pt-2 max-w-lg mx-auto">
                <div className="rounded-xl bg-slate-950/80 p-3 border border-slate-800">
                  <span className="text-xs text-slate-400 block">Benar</span>
                  <span className="text-base sm:text-xl font-black text-emerald-400">{result.correctCount}</span>
                </div>
                <div className="rounded-xl bg-slate-950/80 p-3 border border-slate-800">
                  <span className="text-xs text-slate-400 block">Salah</span>
                  <span className="text-base sm:text-xl font-black text-rose-400">{result.wrongCount}</span>
                </div>
                <div className="rounded-xl bg-slate-950/80 p-3 border border-slate-800">
                  <span className="text-xs text-slate-400 block">Kosong</span>
                  <span className="text-base sm:text-xl font-black text-slate-400">{result.unansweredCount}</span>
                </div>
                <div className="rounded-xl bg-slate-950/80 p-3 border border-slate-800">
                  <span className="text-xs text-slate-400 block">Waktu</span>
                  <span className="text-base sm:text-xl font-black text-amber-400">{Math.round(result.timeSpentSeconds / 60)}m</span>
                </div>
              </div>
            </div>

            {/* Analisis Topik Kuat vs Butuh Latihan */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl border border-emerald-500/30 bg-emerald-950/20 p-5 space-y-2.5">
                <h4 className="text-xs sm:text-sm font-bold text-emerald-400 flex items-center gap-1.5">
                  <span>✓</span> Topik yang Sudah Dikuasai
                </h4>
                {result.strongTopics.length > 0 ? (
                  <ul className="text-xs sm:text-sm text-slate-300 space-y-1.5">
                    {result.strongTopics.map((t, idx) => (
                      <li key={idx} className="flex items-center gap-2">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                        <span>{t}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-xs sm:text-sm text-slate-400">Pertahankan latihan untuk memperbanyak topik mahir.</p>
                )}
              </div>

              <div className="rounded-2xl border border-rose-500/30 bg-rose-950/20 p-5 space-y-2.5">
                <h4 className="text-xs sm:text-sm font-bold text-rose-400 flex items-center gap-1.5">
                  <span>⚠️</span> Topik yang Perlu Diperkuat
                </h4>
                {result.needsPracticeTopics.length > 0 ? (
                  <ul className="text-xs sm:text-sm text-slate-300 space-y-1.5">
                    {result.needsPracticeTopics.map((t, idx) => (
                      <li key={idx} className="flex items-center gap-2">
                        <span className="h-1.5 w-1.5 rounded-full bg-rose-400" />
                        <span>{t}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-xs sm:text-sm text-emerald-400">Luar biasa! Tidak ada topik dengan kesalahan mayor.</p>
                )}
              </div>
            </div>

            {/* Rincian Jawaban & Pembahasan */}
            <section className="space-y-3">
              <h3 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-400">
                Pembahasan Soal Ujian
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {result.questionBreakdown.map((item, idx) => (
                  <div
                    key={item.questionId}
                    className={`rounded-2xl border p-4 sm:p-5 space-y-3 ${
                      item.isCorrect
                        ? 'border-emerald-500/30 bg-slate-900/60'
                        : 'border-rose-500/30 bg-slate-900/90'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs sm:text-sm font-bold text-white">Soal #{idx + 1}</span>
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${
                          item.isCorrect
                            ? 'bg-emerald-500/20 text-emerald-400'
                            : 'bg-rose-500/20 text-rose-400'
                        }`}
                      >
                        {item.isCorrect ? '✓ Benar' : '✗ Belum Tepat'}
                      </span>
                    </div>

                    <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">{item.prompt}</p>

                    <div className="grid gap-1.5 text-xs rounded-xl bg-slate-950 p-3.5 border border-slate-800">
                      <div>
                        <span className="text-slate-400">Jawabanmu: </span>
                        <span className={item.isCorrect ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>
                          {item.studentAnswer.join(', ') || '(Kosong)'}
                        </span>
                      </div>
                      {!item.isCorrect && (
                        <div>
                          <span className="text-slate-400">Kunci Jawaban: </span>
                          <span className="text-emerald-400 font-bold">
                            {item.correctAnswer.join(', ')}
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="rounded-xl bg-indigo-950/30 p-3.5 border border-indigo-500/20 text-xs text-indigo-200 leading-relaxed">
                      <span className="font-bold text-indigo-300">💡 Pembahasan: </span>
                      {item.explanation}
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Tombol Aksi Akhir */}
            <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-slate-800">
              <Link
                to="/student/mistakes"
                className="flex-1 rounded-2xl border-b-2 border-rose-700 bg-rose-600 py-3.5 text-center text-xs sm:text-sm font-bold text-white shadow-md hover:bg-rose-500 transition-all flex items-center justify-center min-h-[48px]"
              >
                Review di Bank Kesalahan →
              </Link>
              <button
                type="button"
                onClick={() => setView('lobby')}
                className="flex-1 rounded-2xl border border-slate-700 bg-slate-800 py-3.5 text-center text-xs sm:text-sm font-bold text-slate-300 hover:bg-slate-700 cursor-pointer flex items-center justify-center min-h-[48px]"
              >
                Kembali ke Menu Ujian
              </button>
            </div>
          </main>
        </>
      )}
    </div>
  )
}
