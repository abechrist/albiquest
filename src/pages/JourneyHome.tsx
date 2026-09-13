import { Link } from 'react-router-dom'
import { useProgress } from '../lib/progress'
import { useData } from '../lib/store'

// "Peta Petualangan": ringkasan progress per mapel — entry point utama siswa.
// D-005: daftar & progress dihitung dari store, tidak di-hardcode.

export function JourneyHome() {
  const { data } = useData()
  const { completed } = useProgress()

  if (!data) return null

  const active = data.subjects.filter((s) => s.status === 'active').sort((a, b) => a.sortOrder - b.sortOrder)
  const rows = active.map((s) => {
    const lessons = data.lessons.filter((l) => l.subjectId === s.id)
    const done = lessons.filter((l) => completed.has(l.id)).length
    return { subject: s, done, total: lessons.length }
  })
  const doneAll = rows.reduce((n, r) => n + r.done, 0)
  const totalAll = rows.reduce((n, r) => n + r.total, 0)
  const pct = totalAll ? Math.round((doneAll / totalAll) * 100) : 0

  return (
    <div className="space-y-4">
      <div className="card p-5 space-y-3 bg-gradient-to-br from-primary to-primary-deep !border-transparent">
        <h2 className="h-title text-white">Peta Petualangan</h2>
        <p className="text-xs text-white/70 leading-relaxed">
          Selesaikan pelajaran satu per satu. Setiap mapel punya jalur kurikulumnya sendiri.
        </p>
        <div className="flex items-end justify-between gap-3">
          <div className="flex-1">
            <div className="track !bg-white/25">
              <div className="track-fill" style={{ width: `${pct}%` }} />
            </div>
          </div>
          <span className="stat text-gold tabular">{doneAll}/{totalAll}</span>
        </div>
      </div>

      {rows.map(({ subject, done, total }) => {
        const subPct = total ? Math.round((done / total) * 100) : 0
        return (
          <Link
            key={subject.id}
            to={`/student/subjects/${subject.id}`}
            className="card flex items-center gap-3 p-3 active:translate-y-[1px]"
          >
            <div
              className="h-11 w-11 shrink-0 rounded-xl flex items-center justify-center text-xl shadow-sm"
              style={{ backgroundImage: `linear-gradient(135deg, ${subject.colorFrom}, ${subject.colorTo})` }}
            >
              {subject.emoji}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-2">
                <p className="font-bold text-sm truncate">{subject.name}</p>
                <span className="text-[11px] text-slate-400 tabular">{total ? `${done}/${total}` : '—'}</span>
              </div>
              <div className="track mt-1.5 !h-2">
                <div className="track-fill" style={{ width: `${subPct}%` }} />
              </div>
            </div>
          </Link>
        )
      })}

      {totalAll === 0 && (
        <div className="card p-6 text-center">
          <p className="text-3xl">🗺️</p>
          <p className="font-bold text-sm mt-2">Belum ada konten</p>
          <p className="text-xs text-slate-500 mt-1">Pelajaran akan muncul setelah konten dimuat.</p>
        </div>
      )}
    </div>
  )
}