export function Placeholder({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="flex flex-col items-center justify-center text-center px-8 py-20 gap-2">
      <div className="text-5xl mb-2">🗺️</div>
      <h2 className="h-title">{title}</h2>
      <p className="text-sm text-slate-500 max-w-[260px]">{subtitle}</p>
      <span className="chip bg-surface-high text-primary mt-4">Phase berikutnya</span>
    </div>
  )
}