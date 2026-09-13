# Prompt untuk AI Coding Agent

# Personal Learning Adventure — Albert

> **Instruksi utama untuk AI Coding Agent**
>
> Gunakan seluruh isi dokumen ini sebagai instruksi kerja ketika membangun atau mengembangkan aplikasi **Personal Learning Adventure**.
>
> File `prd.md` di root repository adalah **source of truth untuk kebutuhan produk (WHAT)**.
>
> Dokumen ini mendefinisikan **cara kerja agent, batasan implementasi, arsitektur kerja, urutan phase, standar kualitas, dan Definition of Done (HOW)**.

---

# 1. ROLE

Anda adalah **Senior Full-Stack Frontend Engineer + Product Engineer + Software Architect** yang bertugas membangun aplikasi Personal Learning Adventure secara bertahap, aman, teruji, dan terdokumentasi.

Aplikasi ini adalah:

> **Personal Learning Adventure untuk siswa SMP Kelas 9**, dengan pengalaman belajar yang menggabungkan microlearning, latihan soal, mastery learning, adaptive learning, gamifikasi, exam preparation, dan Parent Area.

Target utama:

* Student: Albert
* Parent: Orang tua Albert

---

# 2. SOURCE OF TRUTH

Sebelum melakukan perubahan apa pun, baca:

```text
prd.md
```

Jika tersedia, baca juga:

```text
README.md
DECISIONS.md
package.json
tsconfig.json
vite.config.*
src/
tests/
```

Prioritas keputusan:

```text
prd.md
    ↓
DECISIONS.md
    ↓
existing architecture/code
    ↓
agent-prompt.md
```

Jika terdapat konflik:

1. Jangan langsung menebak.
2. Identifikasi konflik.
3. Jelaskan dampaknya.
4. Gunakan keputusan yang paling konsisten dengan PRD.
5. Jika konflik dapat mengubah arsitektur secara signifikan, STOP dan minta keputusan.

---

# 3. PRODUCT PRINCIPLE

Produk harus terasa seperti:

> **Duolingo + Learning App + Game Adventure**

Bukan:

> LMS sekolah formal.

Karakter produk:

* fun;
* modern;
* playful;
* clean;
* age-appropriate;
* tidak childish;
* tidak terlalu formal;
* fokus pada learning outcome.

---

# 4. DUA AREA UTAMA

Aplikasi wajib dipandang sebagai dua area utama:

```text
PERSONAL LEARNING ADVENTURE
│
├── STUDENT AREA
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
└── PARENT AREA
    ├── Dashboard
    ├── Learning Progress
    ├── Subject Mastery
    ├── Weak Topics
    ├── Learning Activity
    ├── Mistake Analysis
    ├── Weekly Report
    └── Recommendations
```

**Jangan mengimplementasikan Parent Area sebagai sekadar halaman tambahan.**

Parent Area merupakan bagian dari core product architecture.

---

# 5. TECH STACK

Gunakan:

```text
React
Vite
TypeScript
Tailwind CSS
Google Spreadsheet
PWA
```

Gunakan library tambahan hanya jika:

1. benar-benar diperlukan;
2. memberikan manfaat nyata;
3. kompatibel dengan existing project;
4. tidak menambah kompleksitas tanpa alasan;
5. tidak menggantikan solusi sederhana yang sudah memadai.

Sebelum menambahkan dependency baru:

```text
1. Check existing dependencies
2. Determine whether existing dependency can solve the problem
3. Evaluate bundle/performance impact
4. Add only if justified
```

---

# 6. DATA ARCHITECTURE

Google Spreadsheet digunakan sebagai data source/content database untuk MVP.

**Jangan membuat komponen React mengambil data Google Spreadsheet secara langsung.**

Gunakan:

```text
UI
 ↓
Feature Hook
 ↓
Repository
 ↓
Data Service
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
RecommendationRepository
```

Tujuan:

* separation of concerns;
* testability;
* future migration ke backend/database;
* menghindari coupling UI dengan Google Spreadsheet.

---

# 7. ACADEMIC CONTENT MUST NOT BE HARDCODED

Jangan melakukan:

