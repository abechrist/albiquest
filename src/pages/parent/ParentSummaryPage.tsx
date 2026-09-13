// Dashboard Ringkasan Orang Tua (Parent Cockpit) — Phase 10
// Sesuai prd.md §28–30, agent-prompt.md §61, dan Stitch parent_overview_mastery.

import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAdaptiveLearning } from '../../lib/adaptive'
import { useGamification } from '../../lib/gamification'
import { getStoredExamHistory } from '../../lib/mock-exam'
import { useProgress } from '../../lib/progress'
import { useData } from '../../lib/store'

export function ParentSummaryPage() {
  const { data } = useData()
  const { completed } = useProgress()
  const { state } = useGamification(1250)
  const examHistory = getStoredExamHistory()

  const [cheerSent, setCheerSent] = useState<boolean>(false)

  const subjects = data?.subjects ?? []
  const topics = data?.topics ?? []
  const lessons = data?.lessons ?? []

  const { subjectMasteries, weakTopics, mistakesCount } = useAdaptiveLearning(
    subjects,
    topics,
    lessons,
    completed,
  )

  const handleSendCheer = () => {
    setCheerSent(true)
    setTimeout(() => setCheerSent(false), 4000)
  }

  return (
    <div className="space-y-5 pb-6">
      {/* 1. Header Mode Pengawas & Pekan */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 rounded-full bg-indigo-50 px-2.5 py-1 text-[11px] font-bold text-indigo-700">
          <span>🛡️</span>
          <span>Mode Pendamping Santai (Read-Only)</span>
        </div>
        <span className="text-[11px] font-semibold text-slate-400">Pekan Ini</span>
      </div>

      {/* 2. Kartu Fokus Siswa (Albert Tan) */}
      <div className="card relative overflow-hidden p-4 bg-white shadow-sm border border-slate-200/80">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="relative flex-shrink-0">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-tr from-indigo-600 to-emerald-400 text-2xl shadow-sm">
                👦🏻
              </div>
              <span className="absolute bottom-0 right-0 h-3.5 w-3.5 rounded-full bg-emerald-500 ring-2 ring-white" />
            </div>
            <div className="flex flex-col min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <h2 className="text-sm font-black text-slate-900">Albert Tan</h2>
                <span className="rounded-full bg-indigo-100 px-2 py-0.5 text-[10px] font-bold text-indigo-700">
                  SMP Kelas 9 • SMP Pangudi Luhur
                </span>
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5 flex items-center gap-1">
                <span>⏱️</span>
                <span>Aktif belajar hari ini • Fokus belajar terjaga baik</span>
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleSendCheer}
            className="flex-shrink-0 flex h-10 w-10 items-center justify-center rounded-full bg-amber-100 text-amber-800 shadow-sm transition-all hover:bg-amber-200 active:scale-95 cursor-pointer"
            title="Kirim Pesan Semangat ke Albert"
          >
            <span className="text-lg">🎉</span>
          </button>
        </div>

        {cheerSent && (
          <div className="mt-3 flex items-center gap-2 rounded-xl bg-emerald-50 p-2.5 text-xs font-semibold text-emerald-800 transition-all border border-emerald-200 animate-fadeIn">
            <span>✨</span>
            <span>Pesan semangat telah terkirim ke beranda petualangan Albert!</span>
          </div>
        )}
      </div>

      {/* 3. Capaian Pekan Ini (Grid 2x2 Sesuai Stitch) */}
      <section className="space-y-2">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
            Capaian Pekan Ini
          </h3>
          <span className="text-[11px] font-bold text-emerald-600 flex items-center gap-0.5">
            <span>↗</span> Konsistensi Sangat Baik
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2.5">
          {/* Metrik 1: Streak Belajar */}
          <div className="card p-3.5 bg-white border border-slate-200/80">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-500">Streak Belajar</span>
              <span className="text-base">🔥</span>
            </div>
            <div className="mt-2 flex items-baseline gap-1">
              <span className="text-2xl font-black text-slate-900">{state.streakDays}</span>
              <span className="text-xs font-bold text-slate-500">Hari Berturut</span>
            </div>
            <div className="mt-2 h-1.5 w-full rounded-full bg-slate-100 overflow-hidden">
              <div className="h-full rounded-full bg-amber-500 w-full" />
            </div>
          </div>

          {/* Metrik 2: Total Waktu Belajar */}
          <div className="card p-3.5 bg-white border border-slate-200/80">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-500">Waktu Belajar</span>
              <span className="text-base">⏱️</span>
            </div>
            <div className="mt-2 flex items-baseline gap-1">
              <span className="text-2xl font-black text-slate-900">4j 25m</span>
            </div>
            <span className="mt-1 text-[10px] font-bold text-emerald-600 flex items-center gap-0.5">
              <span>✓</span> Target 4 jam tercapai
            </span>
          </div>

          {/* Metrik 3: Sesi Selesai */}
          <div className="card p-3.5 bg-white border border-slate-200/80">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-500">Modul Tuntas</span>
              <span className="text-base">📖</span>
            </div>
            <div className="mt-2 flex items-baseline gap-1">
              <span className="text-2xl font-black text-slate-900">{completed.size}</span>
              <span className="text-xs font-bold text-slate-500">Pelajaran</span>
            </div>
            <span className="mt-1 text-[10px] text-slate-400">Rata-rata 15m per sesi</span>
          </div>

          {/* Metrik 4: Ketuntasan Bank Salah */}
          <div className="card p-3.5 bg-white border border-slate-200/80">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-500">Bank Kesalahan</span>
              <span className="text-base">🧠</span>
            </div>
            <div className="mt-2 flex items-baseline gap-1">
              <span className="text-2xl font-black text-slate-900">{mistakesCount}</span>
              <span className="text-xs font-bold text-slate-500">Perlu Review</span>
            </div>
            <span className="mt-1 text-[10px] text-indigo-600 font-semibold">
              Belajar dari kesalahan mandiri
            </span>
          </div>
        </div>
      </section>

      {/* 4. Ringkasan Penguasaan Materi per Mata Pelajaran */}
      <section className="card p-4 bg-white border border-slate-200/80 space-y-3">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
            Penguasaan Materi (Mastery)
          </h3>
          <Link to="/parent/progress" className="text-xs font-bold text-indigo-600 hover:underline">
            Detail →
          </Link>
        </div>

        <div className="space-y-3">
          {subjectMasteries.slice(0, 4).map((sub) => (
            <div key={sub.subjectId} className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-800 flex items-center gap-1.5">
                  <span>{sub.subjectEmoji}</span>
                  <span>{sub.subjectName}</span>
                </span>
                <span className="font-black text-slate-900">{sub.averageScore}%</span>
              </div>
              <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${sub.averageScore}%`,
                    backgroundColor: sub.color,
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 5. Rekomendasi Pendampingan Orang Tua (PRD §40) */}
      <section className="rounded-2xl border border-indigo-200 bg-gradient-to-br from-indigo-50 via-white to-indigo-50/40 p-4 space-y-2">
        <div className="flex items-center gap-2">
          <span className="text-xl">💡</span>
          <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-900">
            Saran Pendampingan Pekan Ini (Tanpa Tekanan)
          </h3>
        </div>
        <p className="text-xs text-slate-700 leading-relaxed">
          {weakTopics.length > 0
            ? `Albert saat ini sedang memperkuat materi ${weakTopics[0].title}. Dukung Albert dengan memberi apresiasi atas ketekunannya dan sediakan waktu istirahat yang cukup.`
            : 'Progres belajar Albert berjalan sangat harmonis. Berikan pujian hangat saat makan malam atas kedisiplinannya menjaga streak belajar!'}
        </p>
        <div className="pt-2 border-t border-indigo-100 flex items-center justify-between text-[11px] text-indigo-800">
          <span>Prinsip: Pantau • Pahami • Dukung</span>
          <Link to="/parent/mistakes" className="font-bold underline">
            Lihat Catatan Belajar →
          </Link>
        </div>
      </section>

      {/* 6. Riwayat Simulasi Ujian Terkini */}
      {examHistory.length > 0 && (
        <section className="card p-4 bg-white border border-slate-200/80 space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
              Hasil Simulasi Ujian ANBK Terakhir
            </h3>
            <span className="text-[10px] text-slate-400">Tersimpan Otomatis</span>
          </div>

          <div className="space-y-2">
            {examHistory.slice(0, 2).map((exam) => (
              <div
                key={exam.id}
                className="flex items-center justify-between rounded-xl bg-slate-50 p-3 border border-slate-100"
              >
                <div>
                  <p className="text-xs font-bold text-slate-900">{exam.presetTitle}</p>
                  <p className="text-[10px] text-slate-500">
                    {new Date(exam.timestamp).toLocaleDateString('id-ID')} • {exam.correctCount} dari {exam.totalQuestions} soal benar
                  </p>
                </div>
                <span
                  className={`rounded-full px-2.5 py-0.5 text-xs font-black ${
                    exam.passed ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                  }`}
                >
                  Skor {exam.score}
                </span>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
