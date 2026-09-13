// Store: repository + hook React. Satu-satunya pintu masuk data untuk UI.
// D-002: repository pattern — sumber (seed/local vs Google Sheets) di-resolve
// dari VITE_SHEETS_ID, tapi bentuk data yang dikonsumsi UI identik.
import { useCallback, useEffect, useState } from 'react'
import type { Competency, Curriculum, Lesson, Question, Subject, Topic } from './domain'
import { seedRows } from './seed'
import { clearSheetsCache, SheetsClient, SheetsError } from './sheets'
import { assertRefs, parseSheetRows, type SheetRows, type SheetName } from './validate'

export interface DataSet {
  subjects: Subject[]
  curriculum: Curriculum[]
  competencies: Competency[]
  topics: Topic[]
  lessons: Lesson[]
  questions: Question[]
}

export type DataSource = { kind: 'seed' } | { kind: 'sheets'; id: string }

// ponytail: kalau nanti perlu multi-spreadsheet (mis. konten terpisah per mapel),
// ganti VITE_SHEETS_ID dengan VITE_SHEETS_CONFIG (JSON map sheet->id).
export function resolveSource(): DataSource {
  const id = import.meta.env.VITE_SHEETS_ID?.trim()
  return id ? { kind: 'sheets', id } : { kind: 'seed' }
}

export async function loadDataSet(source: DataSource): Promise<DataSet> {
  const rows = {} as SheetRows
  for (const name of Object.keys(seedRows) as SheetName[]) {
    rows[name] =
      source.kind === 'seed'
        ? seedRows[name]
        : await new SheetsClient(source.id).get(name)
  }
  const ds = parseSheetRows(rows)
  assertRefs(ds)
  return ds
}

// Repository helpers — pemakaian nanti (Phase 3-4), dibuat karena D-002 menuntut
// pintu akses ter-tipe daripada akses array mentah di UI.
export const bySubject = <T extends { subjectId: string }>(list: T[], subjectId: string) =>
  list.filter((x) => x.subjectId === subjectId)
export const byTopic = <T extends { topicId: string }>(list: T[], topicId: string) =>
  list.filter((x) => x.topicId === topicId)
export const byLesson = <T extends { lessonId: string }>(list: T[], lessonId: string) =>
  list.filter((x) => x.lessonId === lessonId)

function friendlyError(e: unknown): string {
  if (e instanceof SheetsError) {
    if (e.kind === 'validation') return `Data belum valid: ${e.message}`
    return e.message
  }
  return 'Terjadi kesalahan saat memuat data. Coba lagi.'
}

let shared: Promise<DataSet> | null = null

export function useData() {
  const [reloadKey, setReloadKey] = useState(0)
  const [state, setState] = useState<{
    data: DataSet | null
    error: string | null
    loading: boolean
  }>({ data: null, error: null, loading: true })

  useEffect(() => {
    let alive = true
    setState({ data: null, error: null, loading: true })
    shared ??= loadDataSet(resolveSource()).catch((e: unknown) => {
      shared = null // biarkan retry berikutnya mencoba lagi
      throw e
    })
    shared
      .then((d) => alive && setState({ data: d, error: null, loading: false }))
      .catch((e: unknown) => alive && setState({ data: null, error: friendlyError(e), loading: false }))
    return () => {
      alive = false
    }
  }, [reloadKey])

  const reload = useCallback(() => {
    clearSheetsCache()
    shared = null
    setReloadKey((k) => k + 1)
  }, [])

  return { ...state, reload }
}