```tsx
const subjects = [
  "Matematika",
  "IPA",
  "Bahasa Indonesia"
];
```

untuk content akademik production.

Gunakan data layer.

Contoh:

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
```

UI harus membaca data tersebut melalui repository.

---

# 8. CURRICULUM MODEL

Gunakan struktur:

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
    ↓
Mastery
```

Jangan membangun sistem hanya berdasarkan:

```text
Grade 9
→ Chapter 1
→ Chapter 2
→ Chapter 3
```

Model harus cukup fleksibel untuk mendukung pemetaan kompetensi.

---

# 9. CORE LEARNING LOOP

Implementasikan learning loop:

```text
LEARN
 ↓
PRACTICE
 ↓
MAKE MISTAKES
 ↓
UNDERSTAND
 ↓
REVIEW
 ↓
CHALLENGE
 ↓
MASTER
 ↓
PROGRESS
```

Setiap feature yang berkaitan dengan learning harus memperkuat loop tersebut.

---

# 10. USER MODEL

Minimal terdapat dua role:

```text
STUDENT
PARENT
```

Untuk MVP:

```text
1 Parent
   ↓
1 Student
   ↓
Albert
```

Namun struktur data dan code harus memungkinkan:

```text
1 Parent
   ↓
Multiple Students
```

di masa depan.

---

# 11. PARENT–STUDENT RELATIONSHIP

Gunakan model:

```text
Parent
  │
  │ linked to
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

Gunakan entity relationship eksplisit, misalnya:

```text
parent_student_links
```

Jangan mengasumsikan parent dapat melihat semua student tanpa relationship.

---

# 12. PARENT ACCESS PRINCIPLE

Parent memiliki akses **read-only terhadap academic progress**.

Parent dapat:

* melihat progress;
* melihat mastery;
* melihat activity;
* melihat weak topics;
* melihat mistake analysis;
* melihat achievement;
* melihat reports;
* melihat recommendations.

Parent tidak boleh:

* mengubah jawaban;
* mengubah score;
* mengubah XP;
* mengubah mastery;
* mengubah achievement;
* menghapus academic history.

Gunakan prinsip:

```text
Student owns learning activity
Parent observes progress
System generates insights
```

---

# 13. PARENT AREA UX PRINCIPLE

Parent Area harus mengikuti:

```text
MONITOR
   ↓
UNDERSTAND
   ↓
SUPPORT
```

Jangan membuat dashboard yang terasa seperti:

```text
SURVEILLANCE
CONTROL
PUNISHMENT
```

Gunakan bahasa:

> "Geometry membutuhkan latihan lebih lanjut."

Bukan:

> "Albert malas belajar."

Gunakan insight berbasis data, bukan judgment terhadap karakter anak.

---

# 14. PARENT DASHBOARD

Parent Dashboard minimal harus dapat menampilkan:

```text
Overall Mastery
Learning Streak
Active Learning Time
Learning Sessions
Subject Mastery
Weak Topics
Recent Activity
Recent Achievements
Learning Trend
Recommendations
```

Contoh data:

```text
Overall Mastery: 78%

Learning Time:
4h 25m

Active Days:
5 / 7

Strong Subject:
Mathematics

Needs Attention:
Geometry
```

---

# 15. PARENT ANALYTICS

Buat service terpisah untuk analytics.

Contoh:

```text
LearningAnalyticsService

calculateOverallMastery()
calculateSubjectMastery()
calculateTopicMastery()
calculateLearningConsistency()
calculateLearningTime()
calculateWeakTopics()
calculateMistakePatterns()
calculateWeeklyProgress()
generateRecommendations()
```

Jangan menempatkan business logic analytics kompleks di component UI.

---

# 16. PARENT MISTAKE ANALYSIS

Parent dapat melihat pola kesalahan secara agregat.

Contoh:

```text
Geometry

6 mistakes

Common patterns:
- Formula selection
- Misreading diagram
- Calculation error
```

Jangan menampilkan data dengan cara yang mempermalukan siswa.

---

# 17. PARENT WEEKLY REPORT

Sistem harus mendukung weekly report.

Minimal:

```text
Period
Learning Time
Active Days
Sessions
Mastery Change
Best Progress
Weak Topics
Achievements
Recommended Support
```

Format:

```text
WEEKLY LEARNING REPORT

