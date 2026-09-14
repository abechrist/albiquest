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
      <div
        className={`relative overflow-hidden rounded-2xl p-5 text-white shadow-xl ${
          active.id === 'jasmine'
            ? 'bg-gradient-to-br from-pink-600 via-rose-500 to-purple-800'
            : 'bg-gradient-to-br from-indigo-600 via-primary to-indigo-900'
        }`}
      >
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
            <p className="text-xs text-indigo-100">
              {active.id === 'jasmine' ? 'The Phoenix Seeker' : 'The Dragon Scholar'} • Siswa Kelas {active.grade ?? 9} SMP Pangudi Luhur
            </p>
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
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
        <div className="card p-4 space-y-1.5 bg-white">
          <div className="flex items-center justify-between">
            <span className="text-2xl">🔥</span>
            <span className="text-xs font-bold text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-full">
              Aktif
            </span>
          </div>
          <p className="text-2xl font-black text-slate-900">{state.streakDays} Hari</p>
          <p className="text-xs sm:text-sm text-slate-500 font-medium">Streak Belajar Rutin</p>
        </div>

        <div className="card p-4 space-y-1.5 bg-white">
          <div className="flex items-center justify-between">
            <span className="text-2xl">⚡</span>
            <span className="text-xs font-bold text-indigo-700 bg-indigo-50 px-2.5 py-0.5 rounded-full">
              Latihan
            </span>
          </div>
          <p className="text-2xl font-black text-slate-900">{state.questionsAnsweredCount} Soal</p>
          <p className="text-xs sm:text-sm text-slate-500 font-medium">Latihan Benar</p>
        </div>

        <div className="card p-4 space-y-1.5 bg-white">
          <div className="flex items-center justify-between">
            <span className="text-2xl">📖</span>
            <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full">
              Materi
            </span>
          </div>
          <p className="text-2xl font-black text-slate-900">{state.lessonsCompletedCount} Unit</p>
          <p className="text-xs sm:text-sm text-slate-500 font-medium">Pelajaran Tuntas</p>
        </div>

        <div className="card p-4 space-y-1.5 bg-white">
          <div className="flex items-center justify-between">
            <span className="text-2xl">🧠</span>
            <span className="text-xs font-bold text-rose-700 bg-rose-50 px-2.5 py-0.5 rounded-full">
              Evaluasi
            </span>
          </div>
          <p className="text-2xl font-black text-slate-900">{state.mistakesMasteredCount} Soal</p>
          <p className="text-xs sm:text-sm text-slate-500 font-medium">Kesalahan Dikuasai</p>
        </div>
      </div>

      {/* 3. Galeri Lencana & Pencapaian (Badges Showcase) */}
      <div className="card p-5 space-y-4 bg-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="text-2xl">🏆</span>
            <div>
              <h3 className="text-base font-extrabold text-slate-900">Koleksi Lencana</h3>
              <p className="text-xs sm:text-sm text-slate-500">Bukti pencapaian petualangan belajarmu</p>
            </div>
          </div>
          <span className="px-3 py-1 rounded-full bg-indigo-50 text-primary font-black text-xs sm:text-sm">
            {unlockedCount} / {totalBadges}
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3.5 pt-1">
          {badgesWithStatus.map((badge) => {
            return (
              <div
                key={badge.id}
                className={`p-4 rounded-2xl border flex flex-col justify-between space-y-2.5 transition-all ${
                  badge.isUnlocked
                    ? 'bg-gradient-to-br from-amber-50/60 to-white border-amber-200/80 shadow-xs'
                    : 'bg-slate-50/70 border-slate-200 opacity-60'
                }`}
              >
                <div className="flex items-start justify-between">
                  <span className={`text-4xl ${badge.isUnlocked ? '' : 'filter grayscale'}`}>
                    {badge.icon}
                  </span>
                  {badge.isUnlocked ? (
                    <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold">
                      ✓ Terbuka
                    </span>
                  ) : (
                    <span className="text-sm text-slate-400">🔒</span>
                  )}
                </div>

                <div>
                  <h4 className="text-sm font-bold text-slate-900 leading-tight">
                    {badge.title}
                  </h4>
                  <p className="text-xs text-slate-500 mt-1 leading-snug">
                    {badge.description}
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* 4. Pengaturan Akun & PWA Info */}
      <div className="card p-5 space-y-3.5 bg-white">
        <h3 className="text-xs sm:text-sm font-extrabold uppercase tracking-wider text-slate-500">
          Aplikasi & Pengaturan Akun
        </h3>

        <div className="flex flex-col gap-2.5">
          {isInstallable && (
            <button
              type="button"
              onClick={installApp}
              className="w-full p-4 rounded-2xl bg-gradient-to-r from-indigo-500 to-indigo-600 text-white font-black text-sm flex items-center justify-between shadow-md hover:from-indigo-600 hover:to-indigo-700 transition-all cursor-pointer min-h-[52px]"
            >
              <div className="flex items-center gap-2.5">
                <span className="text-xl">📱</span>
                <span>Pasang Aplikasi di Layar Utama (PWA)</span>
              </div>
              <span className="rounded-lg bg-white/25 px-2.5 py-1 text-xs font-bold">Install</span>
            </button>
          )}

          {isInstalled ? (
            <div className="w-full p-3.5 rounded-2xl bg-emerald-50 text-emerald-800 font-bold text-xs sm:text-sm flex items-center gap-2.5 border border-emerald-200">
              <span className="text-base">✓</span>
              <span>Aplikasi sudah terpasang di perangkat (Mode Standalone & Offline Ready)</span>
            </div>
          ) : (
            <div className="w-full p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 text-slate-700 text-xs sm:text-sm space-y-1">
              <p className="font-bold flex items-center gap-1.5 text-indigo-700">
                <span>💡</span> Panduan PWA di Ponsel & Tablet
              </p>
              <p className="text-slate-600 leading-relaxed">
                Di iPhone / iPad: Tekan tombol <strong>Bagikan (Share)</strong> di Safari lalu pilih <strong>&quot;Tambahkan ke Layar Utama&quot;</strong> untuk pengalaman layar penuh tanpa browser bar.
              </p>
            </div>
          )}

          <button
            type="button"
            onClick={() => setShowPinModal(true)}
            className="w-full p-3.5 rounded-2xl bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold text-sm flex items-center justify-between transition-colors cursor-pointer min-h-[48px] border border-slate-200/60"
          >
            <div className="flex items-center gap-2.5">
              <span className="text-base">🔐</span>
              <span>Ubah PIN Akses Profil</span>
            </div>
            <span className="text-slate-400 font-bold">➔</span>
          </button>

          <button
            type="button"
            onClick={logout}
            className="w-full p-3.5 rounded-2xl bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-sm flex items-center justify-center gap-2 transition-colors cursor-pointer min-h-[48px] border border-rose-200/60"
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
