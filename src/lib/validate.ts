// Validasi baris spreadsheet -> entitas ter-tipe. Gagal cepat (fail fast) dengan
// pesan jelas berisi nama sheet + nomor baris, supaya orang tua bisa perbaiki
// sheet-nya langsung.
import type {
  Competency,
  Curriculum,
  Lesson,
  Priority,
  Question,
  QuestionType,
  Subject,
  SubjectStatus,
  Topic,
} from './domain'

import { SheetsError } from './sheets.ts'

export const SHEET_NAMES = [
  'subjects',
  'curriculum',
  'competencies',
  'topics',
  'lessons',
  'questions',
] as const
export type SheetName = (typeof SHEET_NAMES)[number]
export type SheetRows = Record<SheetName, string[][]>

type Rec = Record<string, string>

function fail(sheet: string, row: number, msg: string): never {
  throw new SheetsError('validation', `Sheet "${sheet}" baris ${row + 1}: ${msg}`)
}

function headerIndex(headers: string[]): (key: string) => number {
  const idx = new Map(headers.map((h, i) => [h.trim(), i]))
  return (key: string) => {
    const i = idx.get(key)
    if (i === undefined) throw new SheetsError('validation', `Kolom "${key}" tidak ada di sheet. Periksa baris header.`)
    return i
  }
}

function rowToRec(headers: string[], row: string[], idx: (k: string) => number): Rec {
  const rec: Rec = {}
  for (const key of headers) rec[key.trim()] = (row[idx(key)] ?? '').trim()
  return rec
}

const reqStr = (r: Rec, k: string, sheet: string, n: number) => {
  const v = r[k]
  if (!v) fail(sheet, n, `kolom "${k}" wajib diisi`)
  return v
}
const optStr = (r: Rec, k: string) => r[k] ?? ''
const optInt = (r: Rec, k: string, fallback = 9): number => {
  const v = r[k]
  if (!v || !/^\d+$/.test(v)) return fallback
  return Number(v)
}
const reqInt = (r: Rec, k: string, sheet: string, n: number) => {
  const v = reqStr(r, k, sheet, n)
  if (!/^\d+$/.test(v)) fail(sheet, n, `kolom "${k}" harus angka (ditemukan "${v}")`)
  return Number(v)
}
const reqEnum = <T extends string | number>(r: Rec, k: string, vals: readonly T[], sheet: string, n: number): T => {
  const v = reqStr(r, k, sheet, n)
  const match = (vals as readonly (string | number)[]).find((x) => String(x) === v)
  if (match === undefined) fail(sheet, n, `kolom "${k}" harus salah satu dari: ${vals.join(', ')} (ditemukan "${v}")`)
  return match as T
}
const reqJsonArray = (r: Rec, k: string, sheet: string, n: number): string[] => {
  const v = reqStr(r, k, sheet, n)
  if (v === '[]') return []
  try {
    const parsed: unknown = JSON.parse(v)
    if (!Array.isArray(parsed) || parsed.some((x) => typeof x !== 'string')) fail(sheet, n, `kolom "${k}" harus JSON array of string, contoh: ["a","b"]`)
    return parsed as string[]
  } catch {
    fail(sheet, n, `kolom "${k}" bukan JSON valid, contoh: ["a","b"]`)
  }
}

type Validator<T> = (rec: Rec, sheet: string, n: number) => T

function parseSheet<T>(rows: string[][], sheet: string, validate: Validator<T>): T[] {
  if (!rows.length) throw new SheetsError('validation', `Sheet "${sheet}" kosong (tidak ada baris header).`)
  const idx = headerIndex(rows[0])
  const out: T[] = []
  for (let n = 1; n < rows.length; n++) {
    const row = rows[n]
    if (row.length === 1 && row[0].trim() === '') continue // baris kosong
    out.push(validate(rowToRec(rows[0], row, idx), sheet, n))
  }
  return out
}

const validateSubject: Validator<Subject> = (r, s, n) => ({
  id: reqStr(r, 'id', s, n),
  name: reqStr(r, 'name', s, n),
  emoji: reqStr(r, 'emoji', s, n),
  colorFrom: reqStr(r, 'color_from', s, n),
  colorTo: reqStr(r, 'color_to', s, n),
  description: reqStr(r, 'description', s, n),
  priority: reqEnum<Priority>(r, 'priority', [1, 2, 3] as const, s, n),
  status: reqEnum<SubjectStatus>(r, 'status', ['active', 'coming'] as const, s, n),
  sortOrder: reqInt(r, 'sort_order', s, n),
})

const validateCurriculum: Validator<Curriculum> = (r, s, n) => ({
  id: reqStr(r, 'id', s, n),
  subjectId: reqStr(r, 'subject_id', s, n),
  title: reqStr(r, 'title', s, n),
  description: reqStr(r, 'description', s, n),
  sortOrder: reqInt(r, 'sort_order', s, n),
  grade: optInt(r, 'grade', 9),
})