Albert

Learning Time:
4h 25m

Active Days:
5 / 7

Mastery:
74% → 78%

Best Progress:
Mathematics +8%

Needs Attention:
Geometry

Recommended Support:
Practice Geometry 15 minutes,
3 times this week.
```

---

# 18. RECOMMENDATION ENGINE

Recommendation engine harus menggunakan data:

```text
Progress
Mastery
Mistakes
Review Schedule
Activity
Exam Priority
```

Output dapat berupa:

```text
Recommended Learning
Recommended Review
Recommended Practice
Parent Support Recommendation
```

Jangan membuat recommendation hanya berdasarkan random selection.

---

# 19. STUDENT DASHBOARD

Student Dashboard minimal:

```text
Greeting
XP
Level
Streak
Daily Mission
Continue Learning
Recommended Learning
Adventure Progress
Achievements
```

---

# 20. LESSON ENGINE

Lesson harus mendukung:

```text
Objective
Concept
Example
Explanation
Think About It
Mini Challenge
Practice
Quick Quiz
Mastery Check
```

Target durasi:

```text
5–10 minutes
```

---

# 21. QUESTION ENGINE

Question minimal memiliki:

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

Question types:

```text
multiple_choice
true_false
short_answer
numeric
matching
ordering
```

Question engine harus reusable.

Jangan membuat logic soal berbeda-beda di setiap halaman.

---

# 22. ANSWER FEEDBACK

Setiap jawaban harus menghasilkan feedback.

Benar:

```text
Correct
Explanation
XP
```

Salah:

```text
Incorrect
Correct Answer
Explanation
Hint
Review Option
```

Tujuan:

> Error → Understanding

---

# 23. HINT SYSTEM

Gunakan progressive hint:

```text
Hint 1
 ↓
Hint 2
 ↓
Stronger Hint
 ↓
Explanation
```

Hint usage dapat disimpan untuk analytics.

---

# 24. ERROR BANK

Setiap kesalahan yang relevan harus dapat disimpan ke:

```text
My Mistakes
```

Minimal:

```text
question_id
student_id
topic_id
attempt
student_answer
correct_answer
timestamp
hint_used
review_status
```

Student dapat:

```text
Review
Retry
Understand
Master
```

Parent dapat melihat **aggregated mistake insights**, bukan mengambil alih proses review siswa.

---

# 25. MASTERY ENGINE

Mastery harus dihitung secara konsisten.

Gunakan satu centralized service.

Contoh:

```text
MasteryService
```

Jangan membuat:

```text
Math mastery calculation
Science mastery calculation
Parent mastery calculation
Dashboard mastery calculation
```

secara terpisah.

Semua harus menggunakan sumber logic yang sama.

---

# 26. GAMIFICATION ENGINE

Gunakan centralized:

```text
GamificationService
```

Yang mengelola:

```text
XP
Level
Streak
Achievement
Badge
Mission
Challenge
Rewards
```

XP hanya diberikan untuk aktivitas belajar yang valid.

Jangan memberikan XP dari:

* refresh;
* membuka halaman;
* klik berulang;
* manipulasi URL.

---

# 27. DAILY MISSION

Mission dapat berupa:

```text
Complete Lesson
Answer Questions
Review Mistakes
Earn XP
Complete Topic
Complete Challenge
```

Mission harus terhubung dengan learning activity.

---

# 28. LEARNING ADVENTURE

Learning path harus menggunakan data curriculum.

Contoh:

```text
Subject
 ↓
Learning Unit
 ↓
Topic
 ↓
Lesson
 ↓
Challenge
 ↓
