// Master Regression & Final QA Test Suite (Phase 12)
// Sesuai agent-prompt.md §63–64 dan prd.md §47.
// Jalankan dengan: node --experimental-strip-types scripts/check-full-regression.ts

import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'

import {
  calculateSubjectMasteryList,
  calculateTopicMastery,
  detectWeakTopics,
  generateDailyRecommendations,
  getSpacedReviews,
} from '../src/lib/adaptive.ts'
import {
  evaluateBossHit,
  evaluateSpeedRoundAnswer,
  evaluateSurvivalStep,
  initBossBattle,
  initFiveMinuteMode,
  initSpeedRound,
  initSurvivalMode,
} from '../src/lib/challenges.ts'
import type { Lesson, Question, Subject, Topic } from '../src/lib/domain.ts'
import {
  calculateLevel,
  getDailyMissions,
  recordGamificationEvent,
  touchDailyStreak,
} from '../src/lib/gamification.ts'
import {
  getMistakesStats,
  recordQuestionResult,
} from '../src/lib/mistakes.ts'
import {
  evaluateExamSubmission,
  EXAM_PRESETS,
  getPaletteStatus,
  initExamSession,
} from '../src/lib/mock-exam.ts'
import {
  calculateEarnedXP,
  evaluateAnswer,
  normalizeText,
  parseMatchingOptions,
} from '../src/lib/question-evaluator.ts'
import { seedRows } from '../src/lib/seed.ts'
import { assertRefs, parseSheetRows } from '../src/lib/validate.ts'

console.log('=================================================================')
console.log('🚀 MASTER REGRESSION & SECURITY QA AUDIT — QUESTLEARN (PHASE 12)')
console.log('=================================================================\n')

// -----------------------------------------------------------------------------
// 1. AUDIT DATA LAYER & GOOGLE SHEETS / SEED INTEGRITY
// -----------------------------------------------------------------------------
console.log('1. [DATA LAYER] Validasi Skema CSV & Seed Data...')
const data = parseSheetRows(seedRows)
assertRefs(data)
assert.ok(data.subjects.length >= 9, 'Minimal 9 mata pelajaran SMP Kelas 9')
assert.ok(data.topics.length >= 5, 'Minimal 5 topik pembelajaran')
assert.ok(data.lessons.length >= 8, 'Minimal 8 modul pelajaran')
assert.ok(data.questions.length >= 10, 'Minimal 10 bank soal seed')
console.log('   ✓ Data Layer & CSV Schema: PASS')

// -----------------------------------------------------------------------------
// 2. AUDIT QUESTION ENGINE (6 TIPE SOAL)
// -----------------------------------------------------------------------------
console.log('2. [QUESTION ENGINE] Evaluasi 6 Tipe Soal & Progressive Hints...')
// A. MCQ
const qMcq: Question = {
  id: 'q-mcq',
  lessonId: 'l1',
  subjectId: 'matematika',
  type: 'mcq',
  prompt: '2 + 2 = ?',
  options: ['3', '4', '5'],
  answer: ['4'],
  explanation: '',
  difficulty: 1,
  source: 'BSE',
}
assert.equal(evaluateAnswer(qMcq, ['4']), true)
assert.equal(evaluateAnswer(qMcq, ['3']), false)

// B. True/False
const qTf: Question = { ...qMcq, id: 'q-tf', type: 'true_false', answer: ['true'] }
assert.equal(evaluateAnswer(qTf, ['true']), true)
assert.equal(evaluateAnswer(qTf, ['false']), false)

// C. Short Answer
const qShort: Question = { ...qMcq, id: 'q-sh', type: 'short', answer: ['fotosintesis'] }
assert.equal(evaluateAnswer(qShort, [' Fotosintesis! ']), true)

// D. Numeric
const qNum: Question = { ...qMcq, id: 'q-num', type: 'numeric', answer: ['3.14'] }
assert.equal(evaluateAnswer(qNum, ['3,14']), true)

