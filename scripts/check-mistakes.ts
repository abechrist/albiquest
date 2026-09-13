// Unit test untuk Error Bank & Mistakes Manager (Phase 5)
// Jalankan: node --experimental-strip-types scripts/check-mistakes.ts

import assert from 'node:assert/strict'
import type { Question } from '../src/lib/domain.ts'
import {
  getMistakesStats,
  getStoredMistakes,
  recordQuestionResult,
  saveMistakes,
} from '../src/lib/mistakes.ts'

console.log('--- Menjalankan Unit Test Error Bank / My Mistakes ---')

// 1. Reset memory store
saveMistakes([])
assert.equal(getStoredMistakes().length, 0, 'Store awal harus kosong')

const mockQuestion: Question = {
  id: 'q-test-pythagoras',
  lessonId: 'les-geo-1',
  subjectId: 'matematika',
  type: 'numeric',
  prompt: 'Segitiga siku-siku alas 5 cm, hipotenusa 13 cm. Tinggi = ?',
  options: [],
  answer: ['12'],
  explanation: 'b = √(13² - 5²) = 12 cm',
  source: 'Kemdikbud',
  difficulty: 2,
}

// 2. Test recording an incorrect answer
const wrongResult = recordQuestionResult({
  question: mockQuestion,
  studentAnswer: '10',
  isCorrect: false,
  hintUsed: true,
  attempts: 1,
})

assert.equal(wrongResult.status, 'recorded_mistake', 'Jawaban salah harus dicatat sebagai mistake')
const mistakesAfterWrong = getStoredMistakes()
assert.equal(mistakesAfterWrong.length, 1, 'Harus ada 1 mistake tercatat')
assert.equal(mistakesAfterWrong[0].status, 'needs_review', 'Status awal harus needs_review')
assert.equal(mistakesAfterWrong[0].attempts, 1, 'Attempts harus 1')
assert.equal(mistakesAfterWrong[0].hintUsed, true, 'hintUsed harus true')
console.log('✓ Pencatatan Jawaban Salah: PASS')

// 3. Test repeated incorrect answer increases attempt count
const wrongResult2 = recordQuestionResult({
  question: mockQuestion,
  studentAnswer: '11',
  isCorrect: false,
  hintUsed: false,
  attempts: 1,
})
assert.equal(wrongResult2.status, 'recorded_mistake')
const mistakesAfterWrong2 = getStoredMistakes()
assert.equal(mistakesAfterWrong2.length, 1, 'Tetap 1 record untuk soal yang sama')
assert.equal(mistakesAfterWrong2[0].attempts, 2, 'Attempts bertambah jadi 2')
assert.equal(mistakesAfterWrong2[0].studentAnswer, '11', 'Jawaban terakhir diperbarui')
console.log('✓ Akumulasi Percobaan Salah: PASS')

// 4. Test stats calculation
const stats1 = getMistakesStats(mistakesAfterWrong2)
assert.equal(stats1.total, 1)
assert.equal(stats1.needsReview, 1)
assert.equal(stats1.mastered, 0)
assert.equal(stats1.retryAccuracy, 0)
console.log('✓ Perhitungan Statistik Awal: PASS')

// 5. Test retry with correct answer marks as mastered
const correctRetryResult = recordQuestionResult({
  question: mockQuestion,
  studentAnswer: '12',
  isCorrect: true,
})
assert.equal(correctRetryResult.status, 'marked_mastered', 'Jawaban benar pada retry harus marked_mastered')
const mistakesAfterRetry = getStoredMistakes()
assert.equal(mistakesAfterRetry[0].status, 'mastered', 'Status harus menjadi mastered')
assert.equal(mistakesAfterRetry[0].reviewCount, 1, 'reviewCount bertambah jadi 1')
assert.ok(mistakesAfterRetry[0].lastReviewedAt, 'lastReviewedAt harus terisi')

const stats2 = getMistakesStats(mistakesAfterRetry)
assert.equal(stats2.needsReview, 0)
assert.equal(stats2.mastered, 1)
assert.equal(stats2.retryAccuracy, 100, 'Akurasi retry 100% setelah mastered')
console.log('✓ Siklus Retry & Mastery: PASS')

console.log('============================================')
console.log('🎉 SEMUA UNIT TEST ERROR BANK BERHASIL (PASS)!')
console.log('============================================')
