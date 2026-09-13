# Product Requirements Document (PRD)

# Personal Learning Adventure — Albert

**Status:** Draft / Product Baseline
**Platform:** Web App / PWA
**Target:** Siswa SMP Kelas 9
**Primary User:** Albert
**Parent User:** Orang Tua Albert
**Technology Direction:** React + Vite + TypeScript + Tailwind CSS + Google Spreadsheet

---

# 1. Product Overview

Personal Learning Adventure adalah aplikasi web pembelajaran personal untuk membantu siswa SMP Kelas 9 belajar, berlatih, mempersiapkan ujian, memahami kesalahan, dan meningkatkan penguasaan materi melalui pengalaman belajar yang menyenangkan.

Aplikasi dirancang dengan pendekatan:

> **Duolingo + Learning App + Game Adventure**

Aplikasi tidak dimaksudkan sebagai LMS formal, melainkan sebagai **personal learning companion** yang membuat proses belajar terasa seperti sebuah perjalanan dengan:

* XP
* Level
* Streak
* Mission
* Achievement
* Challenge
* Boss Battle
* Learning Adventure
* Progress
* Mastery
* Review
* Practice
* Exam

Aplikasi memiliki dua area utama:

```text
PERSONAL LEARNING ADVENTURE
│
├── 👦 STUDENT AREA
│   ├── Dashboard
│   ├── Learn
│   ├── Practice
│   ├── Challenge
│   ├── Exam
│   ├── Progress
│   ├── Missions
│   ├── Achievements
│   ├── My Mistakes
│   └── Profile
│
└── 👨‍👩‍👦 PARENT AREA
    ├── Dashboard
    ├── Learning Progress
    ├── Subject Mastery
    ├── Weak Topics
    ├── Learning Activity
    ├── Mistake Analysis
    ├── Weekly Report
    └── Recommendations
```

---

# 2. Product Vision

Membangun aplikasi belajar pribadi yang membuat siswa:

> **ingin belajar, tahu apa yang harus dipelajari, memahami kesalahannya, dan dapat melihat perkembangan dirinya.**

Pada saat yang sama, orang tua dapat:

> **memantau perkembangan belajar anak, memahami area yang membutuhkan dukungan, dan memberikan dukungan yang tepat tanpa mengubah aplikasi menjadi alat pengawasan.**

---

# 3. Product Goals

## 3.1 Student Goals

Aplikasi harus membantu Albert:

1. Belajar secara konsisten.
2. Memahami materi, bukan sekadar menghafal.
3. Berlatih soal secara rutin.
4. Mengetahui kesalahan dan kelemahannya.
5. Mengulang materi yang belum dikuasai.
6. Meningkatkan mastery setiap kompetensi.
7. Mempersiapkan ujian.
8. Memiliki motivasi belajar melalui gamifikasi.
9. Mendapat rekomendasi materi berikutnya.
10. Mengetahui perkembangan belajarnya sendiri.

## 3.2 Parent Goals

Aplikasi harus membantu orang tua:

1. Mengetahui apakah anak belajar secara konsisten.
2. Melihat perkembangan penguasaan setiap mata pelajaran.
3. Mengetahui topik yang masih lemah.
4. Melihat perkembangan dari waktu ke waktu.
5. Memahami pola kesalahan anak.
6. Mengetahui aktivitas belajar secara ringkas.
7. Mendapatkan rekomendasi dukungan belajar.
8. Mendapatkan laporan mingguan.
9. Melihat pencapaian anak.
10. Mendukung anak tanpa melakukan micromanagement terhadap proses belajar.

---

# 4. Non-Goals

Aplikasi **bukan**:

* LMS sekolah formal.
* Sistem administrasi sekolah.
* Sistem absensi sekolah.
* Sistem pengawasan anak secara real-time.
* Sistem untuk mengontrol setiap aktivitas anak.
* Sistem yang memungkinkan orang tua mengubah jawaban atau progress siswa.
* Pengganti guru.
* Pengganti buku pelajaran.
* Platform ujian sekolah formal.

