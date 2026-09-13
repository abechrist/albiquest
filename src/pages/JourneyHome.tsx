import { Link } from 'react-router-dom'
import { useProfile } from '../lib/auth'
import { useGamification } from '../lib/gamification'
import { useProgress } from '../lib/progress'
import { useData } from '../lib/store'

// "Peta Petualangan" & Dashboard Siswa — Phase 6 Gamification
// Sesuai prd.md §12, §13, §15, dan Stitch student_dashboard_peta_petualangan:
// - Status Gamifikasi (Level, Title, XP progress bar, Streak 7H).
// - Misi Harian (Daily Missions) dengan pelacakan live dan tombol klaim reward.
// - Peta Petualangan per mata pelajaran.

export function JourneyHome() {
  const { data } = useData()
  const { completed } = useProgress()
  const { active, addXP } = useProfile()
  const { levelInfo, state, dailyMissions, claimMissionReward } = useGamification(active?.xp ?? 1250)

  if (!data) return null

  const activeSubjects = data.subjects
    .filter((s) => s.status === 'active')
    .sort((a, b) => a.sortOrder - b.sortOrder)

  const rows = activeSubjects.map((s) => {
    const lessons = data.lessons.filter((l) => l.subjectId === s.id)
    const done = lessons.filter((l) => completed.has(l.id)).length
    return { subject: s, done, total: lessons.length }
  })

  const doneAll = rows.reduce((n, r) => n + r.done, 0)
  const totalAll = rows.reduce((n, r) => n + r.total, 0)
  const pct = totalAll ? Math.round((doneAll / totalAll) * 100) : 0

  return (
    <div className="space-y-4 pb-8">
      {/* 1. Greeting & Semester Info Banner */}
      <section className="card p-4 space-y-2 bg-white">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-slate-100 text-[10px] font-bold text-slate-600 uppercase tracking-wider">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
              <span>Kelas 9 SMP • Persiapan Ujian</span>
            </div>
            <h1 className="text-base font-black text-slate-900 leading-tight">
              Selamat Belajar, {active?.name ?? 'Albert'}! 👋
            </h1>
            <p className="text-xs text-slate-500">
              Selesaikan misi harian untuk mengumpulkan XP dan lencana petualang.
            </p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-indigo-50 flex items-center justify-center text-2xl flex-shrink-0">
            {active?.avatar ?? '🐉'}
          </div>
        </div>
      </section>

      {/* 2. Gamification Status Bar Widget (Level, Streak, XP to next level) */}
      <section className="card p-4 space-y-3 bg-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-50 text-primary flex items-center justify-center text-lg flex-shrink-0">
              🎖️
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-sm font-black text-slate-900 leading-none">
                  Level {levelInfo.level}
                </span>
                <span className="text-[11px] font-semibold text-slate-500 leading-none">
                  • {levelInfo.title}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">
                {levelInfo.currentLevelXP} / {levelInfo.nextLevelXP} XP
              </p>
            </div>
          </div>

          {/* Streak Counter */}
          <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 text-xs font-black">
            <span>🔥</span>
            <span>{state.streakDays} Hari</span>
          </div>
        </div>

        {/* Progress Track */}
        <div className="space-y-1">
          <div className="w-full h-2.5 rounded-full bg-slate-100 overflow-hidden p-0.5">
            <div
              className="h-full rounded-full bg-gradient-to-r from-primary to-emerald-400 transition-all duration-500"
              style={{ width: `${levelInfo.progressPct}%` }}
            />
          </div>
          <div className="flex justify-between items-center text-[10px] text-slate-400">
            <span>Level {levelInfo.level}</span>
            <span className="text-primary font-bold">
              {levelInfo.xpRemaining} XP lagi ke Level {levelInfo.level + 1} ✨
            </span>
          </div>
        </div>
      </section>

      {/* 3. Misi Harian (Daily Missions Section) */}
      <section className="card p-4 space-y-3 bg-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-base">📋</span>
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800">
              Misi Harian
            </h2>
          </div>
          <span className="text-[10px] text-slate-400 font-semibold">Reset Otomatis</span>
        </div>

        <div className="space-y-2">
          {dailyMissions.map((mission) => {
            const isCompleted = mission.current >= mission.target
            const pct = Math.min(100, Math.round((mission.current / mission.target) * 100))

            return (
              <div
                key={mission.id}
                className="p-3 rounded-xl bg-slate-50 border border-slate-100/80 space-y-2"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-lg">{mission.icon}</span>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-slate-800 truncate">
                        {mission.title}
                      </p>
                      <p className="text-[10px] text-slate-500 truncate">
                        {mission.current} dari {mission.target} selesai
                      </p>
                    </div>
                  </div>

                  {mission.isClaimed ? (
                    <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-700 text-[10px] font-bold">
                      ✓ Selesai
                    </span>
                  ) : isCompleted ? (
                    <button
                      type="button"
                      onClick={() =>
                        claimMissionReward(mission.id, mission.rewardXP, (xp) => {
                          addXP(xp)
                        })
                      }
                      className="px-3 py-1 rounded-full bg-amber-400 hover:bg-amber-300 text-amber-950 text-[10px] font-black active:scale-95 transition-transform shadow-sm cursor-pointer animate-bounce"
                    >
                      Klaim +{mission.rewardXP} XP ⭐
                    </button>
                  ) : (
                    <span className="px-2 py-0.5 rounded-full bg-indigo-50 text-primary text-[10px] font-bold">
                      +{mission.rewardXP} XP
                    </span>
                  )}
                </div>

                {/* Mission progress bar */}
                <div className="w-full h-1.5 rounded-full bg-slate-200 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${
                      isCompleted ? 'bg-emerald-500' : 'bg-primary'
                    }`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            )
          })}
        </div>
      </section>

      {/* 4. Peta Petualangan (Pathway per Mapel) */}
      <section className="space-y-3">
        <div className="card p-5 space-y-3 bg-gradient-to-br from-primary to-indigo-800 text-white !border-transparent">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-black">Peta Petualangan Belajar</h2>
            <span className="text-xs font-bold text-amber-300">
              {doneAll}/{totalAll} Selesai
            </span>
          </div>
          <p className="text-xs text-indigo-100 leading-relaxed">
            Selesaikan kurikulum per mata pelajaran untuk membuka materi baru dan menguasai ujian.
          </p>
          <div className="track !bg-white/20">
            <div className="track-fill !bg-emerald-400" style={{ width: `${pct}%` }} />
          </div>
        </div>

        {/* List Subjects */}
        <div className="space-y-2.5">
          {rows.map(({ subject, done, total }) => {
            const subPct = total ? Math.round((done / total) * 100) : 0
            return (
              <Link
                key={subject.id}
                to={`/student/subjects/${subject.id}`}
                className="card flex items-center gap-3 p-3 active:translate-y-[1px] hover:border-primary/40 transition-colors"
              >
                <div
                  className="h-11 w-11 shrink-0 rounded-xl flex items-center justify-center text-xl shadow-sm"
                  style={{
                    backgroundImage: `linear-gradient(135deg, ${subject.colorFrom}, ${subject.colorTo})`,
                  }}
                >
                  {subject.emoji}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-bold text-xs text-slate-900 truncate">{subject.name}</p>
                    <span className="text-[10px] text-slate-400 tabular">
                      {total ? `${done}/${total}` : '—'}
                    </span>
                  </div>
                  <div className="track mt-1.5 !h-2">
                    <div className="track-fill" style={{ width: `${subPct}%` }} />
                  </div>
                </div>
                <span className="text-slate-400 text-xs">➔</span>
              </Link>
            )
          })}
        </div>
      </section>
    </div>
  )
}