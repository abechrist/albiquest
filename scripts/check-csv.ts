// Check sekali-jalan untuk parser CSV (node --experimental-strip-types scripts/check-csv.ts)
import assert from 'node:assert/strict'
import { parseCsv } from '../src/lib/csv.ts'

const cases: [string, string, string[][]][] = [
  ['basic', 'a,b,c\n1,2,3\n', [['a', 'b', 'c'], ['1', '2', '3']]],
  ['quoted-comma', 'a,"b,c",d\n', [['a', 'b,c', 'd']]],
  ['escaped-quote', '"say ""hi""",x\n', [['say "hi"', 'x']]],
  ['crlf', 'a,b\r\n1,2\r\n', [['a', 'b'], ['1', '2']]],
  ['multiline-cell', '"line1\nline2",x\n', [['line1\nline2', 'x']]],
  ['trailing-empty-row', 'a,b\n\n', [['a', 'b']]],
  ['last-row-no-newline', 'a,b\n1,2', [['a', 'b'], ['1', '2']]],
]

for (const [name, input, expected] of cases) {
  assert.deepEqual(parseCsv(input), expected, `case ${name} gagal`)
}
console.log(`parseCsv: ${cases.length} kasus PASS`)