---

# 5. Target Users

## 5.1 Student

Target utama:

* Siswa SMP Kelas 9.
* Usia sekitar 14–15 tahun.
* Menggunakan smartphone, tablet, atau laptop.
* Membutuhkan persiapan menghadapi ujian.
* Membutuhkan motivasi belajar.
* Membutuhkan latihan rutin.

## 5.2 Parent

Orang tua/wali siswa yang ingin:

* memantau perkembangan;
* memahami kebutuhan belajar anak;
* melihat konsistensi belajar;
* memberikan dukungan;
* mengetahui pencapaian anak.

---

# 6. Core Product Principles

## 6.1 Learning First

Gamifikasi harus memperkuat pembelajaran, bukan menggantikannya.

## 6.2 Fun but Not Childish

Desain harus:

* modern;
* playful;
* bersih;
* menarik;
* age-appropriate;
* tidak kekanak-kanakan.

## 6.3 Understand Mistakes

Kesalahan merupakan bagian penting dari proses belajar.

Aplikasi harus membantu menjawab:

> "Mengapa jawaban saya salah?"

bukan sekadar:

> "Jawaban salah."

## 6.4 Personalization

Aplikasi harus menyesuaikan rekomendasi berdasarkan:

* progress;
* mastery;
* kesalahan;
* riwayat latihan;
* topik yang belum dikuasai;
* aktivitas belajar.

## 6.5 Parent as Supporter

Parent Area harus membantu orang tua:

> **Monitor → Understand → Support**

bukan:

> **Monitor → Control → Punish**

## 6.6 Data Driven

Materi akademik tidak boleh hardcoded langsung di komponen React.

Content harus berasal dari data layer.

---

# 7. Curriculum Structure

Struktur kurikulum:

```text
Curriculum
    ↓
Phase
    ↓
Grade
    ↓
Subject
    ↓
Learning Unit
    ↓
Topic
    ↓
Competency
    ↓
Lesson
    ↓
Practice
    ↓
Assessment
```

Untuk SMP:

```text
Fase D
├── Kelas VII
├── Kelas VIII
└── Kelas IX
```

Aplikasi harus mampu memetakan:

```text
CP
→ Kompetensi
→ Topik
→ Lesson
→ Practice
→ Assessment
→ Mastery
```

---

# 8. Subjects

Subject harus configurable.

Mata pelajaran awal dapat mencakup:

* Bahasa Indonesia
* Matematika
* IPA
* IPS
* Bahasa Inggris
* PPKn
* Pendidikan Agama dan Budi Pekerti
* PJOK
* Seni
* Informatika
* Koding & AI apabila relevan/diaktifkan

Struktur subject tidak boleh hardcoded sehingga subject dapat ditambah atau dikurangi melalui data.

---

# 9. Learning Architecture

Core learning loop:

```text
LEARN
 ↓
PRACTICE
 ↓
ANALYZE MISTAKES
 ↓
REVIEW
 ↓
CHALLENGE
 ↓
MASTER
```

Sistem harus menyimpan progress pada level:

```text
Subject
→ Topic
→ Competency
→ Lesson
→ Question
```

---

# 10. Lesson Requirements

Setiap lesson idealnya terdiri dari:

1. Learning Objective
2. Concept
3. Example
4. Explanation
5. Think About It
6. Mini Challenge
7. Practice
8. Quick Quiz
9. Mastery Check

Durasi ideal:

> 5–10 menit.

Lesson harus mendukung microlearning.

---

# 11. Learning Modes

Aplikasi menyediakan beberapa mode:

### Learn Mode

Belajar materi.

### Practice Mode

Latihan soal berdasarkan topik.

### Review Mode

Mengulang materi yang belum dikuasai.

### Challenge Mode

Soal dengan tingkat kesulitan lebih tinggi.

### Play Mode

Belajar melalui mekanisme permainan.

### Speed Round

Latihan dengan batas waktu.

### Focus Mode

Belajar tanpa elemen distraksi.

### Five-Minute Mode

