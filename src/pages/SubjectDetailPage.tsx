import { Link, useNavigate, useParams } from 'react-router-dom'
import type { Lesson } from '../lib/domain'
import { useProgress } from '../lib/progress'
import { useData } from '../lib/store'

// Halaman detail mapel: kurikulum → topik → pelajaran (acceptance Phase 3).
// Konten 100% dari store (D-005); progress dari useProgress (D-003).

const TYPE_ICON: Record<Lesson['type'], string> = { lesson: '📖', quiz: '⚔️', review: '🧠' }
const TYPE_LABEL: Record<Lesson['type'], string> = { lesson: 'Materi', quiz: 'Kuis', review: 'Review' }

import { useProfile } from '../lib/auth'

export function SubjectDetailPage() {
  const { subjectId = '' } = useParams()
  const { data, loading } = useData()
  const { completed } = useProgress()
  const { active } = useProfile()
  const navigate = useNavigate()

  if (loading) return <p className="py-10 text-center text-sm text-slate-400">Memuat…</p>
  if (!data) return null

  const subject = data.subjects.find((s) => s.id === subjectId)
  if (!subject) {
    return (
      <div className="card p-6 text-center space-y-3">
        <p className="text-3xl">🧭</p>
        <p className="font-bold text-sm">Mapel tidak ditemukan</p>
        <Link to="/student/subjects" className="btn-quest inline-flex !px-5 !py-2 text-xs">
          Kembali ke daftar mapel
        </Link>
      </div>
    )
  }

  const currentGrade = active?.grade ?? 9
  const lessons = data.lessons.filter(
    (l) => l.subjectId === subject.id && (l.grade ?? 9) === currentGrade,
  )
  const doneCount = lessons.filter((l) => completed.has(l.id)).length
  const total = lessons.length
  const pct = total ? Math.round((doneCount / total) * 100) : 0

  return (
    <div className="space-y-4">
      <button onClick={() => navigate(-1)} className="chip bg-surface-high text-slate-600 cursor-pointer">
        ← Kembali
      </button>

      {/* Header mapel */}
      <div className="card p-5 flex items-center gap-4">
        <div
          className="h-16 w-16 shrink-0 rounded-2xl flex items-center justify-center text-3xl sm:text-4xl shadow-sm"
          style={{ backgroundImage: `linear-gradient(135deg, ${subject.colorFrom}, ${subject.colorTo})` }}
        >
          {subject.emoji}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 leading-tight">{subject.name}</h2>
            <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-black text-slate-700">
              Kelas {currentGrade}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 leading-relaxed">{subject.description}</p>
        </div>
      </div>

      {/* Progress mapel */}
      <div className="card p-5 space-y-2.5">
        <div className="flex items-center justify-between text-sm sm:text-base">
          <p className="font-extrabold text-slate-900">Progress Mapel</p>
          <span className="stat text-quest">{total ? `${doneCount}/${total} Selesai` : '—'}</span>
        </div>
        <div className="track !h-3">
          <div className="track-fill" style={{ width: `${pct}%` }} />
        </div>
      </div>

      {/* Kurikulum → topik → pelajaran */}
      {data.curriculum
        .filter((c) => c.subjectId === subject.id && (c.grade ?? 9) === currentGrade)
        .sort((a, b) => a.sortOrder - b.sortOrder)
        .map((cur) => {
          const topics = data.topics
            .filter((t) => t.curriculumId === cur.id && (t.grade ?? 9) === currentGrade)
            .sort((a, b) => a.sortOrder - b.sortOrder)
          return (
            <section key={cur.id} className="space-y-3 pt-2">
              <div>
                <h3 className="font-black text-base sm:text-lg text-slate-900">{cur.title}</h3>
                <p className="text-xs sm:text-sm text-slate-500">{cur.description}</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {topics.map((topic) => {
                  const topicLessons = lessons
                    .filter((l) => l.topicId === topic.id)
                    .sort((a, b) => a.sortOrder - b.sortOrder)
                  const done = topicLessons.filter((l) => completed.has(l.id)).length
                  return (
                    <div key={topic.id} className="card p-4 sm:p-5 space-y-2.5">
                      <div className="flex items-center justify-between gap-2">
                        <p className="font-extrabold text-sm sm:text-base text-slate-900">{topic.title}</p>
                        {topicLessons.length > 0 && (
                          <span className="chip bg-surface-high text-primary text-xs font-bold tabular">
                            {done}/{topicLessons.length}
                          </span>
                        )}
                      </div>
                      {topic.description && <p className="text-xs sm:text-sm text-slate-500">{topic.description}</p>}
                      <div className="space-y-2 pt-1">
                        {topicLessons.map((lesson) => {
                          const isDone = completed.has(lesson.id)
                          return (
                            <button
                              key={lesson.id}
                              onClick={() => navigate(`/student/subjects/${subject.id}/lessons/${lesson.id}`)}
                              className="w-full flex items-center gap-3 rounded-xl bg-canvas px-3.5 py-3 text-left cursor-pointer active:translate-y-[1px] hover:bg-slate-100 transition-colors"
                            >
                              <span className="text-xl sm:text-2xl">{TYPE_ICON[lesson.type]}</span>
                              <span className="min-w-0 flex-1">
                                <span className="block text-sm font-bold text-slate-800 truncate">{lesson.title}</span>
                                <span className="block text-xs text-slate-400 tabular mt-0.5">
                                  {TYPE_LABEL[lesson.type]} · {lesson.durationMin} mnt
                                </span>
                              </span>
                              {isDone ? (
                                <span className="h-6 w-6 rounded-full bg-quest text-white text-xs font-black flex items-center justify-center shrink-0">✓</span>
                              ) : (
                                <span className="h-6 w-6 rounded-full border-2 border-slate-300 shrink-0" />
                              )}
                            </button>
                          )
                        })}
                        {topicLessons.length === 0 && (
                          <p className="text-xs text-slate-400 italic">Topik ini belum punya pelajaran.</p>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
              {topics.length === 0 && (
                <p className="text-xs text-slate-400 italic">Belum ada topik pada kurikulum ini.</p>
              )}
            </section>
          )
        })}
      {total === 0 && (
        <div className="card p-6 text-center">
          <p className="text-3xl">🌱</p>
          <p className="font-bold text-sm mt-2">Belum ada konten</p>
          <p className="text-xs text-slate-500 mt-1">Konten mapel ini sedang disusun.</p>
        </div>
      )}
    </div>
  )
}