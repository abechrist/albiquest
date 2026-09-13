// Halaman Arena Tantangan (Challenges & Play Modes) — Phase 8
// Sesuai prd.md §26–27, agent-prompt.md §59, dan Stitch adventure design tokens.

import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useProfile } from '../lib/auth'
import {
  evaluateBossHit,
  evaluateSpeedRoundAnswer,
  evaluateSurvivalStep,
  initBossBattle,
  initFiveMinuteMode,
  initSpeedRound,
  initSurvivalMode,
  type BossBattleState,
  type ChallengeModeType,
  type FiveMinuteSession,
  type SpeedRoundState,
  type SurvivalState,
} from '../lib/challenges'
import { recordQuestionResult } from '../lib/mistakes'
import { evaluateAnswer } from '../lib/question-evaluator'
import { useData } from '../lib/store'

export function ChallengesPage() {
  const { data } = useData()
  const { addXP } = useProfile()
  const questions = data?.questions ?? []

  // Active game mode state
  const [activeMode, setActiveMode] = useState<ChallengeModeType | null>(null)

  // Sub-states
  const [bossState, setBossState] = useState<BossBattleState | null>(null)
  const [speedState, setSpeedState] = useState<SpeedRoundState | null>(null)
  const [fiveMinState, setFiveMinState] = useState<FiveMinuteSession | null>(null)
  const [survivalState, setSurvivalState] = useState<SurvivalState | null>(null)

  // Answer selections
  const [selectedOption, setSelectedOption] = useState<string>('')
  const [feedbackEffect, setFeedbackEffect] = useState<'hit' | 'hurt' | null>(null)

  // Speed round countdown timer
  useEffect(() => {
    if (activeMode !== 'speed_round' || !speedState || speedState.isFinished) return

    const timer = setInterval(() => {
      setSpeedState((prev) => {
        if (!prev || prev.isFinished) return prev
        const remaining = prev.remainingSeconds - 1
        if (remaining <= 0) {
          clearInterval(timer)
          return { ...prev, remainingSeconds: 0, isFinished: true }
        }
        return { ...prev, remainingSeconds: remaining }
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [activeMode, speedState?.isFinished])

  // Start Boss Battle
  const handleStartBoss = () => {
    if (questions.length === 0) return
    const initial = initBossBattle(questions)
    setBossState(initial)
    setSelectedOption('')
    setActiveMode('boss_battle')
  }

  // Answer in Boss Battle
  const handleBossAnswer = () => {
    if (!bossState || !selectedOption) return
    const currentQ = bossState.questions[bossState.currentIndex]
    const isCorrect = evaluateAnswer(currentQ, [selectedOption])

    const { nextState } = evaluateBossHit(bossState, isCorrect)

    if (isCorrect) {
      setFeedbackEffect('hit')
      if (nextState.isWon) {
        addXP(nextState.xpReward)
      }
    } else {
      setFeedbackEffect('hurt')
      recordQuestionResult({
        question: currentQ,
        studentAnswer: [selectedOption],
        isCorrect: false,
      })
    }

    setTimeout(() => {
      setBossState(nextState)
      setSelectedOption('')
      setFeedbackEffect(null)
    }, 600)
  }

  // Start Speed Round
  const handleStartSpeed = () => {
    if (questions.length === 0) return
    setSpeedState(initSpeedRound(questions, 60))
    setSelectedOption('')
    setActiveMode('speed_round')
  }

  // Answer in Speed Round
  const handleSpeedAnswer = (answerOption: string) => {
    if (!speedState || speedState.isFinished) return
    const currentQ = speedState.questions[speedState.currentIndex]
    const isCorrect = evaluateAnswer(currentQ, [answerOption])

    const nextState = evaluateSpeedRoundAnswer(speedState, isCorrect)
    setSpeedState(nextState)

    if (isCorrect) {
      setFeedbackEffect('hit')
    } else {
      setFeedbackEffect('hurt')
      recordQuestionResult({
        question: currentQ,
        studentAnswer: [answerOption],
        isCorrect: false,
      })
    }

    setTimeout(() => setFeedbackEffect(null), 300)
  }

  // Start 5-Minute Express Mode
  const handleStartFiveMin = () => {
    if (questions.length === 0) return
    setFiveMinState(initFiveMinuteMode(questions))
    setSelectedOption('')
    setActiveMode('five_minute')
  }

  // Answer in 5-Minute Mode
  const handleFiveMinAnswer = () => {
    if (!fiveMinState || !selectedOption) return
    const currentQ = fiveMinState.questions[fiveMinState.currentIndex]
    const isCorrect = evaluateAnswer(currentQ, [selectedOption])

    if (!isCorrect) {
      recordQuestionResult({
        question: currentQ,
        studentAnswer: [selectedOption],
        isCorrect: false,
      })
    }

    const nextIdx = fiveMinState.currentIndex + 1
    const isCompleted = nextIdx >= fiveMinState.questions.length

    if (isCompleted) {
      addXP(fiveMinState.earnedXP)
    }

    setFiveMinState({
      ...fiveMinState,
      currentIndex: nextIdx,
      isCompleted,
    })
    setSelectedOption('')
  }

  // Start Survival Mode
  const handleStartSurvival = () => {
    if (questions.length === 0) return
    setSurvivalState(initSurvivalMode(questions))
    setSelectedOption('')
    setActiveMode('survival')
  }

  // Answer in Survival Mode
  const handleSurvivalAnswer = (answerOption: string) => {
    if (!survivalState || survivalState.isGameOver) return
    const currentQ = survivalState.questions[survivalState.currentIndex]
    const isCorrect = evaluateAnswer(currentQ, [answerOption])

    const nextState = evaluateSurvivalStep(survivalState, isCorrect)
    if (isCorrect) {
      addXP(25)
      setFeedbackEffect('hit')
    } else {
      setFeedbackEffect('hurt')
      recordQuestionResult({
        question: currentQ,
        studentAnswer: [answerOption],
        isCorrect: false,
      })
    }

    setSurvivalState(nextState)
    setTimeout(() => setFeedbackEffect(null), 300)
  }

  const exitMode = useCallback(() => {
    setActiveMode(null)
    setBossState(null)
    setSpeedState(null)
    setFiveMinState(null)
    setSurvivalState(null)
  }, [])

  return (
    <div className="min-h-screen bg-slate-950 pb-24 text-slate-100 selection:bg-amber-500/30">
      {/* Header */}
      <header className="sticky top-0 z-30 border-b border-slate-800/80 bg-slate-900/90 px-4 py-3.5 backdrop-blur-md">
        <div className="mx-auto flex max-w-4xl items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={activeMode ? exitMode : undefined}
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-700 bg-slate-800 text-slate-300 transition-colors hover:bg-slate-700"
              title={activeMode ? 'Keluar Mode' : 'Kembali'}
            >
              {activeMode ? '✕' : <Link to="/student">←</Link>}
            </button>
            <div>
              <h1 className="text-lg font-bold tracking-tight text-white flex items-center gap-2">
                <span>⚔️ Arena Tantangan Petualang</span>
              </h1>
              <p className="text-xs text-slate-400">
                {activeMode
                  ? 'Tantangan sedang berlangsung!'
                  : 'Pilih mode permainan dan uji ketangkasan belajarmu'}
              </p>
            </div>
          </div>

          <Link
            to="/student"
            className="rounded-xl border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs font-semibold text-slate-300 hover:bg-slate-700 transition-colors"
          >
            Beranda
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 pt-6">
        {/* ========================================================================= */}
        {/* VIEW 1: HUB PILIHAN MODE TANTANGAN                                        */}
        {/* ========================================================================= */}
        {!activeMode && (
          <div className="space-y-6">
            {/* Banner Utama */}
            <div className="relative overflow-hidden rounded-3xl border border-amber-500/30 bg-gradient-to-br from-amber-950/80 via-slate-900 to-slate-950 p-6 shadow-2xl">
              <div className="relative z-10">
                <div className="inline-flex items-center gap-1.5 rounded-full border border-amber-400/30 bg-amber-500/10 px-3 py-1 text-xs font-semibold text-amber-300">
                  <span>⚡ Duolingo + RPG Adventure Mode</span>
                </div>
                <h2 className="mt-2 text-2xl font-black text-white">
                  Tantang Batas Kemampuanmu!
                </h2>
                <p className="mt-1 text-xs text-slate-300 max-w-lg">
                  Setiap kemenangan di arena tantangan menguji refleks berpikir, memperkuat ingatan konsep, dan memberikan limpahan reward XP besar.
                </p>
              </div>
            </div>

            {/* Grid 4 Kartu Mode Permainan */}
            <div className="grid gap-4 sm:grid-cols-2">
              {/* 1. Boss Battle Aljabar */}
              <div className="group relative flex flex-col justify-between overflow-hidden rounded-3xl border-2 border-rose-600/40 bg-gradient-to-br from-rose-950/30 via-slate-900 to-slate-950 p-5 shadow-lg transition-all hover:border-rose-500 hover:shadow-rose-900/20">
                <div>
                  <div className="flex items-start justify-between">
                    <span className="text-4xl">👹</span>
                    <span className="rounded-full bg-rose-500/20 px-2.5 py-0.5 text-xs font-black text-rose-400 border border-rose-500/30">
                      +150 XP ⭐
                    </span>
                  </div>
                  <h3 className="mt-3 text-lg font-black text-white group-hover:text-rose-300 transition-colors">
                    Boss Battle: Golem Aljabar
                  </h3>
                  <p className="mt-1 text-xs text-slate-400 leading-relaxed">
                    Kalahkan penjaga gerbang aljabar kuno dengan menjawab 5 soal berturut-turut. Jaga 3 hatimu agar tidak kalah!
                  </p>
                </div>
                <div className="mt-5 border-t border-slate-800 pt-3 flex items-center justify-between">
                  <span className="text-[11px] text-slate-400">100 HP Boss • 3 Nyawa</span>
                  <button
                    type="button"
                    onClick={handleStartBoss}
                    className="rounded-xl border-b-2 border-rose-700 bg-rose-600 px-4 py-2 text-xs font-black text-white shadow-md transition-all hover:bg-rose-500 active:translate-y-0.5"
                  >
                    Lawan Boss ⚔️
                  </button>
                </div>
              </div>

              {/* 2. Speed Round / Quiz Rush 60s */}
              <div className="group relative flex flex-col justify-between overflow-hidden rounded-3xl border-2 border-amber-500/40 bg-gradient-to-br from-amber-950/30 via-slate-900 to-slate-950 p-5 shadow-lg transition-all hover:border-amber-400 hover:shadow-amber-900/20">
                <div>
                  <div className="flex items-start justify-between">
                    <span className="text-4xl">⚡</span>
                    <span className="rounded-full bg-amber-500/20 px-2.5 py-0.5 text-xs font-black text-amber-400 border border-amber-500/30">
                      Combo 2.0x 🔥
                    </span>
                  </div>
                  <h3 className="mt-3 text-lg font-black text-white group-hover:text-amber-300 transition-colors">
                    Speed Round (Quiz Rush 60s)
                  </h3>
                  <p className="mt-1 text-xs text-slate-400 leading-relaxed">
                    Adu kecepatan berpikir dalam 60 detik! Tiap jawaban tepat memberi bonus +5 detik dan multiplier poin kombo.
                  </p>
                </div>
                <div className="mt-5 border-t border-slate-800 pt-3 flex items-center justify-between">
                  <span className="text-[11px] text-slate-400">60 Detik • Time Attack</span>
                  <button
                    type="button"
                    onClick={handleStartSpeed}
                    className="rounded-xl border-b-2 border-amber-600 bg-amber-500 px-4 py-2 text-xs font-black text-amber-950 shadow-md transition-all hover:bg-amber-400 active:translate-y-0.5"
                  >
                    Mulai Rush ⏱️
                  </button>
                </div>
              </div>

              {/* 3. 5-Minute Express Mode */}
              <div className="group relative flex flex-col justify-between overflow-hidden rounded-3xl border-2 border-indigo-500/40 bg-gradient-to-br from-indigo-950/30 via-slate-900 to-slate-950 p-5 shadow-lg transition-all hover:border-indigo-400 hover:shadow-indigo-900/20">
                <div>
                  <div className="flex items-start justify-between">
                    <span className="text-4xl">⏱️</span>
                    <span className="rounded-full bg-indigo-500/20 px-2.5 py-0.5 text-xs font-black text-indigo-300 border border-indigo-500/30">
                      +60 XP
                    </span>
                  </div>
                  <h3 className="mt-3 text-lg font-black text-white group-hover:text-indigo-300 transition-colors">
                    5-Minute Express (PRD §26)
                  </h3>
                  <p className="mt-1 text-xs text-slate-400 leading-relaxed">
                    Waktu sempit? Tuntaskan 2 soal inti + 1 kilas konsep cepat untuk mengamankan streak harian tanpa beban.
                  </p>
                </div>
                <div className="mt-5 border-t border-slate-800 pt-3 flex items-center justify-between">
                  <span className="text-[11px] text-slate-400">Microlearning Ringkas</span>
                  <button
                    type="button"
                    onClick={handleStartFiveMin}
                    className="rounded-xl border-b-2 border-indigo-700 bg-indigo-600 px-4 py-2 text-xs font-black text-white shadow-md transition-all hover:bg-indigo-500 active:translate-y-0.5"
                  >
                    Mulai 5 Menit ☕
                  </button>
                </div>
              </div>

              {/* 4. Survival Mode (Sudden Death) */}
              <div className="group relative flex flex-col justify-between overflow-hidden rounded-3xl border-2 border-emerald-500/40 bg-gradient-to-br from-emerald-950/30 via-slate-900 to-slate-950 p-5 shadow-lg transition-all hover:border-emerald-400 hover:shadow-emerald-900/20">
                <div>
                  <div className="flex items-start justify-between">
                    <span className="text-4xl">🛡️</span>
                    <span className="rounded-full bg-emerald-500/20 px-2.5 py-0.5 text-xs font-black text-emerald-400 border border-emerald-500/30">
                      Endless
                    </span>
                  </div>
                  <h3 className="mt-3 text-lg font-black text-white group-hover:text-emerald-300 transition-colors">
                    Survival Mode (Sudden Death)
                  </h3>
                  <p className="mt-1 text-xs text-slate-400 leading-relaxed">
                    Uji ketahanan mental. Berapa banyak soal berturut-turut yang dapat kamu selesaikan sebelum salah sekali saja?
                  </p>
                </div>
                <div className="mt-5 border-t border-slate-800 pt-3 flex items-center justify-between">
                  <span className="text-[11px] text-slate-400">1 Nyawa Saja</span>
                  <button
                    type="button"
                    onClick={handleStartSurvival}
                    className="rounded-xl border-b-2 border-emerald-700 bg-emerald-600 px-4 py-2 text-xs font-black text-white shadow-md transition-all hover:bg-emerald-500 active:translate-y-0.5"
                  >
                    Mulai Survival 🛡️
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* VIEW 2: ARENA BOSS BATTLE                                                 */}
        {/* ========================================================================= */}
        {activeMode === 'boss_battle' && bossState && (
          <div className="space-y-6">
            {/* Arena Header: Boss Status vs Player Hearts */}
            <div
              className={`rounded-3xl border border-rose-500/30 bg-slate-900/90 p-5 shadow-2xl transition-all ${
                feedbackEffect === 'hit' ? 'scale-95 bg-rose-950/40 border-rose-400' : ''
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                {/* Boss info */}
                <div className="flex items-center gap-3">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-500/20 text-3xl border border-rose-500/40 animate-pulse">
                    {bossState.bossAvatar}
                  </div>
                  <div>
                    <h3 className="text-base font-black text-white">{bossState.bossName}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="w-36 h-3 rounded-full bg-slate-800 overflow-hidden border border-slate-700">
                        <div
                          className="h-full bg-gradient-to-r from-rose-600 to-amber-500 transition-all duration-300"
                          style={{ width: `${bossState.bossCurrentHp}%` }}
                        />
                      </div>
                      <span className="text-xs font-bold text-rose-400">
                        {bossState.bossCurrentHp} HP
                      </span>
                    </div>
                  </div>
                </div>

                {/* Player Hearts */}
                <div className="flex items-center gap-2 rounded-2xl bg-slate-950/80 px-4 py-2 border border-slate-800">
                  <span className="text-xs font-bold text-slate-400">Nyawamu:</span>
                  <div className="flex gap-1 text-lg">
                    {Array.from({ length: bossState.playerMaxHearts }).map((_, i) => (
                      <span key={i} className={i < bossState.playerHearts ? 'opacity-100' : 'opacity-20 grayscale'}>
                        ❤️
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Victory / Defeat Screen */}
            {bossState.isWon ? (
              <div className="rounded-3xl border-2 border-emerald-500 bg-slate-900 p-8 text-center space-y-4 shadow-2xl">
                <span className="text-6xl animate-bounce inline-block">🏆</span>
                <h3 className="text-2xl font-black text-white">BOSS BERHASIL DIKALAHKAN!</h3>
                <p className="text-sm text-slate-300 max-w-md mx-auto">
                  Ketangkasan berpikirmu menghancurkan Golem Aljabar Kuno! Kamu berhak atas bonus kelulusan arena.
                </p>
                <div className="inline-flex items-center gap-2 rounded-full bg-emerald-500/20 px-4 py-1.5 text-sm font-black text-emerald-400 border border-emerald-500/40">
                  +{bossState.xpReward} XP Ditambahkan ke Profil! ⭐
                </div>
                <div className="pt-4">
                  <button
                    type="button"
                    onClick={exitMode}
                    className="rounded-2xl border-b-4 border-emerald-700 bg-emerald-500 px-6 py-3 text-sm font-black text-white hover:bg-emerald-400 active:translate-y-1 shadow-lg"
                  >
                    Kembali ke Arena Tantangan
                  </button>
                </div>
              </div>
            ) : bossState.isGameOver ? (
              <div className="rounded-3xl border-2 border-rose-500 bg-slate-900 p-8 text-center space-y-4 shadow-2xl">
                <span className="text-6xl inline-block">💀</span>
                <h3 className="text-2xl font-black text-rose-400">KAMU KEHABISAN HATI!</h3>
                <p className="text-sm text-slate-300 max-w-md mx-auto">
                  Jangan putus asa! Kesalahan telah tersimpan di Bank Salah untuk kamu review dan taklukkan kembali.
                </p>
                <div className="pt-4 flex justify-center gap-3">
                  <button
                    type="button"
                    onClick={handleStartBoss}
                    className="rounded-2xl border-b-4 border-rose-700 bg-rose-600 px-5 py-2.5 text-xs font-black text-white hover:bg-rose-500 active:translate-y-1"
                  >
                    Coba Lagi ⚔️
                  </button>
                  <button
                    type="button"
                    onClick={exitMode}
                    className="rounded-2xl border border-slate-700 bg-slate-800 px-5 py-2.5 text-xs font-bold text-slate-300 hover:bg-slate-700"
                  >
                    Keluar
                  </button>
                </div>
              </div>
            ) : (
              /* Soal Pertarungan */
              <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6 space-y-5">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span>
                    Serangan #{bossState.currentIndex + 1} dari {bossState.questions.length}
                  </span>
                  <span className="rounded-md bg-indigo-500/20 px-2 py-0.5 text-indigo-300 font-bold">
                    Tingkat {bossState.questions[bossState.currentIndex]?.difficulty}
                  </span>
                </div>

                <div className="rounded-2xl bg-slate-950 p-4 border border-slate-800">
                  <p className="text-sm font-semibold text-white leading-relaxed">
                    {bossState.questions[bossState.currentIndex]?.prompt}
                  </p>
                </div>

                {/* Opsi Jawaban */}
                <div className="grid gap-2.5">
                  {bossState.questions[bossState.currentIndex]?.options.map((opt, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setSelectedOption(opt)}
                      className={`flex items-center gap-3 w-full rounded-2xl p-3.5 text-left text-xs font-bold transition-all ${
                        selectedOption === opt
                          ? 'border-2 border-rose-500 bg-rose-950/40 text-white shadow-[0_3px_0_0_#be123c]'
                          : 'border border-slate-800 bg-slate-950/60 text-slate-300 hover:border-slate-700'
                      }`}
                    >
                      <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-slate-800 text-[11px] font-black text-slate-300">
                        {String.fromCharCode(65 + idx)}
                      </span>
                      <span>{opt}</span>
                    </button>
                  ))}
                </div>

                <button
                  type="button"
                  disabled={!selectedOption}
                  onClick={handleBossAnswer}
                  className="w-full rounded-2xl border-b-4 border-rose-700 bg-rose-600 py-3 text-xs font-black text-white shadow-lg transition-all hover:bg-rose-500 active:translate-y-1 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Lepaskan Serangan! 💥
                </button>
              </div>
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* VIEW 3: SPEED ROUND (QUIZ RUSH 60s)                                       */}
        {/* ========================================================================= */}
        {activeMode === 'speed_round' && speedState && (
          <div className="space-y-6">
            {/* Speed Bar: Timer & Combo Counter */}
            <div className="rounded-3xl border border-amber-500/30 bg-slate-900 p-5 shadow-2xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-3xl animate-pulse">⏱️</span>
                  <div>
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                      Waktu Tersisa
                    </span>
                    <p className={`text-2xl font-black ${speedState.remainingSeconds <= 10 ? 'text-rose-500 animate-ping' : 'text-amber-400'}`}>
                      {speedState.remainingSeconds} Detik
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 font-bold uppercase">Combo</span>
                    <p className="text-xl font-black text-amber-300">
                      {speedState.comboStreak}x 🔥
                    </p>
                  </div>
                  <div className="rounded-2xl bg-amber-500/20 px-3 py-2 border border-amber-500/30 text-center">
                    <span className="text-[10px] text-amber-300 font-bold block">Skor</span>
                    <span className="text-lg font-black text-white">{speedState.score}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Selesai / Game Active */}
            {speedState.isFinished ? (
              <div className="rounded-3xl border-2 border-amber-500 bg-slate-900 p-8 text-center space-y-4 shadow-2xl">
                <span className="text-6xl inline-block">⌛</span>
                <h3 className="text-2xl font-black text-white">WAKTU HABIS!</h3>
                <p className="text-sm text-slate-300 max-w-md mx-auto">
                  Sesi Quiz Rush 60 detik selesai dengan total {speedState.correctCount} jawaban tepat!
                </p>
                <div className="grid grid-cols-2 gap-3 max-w-xs mx-auto text-left">
                  <div className="rounded-xl bg-slate-950 p-3 border border-slate-800">
                    <span className="text-[10px] text-slate-400">Total Skor</span>
                    <p className="text-lg font-black text-amber-400">{speedState.score}</p>
                  </div>
                  <div className="rounded-xl bg-slate-950 p-3 border border-slate-800">
                    <span className="text-[10px] text-slate-400">Max Combo</span>
                    <p className="text-lg font-black text-emerald-400">{speedState.maxCombo}x 🔥</p>
                  </div>
                </div>
                <div className="pt-4 flex justify-center gap-3">
                  <button
                    type="button"
                    onClick={handleStartSpeed}
                    className="rounded-2xl border-b-4 border-amber-600 bg-amber-500 px-5 py-2.5 text-xs font-black text-amber-950 hover:bg-amber-400 active:translate-y-1"
                  >
                    Main Lagi ⚡
                  </button>
                  <button
                    type="button"
                    onClick={exitMode}
                    className="rounded-2xl border border-slate-700 bg-slate-800 px-5 py-2.5 text-xs font-bold text-slate-300 hover:bg-slate-700"
                  >
                    Keluar
                  </button>
                </div>
              </div>
            ) : (
              <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6 space-y-5">
                <div className="rounded-2xl bg-slate-950 p-4 border border-slate-800">
                  <p className="text-sm font-semibold text-white leading-relaxed">
                    {speedState.questions[speedState.currentIndex]?.prompt}
                  </p>
                </div>

                <div className="grid gap-2.5 sm:grid-cols-2">
                  {speedState.questions[speedState.currentIndex]?.options.map((opt, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleSpeedAnswer(opt)}
                      className="flex items-center gap-3 w-full rounded-2xl border border-slate-800 bg-slate-950 p-4 text-left text-xs font-bold text-slate-200 transition-all hover:border-amber-400 hover:bg-amber-950/20 active:scale-98"
                    >
                      <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-slate-800 text-[11px] font-black text-amber-400">
                        {String.fromCharCode(65 + idx)}
                      </span>
                      <span>{opt}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* VIEW 4: 5-MINUTE EXPRESS MODE                                             */}
        {/* ========================================================================= */}
        {activeMode === 'five_minute' && fiveMinState && (
          <div className="space-y-6">
            <div className="rounded-3xl border border-indigo-500/30 bg-slate-900 p-5">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold text-indigo-300 uppercase tracking-wider">
                    Express Daily Workout (PRD §26)
                  </span>
                  <h3 className="text-base font-black text-white">Kilas Belajar Cepat</h3>
                </div>
                <span className="rounded-full bg-indigo-500/20 px-3 py-1 text-xs font-bold text-indigo-300">
                  {fiveMinState.isCompleted ? 'Selesai' : `Langkah ${fiveMinState.currentIndex + 1} dari 3`}
                </span>
              </div>
            </div>

            {fiveMinState.isCompleted ? (
              <div className="rounded-3xl border-2 border-indigo-500 bg-slate-900 p-8 text-center space-y-4 shadow-2xl">
                <span className="text-6xl inline-block">✨</span>
                <h3 className="text-2xl font-black text-white">5 MENIT TUNTAS!</h3>
                <p className="text-sm text-slate-300 max-w-md mx-auto">
                  Konsistensimu luar biasa! Streak harianmu tetap terjaga dan pemahaman konsepmu semakin terasah.
                </p>

                {/* Kartu Kilas Teori Ringkas */}
                <div className="rounded-2xl bg-slate-950 p-4 border border-indigo-500/30 text-left space-y-2 max-w-md mx-auto">
                  <h4 className="text-xs font-bold text-amber-300">
                    💡 {fiveMinState.conceptRecap.title}
                  </h4>
                  <p className="text-xs text-slate-300">{fiveMinState.conceptRecap.snippet}</p>
                  <div className="rounded-lg bg-indigo-950/60 p-2 text-[11px] font-mono text-indigo-300">
                    {fiveMinState.conceptRecap.formula}
                  </div>
                </div>

                <div className="inline-flex items-center gap-2 rounded-full bg-indigo-500/20 px-4 py-1.5 text-sm font-black text-indigo-300 border border-indigo-500/40">
                  +{fiveMinState.earnedXP} XP Telah Diklaim! ⭐
                </div>

                <div className="pt-4">
                  <button
                    type="button"
                    onClick={exitMode}
                    className="rounded-2xl border-b-4 border-indigo-700 bg-indigo-600 px-6 py-3 text-sm font-black text-white hover:bg-indigo-500 active:translate-y-1 shadow-lg"
                  >
                    Selesai & Lanjutkan Petualangan
                  </button>
                </div>
              </div>
            ) : (
              <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6 space-y-5">
                <div className="rounded-2xl bg-slate-950 p-4 border border-slate-800">
                  <p className="text-sm font-semibold text-white leading-relaxed">
                    {fiveMinState.questions[fiveMinState.currentIndex]?.prompt}
                  </p>
                </div>

                <div className="grid gap-2.5">
                  {fiveMinState.questions[fiveMinState.currentIndex]?.options.map((opt, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setSelectedOption(opt)}
                      className={`flex items-center gap-3 w-full rounded-2xl p-3.5 text-left text-xs font-bold transition-all ${
                        selectedOption === opt
                          ? 'border-2 border-indigo-500 bg-indigo-950/40 text-white shadow-[0_3px_0_0_#4338ca]'
                          : 'border border-slate-800 bg-slate-950/60 text-slate-300 hover:border-slate-700'
                      }`}
                    >
                      <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-slate-800 text-[11px] font-black text-slate-300">
                        {String.fromCharCode(65 + idx)}
                      </span>
                      <span>{opt}</span>
                    </button>
                  ))}
                </div>

                <button
                  type="button"
                  disabled={!selectedOption}
                  onClick={handleFiveMinAnswer}
                  className="w-full rounded-2xl border-b-4 border-indigo-700 bg-indigo-600 py-3 text-xs font-black text-white shadow-lg transition-all hover:bg-indigo-500 active:translate-y-1 disabled:opacity-40"
                >
                  Lanjut Langkah Berikutnya →
                </button>
              </div>
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* VIEW 5: SURVIVAL MODE (SUDDEN DEATH)                                      */}
        {/* ========================================================================= */}
        {activeMode === 'survival' && survivalState && (
          <div className="space-y-6">
            <div className="rounded-3xl border border-emerald-500/30 bg-slate-900 p-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">🛡️</span>
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Survival Mode</span>
                    <h3 className="text-sm font-black text-white">Bertahan Tanpa Kesalahan</h3>
                  </div>
                </div>
                <div className="flex items-center gap-2 rounded-2xl bg-emerald-500/10 px-3 py-1.5 border border-emerald-500/30">
                  <span className="text-xs font-bold text-emerald-400">Streak:</span>
                  <span className="text-lg font-black text-emerald-300">{survivalState.streakCount} 🔥</span>
                </div>
              </div>
            </div>

            {survivalState.isGameOver ? (
              <div className="rounded-3xl border-2 border-rose-500 bg-slate-900 p-8 text-center space-y-4 shadow-2xl">
                <span className="text-6xl inline-block">💥</span>
                <h3 className="text-2xl font-black text-rose-400">RUN BERAKHIR!</h3>
                <p className="text-sm text-slate-300 max-w-md mx-auto">
                  Satu kesalahan mengakhiri percobaanmu. Rekor streak tertinggimu:
                </p>
                <div className="inline-flex items-center gap-2 rounded-2xl bg-slate-950 px-6 py-3 border border-slate-800">
                  <span className="text-2xl font-black text-amber-400">{survivalState.highestStreak}</span>
                  <span className="text-xs font-bold text-slate-400">Soal Berturut-turut</span>
                </div>
                <div className="pt-4 flex justify-center gap-3">
                  <button
                    type="button"
                    onClick={handleStartSurvival}
                    className="rounded-2xl border-b-4 border-emerald-700 bg-emerald-600 px-5 py-2.5 text-xs font-black text-white hover:bg-emerald-500 active:translate-y-1"
                  >
                    Ulangi Run 🛡️
                  </button>
                  <button
                    type="button"
                    onClick={exitMode}
                    className="rounded-2xl border border-slate-700 bg-slate-800 px-5 py-2.5 text-xs font-bold text-slate-300 hover:bg-slate-700"
                  >
                    Keluar
                  </button>
                </div>
              </div>
            ) : (
              <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6 space-y-5">
                <div className="rounded-2xl bg-slate-950 p-4 border border-slate-800">
                  <p className="text-sm font-semibold text-white leading-relaxed">
                    {survivalState.questions[survivalState.currentIndex]?.prompt}
                  </p>
                </div>

                <div className="grid gap-2.5 sm:grid-cols-2">
                  {survivalState.questions[survivalState.currentIndex]?.options.map((opt, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleSurvivalAnswer(opt)}
                      className="flex items-center gap-3 w-full rounded-2xl border border-slate-800 bg-slate-950 p-4 text-left text-xs font-bold text-slate-200 transition-all hover:border-emerald-400 hover:bg-emerald-950/20 active:scale-98"
                    >
                      <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-slate-800 text-[11px] font-black text-emerald-400">
                        {String.fromCharCode(65 + idx)}
                      </span>
                      <span>{opt}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  )
}
