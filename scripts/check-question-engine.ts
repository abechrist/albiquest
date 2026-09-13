// Unit test untuk Question Evaluator (Node.js runner tanpa dependensi luar)
// Jalankan: node --experimental-strip-types scripts/check-question-engine.ts

import assert from 'node:assert/strict'
import type { Question } from '../src/lib/domain.ts'
import {
  calculateEarnedXP,
  evaluateAnswer,
  normalizeText,
  parseMatchingOptions,
} from '../src/lib/question-evaluator.ts'
import { seedRows } from '../src/lib/seed.ts'
import { parseSheetRows } from '../src/lib/validate.ts'

console.log('--- Menjalankan Unit Test Question Engine ---')

// 1. Test normalizeText
assert.equal(normalizeText('  Halo, Dunia!  '), 'halo dunia')
assert.equal(normalizeText('x² - 5x + 6 = 0'), 'x² 5x 6 0')
assert.equal(normalizeText('FAKTA dan data.'), 'fakta dan data')
console.log('✓ normalizeText: PASS')

// 2. Test MCQ (Pilihan Ganda)
const sampleMcq: Question = {
  id: 'q-test-mcq',
  lessonId: 'l1',
  subjectId: 'matematika',
  type: 'mcq',
  prompt: 'Akar dari x² - 5x + 6 = 0',
  options: ['x = 2 atau x = 3', 'x = -2 atau x = -3', 'x = 1 atau x = 6'],
  answer: ['0'], // Pilihan pertama
  explanation: 'Faktorkan menjadi (x-2)(x-3)=0',
  source: 'Kemdikbud',
  difficulty: 2,
}
assert.equal(evaluateAnswer(sampleMcq, ['0']), true, 'MCQ jawaban benar harus true')
assert.equal(evaluateAnswer(sampleMcq, ['1']), false, 'MCQ jawaban salah harus false')
assert.equal(evaluateAnswer(sampleMcq, []), false, 'MCQ kosong harus false')
assert.equal(evaluateAnswer(sampleMcq, null), false, 'MCQ null harus false')
console.log('✓ MCQ Evaluation: PASS')

// 3. Test True/False (Benar / Salah)
const sampleTf: Question = {
  id: 'q-test-tf',
  lessonId: 'l1',
  subjectId: 'matematika',
  type: 'true_false',
  prompt: 'Persamaan x² = 16 memiliki dua akar berbeda',
  options: [],
  answer: ['true'],
  explanation: 'x = 4 atau x = -4',
  source: 'Kemdikbud',
  difficulty: 1,
}
assert.equal(evaluateAnswer(sampleTf, 'true'), true, 'True/False true harus true')
assert.equal(evaluateAnswer(sampleTf, 'false'), false, 'True/False false harus false')
console.log('✓ True/False Evaluation: PASS')

// 4. Test Short Answer (Isian Singkat)
const sampleShort: Question = {
  id: 'q-test-short',
  lessonId: 'l1',
  subjectId: 'bahasa-indonesia',
  type: 'short',
  prompt: 'Ciri khas informasi teks eksposisi',
  options: [],
  answer: ['fakta', 'objektif', 'nyata'],
  explanation: 'Berdasarkan data faktual',
  source: 'Kemdikbud',
  difficulty: 2,
}
assert.equal(evaluateAnswer(sampleShort, 'Fakta'), true, 'Short answer case insensitive harus true')
assert.equal(evaluateAnswer(sampleShort, '  berdasarkan FAKTA nyata  '), true, 'Short answer substring harus true')
assert.equal(evaluateAnswer(sampleShort, 'fiksi belaka'), false, 'Short answer salah harus false')
assert.equal(evaluateAnswer(sampleShort, ''), false, 'Short answer kosong harus false')
console.log('✓ Short Answer Evaluation: PASS')

// 5. Test Numeric (Angka)
const sampleNumeric: Question = {
  id: 'q-test-num',
  lessonId: 'l1',
  subjectId: 'matematika',
  type: 'numeric',
  prompt: 'Berapa nilai 3/4 dalam desimal?',
  options: [],
  answer: ['0.75'],
  explanation: '3 dibagi 4 adalah 0,75',
  source: 'Kemdikbud',
  difficulty: 1,
}
assert.equal(evaluateAnswer(sampleNumeric, '0.75'), true, 'Numeric titik desimal harus true')
assert.equal(evaluateAnswer(sampleNumeric, '0,75'), true, 'Numeric koma desimal harus true')
assert.equal(evaluateAnswer(sampleNumeric, 0.75), true, 'Numeric tipe number harus true')
assert.equal(evaluateAnswer(sampleNumeric, '0.74'), false, 'Numeric salah harus false')
console.log('✓ Numeric Evaluation: PASS')

