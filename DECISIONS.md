# DECISIONS.md

Keputusan penting untuk **Personal Learning Adventure Webapp** (Albert).
Format: per keputusan — Context / Decision / Alternatives / Consequences. Updated per phase.

---

## D-001: Text Stack — React + Vite + TypeScript + Tailwind CSS

**Context:** Agent-prompt §5 menetapkan stack: React, Vite, TypeScript, Tailwind CSS, Google Spreadsheet sebagai content store, dan PWA. PRD menuntut offline-first dan konten tidak hardcoded.

**Decision:** SPA React 19 + Vite + TypeScript strict + Tailwind CSS (v4, via Vite plugin). PWA dengan Service Worker (workbox) + manifest. Konten akademik bersumber dari Google Spreadsheet (tidak di-hardcode); progress siswa disimpan lokal (localStorage/IndexedDB).

**Alternatives:** Next.js (overkill untuk SPA personal tanpa SSR); Firebase (butuh akun backend eksternal, bertentangan dengan Sheets-only).

**Consequences:** Build statis yang bisa di-host di mana saja (Vercel/Netlify/GitHub Pages). Tanpa server auth; autentikasi di-handle dengan pola profil + PIN lokal.

---

## D-002: Data Layer — Google Spreadsheet → JSON adapter → lokal store

**Context:** Agent-prompt §6: Google Sheets = content source of truth; priming/offline via lokal store. PRD: progress, streaks, mistakes disimpan per-siswa.

**Decision:** Dua lapis:
1. **Content store** — Google Spreadsheet (tab: kurikulum, topik, soal, opsi, hint, badges). Dibaca lewat endpoint publik CSV/JSON (export URL atau Apps Script web app) → dikonversi adapter → domain types. Cache di IndexedDB untuk offline.
2. **Progress store** — IndexedDB (via Dexie) menyimpan: profil siswa, progress per topik/soal, XP, streak, badges, mistake bank, hasil simulasi.

**Alternatives:** Hardcode JSON kurikulum (dilarang PRD); Supabase (akun eksternal).

**Consequences:** Konten bisa diedit Bu guru di Sheets tanpa deploy. Membutuhkan validasi schema sheet saat load.

---

## D-003: Scope Phase Plan — ikuti Phase 0–12 agent-prompt

**Context:** Agent-prompt §50–51 memerintahkan eksekusi bertahap dengan STOP setelah Phase 0.

**Decision:** Kerjakan strictly Phase 0 → STOP untuk tinjauan user sebelum lanjut Phase 1. Phase 1: app shell + routing + design token Stitch + auth profil. Phase 2: curriculum/content pipeline. Phase 3+: learning modes, gamifikasi, review, parent area, PWA polish.

**Alternatives:** Build langsung semua sekaligus (berisiko melenceng dari spec).

**Consequences:** Progress transparan, tiap phase bisa di-review user.

---

## D-004: Desain — dari stitch_webapp_ui_ux_design (QuestLearn style)

**Context:** User menyediakan folder `stitch_webapp_ui_ux_design/` berisi 9 layar hasil Stitch (student dashboard peta petualangan, boss battle aljabar realm, interactive practice, my mistakes, parent overview, dsb) + DESIGN.md (Luminous Quest: warna/type/spacing).

**Decision:** Adopsi token desain dari `luminous_quest/DESIGN.md`: font Plus Jakarta Sans, palet (indigo primary, emerald secondary, amber accent, slate neutrals), shape rounded-xl, komponen kartu/kapsul/badge, admob-style game-UI yang playful. Layar Stitch menjadi referensi visual tiap fase (bukan pixel-perfect import, melainkan panduan layout/vibe).

**Alternatives:** Desain baru dari nol (nyesuaikan user minta pakai desain Stitch).

**Consequences:** Konsistensi visual; teks/layout tetap menyesuaikan PRD & konten riil.

---

## D-005: Auth & Multi-peran — profil lokal + PIN, role student/parent/teacher

**Context:** PRD mensyaratkan login untuk siswa & orang tua; agent-prompt tidak mewajibkan server auth (build statis tanpa backend).

**Decision:** Profil tersimpan lokal (IndexedDB): pilih profil siswa (Albert) atau Parent Area dengan PIN sederhana. Teacher/operator mengelola konten lewat Google Sheet (tidak ada UI admin di webapp).

**Alternatives:** Login sosmed/email (butuh backend); single-profile tanpa PIN (kurang aman untuk parent dashboard).

**Consequences:** Aman untuk penggunaan keluarga; tanpa reset password berbasis email.

---

## D-006: Bahasa antarmuka — Bahasa Indonesia

**Context:** PRD & desain menggunakan Bahasa Indonesia; target pengguna: Albert (siswa SMP) dan orang tua.

**Decision:** Semua teks UI dalam Bahasa Indonesia; terminologi materi mengikuti kurikulum (Bilangan, Aljabar, Geometri, dll).

**Alternatives:** Bilingual EN/ID (menambah biaya i18n tanpa kebutuhan eksplisit).

**Consequences:** Satu locale saja; copywriting langsung di komponen.

