import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { PROFILES, useProfile } from '../lib/auth'

export function Login() {
  const [params] = useSearchParams()
  const initialRole = params.get('role') === 'parent' ? 'parent' : 'student'
  const [currentRole, setCurrentRole] = useState<'student' | 'parent'>(initialRole)
  const [selectedHeroId, setSelectedHeroId] = useState<string | null>(null)
  const [pin, setPin] = useState('')
  const [error, setError] = useState(false)

  const { login } = useProfile()
  const nav = useNavigate()

  // Reset PIN saat hero atau role berganti
  useEffect(() => {
    setPin('')
    setError(false)
  }, [selectedHeroId, currentRole])

  // Ambil data progres tersimpan untuk kartu hero
  const getHeroSavedStats = (id: string) => {
    try {
      const raw = localStorage.getItem(`pla.profile_saved_${id}`)
      if (raw) return JSON.parse(raw)
    } catch {}
    return { level: 1, xp: 0 }
  }

  const studentHeroes = PROFILES.filter((p) => p.role === 'student')
  const parentProfile = PROFILES.find((p) => p.role === 'parent')

  const activeTargetProfile =
    currentRole === 'parent'
      ? parentProfile
      : PROFILES.find((p) => p.id === selectedHeroId)

  const digits = [1, 2, 3, 4, 5, 6, 7, 8, 9, '', 0, 'del']

  function press(d: number | 'del') {
    if (d === 'del') return setPin((p) => p.slice(0, -1))
    if (pin.length >= 4) return
    setError(false)
    const next = pin + String(d)
    setPin(next)

    if (next.length === 4) {
      const targetId = currentRole === 'parent' ? 'parent' : selectedHeroId || 'albert'
      const ok = login(targetId, next)
      if (ok) {
        nav(currentRole === 'parent' ? '/parent' : '/student', { replace: true })
      } else {
        setError(true)
        setTimeout(() => setPin(''), 450)
      }
    }
  }

  return (
    <div className="app-canvas flex flex-col justify-between px-5 py-6">
      {/* 1. Header & Switcher Mode */}
      <header className="flex items-center justify-between border-b border-slate-200/70 pb-4">
        <div className="flex items-center gap-2">
          <span className="text-2xl">⚡</span>
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider text-indigo-600 block leading-tight">
              AlbiQuest Hub
            </span>
            <h1 className="text-sm font-black text-slate-900 leading-tight">
              Family Learning Adventure
            </h1>
          </div>
        </div>

        <button
          type="button"
          onClick={() => {
            if (currentRole === 'student') {
              setCurrentRole('parent')
              setSelectedHeroId(null)
            } else {
              setCurrentRole('student')
            }
          }}
          className="chip bg-surface border border-slate-200 text-slate-700 hover:bg-slate-50 cursor-pointer flex items-center gap-1.5 shadow-xs"
        >
          <span>{currentRole === 'student' ? '🛡️' : '🐉🌸'}</span>
          <span className="text-[11px] font-bold">
            {currentRole === 'student' ? 'Orang Tua' : 'Pahlawan'}
          </span>
        </button>
      </header>

      {/* 2. Main View: Choose Your Hero OR PIN Keypad */}
      <main className="my-auto py-4">
        {currentRole === 'student' && !selectedHeroId ? (
          /* View A: Hero Selection Portal (Choose Your Hero) */
          <div className="space-y-5 animate-fadeIn">
            <div className="text-center space-y-1">
              <span className="inline-flex items-center gap-1 rounded-full bg-indigo-50 px-3 py-1 text-[11px] font-bold text-indigo-700">
                <span>✨</span> Choose Your Hero
              </span>
              <h2 className="text-xl font-black text-slate-900">Pilih Pahlawan Belajarmu</h2>
              <p className="text-xs text-slate-500">
                Lanjutkan petualangan akademik SMP Pangudi Luhur
              </p>
            </div>

            <div className="space-y-3.5 pt-2">
              {studentHeroes.map((hero) => {
                const stats = getHeroSavedStats(hero.id)
                const isAlbert = hero.id === 'albert'

                return (
                  <button
                    key={hero.id}
                    type="button"
                    onClick={() => setSelectedHeroId(hero.id)}
                    className={`w-full text-left card relative overflow-hidden p-4 border-2 transition-all duration-200 cursor-pointer hover:shadow-md active:scale-[0.99] ${
                      isAlbert
                        ? 'border-indigo-200/90 hover:border-indigo-500 bg-gradient-to-br from-indigo-50/50 via-white to-blue-50/30'
                        : 'border-pink-200/90 hover:border-pink-500 bg-gradient-to-br from-pink-50/50 via-white to-purple-50/30'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      {/* Avatar Hero */}
                      <div
                        className={`w-16 h-16 rounded-2xl flex items-center justify-center text-3xl shadow-sm flex-shrink-0 bg-gradient-to-tr ${hero.colorTheme}`}
                      >
                        {hero.avatar}
                      </div>

                      {/* Detail Hero */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1">
                          <h3 className="text-base font-black text-slate-900 leading-snug">
                            {hero.name}
                          </h3>
                          <span
                            className={`rounded-full px-2 py-0.5 text-[10px] font-black ${
                              isAlbert
                                ? 'bg-indigo-100 text-indigo-800'
                                : 'bg-pink-100 text-pink-800'
                            }`}
                          >
                            Kelas {hero.grade}
                          </span>
                        </div>

                        <p className="text-xs font-bold text-slate-600 mt-0.5">
                          {hero.title}
                        </p>
                        <p className="text-[11px] text-slate-400 truncate">
                          {hero.subtitle}
                        </p>

                        <div className="mt-2 flex items-center gap-2 text-[11px] font-bold">
                          <span className="rounded-md bg-slate-100 px-1.5 py-0.5 text-slate-700">
                            Lvl {stats.level}
                          </span>
                          <span className="text-amber-600">
                            🔥 {stats.xp} XP
                          </span>
                        </div>
                      </div>

                      {/* Arrow */}
                      <div className="text-slate-300 text-lg font-bold pr-1">
                        →
                      </div>
                    </div>
                  </button>
                )
              })}
            </div>

            <div className="pt-2 text-center">
              <p className="text-[11px] text-slate-400">
                Setiap pahlawan memiliki bank materi, jadwal latihan, dan progres tersendiri.
              </p>
            </div>
          </div>
        ) : (
          /* View B: PIN Keypad Entry */
          <div className="flex flex-col items-center space-y-5 animate-fadeIn">
            {/* Header Hero Aktif */}
            <div className="text-center">
              <div className="relative inline-block mb-3">
                <div
                  className={`w-18 h-18 rounded-3xl flex items-center justify-center text-4xl shadow-md bg-gradient-to-tr ${
                    activeTargetProfile?.colorTheme || 'from-indigo-600 to-emerald-400'
                  }`}
                >
                  {activeTargetProfile?.avatar}
                </div>
                {activeTargetProfile?.grade && (
                  <span className="absolute -bottom-1 -right-1 rounded-full bg-white px-2 py-0.5 text-[10px] font-black text-indigo-700 shadow-sm border border-indigo-100">
                    Kls {activeTargetProfile.grade}
                  </span>
                )}
              </div>

              <h2 className="text-lg font-black text-slate-900">
                {currentRole === 'parent'
                  ? 'Area Orang Tua'
                  : `Petualangan ${activeTargetProfile?.name}`}
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                {activeTargetProfile?.subtitle}
              </p>
            </div>

            {/* PIN Dots */}
            <div className="w-full flex flex-col items-center gap-3">
              <div className="flex gap-3.5 my-1" aria-label="PIN">
                {[0, 1, 2, 3].map((i) => (
                  <span
                    key={i}
                    className={`pin-dot transition-all ${
                      pin.length > i
                        ? '!scale-110 !bg-indigo-600 !border-indigo-600'
                        : '!border-slate-300'
                    }`}
                  />
                ))}
              </div>

              <p
                className={`text-xs font-semibold ${
                  error ? 'text-rose-600 font-bold' : 'text-slate-400'
                }`}
                aria-live="polite"
              >
                {error
                  ? 'PIN salah, silakan coba lagi'
                  : currentRole === 'parent'
                  ? 'PIN Akses: 9999 (atau 0000)'
                  : selectedHeroId === 'jasmine'
                  ? 'PIN Jasmine: 5678'
                  : 'PIN Albert: 1234'}
              </p>
            </div>

            {/* Keypad */}
            <div className="grid grid-cols-3 gap-2.5 w-full max-w-[270px]">
              {digits.map((d, i) =>
                d === '' ? (
                  <span key={i} />
                ) : (
                  <button
                    key={i}
                    type="button"
                    onClick={() => press(d as number | 'del')}
                    className="h-13 rounded-2xl bg-white border border-slate-200/90 text-lg font-bold text-slate-800 shadow-xs hover:bg-slate-50 active:translate-y-0.5 active:bg-slate-100 transition-all cursor-pointer select-none"
                  >
                    {d === 'del' ? '⌫' : d}
                  </button>
                ),
              )}
            </div>

            {/* Tombol Kembali ke Hero Selector */}
            {currentRole === 'student' && (
              <button
                type="button"
                onClick={() => {
                  setSelectedHeroId(null)
                  setPin('')
                }}
                className="text-xs font-bold text-indigo-600 hover:text-indigo-700 underline underline-offset-4 cursor-pointer mt-1"
              >
                ← Pilih pahlawan lain
              </button>
            )}
          </div>
        )}
      </main>

      {/* 3. Footer Catatan */}
      <footer className="text-center pt-2">
        <p className="text-[11px] text-slate-400 font-medium">
          SMP Pangudi Luhur • Kurikulum Merdeka SMP
        </p>
      </footer>
    </div>
  )
}