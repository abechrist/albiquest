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

---

## D-012: Google Sheets — publish-to-web gviz CSV, tanpa API key, cache lokal

**Context:** Phase 2 data layer. Butuh sumber konten dari Google Sheets (D-002, D-005) yang bisa dibaca murni dari browser tanpa backend.

**Decision:**
1. **Provider:** endpoint publik "Publish to web" Google Sheets (`gviz/tq?tqx=out:csv&sheet=<nama>`) — read-only, tanpa API key, CORS aman.
2. **Repository pattern:** `src/lib/store.tsx` = satu pintu data (loadDataSet + useData + helper bySubject/byTopic/byLesson). Sumber di-resolve dari env `VITE_SHEETS_ID`; tanpa env → seed lokal (`src/lib/seed.ts`) yang melewati jalur validasi identik.
3. **Schema:** 6 sheet — subjects, curriculum, competencies, topics, lessons, questions. IDs unik, referensi via `*_id` divalidasi silang (typo ditolak dengan pesan sheet+baris).
4. **Konten fleksibel:** opsi/jawaban soal JSON array; mapel tambahan cukup tambah baris di sheet (sesuai D-009/D-011).
5. **Caching:** localStorage TTL 1 jam + fallback cache basi saat offline (selaras D-006 local-first).
6. **Template:** CSV template di `sheets/template/` di-generate dari seed (satu sumber kebenaran) via script.

**Alternatives:** Google Sheets API v4 (butuh API key/OAuth & backend proxy — overkill untuk app pribadi).

**Consequences:** Pemilik konten (orang tua) edit spreadsheet → otomatis terlihat di app (maks 1 jam). Mode dev tanpa spreadsheet tetap jalan via seed.

---

## D-013: Question Engine — Reusable Multi-Type Evaluator, Progressive Hints, dan XP Scoring

**Context:** Phase 4 Question Engine. PRD §17–19 dan agent-prompt §55 mewajibkan engine soal yang modular dan mendukung 6 jenis soal: Multiple Choice (`mcq`), True/False (`true_false`), Short Answer (`short`), Numeric (`numeric`), Matching (`matching`), dan Ordering (`ordering`), disertai progressive hints, scoring XP, dan instant educational feedback.

**Decision:**
1. **Pemisahan Logika & Tampilan:**
   - Logika evaluasi murni di `src/lib/question-evaluator.ts` (100% testable via unit test Node.js tanpa dependensi React/DOM).
   - Hook state dan UI renderer bergaya Stitch di `src/lib/question-engine.tsx`.
2. **Standar 6 Tipe Soal:**
   - `mcq`: pilihan tunggal/jamak berbasis indeks atau teks, tombol taktil bergaya game dengan huruf (A, B, C, D).
   - `true_false`: kartu besar Benar vs Salah.
   - `short`: input teks dengan normalisasi (lowercase, trim, penghapusan tanda baca) dan pencocokan kata kunci/sinonim.
   - `numeric`: input angka dengan penanganan pemisah desimal titik/koma dan toleransi floating point.
   - `matching`: format pasangan "Kiri | Kanan", antarmuka pemilih dua kolom interaktif.
   - `ordering`: susunan langkah/kronologi dengan kontrol reorder naik/turun yang intuitif.
3. **Progressive Hints (PRD §19):**
   - Tier 1: Petunjuk konseptual awal (tersedia/gratis).
   - Tier 2: Petunjuk operasional detail (unlockable dengan konsekuensi -5 XP).
4. **Scoring & Feedback Edukatif:**
   - Base XP: Tingkat 1 (10 XP), Tingkat 2 (20 XP), Tingkat 3 (30 XP).
   - Feedback Drawer instan bergaya Stitch: ucapan selamat & reward XP jika benar, atau pembahasan edukatif suportif & tombol coba lagi jika belum tepat.

**Alternatives:** Single-choice MCQ saja (tidak memenuhi standar AKM/ANBK SMP Kelas 9); validasi di backend (bertentangan dengan arsitektur static local-first).

**Consequences:** Soal interaktif kaya variasi dapat dimainkan offline, siap disambungkan ke Error Bank / My Mistakes pada Phase 5.

---

## D-014: Practice Arena & Error Bank (My Mistakes) — Learning Loop Terintegrasi

**Context:** Phase 5 Practice & Error Bank. PRD §20–21 dan agent-prompt §56 mewajibkan siklus belajar tuntas: Practice → Mistake → Explanation → Review → Retry → Mastered. Area latihan (`/student/practice`) dan bank kesalahan (`/student/mistakes`) harus hidup, interaktif, dan terhubung secara mulus dengan Question Engine.