---

## D-007: PWA & Offline — target operasional perangkat siswa

**Context:** PRD: aplikasi bisa dipakai offline (mode belajar), PWA.

**Decision:** Vite PWA (vite-plugin-pwa): precache shell, cache konten kurikulum (stale-while-revalidate), progress tetap tersimpan lokal sehingga offline penuh diizinkan; sinkronisasi ke Sheets tidak diperlukan (progress milik perangkat).

**Alternatives:** Sync progress ke Sheets (butuh API key per user, umur pendek, kompleksitas tinggi).

**Consequences:** Progress tidak pindah antar perangkat; diterima karena webapp personal single-device.

---

## D-008: Sumber Konten Akademik — soal dari sumber resmi, tanpa guru

**Context:** User menegaskan webapp dikembangkan orang tua sendiri; tidak ada guru yang terlibat dalam penyusunan konten. Soal harus dibuat/diambil dari sumber terpercaya (misal dinas pendidikan, Kemdikbud).

**Decision:** Soal & materi di-seed dari sumber resmi — Kemdikbud (Pusmenjar: soal AKM/ANBK, Buku Sekolah Elektronik BSE, Rumah Belajar), Dinas Pendidikan provinsi/kota (arsip soal ujian), dan sumber terbuka lain yang kredibel. Setiap soal membawa atribusi sumber. Tidak ada soal asal-dari-pola-kreatif-bebas untuk materi ujian.

**Alternatives:** Menulis soal sendiri (risiko kualitas & standar dinas tidak terpenuhi); mengambil dari situs non-resmi (validitas rendah).

**Consequences:** Konten sesuai standar resmi; perlu validasi permission/atribusi saat seed; lalu lintas lisensi personal dipakai untuk penggunaan keluarga pribadi.

---

## D-009: Scope Mata Pelajaran — semua mapel kategori ujian SMP Kelas 9

**Context:** Tujuan utama webapp: mempersiapkan Albert (Kelas 9) menghadapi ujian dalam beberapa bulan ke depan; semua mata pelajaran yang masuk kategori ujian harus tersedia.

**Decision:** Daftar mapel aktif mengikuti kategori ujian SMP Kelas 9:
- **Inti (selalu diujikan, juga masuk ANBK Literasi & Numerasi):** Bahasa Indonesia, Matematika, IPA.
- **Ujian Sekolah (menyusul):** Bahasa Inggris, IPS, PPKn, Pendidikan Agama dan Budi Pekerti, PJOK, Seni, Informatika.
Spreadsheet kurikulum di-seed sesuai daftar ini dengan prioritas mapel inti dulu (lihat PRD §8 — struktur tetap configurable via data).

**Alternatives:** Semua mapel prioritas sama (konteks ujian tidak tercermin); hanya 3 mapel inti (kurang lengkap untuk Ujian Sekolah).

**Consequences:** Fokus konten ke mapel yang benar-benar diujikan; mapel tambahan tetap bisa ditambah via Sheets tanpa perubahan kode.

---

## D-010: Scope Mata Pelajaran — fokus 4 mapel ujian nasional + agama Katolik

**Context:** User meminta fokus ke 4 mata pelajaran ujian nasional (BIND, MTK, BING, IPA) dan agama Katolik (PABP).

**Decision:**
1. **Prioritas 1:** 4 mapel ujian nasional (BIND, MTK, BING, IPA) dengan bobot lebih besar.
2. **Prioritas 2:** Pendidikan Agama Katolik (PABP) sebagai mapel agama.
3. **Prioritas 3:** IPS dan PJOK sebagai mapel tambahan.

**Alternatives:** Fokus ke semua mapel (terlalu banyak), atau hanya 3 mapel inti (kurang lengkap).

**Consequences:** Fokus konten ke mapel yang benar-benar diujikan; mapel tambahan tetap bisa ditambah via Sheets tanpa perubahan kode.

---

## D-011: Cakupan mapel final — 9 mapel, 4 mapel lanjutan di phase berikutnya

**Context:** User menyetujui rekomendasi 8 mapel (4 ujian nasional + IPS, PPKn, PJOK, Prakarya & BK) dan menambahkan bahwa 4 mapel lanjutan harus dilengkapi di phase berikutnya (bukan diabaikan).

**Decision:** Daftar mapel final:
1. **Phase MVP (Ujian Nasional):** Bahasa Indonesia, Matematika, Bahasa Inggris, IPA.
2. **Agama:** Pendidikan Agama Katolik (PABP).
3. **Phase Lanjutan (WAJIB dilengkapi):** IPS, PPKn, PJOK, Prakarya & BK.

**Reminder eksplisit:** 4 mapel lanjutan (IPS, PPKn, PJOK, Prakarya & BK) JANGAN terlupakan — konten & soal harus di-seed di phase berikutnya, tidak hanya placeholder.

**Alternatives:** Membatasi app hanya 4 mapel nasional (mengurangi cakupan ujian sekolah).

**Consequences:** Ada 9 mapel di UI; 4 mapel lanjutan ditandai "Menyusul" sampai kontennya di-seed.