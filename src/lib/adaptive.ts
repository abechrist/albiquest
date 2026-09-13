// Adaptive Learning Engine — Phase 7
// Sesuai prd.md §22–23, agent-prompt.md §58, dan DECISIONS.md (D-016).

import { useEffect, useState } from 'react'
import type { Difficulty, Lesson, Subject, Topic } from './domain.ts'
import { getStoredMistakes, type MistakeRecord } from './mistakes.ts'

export type MasteryLevel = 'mastered' | 'in_progress' | 'needs_practice'

export interface MasteryScore {
  id: string
  title: string
  subjectId: string
  score: number // 0 - 100
  level: MasteryLevel
  levelLabel: string
  color: string
  completedLessons: number
  totalLessons: number
  unmasteredMistakes: number
  recommendedDifficulty: Difficulty
  diagnosis?: string
}

export interface SubjectMastery {
  subjectId: string
  subjectName: string
  subjectEmoji: string
  averageScore: number
  level: MasteryLevel
  color: string
  topics: MasteryScore[]
}

export interface SpacedReviewItem {
  id: string
  type: 'mistake' | 'lesson'
  title: string
  subjectId: string
  topicId?: string
  lessonId?: string
  dueDaysAgo: number
  intervalDays: number
  isDue: boolean
  lastInteractionAt: number
}

export interface RecommendationItem {
  id: string
  type: 'spaced_review' | 'weak_topic' | 'next_lesson' | 'daily_challenge'
  title: string
  subjectId: string
  subjectName: string
  subjectEmoji: string
  topicId?: string
  lessonId?: string
  reason: string
  masteryScore?: number
  actionLabel: string
  actionUrl: string
  badgeLabel: string
  priority: number
}

const ONE_DAY_MS = 24 * 60 * 60 * 1000
const SPATIAL_INTERVALS = [1, 3, 7, 14, 30] // interval hari pengulangan berjarak

/**
 * Menghitung skor penguasaan (Mastery) suatu topik (0-100%).
 * Bobot:
 * - Penyelesaian lesson dalam topik: 40%
 * - Status kesalahan (unmastered mistakes vs mastered mistakes): 60%
 */
export function calculateTopicMastery(
  topic: Topic,
  topicLessons: Lesson[],
  completedLessonIds: Set<string> | string[],
  mistakes: MistakeRecord[],
): MasteryScore {
  const completedSet = completedLessonIds instanceof Set
    ? completedLessonIds
    : new Set(completedLessonIds)

  const totalLessons = topicLessons.length
  const completedLessons = topicLessons.filter((l) => completedSet.has(l.id)).length
  const lessonProgressRatio = totalLessons > 0 ? completedLessons / totalLessons : 0

  // Analisis kesalahan pada topik ini
  const topicLessonIds = new Set(topicLessons.map((l) => l.id))
  const topicMistakes = mistakes.filter(
    (m) => (m.topicId && m.topicId === topic.id) || (m.lessonId && topicLessonIds.has(m.lessonId)),
  )

  const unmasteredMistakes = topicMistakes.filter((m) => m.status === 'needs_review').length
  const masteredMistakes = topicMistakes.filter((m) => m.status === 'mastered').length

  // Hitung score dasar
  let score = 0

  if (totalLessons === 0 && topicMistakes.length === 0) {
    score = 70 // default baseline jika belum ada data aktivitas
  } else {
    // Komponen 1: Progres pelajaran (bobot 50%)
    const lessonScore = lessonProgressRatio * 50

    // Komponen 2: Akurasi / Mastery Kesalahan (bobot 50%)
    let practiceScore = 50
    if (topicMistakes.length > 0) {
      // Jika ada kesalahan, rasio yang sudah berhasil di-retry menentukan nilai
      const recoveryRatio = (masteredMistakes + 0.2) / (topicMistakes.length + 0.2)
      practiceScore = Math.max(10, Math.round(recoveryRatio * 50))
      // Penalti jika ada unmastered mistakes menumpuk
      if (unmasteredMistakes >= 2) {
        practiceScore = Math.max(5, practiceScore - unmasteredMistakes * 8)
      }
    } else if (completedLessons > 0) {
      // Pelajaran selesai tanpa ada catatan salah sama sekali -> skor latihan prima
      practiceScore = 50
    } else {
      practiceScore = 20
    }

    score = Math.min(100, Math.max(0, Math.round(lessonScore + practiceScore)))
  }

  let level: MasteryLevel = 'needs_practice'
  let levelLabel = 'Perlu Latihan'
  let color = '#ef4444' // red-500
  let recommendedDifficulty: Difficulty = 1

  if (score >= 80) {
    level = 'mastered'
    levelLabel = 'Mahir'
    color = '#10b981' // emerald-500
    recommendedDifficulty = 3
  } else if (score >= 60) {
    level = 'in_progress'
    levelLabel = 'Berkembang'
    color = '#f59e0b' // amber-500
    recommendedDifficulty = 2
  } else {
    level = 'needs_practice'
    levelLabel = 'Perlu Latihan'
    color = '#ef4444' // red-500
    recommendedDifficulty = 1
  }

  // Buat diagnosis konseptual
  let diagnosis: string | undefined
  if (unmasteredMistakes > 0) {
    diagnosis = `Terdapat ${unmasteredMistakes} konsep yang belum tuntas di Bank Salah.`
  } else if (completedLessons === 0) {
    diagnosis = 'Materi belum dimulai. Yuk jelajahi langkah pertama!'
  } else if (score < 80) {
    diagnosis = 'Konsep dasar sudah dipahami, perbanyak latihan untuk mencapai Mahir.'
  } else {
    diagnosis = 'Pemahaman topik ini sangat solid! Pertahankan prestasimu.'
  }

  return {
    id: topic.id,
    title: topic.title,
    subjectId: topic.subjectId,
    score,
    level,
    levelLabel,
    color,
    completedLessons,
    totalLessons,
    unmasteredMistakes,
    recommendedDifficulty,
    diagnosis,
  }
}