// 6. Test Matching (Menjodohkan)
const sampleMatching: Question = {
  id: 'q-test-match',
  lessonId: 'l1',
  subjectId: 'matematika',
  type: 'matching',
  prompt: 'Pasangkan diskriminan dengan jenis akar',
  options: [
    'D > 0 | Dua akar berlainan',
    'D = 0 | Dua akar kembar',
    'D < 0 | Tidak ada akar real',
  ],
  answer: [
    'D > 0 | Dua akar berlainan',
    'D = 0 | Dua akar kembar',
    'D < 0 | Tidak ada akar real',
  ],
  explanation: 'Sifat diskriminan',
  source: 'Kemdikbud',
  difficulty: 2,
}
assert.equal(
  evaluateAnswer(sampleMatching, {
    'D > 0': 'Dua akar berlainan',
    'D = 0': 'Dua akar kembar',
    'D < 0': 'Tidak ada akar real',
  }),
  true,
  'Matching semua pasangan benar harus true',
)
assert.equal(
  evaluateAnswer(sampleMatching, {
    'D > 0': 'Dua akar kembar', // tertukar
    'D = 0': 'Dua akar berlainan',
    'D < 0': 'Tidak ada akar real',
  }),
  false,
  'Matching pasangan tertukar harus false',
)
assert.equal(
  evaluateAnswer(sampleMatching, {
    'D > 0': 'Dua akar berlainan',
  }),
  false,
  'Matching belum lengkap harus false',
)
console.log('✓ Matching Evaluation: PASS')

// 7. Test Ordering (Mengurutkan)
const sampleOrdering: Question = {
  id: 'q-test-order',
  lessonId: 'l1',
  subjectId: 'bahasa-indonesia',
  type: 'ordering',
  prompt: 'Urutan struktur teks eksposisi',
  options: ['Penegasan Ulang', 'Tesis', 'Rangkaian Argumen'],
  answer: ['Tesis', 'Rangkaian Argumen', 'Penegasan Ulang'],
  explanation: 'Tesis -> Argumen -> Penegasan Ulang',
  source: 'Kemdikbud',
  difficulty: 1,
}
assert.equal(
  evaluateAnswer(sampleOrdering, ['Tesis', 'Rangkaian Argumen', 'Penegasan Ulang']),
  true,
  'Ordering urutan benar harus true',
)
assert.equal(
  evaluateAnswer(sampleOrdering, ['Tesis', 'Penegasan Ulang', 'Rangkaian Argumen']),
  false,
  'Ordering urutan terbalik harus false',
)
console.log('✓ Ordering Evaluation: PASS')

// 8. Test Scoring & XP Calculation
// Difficulty 1: base 10 XP
const qDiff1: Question = { ...sampleMcq, difficulty: 1 }
assert.equal(calculateEarnedXP(qDiff1, true, 1, 1), 10, 'Diff 1 tanpa hint percobaan 1 = 10 XP')
assert.equal(calculateEarnedXP(qDiff1, true, 2, 1), 5, 'Diff 1 buka hint level 2 = 5 XP (-5 penalti)')
assert.equal(calculateEarnedXP(qDiff1, false, 1, 1), 0, 'Jawaban salah = 0 XP')

// Difficulty 2: base 20 XP
const qDiff2: Question = { ...sampleMcq, difficulty: 2 }
assert.equal(calculateEarnedXP(qDiff2, true, 1, 1), 20, 'Diff 2 percobaan 1 = 20 XP')
assert.equal(calculateEarnedXP(qDiff2, true, 2, 1), 15, 'Diff 2 buka hint = 15 XP')
assert.equal(calculateEarnedXP(qDiff2, true, 1, 2), 18, 'Diff 2 percobaan ke-2 = 18 XP')
console.log('✓ Scoring & XP Calculation: PASS')

// 9. Verifikasi seluruh soal yang ada di dataset seed
const parsedData = parseSheetRows(seedRows)
assert.ok(parsedData.questions.length >= 6, 'Minimal 6 soal ada di seed')
for (const q of parsedData.questions) {
  assert.ok(q.id, `Soal ${q.id} harus memiliki ID`)
  assert.ok(q.prompt, `Soal ${q.id} harus memiliki prompt`)
  assert.ok(q.explanation, `Soal ${q.id} harus memiliki explanation`)
  assert.ok(q.source, `Soal ${q.id} harus memiliki atribusi sumber`)
  assert.ok(
    ['mcq', 'true_false', 'short', 'numeric', 'matching', 'ordering'].includes(q.type),
    `Tipe soal ${q.type} harus valid`,
  )

  // Verifikasi parsing matching options jika tipe matching
  if (q.type === 'matching') {
    const pairs = parseMatchingOptions(q.options)
    assert.ok(pairs.length > 0, `Matching ${q.id} harus punya pairs`)
    assert.ok(pairs.every((p) => p.left && p.right), `Matching ${q.id} setiap pair harus ada kiri dan kanan`)
  }

  // Verifikasi answer tidak kosong
  assert.ok(q.answer.length > 0, `Soal ${q.id} harus memiliki answer`)
}
console.log(`✓ Verifikasi ${parsedData.questions.length} Soal Seed: SEMUA VALID!`)

console.log('============================================')
console.log('🎉 SEMUA UNIT TEST QUESTION ENGINE BERHASIL (PASS)!')
console.log('============================================')
