// Script verifikasi automated untuk Adaptive Learning Engine (Phase 7)
// Jalankan dengan: node --experimental-strip-types scripts/check-adaptive.ts

import assert from 'node:assert/strict'
import {
  calculateSubjectMasteryList,
  calculateTopicMastery,
  detectWeakTopics,
  generateDailyRecommendations,
  getSpacedReviews,
} from '../src/lib/adaptive.ts'
import type { Lesson, Subject, Topic } from '../src/lib/domain.ts'
import type { MistakeRecord } from '../src/lib/mistakes.ts'

console.log('--- Menjalankan Unit Test Adaptive Learning ---')

// Mock Data
const mockSubjects: Subject[] = [
  {
    id: 'matematika',
    name: 'Matematika',
    emoji: '🔢',
    colorFrom: '#6366f1',
    colorTo: '#4338ca',
    description: 'Bilangan & Aljabar',
    priority: 1,
    status: 'active',
    sortOrder: 1,
  },
  {
    id: 'ipa',
    name: 'IPA',
    emoji: '🔬',
    colorFrom: '#10b981',
    colorTo: '#047857',
    description: 'Fisika & Biologi',
    priority: 1,
    status: 'active',
    sortOrder: 2,
  },
]

const mockTopics: Topic[] = [
  {
    id: 'top-aljabar',
    curriculumId: 'cur-mtk',
    subjectId: 'matematika',
    title: 'Persamaan Kuadrat',
    description: 'Akar kuadrat',
    sortOrder: 1,
  },
  {
    id: 'top-geometri',
    curriculumId: 'cur-mtk',
    subjectId: 'matematika',
    title: 'Geometri Ruang',
    description: 'Bangun ruang sisi lengkung',
    sortOrder: 2,
  },
]

const mockLessons: Lesson[] = [
  {
    id: 'les-aljabar-1',
    topicId: 'top-aljabar',
    subjectId: 'matematika',
    title: 'Akar Persamaan',
    description: 'Konsep dasar',
    durationMin: 15,
    type: 'lesson',
    sortOrder: 1,
  },
  {
    id: 'les-aljabar-2',
    topicId: 'top-aljabar',
    subjectId: 'matematika',
    title: 'Rumus ABC',
    description: 'Aplikasi rumus',
    durationMin: 20,
    type: 'lesson',
    sortOrder: 2,
  },
  {
    id: 'les-geo-1',
    topicId: 'top-geometri',
    subjectId: 'matematika',
    title: 'Tabung & Kerucut',
    description: 'Volume tabung',
    durationMin: 15,
    type: 'lesson',
    sortOrder: 1,
  },
]

// 1. Test calculateTopicMastery: Topik selesai tanpa salah -> Mastered (>= 80%)
const completedIds = new Set(['les-aljabar-1', 'les-aljabar-2'])
const noMistakes: MistakeRecord[] = []
const scoreMastered = calculateTopicMastery(
  mockTopics[0],
  mockLessons.filter((l) => l.topicId === 'top-aljabar'),
  completedIds,
  noMistakes,
)
assert.ok(scoreMastered.score >= 80, 'Topik tuntas harus mendapatkan skor >= 80')
assert.equal(scoreMastered.level, 'mastered', 'Level harus "mastered"')
assert.equal(scoreMastered.recommendedDifficulty, 3, 'Rekomendasi difficulty harus Level 3 (Tantangan)')
console.log('✓ calculateTopicMastery (Mastered): PASS')