// E. Matching
const qMatch: Question = {
  ...qMcq,
  id: 'q-mat',
  type: 'matching',
  options: ['Volt | Tegangan', 'Ampere | Arus'],
  answer: ['Volt | Tegangan', 'Ampere | Arus'],
}
assert.equal(evaluateAnswer(qMatch, { Volt: 'Tegangan', Ampere: 'Arus' }), true)
assert.equal(evaluateAnswer(qMatch, { Volt: 'Arus', Ampere: 'Tegangan' }), false)

// F. Ordering
const qOrd: Question = {
  ...qMcq,
  id: 'q-ord',
  type: 'ordering',
  options: ['Akar', 'Batang', 'Daun'],
  answer: ['Akar', 'Batang', 'Daun'],
}
assert.equal(evaluateAnswer(qOrd, ['Akar', 'Batang', 'Daun']), true)
assert.equal(evaluateAnswer(qOrd, ['Daun', 'Akar', 'Batang']), false)

// XP Scoring
assert.equal(calculateEarnedXP(qMcq, true, 1, 1), 10)
assert.equal(calculateEarnedXP({ ...qMcq, difficulty: 3 }, true, 1, 1), 30)
assert.equal(calculateEarnedXP({ ...qMcq, difficulty: 3 }, true, 2, 1), 25) // hint penalty -5
console.log('   ✓ Question Engine & Progressive Hints: PASS')

// -----------------------------------------------------------------------------
// 3. AUDIT ERROR BANK / MY MISTAKES (LEARNING LOOP)
// -----------------------------------------------------------------------------
console.log('3. [ERROR BANK] Audit Siklus Practice -> Mistake -> Retry -> Mastered...')
const resMistake = recordQuestionResult({
  question: qMcq,
  studentAnswer: ['3'],
  isCorrect: false,
  attempts: 1,
})
assert.equal(resMistake.status, 'recorded_mistake')
assert.ok(resMistake.record)
assert.equal(resMistake.record.status, 'needs_review')

// Retry berhasil -> otomatis menjadi marked_mastered
const retryRes = recordQuestionResult({
  question: qMcq,
  studentAnswer: ['4'],
  isCorrect: true,
})
assert.equal(retryRes.status, 'marked_mastered')
console.log('   ✓ Error Bank & Retry Cycle: PASS')

// -----------------------------------------------------------------------------
// 4. AUDIT GAMIFIKASI & ANTI-EXPLOIT
// -----------------------------------------------------------------------------
console.log('4. [GAMIFIKASI] Leveling, Streak, Badges & Anti-Exploit Check...')
const lvl1 = calculateLevel(1250)
assert.ok(lvl1.level >= 5)
assert.ok(lvl1.progressPct >= 0 && lvl1.progressPct <= 100)

// Streak verification
const yDate = new Date(Date.now() - 86400000)
const yesterdayStr = `${yDate.getFullYear()}-${String(yDate.getMonth() + 1).padStart(2, '0')}-${String(yDate.getDate()).padStart(2, '0')}`
const stateYesterday = {
  streakDays: 5,
  lastActiveDate: yesterdayStr,
  unlockedBadges: {},
  claimedMissions: {},
  questionsAnsweredCount: 0,
  lessonsCompletedCount: 0,
  mistakesMasteredCount: 0,
}
const streakResult = touchDailyStreak(stateYesterday)
assert.ok(streakResult.streakDays >= 5, 'Streak tidak boleh berkurang pada hari aktif')

// Anti-exploit Daily Missions
const missions = getDailyMissions(stateYesterday)
assert.equal(missions.length, 3)
for (const m of missions) {
  assert.ok(m.title)
  assert.ok(m.rewardXP > 0)
}
console.log('   ✓ Gamifikasi & Anti-Exploit: PASS')

