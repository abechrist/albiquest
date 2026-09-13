# Google Spreadsheet sebagai Database Konten (Phase 2)

Aplikasi membaca konten (mapel, topik, pelajaran, soal) dari satu Google
Spreadsheet yang di-*publish* ke web — tanpa API key, tanpa backend.

## Langkah setup (sekali saja, ~5 menit)

1. **Buat spreadsheet baru** di https://sheets.new
2. **Import template**: menu `File > Import > Upload`, pilih 6 file CSV dari
   folder `sheets/template/` ini:
   - `subjects.csv` — daftar mata pelajaran
   - `curriculum.csv` — strand/unit kurikulum per mapel
   - `competencies.csv` — kompetensi/capaian per topik
   - `topics.csv` — daftar topik
   - `lessons.csv` — daftar pelajaran
   - `questions.csv` — bank soal
   Pilih **"Insert new sheet(s)"** supaya nama sheet mengikuti nama file.
3. **Atur izin**: tombol `Share` (kanan atas) → pilih **"Anyone with the link"** → Viewer.
4. **Publish**: `File > Share > Publish to web` → pilih seluruh workbook →
   **Publish**. (Data hanya bisa dibaca aplikasi; tidak bisa diedit dari aplikasi.)
5. **Ambil Spreadsheet ID** dari URL: `https://docs.google.com/spreadsheets/d/`**`INISIMBOLPANJANG`**`/edit`
6. Di folder proyek: `cp .env.example .env`, isi `VITE_SHEETS_ID=<ID>`, lalu
   `npm run dev`. Chip di halaman Mapel berubah jadi **"📡 Google Sheets"**.

> Tanpa `.env` aplikasi tetap jalan dengan **data contoh lokal** (chip
> "🧪 Data contoh (lokal)") — berguna untuk pengembangan.

## Skema sheet

Baris pertama = header (jangan diubah namanya). Setiap entitas butuh `id` unik;
referensi antar sheet memakai `*_id` dan dicek otomatis (typo ID ditolak dengan
pesan yang menyebut sheet + baris).

| Sheet | Kolom | Keterangan |
|---|---|---|
| subjects | `id, name, emoji, color_from, color_to, description, priority, status, sort_order` | `priority`: 1=ujian nasional, 2=agama, 3=tambahan. `status`: `active` atau `coming` (tampil "Menyusul") |
| curriculum | `id, subject_id, title, description, sort_order` | strand/unit besar kurikulum |
| competencies | `id, topic_id, code, description, sort_order` | mis. kode kompetensi "9.2.1" |
| topics | `id, curriculum_id, subject_id, title, description, sort_order` | topik dalam kurikulum |
| lessons | `id, topic_id, subject_id, title, description, duration_min, type, sort_order` | `type`: `lesson`, `quiz`, `review` |
| questions | `id, lesson_id, subject_id, type, prompt, options, answer, explanation, source, difficulty` | lihat format JSON di bawah |

### Format kolom JSON (questions)

- `options`: array string, contoh `["2 dan 3","-2 dan -3"]` — untuk tipe `mcq`.
  Tipe lain: `[]`.
- `answer`: array string —
  - `mcq` → index opsi benar, contoh `["0"]`
  - `true_false` → `["true"]` / `["false"]`
  - `numeric` / `short` → teks / kata kunci yang diterima, contoh `["7"]` atau
    `["pendapat","opini"]`
- `difficulty`: `1` (mudah) / `2` (sedang) / `3` (sulit)
- `source`: atribusi sumber resmi (D-008), mis. "BSE Matematika Kelas IX, Kemdikbud"

### Aturan penting

- Nama sheet harus persis: `subjects, curriculum, competencies, topics, lessons, questions`.
- Jangan ada baris kosong di tengah data (baris kosong di akhir diabaikan).
- Setiap perubahan di spreadsheet otomatis terlihat setelah cache 1 jam
  (atau tekan tombol **Coba lagi** pada pesan error — cache dibersihkan).
- Aplikasi tetap bisa dipakai offline memakai data yang pernah dimuat (cache lokal).

## Regenerasi template

Template di folder ini di-generate dari `src/lib/seed.ts`. Setelah mengubah seed:

```bash
node --experimental-strip-types scripts/export-template.ts
```