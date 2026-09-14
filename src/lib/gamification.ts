// Centralized Gamification Service — Phase 6
// Mengelola Leveling, Streak, Lencana/Badges, Misi Harian, dan Reward.
// Sesuai prd.md §13 & §15, agent-prompt.md §57, dan Stitch student_dashboard_peta_petualangan.

import { useCallback, useEffect, useMemo, useState } from 'react'

export interface Badge {
  id: string
  title: string
  description: string
  icon: string
  category: 'learning' | 'streak' | 'mastery' | 'practice'
  unlockedAt?: number
}

export interface Mission {
  id: string
  title: string
  description: string
  rewardXP: number
  target: number
  current: number
  isClaimed: boolean
  icon: string
}

export interface GamificationState {
  streakDays: number
  lastActiveDate: string // YYYY-MM-DD
  unlockedBadges: Record<string, number> // badgeId -> timestamp
  claimedMissions: Record<string, boolean> // missionKey -> boolean
  questionsAnsweredCount: number
  lessonsCompletedCount: number
  mistakesMasteredCount: number
}

const STORAGE_KEY = 'pla.gamification.v1'
const GAMIFICATION_EVENT = 'pla:gamification-updated'

// Daftar master seluruh Badge / Pencapaian dalam game
export const MASTER_BADGES: Badge[] = [
  {
    id: 'badge-first-step',
    title: 'Langkah Pertama',
    description: 'Selesaikan 1 pelajaran pertamamu.',
    icon: '🌱',
    category: 'learning',
  },
  {
    id: 'badge-practice-hero',
    title: 'Pejuang Latihan',
    description: 'Jawab 5 soal dengan benar di Arena Latihan.',
    icon: '⚡',
    category: 'practice',
  },
  {
    id: 'badge-error-conqueror',
    title: 'Penakluk Kesalahan',
    description: 'Kuasai kembali 2 soal dari Bank Salah.',
    icon: '🧠',
    category: 'mastery',
  },
  {
    id: 'badge-streak-fire',
    title: 'Api Konsistensi',
    description: 'Capai streak belajar berturut-turut minimal 3 hari.',
    icon: '🔥',
    category: 'streak',
  },
  {
    id: 'badge-algebra-master',
    title: 'Master Aljabar',
    description: 'Selesaikan materi pemfaktoran persamaan kuadrat.',
    icon: '🏆',
    category: 'mastery',
  },
  {
    id: 'badge-centurion',
    title: 'Petualang Sejati',
    description: 'Kumpulkan total akumulasi 1.500 XP.',
    icon: '👑',
    category: 'learning',
  },
]