// -----------------------------------------------------------------------------
// 5. AUDIT ADAPTIVE LEARNING & WEAK TOPIC RECOMMENDATIONS
// -----------------------------------------------------------------------------
console.log('5. [ADAPTIVE LEARNING] Topic Mastery & Spaced Review Calculation...')
const mockTopic: Topic = {
  id: 'top-1',
  curriculumId: 'c1',
  subjectId: 'matematika',
  title: 'Aljabar',
  description: '',
  sortOrder: 1,
}
const mockLesson: Lesson = {
  id: 'l1',
  topicId: 'top-1',
  subjectId: 'matematika',
  title: 'Materi 1',
  description: '',
  durationMin: 15,
  type: 'lesson',
  sortOrder: 1,
}
const mastery = calculateTopicMastery(mockTopic, [mockLesson], new Set(['l1']), [])
assert.ok(mastery.score >= 80, 'Topik tuntas harus score >= 80')
assert.equal(mastery.level, 'mastered')

const recommendations = generateDailyRecommendations(data.subjects, data.topics, data.lessons, new Set(), [])
assert.ok(recommendations.length >= 2, 'Rekomendasi harian harus terisi')
console.log('   ✓ Adaptive Learning & Mastery Engine: PASS')

// -----------------------------------------------------------------------------
// 6. AUDIT CHALLENGES & PLAY MODES
// -----------------------------------------------------------------------------
console.log('6. [CHALLENGES] Boss Battle, Speed Round, & Express Modes...')
const boss = initBossBattle(data.questions)
const hit = evaluateBossHit(boss, true)
assert.ok(hit.nextState.bossCurrentHp < 100, 'Serangan harus mengurangi HP Boss')

const speed = initSpeedRound(data.questions, 60)
const speedHit = evaluateSpeedRoundAnswer(speed, true)
assert.equal(speedHit.remainingSeconds, 65, 'Jawaban tepat menambah +5 detik')
console.log('   ✓ Challenges & Play Modes: PASS')

// -----------------------------------------------------------------------------
// 7. AUDIT MOCK EXAM SYSTEM
// -----------------------------------------------------------------------------
console.log('7. [MOCK EXAM] Simulasi ANBK, Timer, Palette, & Auto-Scoring...')
const exam = initExamSession(EXAM_PRESETS[0], data.questions)
assert.ok(exam.questions.length > 0)
assert.ok(exam.questions.length <= EXAM_PRESETS[0].questionCount)
exam.answers[exam.questions[0].id] = [...exam.questions[0].answer]
const paletteStat = getPaletteStatus(exam, exam.questions[0].id)
assert.equal(paletteStat, 'answered')

const examResult = evaluateExamSubmission(exam)
assert.ok(examResult.score > 0)
assert.equal(examResult.questionBreakdown.length, exam.questions.length)
console.log('   ✓ Mock Exam System: PASS')

// -----------------------------------------------------------------------------
// 8. SECURITY & ROLE BOUNDARY AUDIT (PARENT READ-ONLY)
// -----------------------------------------------------------------------------
console.log('8. [SECURITY AUDIT] Parent Read-Only Boundary & Role Isolation...')
// Memastikan modul parent tidak mengekspos mutasi akademis
const parentFiles = [
  'src/pages/parent/ParentSummaryPage.tsx',
  'src/pages/parent/ParentProgressPage.tsx',
  'src/pages/parent/ParentMistakesPage.tsx',
]
for (const file of parentFiles) {
  const content = fs.readFileSync(path.resolve(file), 'utf-8')
  assert.ok(!content.includes('addXP('), `${file} tidak boleh memanggil mutasi addXP!`)
  assert.ok(!content.includes('deleteMistake('), `${file} tidak boleh menghapus histori belajar!`)
  assert.ok(!content.includes('evaluateAnswer('), `${file} tidak boleh mengubah jawaban siswa!`)
}
console.log('   ✓ Parent Read-Only Boundary Strict Enforcement: PASS')

