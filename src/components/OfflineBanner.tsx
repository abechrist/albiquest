// Banner Indikator Status Koneksi Online / Offline — Phase 11
// Sesuai prd.md §45.

import { useEffect, useState } from 'react'
import { useOnlineStatus } from '../lib/pwa'

export function OfflineBanner() {
  const isOnline = useOnlineStatus()
  const [showReconnected, setShowReconnected] = useState<boolean>(false)
  const [wasOffline, setWasOffline] = useState<boolean>(false)

  useEffect(() => {
    if (!isOnline) {
      setWasOffline(true)
    } else if (wasOffline) {
      setShowReconnected(true)
      const timer = setTimeout(() => {
        setShowReconnected(false)
        setWasOffline(false)
      }, 3500)
      return () => clearTimeout(timer)
    }
  }, [isOnline, wasOffline])

  if (!isOnline) {
    return (
      <div className="fixed top-0 inset-x-0 z-50 bg-amber-500 text-amber-950 px-4 py-2 text-xs font-bold shadow-md flex items-center justify-between transition-all">
        <div className="mx-auto flex max-w-4xl items-center gap-2">
          <span className="text-base animate-pulse">📶</span>
          <span>
            Mode Offline Aktif — Belajar & latihan tetap lancar. Seluruh progres dan XP tersimpan aman di perangkat.
          </span>
        </div>
      </div>
    )
  }

  if (showReconnected) {
    return (
      <div className="fixed top-0 inset-x-0 z-50 bg-emerald-600 text-white px-4 py-2 text-xs font-bold shadow-md flex items-center justify-between transition-all animate-fadeIn">
        <div className="mx-auto flex max-w-4xl items-center gap-2">
          <span className="text-base">✓</span>
          <span>Koneksi Internet Pulih — Kembali Online!</span>
        </div>
      </div>
    )
  }

  return null
}
