import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import type { Question } from '../lib/domain.ts'
import {
  seedInitialMistakesIfEmpty,
  useMistakes,
} from '../lib/mistakes.ts'
import { QuestionRenderer, useQuestionEngine } from '../lib/question-engine.tsx'
import { useData } from '../lib/store.tsx'

import { useProfile } from '../lib/auth.tsx'

// Bank Kesalahan / My Mistakes — Phase 5
// Mengadopsi desain visual Stitch my_mistakes_review_bank:
// - Hero header dengan statistik (Perlu Diulang, Dikuasai, Akurasi Retry).
// - Tombol Spaced Review Hari Ini.
// - Filter chip per mata pelajaran.
// - Kartu evaluasi kesalahan dengan komparasi Jawabanmu vs Jawaban Tepat.
// - Diagnosa konsep dan tombol Coba Lagi (Retry) interaktif.

export function MistakesPage() {
  const { data, loading } = useData()
  const { active } = useProfile()
  const { mistakes, stats } = useMistakes(active?.id)

  // Filter mapel yang sedang dipilih ('all' atau subjectId)
  const [selectedFilter, setSelectedFilter] = useState<string>('all')

  // State soal yang sedang di-retry secara langsung (modal/inline)
  const [retryingQuestion, setRetryingQuestion] = useState<Question | null>(null)

  // Accordion pembahasan yang terbuka (key: mistakeId)
  const [openExplanation, setOpenExplanation] = useState<Record<string, boolean>>({})

  // Seed contoh kesalahan awal jika store masih kosong
  useEffect(() => {
    if (data?.questions && active?.id) {
      const currentGrade = active?.grade ?? 9
      const gradeQuestions = data.questions.filter((q) => (q.grade ?? 9) === currentGrade)
      seedInitialMistakesIfEmpty(gradeQuestions, active.id)
    }
  }, [data?.questions, active?.id, active?.grade])

  if (loading) return <p className="py-10 text-center text-sm text-slate-400">Memuat Bank Kesalahan…</p>
  if (!data) return null

  // Daftar subject yang ada di dalam mistakes
  const subjectList = data.subjects.filter((s) => s.status === 'active')

  // Filter daftar kesalahan
  const filteredMistakes = mistakes.filter((m) => {
    if (selectedFilter === 'all') return true
    return m.subjectId === selectedFilter
  })

  const toggleExplanation = (id: string) => {
    setOpenExplanation((prev) => ({ ...prev, [id]: !prev[id] }))
  }

  // Format tanggal ramah pengguna
  const formatTimeAgo = (timestamp: number) => {
    const diffHours = Math.floor((Date.now() - timestamp) / (1000 * 60 * 60))
    if (diffHours < 1) return 'Baru saja'
    if (diffHours < 24) return `${diffHours} jam lalu`
    const diffDays = Math.floor(diffHours / 24)
    return `${diffDays} hari lalu`
  }

  return (
    <div className="space-y-4 pb-12">
      {/* 1. Hero Card: Bank Evaluasi Kesalahan (Stitch Design) */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-700 via-primary to-indigo-900 p-5 text-white shadow-xl shadow-primary/20">
        <div className="relative z-10 space-y-3">
          <div className="flex items-center justify-between">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-[11px] font-semibold text-white">
              <span>✨</span> Ruang Tumbuh & Eksplorasi
            </span>
            <div className="flex items-center gap-1 text-amber-300 font-black text-xs">
              <span>⭐</span>
              <span>+50 XP Bonus</span>
            </div>
          </div>

          <div>
            <h2 className="text-xl font-black tracking-tight text-white flex items-center gap-2">
              <span>Bank Evaluasi Kesalahan</span>
              <span className="inline-block">🎯</span>
            </h2>
            <p className="text-xs text-indigo-100 mt-1 leading-relaxed">
              Belajar dari kesalahan adalah cara tercepat menuju penguasaan materi sejati.
            </p>
          </div>

          {/* 3 Metric Counters */}
          <div className="grid grid-cols-3 gap-2.5 pt-2">
            <div className="flex flex-col items-center justify-center p-3 rounded-2xl bg-white/15 backdrop-blur-md text-center">
              <span className="text-2xl sm:text-3xl font-black text-rose-300">{stats.needsReview}</span>
              <span className="text-xs text-indigo-100 mt-1 font-bold">Perlu Diulang</span>
            </div>
            <div className="flex flex-col items-center justify-center p-3 rounded-2xl bg-white/15 backdrop-blur-md text-center">
              <span className="text-2xl sm:text-3xl font-black text-emerald-300">{stats.mastered}</span>
              <span className="text-xs text-indigo-100 mt-1 font-bold">Dikuasai</span>
            </div>
            <div className="flex flex-col items-center justify-center p-3 rounded-2xl bg-white/15 backdrop-blur-md text-center">
              <span className="text-2xl sm:text-3xl font-black text-amber-300">{stats.retryAccuracy}%</span>
              <span className="text-xs text-indigo-100 mt-1 font-bold">Akurasi Retry</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Tombol Aksi Utama: Mulai Spaced Review */}
      <Link
        to="/student/practice"
        className="group w-full relative flex items-center justify-between p-4 sm:p-5 rounded-2xl bg-primary text-white shadow-lg shadow-primary/25 transition-all duration-150 active:translate-y-0.5 cursor-pointer"
      >
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center text-2xl text-amber-300 group-hover:rotate-12 transition-transform">
            ⚡
          </div>
          <div className="flex flex-col text-left">
            <span className="text-base font-extrabold text-white leading-tight">
              Mulai Spaced Review Hari Ini
            </span>
            <span className="text-xs sm:text-sm text-indigo-100 mt-0.5">
              {stats.needsReview > 0
                ? `${stats.needsReview} Soal Terpilih Siap Diulang`
                : 'Uji Kembali Pemahaman Materi Ujian'}
            </span>
          </div>
        </div>
        <div className="flex items-center pl-2 text-white text-xl font-bold">➔</div>
      </Link>

      {/* 3. Filter Chips per Mata Pelajaran */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar -mx-1 px-1">
        <button
          type="button"
          onClick={() => setSelectedFilter('all')}
          className={`px-4 py-2 rounded-full text-xs sm:text-sm font-bold whitespace-nowrap transition-all cursor-pointer ${
            selectedFilter === 'all'
              ? 'bg-primary text-white shadow-sm'
              : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
          }`}
        >
          Semua ({mistakes.length})
        </button>

        {subjectList.map((sub) => {
          const count = mistakes.filter((m) => m.subjectId === sub.id).length
          if (count === 0 && selectedFilter !== sub.id) return null

          return (
            <button
              key={sub.id}
              type="button"
              onClick={() => setSelectedFilter(sub.id)}
              className={`px-4 py-2 rounded-full text-xs sm:text-sm font-bold whitespace-nowrap transition-all cursor-pointer ${
                selectedFilter === sub.id
                  ? 'bg-primary text-white shadow-sm'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              {sub.name} ({count})
            </button>
          )
        })}
      </div>

      {/* 4. Daftar Kartu Kesalahan (Mistake Cards) */}
      {filteredMistakes.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
          {filteredMistakes.map((record) => {
            const question = data.questions.find((q) => q.id === record.questionId)
            const subject = data.subjects.find((s) => s.id === record.subjectId)
            const isNeedsReview = record.status === 'needs_review'
            const isExpOpen = !!openExplanation[record.id]

            if (!question) return null

            // Format representasi jawaban siswa & jawaban benar
            const formatAns = (ans: unknown) => {
              if (Array.isArray(ans)) {
                if (question.type === 'mcq') {
                  const idx = Number.parseInt(String(ans[0]))
                  return question.options[idx] ?? ans.join(', ')
                }
                return ans.join(', ')
              }
              if (typeof ans === 'object' && ans !== null) {
                return Object.entries(ans)
                  .map(([k, v]) => `${k} ➔ ${v}`)
                  .join('; ')
              }
              if (ans === 'true') return 'Benar'
              if (ans === 'false') return 'Salah'
              return String(ans ?? '-')
            }

            return (
              <div
                key={record.id}
                className="relative p-5 rounded-2xl bg-white border border-slate-200/80 shadow-md shadow-slate-100 space-y-3.5 transition-all flex flex-col justify-between"
              >
                {/* Baris Header Kartu */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="px-2.5 py-0.5 rounded-full bg-indigo-50 text-primary font-bold text-[11px]">
                      {subject?.name ?? 'Mata Pelajaran'}
                    </span>
                    <span className="text-xs text-slate-500 font-medium truncate max-w-[180px]">
                      {question.source || 'Latihan'}
                    </span>
                  </div>

                  {/* Status Badge */}
                  <span
                    className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                      isNeedsReview
                        ? 'bg-rose-100 text-rose-800'
                        : 'bg-emerald-100 text-emerald-800'
                    }`}
                  >
                    {isNeedsReview ? '⚠️ Perlu Diulang' : '✓ Dikuasai'}
                  </span>
                </div>

                {/* Info Waktu & Percobaan */}
                <div className="flex items-center gap-2 text-slate-400 text-[11px]">
                  <span>🕒 {formatTimeAgo(record.timestamp)}</span>
                  <span>•</span>
                  <span className={isNeedsReview ? 'text-rose-600 font-medium' : 'text-slate-500'}>
                    {record.attempts}x percobaan salah
                  </span>
                  {record.hintUsed && (
                    <>
                      <span>•</span>
                      <span className="text-amber-600">💡 Memakai Petunjuk</span>
                    </>
                  )}
                </div>

                {/* Teks Soal */}
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <p className="text-xs text-slate-900 font-semibold leading-relaxed">
                    "{question.prompt}"
                  </p>
                </div>

                {/* Komparasi: Jawabanmu vs Jawaban Tepat */}
                <div className="grid grid-cols-2 gap-2">
                  {/* Jawaban Siswa (Salah) */}
                  <div className="p-2.5 rounded-xl bg-rose-50/80 border border-rose-100 flex flex-col justify-between">
                    <span className="text-[10px] font-bold text-rose-800 flex items-center gap-1">
                      <span>✕</span> Jawabanmu:
                    </span>
                    <span className="text-xs font-bold text-rose-900 mt-1 break-words">
                      {formatAns(record.studentAnswer)}
                    </span>
                  </div>

                  {/* Jawaban Benar */}
                  <div className="p-2.5 rounded-xl bg-emerald-50/80 border border-emerald-100 flex flex-col justify-between">
                    <span className="text-[10px] font-bold text-emerald-800 flex items-center gap-1">
                      <span>✓</span> Jawaban Tepat:
                    </span>
                    <span className="text-xs font-bold text-emerald-900 mt-1 break-words">
                      {formatAns(question.answer)}
                    </span>
                  </div>
                </div>

                {/* Kotak Diagnosa Konsep */}
                <div className="p-3 rounded-xl bg-amber-50/70 border border-amber-100 flex items-start gap-2">
                  <span className="text-base flex-shrink-0 mt-0.5">🧠</span>
                  <div className="flex-1 text-[11px] text-amber-950 leading-relaxed">
                    <strong className="block text-amber-900 font-bold mb-0.5">Diagnosa Konsep:</strong>
                    {question.explanation
                      ? question.explanation
                      : 'Perhatikan detail rumus dan langkah pengerjaan untuk menghindari kekeliruan perhitungan.'}
                  </div>
                </div>

                {/* Tombol Aksi: Coba Lagi & Pembahasan */}
                <div className="flex items-center gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setRetryingQuestion(question)}
                    className="flex-1 py-2.5 px-3 rounded-xl bg-primary text-white font-bold text-xs shadow-sm hover:bg-indigo-700 active:translate-y-0.5 transition-all text-center cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <span>🔄</span>
                    <span>Coba Lagi (Retry)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => toggleExplanation(record.id)}
                    className="py-2.5 px-3.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors cursor-pointer flex items-center gap-1"
                  >
                    <span>💡</span>
                    <span>{isExpOpen ? 'Tutup' : 'Pembahasan'}</span>
                  </button>
                </div>

                {/* Accordion Pembahasan Rinci */}
                {isExpOpen && (
                  <div className="p-3 rounded-xl bg-indigo-50/60 border border-indigo-100 text-xs text-slate-800 space-y-1.5 animate-in fade-in duration-200">
                    <strong className="text-primary font-bold flex items-center gap-1">
                      <span>📖</span> Langkah Penyelesaian:
                    </strong>
                    <p className="leading-relaxed">{question.explanation}</p>
                    <p className="text-[10px] text-slate-500 pt-1">
                      Sumber resmi materi: {question.source}
                    </p>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      ) : (
        /* State Kosong (Hebat!) */
        <div className="card p-8 text-center space-y-3">
          <span className="text-4xl block">🎉</span>
          <h3 className="font-bold text-base text-slate-900">Tidak Ada Kesalahan Tersisa!</h3>
          <p className="text-xs text-slate-500 max-w-xs mx-auto leading-relaxed">
            Luar biasa, Albert! Semua soal yang pernah kamu coba telah berhasil kamu kuasai.
          </p>
          <div className="pt-2">
            <Link to="/student/practice" className="btn-primary inline-flex !px-5 !py-2.5 text-xs">
              Mulai Sesi Latihan Baru ⚔️
            </Link>
          </div>
        </div>
      )}

      {/* 5. Modal Retry Soal Langsung */}
      {retryingQuestion && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-2xl p-4 max-h-[90vh] overflow-y-auto space-y-4 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b pb-2">
              <span className="text-xs font-bold text-primary flex items-center gap-1">
                <span>🔄</span> Coba Ulang Soal
              </span>
              <button
                type="button"
                onClick={() => setRetryingQuestion(null)}
                className="w-7 h-7 rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 flex items-center justify-center font-bold text-sm cursor-pointer"
              >
                ✕
              </button>
            </div>

            <RetryQuestionRunner
              question={retryingQuestion}
              onClose={() => setRetryingQuestion(null)}
            />
          </div>
        </div>
      )}
    </div>
  )
}

/** Runner khusus untuk modal retry */
function RetryQuestionRunner({
  question,
  onClose,
}: {
  question: Question
  onClose: () => void
}) {
  const engine = useQuestionEngine(question)

  return (
    <div className="space-y-3">
      <QuestionRenderer question={question} engine={engine} onNext={onClose} />
      {engine.state.isCorrect && (
        <div className="text-center pt-2">
          <button
            type="button"
            onClick={onClose}
            className="btn-quest !py-2.5 w-full text-xs cursor-pointer"
          >
            Selesai &amp; Simpan Status Dikuasai 🎉
          </button>
        </div>
      )}
    </div>
  )
}
