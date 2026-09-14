// Entitas konten — bentuk kanonik yang dipakai seluruh aplikasi.
// Sumber data (Google Sheets atau seed) harus menghasilkan bentuk ini (Phase 2, D-002).

export type Priority = 1 | 2 | 3
export type SubjectStatus = 'active' | 'coming'
export type QuestionType = 'mcq' | 'true_false' | 'short' | 'numeric' | 'matching' | 'ordering'
export type LessonType = 'lesson' | 'quiz' | 'review'
export type Difficulty = 1 | 2 | 3

export interface Subject {
  id: string
  name: string
  emoji: string
  colorFrom: string
  colorTo: string
  description: string
  priority: Priority
  status: SubjectStatus
  sortOrder: number
}

export interface Curriculum {
  id: string
  subjectId: string
  title: string
  description: string
  sortOrder: number
  grade?: number
}

export interface Competency {
  id: string
  topicId: string
  code: string
  description: string
  sortOrder: number
  grade?: number
}

export interface Topic {
  id: string
  curriculumId: string
  subjectId: string
  title: string
  description: string
  sortOrder: number
  grade?: number
}

export interface Lesson {
  id: string
  topicId: string
  subjectId: string
  title: string
  description: string
  durationMin: number
  type: LessonType
  sortOrder: number
  grade?: number
}

export interface Question {
  id: string
  lessonId: string
  subjectId: string
  type: QuestionType
  prompt: string
  /** opsi untuk mcq/matching/ordering */
  options: string[]
  /** jawaban benar: format string[] sesuai tipe soal */
  answer: string[]
  explanation: string
  /** petunjuk bertahap (PRD §19) */
  hints?: string[]
  /** reward XP default (jika tidak diatur, dihitung dari difficulty) */
  xp?: number
  /** atribusi sumber resmi (D-008) */
  source: string
  difficulty: Difficulty
  grade?: number
}

export const SUBJECT_PRIORITY_LABEL: Record<Priority, string> = {
  1: 'Ujian Nasional',
  2: 'Agama',
  3: 'Tambahan',
}