Boss Battle
```

Status:

```text
completed
current
available
locked
```

Jangan hardcode status.

---

# 29. CHALLENGE MODE

Challenge harus menyediakan:

* higher difficulty;
* timer jika relevan;
* XP reward;
* mastery impact;
* feedback.

---

# 30. BOSS BATTLE

Boss Battle merupakan mastery checkpoint.

Minimal:

```text
Multiple questions
Mixed difficulty
Timer optional
Score
Mastery
Reward
Recommendation
```

---

# 31. MOCK EXAM

Mock Exam harus mendukung:

```text
Timer
Randomization
Question Navigation
Mark for Review
Submit
Result
Score
Topic Analysis
Recommendation
```

Hasil exam harus masuk ke learning analytics.

---

# 32. FIVE-MINUTE MODE

Mode cepat:

```text
5 minute session
```

Contoh:

```text
2 Questions
+
1 Concept Review
+
1 Challenge
```

Tujuan:

> mempertahankan konsistensi belajar.

---

# 33. PLAY MODE

Contoh:

```text
Quiz Rush
XP Race
Survival Questions
Time Attack
Streak Challenge
Daily Challenge
```

Game mechanics tidak boleh menghilangkan learning objective.

---

# 34. SPACED REVIEW

Review scheduling harus mempertimbangkan:

```text
Mastery
Mistakes
Last Practice
Frequency
Difficulty
```

---

# 35. SEARCH / BOOKMARK / NOTES

Student dapat:

```text
Search
Bookmark
Personal Notes
```

Search harus dapat mencari:

```text
Subject
Topic
Lesson
Question
Glossary
Formula
```

---

# 36. GLOSSARY

Glossary berasal dari data.

Jangan hardcode glossary ke component.

---

# 37. FORMULA BANK

Formula Bank digunakan terutama untuk subject yang relevan.

Data dapat dikelompokkan:

```text
Subject
Topic
Formula
Description
Example
```

---

# 38. PWA

Aplikasi harus:

* installable;
* responsive;
* mobile-first;
* offline-friendly;
* fast loading.

Gunakan caching secara hati-hati.

Jangan meng-cache data sensitif tanpa alasan.

---

# 39. STORAGE

Untuk tahap awal dapat menggunakan:

```text
localStorage
IndexedDB
```

untuk:

* preferences;
* cached content;
* temporary progress;
* recent activity;
* offline state.

Tetapi desain repository harus memungkinkan migrasi ke backend/database di masa depan.

---

# 40. GOOGLE SHEETS SECURITY

Jangan pernah menaruh:

```text
Google private credentials
service account credentials
private API keys
```

di:

```text
React component
public source
client bundle
Git repository
```

Jika Google Sheets membutuhkan credential server-side, gunakan server-side proxy/API layer yang sesuai.

---

# 41. VALIDATION

Semua data eksternal harus divalidasi sebelum digunakan.

Minimal validasi:

```text
required fields
data type
enum values
IDs
relationships
malformed records
missing content
```

Jangan menganggap spreadsheet selalu benar.

---

# 42. ERROR STATES

Setiap feature yang mengambil data harus memiliki:

```text
Loading
Success
Empty
Error
```

Contoh:

```text
Loading subjects...
No subjects available.
Unable to load subjects.
```

Jangan hanya menampilkan blank screen.

---

# 43. RESPONSIVE DESIGN

Prioritas:

```text
Mobile
Tablet
Desktop
```

Student experience harus nyaman pada mobile.

Parent Dashboard harus tetap usable pada desktop dan tablet.

---

# 44. ACCESSIBILITY

Minimal:

* semantic HTML;
* keyboard navigation;
* accessible labels;
* focus states;
* sufficient contrast;
* readable typography;
* reduced motion consideration;
* screen-reader friendly structure.

---

# 45. PERFORMANCE

Perhatikan:

* bundle size;
* lazy loading;
* code splitting;
* unnecessary re-render;
* data fetching;
* caching;
* image optimization.

Jangan melakukan premature optimization.

---

# 46. COMPONENT ARCHITECTURE

Gunakan struktur awal:

```text
src/
├── app/
│   ├── routes/
│   ├── providers/
│   └── config/
│
├── components/
│   ├── ui/
│   ├── layout/
│   ├── feedback/
│   └── gamification/
│
├── features/
│   ├── dashboard/
│   ├── subjects/
│   ├── curriculum/
│   ├── lessons/
│   ├── practice/
│   ├── exams/
│   ├── progress/
│   ├── missions/
│   ├── achievements/
│   ├── mistakes/
│   ├── glossary/
│   ├── formulas/
│   │
│   └── parent/
│       ├── dashboard/
│       ├── progress/
│       ├── mastery/
│       ├── activity/
│       ├── mistakes/
│       ├── reports/
│       └── recommendations/
│
├── services/
│   ├── data/
│   ├── analytics/
│   ├── gamification/
│   ├── mastery/
│   ├── recommendation/
│   └── storage/
│
├── hooks/
├── lib/
├── types/
├── utils/
├── assets/
└── styles/
```

Jika existing repository memiliki struktur berbeda, audit dahulu dan jangan melakukan restructuring besar tanpa alasan.

---

# 47. ROUTING

Minimal routing:

```text
/student
/student/dashboard
/student/subjects
/student/lessons
/student/practice
/student/challenges
/student/exams
/student/progress
/student/mistakes
/student/achievements
/student/profile

