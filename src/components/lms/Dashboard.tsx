'use client'

import { useState, useEffect, useCallback } from 'react'
import { useAppStore } from '@/lib/store'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import {
  BookOpen,
  Clock,
  Trophy,
  TrendingUp,
  Play,
  ArrowRight,
  GraduationCap,
  LayoutDashboard,
  Award,
  CheckCircle,
  Video,
  FileQuestion,
  FileText,
  Calendar,
  Star,
  Plus,
  X,
  MapPin,
  Loader2,
  CalendarX,
  ShoppingBag,
  Mail,
  Lock,
  AlertCircle,
} from 'lucide-react'

interface QuizSummary {
  totalQuizzes: number
  passedQuizzes: number
  averageScore: number
}

interface AssignmentSummary {
  totalAssignments: number
  submittedAssignments: number
  averageScore: number
}

interface CertificateData {
  id: string
  certificateNumber: string
  finalGrade: number
  issuedAt: string
}

interface EnrollmentData {
  id: string
  courseId: string
  progress: number
  overallGrade: number
  status: string
  enrolledAt: string
  completedAt: string | null
  course: {
    id: string
    title: string
    description: string
    category: string
    level: string
    duration: string
    instructor: string
    modulesCount: number
    lessonsCount: number
  }
  completedLessons: number
  totalLessons: number
  nextLesson: string | null
  quizSummary: QuizSummary
  assignmentSummary: AssignmentSummary
  certificate: CertificateData | null
}

interface LiveClassData {
  id: string
  courseId: string
  title: string
  description: string | null
  instructor: string
  scheduledAt: string
  duration: number
  meetingUrl: string | null
  status: string
}

interface AppointmentData {
  id: string
  title: string
  description: string | null
  requesterId: string
  recipientId: string
  courseId: string | null
  date: string
  duration: number
  status: string
  location: string | null
  meetingUrl: string | null
  notes: string | null
  createdAt: string
  requester: { id: string; name: string; email: string; avatar: string | null; role: string }
  recipient: { id: string; name: string; email: string; avatar: string | null; role: string }
}

interface InstructorInfo {
  id: string
  name: string
  email: string
  avatar: string | null
}

