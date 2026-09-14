import { useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import { useAdaptiveLearning } from '../../lib/adaptive'
import { getStoredCompletedLessons } from '../../lib/progress'
import { useData } from '../../lib/store'
import type { ParentContextType } from '../ParentHome'

export function ParentProgressPage() {
  const outletContext = useOutletContext<ParentContextType | undefined>()
  const selectedChild = outletContext?.selectedChild || 'albert'
  const isJasmine = selectedChild === 'jasmine'
  const childName = isJasmine ? 'Jasmine' : 'Albert'
  const childGrade = isJasmine ? 8 : 9

  const { data } = useData()
  const completed = getStoredCompletedLessons(selectedChild)
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>('all')

  const subjects = data?.subjects ?? []
  const topics = (data?.topics ?? []).filter((t) => (t.grade ?? 9) === childGrade)
  const lessons = (data?.lessons ?? []).filter((l) => (l.grade ?? 9) === childGrade)

  const { subjectMasteries, weakTopics } = useAdaptiveLearning(
    subjects,
    topics,
    lessons,
    completed,
  )

  const displayed = selectedSubjectId === 'all'
    ? subjectMasteries
    : subjectMasteries.filter((s) => s.subjectId === selectedSubjectId)

  return (
    <div className="space-y-5 pb-6">
      <div>
        <h2 className="text-base font-black text-slate-900">
          Perkembangan Materi & Kurikulum ({childName})
        </h2>
        <p className="text-xs text-slate-500">
          Evaluasi tingkat penguasaan kompetensi {childName} pada kurikulum SMP Kelas {childGrade}
        </p>
      </div>

      {/* Filter Mata Pelajaran */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        <button
          type="button"
          onClick={() => setSelectedSubjectId('all')}
          className={`whitespace-nowrap rounded-xl px-3.5 py-1.5 text-xs font-bold transition-all ${
            selectedSubjectId === 'all'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          Semua Mapel
        </button>
        {subjectMasteries.map((sub) => (
          <button
            key={sub.subjectId}
            type="button"
            onClick={() => setSelectedSubjectId(sub.subjectId)}
            className={`whitespace-nowrap flex items-center gap-1.5 rounded-xl px-3.5 py-1.5 text-xs font-bold transition-all ${
              selectedSubjectId === sub.subjectId
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            <span>{sub.subjectEmoji}</span>
            <span>{sub.subjectName}</span>
          </button>
        ))}
      </div>

      {/* Kartu Topik yang Butuh Perhatian Khusus */}
      {weakTopics.length > 0 && (
        <div className="rounded-2xl border border-rose-200 bg-rose-50/60 p-4 space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-rose-800 flex items-center gap-1.5">
              <span>⚠️</span> Topik yang Sedang Butuh Pendampingan
            </h3>
            <span className="rounded-full bg-rose-200/80 px-2 py-0.5 text-[10px] font-bold text-rose-800">
              {weakTopics.length} Topik
            </span>
          </div>
          <div className="space-y-2">
            {weakTopics.slice(0, 3).map((topic) => (
              <div
                key={topic.id}
                className="rounded-xl bg-white p-3 border border-rose-100 flex items-center justify-between gap-3 shadow-xs"
              >
                <div>
                  <h4 className="text-xs font-bold text-slate-900">{topic.title}</h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">{topic.diagnosis}</p>
                </div>
                <span className="rounded-full bg-rose-100 px-2.5 py-1 text-xs font-black text-rose-700 shrink-0">
                  {topic.score}%
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Daftar Penguasaan per Mata Pelajaran & Topik */}
      <div className="space-y-4">
        {displayed.map((sub) => (
          <div key={sub.subjectId} className="card p-4 bg-white border border-slate-200/80 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <span className="text-2xl">{sub.subjectEmoji}</span>
                <div>
                  <h3 className="text-sm font-black text-slate-900">{sub.subjectName}</h3>
                  <p className="text-[11px] text-slate-400">{sub.topics.length} Bab Materi</p>
                </div>
              </div>
              <div className="text-right">
                <span className="text-sm font-black text-slate-900">{sub.averageScore}%</span>
                <span className="block text-[10px] font-bold text-slate-400 uppercase">Rata-rata</span>
              </div>
            </div>

            {/* List Topik */}
            <div className="space-y-3 pt-1">
              {sub.topics.map((t) => (
                <div key={t.id} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-800">{t.title}</span>
                    <span
                      className="rounded-full px-2 py-0.5 text-[10px] font-bold"
                      style={{ backgroundColor: `${t.color}20`, color: t.color }}
                    >
                      {t.score}% • {t.levelLabel}
                    </span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{ width: `${t.score}%`, backgroundColor: t.color }}
                    />
                  </div>
                  <p className="text-[10px] text-slate-400">
                    {t.completedLessons} dari {t.totalLessons} materi tuntas dipelajari
                  </p>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