/**
 * Mendeteksi topik-topik lemah yang memerlukan perhatian khusus (PRD §22 & agent-prompt §58)
 */
export function detectWeakTopics(
  topics: Topic[],
  lessons: Lesson[],
  completedLessonIds: Set<string> | string[],
  mistakes: MistakeRecord[],
): MasteryScore[] {
  const scores = topics.map((t) => {
    const topicLessons = lessons.filter((l) => l.topicId === t.id)
    return calculateTopicMastery(t, topicLessons, completedLessonIds, mistakes)
  })

  // Prioritaskan yang skor < 75 atau unmasteredMistakes > 0
  return scores
    .filter((s) => s.score < 75 || s.unmasteredMistakes > 0)
    .sort((a, b) => {
      // Urutkan berdasarkan unmastered mistakes terbanyak, lalu skor terendah
      if (b.unmasteredMistakes !== a.unmasteredMistakes) {
        return b.unmasteredMistakes - a.unmasteredMistakes
      }
      return a.score - b.score
    })
}

/**
 * Menghitung ringkasan penguasaan materi per mata pelajaran
 */
export function calculateSubjectMasteryList(
  subjects: Subject[],
  topics: Topic[],
  lessons: Lesson[],
  completedLessonIds: Set<string> | string[],
  mistakes: MistakeRecord[],
): SubjectMastery[] {
  return subjects
    .filter((s) => s.status === 'active')
    .map((s) => {
      const subjectTopics = topics.filter((t) => t.subjectId === s.id)
      const topicScores = subjectTopics.map((t) => {
        const topicLessons = lessons.filter((l) => l.topicId === t.id)
        return calculateTopicMastery(t, topicLessons, completedLessonIds, mistakes)
      })

      const totalScore = topicScores.reduce((acc, cur) => acc + cur.score, 0)
      const averageScore = topicScores.length > 0 ? Math.round(totalScore / topicScores.length) : 0

      let level: MasteryLevel = 'needs_practice'
      let color = '#ef4444'
      if (averageScore >= 80) {
        level = 'mastered'
        color = '#10b981'
      } else if (averageScore >= 60) {
        level = 'in_progress'
        color = '#f59e0b'
      }

      return {
        subjectId: s.id,
        subjectName: s.name,
        subjectEmoji: s.emoji,
        averageScore,
        level,
        color,
        topics: topicScores,
      }
    })
}

