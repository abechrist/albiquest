import { useState } from 'react'
import { useProfile } from '../lib/auth'
import { useGamification } from '../lib/gamification'
import { usePWAInstall } from '../lib/pwa'

// Halaman Profil Siswa & Koleksi Lencana (Phase 6)
// Sesuai prd.md §15 (Gamifikasi & Badges) dan agent-prompt.md §57.

export function ProfilePage() {
  const { active, logout } = useProfile()
  const { levelInfo, state, badgesWithStatus } = useGamification(active?.xp ?? 0)
  const { isInstallable, isInstalled, installApp } = usePWAInstall()

  // Pengaturan PIN
  const [showPinModal, setShowPinModal] = useState(false)
  const [newPin, setNewPin] = useState('')
  const [pinMessage, setPinMessage] = useState('')

  if (!active) return null

  const unlockedCount = badgesWithStatus.filter((b) => b.isUnlocked).length
  const totalBadges = badgesWithStatus.length

  const handleSavePin = (e: React.FormEvent) => {
    e.preventDefault()
    if (newPin.length !== 4 || !/^\d{4}$/.test(newPin)) {
      setPinMessage('PIN harus berupa 4 digit angka!')
      return
    }
    try {
      localStorage.setItem(`pla.pin.${active.id}`, newPin)
      setPinMessage('PIN berhasil diperbarui! ✓')
      setTimeout(() => {
        setShowPinModal(false)
        setPinMessage('')
        setNewPin('')
      }, 1200)
    } catch {
      setPinMessage('Gagal menyimpan PIN.')
    }
  }

  return (
    <div className="space-y-4 pb-12">
      {/* 1. Petualang Hero Profile Card */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-600 via-primary to-indigo-900 p-5 text-white shadow-xl">
        <div className="relative z-10 flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-4xl shadow-inner flex-shrink-0">
            {active.avatar}
          </div>

          <div className="min-w-0 flex-1 space-y-1">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/20 text-[10px] font-bold text-amber-300">
              <span>⭐</span>
              <span>Level {levelInfo.level} • {levelInfo.title}</span>
            </div>
            <h2 className="text-xl font-black truncate">{active.name}</h2>
            <p className="text-xs text-indigo-100">Siswa Kelas 9 SMP Pangudi Luhur</p>
          </div>
        </div>

        {/* Progress Bar ke Level Berikutnya */}
        <div className="relative z-10 mt-4 space-y-1.5 pt-2 border-t border-white/15">
          <div className="flex justify-between text-xs text-indigo-100 font-semibold">
            <span>{active.xp} XP Terkumpul</span>
            <span>{levelInfo.xpRemaining} XP lagi ke Level {levelInfo.level + 1}</span>
          </div>
          <div className="w-full h-2.5 rounded-full bg-black/25 overflow-hidden p-0.5">
            <div
              className="h-full rounded-full bg-gradient-to-r from-amber-400 to-emerald-400 transition-all duration-500"
              style={{ width: `${levelInfo.progressPct}%` }}
            />
          </div>
        </div>
      </div>

      {/* 2. Statistik Aktivitas Belajar */}
      <div className="grid grid-cols-2 gap-2.5">
        <div className="card p-3.5 space-y-1 bg-white">
          <div className="flex items-center justify-between">
            <span className="text-xl">🔥</span>
            <span className="text-xs font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">
              Aktif
            </span>
          </div>
          <p className="text-xl font-black text-slate-900">{state.streakDays} Hari</p>
          <p className="text-[11px] text-slate-500">Streak Belajar Rutin</p>
        </div>

        <div className="card p-3.5 space-y-1 bg-white">
          <div className="flex items-center justify-between">
            <span className="text-xl">⚡</span>
            <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">
              Latihan
            </span>
          </div>
          <p className="text-xl font-black text-slate-900">{state.questionsAnsweredCount} Soal</p>
          <p className="text-[11px] text-slate-500">Latihan Terjawab Benar</p>
        </div>

        <div className="card p-3.5 space-y-1 bg-white">
          <div className="flex items-center justify-between">
            <span className="text-xl">📖</span>
            <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
              Materi
            </span>
          </div>
          <p className="text-xl font-black text-slate-900">{state.lessonsCompletedCount} Unit</p>
          <p className="text-[11px] text-slate-500">Pelajaran Diselesaikan</p>
        </div>

        <div className="card p-3.5 space-y-1 bg-white">
          <div className="flex items-center justify-between">
            <span className="text-xl">🧠</span>
            <span className="text-xs font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full">
              Evaluasi
            </span>
          </div>
          <p className="text-xl font-black text-slate-900">{state.mistakesMasteredCount} Soal</p>
          <p className="text-[11px] text-slate-500">Kesalahan Dikuasai</p>
        </div>
      </div>

      {/* 3. Galeri Lencana & Pencapaian (Badges Showcase) */}
      <div className="card p-4 space-y-3 bg-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl">🏆</span>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Koleksi Lencana</h3>
              <p className="text-[11px] text-slate-400">Bukti pencapaian petualangan belajarmu</p>
            </div>
          </div>
          <span className="px-2.5 py-1 rounded-full bg-indigo-50 text-primary font-black text-xs">
            {unlockedCount} / {totalBadges}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2.5 pt-1">
          {badgesWithStatus.map((badge) => {
            return (
              <div
                key={badge.id}
                className={`p-3 rounded-xl border flex flex-col justify-between space-y-2 transition-all ${
                  badge.isUnlocked
                    ? 'bg-gradient-to-br from-amber-50/60 to-white border-amber-200/80 shadow-sm'
                    : 'bg-slate-50/70 border-slate-200 opacity-60'
                }`}
              >
                <div className="flex items-start justify-between">
                  <span className={`text-3xl ${badge.isUnlocked ? '' : 'filter grayscale'}`}>
                    {badge.icon}
                  </span>
                  {badge.isUnlocked ? (
                    <span className="px-1.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[9px] font-bold">
                      ✓ Terbuka
                    </span>
                  ) : (
                    <span className="text-xs text-slate-400">🔒</span>
                  )}
                </div>

                <div>
                  <h4 className="text-xs font-bold text-slate-900 leading-tight">
                    {badge.title}
                  </h4>
                  <p className="text-[10px] text-slate-500 mt-0.5 leading-snug">
                    {badge.description}
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* 4. Pengaturan Akun & Tombol Keluar */}
      <div className="card p-4 space-y-2.5 bg-white">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
          Pengaturan Akun
        </h3>

        <div className="flex flex-col gap-2">
          {isInstallable && (
            <button
              type="button"
              onClick={installApp}
              className="w-full p-3 rounded-xl bg-gradient-to-r from-indigo-500 to-indigo-600 text-white font-bold text-xs flex items-center justify-between shadow-sm hover:from-indigo-600 hover:to-indigo-700 transition-all cursor-pointer animate-pulse"
            >
              <div className="flex items-center gap-2">
                <span>📱</span>
                <span>Pasang Aplikasi di Layar Utama (PWA)</span>
              </div>
              <span className="rounded-md bg-white/20 px-2 py-0.5 text-[10px]">Install</span>
            </button>
          )}

          {isInstalled && (
            <div className="w-full p-2.5 rounded-xl bg-emerald-50 text-emerald-800 font-semibold text-xs flex items-center gap-2 border border-emerald-200">
              <span>✓</span>
              <span>Aplikasi sudah terpasang di perangkat (Offline Ready)</span>
            </div>
          )}

          <button
            type="button"
            onClick={() => setShowPinModal(true)}
            className="w-full p-3 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold text-xs flex items-center justify-between transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <span>🔐</span>
              <span>Ubah PIN Akses Profil</span>
            </div>
            <span className="text-slate-400">➔</span>
          </button>

          <button
            type="button"
            onClick={logout}
            className="w-full p-3 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
          >
            <span>🚪</span>
            <span>Keluar dari Akun</span>
          </button>
        </div>
      </div>

      {/* Modal Ubah PIN */}
      {showPinModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-sm rounded-2xl p-5 space-y-4 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b pb-2">
              <h3 className="text-sm font-bold text-slate-900">Ubah PIN Siswa</h3>
              <button
                type="button"
                onClick={() => setShowPinModal(false)}
                className="w-7 h-7 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center text-sm font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSavePin} className="space-y-3">
              <div>
                <label className="block text-xs text-slate-600 font-semibold mb-1">
                  Masukkan 4 digit PIN baru:
                </label>
                <input
                  type="password"
                  maxLength={4}
                  value={newPin}
                  onChange={(e) => setNewPin(e.target.value)}
                  placeholder="••••"
                  className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-center text-xl font-mono tracking-widest focus:outline-none focus:ring-2 focus:ring-primary"
                  autoFocus
                />
              </div>

              {pinMessage && (
                <p className={`text-xs text-center font-bold ${pinMessage.includes('✓') ? 'text-emerald-600' : 'text-rose-600'}`}>
                  {pinMessage}
                </p>
              )}

              <button
                type="submit"
                className="btn-primary w-full py-3 text-xs cursor-pointer"
              >
                Simpan PIN Baru
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
