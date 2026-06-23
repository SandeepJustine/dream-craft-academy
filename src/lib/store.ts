import { create } from 'zustand'

export type Page = 
  | 'home' 
  | 'courses' 
  | 'course-detail' 
  | 'dashboard' 
  | 'lesson' 
  | 'about' 
  | 'apply' 
  | 'doctrine'
  | 'login'
  | 'register'
  | 'quiz'
  | 'assignment'
  | 'certificate'
  | 'order-certificate'
  | 'live-classes'
  | 'certificates'
  | 'forum'
  | 'chat'
  | 'library'
  | 'profile'
  | 'admin-dashboard'
  | 'admin-users'
  | 'admin-courses'
  | 'admin-quizzes'
  | 'admin-grading'
  | 'admin-communication'
  | 'admin-analytics'
  | 'admin-customization'
  | 'admin-settings'
  | 'admin-library'
  | 'instructor-dashboard'
  | 'instructor-courses'
  | 'instructor-students'
  | 'instructor-grading'
  | 'instructor-library'
  | 'instructor-forum'
  | 'instructor-quizzes'
  | 'instructor-live-classes'
  | 'instructor-communication'
  | 'admin-appointments'
  | 'admin-newsletters'
  | 'admin-live-chat'
  | 'admin-certificate-orders'
  | 'instructor-appointments'
  | 'donate'
  | 'admin-donations'

interface AppState {
  currentPage: Page
  selectedCourseId: string | null
  selectedLessonId: string | null
  selectedQuizId: string | null
  selectedAssignmentId: string | null
  selectedCertificateId: string | null
  selectedForumCourseId: string | null
  chatInstructorId: string | null
  chatStudentId: string | null
  currentUser: { id: string; name: string; email: string; avatar?: string; role?: string } | null
  navigate: (page: Page, options?: { courseId?: string | null; lessonId?: string | null; quizId?: string | null; assignmentId?: string | null; certificateId?: string | null; forumCourseId?: string | null; chatInstructorId?: string | null; chatStudentId?: string | null }) => void
  setUser: (user: { id: string; name: string; email: string; avatar?: string; role?: string } | null) => void
}

// Get or create a persistent visitor ID stored in localStorage
function getVisitorId(): string {
  if (typeof window === 'undefined') return 'server'
  const key = 'dc_visitor_id'
  let id = localStorage.getItem(key)
  if (!id) {
    id = 'v_' + Math.random().toString(36).substring(2, 15) + Date.now().toString(36)
    localStorage.setItem(key, id)
  }
  return id
}

// Track a page view (fire-and-forget)
function trackPageView(page: string, userId?: string | null) {
  if (typeof window === 'undefined') return
  try {
    const visitorId = getVisitorId()
    fetch('/api/analytics/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        page,
        visitorId,
        referrer: document.referrer || null,
        userAgent: navigator.userAgent.substring(0, 255) || null,
        userId: userId || null,
      }),
    }).catch(() => { /* silent fail */ })
  } catch { /* silent fail */ }
}

export const useAppStore = create<AppState>((set, get) => ({
  currentPage: 'home',
  selectedCourseId: null,
  selectedLessonId: null,
  selectedQuizId: null,
  selectedAssignmentId: null,
  selectedCertificateId: null,
  selectedForumCourseId: null,
  chatInstructorId: null,
  chatStudentId: null,
  currentUser: null,
  navigate: (page, options = {}) => {
    set({ 
      currentPage: page, 
      selectedCourseId: options.courseId ?? null, 
      selectedLessonId: options.lessonId ?? null,
      selectedQuizId: options.quizId ?? null,
      selectedAssignmentId: options.assignmentId ?? null,
      selectedCertificateId: options.certificateId ?? null,
      selectedForumCourseId: options.forumCourseId ?? null,
      chatInstructorId: options.chatInstructorId ?? null,
      chatStudentId: options.chatStudentId ?? null,
    })
    // Track page view
    const user = get().currentUser
    trackPageView(page, user?.id)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  },
  setUser: (user) => set({ currentUser: user }),
}))
