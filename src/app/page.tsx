'use client'

import { useState, useEffect } from 'react'
import { useAppStore } from '@/lib/store'
import { Navbar } from '@/components/lms/Navbar'
import { Footer } from '@/components/lms/Footer'
import { Hero } from '@/components/lms/Hero'
import { Features } from '@/components/lms/Features'
import { CourseCatalog } from '@/components/lms/CourseCatalog'
import { CourseDetail } from '@/components/lms/CourseDetail'
import { Dashboard } from '@/components/lms/Dashboard'
import { LessonPlayer } from '@/components/lms/LessonPlayer'
import { AboutPage } from '@/components/lms/AboutPage'
import { ApplyPage } from '@/components/lms/ApplyPage'
import { DoctrinePage } from '@/components/lms/DoctrinePage'
import { CTA } from '@/components/lms/CTA'
import { FAQ } from '@/components/lms/FAQ'
import { Newsletter } from '@/components/lms/Newsletter'
import { AuthPage } from '@/components/lms/AuthPage'
import { QuizPlayer } from '@/components/lms/QuizPlayer'
import { AssignmentPage } from '@/components/lms/AssignmentPage'
import { CertificateView } from '@/components/lms/CertificateView'
import { CertificatesList } from '@/components/lms/CertificatesList'
import { LiveClassesPage } from '@/components/lms/LiveClassesPage'
import { PrivateChat } from '@/components/lms/PrivateChat'
import { ProfilePage } from '@/components/lms/ProfilePage'
import { CourseForum } from '@/components/lms/CourseForum'
import { LibraryPage } from '@/components/lms/LibraryPage'
import { AdminDashboard } from '@/components/lms/AdminDashboard'
import { InstructorDashboard } from '@/components/lms/InstructorDashboard'
import { LiveChatWidget } from '@/components/lms/LiveChatWidget'
import { CertificateOrderPage } from '@/components/lms/CertificateOrderPage'
import { DonationPage } from '@/components/lms/DonationPage'

// Home page composition
function HomePage() {
  return (
    <>
      <Hero />
      <Features />
      <CTA />
      <FAQ />
      <Newsletter />
    </>
  )
}

// Chatbot embed code renderer — fetches chatbot_embed_code setting and renders it
function ChatbotEmbed() {
  const [embedCode, setEmbedCode] = useState<string | null>(null)

  useEffect(() => {
    const fetchEmbed = async () => {
      try {
        const res = await fetch('/api/settings?key=chatbot_embed_code')
        if (res.ok) {
          const data = await res.json()
          if (data && data.value && data.value.trim()) {
            setEmbedCode(data.value)
          }
        }
      } catch {
        // Silent fail — embed code is optional
      }
    }
    fetchEmbed()
  }, [])

  if (!embedCode) return null

  return (
    <div
      dangerouslySetInnerHTML={{ __html: embedCode }}
    />
  )
}

export default function Home() {
  const { currentPage } = useAppStore()

  // Track initial page view on first load
  useEffect(() => {
    fetch('/api/analytics/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        page: 'home',
        visitorId: (() => {
          const key = 'dc_visitor_id'
          let id = localStorage.getItem(key)
          if (!id) {
            id = 'v_' + Math.random().toString(36).substring(2, 15) + Date.now().toString(36)
            localStorage.setItem(key, id)
          }
          return id
        })(),
        referrer: document.referrer || null,
        userAgent: navigator.userAgent.substring(0, 255) || null,
      }),
    }).catch(() => {})
  }, [])
  const adminPages = ['admin-dashboard', 'admin-users', 'admin-courses', 'admin-quizzes', 'admin-grading', 'admin-communication', 'admin-analytics', 'admin-customization', 'admin-library', 'admin-settings', 'admin-appointments', 'admin-newsletters', 'admin-live-chat', 'admin-certificate-orders', 'admin-donations']
  const instructorPages = ['instructor-dashboard', 'instructor-courses', 'instructor-students', 'instructor-grading', 'instructor-library', 'instructor-forum', 'instructor-quizzes', 'instructor-live-classes', 'instructor-communication', 'instructor-appointments']
  const isAdminPage = adminPages.includes(currentPage)
  const isInstructorPage = instructorPages.includes(currentPage)
  const hideFooterPages = ['lesson', 'quiz', 'assignment', 'login', 'register', 'chat', ...adminPages, ...instructorPages]
  const hideNavbar = isAdminPage || isInstructorPage
  const hideFooter = hideFooterPages.includes(currentPage)

  // Show LiveChatWidget only on public pages (not admin/instructor dashboard)
  const showLiveChat = !isAdminPage && !isInstructorPage

  const renderPage = () => {
    switch (currentPage) {
      case 'home':
        return <HomePage />
      case 'courses':
        return <CourseCatalog />
      case 'course-detail':
        return <CourseDetail />
      case 'dashboard':
        return <Dashboard />
      case 'lesson':
        return <LessonPlayer />
      case 'about':
        return <AboutPage />
      case 'apply':
        return <ApplyPage />
      case 'doctrine':
        return <DoctrinePage />
      case 'login':
        return <AuthPage />
      case 'register':
        return <AuthPage />
      case 'quiz':
        return <QuizPlayer />
      case 'assignment':
        return <AssignmentPage />
      case 'certificate':
        return <CertificateView />
      case 'certificates':
        return <CertificatesList />
      case 'order-certificate':
        return <CertificateOrderPage />
      case 'donate':
        return <DonationPage />
      case 'live-classes':
        return <LiveClassesPage />
      case 'forum':
        return <CourseForum />
      case 'library':
        return <LibraryPage />
      case 'chat':
        return <PrivateChat />
      case 'profile':
        return <ProfilePage />
      case 'admin-dashboard':
      case 'admin-users':
      case 'admin-courses':
      case 'admin-quizzes':
      case 'admin-grading':
      case 'admin-communication':
      case 'admin-analytics':
      case 'admin-customization':
      case 'admin-settings':
      case 'admin-library':
      case 'admin-appointments':
      case 'admin-newsletters':
      case 'admin-live-chat':
      case 'admin-certificate-orders':
      case 'admin-donations':
        return <AdminDashboard />
      case 'instructor-dashboard':
      case 'instructor-courses':
      case 'instructor-students':
      case 'instructor-grading':
      case 'instructor-library':
      case 'instructor-forum':
      case 'instructor-quizzes':
      case 'instructor-live-classes':
      case 'instructor-communication':
      case 'instructor-appointments':
        return <InstructorDashboard />
      default:
        return <HomePage />
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      {!hideNavbar && <Navbar />}
      <main className="flex-1">{renderPage()}</main>
      {!hideFooter && <Footer />}
      {showLiveChat && <LiveChatWidget />}
      {showLiveChat && <ChatbotEmbed />}
    </div>
  )
}
