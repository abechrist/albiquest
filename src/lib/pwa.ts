// PWA Helper & Service Worker Registration — Phase 11
// Sesuai prd.md §43–46 dan agent-prompt.md §62.

import { useEffect, useState } from 'react'

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>
}

let deferredPrompt: BeforeInstallPromptEvent | null = null

/**
 * Daftarkan Service Worker saat aplikasi dimuat di browser
 */
export function registerServiceWorker(): void {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) return

  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('./sw.js')
      .then((reg) => {
        console.log('Service Worker berhasil terdaftar (Scope):', reg.scope)
      })
      .catch((err) => {
        console.warn('Gagal mendaftarkan Service Worker:', err)
      })
  })
}

/**
 * Hook untuk memantau status koneksi online/offline secara reaktif
 */
export function useOnlineStatus(): boolean {
  const [isOnline, setIsOnline] = useState<boolean>(() => {
    return typeof navigator !== 'undefined' ? navigator.onLine : true
  })

  useEffect(() => {
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  return isOnline
}

/**
 * Hook untuk menangkap event instalasi PWA di layar utama
 */
export function usePWAInstall() {
  const [isInstallable, setIsInstallable] = useState<boolean>(false)
  const [isInstalled, setIsInstalled] = useState<boolean>(false)

  useEffect(() => {
    // Deteksi jika sudah berjalan dalam mode standalone PWA
    if (
      typeof window !== 'undefined' &&
      (window.matchMedia('(display-mode: standalone)').matches ||
        (window.navigator as unknown as { standalone?: boolean }).standalone === true)
    ) {
      setIsInstalled(true)
      return
    }

    const handler = (e: Event) => {
      e.preventDefault()
      deferredPrompt = e as BeforeInstallPromptEvent
      setIsInstallable(true)
    }

    window.addEventListener('beforeinstallprompt', handler)

    window.addEventListener('appinstalled', () => {
      deferredPrompt = null
      setIsInstallable(false)
      setIsInstalled(true)
    })

    return () => {
      window.removeEventListener('beforeinstallprompt', handler)
    }
  }, [])

  const installApp = async (): Promise<boolean> => {
    if (!deferredPrompt) return false
    try {
      await deferredPrompt.prompt()
      const choice = await deferredPrompt.userChoice
      deferredPrompt = null
      setIsInstallable(false)
      return choice.outcome === 'accepted'
    } catch {
      return false
    }
  }

  return { isInstallable, isInstalled, installApp }
}
