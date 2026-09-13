// Klien Google Sheets tanpa API key: endpoint public "Publish to web" (gviz tq),
// dibaca read-only dari browser. Cache localStorage TTL 1 jam + fallback ke cache
// basi saat offline (D-006: local-first).
import { parseCsv } from './csv'
import type { SheetName } from './validate'

export class SheetsError extends Error {
  readonly kind: 'network' | 'http' | 'validation'
  constructor(
    kind: 'network' | 'http' | 'validation',
    message: string,
  ) {
    super(message)
    this.name = 'SheetsError'
    this.kind = kind
  }
}

const TTL_MS = 60 * 60 * 1000
const CACHE_PREFIX = 'pla.sheet.v1'

interface CacheEntry {
  at: number
  rows: string[][]
}

function readCache(key: string): CacheEntry | null {
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return null
    const entry = JSON.parse(raw) as CacheEntry
    if (!Array.isArray(entry.rows) || Date.now() - entry.at > TTL_MS) return null
    return entry
  } catch {
    return null
  }
}

function writeCache(key: string, rows: string[][]) {
  try {
    localStorage.setItem(key, JSON.stringify({ at: Date.now(), rows } satisfies CacheEntry))
  } catch {
    // storage penuh / private mode — abaikan, cache sifatnya advisory
  }
}

export function clearSheetsCache() {
  try {
    for (const key of Object.keys(localStorage)) {
      if (key.startsWith(CACHE_PREFIX)) localStorage.removeItem(key)
    }
  } catch {
    // abaikan
  }
}

async function fetchCsv(url: string): Promise<string> {
  for (let attempt = 1; attempt <= 2; attempt++) {
    try {
      const res = await fetch(url, { signal: AbortSignal.timeout(10_000) })
      if (!res.ok) {
        throw new SheetsError(
          'http',
          `Google Sheets menjawab HTTP ${res.status}. Pastikan spreadsheet di-publish (File > Share > Publish to web) dan nama sheet benar.`,
        )
      }
      return await res.text()
    } catch {
      if (attempt === 1) await new Promise((r) => setTimeout(r, 800))
    }
  }
  throw new SheetsError('network', 'Gagal terhubung ke Google Sheets. Periksa koneksi internet.')
}

export class SheetsClient {
  private readonly spreadsheetId: string

  constructor(spreadsheetId: string) {
    this.spreadsheetId = spreadsheetId
  }

  private url(sheet: SheetName): string {
    return `https://docs.google.com/spreadsheets/d/${this.spreadsheetId}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent(sheet)}`
  }

  async get(sheet: SheetName): Promise<string[][]> {
    const key = `${CACHE_PREFIX}.${this.spreadsheetId}.${sheet}`
    const cached = readCache(key)
    try {
      const csv = await fetchCsv(this.url(sheet))
      const rows = parseCsv(csv)
      writeCache(key, rows)
      return rows
    } catch (e) {
      if (cached) return cached.rows // offline: pakai cache basi
      throw e
    }
  }
}