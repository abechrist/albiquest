import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useProfile } from '../lib/auth'

const ROLE_META = {
  student: { emoji: '🐉', title: 'Petualangan Albert', sub: 'Masuk dengan PIN untuk melanjutkan perjalanan' },
  parent: { emoji: '🛡️', title: 'Area Orang Tua', sub: 'Pantau perkembangan belajar Albert' },
} as const

export function Login() {
  const [params] = useSearchParams()
  const role = (params.get('role') === 'parent' ? 'parent' : 'student') as keyof typeof ROLE_META
  const { login } = useProfile()
  const nav = useNavigate()
  const [pin, setPin] = useState('')
  const [error, setError] = useState(false)

  useEffect(() => setPin(''), [role])

  const meta = ROLE_META[role]
  const digits = [1, 2, 3, 4, 5, 6, 7, 8, 9, '', 0, 'del']

  function press(d: number | 'del') {
    if (d === 'del') return setPin((p) => p.slice(0, -1))
    if (pin.length >= 4) return
    setError(false)
    const next = pin + String(d)
    setPin(next)
    if (next.length === 4) {
      const ok = login(role === 'parent' ? 'parent' : 'albert', next)
      if (ok) nav(role === 'parent' ? '/parent' : '/student', { replace: true })
      else {
        setError(true)
        setTimeout(() => setPin(''), 350)
      }
    }
  }

  return (
    <div className="app-canvas flex flex-col items-center justify-between px-6 py-10">
      <div className="text-center mt-6">
        <div className="text-6xl mb-4">{meta.emoji}</div>
        <h1 className="h-headline">{meta.title}</h1>
        <p className="text-sm text-slate-500 mt-1">{meta.sub}</p>
      </div>

      <div className="w-full flex flex-col items-center gap-6">
        <div className="flex gap-3" aria-label="PIN">
          {[0, 1, 2, 3].map((i) => (
            <span key={i} className={`pin-dot ${pin.length > i ? 'filled' : ''}`} />
          ))}
        </div>
        <p className={`text-xs font-semibold ${error ? 'text-alert' : 'text-transparent'}`} aria-live="polite">
          PIN salah, coba lagi
        </p>

        <div className="grid grid-cols-3 gap-2 w-full max-w-[280px]">
          {digits.map((d, i) =>
            d === '' ? (
              <span key={i} />
            ) : (
              <button
                key={i}
                onClick={() => press(d as number | 'del')}
                className="h-14 rounded-2xl bg-surface border border-slate-200 text-lg font-bold text-slate-800 hover:bg-surface-high active:translate-y-0.5 transition-all cursor-pointer"
              >
                {d === 'del' ? '⌫' : d}
              </button>
            ),
          )}
        </div>

        <button
          onClick={() => nav(role === 'parent' ? '/login?role=student' : '/login?role=parent')}
          className="text-xs font-semibold text-primary underline underline-offset-4 cursor-pointer"
        >
          {role === 'parent' ? '← Masuk sebagai siswa' : 'Masuk sebagai orang tua →'}
        </button>
      </div>
    </div>
  )
}