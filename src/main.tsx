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
import { QuestionPage } from './pages/QuestionPage'
import { PracticePage } from './pages/PracticePage'
import { MistakesPage } from './pages/MistakesPage'
import { ProfilePage } from './pages/ProfilePage'
import { MasteryPage } from './pages/MasteryPage'
import { ChallengesPage } from './pages/ChallengesPage'
import { ExamPage } from './pages/ExamPage'
import { ParentHome } from './pages/ParentHome'
import { ParentSummaryPage } from './pages/parent/ParentSummaryPage'
import { ParentProgressPage } from './pages/parent/ParentProgressPage'
import { ParentMistakesPage } from './pages/parent/ParentMistakesPage'

import { OfflineBanner } from './components/OfflineBanner'
import { registerServiceWorker } from './lib/pwa'

// Daftarkan PWA Service Worker untuk caching offline
registerServiceWorker()

// Reset otomatis data dummy dev untuk rilis awal Albert (Level 1, 0 XP, 0 Streak)
if (typeof window !== 'undefined' && !localStorage.getItem('albiquest.initialized.v1')) {
  try {
    localStorage.removeItem('pla.profile')
    localStorage.removeItem('pla.profile_saved_albert')
    localStorage.removeItem('pla.gamification.v1')
    localStorage.removeItem('pla.mistakes.v1')
    localStorage.removeItem('pla.exam_history.v1')
    localStorage.removeItem('pla.progress')
    localStorage.setItem('albiquest.initialized.v1', 'true')
  } catch {}
}

function Gate({ role, children }: { role: 'student' | 'parent'; children: React.ReactNode }) {
  const { active } = useProfile()
  if (!active) return <Navigate to={`/login?role=${role}`} replace />
  if (active.role !== role) return <Navigate to={`/login?role=${role}`} replace />
  return <>{children}</>
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ProfileProvider>
      <OfflineBanner />
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
            <Route path="subjects/:subjectId/lessons/:lessonId/questions/:questionId" element={<QuestionPage />} />
            <Route path="practice" element={<PracticePage />} />
            <Route path="mistakes" element={<MistakesPage />} />
            <Route path="mastery" element={<MasteryPage />} />
            <Route path="challenges" element={<ChallengesPage />} />
            <Route path="exam" element={<ExamPage />} />
            <Route path="profile" element={<ProfilePage />} />
          </Route>

          {/* Area orang tua */}
          <Route path="/parent" element={<Gate role="parent"><ParentHome /></Gate>}>
            <Route index element={<ParentSummaryPage />} />
            <Route path="progress" element={<ParentProgressPage />} />
            <Route path="mistakes" element={<ParentMistakesPage />} />
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