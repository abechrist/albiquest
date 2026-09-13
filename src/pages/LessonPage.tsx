import { Link, useParams } from 'react-router-dom'
import type { Lesson } from '../lib/domain'
import { useProgress } from '../lib/progress'
import { useData } from '../lib/store'

// Halaman satu pelajaran: detail + tombol "Tandai Selesai" (acceptance Phase 3).
// Isi materi/soal di dalam pelajaran menyusul Phase 4 (question engine).

const TYPE_LABEL: Record<Lesson['type'], string> = { lesson: '📖 Materi', quiz: '⚔️ Kuis', review: '🧠 Review' }

export function LessonPage() {
  const { subjectId = '', lessonId = '' } = useParams()
  const { data, loading } = useData()
  const { completed, complete } = useProgress()

  if (loading) return <p className="py-10 text-center text-sm text-slate-400">Memuat…</p>
  if (!data) return null

  const lesson = data.lessons.find((l) => l.id === lessonId)
  if (!lesson) {
    return (
      <div className="card p-6 text-center space-y-3">
        <p className="text-3xl">🔍</p>
        <p className="font-bold text-sm">Pelajaran tidak ditemukan</p>
        <Link to={`/student/subjects/${subjectId}`} className="btn-quest inline-flex !px-5 !py-2 text-xs">
          Kembali ke mapel
        </Link>
      </div>
    )
  }

  const topic = data.topics.find((t) => t.id === lesson.topicId)
  const subject = data.subjects.find((s) => s.id === subjectId)
  const isDone = completed.has(lesson.id)

  return (
    <div className="space-y-4">
      <Link to={`/student/subjects/${subjectId}`} className="chip bg-surface-high text-slate-600 inline-flex">
        ← {subject?.name}
      </Link>

      <div className="card p-5 space-y-3">
        <span className="chip bg-surface-high text-primary text-[10px]">{topic?.title ?? 'Topik'}</span>
        <h2 className="h-headline leading-tight">{lesson.title}</h2>
        <p className="text-xs text-slate-500">{TYPE_LABEL[lesson.type]} · {lesson.durationMin} menit</p>
        <p className="text-sm text-slate-700 leading-relaxed">{lesson.description}</p>

        <div className="rounded-xl bg-canvas p-4 text-center">
          <p className="text-xs text-slate-500 mb-1">Isi materi & soal latihan</p>
          <p className="font-bold text-sm">Menyusul di Phase 4 ⚔️</p>
        </div>

        <button
          onClick={() => complete(lesson.id)}
          disabled={isDone}
          className={`btn-primary ${isDone ? '!bg-quest opacity-90' : ''}`}
        >
          {isDone ? '✓ Selesai' : 'Tandai Selesai'}
        </button>
        {isDone && (
          <p className="text-center text-xs text-quest-deep font-semibold">
            Mantap! Pelajaran ini selesai. 🎉
          </p>
        )}
      </div>
    </div>
  )
}