// Generate sheets/template/*.csv dari seedRows (satu sumber kebenaran).
// Jalankan: node --experimental-strip-types scripts/export-template.ts
import { mkdirSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { seedRows, type SheetName } from '../src/lib/seed.ts'

const dir = fileURLToPath(new URL('../sheets/template/', import.meta.url))
mkdirSync(dir, { recursive: true })

function toCsv(rows: string[][]): string {
  const esc = (f: string) => /[",\n]/.test(f) ? `"${f.replaceAll('"', '""')}"` : f
  return rows.map((r) => r.map(esc).join(',')).join('\r\n') + '\r\n'
}

for (const name of Object.keys(seedRows) as SheetName[]) {
  writeFileSync(`${dir}${name}.csv`, toCsv(seedRows[name]))
  console.log(`template: ${name}.csv (${seedRows[name].length} baris)`)
}
console.log('Selesai. Import file-file ini ke satu Google Spreadsheet (lihat sheets/README.md).')