export function Dashboard() {
  const { currentUser, navigate } = useAppStore()
  const [enrollments, setEnrollments] = useState<EnrollmentData[]>([])
  const [liveClasses, setLiveClasses] = useState<LiveClassData[]>([])
  const [appointments, setAppointments] = useState<AppointmentData[]>([])
  const [instructors, setInstructors] = useState<InstructorInfo[]>([])
  const [loading, setLoading] = useState(true)
  const [appointmentsLoading, setAppointmentsLoading] = useState(false)

  // Appointment dialog state
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false)
  const [selectedAppointment, setSelectedAppointment] = useState<AppointmentData | null>(null)
  const [submitting, setSubmitting] = useState(false)

  // Appointment form state
  const [formTitle, setFormTitle] = useState('')
  const [formInstructorId, setFormInstructorId] = useState('')
  const [formCourseId, setFormCourseId] = useState('')
  const [formDate, setFormDate] = useState('')
  const [formTime, setFormTime] = useState('')
  const [formDuration, setFormDuration] = useState('30')
  const [formNotes, setFormNotes] = useState('')
  const [formLocation, setFormLocation] = useState('')

  function calculateLetterGrade(score: number): string {
    if (score >= 97) return 'A+'
    if (score >= 93) return 'A'
    if (score >= 90) return 'A-'
    if (score >= 87) return 'B+'
    if (score >= 83) return 'B'
    if (score >= 80) return 'B-'
    if (score >= 77) return 'C+'
    if (score >= 73) return 'C'
    if (score >= 70) return 'C-'
    if (score >= 67) return 'D+'
    if (score >= 63) return 'D'
    if (score >= 60) return 'D-'
    return 'F'
  }

  const fetchAppointments = useCallback(async () => {
    if (!currentUser) return
    try {
      setAppointmentsLoading(true)
      const res = await fetch(`/api/appointments?userId=${currentUser.id}&role=student`)
      const data = await res.json()
      setAppointments(data.appointments || [])
    } catch (error) {
      console.error('Error fetching appointments:', error)
    } finally {
      setAppointmentsLoading(false)
    }
  }, [currentUser])

  const fetchInstructors = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/users?role=instructor')
      const data = await res.json()
      const instructorUsers = (data.users || []).map((u: { id: string; name: string; email: string; avatar: string | null }) => ({
        id: u.id,
        name: u.name || 'Unknown',
        email: u.email,
        avatar: u.avatar,
      }))
      setInstructors(instructorUsers)
    } catch (error) {
      console.error('Error fetching instructors:', error)
    }
  }, [])

  useEffect(() => {
    if (!currentUser) {
      setLoading(false)
      return
    }

    const loadData = async () => {
      try {
        const [enrollRes, liveRes] = await Promise.all([
          fetch(`/api/enroll?userId=${currentUser.id}`),
          fetch('/api/live-classes?status=upcoming'),
        ])
        const enrollData = await enrollRes.json()
        const liveData = await liveRes.json()
        setEnrollments(enrollData)
        setLiveClasses(liveData.slice(0, 3))
      } catch (error) {
        console.error('Error loading dashboard data:', error)
      } finally {
        setLoading(false)
      }
    }

    loadData()
    fetchAppointments()
    fetchInstructors()
  }, [currentUser, fetchAppointments, fetchInstructors])

  const handleDemoLogin = async () => {
    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'login', email: 'student@dreamcraft.org', password: 'demo123' }),
      })
      const data = await res.json()
      if (data.user) {
        useAppStore.getState().setUser(data.user)
        const enrollRes = await fetch(`/api/enroll?userId=${data.user.id}`)
        const enrollData = await enrollRes.json()
        setEnrollments(enrollData)
        const liveRes = await fetch('/api/live-classes?status=upcoming')
        const liveData = await liveRes.json()
        setLiveClasses(liveData.slice(0, 3))
      }
    } catch (error) {
      console.error('Error logging in:', error)
    }
  }

  const handleCreateAppointment = async () => {
    if (!currentUser || !formTitle.trim() || !formInstructorId || !formDate || !formTime) return
    try {
      setSubmitting(true)
      const dateTime = new Date(`${formDate}T${formTime}`).toISOString()
      const res = await fetch('/api/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'create',
          title: formTitle.trim(),
          requesterId: currentUser.id,
          recipientId: formInstructorId,
          courseId: formCourseId || null,
          date: dateTime,
          duration: parseInt(formDuration) || 30,
          notes: formNotes.trim() || null,
          location: formLocation.trim() || null,
        }),
      })
      if (res.ok) {
        setCreateDialogOpen(false)
        resetForm()
        fetchAppointments()
      } else {
        const data = await res.json()
        console.error('Failed to create appointment:', data.error)
      }
    } catch (error) {
      console.error('Error creating appointment:', error)
    } finally {
      setSubmitting(false)
    }
  }

  const handleCancelAppointment = async () => {
    if (!selectedAppointment) return
    try {
      setSubmitting(true)
      const res = await fetch('/api/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'update-status',
          id: selectedAppointment.id,
          status: 'cancel',
        }),
      })
      if (res.ok) {
        setCancelDialogOpen(false)
        setSelectedAppointment(null)
        fetchAppointments()
      }
    } catch (error) {
      console.error('Error cancelling appointment:', error)
    } finally {
      setSubmitting(false)
    }
  }

  const resetForm = () => {
    setFormTitle('')
    setFormInstructorId('')
    setFormCourseId('')
    setFormDate('')
    setFormTime('')
    setFormDuration('30')
    setFormNotes('')
    setFormLocation('')
  }

  // Get unique instructors from enrolled courses, enriched with user IDs
  const enrolledInstructorNames = [...new Set(enrollments.map((e) => e.course.instructor))]
  const availableInstructors = instructors.filter((i) =>
    enrolledInstructorNames.includes(i.name)
  )

  // Also include any instructors not from enrolled courses (all instructors as fallback)
  const allInstructorsForSelect = availableInstructors.length > 0
    ? availableInstructors
    : instructors

  if (!currentUser) {
    return (
      <div className="min-h-[calc(100vh-200px)]">
        <div className="bg-gradient-to-r from-amber-50 to-emerald-50 py-10 sm:py-14">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-3">
              My Learning
            </h1>
          </div>
        </div>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <LayoutDashboard className="h-16 w-16 text-muted-foreground/30 mx-auto mb-6" />
          <h2 className="text-2xl font-bold text-foreground mb-3">Welcome to Your Dashboard</h2>
          <p className="text-muted-foreground mb-8 max-w-md mx-auto">
            Sign in to track your progress, access enrolled courses, and continue your learning journey.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button
              className="bg-primary hover:bg-primary/90"
              onClick={handleDemoLogin}
            >
              <Play className="h-4 w-4 mr-2" />
              Try Demo Account
            </Button>
            <Button variant="outline" onClick={() => navigate('register')}>
              Sign Up Free
            </Button>
          </div>
        </div>
      </div>
    )
  }

  const completedCourses = enrollments.filter((e) => e.status === 'completed')
  const activeCourses = enrollments.filter((e) => e.status === 'active')
  const totalLessonsCompleted = enrollments.reduce((sum, e) => sum + e.completedLessons, 0)
  const totalCertificates = enrollments.filter((e) => e.certificate).length
  const avgGrade = completedCourses.length > 0
    ? Math.round(completedCourses.reduce((sum, e) => sum + e.overallGrade, 0) / completedCourses.length)
    : 0

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  }

  const formatAppointmentDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const formatLiveClassDate = (dateStr: string) => {
    const date = new Date(dateStr)
    const now = new Date()
    const diff = date.getTime() - now.getTime()
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    if (days === 0) return 'Today'
    if (days === 1) return 'Tomorrow'
    if (days < 7) return `In ${days} days`
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge className="bg-amber-100 text-amber-800 text-xs">Pending</Badge>
      case 'confirmed':
        return <Badge className="bg-emerald-100 text-emerald-800 text-xs">Confirmed</Badge>
      case 'cancelled':
        return <Badge className="bg-red-100 text-red-800 text-xs">Cancelled</Badge>
      case 'completed':
        return <Badge className="bg-stone-200 text-stone-700 text-xs">Completed</Badge>
      default:
        return <Badge variant="outline" className="text-xs">{status}</Badge>
    }
  }

  const pendingAppointments = appointments.filter((a) => a.status === 'pending')
  const confirmedAppointments = appointments.filter((a) => a.status === 'confirmed')
  const upcomingCount = pendingAppointments.length + confirmedAppointments.length

  // Get courses for the selected instructor
  const coursesForSelectedInstructor = formInstructorId
    ? enrollments.filter((e) => {
        const instr = instructors.find((i) => i.id === formInstructorId)
        return instr && e.course.instructor === instr.name
      })
    : []

  return (
    <div className="min-h-[calc(100vh-200px)]">
      {/* Header */}
      <div className="bg-gradient-to-r from-amber-50 via-amber-50/80 to-emerald-50 py-10 sm:py-14">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-2">
            Welcome back, {currentUser.name?.split(' ')[0]}! 👋
          </h1>
          <p className="text-lg text-muted-foreground">
            Continue your journey of faith and learning.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card className="border-border/50">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100 text-amber-700">
                  <BookOpen className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{activeCourses.length}</p>
                  <p className="text-xs text-muted-foreground">Active Courses</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-border/50">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
                  <Trophy className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{completedCourses.length}</p>
                  <p className="text-xs text-muted-foreground">Completed</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-border/50">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100 text-amber-700">
                  <TrendingUp className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{totalLessonsCompleted}</p>
                  <p className="text-xs text-muted-foreground">Lessons Done</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-border/50">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
                  <Award className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{totalCertificates}</p>
                  <p className="text-xs text-muted-foreground">Certificates</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="learning" className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="learning">
              <BookOpen className="h-4 w-4 mr-1.5" />
              My Learning
            </TabsTrigger>
            <TabsTrigger value="completed">
              <Trophy className="h-4 w-4 mr-1.5" />
              Completed
            </TabsTrigger>
            <TabsTrigger value="certificates">
              <Award className="h-4 w-4 mr-1.5" />
              Certificates
            </TabsTrigger>
            <TabsTrigger value="appointments" className="relative">
              <Calendar className="h-4 w-4 mr-1.5" />
              Appointments
              {upcomingCount > 0 && (
                <span className="ml-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-primary-foreground text-[10px] font-bold">
                  {upcomingCount}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="order-certificate">
              <ShoppingBag className="h-4 w-4 mr-1.5" />
              Order Certificate
            </TabsTrigger>
          </TabsList>

          {/* Learning Tab */}
          <TabsContent value="learning" className="space-y-6">
            {activeCourses.length > 0 && (
              <div>
                <h2 className="text-xl font-bold text-foreground mb-4">Continue Learning</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {activeCourses.map((enrollment) => (
                    <Card key={enrollment.id} className="card-hover border-border/50 overflow-hidden">
                      <div className="h-28 bg-gradient-to-br from-amber-50 to-emerald-50 flex items-center justify-center relative">
                        <BookOpen className="h-10 w-10 text-primary/30" />
                        <Badge className="absolute top-3 right-3 bg-white/90 text-primary text-xs">
                          {enrollment.course.level}
                        </Badge>
                      </div>
                      <CardContent className="p-5">
                        <Badge className="bg-amber-100 text-amber-800 text-xs mb-2">
                          {enrollment.course.category}
                        </Badge>
                        <h3 className="font-semibold text-foreground mb-1 line-clamp-2">
                          {enrollment.course.title}
                        </h3>
                        <p className="text-xs text-muted-foreground mb-3">
                          {enrollment.course.instructor}
                        </p>

                        {/* Progress Bar */}
                        <div className="mb-3">
                          <div className="flex justify-between text-xs mb-1">
                            <span className="text-muted-foreground">Progress</span>
                            <span className="font-medium text-primary">{enrollment.progress}%</span>
                          </div>
                          <Progress value={enrollment.progress} className="h-1.5" />
                        </div>

                        {/* Stats Row */}
                        <div className="flex items-center gap-3 text-xs text-muted-foreground mb-4">
                          <span className="flex items-center gap-1">
                            <CheckCircle className="h-3 w-3" />
                            {enrollment.completedLessons}/{enrollment.totalLessons}
                          </span>
                          {enrollment.quizSummary.totalQuizzes > 0 && (
                            <span className="flex items-center gap-1">
                              <FileQuestion className="h-3 w-3" />
                              {enrollment.quizSummary.passedQuizzes}/{enrollment.quizSummary.totalQuizzes}
                            </span>
                          )}
                          {enrollment.assignmentSummary.totalAssignments > 0 && (
                            <span className="flex items-center gap-1">
                              <FileText className="h-3 w-3" />
                              {enrollment.assignmentSummary.submittedAssignments}/{enrollment.assignmentSummary.totalAssignments}
                            </span>
                          )}
                        </div>

                        {/* Score Badges */}
                        {(enrollment.quizSummary.averageScore > 0 || enrollment.assignmentSummary.averageScore > 0) && (
                          <div className="flex gap-2 mb-4">
                            {enrollment.quizSummary.averageScore > 0 && (
                              <Badge variant="outline" className="text-xs">
                                <Star className="h-3 w-3 mr-1 text-amber-500" />
                                Quiz: {Math.round(enrollment.quizSummary.averageScore)}%
                              </Badge>
                            )}
                            {enrollment.assignmentSummary.averageScore > 0 && (
                              <Badge variant="outline" className="text-xs">
                                <Star className="h-3 w-3 mr-1 text-emerald-500" />
                                Assign: {Math.round(enrollment.assignmentSummary.averageScore)}%
                              </Badge>
                            )}
                          </div>
                        )}

                        <Button
                          className="w-full bg-primary hover:bg-primary/90"
                          size="sm"
                          onClick={() => {
                            if (enrollment.nextLesson) {
                              navigate('lesson', { courseId: enrollment.courseId, lessonId: enrollment.nextLesson })
                            } else {
                              navigate('course-detail', { courseId: enrollment.courseId })
                            }
                          }}
                        >
                          <Play className="h-4 w-4 mr-2" />
                          Continue
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* Upcoming Live Classes */}
            {liveClasses.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-foreground">Upcoming Live Classes</h2>
                  <Button variant="ghost" size="sm" onClick={() => navigate('live-classes')} className="text-primary">
                    View All <ArrowRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {liveClasses.map((lc) => (
                    <Card key={lc.id} className="border-border/50">
                      <CardContent className="p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge className="bg-emerald-100 text-emerald-800 text-xs">
                            <Video className="h-3 w-3 mr-1" />
                            Live
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {formatLiveClassDate(lc.scheduledAt)}
                          </span>
                        </div>
                        <h3 className="font-semibold text-sm text-foreground mb-1 line-clamp-2">{lc.title}</h3>
                        <p className="text-xs text-muted-foreground mb-3">{lc.instructor} · {lc.duration} min</p>
                        {lc.meetingUrl && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="w-full text-xs"
                            onClick={() => window.open(lc.meetingUrl!, '_blank')}
                          >
                            Join Class
                          </Button>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {activeCourses.length === 0 && !loading && (
              <div className="text-center py-16">
                <GraduationCap className="h-16 w-16 text-muted-foreground/30 mx-auto mb-6" />
                <h2 className="text-2xl font-bold text-foreground mb-3">No Courses Yet</h2>
                <p className="text-muted-foreground mb-8 max-w-md mx-auto">
                  You haven&apos;t enrolled in any courses yet. Start exploring our catalog and find a course that interests you.
                </p>
                <Button className="bg-primary hover:bg-primary/90" onClick={() => navigate('courses')}>
                  <BookOpen className="h-4 w-4 mr-2" />
                  Browse Courses
                </Button>
              </div>
            )}
          </TabsContent>

          {/* Completed Tab */}
          <TabsContent value="completed" className="space-y-4">
            {completedCourses.length > 0 ? (
              completedCourses.map((enrollment) => (
                <Card key={enrollment.id} className="border-border/50">
                  <CardContent className="p-5">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                      <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700 shrink-0">
                        <Trophy className="h-6 w-6" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-foreground">{enrollment.course.title}</h3>
                          <Badge className="bg-emerald-100 text-emerald-800 text-xs">Completed</Badge>
                        </div>
                        <p className="text-xs text-muted-foreground mb-2">
                          {enrollment.course.category} · {enrollment.course.duration} · {enrollment.course.instructor}
                        </p>
                        <div className="flex flex-wrap gap-2">
                          <Badge variant="outline" className="text-xs">
                            <Star className="h-3 w-3 mr-1 text-amber-500" />
                            Grade: {Math.round(enrollment.overallGrade)}% ({calculateLetterGrade(enrollment.overallGrade)})
                          </Badge>
                          {enrollment.quizSummary.averageScore > 0 && (
                            <Badge variant="outline" className="text-xs">
                              Quiz Avg: {Math.round(enrollment.quizSummary.averageScore)}%
                            </Badge>
                          )}
                          {enrollment.assignmentSummary.averageScore > 0 && (
                            <Badge variant="outline" className="text-xs">
                              Assign Avg: {Math.round(enrollment.assignmentSummary.averageScore)}%
                            </Badge>
                          )}
                          {enrollment.completedAt && (
                            <Badge variant="outline" className="text-xs">
                              <Calendar className="h-3 w-3 mr-1" />
                              {formatDate(enrollment.completedAt)}
                            </Badge>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-2 shrink-0">
                        {enrollment.certificate && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-primary border-primary/20"
                            onClick={() => navigate('certificate', { certificateId: enrollment.certificate!.id })}
                          >
                            <Award className="h-4 w-4 mr-1" />
                            View Certificate
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => navigate('course-detail', { courseId: enrollment.courseId })}
                        >
                          Review Course
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="text-center py-16">
                <Trophy className="h-16 w-16 text-muted-foreground/30 mx-auto mb-6" />
                <h2 className="text-2xl font-bold text-foreground mb-3">No Completed Courses</h2>
                <p className="text-muted-foreground mb-8 max-w-md mx-auto">
                  Keep learning! Complete your enrolled courses to earn certificates and track your achievements.
                </p>
                <Button className="bg-primary hover:bg-primary/90" onClick={() => navigate('courses')}>
                  <BookOpen className="h-4 w-4 mr-2" />
                  Browse Courses
                </Button>
              </div>
            )}
          </TabsContent>

          {/* Certificates Tab */}
          <TabsContent value="certificates" className="space-y-4">
            {enrollments.filter((e) => e.certificate).length > 0 ? (
              enrollments.filter((e) => e.certificate).map((enrollment) => (
                <Card key={enrollment.id} className="border-border/50 overflow-hidden">
                  <div className="flex flex-col sm:flex-row">
                    {/* Certificate Preview */}
                    <div className="sm:w-48 h-32 sm:h-auto bg-gradient-to-br from-amber-100 via-amber-50 to-emerald-50 flex items-center justify-center border-b sm:border-b-0 sm:border-r border-border/50">
                      <div className="text-center">
                        <Award className="h-10 w-10 text-amber-600 mx-auto mb-1" />
                        <p className="text-[10px] font-bold text-amber-700 uppercase tracking-wider">Certificate</p>
                      </div>
                    </div>
                    <CardContent className="p-5 flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-foreground">{enrollment.course.title}</h3>
                        {enrollment.overallGrade >= 90 ? (
                          <Badge className="bg-amber-100 text-amber-800 text-xs">Distinction</Badge>
                        ) : enrollment.overallGrade >= 80 ? (
                          <Badge className="bg-emerald-100 text-emerald-800 text-xs">Merit</Badge>
                        ) : (
                          <Badge className="bg-primary/10 text-primary text-xs">Pass</Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mb-2">
                        Issued {enrollment.certificate && formatDate(enrollment.certificate.issuedAt)}
                      </p>
                      <div className="flex flex-wrap gap-2 mb-3">
                        <Badge variant="outline" className="text-xs font-mono">
                          {enrollment.certificate?.certificateNumber}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          <Star className="h-3 w-3 mr-1 text-amber-500" />
                          Grade: {Math.round(enrollment.overallGrade)}% ({calculateLetterGrade(enrollment.overallGrade)})
                        </Badge>
                      </div>
                      <Button
                        size="sm"
                        className="bg-primary hover:bg-primary/90"
                        onClick={() => navigate('certificate', { certificateId: enrollment.certificate!.id })}
                      >
                        <Award className="h-4 w-4 mr-1" />
                        View Certificate
                      </Button>
                    </CardContent>
                  </div>
                </Card>
              ))
            ) : (
              <div className="text-center py-16">
                <Award className="h-16 w-16 text-muted-foreground/30 mx-auto mb-6" />
                <h2 className="text-2xl font-bold text-foreground mb-3">No Certificates Yet</h2>
                <p className="text-muted-foreground mb-8 max-w-md mx-auto">
                  Complete a course to earn your certificate. Certificates are automatically issued when you finish all lessons and pass all assessments.
                </p>
                <Button className="bg-primary hover:bg-primary/90" onClick={() => navigate('courses')}>
                  <BookOpen className="h-4 w-4 mr-2" />
                  Browse Courses
                </Button>
              </div>
            )}
          </TabsContent>

          {/* Appointments Tab */}
          <TabsContent value="appointments" className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-foreground">My Appointments</h2>
                <p className="text-sm text-muted-foreground mt-1">Schedule and manage appointments with your instructors</p>
              </div>
              <Button
                className="bg-primary hover:bg-primary/90"
                onClick={() => { resetForm(); setCreateDialogOpen(true) }}
              >
                <Plus className="h-4 w-4 mr-2" />
                Request Appointment
              </Button>
            </div>

            {appointmentsLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Card key={i} className="border-border/50">
                    <CardContent className="p-5">
                      <div className="animate-pulse space-y-3">
                        <div className="h-4 bg-muted rounded w-2/3" />
                        <div className="h-3 bg-muted rounded w-1/2" />
                        <div className="h-3 bg-muted rounded w-1/3" />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : appointments.length === 0 ? (
              <div className="text-center py-16">
                <Calendar className="h-16 w-16 text-muted-foreground/30 mx-auto mb-6" />
                <h2 className="text-2xl font-bold text-foreground mb-3">No Appointments</h2>
                <p className="text-muted-foreground mb-8 max-w-md mx-auto">
                  You haven&apos;t scheduled any appointments yet. Request a meeting with your course instructors for guidance, questions, or mentorship.
                </p>
                <Button className="bg-primary hover:bg-primary/90" onClick={() => { resetForm(); setCreateDialogOpen(true) }}>
                  <Plus className="h-4 w-4 mr-2" />
                  Request Appointment
                </Button>
              </div>
            ) : (
              <>
                {/* Upcoming Appointments */}
                {pendingAppointments.length + confirmedAppointments.length > 0 && (
                  <div>
                    <h3 className="text-base font-semibold text-foreground mb-3 flex items-center gap-2">
                      <Clock className="h-4 w-4 text-primary" />
                      Upcoming
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {[...pendingAppointments, ...confirmedAppointments].map((apt) => (
                        <Card key={apt.id} className="border-border/50">
                          <CardContent className="p-5">
                            <div className="flex items-start justify-between mb-3">
                              <div className="flex-1 min-w-0">
                                <h4 className="font-semibold text-foreground text-sm line-clamp-1">{apt.title}</h4>
                                <p className="text-xs text-muted-foreground mt-0.5">
                                  with {apt.recipient.name}
                                </p>
                              </div>
                              {getStatusBadge(apt.status)}
                            </div>
                            <div className="space-y-1.5 text-xs text-muted-foreground">
                              <div className="flex items-center gap-2">
                                <Calendar className="h-3.5 w-3.5" />
                                <span>{formatAppointmentDate(apt.date)}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Clock className="h-3.5 w-3.5" />
                                <span>{apt.duration} minutes</span>
                              </div>
                              {apt.location && (
                                <div className="flex items-center gap-2">
                                  <MapPin className="h-3.5 w-3.5" />
                                  <span>{apt.location}</span>
                                </div>
                              )}
                              {apt.notes && (
                                <p className="text-muted-foreground/80 mt-2 line-clamp-2 italic">
                                  &ldquo;{apt.notes}&rdquo;
                                </p>
                              )}
                            </div>
                            {(apt.status === 'pending' || apt.status === 'confirmed') && (
                              <div className="flex gap-2 mt-4">
                                {apt.meetingUrl && (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="text-primary border-primary/20"
                                    onClick={() => window.open(apt.meetingUrl!, '_blank')}
                                  >
                                    Join Meeting
                                  </Button>
                                )}
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="text-destructive hover:text-destructive hover:bg-destructive/10"
                                  onClick={() => { setSelectedAppointment(apt); setCancelDialogOpen(true) }}
                                >
                                  <CalendarX className="h-3.5 w-3.5 mr-1" />
                                  Cancel
                                </Button>
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}

                {/* Past / Cancelled Appointments */}
                {appointments.filter((a) => a.status === 'cancelled' || a.status === 'completed').length > 0 && (
                  <div>
                    <h3 className="text-base font-semibold text-foreground mb-3 flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      Past & Cancelled
                    </h3>
                    <div className="space-y-3">
                      {appointments
                        .filter((a) => a.status === 'cancelled' || a.status === 'completed')
                        .map((apt) => (
                          <Card key={apt.id} className="border-border/50 opacity-75">
                            <CardContent className="p-4">
                              <div className="flex items-center justify-between">
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2">
                                    <h4 className="font-medium text-foreground text-sm line-clamp-1">{apt.title}</h4>
                                    {getStatusBadge(apt.status)}
                                  </div>
                                  <p className="text-xs text-muted-foreground mt-0.5">
                                    with {apt.recipient.name} · {formatAppointmentDate(apt.date)}
                                  </p>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </TabsContent>

          {/* Order Certificate Tab */}
          <TabsContent value="order-certificate" className="space-y-6">
            {/* Eligibility Banner */}
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-foreground">Order Certificate / Diploma</h2>
                <p className="text-sm text-muted-foreground mt-1">
                  You have completed <strong>{completedCourses.length}</strong> course{completedCourses.length !== 1 ? 's' : ''}
                </p>
              </div>
            </div>

            {/* Free Certificate Notice */}
            <Card className="border-emerald-200 bg-emerald-50/50">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-emerald-800 mb-1">Free Certificate of Completion</h3>
                    <p className="text-sm text-emerald-700">
                      You receive a <strong>free digital Certificate of Completion</strong> for every course you finish. 
                      View and download them from the Certificates tab above.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Certificate Order Card */}
            <Card className={`border-border/50 ${completedCourses.length >= 7 ? 'cursor-pointer card-hover' : 'opacity-60'}`}
              onClick={() => completedCourses.length >= 7 && navigate('order-certificate', { certificateId: null })}>
              <CardContent className="p-5">
                <div className="flex items-start gap-4">
                  <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-amber-100 shrink-0">
                    <Award className="h-7 w-7 text-amber-700" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-lg font-bold text-foreground">Certificate</h3>
                      {completedCourses.length >= 7 ? (
                        <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200 text-xs">
                          <CheckCircle className="h-3 w-3 mr-1" />Eligible
                        </Badge>
                      ) : (
                        <Badge className="bg-amber-100 text-amber-800 border-amber-200 text-xs">
                          <Lock className="h-3 w-3 mr-1" />Locked
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">
                      Official digital certificate validating your cumulative studies at DreamCraft Christian Institute
                    </p>
                    <div className="flex items-center gap-4 text-sm">
                      <span className="font-bold text-primary">$25 (MK 43,750)</span>
                      <span className="text-muted-foreground">•</span>
                      <span className="text-muted-foreground flex items-center gap-1">
                        <Mail className="h-3.5 w-3.5" /> Digital delivery via email within 1 week
                      </span>
                    </div>
                    {completedCourses.length < 7 && (
                      <p className="text-xs text-amber-700 mt-2">
                        <AlertCircle className="h-3 w-3 inline mr-1" />
                        Complete {7 - completedCourses.length} more course{7 - completedCourses.length !== 1 ? 's' : ''} to unlock (requires 7 courses)
                      </p>
                    )}
                  </div>
                  {completedCourses.length >= 7 && (
                    <Button className="bg-amber-600 hover:bg-amber-700 text-white shrink-0" onClick={(e) => { e.stopPropagation(); navigate('order-certificate', { certificateId: null }) }}>
                      Order Now
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Diploma Order Card */}
            <Card className={`border-border/50 ${completedCourses.length >= 12 ? 'cursor-pointer card-hover' : 'opacity-60'}`}
              onClick={() => completedCourses.length >= 12 && navigate('order-certificate', { certificateId: null })}>
              <CardContent className="p-5">
                <div className="flex items-start gap-4">
                  <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-emerald-100 shrink-0">
                    <GraduationCap className="h-7 w-7 text-emerald-700" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-lg font-bold text-foreground">Diploma</h3>
                      {completedCourses.length >= 12 ? (
                        <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200 text-xs">
                          <CheckCircle className="h-3 w-3 mr-1" />Eligible
                        </Badge>
                      ) : (
                        <Badge className="bg-amber-100 text-amber-800 border-amber-200 text-xs">
                          <Lock className="h-3 w-3 mr-1" />Locked
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">
                      Official digital diploma with comprehensive credential validation from DreamCraft Christian Institute
                    </p>
                    <div className="flex items-center gap-4 text-sm">
                      <span className="font-bold text-primary">$40 (MK 70,000)</span>
                      <span className="text-muted-foreground">•</span>
                      <span className="text-muted-foreground flex items-center gap-1">
                        <Mail className="h-3.5 w-3.5" /> Digital delivery via email within 1 week
                      </span>
                    </div>
                    {completedCourses.length < 12 && (
                      <p className="text-xs text-amber-700 mt-2">
                        <AlertCircle className="h-3 w-3 inline mr-1" />
                        Complete {12 - completedCourses.length} more course{12 - completedCourses.length !== 1 ? 's' : ''} to unlock (requires 12 courses)
                      </p>
                    )}
                  </div>
                  {completedCourses.length >= 12 && (
                    <Button className="bg-emerald-600 hover:bg-emerald-700 text-white shrink-0" onClick={(e) => { e.stopPropagation(); navigate('order-certificate', { certificateId: null }) }}>
                      Order Now
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* How It Works */}
            <Card className="border-border/50">
              <CardContent className="p-5">
                <h4 className="font-semibold text-foreground mb-3">How It Works</h4>
                <div className="space-y-3">
                  {[
                    { step: '1', title: 'Complete Courses', desc: 'Finish the required number of courses to become eligible' },
                    { step: '2', title: 'Place Your Order', desc: 'Select your document type and proceed to checkout' },
                    { step: '3', title: 'Make Payment', desc: 'Pay via Bank Transfer, Airtel Money, or TNM Mpamba' },
                    { step: '4', title: 'Receive by Email', desc: 'Your digital certificate/diploma is emailed within 1 week after payment confirmation' },
                  ].map((item) => (
                    <div key={item.step} className="flex items-start gap-3">
                      <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-bold shrink-0">
                        {item.step}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-foreground">{item.title}</p>
                        <p className="text-xs text-muted-foreground">{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Quick Actions */}
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card className="border-border/50 cursor-pointer card-hover" onClick={() => navigate('courses')}>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100 text-amber-700 shrink-0">
                <BookOpen className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">Explore Courses</p>
                <p className="text-xs text-muted-foreground">Find your next course</p>
              </div>
              <ArrowRight className="h-4 w-4 text-muted-foreground ml-auto" />
            </CardContent>
          </Card>
          <Card className="border-border/50 cursor-pointer card-hover" onClick={() => navigate('live-classes')}>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700 shrink-0">
                <Video className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">Live Classes</p>
                <p className="text-xs text-muted-foreground">Join upcoming sessions</p>
              </div>
              <ArrowRight className="h-4 w-4 text-muted-foreground ml-auto" />
            </CardContent>
          </Card>
          <Card className="border-border/50 cursor-pointer card-hover" onClick={() => navigate('certificates')}>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100 text-amber-700 shrink-0">
                <Award className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">My Certificates</p>
                <p className="text-xs text-muted-foreground">View your achievements</p>
              </div>
              <ArrowRight className="h-4 w-4 text-muted-foreground ml-auto" />
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Create Appointment Dialog */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Request Appointment</DialogTitle>
            <DialogDescription>Schedule a meeting with one of your course instructors.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div>
              <Label>Title *</Label>
              <Input
                placeholder="e.g., Course guidance, Question about assignment"
                value={formTitle}
                onChange={(e) => setFormTitle(e.target.value)}
                className="mt-1.5"
              />
            </div>
            <div>
              <Label>Instructor *</Label>
              <Select value={formInstructorId} onValueChange={(val) => { setFormInstructorId(val); setFormCourseId('') }}>
                <SelectTrigger className="mt-1.5">
                  <SelectValue placeholder="Select an instructor" />
                </SelectTrigger>
                <SelectContent>
                  {allInstructorsForSelect.length > 0 ? (
                    allInstructorsForSelect.map((instr) => (
                      <SelectItem key={instr.id} value={instr.id}>
                        {instr.name}
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem value="none" disabled>No instructors available</SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>
            {coursesForSelectedInstructor.length > 0 && (
              <div>
                <Label>Related Course</Label>
                <Select value={formCourseId} onValueChange={setFormCourseId}>
                  <SelectTrigger className="mt-1.5">
                    <SelectValue placeholder="Select a course (optional)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No specific course</SelectItem>
                    {coursesForSelectedInstructor.map((e) => (
                      <SelectItem key={e.courseId} value={e.courseId}>
                        {e.course.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Date *</Label>
                <Input
                  type="date"
                  value={formDate}
                  onChange={(e) => setFormDate(e.target.value)}
                  className="mt-1.5"
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>
              <div>
                <Label>Time *</Label>
                <Input
                  type="time"
                  value={formTime}
                  onChange={(e) => setFormTime(e.target.value)}
                  className="mt-1.5"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Duration (minutes)</Label>
                <Select value={formDuration} onValueChange={setFormDuration}>
                  <SelectTrigger className="mt-1.5">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="15">15 min</SelectItem>
                    <SelectItem value="30">30 min</SelectItem>
                    <SelectItem value="45">45 min</SelectItem>
                    <SelectItem value="60">60 min</SelectItem>
                    <SelectItem value="90">90 min</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Location</Label>
                <Input
                  placeholder="e.g., Zoom, Office 101"
                  value={formLocation}
                  onChange={(e) => setFormLocation(e.target.value)}
                  className="mt-1.5"
                />
              </div>
            </div>
            <div>
              <Label>Notes</Label>
              <Textarea
                placeholder="Brief description of what you'd like to discuss..."
                value={formNotes}
                onChange={(e) => setFormNotes(e.target.value)}
                className="mt-1.5"
                rows={3}
              />
            </div>
          </div>
          <DialogFooter className="mt-6">
            <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>Cancel</Button>
            <Button
              className="bg-primary hover:bg-primary/90"
              onClick={handleCreateAppointment}
              disabled={submitting || !formTitle.trim() || !formInstructorId || !formDate || !formTime}
            >
              {submitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Request Appointment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Cancel Appointment Dialog */}
      <AlertDialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel Appointment</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to cancel your appointment
              {selectedAppointment ? ` "${selectedAppointment.title}"` : ''}?
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setSelectedAppointment(null)}>Keep Appointment</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleCancelAppointment}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {submitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Cancel Appointment
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