/**
 * Menghitung jadwal Spaced Review (pengulangan berjarak) untuk item Bank Kesalahan
 */
export function getSpacedReviews(
  mistakes: MistakeRecord[],
  now: number = Date.now(),
): SpacedReviewItem[] {
  return mistakes
    .filter((m) => m.status === 'needs_review')
    .map((m) => {
      const reviewIndex = Math.min(m.reviewCount, SPATIAL_INTERVALS.length - 1)
      const intervalDays = SPATIAL_INTERVALS[reviewIndex]
      const lastAction = m.lastReviewedAt || m.timestamp
      const daysSince = Math.floor((now - lastAction) / ONE_DAY_MS)
      const isDue = daysSince >= intervalDays

      return {
        id: m.id,
        type: 'mistake' as const,
        title: `Soal #${m.questionId.slice(-4)} (${m.subjectId.toUpperCase()})`,
        subjectId: m.subjectId,
        topicId: m.topicId,
        lessonId: m.lessonId,
        dueDaysAgo: Math.max(0, daysSince - intervalDays),
        intervalDays,
        isDue,
        lastInteractionAt: lastAction,
      }
    })
    .sort((a, b) => b.dueDaysAgo - a.dueDaysAgo)
}

/**
 * Recommendation Engine: "What should I learn today?" (PRD §23)
 * Menghasilkan rekomendasi terpersonalisasi berdasarkan:
 * 1. Spaced Review jatuh tempo
 * 2. Topik terlemah (Mastery rendah & ada kesalahan)
 * 3. Pelajaran berikutnya yang belum tuntas (Prioritas 1: MTK, B.Indo, IPA)
 */
