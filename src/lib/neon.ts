// Klien Neon PostgreSQL Serverless untuk AlbiQuest
// Mendukung query langsung via HTTP/WebSocket tanpa koneksi pooler berat di browser.
import { neon } from '@neondatabase/serverless'
import type { Competency, Curriculum, Lesson, Question, Subject, Topic } from './domain'
import type { DataSet } from './store'

const CACHE_PREFIX = 'albiquest.neon.cache.v1'
const TTL_MS = 60 * 60 * 1000 // Cache 1 jam di browser

interface CacheEntry<T> {
  at: number
  data: T
}

function readCache<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return null
    const entry = JSON.parse(raw) as CacheEntry<T>
    if (!entry.data || Date.now() - entry.at > TTL_MS) return null
    return entry.data
  } catch {
    return null
  }
}

function writeCache<T>(key: string, data: T) {
  try {
    localStorage.setItem(key, JSON.stringify({ at: Date.now(), data }))
  } catch {
    // abaikan jika localStorage penuh
  }
}

export function clearNeonCache() {
  try {
    for (const key of Object.keys(localStorage)) {
      if (key.startsWith(CACHE_PREFIX)) localStorage.removeItem(key)
    }
  } catch {
    // abaikan
  }
}

export async function fetchDataSetFromNeon(connectionUrl: string): Promise<DataSet> {
  const cacheKey = `${CACHE_PREFIX}.dataset`
  const cached = readCache<DataSet>(cacheKey)

  try {
    const sql = neon(connectionUrl)

    // Ambil seluruh data dari Neon secara paralel
    const [
      rawSubjects,
      rawCurriculum,
      rawCompetencies,
      rawTopics,
      rawLessons,
      rawQuestions,
    ] = await Promise.all([
      sql`SELECT * FROM subjects ORDER BY sort_order ASC;`,
      sql`SELECT * FROM curriculum ORDER BY sort_order ASC;`,
      sql`SELECT * FROM competencies ORDER BY sort_order ASC;`,
      sql`SELECT * FROM topics ORDER BY sort_order ASC;`,
      sql`SELECT * FROM lessons ORDER BY sort_order ASC;`,
      sql`SELECT * FROM questions ORDER BY difficulty ASC;`,
    ])

    const subjects: Subject[] = rawSubjects.map((s: any) => ({
      id: s.id,
      name: s.name,
      emoji: s.emoji,
      colorFrom: s.color_from,
      colorTo: s.color_to,
      description: s.description,
      priority: Number(s.priority) as 1 | 2 | 3,
      status: s.status,
      sortOrder: Number(s.sort_order),
    }))

    const curriculum: Curriculum[] = rawCurriculum.map((c: any) => ({
      id: c.id,
      subjectId: c.subject_id,
      title: c.title,
      description: c.description,
      sortOrder: Number(c.sort_order),
    }))

    const competencies: Competency[] = rawCompetencies.map((comp: any) => ({
      id: comp.id,
      topicId: comp.topic_id,
      code: comp.code,
      description: comp.description,
      sortOrder: Number(comp.sort_order),
    }))

    const topics: Topic[] = rawTopics.map((t: any) => ({
      id: t.id,
      curriculumId: t.curriculum_id,
      subjectId: t.subject_id,
      title: t.title,
      description: t.description,
      sortOrder: Number(t.sort_order),
    }))

    const lessons: Lesson[] = rawLessons.map((l: any) => ({
      id: l.id,
      topicId: l.topic_id,
      subjectId: l.subject_id,
      title: l.title,
      description: l.description,
      durationMin: Number(l.duration_min),
      type: l.type,
      sortOrder: Number(l.sort_order),
    }))

    const questions: Question[] = rawQuestions.map((q: any) => ({
      id: q.id,
      lessonId: q.lesson_id,
      subjectId: q.subject_id,
      type: q.type,
      prompt: q.prompt,
      options: typeof q.options === 'string' ? JSON.parse(q.options) : q.options,
      answer: typeof q.answer === 'string' ? JSON.parse(q.answer) : q.answer,
      explanation: q.explanation,
      hints: q.hints ? (typeof q.hints === 'string' ? JSON.parse(q.hints) : q.hints) : undefined,
      xp: q.xp ? Number(q.xp) : undefined,
      source: q.source,
      difficulty: Number(q.difficulty) as 1 | 2 | 3,
    }))

    const result: DataSet = {
      subjects,
      curriculum,
      competencies,
      topics,
      lessons,
      questions,
    }

    // Tulis ke cache untuk akses offline instan
    writeCache(cacheKey, result)
    return result
  } catch (err) {
    console.warn('Gagal menghubungi database Neon, mencoba fallback cache/offline:', err)
    if (cached) {
      return cached
    }
    throw err
  }
}
