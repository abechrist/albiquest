import { Link, useNavigate, useParams } from 'react-router-dom'
import type { Lesson, Question } from '../lib/domain'
import { useProgress } from '../lib/progress'
import { useProfile } from '../lib/auth'
import { useData } from '../lib/store'

// Halaman satu pelajaran: detail + tombol "Tandai Selesai" (acceptance Phase 3).
// Isi materi/soal di dalam pelajaran menyusul Phase 4 (question engine).

const TYPE_LABEL: Record<Lesson['type'], string> = { lesson: '📖 Materi', quiz: '⚔️ Kuis', review: '🧠 Review' }
const QUESTION_TYPE_LABEL: Record<Question['type'], string> = {
  mcq: '🔘 Pilihan Ganda',
  true_false: '⚖️ Benar/Salah',
  short: '✍️ Isian Singkat',
  numeric: '🔢 Angka',
  matching: '🔗 Menjodohkan',
  ordering: '📶 Mengurutkan',
}

export function LessonPage() {
  const { subjectId = '', lessonId = '' } = useParams()
  const { data, loading } = useData()
  const { completed, complete } = useProgress()
  const { addXP } = useProfile()
  const navigate = useNavigate()

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
  const questions = data.questions.filter((q) => q.lessonId === lessonId)

  const handleComplete = () => {
    if (!isDone) {
      complete(lesson.id)
      addXP(50)
    }
  }

  return (
    <div className="space-y-4">
      <Link to={`/student/subjects/${subjectId}`} className="chip bg-surface-high text-slate-600 inline-flex">
        ← {subject?.name}
      </Link>

      <div className="card p-5 sm:p-6 space-y-4">
        <span className="chip bg-surface-high text-primary text-xs font-bold">{topic?.title ?? 'Topik'}</span>
        <h2 className="text-xl sm:text-2xl font-black text-slate-900 leading-tight">{lesson.title}</h2>
        <p className="text-xs sm:text-sm font-semibold text-slate-500">{TYPE_LABEL[lesson.type]} · {lesson.durationMin} menit</p>
        <p className="text-sm sm:text-base text-slate-700 leading-relaxed">{lesson.description}</p>

        {/* Daftar soal (Phase 4) */}
        {questions.length > 0 ? (
          <div className="space-y-2.5 pt-2">
            <h3 className="font-extrabold text-sm sm:text-base text-slate-900">Soal Latihan ({questions.length} Soal)</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {questions.map((q) => (
                <button
                  key={q.id}
                  onClick={() => navigate(`/student/subjects/${subjectId}/lessons/${lessonId}/questions/${q.id}`)}
                  className="w-full flex items-center gap-3 rounded-xl bg-canvas px-4 py-3 text-left cursor-pointer active:translate-y-[1px] hover:bg-slate-100 transition-colors border border-slate-200/60"
                >
                  <span className="text-base">{QUESTION_TYPE_LABEL[q.type]}</span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-bold text-slate-800 truncate">{q.prompt}</span>
                    <span className="block text-xs text-slate-400 mt-0.5">Sumber: {q.source}</span>
                  </span>
                  <span className="text-slate-300 font-bold text-sm">➔</span>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="rounded-xl bg-canvas p-5 text-center">
            <p className="text-xs text-slate-500 mb-1">Belum ada soal</p>
            <p className="font-bold text-sm sm:text-base">Soal akan muncul setelah konten dimuat.</p>
          </div>
        )}

        <button
          onClick={handleComplete}
          disabled={isDone}
          className={`btn-primary ${isDone ? '!bg-quest opacity-90' : ''}`}
        >
          {isDone ? '✓ Selesai (+50 XP)' : 'Tandai Selesai (+50 XP)'}
        </button>
        {isDone && (
          <p className="text-center text-xs sm:text-sm text-quest-deep font-bold">
            Mantap! Pelajaran ini selesai (+50 XP diraih). 🎉
          </p>
        )}
      </div>
    </div>
  )
}