function getTodayString(): string {
  const d = new Date()
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function getDefaultState(): GamificationState {
  return {
    streakDays: 0,
    lastActiveDate: '',
    unlockedBadges: {},
    claimedMissions: {},
    questionsAnsweredCount: 0,
    lessonsCompletedCount: 0,
    mistakesMasteredCount: 0,
  }
}

// In-memory fallback untuk environment non-browser
let memoryState: GamificationState = getDefaultState()

export function getActiveStudentId(): string {
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

export function getStoredGamificationState(studentId?: string): GamificationState {
  if (typeof window === 'undefined' || typeof window.localStorage === 'undefined') {
    return memoryState
  }
  const sid = studentId || getActiveStudentId()
  const key = `pla.gamification_${sid}.v1`
  try {
    const raw =
      window.localStorage.getItem(key) ||
      (sid === 'albert' ? window.localStorage.getItem(STORAGE_KEY) : null)
    if (!raw) {
      const initial = getDefaultState()
      saveGamificationState(initial, sid)
      return initial
    }
    const parsed = JSON.parse(raw)
    return { ...getDefaultState(), ...parsed }
  } catch {
    return getDefaultState()
  }
}

export function saveGamificationState(state: GamificationState, studentId?: string): void {
  if (typeof window === 'undefined' || typeof window.localStorage === 'undefined') {
    memoryState = state
    return
  }
  const sid = studentId || getActiveStudentId()
  const key = `pla.gamification_${sid}.v1`
  try {
    window.localStorage.setItem(key, JSON.stringify(state))
    if (sid === 'albert') {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
    }
    window.dispatchEvent(new Event(GAMIFICATION_EVENT))
  } catch (err) {
    console.error('Gagal menyimpan state gamifikasi:', err)
  }
}

/** Hitung Level & Gelar Petualang berdasarkan XP */
export function calculateLevel(xp: number): {
  level: number
  title: string
  currentLevelXP: number
  nextLevelXP: number
  progressPct: number
  xpRemaining: number
} {
  const XP_PER_LEVEL = 250
  const level = Math.max(1, Math.floor(xp / XP_PER_LEVEL) + 1)
  const currentLevelXP = xp % XP_PER_LEVEL
  const nextLevelXP = XP_PER_LEVEL
  const progressPct = Math.min(100, Math.round((currentLevelXP / nextLevelXP) * 100))
  const xpRemaining = nextLevelXP - currentLevelXP

  let title = 'Pengelana Pemula'
  if (level >= 10) title = 'Ksatria Cendekia'
  else if (level >= 7) title = 'Master Numerasi'
  else if (level >= 4) title = 'Penjelajah Logika'
  else if (level >= 2) title = 'Pencari Jejak'

  return {
    level,
    title,
    currentLevelXP,
    nextLevelXP,
    progressPct,
    xpRemaining,
  }
}

/** Perbarui streak harian saat siswa melakukan aktivitas belajar */
export function touchDailyStreak(state = getStoredGamificationState()): GamificationState {
  const today = getTodayString()
  if (state.lastActiveDate === today) {
    return state
  }

  const last = new Date(state.lastActiveDate)
  const now = new Date(today)
  const diffDays = Math.round((now.getTime() - last.getTime()) / (1000 * 60 * 60 * 24))

  let newStreak = state.streakDays
  if (diffDays === 1) {
    newStreak += 1
  } else if (diffDays > 1) {
    newStreak = 1
  }

  const updated: GamificationState = {
    ...state,
    streakDays: newStreak,
    lastActiveDate: today,
  }
  saveGamificationState(updated)
  return updated
}

/** Catat event aktivitas belajar dan periksa unlock badges otomatis */
export function recordGamificationEvent(
  event:
    | { type: 'lesson_completed' }
    | { type: 'question_answered'; isCorrect: boolean }
    | { type: 'mistake_mastered' },
  currentXP = 0,
  studentId?: string,
): { state: GamificationState; newlyUnlockedBadges: Badge[] } {
  const sid = studentId || getActiveStudentId()
  let state = touchDailyStreak(getStoredGamificationState(sid))

  let qCount = state.questionsAnsweredCount
  let lCount = state.lessonsCompletedCount
  let mCount = state.mistakesMasteredCount

  if (event.type === 'question_answered' && event.isCorrect) qCount += 1
  if (event.type === 'lesson_completed') lCount += 1
  if (event.type === 'mistake_mastered') mCount += 1

  const unlocked = { ...state.unlockedBadges }
  const newlyUnlockedBadges: Badge[] = []

  const tryUnlock = (badgeId: string) => {
    if (!unlocked[badgeId]) {
      unlocked[badgeId] = Date.now()
      const b = MASTER_BADGES.find((x) => x.id === badgeId)
      if (b) newlyUnlockedBadges.push({ ...b, unlockedAt: unlocked[badgeId] })
    }
  }

  if (lCount >= 1) tryUnlock('badge-first-step')
  if (qCount >= 5) tryUnlock('badge-practice-hero')
  if (mCount >= 2) tryUnlock('badge-error-conqueror')
  if (state.streakDays >= 3) tryUnlock('badge-streak-fire')
  if (lCount >= 2) tryUnlock('badge-algebra-master')
  if (currentXP >= 1500) tryUnlock('badge-centurion')

  const updated: GamificationState = {
    ...state,
    questionsAnsweredCount: qCount,
    lessonsCompletedCount: lCount,
    mistakesMasteredCount: mCount,
    unlockedBadges: unlocked,
  }

  saveGamificationState(updated, sid)
  return { state: updated, newlyUnlockedBadges }
}

/** Buat / sinkronkan daftar Misi Harian hari ini */
export function getDailyMissions(state = getStoredGamificationState()): Mission[] {
  const today = getTodayString()

  return [
    {
      id: `${today}-m1`,
      title: 'Selesaikan 2 Pelajaran',
      description: 'Pelajari materi baru untuk menambah wawasan.',
      rewardXP: 50,
      target: 2,
      current: Math.min(2, state.lessonsCompletedCount),
      isClaimed: !!state.claimedMissions[`${today}-m1`],
      icon: '📖',
    },
    {
      id: `${today}-m2`,
      title: 'Latih 5 Soal di Arena Latihan',
      description: 'Asah kecepatan dan ketelitian menjawab soal.',
      rewardXP: 40,
      target: 5,
      current: Math.min(5, state.questionsAnsweredCount),
      isClaimed: !!state.claimedMissions[`${today}-m2`],
      icon: '⚡',
    },
    {
      id: `${today}-m3`,
      title: 'Kuasai 1 Soal di Bank Salah',
      description: 'Ulangi kembali kesalahan agar tidak terulang.',
      rewardXP: 30,
      target: 1,
      current: Math.min(1, state.mistakesMasteredCount),
      isClaimed: !!state.claimedMissions[`${today}-m3`],
      icon: '🧠',
    },
  ]
}

/** Hook React untuk Gamifikasi */
export function useGamification(currentXP = 1250, studentId?: string) {
  const resolvedStudentId = studentId || getActiveStudentId()
  const [state, setState] = useState<GamificationState>(() =>
    getStoredGamificationState(resolvedStudentId),
  )

  useEffect(() => {
    setState(getStoredGamificationState(resolvedStudentId))
  }, [resolvedStudentId])

  useEffect(() => {
    const handleUpdate = () => {
      setState(getStoredGamificationState(resolvedStudentId))
    }
    if (typeof window !== 'undefined') {
      window.addEventListener(GAMIFICATION_EVENT, handleUpdate)
      window.addEventListener('storage', handleUpdate)
    }
    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener(GAMIFICATION_EVENT, handleUpdate)
        window.removeEventListener('storage', handleUpdate)
      }
    }
  }, [resolvedStudentId])

  const levelInfo = useMemo(() => calculateLevel(currentXP), [currentXP])
  const dailyMissions = useMemo(() => getDailyMissions(state), [state])

  const badgesWithStatus = useMemo(() => {
    return MASTER_BADGES.map((b) => ({
      ...b,
      unlockedAt: state.unlockedBadges[b.id],
      isUnlocked: !!state.unlockedBadges[b.id],
    }))
  }, [state.unlockedBadges])

  // Klaim hadiah misi harian (anti-exploit: hanya bisa klaim jika selesai & belum pernah diklaim)
  const claimMissionReward = useCallback(
    (missionId: string, rewardXP: number, onRewardGranted: (xp: number) => void): boolean => {
      const currentState = getStoredGamificationState(resolvedStudentId)
      const missions = getDailyMissions(currentState)
      const targetMission = missions.find((m) => m.id === missionId)

      if (!targetMission) return false
      if (targetMission.current < targetMission.target) return false
      if (currentState.claimedMissions[missionId]) return false // Anti-exploit

      const updated: GamificationState = {
        ...currentState,
        claimedMissions: {
          ...currentState.claimedMissions,
          [missionId]: true,
        },
      }

      saveGamificationState(updated, resolvedStudentId)
      setState(updated)
      onRewardGranted(rewardXP)
      return true
    },
    [resolvedStudentId],
  )

  const recordEvent = useCallback(
    (event: Parameters<typeof recordGamificationEvent>[0]) => {
      const res = recordGamificationEvent(event, currentXP, resolvedStudentId)
      setState(res.state)
      return res
    },
    [currentXP, resolvedStudentId],
  )

  return {
    state,
    levelInfo,
    dailyMissions,
    badgesWithStatus,
    claimMissionReward,
    recordEvent,
  }
}