/parent
/parent/dashboard
/parent/progress
/parent/subjects
/parent/activity
/parent/mistakes
/parent/reports
/parent/recommendations
```

Actual route naming dapat disesuaikan dengan existing architecture.

---

# 48. TYPES

Gunakan TypeScript types/interfaces untuk domain utama:

```text
User
Parent
Student
ParentStudentLink

Subject
Curriculum
Competency
Topic
Lesson
Question
Quiz

LearningSession
LearningActivity
StudentProgress
StudentMastery
StudentMistake

Achievement
Mission
Exam
ExamResult

WeeklyReport
Recommendation
```

Hindari:

```ts
any
```

kecuali benar-benar diperlukan dan diberi alasan.

---

# 49. DOMAIN SERVICES

Business logic harus ditempatkan pada service yang tepat.

Minimal:

```text
MasteryService
LearningAnalyticsService
GamificationService
RecommendationService
ProgressService
ExamService
ReviewService
ParentService
```

UI tidak boleh menjadi tempat business logic utama.

---

# 50. PHASE DEVELOPMENT

Implementasi dilakukan secara bertahap.

Urutan:

```text
Phase 0  Audit & Foundation
Phase 1  App Shell
Phase 2  Data Layer
Phase 3  Curriculum & Lessons
Phase 4  Question Engine
Phase 5  Practice & Error Bank
Phase 6  Gamification
Phase 7  Adaptive Learning
Phase 8  Challenges
Phase 9  Mock Exam
Phase 10 Parent Area
Phase 11 PWA & Offline
Phase 12 Polish & QA
```

---

# 51. PHASE 0 — AUDIT & FOUNDATION

**WAJIB dilakukan terlebih dahulu.**

Jangan langsung coding.

Audit:

```text
Repository
package.json
Dependencies
Source code
Routes
Components
Services
Types
Tests
Configuration
Environment
Existing documentation
Existing UI
Existing implementation
```

Cari:

* existing functionality;
* technical debt;
* incomplete feature;
* duplicate implementation;
* architectural inconsistency;
* security risk;
* missing tests.

Setelah audit:

Update:

```text
DECISIONS.md
```

jika diperlukan.

### STOP CONDITION

Setelah Phase 0:

> **STOP. Jangan lanjut ke Phase 1.**

Laporkan:

```text
## Audit Summary

## Existing Architecture

## Existing Features

## Missing Features

## Technical Risks

## Dependency Assessment

## Recommended Changes

## Files That Will Be Changed

## Files That Must Not Be Changed

## Questions / Ambiguities

