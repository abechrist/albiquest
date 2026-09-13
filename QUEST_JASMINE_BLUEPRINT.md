# Blueprint: Setup Quest Jasmine (SMP Kelas 8 — Multi-Student Family Adventure)

> **Trigger Command:** `"setup quest jasmine"`  
> Dokumen ini merupakan cetak biru resmi untuk mengintegrasikan petualangan belajar **Jasmine** (SMP Kelas 8, SMP Pangudi Luhur) ke dalam ekosistem webapp **AlbiQuest**.

---

## 🎯 Visi & Konsep Utama

Mengembangkan aplikasi dari *single-student* (Albert, Kelas 9) menjadi **Multi-Student Family Adventure Hub** terpadu dalam satu webapp, satu domain (`albiquest.vercel.app`), dan satu database PostgreSQL Neon:
1. **Portal Karakter Utama ("Choose Your Hero"):** Halaman awal bernuansa RPG fantasi yang taktil dan interaktif untuk memilih petualangan antara **Albert** (Kelas 9) atau **Jasmine** (Kelas 8).
2. **Isolasi Akademik & Tingkat Kelas:** Kurikulum, bank soal, progres belajar, level XP, dan riwayat kesalahan dipisahkan secara rapi berdasarkan ID siswa (`albert` vs `jasmine`).
3. **Parent Cockpit Terpadu:** Orang tua dapat memantau perkembangan Albert maupun Jasmine dalam satu dasbor dengan tombol *switcher* anak tanpa perlu berpindah akun.
4. **Friendly Sibling Co-op:** Gamifikasi suportif kakak-adik (misal: *Family Daily Streak* saat keduanya aktif belajar di hari yang sama).

---

## 👤 Profil Karakter

### 1. Albert (The Dragon Scholar 🐉)
* **Tingkat:** SMP Kelas 9 (Fase D Akhir) — Persiapan Kelulusan & ANBK
* **Sekolah:** SMP Pangudi Luhur
* **PIN Akses:** `1234`
* **Tema Visual:** Biru Elektrik / Indigo / Api Naga
* **Agama:** Katolik

### 2. Jasmine (The Phoenix / Crystal Seeker 🌸✨)
* **Tingkat:** SMP Kelas 8 (Fase D Pertengahan)
* **Sekolah:** SMP Pangudi Luhur
* **PIN Akses:** `5678` (atau PIN kustom pilihan Jasmine)
* **Tema Visual:** Emerald / Violet / Magenta yang elegan dan bersemangat
* **Agama:** Katolik

---

## 📚 Kurikulum & Silabus Jasmine (SMP Kelas 8 Kurikulum Merdeka)

Mata pelajaran tetap 9 mapel standar sekolah dengan fokus materi Kelas 8:

| Mata Pelajaran | Topik Utama Kelas 8 (Semester 1 & 2) |
|---|---|
| **Matematika** | Pola Bilangan, Koordinat Kartesius, Relasi & Fungsi, Persamaan Garis Lurus (PGL), Sistem Persamaan Linear Dua Variabel (SPLDV), Teorema Pythagoras, Bangun Ruang Sisi Datar, Statistika & Peluang dasar. |
| **IPA (Ilmu Pengetahuan Alam)** | Gerak Benda & Makhluk Hidup, Usaha & Pesawat Sederhana, Struktur & Fungsi Jaringan Tumbuhan, Sistem Pencernaan Manusia, Zat Aditif & Zat Adiktif, Sistem Peredaran Darah Manusia, Tekanan Zat. |
| **Bahasa Indonesia** | Teks Berita, Iklan/Slogan/Poster, Teks Artikel Ilmiah Populer, Teks Resensi/Ulasan, Puisi Modern. |
| **Bahasa Inggris** | Recount Text, Descriptive Text, Degree of Comparison, Past Tense vs Present Perfect, Asking & Giving Opinions. |
| **Pendidikan Agama Katolik** | Pribadi Yesus Kristus yang Mewartakan Kerajaan Allah, Sakramen Inisiasi & Penyembuhan, Makna Gereja sebagai Umat Allah, Perwujudan Iman dalam Kehidupan Sosial. |
| **IPS** | Interaksi Keruangan Negara-negara ASEAN, Pengaruh Interaksi Sosial terhadap Kehidupan Sosial & Kebangsaan, Keunggulan & Keterbatasan Antarruang. |
| **PPKn** | Kedudukan & Fungsi Pancasila, Menumbuhkan Kesadaran terhadap UUD 1945, Tata Urutan Peraturan Perundang-undangan di Indonesia. |
| **PJOK** | Permainan Bola Besar/Kecil, Atletik, Pencak Silat, Kebugaran Jasmani Kelas 8, Pola Hidup Sehat Remaja. |
| **Prakarya & BK** | Kerajinan Bahan Lunak (tanah liat, lilin, sabun), Rekayasa Teknologi Informasi Sederhana, Pengenalan Potensi Diri & Penyesuaian Sosial Remaja. |

---

## 🏗️ Rencana Teknis Implementasi (Technical Checklist)

Saat perintah `"setup quest jasmine"` dipanggil, langkah-langkah yang akan dijalankan:

### 1. Skema Database Neon (PostgreSQL)
- Menambahkan kolom `grade INT DEFAULT 9` pada tabel `curriculum`, `topics`, `lessons`, dan `questions`.
- Menambahkan entri profil baru di `src/lib/auth.tsx`:
  ```ts
  { id: 'jasmine', name: 'Jasmine', role: 'student', grade: 8, pin: '5678', avatar: '🌸', level: 1, xp: 0 }
  ```
- Menjalankan migrasi seed kurikulum & bank soal khusus Kelas 8 untuk Jasmine.

### 2. Portal Masuk Multi-Hero (`/login` & `/portal`)
- Mengubah alur login menjadi layar *Hero Selector*:
  - Kartu Albert (Level, avatar naga, tombol masuk).
  - Kartu Jasmine (Level, avatar phoenix/bunga, tombol masuk).
  - Tombol Perisai Orang Tua di pojok atas (PIN: `9999` / `0000`).
- State profil aktif di-namespace: `pla.profile_saved_jasmine`, `pla.progress_jasmine`, `pla.gamification_jasmine`, `pla.mistakes_jasmine`.

### 3. Filter Konten Berdasarkan Siswa Aktif
- Helper filter:
  ```ts
  const currentGrade = activeProfile.id === 'jasmine' ? 8 : 9
  const availableLessons = lessons.filter(l => l.grade === currentGrade)
  ```
- Albert otomatis melihat silabus Kelas 9, Jasmine otomatis melihat silabus Kelas 8.

### 4. Dasbor Orang Tua Multi-Anak (`ParentSummaryPage.tsx`)
- Tab toggle di bagian atas dasbor orang tua:
  `[ 👦🏻 Albert (Kelas 9) ]` | `[ 👧🏻 Jasmine (Kelas 8) ]`
- Mengganti metrik waktu belajar, penguasaan topik, dan bank kesalahan sesuai anak yang sedang dipilih.
- Laporan mingguan komparatif suportif untuk memuji konsistensi kedua anak.

---

## 🚀 Status Dokumen
- **Status:** TERSIMPAN & TERARSIP RESMI
- **Lokasi File:** `QUEST_JASMINE_BLUEPRINT.md` (root project) dan `DECISIONS.md`
- **Cara Memulai:** Cukup ketik pesan: **`setup quest jasmine`**
