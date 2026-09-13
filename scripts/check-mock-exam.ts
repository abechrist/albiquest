// Script verifikasi automated untuk Mock Exam & ANBK Engine (Phase 9)
// Jalankan dengan: node --experimental-strip-types scripts/check-mock-exam.ts

import assert from 'node:assert/strict'
import type { Question } from '../src/lib/domain.ts'
import {
  evaluateExamSubmission,
  EXAM_PRESETS,
  getPaletteStatus,
  initExamSession,
} from '../src/lib/mock-exam.ts'

console.log('--- Menjalankan Unit Test Mock Exam & ANBK Engine ---')

const mockQuestions: Question[] = [
  {
    id: 'q-mtk-1',
    lessonId: 'les-1',
    subjectId: 'matematika',
    type: 'mcq',
    prompt: 'Berapakah akar dari x² - 4 = 0?',
    options: ['x = ±2', 'x = 4', 'x = 16'],
    answer: ['x = ±2'],
    explanation: 'x² = 4 -> x = ±2',
    difficulty: 2,
    source: 'BSE Pusmenjar',
  },
  {
    id: 'q-mtk-2',
    lessonId: 'les-2',
    subjectId: 'matematika',
    type: 'mcq',
    prompt: '2x + 6 = 12, berapakah x?',
    options: ['2', '3', '4'],
    answer: ['3'],
    explanation: '2x = 6 -> x = 3',
    difficulty: 1,
    source: 'BSE Pusmenjar',
  },
  {
    id: 'q-ipa-1',
    lessonId: 'les-3',
    subjectId: 'ipa',
    type: 'mcq',
    prompt: 'V = I x R adalah bunyi hukum?',
    options: ['Ohm', 'Newton', 'Pascal'],
    answer: ['Ohm'],
    explanation: 'Hukum Ohm menyatakan V = I x R',
    difficulty: 2,
    source: 'BSE Pusmenjar',
  },
]

// 1. Test initExamSession
const preset = EXAM_PRESETS[1] // mipa_focus
const session = initExamSession(preset, mockQuestions)
assert.equal(session.presetId, 'mipa_focus')
assert.ok(session.questions.length > 0)
assert.equal(session.currentIndex, 0)
console.log('✓ initExamSession: PASS')

// 2. Test getPaletteStatus: Unanswered vs Answered vs Flagged
const firstQ = session.questions[0]
const qId = firstQ.id
assert.equal(getPaletteStatus(session, qId), 'unanswered', 'Awalnya harus unanswered')

// Tandai jawaban benar
session.answers[qId] = [...firstQ.answer]
assert.equal(getPaletteStatus(session, qId), 'answered', 'Harus answered setelah diisi')

// Tandai ragu-ragu
session.flagged[qId] = true
assert.equal(getPaletteStatus(session, qId), 'flagged', 'Harus flagged jika ditandai ragu-ragu')
console.log('✓ getPaletteStatus: PASS')

// 3. Test evaluateExamSubmission
// Soal pertama dijawab benar
const result = evaluateExamSubmission(session, session.startTime + 120 * 1000)
assert.ok(result.score > 0, 'Skor harus dihitung > 0')
assert.equal(result.correctCount, 1)
assert.ok(result.unansweredCount >= 0)
assert.ok(result.earnedXP > 0)
assert.ok(result.timeSpentSeconds === 120)
assert.ok(result.questionBreakdown.length === session.questions.length)
console.log('✓ evaluateExamSubmission & Scoring: PASS')

console.log('============================================')
console.log('🎉 SEMUA UNIT TEST MOCK EXAM BERHASIL (PASS)!')
console.log('============================================')