const validateCompetency: Validator<Competency> = (r, s, n) => ({
  id: reqStr(r, 'id', s, n),
  topicId: reqStr(r, 'topic_id', s, n),
  code: reqStr(r, 'code', s, n),
  description: reqStr(r, 'description', s, n),
  sortOrder: reqInt(r, 'sort_order', s, n),
  grade: optInt(r, 'grade', 9),
})

const validateTopic: Validator<Topic> = (r, s, n) => ({
  id: reqStr(r, 'id', s, n),
  curriculumId: reqStr(r, 'curriculum_id', s, n),
  subjectId: reqStr(r, 'subject_id', s, n),
  title: reqStr(r, 'title', s, n),
  description: reqStr(r, 'description', s, n),
  sortOrder: reqInt(r, 'sort_order', s, n),
  grade: optInt(r, 'grade', 9),
})

const validateLesson: Validator<Lesson> = (r, s, n) => ({
  id: reqStr(r, 'id', s, n),
  topicId: reqStr(r, 'topic_id', s, n),
  subjectId: reqStr(r, 'subject_id', s, n),
  title: reqStr(r, 'title', s, n),
  description: reqStr(r, 'description', s, n),
  durationMin: reqInt(r, 'duration_min', s, n),
  type: reqEnum(r, 'type', ['lesson', 'quiz', 'review'] as const, s, n),
  sortOrder: reqInt(r, 'sort_order', s, n),
  grade: optInt(r, 'grade', 9),
})

const optJsonArray = (r: Rec, k: string): string[] | undefined => {
  const v = r[k]
  if (!v || v.trim() === '' || v === '[]') return undefined
  try {
    const parsed: unknown = JSON.parse(v)
    if (Array.isArray(parsed) && parsed.every((x) => typeof x === 'string')) {
      return parsed as string[]
    }
  } catch {
    // fallback if not valid JSON
  }
  return undefined
}

const validateQuestion: Validator<Question> = (r, s, n) => ({
  id: reqStr(r, 'id', s, n),
  lessonId: reqStr(r, 'lesson_id', s, n),
  subjectId: reqStr(r, 'subject_id', s, n),
  type: reqEnum<QuestionType>(r, 'type', ['mcq', 'true_false', 'short', 'numeric', 'matching', 'ordering'] as const, s, n),
  prompt: reqStr(r, 'prompt', s, n),
  options: reqJsonArray(r, 'options', s, n),
  answer: reqJsonArray(r, 'answer', s, n),
  explanation: optStr(r, 'explanation'),
  hints: optJsonArray(r, 'hints'),
  source: optStr(r, 'source'),
  difficulty: (() => {
    const d = reqInt(r, 'difficulty', s, n)
    if (d < 1 || d > 3) fail(s, n, 'kolom "difficulty" harus 1, 2, atau 3')
    return d as Question['difficulty']
  })(),
  grade: optInt(r, 'grade', 9),
})

export function parseSheetRows(rows: SheetRows) {
  return {
    subjects: parseSheet(rows.subjects, 'subjects', validateSubject),
    curriculum: parseSheet(rows.curriculum, 'curriculum', validateCurriculum).sort((a, b) => a.sortOrder - b.sortOrder),
    competencies: parseSheet(rows.competencies, 'competencies', validateCompetency).sort((a, b) => a.sortOrder - b.sortOrder),
    topics: parseSheet(rows.topics, 'topics', validateTopic).sort((a, b) => a.sortOrder - b.sortOrder),
    lessons: parseSheet(rows.lessons, 'lessons', validateLesson).sort((a, b) => a.sortOrder - b.sortOrder),
    questions: parseSheet(rows.questions, 'questions', validateQuestion),
  }
}

// Cek referensi antar entitas — menangkap typo ID di sheet (sangat umum saat edit manual).
export function assertRefs(ds: ReturnType<typeof parseSheetRows>): void {
  const ids = (list: { id: string }[]) => new Set(list.map((x) => x.id))
  const subjectIds = ids(ds.subjects)
  const topicIds = ids(ds.topics)
  const lessonIds = ids(ds.lessons)
  const curriculumIds = ids(ds.curriculum)
  const missing: string[] = []
  const check = (owner: string, ref: string | undefined, pool: Set<string>) => {
    if (ref && !pool.has(ref)) missing.push(`${owner} -> ${ref}`)
  }
  for (const c of ds.curriculum) check(`curriculum ${c.id}`, c.subjectId, subjectIds)
  for (const t of ds.topics) {
    check(`topic ${t.id}`, t.subjectId, subjectIds)
    check(`topic ${t.id}`, t.curriculumId, curriculumIds)
  }
  for (const c of ds.competencies) check(`competency ${c.id}`, c.topicId, topicIds)
  for (const l of ds.lessons) {
    check(`lesson ${l.id}`, l.subjectId, subjectIds)
    check(`lesson ${l.id}`, l.topicId, topicIds)
  }
  for (const q of ds.questions) {
    check(`question ${q.id}`, q.subjectId, subjectIds)
    check(`question ${q.id}`, q.lessonId, lessonIds)
  }
  if (missing.length) throw new SheetsError('validation', `Referensi tidak ditemukan: ${missing.join('; ')}`)
}