Sesi belajar singkat sekitar 5 menit.

---

# 12. Student Dashboard

Dashboard siswa harus menampilkan:

* Greeting
* XP
* Level
* Streak
* Daily Mission
* Continue Learning
* Recommended Learning
* Current Learning Adventure
* Progress
* Recent Achievement

Contoh:

```text
Good afternoon, Albert 👋

🔥 7 Day Streak
⭐ 1,240 XP
🏆 Level 8

Today's Mission
[ +50 XP ] Complete 2 lessons

Continue Learning
Matematika
Persamaan Kuadrat
██████░░ 75%

Recommended
IPA — Sistem Reproduksi

[ Continue Learning ]
```

---

# 13. Daily Mission

Setiap hari sistem dapat menghasilkan mission.

Contoh:

* Selesaikan 1 lesson.
* Kerjakan 10 soal.
* Review 5 kesalahan.
* Raih 100 XP.
* Selesaikan satu topic.
* Lakukan challenge.

Mission memberikan:

* XP;
* progress;
* achievement;
* motivation.

---

# 14. Learning Adventure

Materi ditampilkan sebagai perjalanan.

Contoh:

```text
MATH ADVENTURE

🌱 Bilangan
   ✓

🏕️ Aljabar
   ✓

🏰 Persamaan
   → CURRENT

⚔️ Fungsi
   🔒

🐉 Boss Battle
   🔒
```

Student dapat melihat:

* posisi sekarang;
* materi selesai;
* materi berikutnya;
* locked content;
* challenge;
* boss battle.

---

# 15. Gamification

Gamification mencakup:

* XP
* Level
* Streak
* Achievement
* Badge
* Mission
* Challenge
* Boss Battle
* Progress
* Milestone

Gamification tidak boleh memberikan reward secara sembarangan.

XP dan achievement harus berasal dari aktivitas belajar nyata.

---

# 16. Boss Battle

Boss Battle merupakan assessment khusus setelah beberapa learning unit selesai.

Contoh:

```text
ALGEBRA BOSS BATTLE

10 Questions
Difficulty: Mixed

Target:
80% Mastery

Rewards:
+150 XP
🏆 Algebra Master Badge
```

Boss Battle digunakan sebagai mastery checkpoint.

---

# 17. Question Bank

Question memiliki metadata minimal:

```text
question_id
subject_id
topic_id
competency_id
difficulty
type
question
options
correct_answer
explanation
hint
xp
tags
```

Question type dapat berupa:

* Multiple Choice
* True/False
* Short Answer
* Numeric
* Matching
* Ordering

---

# 18. Question Feedback

Setelah menjawab soal, siswa harus mendapatkan feedback.

Jika benar:

```text
🎉 Correct!

Good job!

Explanation:
...
```

Jika salah:

```text
Not quite.

Correct answer:
B

Why?
...

💡 Hint:
...
```

Feedback harus bersifat edukatif, bukan menghukum.

---

# 19. Hint System

Hint dapat diberikan secara bertahap:

```text
Hint 1
↓
Hint 2
↓
Stronger Hint
↓
Explanation
```

Penggunaan hint dapat dicatat untuk analisis learning behavior.

---

# 20. Error Bank / My Mistakes

Semua kesalahan penting harus dapat masuk ke:

> **My Mistakes**

Informasi:

* question;
* subject;
* topic;
* tanggal;
* jawaban siswa;
* jawaban benar;
* explanation;
* jumlah percobaan;
* hint usage;
* review status.

Siswa dapat melakukan:

```text
Review Mistakes
→ Retry
→ Understand
→ Master
```

---

# 21. Spaced Review

Sistem harus dapat menjadwalkan review berdasarkan:

* kesalahan;
* mastery;
* waktu sejak terakhir belajar;
* frekuensi kesalahan;
* tingkat kesulitan.

Contoh:

```text
Review Today
────────────
5 Math questions
3 IPA questions
2 English questions
```

---

# 22. Adaptive Learning

Sistem harus menghitung mastery.

Contoh:

```text
Matematika
├── Aljabar       90% 🟢
├── Fungsi        72% 🟡
├── Geometri      48% 🔴
└── Statistik     81% 🟢
```

Mastery dapat digunakan untuk menentukan:

* materi berikutnya;
* review;
* rekomendasi;
* difficulty;
* challenge.

---

# 23. Recommendation Engine

Sistem dapat memberikan:

> **What should I learn today?**

Rekomendasi mempertimbangkan:

1. Materi yang belum selesai.
2. Mastery rendah.
3. Kesalahan berulang.
4. Review yang jatuh tempo.
5. Prioritas ujian.
6. Aktivitas terakhir.
7. Keseimbangan antar subject.

Contoh:

```text
Recommended for You

🎯 Geometri
Mastery: 48%

Why?
You made 4 mistakes in this topic.

[ Practice Now ]
```

---

# 24. Mock Exam

Mock Exam harus mendukung:

* timer;
* random question;
* navigation;
* mark for review;
* submit;
* result;
* score;
* topic analysis;
* recommendation.

---

# 25. Exam Result

Setelah exam:

```text
SCORE
82 / 100

Strong
✓ Algebra
✓ Statistics

Needs Practice
⚠ Geometry
⚠ Probability

Recommended:
→ Review Geometry
→ Practice 10 questions
```

---

# 26. Five-Minute Mode

Mode untuk siswa yang hanya memiliki waktu singkat.

Contoh:

```text
5 MINUTES

2 Math Questions
+
1 Concept Review
+
1 Quick Challenge
```

Tujuannya menjaga konsistensi belajar.

---

# 27. Play Mode

Mode belajar berbasis permainan.

Contoh:

* Quiz Rush
* XP Race
* Survival Questions
* Time Attack
* Streak Challenge
* Daily Challenge

Play Mode harus tetap memiliki tujuan akademik yang jelas.

---

# 28. Parent Area

Parent Area merupakan **fitur inti aplikasi**, bukan fitur tambahan.

Tujuan utama:

> Memberikan orang tua gambaran yang jelas mengenai perkembangan belajar Albert sehingga orang tua dapat memberikan dukungan yang tepat.

Parent Area harus menggunakan prinsip:

```text
MONITOR
   ↓
UNDERSTAND
   ↓
SUPPORT
```

Bukan:

```text
MONITOR
   ↓
CONTROL
   ↓
PUNISH
```

---

# 29. Parent Account

Orang tua sebaiknya memiliki akun terpisah dari akun siswa.

Struktur:

```text
Parent Account
      │
      └── Linked Student
              │
              └── Albert
```

Parent Account dapat:

* login;
* melihat dashboard;
* melihat progress;
* melihat mastery;
* melihat aktivitas;
* melihat kesalahan;
* melihat laporan;
* melihat rekomendasi.

Parent **tidak dapat**:

* mengubah jawaban siswa;
* mengubah XP;
* mengubah mastery;
* menghapus riwayat belajar;
* mengubah hasil exam;
* memanipulasi achievement.

---

# 30. Parent Dashboard

Parent Dashboard menjadi halaman utama Parent Area.

Informasi utama:

```text
Albert's Learning Overview

🔥 Learning Streak
7 days

⏱ Active Learning
4h 25m

📚 Sessions
18 sessions

⭐ XP
1,240

🎯 Average Mastery
78%
```

Dashboard juga menampilkan:

* subject mastery;
* weak topics;
* recent activity;
* recent achievements;
* learning trend;
* recommendation.

---

# 31. Parent Learning Progress

Parent dapat melihat perkembangan belajar berdasarkan:

### Overall

```text
Overall Mastery
████████░░ 78%
```

### Subject

```text
Matematika      82%
IPA             76%
Bahasa Inggris  84%
Bahasa Indonesia 79%
IPS             71%
```

### Trend

Parent dapat melihat apakah mastery:

* meningkat;
* stabil;
* menurun.

---

# 32. Parent Subject Mastery

Setiap subject dapat dibuka untuk melihat detail.

Contoh:

```text
MATEMATIKA

Overall Mastery: 82%

Aljabar          92% 🟢
Fungsi           78% 🟡
Geometri         55% 🔴
Statistika       86% 🟢
```

Parent dapat melihat:

* topic;
* competency;
* mastery;
* progress;
* trend;
* recommended support.

---

# 33. Parent Weak Topics

Parent harus dapat melihat topik yang membutuhkan perhatian.

Contoh:

```text
Topics That Need Attention

🔴 Geometry
Mastery: 55%
Repeated mistakes: 6

🟠 Probability
Mastery: 62%
Repeated mistakes: 4

🟡 English Grammar
Mastery: 68%
```

Sistem harus menjelaskan **mengapa** topic dianggap lemah.

Misalnya:

```text
Why Geometry is flagged:

• Mastery below 60%
• 6 incorrect answers
• 3 repeated mistakes
• Last successful practice: 9 days ago
```

---

# 34. Parent Learning Activity

Parent dapat melihat ringkasan aktivitas belajar.

Contoh:

```text
Recent Learning Activity

Today
✓ Math — Algebra — 15 min
✓ IPA — Genetics — 10 min

Yesterday
✓ English — Grammar — 20 min

Monday
✓ Math — Geometry — 15 min
```

Informasi aktivitas harus berupa ringkasan, bukan surveillance real-time.

Tidak perlu menampilkan:

* setiap klik;
* setiap perpindahan halaman;
* setiap detik aktivitas;
* lokasi;
* kamera;
* screen recording.

---

# 35. Parent Mistake Analysis

Parent dapat melihat pola kesalahan.

Contoh:

```text
Mistake Analysis

Mathematics
────────────
Geometry
6 mistakes

Common Pattern:
• Formula selection
• Misreading diagram
• Calculation error
```

Parent dapat memahami:

> "Albert mengalami kesulitan di mana?"

bukan hanya:

> "Nilainya berapa?"

---

# 36. Parent Learning Consistency

Sistem menampilkan konsistensi belajar.

Contoh:

```text
Learning Consistency

This Week

Mon   ███
Tue   ████
Wed   ██
Thu   ████
Fri   ███
Sat   █
Sun   -

5 active days
18 learning sessions
4h 25m total
```

Metric:

* active days;
* sessions;
* active learning time;
* streak;
* weekly target.

---

# 37. Parent Weekly Report

Sistem menghasilkan laporan mingguan.

Contoh:

```text
WEEKLY LEARNING REPORT

Albert
Week: 7–13 September 2026

Learning Time
4h 25m

Active Days
5 / 7

Mastery
Last week: 74%
This week: 78%

Best Progress
Mathematics +8%

Needs Attention
Geometry

Achievement
🏆 7 Day Streak

Recommended Support
Practice Geometry 15 minutes,
3 times this week.
```

Weekly report harus menjawab:

1. Apa yang sudah dilakukan?
2. Apa yang berkembang?
3. Apa yang masih menjadi tantangan?
4. Apa yang sebaiknya dilakukan berikutnya?

---

# 38. Parent Recommendations

Parent mendapatkan rekomendasi yang actionable.

Contoh:

```text
Recommended Support

🎯 Geometry needs attention.

Suggested:
Encourage a 15-minute Geometry
practice session 3 times this week.

Why?
Mastery is currently 55%.
```

Rekomendasi harus bersifat:

* konkret;
* singkat;
* suportif;
* tidak menghakimi.

Hindari:

> "Albert malas belajar."

Gunakan:

> "Aktivitas belajar Matematika minggu ini lebih rendah dari minggu sebelumnya."

---

# 39. Parent Achievements

Parent dapat melihat achievement anak.

Contoh:

```text
Recent Achievements

🏆 7 Day Streak
⭐ 1,000 XP
🎯 Geometry Explorer
🔥 100 Questions
```

Achievement berfungsi sebagai bahan apresiasi dan percakapan positif antara orang tua dan anak.

---

# 40. Parent Learning History

Parent dapat melihat riwayat:

* lesson;
* practice;
* exam;
* challenge;
* review;
* achievement.

Riwayat dapat difilter berdasarkan:

* tanggal;
* subject;
* activity type.

---

# 41. Parent Privacy & Access Principle

Parent Area harus memiliki akses **read-only terhadap academic progress**.

Prinsip:

```text
Student owns learning activity
Parent observes progress
System generates insights
```

Parent tidak boleh memodifikasi data akademik siswa melalui Parent Area.

Jika di masa depan diperlukan fitur intervensi orang tua, fitur tersebut harus dirancang secara eksplisit dan tidak boleh mengubah hasil belajar secara langsung.

---

# 42. Parent Notifications

Notifikasi parent bersifat suportif.

Contoh:

### Achievement

> "Albert menyelesaikan 7-day learning streak 🎉"

### Weekly Report

> "Weekly learning report Albert sudah tersedia."

### Progress

> "Mastery Matematika Albert meningkat 8% minggu ini."

### Attention

> "Geometry masih menjadi area yang membutuhkan latihan lebih lanjut."

Hindari notifikasi bernada menghukum:

> "Albert belum belajar hari ini!"

atau:

> "Albert malas belajar."

---

# 43. Student–Parent Relationship

Hubungan data:

```text
Parent
   │
   │ 1:N
   ▼
Student
   │
   ├── Learning Activity
   ├── Progress
   ├── Mastery
   ├── Mistakes
   ├── Achievements
   ├── Exams
   └── Recommendations
```

Untuk MVP:

```text
1 Parent
   ↓
1 Student (Albert)
```

Arsitektur sebaiknya tetap memungkinkan:

```text
1 Parent
   ↓
Multiple Students
```

di masa depan.

---

# 44. Parent Dashboard Information Architecture

```text
Parent Area
│
├── Dashboard
│
├── Progress
│   ├── Overall
│   ├── Subjects
│   └── Topics
│
├── Activity
│   ├── Learning Sessions
│   ├── Lessons
│   ├── Practice
│   └── Exams
│
├── Insights
│   ├── Weak Topics
│   ├── Mistake Analysis
│   └── Learning Trends
│
├── Achievements
│
├── Weekly Report
│
└── Recommendations
```

---

# 45. Parent Dashboard MVP

Parent Area minimal pada MVP harus menyediakan:

* Parent Login
* Linked Student
* Parent Dashboard
* Overall Progress
* Subject Mastery
* Weak Topics
* Learning Activity
* Achievement
* Weekly Summary

Fitur berikut dapat ditingkatkan setelah MVP:

* detailed mistake analysis;
* advanced trend analysis;
* notifications;
* downloadable reports;
* multiple children;
* AI-generated parent insights.

---

# 46. Bookmark

Student dapat menyimpan:

* lesson;
* question;
* topic.

---

# 47. Personal Notes

Student dapat membuat catatan pribadi pada:

* lesson;
* topic;
* question.

---

# 48. Glossary

Glossary berisi istilah penting.

Contoh:

```text
Photosynthesis
= proses tumbuhan membuat makanan...
```

---

# 49. Formula Bank

Untuk subject yang relevan:

```text
Mathematics
Physics
Chemistry
```

Formula dapat dikelompokkan berdasarkan topic.

---

# 50. Search

Search harus dapat mencari:

* subject;
* topic;
* lesson;
* question;
* glossary;
* formula.

---

# 51. PWA

Aplikasi harus dirancang sebagai PWA.

Target:

* installable;
* responsive;
* mobile friendly;
* fast loading;
* offline-friendly.

Data yang dapat disimpan secara lokal:

* user preferences;
* learning state;
* cached content;
* progress sementara;
* recent activities.

---

# 52. Data Architecture

Google Spreadsheet digunakan sebagai content database untuk MVP.

Logical sheets:

```text
subjects
curriculum
competencies
topics
lessons
lesson_sections
questions
question_options
hints
explanations
quizzes
quiz_questions
achievements
missions
media
glossary
formulas
app_config
```