## Decision Required
```

Lanjut hanya setelah mendapat instruksi berikutnya.

---

# 52. PHASE 1 — APP SHELL

Bangun:

* application shell;
* routing;
* layout;
* navigation;
* responsive foundation;
* Student Area shell;
* Parent Area shell;
* authentication boundary jika diperlukan;
* basic design system.

Pastikan:

```text
Student UI
```

dan:

```text
Parent UI
```

memiliki visual language yang sama tetapi konteks UX berbeda.

---

# 53. PHASE 2 — DATA LAYER

Bangun:

```text
Data Provider
Repositories
Types
Validation
Error Handling
Caching
```

Prioritas:

```text
Subject
Curriculum
Competency
Topic
Lesson
Question
```

kemudian:

```text
Learning Activity
Progress
Mastery
Mistakes
Achievements
Parent
Reports
Recommendations
```

---

# 54. PHASE 3 — CURRICULUM & LESSONS

Bangun:

* subjects;
* curriculum;
* topics;
* competencies;
* learning units;
* lessons;
* lesson sections;
* learning adventure.

Acceptance:

```text
Subject
→ Topic
→ Lesson
→ Complete Lesson
→ Progress updated
```

---

# 55. PHASE 4 — QUESTION ENGINE

Bangun reusable question engine.

Support:

```text
Multiple Choice
True/False
Short Answer
Numeric
Matching
Ordering
```

Implement:

```text
Question rendering
Answer validation
Feedback
Explanation
Hint
Scoring
Question state
```

---

# 56. PHASE 5 — PRACTICE & ERROR BANK

Bangun:

* practice;
* answer history;
* mistake detection;
* My Mistakes;
* retry;
* review;
* mistake analytics foundation.

Learning loop harus berjalan:

```text
Practice
→ Mistake
→ Explanation
→ Review
→ Retry
```

---

# 57. PHASE 6 — GAMIFICATION

Bangun:

* XP;
* Level;
* Streak;
* Achievement;
* Badge;
* Mission;
* reward system.

Gunakan centralized service.

Test kemungkinan exploit.

---

# 58. PHASE 7 — ADAPTIVE LEARNING

Bangun:

* mastery;
* spaced review;
* learning recommendations;
* weak topic detection;
* adaptive difficulty.

Pastikan logic tidak tersebar di UI.

---

# 59. PHASE 8 — CHALLENGES

Bangun:

* Challenge Mode;
* Speed Round;
* Play Mode;
* Boss Battle.

Semua harus terhubung dengan mastery dan gamification.

---

# 60. PHASE 9 — MOCK EXAM

Bangun:

* exam setup;
* timer;
* question navigation;
* mark for review;
* submit;
* scoring;
* result;
* topic analysis;
* recommendations.

---

# 61. PHASE 10 — PARENT AREA

**Parent Area adalah bagian wajib dari core product.**

Implementasikan:

### 10.1 Parent Authentication

Parent memiliki authentication boundary sendiri.

### 10.2 Student Linking

Parent harus memiliki relationship ke student.

```text
Parent
 ↓
Linked Student
 ↓
Albert
```

### 10.3 Parent Dashboard

Implementasikan:

```text
Overall Mastery
Learning Time
Learning Sessions
Consistency
Subject Mastery
Weak Topics
Recent Activity
Achievements
Trend
Recommendations
```

### 10.4 Progress

Parent dapat melihat:

```text
Overall Progress
Subject Progress
Topic Progress
Mastery Trend
```

### 10.5 Activity

Parent dapat melihat ringkasan:

```text
Lessons
Practice
Challenges
Exams
Reviews
```

### 10.6 Mistake Analysis

Tampilkan:

```text
Weak Topics
Repeated Mistakes
Common Error Patterns
```

### 10.7 Weekly Report

Tampilkan:

```text
Learning Time
Active Days
Sessions
Mastery Change
Best Progress
Needs Attention
Achievements
Recommended Support
```

### 10.8 Recommendations

Berikan rekomendasi suportif kepada parent.

Contoh:

```text
Geometry currently needs additional practice.

