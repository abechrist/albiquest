// Challenges & Play Modes Engine — Phase 8
// Sesuai prd.md §26–27, agent-prompt.md §59, dan DECISIONS.md (D-017).

import type { Question } from './domain.ts'

export type ChallengeModeType = 'boss_battle' | 'speed_round' | 'five_minute' | 'survival'

export interface BossBattleState {
  bossName: string
  bossAvatar: string
  bossMaxHp: number
  bossCurrentHp: number
  playerMaxHearts: number
  playerHearts: number
  questions: Question[]
  currentIndex: number
  isWon: boolean
  isGameOver: boolean
  xpReward: number
}

export interface SpeedRoundState {
  totalSeconds: number
  remainingSeconds: number
  correctCount: number
  comboStreak: number
  maxCombo: number
  score: number
  questions: Question[]
  currentIndex: number
  isFinished: boolean
}

export interface FiveMinuteSession {
  questions: Question[]
  currentIndex: number
  conceptRecap: {
    title: string
    snippet: string
    formula: string
  }
  isCompleted: boolean
  earnedXP: number
}

export interface SurvivalState {
  questions: Question[]
  currentIndex: number
  streakCount: number
  highestStreak: number
  isGameOver: boolean
  earnedXP: number
}

/**
 * Inisialisasi sesi Boss Battle
 */
export function initBossBattle(questions: Question[]): BossBattleState {
  // Ambil soal yang cocok (prioritas matematika aljabar & tingkat 2/3)
  const pool = questions.filter((q) => q.subjectId === 'matematika' || q.difficulty >= 2)
  const selected = (pool.length >= 4 ? pool : questions).slice(0, 5)

  return {
    bossName: 'Golem Aljabar Kuno',
    bossAvatar: '👹',
    bossMaxHp: 100,
    bossCurrentHp: 100,
    playerMaxHearts: 3,
    playerHearts: 3,
    questions: selected,
    currentIndex: 0,
    isWon: false,
    isGameOver: false,
    xpReward: 150,
  }
}

/**
 * Langkah evaluasi Boss Battle
 */
export function evaluateBossHit(
  state: BossBattleState,
  isCorrect: boolean,
): { nextState: BossBattleState; damageDealt: number; damageTaken: number } {
  if (state.isWon || state.isGameOver) {
    return { nextState: state, damageDealt: 0, damageTaken: 0 }
  }

  const damagePerHit = Math.ceil(state.bossMaxHp / state.questions.length)

  if (isCorrect) {
    const newBossHp = Math.max(0, state.bossCurrentHp - damagePerHit)
    const isWon = newBossHp <= 0 || state.currentIndex + 1 >= state.questions.length
    return {
      nextState: {
        ...state,
        bossCurrentHp: newBossHp,
        currentIndex: state.currentIndex + 1,
        isWon,
      },
      damageDealt: damagePerHit,
      damageTaken: 0,
    }
  } else {
    const newHearts = Math.max(0, state.playerHearts - 1)
    const isGameOver = newHearts <= 0
    return {
      nextState: {
        ...state,
        playerHearts: newHearts,
        currentIndex: state.currentIndex + 1,
        isGameOver,
      },
      damageDealt: 0,
      damageTaken: 1,
    }
  }
}

/**
 * Inisialisasi Speed Round 60 Detik
 */
export function initSpeedRound(questions: Question[], seconds: number = 60): SpeedRoundState {
  // Acak urutan soal
  const shuffled = [...questions].sort(() => 0.5 - Math.random())

  return {
    totalSeconds: seconds,
    remainingSeconds: seconds,
    correctCount: 0,
    comboStreak: 0,
    maxCombo: 0,
    score: 0,
    questions: shuffled,
    currentIndex: 0,
    isFinished: false,
  }
}

/**
 * Evaluasi jawaban Speed Round (tambah waktu + multiplier combo)
 */
export function evaluateSpeedRoundAnswer(
  state: SpeedRoundState,
  isCorrect: boolean,
): SpeedRoundState {
  if (state.isFinished) return state

  if (isCorrect) {
    const newCombo = state.comboStreak + 1
    const multiplier = newCombo >= 5 ? 2 : newCombo >= 3 ? 1.5 : 1
    const points = Math.round(20 * multiplier)
    const bonusSeconds = 5
    const newRemaining = Math.min(120, state.remainingSeconds + bonusSeconds)

    return {
      ...state,
      remainingSeconds: newRemaining,
      correctCount: state.correctCount + 1,
      comboStreak: newCombo,
      maxCombo: Math.max(state.maxCombo, newCombo),
      score: state.score + points,
      currentIndex: (state.currentIndex + 1) % state.questions.length,
    }
  } else {
    const penaltySeconds = 3
    const newRemaining = Math.max(0, state.remainingSeconds - penaltySeconds)

    return {
      ...state,
      remainingSeconds: newRemaining,
      comboStreak: 0,
      currentIndex: (state.currentIndex + 1) % state.questions.length,
      isFinished: newRemaining <= 0,
    }
  }
}

/**
 * Inisialisasi 5-Minute Express Mode (PRD §26)
 */
export function initFiveMinuteMode(questions: Question[]): FiveMinuteSession {
  const selected = questions.slice(0, 3)

  return {
    questions: selected,
    currentIndex: 0,
    conceptRecap: {
      title: 'Kilas Teori: Persamaan Kuadrat & Listrik Dinamis',
      snippet:
        'Akar persamaan kuadrat ax² + bx + c = 0 dapat ditentukan dengan pemfaktoran atau rumus ABC: x = (-b ± √(b² - 4ac)) / 2a.',
      formula: 'x₁,₂ = (-b ± √(D)) / (2a) di mana D = b² - 4ac',
    },
    isCompleted: false,
    earnedXP: 60,
  }
}

/**
 * Inisialisasi Survival Mode (Endless sampai salah 1)
 */
export function initSurvivalMode(questions: Question[]): SurvivalState {
  const shuffled = [...questions].sort(() => 0.5 - Math.random())

  return {
    questions: shuffled,
    currentIndex: 0,
    streakCount: 0,
    highestStreak: 0,
    isGameOver: false,
    earnedXP: 0,
  }
}

/**
 * Evaluasi langkah Survival Mode
 */
export function evaluateSurvivalStep(state: SurvivalState, isCorrect: boolean): SurvivalState {
  if (state.isGameOver) return state

  if (isCorrect) {
    const newStreak = state.streakCount + 1
    return {
      ...state,
      streakCount: newStreak,
      highestStreak: Math.max(state.highestStreak, newStreak),
      earnedXP: state.earnedXP + 25,
      currentIndex: (state.currentIndex + 1) % state.questions.length,
    }
  } else {
    return {
      ...state,
      isGameOver: true,
    }
  }
}