Untuk Parent Area, data layer juga perlu mendukung:

```text
users
parent_student_links
learning_sessions
learning_activity
student_progress
student_mastery
student_mistakes
student_achievements
exam_results
weekly_reports
recommendations
```

Jika implementasi awal menggunakan localStorage/IndexedDB untuk progress personal, struktur data harus tetap dirancang agar nantinya dapat dipindahkan ke backend/database yang lebih proper.

---

# 53. Data Access Layer

React tidak boleh mengambil data Google Spreadsheet secara langsung dari setiap component.

Gunakan abstraction:

```text
React Components
       ↓
Feature Hooks
       ↓
Repository / Data Service
       ↓
Data Provider
       ↓
Google Spreadsheet
```

Contoh:

```text
SubjectRepository
LessonRepository
QuestionRepository
ProgressRepository
MasteryRepository
ActivityRepository
ParentRepository
ReportRepository
```

---

# 54. Parent Data Aggregation

Parent Dashboard tidak boleh menghitung seluruh analytics secara ad-hoc di UI.

Gunakan service:

```text
Learning Analytics Service
        ↓
Progress
        ↓
Mastery
        ↓
Activity
        ↓
Mistakes
        ↓
Insights
        ↓
Parent Dashboard
```

Contoh:

```text
calculateSubjectMastery()
calculateLearningConsistency()
calculateWeakTopics()
calculateMistakePatterns()
calculateWeeklyProgress()
generateRecommendations()
```

---

# 55. UX Principles

UI harus:

* mobile-first;
* responsive;
* modern;
* playful;
* clean;
* fast;
* intuitive.

Student UI dan Parent UI harus memiliki karakter berbeda.

### Student

Lebih:

* playful;
* energetic;
* gamified.

### Parent

Lebih:

* calm;
* informative;
* analytical;
* clean.

Namun keduanya tetap memiliki visual identity yang sama.

---

# 56. Accessibility

Minimal:

* semantic HTML;
* keyboard navigation;
* sufficient contrast;
* readable typography;
* accessible labels;
* focus states;
* error states;
* reduced-motion consideration.

---

# 57. Performance

Target:

* fast initial load;
* lazy loading;
* optimized assets;
* minimal unnecessary re-render;
* cached content;
* efficient data fetching.

---

# 58. Analytics

Student analytics minimal:

* sessions;
* learning time;
* questions attempted;
* accuracy;
* mastery;
* mistakes;
* hints;
* achievements;
* streak.

Parent analytics menggunakan data agregat tersebut.

---

# 59. MVP

MVP harus memprioritaskan:

## Student

* Authentication
* Dashboard
* Subjects
* Curriculum
* Lessons
* Practice
* Question Engine
* Feedback
* My Mistakes
* Basic Mastery
* XP
* Level
* Streak
* Daily Mission
* Basic Progress

## Parent

* Parent Account
* Student Linking
* Parent Dashboard
* Overall Progress
* Subject Mastery
* Weak Topics
* Learning Activity
* Achievements
* Weekly Summary

## Platform

* React
* Vite
* TypeScript
* Tailwind CSS
* Google Spreadsheet
* Data Layer
* PWA foundation

---

# 60. Phase 2

Phase 2:

* Adaptive Learning
* Spaced Review
* Advanced Recommendation
* Boss Battle
* Challenge Mode
* Mock Exam
* Search
* Bookmark
* Notes
* Glossary
* Formula Bank
* Advanced Parent Analytics
* Weekly Report automation
* Parent notifications

---

# 61. Phase 3

Phase 3:

* AI Tutor
* Explain My Answer
* AI Hint
* AI-generated practice
* AI learning recommendations
* Advanced analytics
* Multiple student accounts
* More advanced offline capabilities

AI must tetap dibatasi oleh content dan learning architecture aplikasi.

---

# 62. Acceptance Criteria

## Student

Student dapat:

* login;
* melihat dashboard;
* memilih subject;
* membuka lesson;
* menyelesaikan practice;
* mendapatkan feedback;
* melihat kesalahan;
* melakukan review;
* memperoleh XP;
* meningkatkan level;
* memperoleh achievement;
* melihat progress.

