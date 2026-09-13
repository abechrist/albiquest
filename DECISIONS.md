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