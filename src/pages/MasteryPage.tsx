// Halaman Peta Penguasaan Materi (Topic & Subject Mastery) — Phase 7
// Sesuai prd.md §22, agent-prompt.md §58, dan desain Stitch Duolingo-adventure.

import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAdaptiveLearning } from '../lib/adaptive'
import { useProgress } from '../lib/progress'
import { useData } from '../lib/store'
import { useProfile } from '../lib/auth'

export function MasteryPage() {
  const { data } = useData()
  const { completed } = useProgress()
  const { active } = useProfile()
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>('all')

  const currentGrade = active?.grade ?? 9
  const subjects = data?.subjects ?? []
  const topics = (data?.topics ?? []).filter((t) => (t.grade ?? 9) === currentGrade)
  const lessons = (data?.lessons ?? []).filter((l) => (l.grade ?? 9) === currentGrade)

  const {
    subjectMasteries,
    weakTopics,
  } = useAdaptiveLearning(subjects, topics, lessons, completed)

  // Filter masteries
  const displayedMasteries = selectedSubjectId === 'all'
    ? subjectMasteries
    : subjectMasteries.filter((s) => s.subjectId === selectedSubjectId)

  // Rata-rata keseluruhan
  const totalScore = subjectMasteries.reduce((sum, s) => sum + s.averageScore, 0)
  const overallAvg = subjectMasteries.length > 0 ? Math.round(totalScore / subjectMasteries.length) : 0

  return (
    <div className="min-h-screen bg-slate-950 pb-24 text-slate-100 selection:bg-indigo-500/30">
      {/* Top Header */}
      <header className="sticky top-0 z-30 border-b border-slate-800/80 bg-slate-900/90 px-4 py-3.5 backdrop-blur-md">
        <div className="mx-auto flex max-w-4xl items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              to="/student"
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-700 bg-slate-800 text-slate-300 transition-colors hover:bg-slate-700"
              title="Kembali ke Beranda"
            >
              ←
            </Link>
            <div>
              <h1 className="text-lg font-bold tracking-tight text-white flex items-center gap-2">
                <span>🎯 Peta Penguasaan Materi</span>
              </h1>
              <p className="text-xs text-slate-400">Analisis penguasaan kompetensi & titik fokus belajarmu</p>
            </div>
          </div>
          <Link
            to="/student/practice"
            className="rounded-xl border-b-2 border-emerald-700 bg-emerald-500 px-3 py-1.5 text-xs font-bold text-white transition-all hover:bg-emerald-400 active:translate-y-0.5"
          >
            + Latihan Bebas
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 pt-6 space-y-6">
        {/* Ringkasan Status Belajar */}
        <div className="relative overflow-hidden rounded-3xl border border-indigo-500/30 bg-gradient-to-br from-indigo-950/80 via-slate-900 to-slate-950 p-5 md:p-6 shadow-xl">
          <div className="absolute right-0 top-0 -mr-8 -mt-8 h-40 w-40 rounded-full bg-indigo-500/10 blur-3xl" />
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 rounded-full border border-indigo-400/30 bg-indigo-500/10 px-3 py-1 text-xs font-semibold text-indigo-300">
                <span>📊 Status Kesiapan Ujian SMP</span>
              </div>
              <h2 className="mt-2 text-2xl font-black text-white">
                Rata-rata Penguasaan: <span className="text-indigo-400">{overallAvg}%</span>
              </h2>
              <p className="mt-1 text-xs text-slate-300 max-w-md">
                Dihitung secara adaptif dari penyelesaian modul, akurasi soal, dan ketuntasan di Bank Kesalahan.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex flex-col items-center justify-center rounded-2xl border border-slate-800 bg-slate-900/80 px-4 py-3 text-center min-w-[90px]">
                <span className="text-xl font-black text-emerald-400">
                  {subjectMasteries.flatMap((s) => s.topics).filter((t) => t.level === 'mastered').length}
                </span>
                <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Mahir 🟢</span>
              </div>
              <div className="flex flex-col items-center justify-center rounded-2xl border border-slate-800 bg-slate-900/80 px-4 py-3 text-center min-w-[90px]">
                <span className="text-xl font-black text-amber-400">
                  {subjectMasteries.flatMap((s) => s.topics).filter((t) => t.level === 'in_progress').length}
                </span>
                <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Proses 🟡</span>
              </div>
              <div className="flex flex-col items-center justify-center rounded-2xl border border-slate-800 bg-slate-900/80 px-4 py-3 text-center min-w-[90px]">
                <span className="text-xl font-black text-rose-400">
                  {weakTopics.length}
                </span>
                <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Perlu Latih 🔴</span>
              </div>
            </div>
          </div>
        </div>

        {/* Highlight Titik Fokus / Topik Lemah yang Perlu Latihan */}
        {weakTopics.length > 0 && (
          <section className="rounded-3xl border border-rose-500/20 bg-rose-950/20 p-5 backdrop-blur-sm">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="text-xl">⚠️</span>
                <h3 className="text-sm font-bold uppercase tracking-wider text-rose-300">
                  Fokus Perhatian Hari Ini (Perlu Diperkuat)
                </h3>
              </div>
              <span className="rounded-lg bg-rose-500/20 px-2 py-0.5 text-xs font-semibold text-rose-300">
                {weakTopics.length} Topik
              </span>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              {weakTopics.slice(0, 4).map((topic) => (
                <div
                  key={topic.id}
                  className="flex flex-col justify-between rounded-2xl border border-rose-500/30 bg-slate-900/80 p-4 transition-all hover:border-rose-400/50"
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-white text-sm">{topic.title}</h4>
                      <span className="rounded-full bg-rose-500/20 px-2.5 py-0.5 text-xs font-bold text-rose-400">
                        {topic.score}%
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-rose-200/80">{topic.diagnosis}</p>
                  </div>
                  <div className="mt-4 flex items-center justify-between border-t border-slate-800/80 pt-3">
                    <span className="text-[11px] text-slate-400">
                      Tingkat Saran: Level {topic.recommendedDifficulty}
                    </span>
                    <Link
                      to={`/student/practice?subject=${topic.subjectId}&topic=${topic.id}`}
                      className="rounded-xl border-b-2 border-rose-700 bg-rose-600 px-3 py-1.5 text-xs font-bold text-white shadow-sm transition-all hover:bg-rose-500 active:translate-y-0.5"
                    >
                      Latih Sekarang →
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Filter Tab Mata Pelajaran */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          <button
            onClick={() => setSelectedSubjectId('all')}
            className={`whitespace-nowrap rounded-xl px-4 py-2 text-xs font-bold transition-all ${
              selectedSubjectId === 'all'
                ? 'bg-indigo-600 text-white shadow-[0_3px_0_0_#3730a3]'
                : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-white'
            }`}
          >
            Semua Mata Pelajaran
          </button>
          {subjectMasteries.map((sub) => (
            <button
              key={sub.subjectId}
              onClick={() => setSelectedSubjectId(sub.subjectId)}
              className={`whitespace-nowrap flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-bold transition-all ${
                selectedSubjectId === sub.subjectId
                  ? 'bg-indigo-600 text-white shadow-[0_3px_0_0_#3730a3]'
                  : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-white'
              }`}
            >
              <span>{sub.subjectEmoji}</span>
              <span>{sub.subjectName}</span>
              <span className="rounded-md bg-slate-800 px-1.5 py-0.5 text-[10px] text-slate-300">
                {sub.averageScore}%
              </span>
            </button>
          ))}
        </div>

        {/* Detail Penguasaan per Mata Pelajaran & Topik */}
        <div className="space-y-6">
          {displayedMasteries.map((sub) => (
            <div
              key={sub.subjectId}
              className="rounded-3xl border border-slate-800 bg-slate-900/60 p-5 backdrop-blur-sm"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-indigo-500/10 text-2xl border border-indigo-500/20">
                    {sub.subjectEmoji}
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-base">{sub.subjectName}</h3>
                    <p className="text-xs text-slate-400">
                      {sub.topics.length} Topik Pembelajaran • Rata-rata {sub.averageScore}%
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-32 h-2.5 rounded-full bg-slate-800 overflow-hidden border border-slate-700/50">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${sub.averageScore}%`,
                        backgroundColor: sub.color,
                      }}
                    />
                  </div>
                  <span
                    className="text-xs font-bold px-2.5 py-0.5 rounded-full"
                    style={{
                      backgroundColor: `${sub.color}20`,
                      color: sub.color,
                    }}
                  >
                    {sub.averageScore}%
                  </span>
                </div>
              </div>

              {/* Daftar Topik */}
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {sub.topics.map((topic) => (
                  <div
                    key={topic.id}
                    className="rounded-2xl border border-slate-800/80 bg-slate-950/60 p-4 transition-all hover:border-slate-700"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h4 className="font-bold text-white text-sm">{topic.title}</h4>
                        <span className="text-[11px] text-slate-400">
                          {topic.completedLessons} dari {topic.totalLessons} materi selesai
                        </span>
                      </div>
                      <span
                        className="rounded-full px-2 py-0.5 text-[11px] font-bold"
                        style={{
                          backgroundColor: `${topic.color}20`,
                          color: topic.color,
                        }}
                      >
                        {topic.score}% • {topic.levelLabel}
                      </span>
                    </div>

                    {/* Progress bar */}
                    <div className="mt-3 h-2 w-full rounded-full bg-slate-800 overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${topic.score}%`,
                          backgroundColor: topic.color,
                        }}
                      />
                    </div>

                    <p className="mt-2 text-xs text-slate-400 line-clamp-2">{topic.diagnosis}</p>

                    <div className="mt-3 flex items-center justify-between border-t border-slate-800/50 pt-2.5">
                      <span className="text-[10px] text-slate-500">
                        {topic.unmasteredMistakes > 0
                          ? `⚠️ ${topic.unmasteredMistakes} Soal di Bank Salah`
                          : '✨ Tidak ada kendala'}
                      </span>
                      <Link
                        to={`/student/practice?subject=${topic.subjectId}&topic=${topic.id}`}
                        className="rounded-lg bg-indigo-600/20 border border-indigo-500/30 px-2.5 py-1 text-[11px] font-bold text-indigo-300 hover:bg-indigo-600 hover:text-white transition-colors"
                      >
                        Latih Topik →
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  )
}
