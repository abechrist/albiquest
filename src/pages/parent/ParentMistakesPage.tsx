// Halaman Analisis Kesalahan Belajar untuk Orang Tua — Phase 10
// Sesuai prd.md §35 & §41 (Filosofi: MONITOR -> UNDERSTAND -> SUPPORT, bukan PUNISH).
// Mendukung Multi-Student (Albert Kelas 9 & Jasmine Kelas 8).

import { useOutletContext } from 'react-router-dom'
import { getMistakesStats, getStoredMistakes } from '../../lib/mistakes'
import type { ParentContextType } from '../ParentHome'

export function ParentMistakesPage() {
  const outletContext = useOutletContext<ParentContextType | undefined>()
  const selectedChild = outletContext?.selectedChild || 'albert'
  const isJasmine = selectedChild === 'jasmine'
  const childName = isJasmine ? 'Jasmine' : 'Albert'

  const mistakes = getStoredMistakes(selectedChild)
  const stats = getMistakesStats(mistakes)

  const pendingMistakes = mistakes.filter((m) => m.status === 'needs_review')
  const masteredMistakes = mistakes.filter((m) => m.status === 'mastered')

  return (
    <div className="space-y-5 pb-6">
      <div>
        <h2 className="text-base font-black text-slate-900">
          Analisis Catatan Belajar & Kesalahan ({childName})
        </h2>
        <p className="text-xs text-slate-500">
          Memahami tantangan belajar {childName} untuk memberikan dukungan yang tepat tanpa memicu rasa cemas
        </p>
      </div>

      {/* Ringkasan Bank Kesalahan */}
      <div className="grid grid-cols-3 gap-2.5">
        <div className="card p-3 bg-white border border-slate-200/80 text-center">
          <span className="text-[10px] font-bold uppercase text-slate-400">Total Dicatat</span>
          <p className="mt-1 text-xl font-black text-slate-900">{stats.total}</p>
        </div>
        <div className="card p-3 bg-white border border-slate-200/80 text-center">
          <span className="text-[10px] font-bold uppercase text-slate-400">Perlu Diulang</span>
          <p className="mt-1 text-xl font-black text-rose-600">{stats.needsReview}</p>
        </div>
        <div className="card p-3 bg-white border border-slate-200/80 text-center">
          <span className="text-[10px] font-bold uppercase text-slate-400">Telah Dikuasai</span>
          <p className="mt-1 text-xl font-black text-emerald-600">{stats.mastered}</p>
        </div>
      </div>

      {/* Panduan Pendampingan: Pertanyaan Pemantik Diskusi Hangat */}
      <section className="rounded-2xl border border-amber-200 bg-amber-50/70 p-4 space-y-3">
        <div className="flex items-center gap-2">
          <span className="text-xl">☕</span>
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-amber-900">
              Tips Obrolan Santai dengan {childName}
            </h3>
            <p className="text-[11px] text-amber-800">
              Gunakan pertanyaan reflektif saat santai keluarga, bukan interogasi akademik
            </p>
          </div>
        </div>

        <div className="space-y-2 text-xs text-slate-700">
          <div className="rounded-xl bg-white/90 p-3 border border-amber-100">
            <span className="font-bold text-amber-900 block">💬 Contoh Pertanyaan 1:</span>
            <p className="italic text-slate-600 mt-0.5">
              &quot;Ayah/Ibu lihat di aplikasi kamu tadi seru banget ngerjain soal latihan. Bagian mana yang paling menantang buatmu?&quot;
            </p>
          </div>
          <div className="rounded-xl bg-white/90 p-3 border border-amber-100">
            <span className="font-bold text-amber-900 block">💬 Contoh Pertanyaan 2:</span>
            <p className="italic text-slate-600 mt-0.5">
              &quot;Keren, kamu sudah berhasil menguasai kembali {masteredMistakes.length} soal di Bank Salah! Apa trik yang bikin kamu paham langkahnya?&quot;
            </p>
          </div>
        </div>
      </section>

      {/* Pola Kesalahan yang Sedang Dihadapi */}
      <section className="space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
          Konsep yang Sedang Diulang {childName} ({pendingMistakes.length} Soal)
        </h3>

        {pendingMistakes.length === 0 ? (
          <div className="card p-6 bg-white border border-slate-200/80 text-center space-y-2">
            <span className="text-3xl">✨</span>
            <h4 className="text-sm font-bold text-slate-800">Semua Kesalahan Sudah Dikuasai!</h4>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              {childName} telah berhasil menuntaskan seluruh latihan di Bank Kesalahan. Pemahaman konsepnya sangat solid saat ini.
            </p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {pendingMistakes.map((m) => (
              <div
                key={m.id}
                className="card p-3.5 bg-white border border-slate-200/80 space-y-2"
              >
                <div className="flex items-center justify-between">
                  <span className="rounded-md bg-indigo-50 px-2 py-0.5 text-[10px] font-bold text-indigo-700 uppercase">
                    {m.subjectId}
                  </span>
                  <span className="text-[10px] text-slate-400">
                    {m.attempts} kali percobaan salah
                  </span>
                </div>
                <p className="text-xs font-semibold text-slate-800">
                  {typeof m.studentAnswer === 'string' ? m.studentAnswer : 'Soal #' + m.questionId.slice(-4)}
                </p>
                <div className="rounded-lg bg-slate-50 p-2 text-[11px] text-slate-600 border border-slate-100">
                  <span className="font-bold text-slate-700">Catatan Pendamping: </span>
                  {childName} perlu waktu latihan tenang untuk memahami konsep ini secara mandiri tanpa terburu-buru.
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