// 2. Test calculateTopicMastery: Topik dengan unmastered mistakes -> Needs Practice (< 60%)
const mistakesAljabar: MistakeRecord[] = [
  {
    id: 'm1',
    questionId: 'q1',
    subjectId: 'matematika',
    topicId: 'top-aljabar',
    timestamp: Date.now() - 10000,
    studentAnswer: ['x=1'],
    correctAnswer: ['x=2'],
    attempts: 2,
    hintUsed: true,
    status: 'needs_review',
    reviewCount: 0,
  },
  {
    id: 'm2',
    questionId: 'q2',
    subjectId: 'matematika',
    topicId: 'top-aljabar',
    timestamp: Date.now() - 5000,
    studentAnswer: ['x=3'],
    correctAnswer: ['x=-3'],
    attempts: 1,
    hintUsed: false,
    status: 'needs_review',
    reviewCount: 0,
  },
]
const scoreWeak = calculateTopicMastery(
  mockTopics[0],
  mockLessons.filter((l) => l.topicId === 'top-aljabar'),
  new Set(), // belum tuntas lesson
  mistakesAljabar,
)
assert.ok(scoreWeak.score < 60, 'Topik dengan unmastered mistakes harus bernilai rendah')
assert.equal(scoreWeak.level, 'needs_practice')
assert.equal(scoreWeak.recommendedDifficulty, 1)
assert.ok(scoreWeak.diagnosis?.includes('Bank Salah'))
console.log('✓ calculateTopicMastery (Weak Topic & Mistakes): PASS')

// 3. Test detectWeakTopics
const weakList = detectWeakTopics(mockTopics, mockLessons, new Set(), mistakesAljabar)
assert.ok(weakList.length > 0, 'Harus mendeteksi topik lemah')
assert.equal(weakList[0].id, 'top-aljabar', 'Topik Aljabar harus menjadi topik terlemah')
console.log('✓ detectWeakTopics: PASS')

// 4. Test calculateSubjectMasteryList
const subjectMasteries = calculateSubjectMasteryList(
  mockSubjects,
  mockTopics,
  mockLessons,
  completedIds,
  noMistakes,
)
assert.equal(subjectMasteries.length, 2, 'Harus menghitung 2 mapel aktif')
const mtkMastery = subjectMasteries.find((s) => s.subjectId === 'matematika')
assert.ok(mtkMastery, 'Matematika harus ditemukan')
assert.ok(mtkMastery.averageScore > 0, 'Rata-rata skor harus > 0')
console.log('✓ calculateSubjectMasteryList: PASS')

// 5. Test getSpacedReviews: Review jatuh tempo
const now = Date.now()
const mistakeDue: MistakeRecord = {
  id: 'm-due',
  questionId: 'q-due',
  subjectId: 'matematika',
  topicId: 'top-aljabar',
  timestamp: now - 2 * 24 * 60 * 60 * 1000, // 2 hari lalu, interval pertama 1 hari -> jatuh tempo!
  studentAnswer: ['A'],
  correctAnswer: ['B'],
  attempts: 1,
  hintUsed: false,
  status: 'needs_review',
  reviewCount: 0,
}
const spacedReviews = getSpacedReviews([mistakeDue], now)
assert.equal(spacedReviews.length, 1)
assert.equal(spacedReviews[0].isDue, true, 'Soal 2 hari lalu harus berstatus isDue: true')
console.log('✓ getSpacedReviews: PASS')

// 6. Test generateDailyRecommendations: Rekomendasi harian
const recommendations = generateDailyRecommendations(
  mockSubjects,
  mockTopics,
  mockLessons,
  new Set(),
  [mistakeDue],
  now,
)
assert.ok(recommendations.length >= 2, 'Harus menghasilkan minimal 2 rekomendasi terstruktur')
assert.equal(recommendations[0].type, 'spaced_review', 'Prioritas tertinggi harus Spaced Review yang jatuh tempo')
assert.ok(recommendations.some((r) => r.type === 'weak_topic'), 'Harus menyertakan rekomendasi topik lemah')
assert.ok(recommendations.some((r) => r.type === 'next_lesson'), 'Harus menyertakan rekomendasi pelajaran berikutnya')
console.log('✓ generateDailyRecommendations: PASS')

console.log('============================================')
console.log('🎉 SEMUA UNIT TEST ADAPTIVE LEARNING BERHASIL (PASS)!')
console.log('============================================')
