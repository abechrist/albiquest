// Script migrasi skema tabel dan seeding data ke Neon PostgreSQL
// Jalankan dengan: node --experimental-strip-types scripts/migrate-neon.ts

import { neon } from '@neondatabase/serverless'
import { seedRows } from '../src/lib/seed.ts'
import { parseSheetRows } from '../src/lib/validate.ts'

const connectionString =
  process.env.DATABASE_URL ||
  process.env.VITE_NEON_DATABASE_URL ||
  'postgresql://neondb_owner:npg_yEP68RVZuApW@ep-damp-bread-b3umldr9-pooler.c-4.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require'

console.log('--- Memulai Migrasi Database AlbiQuest ke Neon PostgreSQL ---')
console.log('Target Serverless Host:', connectionString.split('@')[1]?.split('/')[0])

const sql = neon(connectionString)

async function migrate() {
  try {
    console.log('1. Membuat skema tabel relasional...')

    // 1. subjects
    await sql`
      CREATE TABLE IF NOT EXISTS subjects (
        id VARCHAR(64) PRIMARY KEY,
        name VARCHAR(128) NOT NULL,
        emoji VARCHAR(16) NOT NULL,
        color_from VARCHAR(32) NOT NULL,
        color_to VARCHAR(32) NOT NULL,
        description TEXT NOT NULL,
        priority INT NOT NULL,
        status VARCHAR(32) NOT NULL,
        sort_order INT NOT NULL
      );
    `

    // 2. curriculum
    await sql`
      CREATE TABLE IF NOT EXISTS curriculum (
        id VARCHAR(64) PRIMARY KEY,
        subject_id VARCHAR(64) NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
        title VARCHAR(255) NOT NULL,
        description TEXT NOT NULL,
        sort_order INT NOT NULL,
        grade INT DEFAULT 9
      );
    `
    await sql`ALTER TABLE curriculum ADD COLUMN IF NOT EXISTS grade INT DEFAULT 9;`

    // 3. topics
    await sql`
      CREATE TABLE IF NOT EXISTS topics (
        id VARCHAR(64) PRIMARY KEY,
        curriculum_id VARCHAR(64) NOT NULL,
        subject_id VARCHAR(64) NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
        title VARCHAR(255) NOT NULL,
        description TEXT NOT NULL,
        sort_order INT NOT NULL,
        grade INT DEFAULT 9
      );
    `
    await sql`ALTER TABLE topics ADD COLUMN IF NOT EXISTS grade INT DEFAULT 9;`

    // 4. competencies
    await sql`
      CREATE TABLE IF NOT EXISTS competencies (
        id VARCHAR(64) PRIMARY KEY,
        topic_id VARCHAR(64) NOT NULL,
        code VARCHAR(64) NOT NULL,
        description TEXT NOT NULL,
        sort_order INT NOT NULL,
        grade INT DEFAULT 9
      );
    `
    await sql`ALTER TABLE competencies ADD COLUMN IF NOT EXISTS grade INT DEFAULT 9;`

    // 5. lessons
    await sql`
      CREATE TABLE IF NOT EXISTS lessons (
        id VARCHAR(64) PRIMARY KEY,
        topic_id VARCHAR(64) NOT NULL REFERENCES topics(id) ON DELETE CASCADE,
        subject_id VARCHAR(64) NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
        title VARCHAR(255) NOT NULL,
        description TEXT NOT NULL,
        duration_min INT NOT NULL,
        type VARCHAR(32) NOT NULL,
        sort_order INT NOT NULL,
        grade INT DEFAULT 9
      );
    `
    await sql`ALTER TABLE lessons ADD COLUMN IF NOT EXISTS grade INT DEFAULT 9;`

    // 6. questions
    await sql`
      CREATE TABLE IF NOT EXISTS questions (
        id VARCHAR(64) PRIMARY KEY,
        lesson_id VARCHAR(64) NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
        subject_id VARCHAR(64) NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
        type VARCHAR(32) NOT NULL,
        prompt TEXT NOT NULL,
        options JSONB NOT NULL,
        answer JSONB NOT NULL,
        explanation TEXT NOT NULL,
        hints JSONB,
        xp INT,
        source VARCHAR(255) NOT NULL,
        difficulty INT NOT NULL,
        grade INT DEFAULT 9
      );
    `
    await sql`ALTER TABLE questions ADD COLUMN IF NOT EXISTS grade INT DEFAULT 9;`

    console.log('✓ Skema tabel berhasil dibuat / diverifikasi dengan kolom grade.')

    console.log('2. Mengonversi seed data...')
    const data = parseSheetRows(seedRows)

    console.log(`3. Melakukan sinkronisasi data ke Neon...`)
    
    // A. Sync Subjects
    for (const s of data.subjects) {
      await sql`
        INSERT INTO subjects (id, name, emoji, color_from, color_to, description, priority, status, sort_order)
        VALUES (${s.id}, ${s.name}, ${s.emoji}, ${s.colorFrom}, ${s.colorTo}, ${s.description}, ${s.priority}, ${s.status}, ${s.sortOrder})
        ON CONFLICT (id) DO UPDATE SET
          name = EXCLUDED.name,
          emoji = EXCLUDED.emoji,
          color_from = EXCLUDED.color_from,
          color_to = EXCLUDED.color_to,
          description = EXCLUDED.description,
          priority = EXCLUDED.priority,
          status = EXCLUDED.status,
          sort_order = EXCLUDED.sort_order;
      `
    }
    console.log(`   ✓ ${data.subjects.length} Mata Pelajaran tersinkronisasi.`)

    // B. Sync Curriculum
    for (const c of data.curriculum) {
      await sql`
        INSERT INTO curriculum (id, subject_id, title, description, sort_order, grade)
        VALUES (${c.id}, ${c.subjectId}, ${c.title}, ${c.description}, ${c.sortOrder}, ${c.grade ?? 9})
        ON CONFLICT (id) DO UPDATE SET
          subject_id = EXCLUDED.subject_id,
          title = EXCLUDED.title,
          description = EXCLUDED.description,
          sort_order = EXCLUDED.sort_order,
          grade = EXCLUDED.grade;
      `
    }
    console.log(`   ✓ ${data.curriculum.length} Kurikulum tersinkronisasi.`)

    // C. Sync Topics
    for (const t of data.topics) {
      await sql`
        INSERT INTO topics (id, curriculum_id, subject_id, title, description, sort_order, grade)
        VALUES (${t.id}, ${t.curriculumId}, ${t.subjectId}, ${t.title}, ${t.description}, ${t.sortOrder}, ${t.grade ?? 9})
        ON CONFLICT (id) DO UPDATE SET
          curriculum_id = EXCLUDED.curriculum_id,
          subject_id = EXCLUDED.subject_id,
          title = EXCLUDED.title,
          description = EXCLUDED.description,
          sort_order = EXCLUDED.sort_order,
          grade = EXCLUDED.grade;
      `
    }
    console.log(`   ✓ ${data.topics.length} Topik tersinkronisasi.`)

    // D. Sync Competencies
    for (const comp of data.competencies) {
      await sql`
        INSERT INTO competencies (id, topic_id, code, description, sort_order, grade)
        VALUES (${comp.id}, ${comp.topicId}, ${comp.code}, ${comp.description}, ${comp.sortOrder}, ${comp.grade ?? 9})
        ON CONFLICT (id) DO UPDATE SET
          topic_id = EXCLUDED.topic_id,
          code = EXCLUDED.code,
          description = EXCLUDED.description,
          sort_order = EXCLUDED.sort_order,
          grade = EXCLUDED.grade;
      `
    }
    console.log(`   ✓ ${data.competencies.length} Kompetensi tersinkronisasi.`)

    // E. Sync Lessons
    for (const l of data.lessons) {
      await sql`
        INSERT INTO lessons (id, topic_id, subject_id, title, description, duration_min, type, sort_order, grade)
        VALUES (${l.id}, ${l.topicId}, ${l.subjectId}, ${l.title}, ${l.description}, ${l.durationMin}, ${l.type}, ${l.sortOrder}, ${l.grade ?? 9})
        ON CONFLICT (id) DO UPDATE SET
          topic_id = EXCLUDED.topic_id,
          subject_id = EXCLUDED.subject_id,
          title = EXCLUDED.title,
          description = EXCLUDED.description,
          duration_min = EXCLUDED.duration_min,
          type = EXCLUDED.type,
          sort_order = EXCLUDED.sort_order,
          grade = EXCLUDED.grade;
      `
    }
    console.log(`   ✓ ${data.lessons.length} Modul Pelajaran tersinkronisasi.`)

    // F. Sync Questions
    for (const q of data.questions) {
      await sql`
        INSERT INTO questions (id, lesson_id, subject_id, type, prompt, options, answer, explanation, hints, xp, source, difficulty, grade)
        VALUES (
          ${q.id},
          ${q.lessonId},
          ${q.subjectId},
          ${q.type},
          ${q.prompt},
          ${JSON.stringify(q.options)},
          ${JSON.stringify(q.answer)},
          ${q.explanation},
          ${q.hints ? JSON.stringify(q.hints) : null},
          ${q.xp ?? null},
          ${q.source},
          ${q.difficulty},
          ${q.grade ?? 9}
        )
        ON CONFLICT (id) DO UPDATE SET
          lesson_id = EXCLUDED.lesson_id,
          subject_id = EXCLUDED.subject_id,
          type = EXCLUDED.type,
          prompt = EXCLUDED.prompt,
          options = EXCLUDED.options,
          answer = EXCLUDED.answer,
          explanation = EXCLUDED.explanation,
          hints = EXCLUDED.hints,
          xp = EXCLUDED.xp,
          source = EXCLUDED.source,
          difficulty = EXCLUDED.difficulty,
          grade = EXCLUDED.grade;
      `
    }
    console.log(`   ✓ ${data.questions.length} Bank Soal tersinkronisasi.`)

    console.log('\n🎉 MIGRASI KE NEON POSTGRESQL BERHASIL 100%!')
  } catch (err) {
    console.error('❌ Gagal melakukan migrasi ke Neon:', err)
    process.exit(1)
  }
}

migrate()