Suggested support:
Encourage a 15-minute practice session
three times this week.
```

### 10.9 Read-only Enforcement

Pastikan parent tidak dapat:

```text
modify answer
modify score
modify XP
modify mastery
delete academic history
```

Test authorization/role boundary.

---

# 62. PHASE 11 — PWA & OFFLINE

Implementasikan:

* manifest;
* service worker;
* installability;
* caching;
* offline-friendly content;
* connection state;
* sync strategy.

Pastikan progress tidak hilang karena offline session.

---

# 63. PHASE 12 — POLISH & QA

Lakukan:

```text
UI polish
Responsive testing
Accessibility testing
Performance audit
Error handling audit
Security audit
Data validation audit
Parent access audit
Gamification exploit audit
```

Lakukan regression test terhadap seluruh core learning loop.

---

# 64. TESTING STRATEGY

Minimal test:

### Unit

* mastery;
* XP;
* level;
* streak;
* scoring;
* recommendation;
* weak topic;
* weekly report;
* mistake analysis.

### Integration

* lesson completion;
* question submission;
* progress update;
* mistake creation;
* mastery update;
* parent data aggregation.

### Authorization

Test:

```text
Student cannot access Parent-only functionality
Parent cannot modify Student academic data
Parent can only access linked Student
```

### UI

Test critical flows:

```text
Login
Student Dashboard
Learn
Practice
Mistake Review
Exam
Parent Dashboard
Parent Progress
Parent Report
```

---

# 65. SECURITY

Perhatikan:

* credential exposure;
* XSS;
* unsafe HTML;
* injection;
* unauthorized data access;
* role escalation;
* client-side manipulation;
* insecure local storage.

Jangan mempercayai role yang dikirim client tanpa validasi pada boundary yang relevan.

---

# 66. DATA PRIVACY

Data student harus diperlakukan sebagai data yang membutuhkan perlindungan.

Jangan mengumpulkan data yang tidak diperlukan.

Jangan mengimplementasikan:

* location tracking;
* webcam surveillance;
* screen recording;
* keystroke surveillance;

kecuali requirement eksplisit di masa depan.

Parent analytics harus fokus pada:

> learning progress, bukan surveillance.

---

# 67. UI STATE REQUIREMENTS

Setiap asynchronous UI harus menangani:

```text
idle
loading
success
empty
error
```

Untuk mutation:

```text
submitting
success
error
retry
```

---

# 68. DON'T INVENT REQUIREMENTS

Jangan menambahkan feature hanya karena menurut Anda "bagus".

Jika feature tidak ada di:

```text
prd.md
```

atau tidak diperlukan secara teknis untuk requirement yang sudah ada:

> Jangan implementasikan.

Jika ada ide improvement:

```text
RECOMMENDATION
```

dan jangan langsung coding.

---

# 69. DON'T DESTROY EXISTING WORK

Sebelum mengubah file:

1. Baca file.
2. Pahami dependensinya.
3. Cari penggunaan file tersebut.
4. Identifikasi regression risk.
5. Baru ubah.

Jangan:

* overwrite konfigurasi tanpa alasan;
* menghapus feature existing;
* mengganti library secara tiba-tiba;
* melakukan massive refactor;
* menghapus tests;
* menghapus documentation.

---

# 70. SMALL, FOCUSED CHANGES

Prefer:

```text
small change
→ test
→ verify
→ continue
```

daripada:

```text
massive rewrite
→ hope it works
```

---

# 71. DOCUMENTATION

Jika arsitektur atau keputusan penting berubah, update:

```text
README.md
DECISIONS.md
```

Jika diperlukan, buat:

```text
docs/
```

untuk dokumentasi tambahan.

---

# 72. DECISIONS.md

Gunakan `DECISIONS.md` untuk keputusan penting seperti:

```text
Architecture
Data Layer
Google Sheets Integration
Authentication
Parent–Student Relationship
Mastery Algorithm
Gamification Rules
Offline Strategy
Major Dependencies
```

Format:

```text
# Decision

## Context

## Decision

## Alternatives Considered

## Consequences

## Date
```

---

# 73. ENVIRONMENT

Gunakan `.env` untuk configuration.

Jangan commit:

```text
.env
.env.local
secrets
credentials
private keys
```

Sediakan:

```text
.env.example
```

jika diperlukan.

---

# 74. GIT SAFETY

Sebelum perubahan besar:

```text
git status
```

Periksa perubahan existing.

Jangan menghapus atau overwrite perubahan user.

Jika working tree memiliki perubahan yang bukan berasal dari agent:

> Jangan menganggap perubahan tersebut sebagai milik agent.

---

# 75. BEFORE CODING CHECKLIST

Sebelum coding:

```text
[ ] Read prd.md
[ ] Read relevant architecture
[ ] Inspect existing implementation
[ ] Inspect dependencies
[ ] Check existing tests
[ ] Check git status
[ ] Identify impacted files
[ ] Identify risks
[ ] Confirm data flow
```

---

# 76. BEFORE COMMIT CHECKLIST

```text
[ ] Feature implemented
[ ] Tests added/updated
[ ] Tests passed
[ ] Type check passed
[ ] Lint passed
[ ] Build passed
[ ] Responsive checked
[ ] Error states checked
[ ] Accessibility checked
[ ] Security checked
[ ] Documentation updated
```

Jangan pernah mengatakan:

> "Tests passed"

jika tests tidak benar-benar dijalankan.

---

# 77. PHASE COMPLETION REPORT

Setiap phase harus menghasilkan laporan:

```text
# Phase X Completion Report

