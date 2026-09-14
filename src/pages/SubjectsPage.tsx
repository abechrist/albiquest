import { useNavigate } from 'react-router-dom'
import { useData, resolveSource } from '../lib/store'
import type { Subject } from '../lib/domain'

// Konten TIDAK hardcoded di UI (D-005): daftar mapel dimuat dari store
// (seed lokal saat dev / Google Sheets saat VITE_SHEETS_ID terisi).

const PRIO_BADGE: Record<1 | 2 | 3, { label: string; className: string }> = {
  1: { label: '🎯 Ujian Nasional', className: 'bg-primary/10 text-primary' },
  2: { label: '⛪ Agama', className: 'bg-violet-100 text-violet-700' },
  3: { label: '➕ Tambahan', className: 'bg-slate-200 text-slate-600' },
}

import { useProfile } from '../lib/auth'

export function SubjectsPage() {
  const { data, error, loading, reload } = useData()
  const { active } = useProfile()
  const isSheets = resolveSource().kind === 'sheets'

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="h-headline">Mata Pelajaran</h2>
          <p className="text-sm text-slate-500 mt-0.5">
            Materi kurikulum lengkap SMP Kelas {active?.grade ?? 9}
          </p>
        </div>
        <span className={`chip ${isSheets ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-500'}`}>
          {isSheets ? '📡 Google Sheets' : '🧪 Data contoh (lokal)'}
        </span>
      </div>

      {loading && <Skeleton />}

      {error && (
        <div className="card p-4 space-y-2 border-red-200 bg-red-50">
          <p className="font-bold text-sm text-red-700">Data tidak bisa dimuat</p>
          <p className="text-xs text-red-600">{error}</p>
          <button onClick={reload} className="btn bg-red-600 text-white !py-2 self-start">
            Coba lagi
          </button>
        </div>
      )}

      {data && !error && [1, 2, 3].map((prio) => <SubjectGroup key={prio} prio={prio as 1 | 2 | 3} subjects={data.subjects} />)}
    </div>
  )
}

function SubjectGroup({ prio, subjects }: { prio: 1 | 2 | 3; subjects: Subject[] }) {
  const list = subjects.filter((s) => s.priority === prio).sort((a, b) => a.sortOrder - b.sortOrder)
  if (!list.length) return null
  const badge = PRIO_BADGE[prio]
  return (
    <div>
      <p className={`chip ${badge.className} mb-2`}>{badge.label}</p>
      <div className="space-y-2.5">
        {list.map((s) => (
          <SubjectCard key={s.id} subject={s} />
        ))}
      </div>
    </div>
  )
}

function SubjectCard({ subject }: { subject: Subject }) {
  const navigate = useNavigate()
  const comingSoon = subject.status === 'coming'
  return (
    <button
      disabled={comingSoon}
      aria-disabled={comingSoon}
      onClick={() => navigate(`/student/subjects/${subject.id}`)}
      className={`card w-full flex items-center gap-3 p-3 text-left transition-transform ${comingSoon ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer active:translate-y-[1px]'}`}
    >
      <div
        className="h-12 w-12 shrink-0 rounded-xl flex items-center justify-center text-2xl shadow-sm"
        style={{ backgroundImage: `linear-gradient(135deg, ${subject.colorFrom}, ${subject.colorTo})` }}
      >
        {subject.emoji}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p className="font-bold text-sm text-slate-900 truncate">{subject.name}</p>
          {comingSoon && <span className="chip bg-surface-high text-primary/70 text-[10px]">Menyusul</span>}
        </div>
        <p className="text-xs text-slate-500 truncate">{subject.description}</p>
      </div>
      <div className="text-slate-300 text-lg">›</div>
    </button>
  )
}

function Skeleton() {
  return (
    <div className="space-y-3">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="card p-3 flex items-center gap-3 animate-pulse">
          <div className="h-12 w-12 rounded-xl bg-slate-200" />
          <div className="flex-1 space-y-1.5">
            <div className="h-3.5 w-2/5 bg-slate-200 rounded" />
            <div className="h-3 w-1/3 bg-slate-100 rounded" />
          </div>
        </div>
      ))}
    </div>
  )
}