## Parent

Parent dapat:

* login sebagai parent;
* melihat student yang terhubung;
* melihat dashboard;
* melihat progress;
* melihat mastery;
* melihat weak topics;
* melihat learning activity;
* melihat achievement;
* melihat weekly report;
* melihat recommendation.

Parent tidak dapat:

* mengubah jawaban;
* mengubah score;
* mengubah XP;
* mengubah mastery;
* menghapus academic history.

---

# 63. Definition of Done

Feature dianggap selesai apabila:

* requirement terpenuhi;
* UI responsive;
* loading state tersedia;
* empty state tersedia;
* error state tersedia;
* accessibility diperhatikan;
* data validation tersedia;
* tests tersedia;
* tidak terdapat hardcoded academic content;
* data access menggunakan repository/data layer;
* tidak ada credential Google yang terekspos;
* tidak merusak feature existing;
* dokumentasi diperbarui.

---

# 64. Product Success

Produk dianggap berhasil apabila Albert:

1. Belajar secara konsisten.
2. Meningkatkan mastery.
3. Mengurangi kesalahan berulang.
4. Mampu mengidentifikasi kelemahannya.
5. Lebih siap menghadapi ujian.
6. Merasa belajar lebih menyenangkan.

Produk juga berhasil apabila orang tua:

1. Dapat memahami perkembangan belajar Albert.
2. Dapat mengetahui area yang membutuhkan dukungan.
3. Dapat melihat perkembangan dari waktu ke waktu.
4. Mendapatkan insight yang actionable.
5. Dapat mendukung Albert tanpa perlu mengawasi secara berlebihan.

---

# 65. Final Product Statement

> **Personal Learning Adventure adalah aplikasi belajar personal untuk Albert yang menggabungkan microlearning, latihan soal, mastery learning, adaptive learning, gamifikasi, dan exam preparation dalam pengalaman seperti sebuah game adventure.**
>
> **Aplikasi juga menyediakan Parent Area yang memungkinkan orang tua memantau perkembangan belajar, memahami kekuatan dan kelemahan anak, melihat pola belajar, serta memperoleh rekomendasi dukungan — dengan prinsip read-only, privacy-aware, dan supportive parenting.**
>
> **Tujuan akhirnya bukan sekadar membuat Albert mengerjakan lebih banyak soal, tetapi membantu Albert menjadi pembelajar yang mandiri, konsisten, memahami kesalahan, dan terus berkembang.**

---

# 66. Product Architecture Summary

```text
                    PERSONAL LEARNING ADVENTURE
                              │
               ┌──────────────┴──────────────┐
               │                             │
               ▼                             ▼
        👦 STUDENT AREA                👨‍👩‍👦 PARENT AREA
               │                             │
        ┌──────┼──────┐                ┌─────┼─────┐
        │      │      │                │     │     │
       Learn Practice Challenge       Monitor Understand Support
        │      │      │                │     │     │
        └──────┼──────┘                └─────┼─────┘
               │                             │
               ▼                             ▼
          Learning Data ─────────────────► Analytics
               │                             │
        ┌──────┼───────┐              ┌──────┼──────┐
        ▼      ▼       ▼              ▼      ▼      ▼
      Mastery Mistakes Activity      Progress Insights Reports
        │      │       │              │      │      │
        └──────┴───────┴──────────────┴──────┴──────┘
                              │
                              ▼
                     RECOMMENDATION ENGINE
                              │
                              ▼
                    Better Learning Decisions
```

**Core philosophy:**

> **Learn → Practice → Make Mistakes → Understand → Review → Challenge → Master → Progress → Reflect → Learn Again**

PRD sekarang sudah menempatkan **Parent Area sebagai bagian inti arsitektur produk**, termasuk Parent Account, relasi Parent–Student, dashboard, mastery, weak topics, mistake analysis, activity, weekly report, recommendations, privacy, dan batas akses.
