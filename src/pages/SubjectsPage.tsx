import { useProfile } from '../lib/auth'

// Mapel default Phase 1 — sesuai D-010 (fokus ujian nasional + agama Katolik).
// ponytail: Phase 2 diganti dari Google Sheets (D-002), struktur configurable via data.
const SUBJECTS = [
  { id: 'bindo', name: 'Bahasa Indonesia', emoji: '📖', prio: 1, color: 'from-rose-400 to-rose-500', desc: 'Literasi, teks, sastra' },
  { id: 'mtk', name: 'Matematika', emoji: '🔢', prio: 1, color: 'from-indigo-400 to-indigo-600', desc: 'Bilangan, aljabar, geometri' },
  { id: 'bing', name: 'Bahasa Inggris', emoji: '🇬🇧', prio: 1, color: 'from-sky-400 to-sky-600', desc: 'Grammar, reading, vocab' },
  { id: 'ipa', name: 'IPA', emoji: '🔬', prio: 1, color: 'from-emerald-400 to-emerald-600', desc: 'Fisika, kimia, biologi' },
  { id: 'agama', name: 'Pendidikan Agama Katolik', emoji: '⛪', prio: 2, color: 'from-violet-400 to-violet-600', desc: 'PABP — agama Katolik' },
  { id: 'ips', name: 'IPS', emoji: '🌍', prio: 3, color: 'from-amber-400 to-amber-600', desc: 'Sejarah, geografi, ekonomi' },
  { id: 'ppkn', name: 'PPKn', emoji: '🏛️', prio: 3, color: 'from-cyan-400 to-cyan-600', desc: 'Pancasila & kewarganegaraan' },
  { id: 'pjok', name: 'PJOK', emoji: '🏃', prio: 3, color: 'from-lime-400 to-lime-600', desc: 'Pendidikan jasmani' },
  { id: 'prakarya', name: 'Prakarya & BK', emoji: '🛠️', prio: 3, color: 'from-teal-400 to-teal-600', desc: 'Keterampilan & pengembangan diri' },
]

export function SubjectsPage() {
  const { active } = useProfile()
  if (!active) return null

  return (
    <div className="space-y-4">
      <div>
        <h2 className="h-headline">Mata Pelajaran</h2>
        <p className="text-sm text-slate-500 mt-0.5">Semua mapel untuk ujian Kelas 9</p>
      </div>

      {/* Prioritas 1: ujian nasional */}
      <div>
        <p className="chip bg-primary/10 text-primary mb-2">🎯 Ujian Nasional</p>
        <div className="space-y-2.5">
          {SUBJECTS.filter((s) => s.prio === 1).map((s) => (
            <SubjectCard key={s.id} {...s} />
          ))}
        </div>
      </div>

      {/* Prioritas 2: agama */}
      <div>
        <p className="chip bg-violet-100 text-violet-700 mb-2">⛪ Agama</p>
        <div className="space-y-2.5">
          {SUBJECTS.filter((s) => s.prio === 2).map((s) => (
            <SubjectCard key={s.id} {...s} />
          ))}
        </div>
      </div>

      {/* Prioritas 3: tambahan */}
      <div>
        <p className="chip bg-slate-200 text-slate-600 mb-2">➕ Tambahan</p>
        <div className="space-y-2.5">
          {SUBJECTS.filter((s) => s.prio === 3).map((s) => (
            <SubjectCard key={s.id} {...s} />
          ))}
        </div>
      </div>
    </div>
  )
}

function SubjectCard({ name, emoji, color, desc, prio }: Omit<(typeof SUBJECTS)[number], 'id'>) {
  const comingSoon = prio === 3
  return (
    <button
      disabled={comingSoon}
      className={`card w-full flex items-center gap-3 p-3 text-left cursor-pointer transition-transform ${comingSoon ? 'opacity-70 cursor-not-allowed' : 'active:translate-y-[1px]'}`}
      aria-disabled={comingSoon}
    >
      <div className={`h-12 w-12 shrink-0 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center text-2xl shadow-sm`}>
        {emoji}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p className="font-bold text-sm text-slate-900 truncate">{name}</p>
          {comingSoon && <span className="chip bg-surface-high text-primary/70 text-[10px]">Menyusul</span>}
        </div>
        <p className="text-xs text-slate-500 truncate">{desc}</p>
      </div>
      <div className="text-slate-300 text-lg">›</div>
    </button>
  )
}