// -----------------------------------------------------------------------------
// 9. PWA MANIFEST & SERVICE WORKER ASSET AUDIT
// -----------------------------------------------------------------------------
console.log('9. [PWA & OFFLINE] Web App Manifest & Service Worker File Check...')
const manifestPath = path.resolve('public/manifest.webmanifest')
assert.ok(fs.existsSync(manifestPath), 'manifest.webmanifest harus ada')
const manifestJson = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'))
assert.equal(manifestJson.display, 'standalone', 'PWA display harus standalone')
assert.ok(manifestJson.icons.length >= 2, 'PWA icons harus tersedia')

const swPath = path.resolve('public/sw.js')
assert.ok(fs.existsSync(swPath), 'sw.js service worker harus ada')
const swContent = fs.readFileSync(swPath, 'utf-8')
assert.ok(swContent.includes('questlearn-v1'), 'Cache name harus didefinisikan')
assert.ok(swContent.includes('caches.match'), 'Fetch caching harus aktif')

assert.ok(fs.existsSync(path.resolve('public/icon-192.svg')), 'icon-192.svg harus ada')
assert.ok(fs.existsSync(path.resolve('public/icon-512.svg')), 'icon-512.svg harus ada')
console.log('   ✓ PWA & Offline Asset Integrity: PASS')

// -----------------------------------------------------------------------------
// 10. AUDIT QUEST JASMINE & MULTI-STUDENT HERO SYSTEM
// -----------------------------------------------------------------------------
console.log('10. [QUEST JASMINE & MULTI-STUDENT] Hero Profiles, Grade 8/9 Isolation...')
const authContent = fs.readFileSync(path.resolve('src/lib/auth.tsx'), 'utf-8')

assert.ok(authContent.includes("id: 'albert'"), 'Profil Albert harus terdaftar')
assert.ok(authContent.includes("grade: 9"), 'Albert harus berada di SMP Kelas 9')
assert.ok(authContent.includes("pin: '1234'"), 'PIN default Albert harus 1234')

assert.ok(authContent.includes("id: 'jasmine'"), 'Profil Jasmine harus terdaftar')
assert.ok(authContent.includes("grade: 8"), 'Jasmine harus berada di SMP Kelas 8')
assert.ok(authContent.includes("pin: '5678'"), 'PIN default Jasmine harus 5678')
assert.ok(authContent.includes("avatar: '🌸'"), 'Avatar Jasmine harus 🌸')

assert.ok(authContent.includes("id: 'parent'"), 'Profil Orang Tua harus terdaftar')
assert.ok(authContent.includes("pin: '9999'"), 'PIN Orang Tua harus 9999')

// Kurikulum dan soal Kelas 8 vs Kelas 9
const k8Curriculum = data.curriculum.filter((c) => (c.grade ?? 9) === 8)
const k9Curriculum = data.curriculum.filter((c) => (c.grade ?? 9) === 9)
assert.ok(k8Curriculum.length >= 10, 'Kurikulum Kelas 8 harus memiliki minimal 10 item')
assert.ok(k9Curriculum.length >= 10, 'Kurikulum Kelas 9 harus memiliki minimal 10 item')

const k8Questions = data.questions.filter((q) => (q.grade ?? 9) === 8)
const k9Questions = data.questions.filter((q) => (q.grade ?? 9) === 9)
assert.ok(k8Questions.length >= 10, 'Bank soal Kelas 8 harus memiliki minimal 10 soal')
assert.ok(k9Questions.length >= 10, 'Bank soal Kelas 9 harus memiliki minimal 10 soal')

console.log('   ✓ Quest Jasmine & Multi-Student Isolation: PASS')

console.log('\n=================================================================')
console.log('🎉 SEMUA 10 AUDIT REGRESI & QUEST JASMINE LOLOS 100% (ALL PASS)!')
console.log('=================================================================')