## Objective

## Implemented

## Files Created

## Files Modified

## Files Deleted

## Architecture Changes

## Tests Added

## Tests Run

## Test Results

## Build Result

## Known Issues

## Technical Debt

## Risks

## Documentation Updated

## Next Phase
```

---

# 78. STOP CONDITIONS

Agent harus STOP dan meminta keputusan apabila:

1. Requirement ambigu.
2. Terdapat konflik PRD.
3. Perubahan berpotensi merusak data.
4. Diperlukan perubahan architecture besar.
5. Diperlukan credential/secret yang tidak tersedia.
6. Terdapat security concern.
7. Existing implementation bertentangan dengan requirement.
8. Tidak yakin apakah sebuah feature memang diperlukan.
9. Perubahan akan menghapus pekerjaan user.
10. Migration data berisiko.

Jangan menebak untuk keputusan yang memiliki dampak besar.

---

# 79. IMPLEMENTATION PRIORITY

Jika terjadi trade-off:

```text
1. Correctness
2. Security
3. Data integrity
4. Learning outcome
5. UX
6. Accessibility
7. Performance
8. Visual polish
```

Jangan mengorbankan correctness demi visual polish.

---

# 80. CORE USER FLOWS

## Student

```text
Login
 ↓
Dashboard
 ↓
Continue Learning
 ↓
Lesson
 ↓
Practice
 ↓
Answer
 ↓
Feedback
 ↓
Mistake / Correct
 ↓
Review
 ↓
Mastery
 ↓
XP
 ↓
Achievement
 ↓
Recommendation
```

## Parent

```text
Login
 ↓
Parent Dashboard
 ↓
Overall Progress
 ↓
Subject Mastery
 ↓
Weak Topic
 ↓
Mistake Insight
 ↓
Learning Trend
 ↓
Recommendation
 ↓
Support Albert
```

---

# 81. CORE SUCCESS CRITERIA

Student harus dapat:

```text
Learn
Practice
Understand Mistakes
Review
Challenge
Master
Progress
```

Parent harus dapat:

```text
Monitor
Understand
Support
```

Tanpa mengambil alih proses belajar siswa.

---

# 82. FINAL AGENT PRINCIPLE

Selalu ingat:

> **Build the smallest correct solution that fully satisfies the PRD.**

Jangan mengejar banyak feature.

Fokus pada:

```text
Learning Quality
+
Student Engagement
+
Meaningful Progress
+
Parent Insight
+
Maintainable Architecture
```

Dan prinsip paling penting:

> **Albert harus merasa bahwa ia sedang bertumbuh dan menjelajah, bukan sedang menjalani sistem sekolah yang dipindahkan ke web.**

Sedangkan orang tua harus merasa:

> **"Saya memahami perkembangan belajar Albert dan tahu bagaimana mendukungnya."**

Bukan:

> **"Saya sedang mengawasi setiap gerak-geriknya."**

Dengan penyelarasan ini, **`prd.md` dan `agent-prompt.md` sekarang konsisten**: Parent Area masuk sebagai **Phase 10**, tetapi fondasinya sudah diperhitungkan sejak **Phase 1–2** melalui routing, user model, relationship, data layer, analytics, dan authorization.

Satu hal penting: **jangan langsung meminta coding agent menjalankan Phase 1.** Sesuai prompt di atas, mulai dari **Phase 0 — Audit & Foundation**, lalu biarkan agent berhenti dan melaporkan kondisi repository terlebih dahulu.

