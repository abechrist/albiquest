import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { QuestionRenderer, useQuestionEngine } from '../lib/question-engine.tsx'
import { useData } from '../lib/store.tsx'

// Halaman latihan soal interaktif (Phase 4).
// Mengikuti visual Stitch interactive_practice_feedback:
// - Top session info: Topic chip, timer, stamina 3 hati, segmented progress.
// - Question Card: Difficulty badge, XP reward, prompt rapi.
// - Question Engine: 6 tipe soal, progressive hints, scoring, feedback edukatif.
// - Navigasi antar soal dalam pelajaran.

export function QuestionPage() {
  const { subjectId = '', lessonId = '', questionId = '' } = useParams()
  const { data, loading } = useData()
  const navigate = useNavigate()

  // Session timer (detik)
  const [seconds, setSeconds] = useState(0)
  useEffect(() => {
    const timer = setInterval(() => setSeconds((s) => s + 1), 1000)
    return () => clearInterval(timer)
  }, [])

  const formatTimer = (totalSeconds: number) => {
    const m = Math.floor(totalSeconds / 60)
      .toString()
      .padStart(2, '0')
    const s = (totalSeconds % 60).toString().padStart(2, '0')
    return `${m}:${s}`
  }

  if (loading) return <p className="py-10 text-center text-sm text-slate-400">Memuat…</p>
  if (!data) return null

  const question = data.questions.find((q) => q.id === questionId)
  const subject = data.subjects.find((s) => s.id === subjectId)
  const lesson = data.lessons.find((l) => l.id === lessonId)
  const topic = lesson ? data.topics.find((t) => t.id === lesson.topicId) : null

  if (!question) {
    return (
      <div className="card p-6 text-center space-y-3">
        <p className="text-3xl">❓</p>
        <p className="font-bold text-sm">Soal tidak ditemukan</p>
        <Link
          to={`/student/subjects/${subjectId}/lessons/${lessonId}`}
          className="btn-quest inline-flex !px-4 !py-2 text-xs"
        >
          Kembali ke Pelajaran
        </Link>
      </div>
    )
  }

  // Cari index soal dalam pelajaran
  const lessonQuestions = data.questions.filter((q) => q.lessonId === lessonId)
  const currentIndex = lessonQuestions.findIndex((q) => q.id === question.id)
  const questionNumber = currentIndex >= 0 ? currentIndex + 1 : 1
  const totalQuestions = Math.max(lessonQuestions.length, 1)
  const progressPercent = Math.round((questionNumber / totalQuestions) * 100)

  const nextQuestion = lessonQuestions[currentIndex + 1]

  const handleNext = () => {
    if (nextQuestion) {
      navigate(`/student/subjects/${subjectId}/lessons/${lessonId}/questions/${nextQuestion.id}`)
    } else {
      navigate(`/student/subjects/${subjectId}/lessons/${lessonId}`)
    }
  }

  return (
    <div className="space-y-3 pb-8">
      {/* Top Navigation & Session Info Bar (Stitch Vital Signs Bar) */}
      <div className="card p-3 space-y-2.5">
        <div className="flex items-center justify-between gap-2">
          {/* Topic Chip */}
          <Link
            to={`/student/subjects/${subjectId}/lessons/${lessonId}`}
            className="flex items-center gap-1.5 px-2.5 py-1 bg-surface-container rounded-full text-primary hover:bg-slate-200 transition-colors truncate max-w-[200px]"
          >
            <span className="text-xs">←</span>
            <span className="text-[11px] font-bold uppercase tracking-wider truncate">
              {subject?.name ?? 'Mapel'} • {topic?.title ?? 'Latihan'}
            </span>
          </Link>

          {/* Timer & 3 Hearts Stamina */}
          <div className="flex items-center gap-2 flex-shrink-0">
            {/* Timer */}
            <div className="flex items-center gap-1 px-2 py-0.5 bg-slate-100 rounded-full text-slate-600 text-xs font-mono font-semibold">
              <span>⏱️</span>
              <span>{formatTimer(seconds)}</span>
            </div>

            {/* Stamina 3 Hati */}
            <div className="flex items-center gap-0.5 px-2 py-0.5 bg-rose-50 rounded-full text-xs">
              <span className="text-rose-500">❤️</span>
              <span className="text-rose-500">❤️</span>
              <span className="text-rose-500">❤️</span>
            </div>
          </div>
        </div>

        {/* Segmented Level Progress Bar */}
        <div className="flex items-center justify-between gap-3 pt-0.5">
          <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-primary to-emerald-400 rounded-full transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <span className="text-[11px] text-slate-500 flex-shrink-0">
            Soal <strong className="text-slate-800">{questionNumber}</strong> dari {totalQuestions}
          </span>
        </div>
      </div>

      {/* Reusable Question Renderer with Key per Question */}
      <QuestionItem
        key={question.id}
        question={question}
        onNext={handleNext}
      />
    </div>
  )
}

/** Wrapper untuk reset hook saat pindah soal */
function QuestionItem({
  question,
  onNext,
}: {
  question: Parameters<typeof QuestionRenderer>[0]['question']
  onNext: () => void
}) {
  const engine = useQuestionEngine(question)
  return <QuestionRenderer question={question} engine={engine} onNext={onNext} />
}