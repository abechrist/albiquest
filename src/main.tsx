import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom'
import './index.css'
import { ProfileProvider, useProfile } from './lib/auth'
import { ProgressProvider } from './lib/progress'
import { Login } from './pages/Login'
import { StudentHome } from './pages/StudentHome'
import { JourneyHome } from './pages/JourneyHome'
import { SubjectsPage } from './pages/SubjectsPage'
import { SubjectDetailPage } from './pages/SubjectDetailPage'
import { LessonPage } from './pages/LessonPage'
import { Placeholder } from './pages/Placeholder'
import { ParentHome } from './pages/ParentHome'

function Gate({ role, children }: { role: 'student' | 'parent'; children: React.ReactNode }) {
  const { active } = useProfile()
  if (!active) return <Navigate to={`/login?role=${role}`} replace />
  if (active.role !== role) return <Navigate to={`/login?role=${role}`} replace />
  return <>{children}</>
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ProfileProvider>
      <HashRouter>
        <Routes>
          {/* Pintu masuk: pilih area */}
          <Route path="/" element={<RootRedirect />} />
          <Route path="/login" element={<Login />} />

          {/* Area siswa */}
          <Route path="/student" element={<Gate role="student"><ProgressProvider><StudentHome /></ProgressProvider></Gate>}>
            <Route index element={<JourneyHome />} />
            <Route path="subjects" element={<SubjectsPage />} />
            <Route path="subjects/:subjectId" element={<SubjectDetailPage />} />
            <Route path="subjects/:subjectId/lessons/:lessonId" element={<LessonPage />} />
            <Route path="practice" element={<Placeholder title="Arena Latihan" subtitle="Soal latihan menyusul di Phase 5." />} />
            <Route path="mistakes" element={<Placeholder title="My Mistakes" subtitle="Kumpulan kesalahan untuk direview (Phase 5)." />} />
            <Route path="profile" element={<Placeholder title="Profil Albert" subtitle="Pengaturan PIN & profil." />} />
          </Route>

          {/* Area orang tua */}
          <Route path="/parent" element={<Gate role="parent"><ParentHome /></Gate>}>
            <Route index element={<Placeholder title="Ringkasan" subtitle="Statistik belajar Albert — Phase 10." />} />
            <Route path="progress" element={<Placeholder title="Perkembangan" subtitle="Mastery per mapel — Phase 10." />} />
            <Route path="mistakes" element={<Placeholder title="Kesalahan Albert" subtitle="Review kesalahan — Phase 10." />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </HashRouter>
    </ProfileProvider>
  </StrictMode>,
)

function RootRedirect() {
  const { active } = useProfile()
  return <Navigate to={active?.role === 'parent' ? '/parent' : '/student'} replace />
}