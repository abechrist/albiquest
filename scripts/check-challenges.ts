// Script verifikasi automated untuk Challenges & Play Modes (Phase 8)
// Jalankan dengan: node --experimental-strip-types scripts/check-challenges.ts

import assert from 'node:assert/strict'
import {
  evaluateBossHit,
  evaluateSpeedRoundAnswer,
  evaluateSurvivalStep,
  initBossBattle,
  initFiveMinuteMode,
  initSpeedRound,
  initSurvivalMode,
} from '../src/lib/challenges.ts'
import type { Question } from '../src/lib/domain.ts'

console.log('--- Menjalankan Unit Test Challenges & Play Modes ---')

const mockQuestions: Question[] = [
  {
    id: 'q1',
    lessonId: 'les-1',
    subjectId: 'matematika',
    type: 'mcq',
    prompt: 'Berapakah 2 + 2?',
    options: ['3', '4', '5'],
    answer: ['4'],
    explanation: '2 + 2 = 4',
    difficulty: 2,
    source: 'BSE Pusmenjar',
  },
  {
    id: 'q2',
    lessonId: 'les-2',
    subjectId: 'matematika',
    type: 'mcq',
    prompt: 'Berapakah 3 x 3?',
    options: ['6', '9', '12'],
    answer: ['9'],
    explanation: '3 x 3 = 9',
    difficulty: 3,
    source: 'BSE Pusmenjar',
  },
  {
    id: 'q3',
    lessonId: 'les-3',
    subjectId: 'ipa',
    type: 'mcq',
    prompt: 'Satuan arus listrik?',
    options: ['Volt', 'Ampere', 'Ohm'],
    answer: ['Ampere'],
    explanation: 'Arus = Ampere',
    difficulty: 1,
    source: 'BSE Pusmenjar',
  },
]

// 1. Test Boss Battle: Hit & HP decrease
const bossInit = initBossBattle(mockQuestions)
assert.equal(bossInit.bossCurrentHp, 100, 'HP awal boss 100')
assert.equal(bossInit.playerHearts, 3, 'Nyawa awal player 3')

// Player menjawab benar -> Boss kena damage
const hit1 = evaluateBossHit(bossInit, true)
assert.ok(hit1.nextState.bossCurrentHp < 100, 'HP boss harus berkurang')
assert.equal(hit1.nextState.playerHearts, 3, 'Hati player tidak berkurang saat benar')
assert.ok(hit1.damageDealt > 0)
console.log('✓ Boss Battle (Correct Hit): PASS')

// Player menjawab salah -> Player kehilangan hati
const hit2 = evaluateBossHit(hit1.nextState, false)
assert.equal(hit2.nextState.playerHearts, 2, 'Hati player berkurang 1')
assert.equal(hit2.damageTaken, 1)
console.log('✓ Boss Battle (Wrong Answer & Heart Loss): PASS')

// 2. Test Speed Round
const speedInit = initSpeedRound(mockQuestions, 60)
assert.equal(speedInit.remainingSeconds, 60)
assert.equal(speedInit.comboStreak, 0)

// Jawaban benar: bonus waktu (+5s) dan combo bertambah
const s1 = evaluateSpeedRoundAnswer(speedInit, true)
assert.equal(s1.remainingSeconds, 65, 'Waktu bertambah 5s')
assert.equal(s1.comboStreak, 1)
assert.ok(s1.score > 0)
console.log('✓ Speed Round (Time Bonus & Combo): PASS')

// Jawaban salah: pinalti waktu (-3s) dan combo reset
const s2 = evaluateSpeedRoundAnswer(s1, false)
assert.equal(s2.remainingSeconds, 62, 'Waktu berkurang 3s')
assert.equal(s2.comboStreak, 0, 'Combo ter-reset')
console.log('✓ Speed Round (Penalty & Reset): PASS')

// 3. Test 5-Minute Express Mode
const fiveInit = initFiveMinuteMode(mockQuestions)
assert.ok(fiveInit.questions.length > 0)
assert.ok(fiveInit.conceptRecap.title.length > 0)
assert.equal(fiveInit.earnedXP, 60)
console.log('✓ 5-Minute Express Mode: PASS')

// 4. Test Survival Mode
const survInit = initSurvivalMode(mockQuestions)
assert.equal(survInit.streakCount, 0)
assert.equal(survInit.isGameOver, false)

// Jawaban benar menambah streak
const surv1 = evaluateSurvivalStep(survInit, true)
assert.equal(surv1.streakCount, 1)
assert.equal(surv1.earnedXP, 25)

// Jawaban salah langsung Game Over (Sudden Death)
const surv2 = evaluateSurvivalStep(surv1, false)
assert.equal(surv2.isGameOver, true, 'Kesalahan pada survival langsung mengakhiri permainan')
console.log('✓ Survival Mode (Sudden Death): PASS')

console.log('============================================')
console.log('🎉 SEMUA UNIT TEST CHALLENGES & PLAY MODES BERHASIL (PASS)!')
console.log('============================================')
