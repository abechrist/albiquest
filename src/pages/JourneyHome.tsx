import { Link } from 'react-router-dom'
import { useAdaptiveLearning } from '../lib/adaptive'
import { useProfile } from '../lib/auth'
import { useGamification } from '../lib/gamification'
import { useProgress } from '../lib/progress'
import { useData } from '../lib/store'

// "Peta Petualangan" & Dashboard Siswa — Phase 6 & Phase 7
// Sesuai prd.md §12, §13, §15, §22–23, dan Stitch student_dashboard_peta_petualangan:
// - Status Gamifikasi (Level, Title, XP progress bar, Streak 7H).
// - Rekomendasi Adaptif Hari Ini ("What should I learn today?").
// - Misi Harian (Daily Missions) dengan pelacakan live dan klaim reward.
// - Quick Action Hub (Peta Penguasaan, Arena Tantangan, Bank Salah).
// - Peta Petualangan per mata pelajaran.

export function JourneyHome() {
  const { data } = useData()
  const { completed } = useProgress()
  const { active, addXP } = useProfile()
  const { levelInfo, state, dailyMissions, claimMissionReward } = useGamification(active?.xp ?? 1250)

  const subjects = data?.subjects ?? []
  const topics = data?.topics ?? []
  const lessons = data?.lessons ?? []

  const { recommendations, weakTopics, mistakesCount } = useAdaptiveLearning(
    subjects,
    topics,
    lessons,
    completed,
  )

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

      {/* 2b. Rekomendasi Hari Ini ("What should I learn today?" - PRD §23) */}
      {recommendations.length > 0 && (
        <section className="relative overflow-hidden rounded-2xl border-2 border-indigo-600 bg-gradient-to-br from-indigo-900 via-indigo-950 to-slate-900 p-4 text-white shadow-lg">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="text-xl">✨</span>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-black uppercase tracking-wider text-indigo-300">
                    Rekomendasi Hari Ini
                  </span>
                  <span className="rounded-full bg-indigo-500/30 px-2 py-0.5 text-[9px] font-bold text-amber-300">
                    {recommendations[0].badgeLabel}
                  </span>
                </div>
                <h2 className="text-sm font-black text-white mt-0.5">
                  {recommendations[0].title}
                </h2>
              </div>
            </div>
            <span className="text-2xl">{recommendations[0].subjectEmoji}</span>
          </div>

          <p className="mt-2 text-xs text-indigo-200/90 leading-relaxed">
            {recommendations[0].reason}
          </p>

          <div className="mt-3 flex items-center justify-between pt-2 border-t border-indigo-800/60">
            <span className="text-[11px] font-semibold text-indigo-300">
              {recommendations[0].subjectName}
            </span>
            <Link
              to={recommendations[0].actionUrl}
              className="rounded-xl border-b-2 border-indigo-700 bg-indigo-500 px-3.5 py-1.5 text-xs font-black text-white shadow-md transition-all hover:bg-indigo-400 active:translate-y-0.5"
            >
              {recommendations[0].actionLabel} →
            </Link>
          </div>
        </section>
      )}

      {/* 2c. Quick Action Navigation Hub */}
      <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
        <Link
          to="/student/mastery"
          className="card flex flex-col justify-between p-3 active:scale-95 transition-transform hover:border-indigo-400 bg-white"
        >
          <div className="flex items-center justify-between">
            <span className="text-xl">🎯</span>
            {weakTopics.length > 0 && (
              <span className="rounded-full bg-rose-100 px-1.5 py-0.2 text-[9px] font-black text-rose-600">
                {weakTopics.length}
              </span>
            )}
          </div>
          <div className="mt-2">
            <p className="text-xs font-bold text-slate-900 leading-tight">Peta Penguasaan</p>
            <p className="text-[10px] text-slate-400">Mastery radar</p>
          </div>
        </Link>

        <Link
          to="/student/challenges"
          className="card flex flex-col justify-between p-3 active:scale-95 transition-transform hover:border-amber-400 bg-white"
        >
          <div className="flex items-center justify-between">
            <span className="text-xl">⚔️</span>
            <span className="rounded-full bg-amber-100 px-1.5 py-0.2 text-[9px] font-black text-amber-700">
              Boss
            </span>
          </div>
          <div className="mt-2">
            <p className="text-xs font-bold text-slate-900 leading-tight">Arena Tantangan</p>
            <p className="text-[10px] text-slate-400">Boss & speed rush</p>
          </div>
        </Link>

        <Link
          to="/student/mistakes"
          className="card flex flex-col justify-between p-3 active:scale-95 transition-transform hover:border-rose-400 bg-white"
        >
          <div className="flex items-center justify-between">
            <span className="text-xl">🧠</span>
            {mistakesCount > 0 && (
              <span className="rounded-full bg-rose-100 px-1.5 py-0.2 text-[9px] font-black text-rose-600">
                {mistakesCount}
              </span>
            )}
          </div>
          <div className="mt-2">
            <p className="text-xs font-bold text-slate-900 leading-tight">Bank Salah</p>
            <p className="text-[10px] text-slate-400">Review & retry</p>
          </div>
        </Link>

        <Link
          to="/student/practice"
          className="card flex flex-col justify-between p-3 active:scale-95 transition-transform hover:border-emerald-400 bg-white"
        >
          <div className="flex items-center justify-between">
            <span className="text-xl">⚡</span>
            <span className="rounded-full bg-emerald-100 px-1.5 py-0.2 text-[9px] font-black text-emerald-700">
              Kilat
            </span>
          </div>
          <div className="mt-2">
            <p className="text-xs font-bold text-slate-900 leading-tight">Latihan Bebas</p>
            <p className="text-[10px] text-slate-400">Acak & mapel</p>
          </div>
        </Link>
      </div>

      {/* 2d. Banner Simulasi Ujian ANBK (Phase 9) */}
      <section className="card p-3.5 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white !border-slate-800 flex items-center justify-between gap-3 shadow-md">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-500/20 text-xl border border-indigo-500/30">
            🏛️
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-bold text-amber-300 uppercase tracking-wide">
                Simulasi ANBK & Asesmen SMP
              </span>
              <span className="rounded-full bg-emerald-500/20 px-1.5 py-0.2 text-[9px] font-bold text-emerald-400">
                Resmi
              </span>
            </div>
            <p className="text-xs font-black text-white mt-0.5">Uji Kesiapan & Timer Realistis</p>
          </div>
        </div>
        <Link
          to="/student/exam"
          className="rounded-xl border-b-2 border-indigo-700 bg-indigo-600 px-3.5 py-2 text-xs font-black text-white shadow-sm hover:bg-indigo-500 active:translate-y-0.5 transition-all shrink-0"
        >
          Ikuti Ujian →
        </Link>
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