**Decision:**
1. **Penyimpanan Lokal Persisten:**
   - Store `src/lib/mistakes.ts` menyimpan riwayat kesalahan ke localStorage (`pla.mistakes.v1`) secara offline-first.
   - Setiap kali siswa menjawab salah di Question Engine (baik di pelajaran, latihan kilat, maupun review), kesalahan otomatis terekam beserta jawaban siswa, kunci jawaban, petunjuk yang dipakai, dan jumlah percobaan.
   - Ketika siswa berhasil menjawab benar saat melakukan Retry, status soal otomatis diperbarui dari `needs_review` menjadi `mastered`.
2. **Arena Latihan (`/student/practice`):**
   - 3 Mode: Latihan Kilat (5 soal acak lintas mapel), Spaced Review (khusus soal di Bank Salah), dan Latihan per Mapel.
   - Sesi latihan terpadu dengan status stamina hati, timer, dan layar perayaan skor akhir.
3. **Bank Kesalahan (`/student/mistakes`):**
   - Mengadopsi visual Stitch `my_mistakes_review_bank` dengan banner metrik (Perlu Diulang, Dikuasai, Akurasi Retry %).
   - Komparasi berdampingan *Jawabanmu* (merah/salah) vs *Jawaban Tepat* (hijau/benar).
   - Diagnosa konsep/pola pikir dan tombol modal Coba Lagi (Retry) instan.

**Alternatives:** Menyimpan riwayat hanya di memori sesi (data hilang saat reload); tanpa fitur retry langsung (mengurangi efektivitas belajar mandiri).

**Consequences:** Albert dapat belajar dari setiap kesalahan tanpa rasa takut gagal; metrik kesiapan ujian terakumulasi secara akurat.

---

## D-015: Centralized Gamification Hub — Streaks, Badges, Leveling, & Daily Missions

**Context:** Phase 6 Gamification Hub. PRD §22–24 dan agent-prompt §57 mewajibkan sistem gamifikasi yang memotivasi dan tidak dangkal: daily streak tracking dengan perlindungan freeze, formula leveling non-linear progresif, sistem evaluasi lencana (badges) otomatis yang kaya konteks belajar (streak, mastery, akurasi, eksplorasi), serta misi harian yang terintegrasi dengan penambahan XP langsung.

**Decision:**
1. **Gamification Store & Engine (`src/lib/gamification.ts`):**
   - Formula Level: $XP_{\text{needed}} = \text{round}(100 \times \text{level}^{1.4})$. Menampilkan level saat ini, sisa XP ke level berikutnya, dan persentase progres.
   - Streak Touch System: Mencatat tanggal aktif belajar terakhir. Membedakan hari yang sama (tetap), hari berturut-turut (+1 streak), terlewat 1 hari dengan pelindung *streak freeze* (streak selamat), atau terlewat tanpa freeze (reset ke 1).
   - Dynamic Badge Evaluator: 12 jenis lencana (e.g. *Langkah Pertama*, *Api Ketekunan*, *Master Aljabar*, *Ahli Percobaan*, *Kolektor Bintang*) dievaluasi secara otomatis berdasarkan total XP, streak, soal dijawab, dan soal bank salah yang berhasil dikuasai.
   - Daily Missions: 3 misi harian dinamis (misal: Selesaikan 1 Sesi Latihan, Jawab Benar 3 Soal, Review 1 Kesalahan). Reward XP dapat diklaim satu kali per misi yang selesai, langsung menambah total XP profil.
2. **Profil Siswa Interaktif (`/student/profile`):**
   - Hero profile card dengan avatar Albert, badge level ("Penjelajah Pengetahuan"), progress bar animasi, dan 4 kartu metrik utama.
   - Galeri Badges interaktif dengan filter (Semua, Terbuka, Terkunci), visual icon & deskripsi syarat buka.
   - Tombol cepat akses Area Orang Tua terproteksi PIN.
3. **Integrasi Beranda (`JourneyHome.tsx`):**
   - Widget Misi Harian taktil langsung di beranda dengan indikator progres dan tombol "Klaim +XP" interaktif.

**Alternatives:** Badge statis hardcoded; XP flat tanpa kurva level.

**Consequences:** Memberikan kepuasan instan (instant gratification) yang sehat, menumbuhkan rutinitas belajar harian tanpa menimbulkan stres.