export function generateDailyRecommendations(
  subjects: Subject[],
  topics: Topic[],
  lessons: Lesson[],
  completedLessonIds: Set<string> | string[],
  mistakes: MistakeRecord[],
  now: number = Date.now(),
): RecommendationItem[] {
  const recommendations: RecommendationItem[] = []
  const completedSet = completedLessonIds instanceof Set
    ? completedLessonIds
    : new Set(completedLessonIds)

  const subjectMap = new Map<string, Subject>(subjects.map((s) => [s.id, s]))

  // 1. Cek apakah ada Spaced Review jatuh tempo di Bank Salah
  const dueReviews = getSpacedReviews(mistakes, now).filter((r) => r.isDue)
  if (dueReviews.length > 0) {
    const topDue = dueReviews[0]
    const sub = subjectMap.get(topDue.subjectId)
    recommendations.push({
      id: `rec-spaced-${topDue.id}`,
      type: 'spaced_review',
      title: 'Segarkan Ingatan: Bank Kesalahan',
      subjectId: topDue.subjectId,
      subjectName: sub?.name || 'Mata Pelajaran',
      subjectEmoji: sub?.emoji || '🧠',
      topicId: topDue.topicId,
      lessonId: topDue.lessonId,
      reason: `Ada ${dueReviews.length} soal yang sudah jatuh tempo untuk diulang agar daya ingatmu tetap prima.`,
      actionLabel: 'Review Bank Salah',
      actionUrl: '/student/mistakes',
      badgeLabel: 'Jatuh Tempo',
      priority: 1,
    })
  }

  // 2. Cek topik terlemah
  const weakTopics = detectWeakTopics(topics, lessons, completedSet, mistakes)
  if (weakTopics.length > 0) {
    const topWeak = weakTopics[0]
    const sub = subjectMap.get(topWeak.subjectId)
    recommendations.push({
      id: `rec-weak-${topWeak.id}`,
      type: 'weak_topic',
      title: `Perkuat Topik: ${topWeak.title}`,
      subjectId: topWeak.subjectId,
      subjectName: sub?.name || 'Mata Pelajaran',
      subjectEmoji: sub?.emoji || '🎯',
      topicId: topWeak.id,
      masteryScore: topWeak.score,
      reason: topWeak.unmasteredMistakes > 0
        ? `Penguasaan ${topWeak.score}%. Terdapat ${topWeak.unmasteredMistakes} konsep keliru yang butuh latihan tambahan.`
        : `Penguasaan baru ${topWeak.score}%. Ayo selesaikan tantangan untuk naik ke level Mahir!`,
      actionLabel: 'Latih Topik Ini',
      actionUrl: `/student/practice?subject=${topWeak.subjectId}&topic=${topWeak.id}`,
      badgeLabel: `${topWeak.score}% Penguasaan`,
      priority: 2,
    })
  }

  // 3. Rekomendasi Pelajaran Berikutnya (Prioritas 1: Matematika & IPA terlebih dahulu)
  const priority1Subjects = subjects
    .filter((s) => s.priority === 1 && s.status === 'active')
    .sort((a, b) => a.sortOrder - b.sortOrder)

  for (const sub of priority1Subjects) {
    const subLessons = lessons
      .filter((l) => l.subjectId === sub.id)
      .sort((a, b) => a.sortOrder - b.sortOrder)

    const nextUncompleted = subLessons.find((l) => !completedSet.has(l.id))
    if (nextUncompleted) {
      recommendations.push({
        id: `rec-next-${nextUncompleted.id}`,
        type: 'next_lesson',
        title: `Langkah Petualangan: ${nextUncompleted.title}`,
        subjectId: sub.id,
        subjectName: sub.name,
        subjectEmoji: sub.emoji,
        lessonId: nextUncompleted.id,
        topicId: nextUncompleted.topicId,
        reason: `Materi inti kurikulum berikutnya (${nextUncompleted.durationMin} menit). Ayo tuntaskan modul ini!`,
        actionLabel: 'Mulai Pelajaran',
        actionUrl: `/student/lesson/${nextUncompleted.id}`,
        badgeLabel: 'Pelajaran Baru',
        priority: 3,
      })
      break
    }
  }

  // 4. Default: Rekomendasi Tantangan Harian (Play Mode / Boss Battle)
  recommendations.push({
    id: 'rec-challenge-boss',
    type: 'daily_challenge',
    title: 'Tantangan: Boss Battle Aljabar',
    subjectId: 'matematika',
    subjectName: 'Matematika',
    subjectEmoji: '👹',
    reason: 'Uji ketangkasan berpikirmu menghadapi Golem Persamaan Kuadrat dan raih +150 XP!',
    actionLabel: 'Masuk Arena Tantangan',
    actionUrl: '/student/challenges',
    badgeLabel: 'Tantangan Khusus',
    priority: 4,
  })

  return recommendations.sort((a, b) => a.priority - b.priority)
}

/**
 * Hook reaktif untuk komponen UI yang membutuhkan rekomendasi dan mastery real-time
 */
export function useAdaptiveLearning(
  subjects: Subject[],
  topics: Topic[],
  lessons: Lesson[],
  completedLessonIds: Set<string> | string[],
) {
  const [mistakes, setMistakes] = useState<MistakeRecord[]>(getStoredMistakes)

  useEffect(() => {
    const handleUpdate = () => setMistakes(getStoredMistakes())
    if (typeof window !== 'undefined') {
      window.addEventListener('pla:mistakes-updated', handleUpdate)
      window.addEventListener('storage', handleUpdate)
    }
    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('pla:mistakes-updated', handleUpdate)
        window.removeEventListener('storage', handleUpdate)
      }
    }
  }, [])

  const subjectMasteries = calculateSubjectMasteryList(
    subjects,
    topics,
    lessons,
    completedLessonIds,
    mistakes,
  )

  const weakTopics = detectWeakTopics(topics, lessons, completedLessonIds, mistakes)
  const recommendations = generateDailyRecommendations(
    subjects,
    topics,
    lessons,
    completedLessonIds,
    mistakes,
  )
  const spacedReviews = getSpacedReviews(mistakes)

  return {
    subjectMasteries,
    weakTopics,
    recommendations,
    spacedReviews,
    mistakesCount: mistakes.filter((m) => m.status === 'needs_review').length,
  }
}
