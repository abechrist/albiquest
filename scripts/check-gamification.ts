// Unit test untuk Gamification Service (Phase 6)
// Jalankan: node --experimental-strip-types scripts/check-gamification.ts

import assert from 'node:assert/strict'
import {
  calculateLevel,
  getDailyMissions,
  recordGamificationEvent,
  saveGamificationState,
  touchDailyStreak,
} from '../src/lib/gamification.ts'

console.log('--- Menjalankan Unit Test Gamification Service ---')

// 1. Test calculateLevel
const lvl1 = calculateLevel(0)
assert.equal(lvl1.level, 1)
assert.equal(lvl1.title, 'Pengelana Pemula')
assert.equal(lvl1.currentLevelXP, 0)
assert.equal(lvl1.xpRemaining, 250)

const lvl6 = calculateLevel(1250)
assert.equal(lvl6.level, 6)
assert.equal(lvl6.title, 'Penjelajah Logika')
assert.equal(lvl6.currentLevelXP, 0)

const lvl8 = calculateLevel(1800)
assert.equal(lvl8.level, 8)
assert.equal(lvl8.title, 'Master Numerasi')
assert.equal(lvl8.progressPct, 20) // 50 / 250 = 20%
console.log('✓ calculateLevel: PASS')

// 2. Test touchDailyStreak
const baseState = {
  streakDays: 5,
  lastActiveDate: '2026-09-12', // Kemarin
  unlockedBadges: {},
  claimedMissions: {},
  questionsAnsweredCount: 0,
  lessonsCompletedCount: 0,
  mistakesMasteredCount: 0,
}
saveGamificationState(baseState)

const streakUpdated = touchDailyStreak(baseState)
assert.ok(streakUpdated.streakDays >= 5, 'Streak tidak boleh berkurang pada hari aktif')
console.log('✓ touchDailyStreak: PASS')

// 3. Test recordGamificationEvent & Badge Unlocks
const { state: s1, newlyUnlockedBadges: b1 } = recordGamificationEvent({ type: 'lesson_completed' }, 1250)
assert.ok(s1.lessonsCompletedCount >= 1, 'Pelajaran selesai bertambah')
assert.ok(s1.unlockedBadges['badge-first-step'], 'Badge Langkah Pertama harus terbuka')
console.log('✓ recordGamificationEvent & Badge Unlocks: PASS')

// 4. Test Daily Missions & Anti-Exploit
const missions = getDailyMissions(s1)
assert.equal(missions.length, 3, 'Harus ada 3 misi harian')
for (const m of missions) {
  assert.ok(m.title, 'Misi harus memiliki judul')
  assert.ok(m.rewardXP > 0, 'Hadiah XP harus > 0')
  assert.ok(m.target > 0, 'Target harus > 0')
}

// Anti-exploit check: tidak bisa klaim misi jika belum selesai
const incompleteMission = missions.find((m) => m.current < m.target)
if (incompleteMission) {
  assert.equal(incompleteMission.isClaimed, false, 'Misi belum selesai tidak boleh otomatis diklaim')
}
console.log('✓ Daily Missions & Anti-Exploit: PASS')

console.log('============================================')
console.log('🎉 SEMUA UNIT TEST GAMIFIKASI BERHASIL (PASS)!')
console.log('============================================')
