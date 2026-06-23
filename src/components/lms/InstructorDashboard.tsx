'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useAppStore, type Page } from '@/lib/store'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from '@/components/ui/sheet'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription, DialogClose } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import {
  LayoutDashboard,
  BookOpen,
  Users,
  ClipboardCheck,
  Library,
  MessageSquare,
  Menu,
  ChevronRight,
  ChevronDown,
  GraduationCap,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertCircle,
  Star,
  FileText,
  Send,
  Loader2,
  Shield,
  User,
  LogOut,
  ArrowRight,
  BookMarked,
  FolderOpen,
  MessageCircle,
  Plus,
  Newspaper,
  Headphones,
  Video,
  Trash2,
  Pin,
  PinOff,
  HelpCircle,
  Calendar,
  Timer,
  RotateCcw,
  Edit,
  X,
  Minus,
  Save,
  Image as ImageIcon,
  Upload,
  Code,
  FileUp,
  ArrowLeft,
  ExternalLink,
  Globe,
} from 'lucide-react'

// Types
interface InstructorSummary {
  totalCourses: number
  totalStudents: number
  activeStudents: number
  completedStudents: number
  avgGrade: number
  pendingSubmissions: number
}

interface ModuleInfo {
  id: string
  title: string
  _count: { lessons: number; quizzes: number; assignments: number }
}

interface EnrollmentInfo {
  id: string
  progress: number
  overallGrade: number
  letterGrade: string | null
  status: string
  enrolledAt: string
  completedAt: string | null
  lastAccessedAt: string
  user: {
    id: string
    name: string
    email: string
    avatar: string | null
    country: string | null
  }
  certificate: {
    id: string
    certificateNumber: string
    finalGrade: number
    letterGrade: string | null
  } | null
  _count: { lessonProgress: number; quizAttempts: number }
}

interface FeedbackInfo {
  id: string
  rating: number
  feedback: string
  createdAt: string
  user: { name: string; avatar: string | null }
}

interface InstructorCourse {
  id: string
  title: string
  description: string
  category: string
  level: string
  duration: string
  instructor: string
  enrolled: number
  rating: number
  image?: string | null
  videoUrl?: string | null
  modules: ModuleInfo[]
  enrollments: EnrollmentInfo[]
  feedbacks: FeedbackInfo[]
  _count: { modules: number }
}

interface SubmissionInfo {
  id: string
  userId: string
  assignmentId: string
  content: string
  fileUrl: string | null
  score: number | null
  feedback: string | null
  status: string
  submittedAt: string
  gradedAt: string | null
  assignment: {
    id: string
    title: string
    maxScore: number
    module: {
      course: { id: string; title: string; instructor: string }
    }
  }
  user: { id: string; name: string; email: string; avatar: string | null }
}

interface InstructorData {
  courses: InstructorCourse[]
  summary: InstructorSummary
  pendingSubmissions: SubmissionInfo[]
  gradedSubmissions: SubmissionInfo[]
}

interface ChatMessage {
  id: string
  content: string
  senderId: string
  receiverId: string
  createdAt: string
  isRead: boolean
  sender?: { id: string; name: string; avatar: string | null }
  receiver?: { id: string; name: string; avatar: string | null }
}

interface ChatUser {
  id: string
  name: string
  email: string
  avatar: string | null
  role: string
}

// Navigation items
const sidebarNavItems = [
  { page: 'instructor-dashboard' as const, label: 'Dashboard', icon: LayoutDashboard },
  { page: 'instructor-courses' as const, label: 'My Courses', icon: BookOpen },
  { page: 'instructor-quizzes' as const, label: 'Quizzes & Exams', icon: HelpCircle },
  { page: 'instructor-students' as const, label: 'Students', icon: Users },
  { page: 'instructor-grading' as const, label: 'Grading', icon: ClipboardCheck },
  { page: 'instructor-live-classes' as const, label: 'Live Classes', icon: Video },
  { page: 'instructor-library' as const, label: 'Library', icon: Library },
  { page: 'instructor-forum' as const, label: 'Forum', icon: MessageSquare },
  { page: 'instructor-communication' as const, label: 'Communication', icon: MessageCircle },
  { page: 'instructor-appointments' as const, label: 'Appointments', icon: Calendar },
]

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

function getGradeColor(score: number): string {
  if (score >= 90) return 'text-emerald-600'
  if (score >= 80) return 'text-primary'
  if (score >= 70) return 'text-amber-600'
  return 'text-destructive'
}

function getGradeBadgeVariant(score: number): 'default' | 'secondary' | 'destructive' | 'outline' {
  if (score >= 90) return 'default'
  if (score >= 70) return 'secondary'
  return 'destructive'
}

function formatTimeAgo(dateStr: string): string {
  const date = new Date(dateStr)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMins / 60)
  const diffDays = Math.floor(diffHours / 24)

  if (diffMins < 1) return 'Just now'
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays < 7) return `${diffDays}d ago`
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

// ===================== SIDEBAR =====================
function InstructorSidebar({
  currentPage,
  onNavigate,
  currentUser,
  onSignOut,
}: {
  currentPage: string
  onNavigate: (page: string) => void
  currentUser: { id: string; name: string; email: string; avatar?: string; role?: string }
  onSignOut: () => void
}) {
  const getInitials = (name: string) =>
    name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)

  return (
    <div className="flex flex-col h-full bg-white border-r border-border/50">
      {/* Logo */}
      <div className="p-4 border-b border-border/50">
        <button
          onClick={() => onNavigate('home')}
          className="flex items-center gap-2.5 transition-opacity hover:opacity-80 w-full"
        >
          <img
            src="/main-logo.png"
            alt="DreamCraft Christian Institute"
            className="h-8 w-8 rounded-lg object-cover"
          />
          <div className="flex flex-col">
            <span className="text-sm font-bold leading-tight text-foreground tracking-tight">
              DreamCraft
            </span>
            <span className="text-[9px] font-medium text-muted-foreground leading-tight tracking-wider uppercase">
              Instructor Portal
            </span>
          </div>
        </button>
      </div>

      {/* Nav Items */}
      <ScrollArea className="flex-1 py-3">
        <nav className="px-3 space-y-1">
          {sidebarNavItems.map((item) => {
            const Icon = item.icon
            const isActive = currentPage === item.page
            return (
              <button
                key={item.page}
                onClick={() => onNavigate(item.page)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-lg transition-colors ${
                  isActive
                    ? 'text-primary bg-primary/5 border border-primary/10'
                    : 'text-muted-foreground hover:text-foreground hover:bg-accent border border-transparent'
                }`}
              >
                <Icon className="h-4 w-4 shrink-0" />
                {item.label}
                {item.page === 'instructor-grading' && (
                  <Badge className="ml-auto bg-amber-100 text-amber-800 text-[10px] px-1.5 py-0">
                    !
                  </Badge>
                )}
              </button>
            )
          })}
        </nav>

        <div className="px-3 mt-4">
          <Separator className="mb-3" />
          <button
            onClick={() => onNavigate('dashboard')}
            className="w-full flex items-center gap-3 px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg transition-colors"
          >
            <GraduationCap className="h-4 w-4 shrink-0" />
            Student View
            <ChevronRight className="h-3 w-3 ml-auto" />
          </button>
        </div>
      </ScrollArea>

      {/* User Info */}
      <div className="p-3 border-t border-border/50">
        <div className="flex items-center gap-3 p-2 rounded-lg bg-muted/50">
          <Avatar className="h-9 w-9">
            <AvatarImage src={currentUser.avatar || undefined} alt={currentUser.name} />
            <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
              {getInitials(currentUser.name)}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-foreground truncate">{currentUser.name}</p>
            <p className="text-[10px] text-muted-foreground truncate">Instructor</p>
          </div>
          <button
            onClick={onSignOut}
            className="p-1.5 rounded-md hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
            title="Sign Out"
          >
            <LogOut className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  )
}

// ===================== DASHBOARD SECTION =====================
function DashboardSection({
  data,
  onNavigate,
}: {
  data: InstructorData
  onNavigate: (page: string) => void
}) {
  const { summary, courses, pendingSubmissions } = data

  const recentActivity = courses
    .flatMap((c) =>
      c.enrollments
        .filter((e) => e.lastAccessedAt)
        .sort((a, b) => new Date(b.lastAccessedAt).getTime() - new Date(a.lastAccessedAt).getTime())
        .slice(0, 1)
        .map((e) => ({
          ...e,
          courseTitle: c.title,
          courseId: c.id,
        }))
    )
    .sort((a, b) => new Date(b.lastAccessedAt).getTime() - new Date(a.lastAccessedAt).getTime())
    .slice(0, 5)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Instructor Dashboard</h1>
        <p className="text-muted-foreground mt-1">Overview of your courses and student activity</p>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <Card className="border-border/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100 text-amber-700">
                <BookOpen className="h-5 w-5" />
              </div>
              <div>
                <p className="text-2xl font-bold">{summary.totalCourses}</p>
                <p className="text-xs text-muted-foreground">My Courses</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
                <Users className="h-5 w-5" />
              </div>
              <div>
                <p className="text-2xl font-bold">{summary.totalStudents}</p>
                <p className="text-xs text-muted-foreground">Total Students</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <TrendingUp className="h-5 w-5" />
              </div>
              <div>
                <p className="text-2xl font-bold">{summary.activeStudents}</p>
                <p className="text-xs text-muted-foreground">Active Students</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100 text-amber-700">
                <ClipboardCheck className="h-5 w-5" />
              </div>
              <div>
                <p className="text-2xl font-bold">{summary.pendingSubmissions}</p>
                <p className="text-xs text-muted-foreground">Pending Grades</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
                <GraduationCap className="h-5 w-5" />
              </div>
              <div>
                <p className="text-2xl font-bold">{summary.avgGrade}%</p>
                <p className="text-xs text-muted-foreground">Average Grade</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Courses & Submissions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* My Courses */}
        <div className="lg:col-span-2">
          <Card className="border-border/50">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-primary" />
                  My Courses
                </CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-primary"
                  onClick={() => onNavigate('instructor-courses')}
                >
                  View All <ArrowRight className="h-3 w-3 ml-1" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {courses.length === 0 ? (
                <p className="text-muted-foreground text-sm text-center py-6">No courses assigned</p>
              ) : (
                courses.slice(0, 5).map((course) => {
                  const avgProgress =
                    course.enrollments.length > 0
                      ? Math.round(
                          course.enrollments.reduce((s, e) => s + e.progress, 0) /
                            course.enrollments.length
                        )
                      : 0
                  const avgGrade =
                    course.enrollments.filter((e) => e.overallGrade > 0).length > 0
                      ? Math.round(
                          course.enrollments
                            .filter((e) => e.overallGrade > 0)
                            .reduce((s, e) => s + e.overallGrade, 0) /
                            course.enrollments.filter((e) => e.overallGrade > 0).length
                        )
                      : 0

                  return (
                    <div
                      key={course.id}
                      className="flex items-center gap-4 p-3 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
                      onClick={() => onNavigate('instructor-courses')}
                    >
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-amber-50 to-emerald-50 text-primary shrink-0">
                        <BookOpen className="h-5 w-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-semibold text-foreground truncate">
                          {course.title}
                        </h4>
                        <div className="flex items-center gap-3 mt-1">
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <Users className="h-3 w-3" />
                            {course.enrollments.length}
                          </span>
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <Star className="h-3 w-3" />
                            {avgGrade}%
                          </span>
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <TrendingUp className="h-3 w-3" />
                            {avgProgress}%
                          </span>
                        </div>
                      </div>
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    </div>
                  )
                })
              )}
            </CardContent>
          </Card>
        </div>

        {/* Pending Submissions */}
        <div>
          <Card className="border-border/50">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg flex items-center gap-2">
                  <ClipboardCheck className="h-5 w-5 text-amber-600" />
                  Pending
                </CardTitle>
                {pendingSubmissions.length > 0 && (
                  <Badge className="bg-amber-100 text-amber-800 text-xs">
                    {pendingSubmissions.length}
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <ScrollArea className="max-h-72">
                {pendingSubmissions.length === 0 ? (
                  <div className="text-center py-6">
                    <CheckCircle className="h-8 w-8 text-emerald-300 mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">All caught up!</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {pendingSubmissions.slice(0, 8).map((sub) => (
                      <div
                        key={sub.id}
                        className="p-3 rounded-lg border border-border/50 hover:border-primary/20 cursor-pointer transition-colors"
                        onClick={() => onNavigate('instructor-grading')}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <Avatar className="h-6 w-6">
                            <AvatarFallback className="bg-primary/10 text-primary text-[10px]">
                              {sub.user.name
                                .split(' ')
                                .map((n: string) => n[0])
                                .join('')
                                .toUpperCase()
                                .slice(0, 2)}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-xs font-medium text-foreground truncate">
                            {sub.user.name}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground truncate">
                          {sub.assignment.title}
                        </p>
                        <p className="text-[10px] text-muted-foreground mt-1">
                          {formatTimeAgo(sub.submittedAt)}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Recent Activity & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Student Activity */}
        <Card className="border-border/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Clock className="h-5 w-5 text-primary" />
              Recent Student Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            {recentActivity.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-6">No recent activity</p>
            ) : (
              <div className="space-y-3">
                {recentActivity.map((activity) => (
                  <div key={activity.id} className="flex items-center gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={activity.user.avatar || undefined} />
                      <AvatarFallback className="bg-primary/10 text-primary text-xs">
                        {activity.user.name
                          .split(' ')
                          .map((n: string) => n[0])
                          .join('')
                          .toUpperCase()
                          .slice(0, 2)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">
                        {activity.user.name}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        {activity.courseTitle} · {Math.round(activity.progress)}%
                      </p>
                    </div>
                    <span className="text-[10px] text-muted-foreground shrink-0">
                      {formatTimeAgo(activity.lastAccessedAt)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card className="border-border/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <button
              onClick={() => onNavigate('instructor-grading')}
              className="w-full flex items-center gap-3 p-3 rounded-lg border border-border/50 hover:border-primary/20 hover:bg-primary/5 transition-colors"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-100 text-amber-700 shrink-0">
                <ClipboardCheck className="h-4 w-4" />
              </div>
              <div className="text-left">
                <p className="text-sm font-medium text-foreground">Grade Submissions</p>
                <p className="text-xs text-muted-foreground">
                  {summary.pendingSubmissions} pending
                </p>
              </div>
              <ChevronRight className="h-4 w-4 text-muted-foreground ml-auto" />
            </button>
            <button
              onClick={() => onNavigate('instructor-students')}
              className="w-full flex items-center gap-3 p-3 rounded-lg border border-border/50 hover:border-primary/20 hover:bg-primary/5 transition-colors"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700 shrink-0">
                <Users className="h-4 w-4" />
              </div>
              <div className="text-left">
                <p className="text-sm font-medium text-foreground">View Students</p>
                <p className="text-xs text-muted-foreground">{summary.totalStudents} enrolled</p>
              </div>
              <ChevronRight className="h-4 w-4 text-muted-foreground ml-auto" />
            </button>
            <button
              onClick={() => onNavigate('instructor-courses')}
              className="w-full flex items-center gap-3 p-3 rounded-lg border border-border/50 hover:border-primary/20 hover:bg-primary/5 transition-colors"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary shrink-0">
                <BookOpen className="h-4 w-4" />
              </div>
              <div className="text-left">
                <p className="text-sm font-medium text-foreground">Manage Course</p>
                <p className="text-xs text-muted-foreground">{summary.totalCourses} courses</p>
              </div>
              <ChevronRight className="h-4 w-4 text-muted-foreground ml-auto" />
            </button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

// ===================== FILE UPLOAD HELPER =====================
async function uploadFile(file: File): Promise<string | null> {
  const formData = new FormData()
  formData.append('file', file)
  const res = await fetch('/api/upload', { method: 'POST', body: formData })
  if (res.ok) {
    const data = await res.json()
    return data.url
  }
  return null
}

// ===================== MY COURSES SECTION =====================
function MyCoursesSection({ data, onRefresh }: { data: InstructorData; onRefresh: () => void }) {
  const { currentUser } = useAppStore()
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [editingCourseId, setEditingCourseId] = useState<string | null>(null)
  const [creating, setCreating] = useState(false)
  const [saving, setSaving] = useState(false)
  const [managingCourseId, setManagingCourseId] = useState<string | null>(null)
  const [newCourse, setNewCourse] = useState({
    title: '',
    description: '',
    category: 'Life Coaching',
    level: 'Beginner',
    duration: '8 weeks',
    image: '',
    featured: false,
  })
  const [editCourse, setEditCourse] = useState({
    id: '',
    title: '',
    description: '',
    category: 'Life Coaching',
    level: 'Beginner',
    duration: '8 weeks',
    image: '',
    featured: false,
  })
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [editImageFile, setEditImageFile] = useState<File | null>(null)
  const [deletingCourseId, setDeletingCourseId] = useState<string | null>(null)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)

  const handleCreateCourse = async () => {
    if (!newCourse.title || !newCourse.description || !currentUser) return
    setCreating(true)
    try {
      let imageUrl = newCourse.image

      if (imageFile) {
        const url = await uploadFile(imageFile)
        if (url) imageUrl = url
      }

      const res = await fetch('/api/courses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'create',
          ...newCourse,
          image: imageUrl,
          instructor: currentUser.name,
          userId: currentUser.id,
        }),
      })
      if (res.ok) {
        setShowCreateDialog(false)
        setNewCourse({ title: '', description: '', category: 'Life Coaching', level: 'Beginner', duration: '8 weeks', image: '', featured: false })
        setImageFile(null)
        onRefresh()
      }
    } catch (err) {
      console.error('Error creating course:', err)
    } finally {
      setCreating(false)
    }
  }

  const openEditDialog = (course: InstructorCourse) => {
    setEditCourse({
      id: course.id,
      title: course.title,
      description: course.description,
      category: course.category,
      level: course.level,
      duration: course.duration,
      image: course.image || '',
      featured: false,
    })
    setEditImageFile(null)
    setEditingCourseId(course.id)
    setShowEditDialog(true)
  }

  const handleEditCourse = async () => {
    if (!editCourse.title || !editCourse.description || !currentUser || !editingCourseId) return
    setSaving(true)
    try {
      let imageUrl = editCourse.image

      if (editImageFile) {
        const url = await uploadFile(editImageFile)
        if (url) imageUrl = url
      }

      const res = await fetch('/api/courses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'update',
          id: editingCourseId,
          ...editCourse,
          image: imageUrl,
          userId: currentUser.id,
        }),
      })
      if (res.ok) {
        setShowEditDialog(false)
        setEditingCourseId(null)
        setEditImageFile(null)
        onRefresh()
      } else {
        const err = await res.json()
        console.error('Error updating course:', err.error)
      }
    } catch (err) {
      console.error('Error updating course:', err)
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteCourse = async (courseId: string) => {
    setSaving(true)
    try {
      const res = await fetch('/api/courses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'delete',
          id: courseId,
          userId: currentUser?.id,
        }),
      })
      if (res.ok) {
        setShowDeleteDialog(false)
        setDeletingCourseId(null)
        onRefresh()
      } else {
        const err = await res.json()
        console.error('Error deleting course:', err.error)
      }
    } catch (err) {
      console.error('Error deleting course:', err)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">My Courses</h1>
          <p className="text-muted-foreground mt-1">Manage your assigned courses</p>
        </div>
        <Button
          className="bg-primary hover:bg-primary/90"
          size="sm"
          onClick={() => setShowCreateDialog(true)}
        >
          <Plus className="h-4 w-4 mr-1.5" />
          Create New Course
        </Button>
      </div>

      {/* Create Course Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="sm:max-w-[525px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New Course</DialogTitle>
            <DialogDescription>Add a new course to the DreamCraft Christian Institute curriculum.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="course-title">Title *</Label>
              <Input
                id="course-title"
                value={newCourse.title}
                onChange={(e) => setNewCourse({ ...newCourse, title: e.target.value })}
                placeholder="e.g. Foundations of Christian Faith"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="course-desc">Description *</Label>
              <Textarea
                id="course-desc"
                value={newCourse.description}
                onChange={(e) => setNewCourse({ ...newCourse, description: e.target.value })}
                placeholder="Describe the course content and objectives"
                rows={3}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Category</Label>
                <Select value={newCourse.category} onValueChange={(v) => setNewCourse({ ...newCourse, category: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Life Coaching">Life Coaching</SelectItem>
                    <SelectItem value="Leadership">Leadership</SelectItem>
                    <SelectItem value="Ministry">Ministry</SelectItem>
                    <SelectItem value="Management">Management</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label>Level</Label>
                <Select value={newCourse.level} onValueChange={(v) => setNewCourse({ ...newCourse, level: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Beginner">Beginner</SelectItem>
                    <SelectItem value="Intermediate">Intermediate</SelectItem>
                    <SelectItem value="Advanced">Advanced</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="course-duration">Duration</Label>
                <Input
                  id="course-duration"
                  value={newCourse.duration}
                  onChange={(e) => setNewCourse({ ...newCourse, duration: e.target.value })}
                  placeholder="e.g. 8 weeks"
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label>Course Image</Label>
              <div className="flex items-center gap-3">
                {(newCourse.image || imageFile) ? (
                  <div className="relative w-24 h-24 rounded-lg overflow-hidden border border-border/50">
                    <img
                      src={imageFile ? URL.createObjectURL(imageFile) : newCourse.image}
                      alt="Course preview"
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => { setImageFile(null); setNewCourse({ ...newCourse, image: '' }) }}
                      className="absolute top-1 right-1 p-0.5 rounded-full bg-black/50 text-white hover:bg-destructive"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center w-24 h-24 border-2 border-dashed border-border/50 rounded-lg cursor-pointer hover:border-primary/50 hover:bg-primary/5 transition-colors">
                    <ImageIcon className="h-6 w-6 text-muted-foreground mb-1" />
                    <span className="text-[10px] text-muted-foreground">Upload</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const f = e.target.files?.[0]
                        if (f) setImageFile(f)
                      }}
                    />
                  </label>
                )}
                <div className="flex-1">
                  <Input
                    placeholder="Or paste image URL..."
                    value={imageFile ? '' : newCourse.image}
                    onChange={(e) => { setImageFile(null); setNewCourse({ ...newCourse, image: e.target.value }) }}
                    disabled={!!imageFile}
                  />
                  <p className="text-[10px] text-muted-foreground mt-1">JPEG, PNG, WebP — max 5MB</p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Switch
                id="course-featured"
                checked={newCourse.featured}
                onCheckedChange={(checked) => setNewCourse({ ...newCourse, featured: checked })}
              />
              <Label htmlFor="course-featured">Featured Course</Label>
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button
              className="bg-primary hover:bg-primary/90"
              onClick={handleCreateCourse}
              disabled={!newCourse.title || !newCourse.description || creating}
            >
              {creating ? <Loader2 className="h-4 w-4 animate-spin mr-1.5" /> : <Plus className="h-4 w-4 mr-1.5" />}
              Create Course
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Course Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="sm:max-w-[525px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Course</DialogTitle>
            <DialogDescription>Update the course details.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-course-title">Title *</Label>
              <Input
                id="edit-course-title"
                value={editCourse.title}
                onChange={(e) => setEditCourse({ ...editCourse, title: e.target.value })}
                placeholder="e.g. Foundations of Christian Faith"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-course-desc">Description *</Label>
              <Textarea
                id="edit-course-desc"
                value={editCourse.description}
                onChange={(e) => setEditCourse({ ...editCourse, description: e.target.value })}
                placeholder="Describe the course content and objectives"
                rows={3}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Category</Label>
                <Select value={editCourse.category} onValueChange={(v) => setEditCourse({ ...editCourse, category: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Life Coaching">Life Coaching</SelectItem>
                    <SelectItem value="Leadership">Leadership</SelectItem>
                    <SelectItem value="Ministry">Ministry</SelectItem>
                    <SelectItem value="Management">Management</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label>Level</Label>
                <Select value={editCourse.level} onValueChange={(v) => setEditCourse({ ...editCourse, level: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Beginner">Beginner</SelectItem>
                    <SelectItem value="Intermediate">Intermediate</SelectItem>
                    <SelectItem value="Advanced">Advanced</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-course-duration">Duration</Label>
                <Input
                  id="edit-course-duration"
                  value={editCourse.duration}
                  onChange={(e) => setEditCourse({ ...editCourse, duration: e.target.value })}
                  placeholder="e.g. 8 weeks"
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label>Course Image</Label>
              <div className="flex items-center gap-3">
                {(editCourse.image || editImageFile) ? (
                  <div className="relative w-24 h-24 rounded-lg overflow-hidden border border-border/50">
                    <img
                      src={editImageFile ? URL.createObjectURL(editImageFile) : editCourse.image}
                      alt="Course preview"
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => { setEditImageFile(null); setEditCourse({ ...editCourse, image: '' }) }}
                      className="absolute top-1 right-1 p-0.5 rounded-full bg-black/50 text-white hover:bg-destructive"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center w-24 h-24 border-2 border-dashed border-border/50 rounded-lg cursor-pointer hover:border-primary/50 hover:bg-primary/5 transition-colors">
                    <ImageIcon className="h-6 w-6 text-muted-foreground mb-1" />
                    <span className="text-[10px] text-muted-foreground">Upload</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const f = e.target.files?.[0]
                        if (f) setEditImageFile(f)
                      }}
                    />
                  </label>
                )}
                <div className="flex-1">
                  <Input
                    placeholder="Or paste image URL..."
                    value={editImageFile ? '' : editCourse.image}
                    onChange={(e) => { setEditImageFile(null); setEditCourse({ ...editCourse, image: e.target.value }) }}
                    disabled={!!editImageFile}
                  />
                  <p className="text-[10px] text-muted-foreground mt-1">JPEG, PNG, WebP — max 5MB</p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Switch
                id="edit-course-featured"
                checked={editCourse.featured}
                onCheckedChange={(checked) => setEditCourse({ ...editCourse, featured: checked })}
              />
              <Label htmlFor="edit-course-featured">Featured Course</Label>
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button
              className="bg-primary hover:bg-primary/90"
              onClick={handleEditCourse}
              disabled={!editCourse.title || !editCourse.description || saving}
            >
              {saving ? <Loader2 className="h-4 w-4 animate-spin mr-1.5" /> : <Save className="h-4 w-4 mr-1.5" />}
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Course Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Delete Course</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this course? This action cannot be undone. All modules, lessons, quizzes, assignments, and student enrollments will be permanently removed.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button
              variant="destructive"
              onClick={() => deletingCourseId && handleDeleteCourse(deletingCourseId)}
              disabled={saving}
            >
              {saving ? <Loader2 className="h-4 w-4 animate-spin mr-1.5" /> : <Trash2 className="h-4 w-4 mr-1.5" />}
              Delete Course
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {managingCourseId ? (
        <CourseManagementView
          courseId={managingCourseId}
          course={data.courses.find((c) => c.id === managingCourseId)}
          onBack={() => setManagingCourseId(null)}
          onRefresh={onRefresh}
        />
      ) : data.courses.length === 0 ? (
        <Card className="border-border/50">
          <CardContent className="p-12 text-center">
            <BookOpen className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">No Courses Assigned</h3>
            <p className="text-muted-foreground">You haven&apos;t been assigned any courses yet.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {data.courses.map((course) => {
            const avgProgress =
              course.enrollments.length > 0
                ? Math.round(
                    course.enrollments.reduce((s, e) => s + e.progress, 0) /
                      course.enrollments.length
                  )
                : 0
            const avgGrade =
              course.enrollments.filter((e) => e.overallGrade > 0).length > 0
                ? Math.round(
                    course.enrollments
                      .filter((e) => e.overallGrade > 0)
                      .reduce((s, e) => s + e.overallGrade, 0) /
                      course.enrollments.filter((e) => e.overallGrade > 0).length
                  )
                : 0

            return (
              <Card key={course.id} className="border-border/50 transition-all">
                <CardContent className="p-5">
                  <div className="flex items-start gap-4">
                    {course.image ? (
                      <img src={course.image} alt={course.title} className="h-12 w-12 rounded-xl object-cover shrink-0" />
                    ) : (
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-amber-50 to-emerald-50 text-primary shrink-0">
                        <BookOpen className="h-6 w-6" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge className="bg-amber-100 text-amber-800 text-[10px]">
                          {course.category}
                        </Badge>
                        <Badge variant="outline" className="text-[10px]">
                          {course.level}
                        </Badge>
                      </div>
                      <h3 className="font-semibold text-foreground mb-1">{course.title}</h3>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          {course.enrollments.length} students
                        </span>
                        <span className="flex items-center gap-1">
                          <TrendingUp className="h-3 w-3" />
                          {avgProgress}% avg progress
                        </span>
                        <span className="flex items-center gap-1">
                          <Star className="h-3 w-3" />
                          {avgGrade}% avg grade
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 ml-auto">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setManagingCourseId(course.id)}
                      >
                        <FolderOpen className="h-4 w-4 mr-1.5" />
                        Manage
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEditDialog(course)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" onClick={() => { setDeletingCourseId(course.id); setShowDeleteDialog(true) }}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}

// ===================== COURSE MANAGEMENT VIEW =====================
interface LessonData {
  id: string
  title: string
  type: string
  duration: string
  order: number
  videoUrl: string | null
  audioUrl: string | null
  codeSnippet: string | null
  pdfUrl: string | null
  presentationUrl: string | null
  embedCode: string | null
  externalUrl: string | null
  resourceUrl: string | null
  content: string
}

interface QuizData {
  id: string
  title: string
  type: string
  isFinalExam: boolean
  timeLimit: number
  passingScore: number
  maxAttempts: number
  order: number
  _count: { questions: number; attempts: number }
}

interface ModuleData {
  id: string
  title: string
  description: string | null
  order: number
  lessons: LessonData[]
  quizzes: QuizData[]
  _count: { lessons: number; quizzes: number; assignments: number }
}

function CourseManagementView({
  courseId,
  course,
  onBack,
  onRefresh,
}: {
  courseId: string
  course: InstructorCourse | undefined
  onRefresh: () => void
  onBack: () => void
}) {
  const { currentUser } = useAppStore()
  const [modules, setModules] = useState<ModuleData[]>([])
  const [loading, setLoading] = useState(true)
  const [expandedModuleId, setExpandedModuleId] = useState<string | null>(null)

  // Module dialog state
  const [showModuleDialog, setShowModuleDialog] = useState(false)
  const [editingModule, setEditingModule] = useState<ModuleData | null>(null)
  const [moduleTitle, setModuleTitle] = useState('')
  const [moduleDescription, setModuleDescription] = useState('')
  const [moduleSaving, setModuleSaving] = useState(false)

  // Lesson dialog state
  const [showLessonDialog, setShowLessonDialog] = useState(false)
  const [editingLesson, setEditingLesson] = useState<LessonData | null>(null)
  const [lessonModuleId, setLessonModuleId] = useState<string>('')
  const [lessonTitle, setLessonTitle] = useState('')
  const [lessonContent, setLessonContent] = useState('')
  const [lessonVideoUrl, setLessonVideoUrl] = useState('')
  const [lessonVideoFile, setLessonVideoFile] = useState<File | null>(null)
  const [lessonAudioUrl, setLessonAudioUrl] = useState('')
  const [lessonCodeSnippet, setLessonCodeSnippet] = useState('')
  const [lessonPdfUrl, setLessonPdfUrl] = useState('')
  const [lessonPdfFile, setLessonPdfFile] = useState<File | null>(null)
  const [lessonPresentationUrl, setLessonPresentationUrl] = useState('')
  const [lessonPresentationFile, setLessonPresentationFile] = useState<File | null>(null)
  const [lessonEmbedCode, setLessonEmbedCode] = useState('')
  const [lessonExternalUrl, setLessonExternalUrl] = useState('')
  const [lessonResourceUrl, setLessonResourceUrl] = useState('')
  const [lessonResourceFile, setLessonResourceFile] = useState<File | null>(null)
  const [lessonDuration, setLessonDuration] = useState('10 min')
  const [lessonSaving, setLessonSaving] = useState(false)

  // Quiz dialog state
  const [showQuizDialog, setShowQuizDialog] = useState(false)
  const [quizModuleId, setQuizModuleId] = useState<string>('')
  const [quizIsFinal, setQuizIsFinal] = useState(false)
  const [quizTitle, setQuizTitle] = useState('')
  const [quizDescription, setQuizDescription] = useState('')
  const [quizTimeLimit, setQuizTimeLimit] = useState(30)
  const [quizPassingScore, setQuizPassingScore] = useState(70)
  const [quizMaxAttempts, setQuizMaxAttempts] = useState(3)
  const [quizSaving, setQuizSaving] = useState(false)

  const fetchModules = useCallback(async () => {
    try {
      const res = await fetch(`/api/modules?courseId=${courseId}`)
      if (res.ok) {
        const data = await res.json()
        setModules(data)
      }
    } catch (err) {
      console.error('Error fetching modules:', err)
    } finally {
      setLoading(false)
    }
  }, [courseId])

  useEffect(() => {
    fetchModules()
  }, [fetchModules])

  const openCreateModuleDialog = () => {
    setEditingModule(null)
    setModuleTitle('')
    setModuleDescription('')
    setShowModuleDialog(true)
  }

  const openEditModuleDialog = (mod: ModuleData) => {
    setEditingModule(mod)
    setModuleTitle(mod.title)
    setModuleDescription(mod.description || '')
    setShowModuleDialog(true)
  }

  const handleSaveModule = async () => {
    if (!moduleTitle || !currentUser) return
    setModuleSaving(true)
    try {
      if (editingModule) {
        const res = await fetch('/api/modules', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'update',
            moduleId: editingModule.id,
            title: moduleTitle,
            description: moduleDescription,
            userId: currentUser.id,
          }),
        })
        if (res.ok) fetchModules()
      } else {
        const res = await fetch('/api/modules', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'create',
            courseId,
            title: moduleTitle,
            description: moduleDescription,
            userId: currentUser.id,
          }),
        })
        if (res.ok) fetchModules()
      }
      setShowModuleDialog(false)
    } catch (err) {
      console.error('Error saving module:', err)
    } finally {
      setModuleSaving(false)
    }
  }

  const handleDeleteModule = async (moduleId: string) => {
    if (!currentUser) return
    if (!confirm('Delete this module and all its lessons/quizzes? This cannot be undone.')) return
    try {
      const res = await fetch('/api/modules', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'delete', moduleId, userId: currentUser.id }),
      })
      if (res.ok) {
        fetchModules()
        if (expandedModuleId === moduleId) setExpandedModuleId(null)
      }
    } catch (err) {
      console.error('Error deleting module:', err)
    }
  }

  const resetLessonDialog = () => {
    setLessonTitle('')
    setLessonContent('')
    setLessonVideoUrl('')
    setLessonVideoFile(null)
    setLessonAudioUrl('')
    setLessonCodeSnippet('')
    setLessonPdfUrl('')
    setLessonPdfFile(null)
    setLessonPresentationUrl('')
    setLessonPresentationFile(null)
    setLessonEmbedCode('')
    setLessonExternalUrl('')
    setLessonResourceUrl('')
    setLessonResourceFile(null)
    setLessonDuration('10 min')
    setEditingLesson(null)
  }

  const openCreateLessonDialog = (moduleId: string) => {
    setLessonModuleId(moduleId)
    resetLessonDialog()
    setShowLessonDialog(true)
  }

  const openEditLessonDialog = (moduleId: string, lesson: LessonData) => {
    setLessonModuleId(moduleId)
    setEditingLesson(lesson)
    setLessonTitle(lesson.title)
    setLessonContent(lesson.content || '')
    setLessonVideoUrl(lesson.videoUrl || '')
    setLessonVideoFile(null)
    setLessonAudioUrl(lesson.audioUrl || '')
    setLessonCodeSnippet(lesson.codeSnippet || '')
    setLessonPdfUrl(lesson.pdfUrl || '')
    setLessonPdfFile(null)
    setLessonPresentationUrl(lesson.presentationUrl || '')
    setLessonPresentationFile(null)
    setLessonEmbedCode(lesson.embedCode || '')
    setLessonExternalUrl(lesson.externalUrl || '')
    setLessonResourceUrl(lesson.resourceUrl || '')
    setLessonResourceFile(null)
    setLessonDuration(lesson.duration || '10 min')
    setShowLessonDialog(true)
  }

  const handleSaveLesson = async () => {
    if (!lessonTitle || !lessonModuleId || !currentUser) return
    setLessonSaving(true)
    try {
      let videoUrl = lessonVideoUrl
      let pdfUrl = lessonPdfUrl
      let presentationUrl = lessonPresentationUrl
      let resourceUrl = lessonResourceUrl

      if (lessonVideoFile) {
        const url = await uploadFile(lessonVideoFile)
        if (url) videoUrl = url
      }
      if (lessonPdfFile) {
        const url = await uploadFile(lessonPdfFile)
        if (url) pdfUrl = url
      }
      if (lessonPresentationFile) {
        const url = await uploadFile(lessonPresentationFile)
        if (url) presentationUrl = url
      }
      if (lessonResourceFile) {
        const url = await uploadFile(lessonResourceFile)
        if (url) resourceUrl = url
      }

      if (editingLesson) {
        const res = await fetch('/api/lessons', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'update',
            lessonId: editingLesson.id,
            title: lessonTitle,
            content: lessonContent,
            videoUrl,
            audioUrl: lessonAudioUrl,
            codeSnippet: lessonCodeSnippet,
            pdfUrl,
            presentationUrl,
            embedCode: lessonEmbedCode,
            externalUrl: lessonExternalUrl,
            resourceUrl,
            duration: lessonDuration,
            userId: currentUser.id,
          }),
        })
        if (res.ok) fetchModules()
      } else {
        const res = await fetch('/api/lessons', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'create',
            moduleId: lessonModuleId,
            title: lessonTitle,
            content: lessonContent,
            videoUrl,
            audioUrl: lessonAudioUrl,
            codeSnippet: lessonCodeSnippet,
            pdfUrl,
            presentationUrl,
            embedCode: lessonEmbedCode,
            externalUrl: lessonExternalUrl,
            resourceUrl,
            duration: lessonDuration,
            userId: currentUser.id,
          }),
        })
        if (res.ok) fetchModules()
      }
      setShowLessonDialog(false)
      resetLessonDialog()
    } catch (err) {
      console.error('Error saving lesson:', err)
    } finally {
      setLessonSaving(false)
    }
  }

  const handleDeleteLesson = async (lessonId: string) => {
    if (!currentUser) return
    if (!confirm('Delete this lesson? This cannot be undone.')) return
    try {
      const res = await fetch('/api/lessons', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'delete', lessonId, userId: currentUser.id }),
      })
      if (res.ok) fetchModules()
    } catch (err) {
      console.error('Error deleting lesson:', err)
    }
  }

  const openCreateQuizDialog = (moduleId: string, isFinal: boolean) => {
    setQuizModuleId(moduleId)
    setQuizIsFinal(isFinal)
    setQuizTitle(isFinal ? 'Final Exam' : 'Module Quiz')
    setQuizDescription('')
    setQuizTimeLimit(isFinal ? 60 : 30)
    setQuizPassingScore(70)
    setQuizMaxAttempts(isFinal ? 1 : 3)
    setShowQuizDialog(true)
  }

  const handleCreateQuiz = async () => {
    if (!quizTitle || !quizModuleId || !currentUser) return
    setQuizSaving(true)
    try {
      const res = await fetch('/api/quizzes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'create',
          moduleId: quizModuleId,
          title: quizTitle,
          description: quizDescription,
          type: quizIsFinal ? 'exam' : 'practice',
          isFinalExam: quizIsFinal,
          timeLimit: quizTimeLimit,
          passingScore: quizPassingScore,
          maxAttempts: quizMaxAttempts,
          questions: [],
        }),
      })
      if (res.ok) fetchModules()
      setShowQuizDialog(false)
    } catch (err) {
      console.error('Error creating quiz:', err)
    } finally {
      setQuizSaving(false)
    }
  }

  const handleDeleteQuiz = async (quizId: string) => {
    if (!confirm('Delete this quiz? This cannot be undone.')) return
    try {
      const res = await fetch('/api/quizzes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'delete-quiz', quizId }),
      })
      if (res.ok) fetchModules()
    } catch (err) {
      console.error('Error deleting quiz:', err)
    }
  }

  const getLessonContentIcons = (lesson: LessonData) => {
    const icons: JSX.Element[] = []
    if (lesson.content) icons.push(<BookOpen key="notes" className="h-4 w-4 text-amber-600" />)
    if (lesson.videoUrl) icons.push(<Video key="video" className="h-4 w-4 text-primary" />)
    if (lesson.audioUrl) icons.push(<Headphones key="audio" className="h-4 w-4 text-emerald-600" />)
    if (lesson.pdfUrl) icons.push(<FileText key="pdf" className="h-4 w-4 text-red-500" />)
    if (lesson.codeSnippet) icons.push(<Code key="code" className="h-4 w-4 text-violet-600" />)
    if (lesson.presentationUrl) icons.push(<Newspaper key="presentation" className="h-4 w-4 text-orange-500" />)
    if (lesson.embedCode) icons.push(<Globe key="embed" className="h-4 w-4 text-sky-600" />)
    if (lesson.externalUrl) icons.push(<ExternalLink key="external" className="h-4 w-4 text-teal-600" />)
    if (lesson.resourceUrl) icons.push(<FileUp key="resource" className="h-4 w-4 text-indigo-500" />)
    if (icons.length === 0) icons.push(<FileText key="default" className="h-4 w-4 text-muted-foreground" />)
    return icons
  }

  // Find final exams across all modules
  const finalExams = modules.flatMap((mod) =>
    mod.quizzes.filter((q) => q.isFinalExam)
  )

  if (!course) {
    return (
      <div className="space-y-6">
        <Button variant="outline" onClick={onBack}>
          <ArrowLeft className="h-4 w-4 mr-1.5" /> Back to Courses
        </Button>
        <Card className="border-border/50">
          <CardContent className="p-12 text-center">
            <p className="text-muted-foreground">Course not found.</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Course Header */}
      <div className="flex flex-col sm:flex-row sm:items-start gap-4">
        <Button variant="outline" size="sm" onClick={onBack} className="shrink-0 self-start">
          <ArrowLeft className="h-4 w-4 mr-1.5" /> Back to Courses
        </Button>
        <div className="flex items-start gap-4 flex-1">
          {course.image ? (
            <img src={course.image} alt={course.title} className="h-16 w-16 rounded-xl object-cover shrink-0" />
          ) : (
            <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-gradient-to-br from-amber-50 to-emerald-50 text-primary shrink-0">
              <BookOpen className="h-8 w-8" />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl font-bold text-foreground">{course.title}</h1>
            <div className="flex items-center gap-2 mt-1">
              <Badge className="bg-amber-100 text-amber-800 text-xs">{course.category}</Badge>
              <Badge variant="outline" className="text-xs">{course.level}</Badge>
              <span className="text-xs text-muted-foreground">{course.duration}</span>
            </div>
          </div>
        </div>
        <Button size="sm" onClick={openCreateModuleDialog} className="bg-primary hover:bg-primary/90 shrink-0">
          <Plus className="h-4 w-4 mr-1.5" /> Add Module
        </Button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : modules.length === 0 ? (
        <Card className="border-border/50">
          <CardContent className="p-12 text-center">
            <FolderOpen className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">No Modules Yet</h3>
            <p className="text-muted-foreground mb-4">Add modules to organize your course content.</p>
            <Button onClick={openCreateModuleDialog} className="bg-primary hover:bg-primary/90">
              <Plus className="h-4 w-4 mr-1.5" /> Add First Module
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {modules.map((mod, idx) => (
            <Card key={mod.id} className="border-border/50">
              <CardContent className="p-0">
                {/* Module Header */}
                <div
                  className="flex items-center gap-3 p-4 cursor-pointer hover:bg-muted/30 transition-colors"
                  onClick={() => setExpandedModuleId(expandedModuleId === mod.id ? null : mod.id)}
                >
                  <ChevronDown className={`h-5 w-5 text-muted-foreground transition-transform ${expandedModuleId === mod.id ? '' : '-rotate-90'}`} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium text-muted-foreground">Module {idx + 1}</span>
                      <h3 className="font-semibold text-foreground truncate">{mod.title}</h3>
                    </div>
                    <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1"><FileText className="h-3 w-3" /> {mod.lessons.length} lessons</span>
                      <span className="flex items-center gap-1"><HelpCircle className="h-3 w-3" /> {mod.quizzes.length} quizzes</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEditModuleDialog(mod)}>
                      <Edit className="h-3.5 w-3.5" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive" onClick={() => handleDeleteModule(mod.id)}>
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>

                {/* Module Content (Expanded) */}
                {expandedModuleId === mod.id && (
                  <div className="border-t border-border/50 p-4 space-y-4">
                    {/* Lessons */}
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
                          <BookOpen className="h-4 w-4 text-primary" /> Lessons
                        </h4>
                        <Button variant="outline" size="sm" onClick={() => openCreateLessonDialog(mod.id)}>
                          <Plus className="h-3.5 w-3.5 mr-1" /> Add Lesson
                        </Button>
                      </div>
                      {mod.lessons.length === 0 ? (
                        <p className="text-sm text-muted-foreground py-3 text-center">No lessons yet. Add your first lesson.</p>
                      ) : (
                        <div className="space-y-2">
                          {mod.lessons.map((lesson, lIdx) => (
                            <div key={lesson.id} className="flex items-center gap-3 p-3 rounded-lg border border-border/50 bg-muted/20">
                              <span className="text-xs text-muted-foreground font-medium w-6 text-center">{lIdx + 1}</span>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-foreground truncate">{lesson.title}</p>
                                <div className="flex items-center gap-2 mt-1">
                                  <div className="flex items-center gap-1">{getLessonContentIcons(lesson)}</div>
                                  <span className="text-[10px] text-muted-foreground">{lesson.duration}</span>
                                </div>
                              </div>
                              <div className="flex items-center gap-1">
                                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEditLessonDialog(mod.id, lesson)}>
                                  <Edit className="h-3.5 w-3.5" />
                                </Button>
                                <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive" onClick={() => handleDeleteLesson(lesson.id)}>
                                  <Trash2 className="h-3.5 w-3.5" />
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Module Quizzes */}
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
                          <HelpCircle className="h-4 w-4 text-amber-600" /> Module Quizzes
                        </h4>
                        <Button variant="outline" size="sm" onClick={() => openCreateQuizDialog(mod.id, false)}>
                          <Plus className="h-3.5 w-3.5 mr-1" /> Add Module Quiz
                        </Button>
                      </div>
                      {mod.quizzes.filter((q) => !q.isFinalExam).length === 0 ? (
                        <p className="text-sm text-muted-foreground py-2">No practice quizzes for this module.</p>
                      ) : (
                        <div className="space-y-2">
                          {mod.quizzes.filter((q) => !q.isFinalExam).map((quiz) => (
                            <div key={quiz.id} className="flex items-center gap-3 p-3 rounded-lg border border-border/50 bg-muted/20">
                              <HelpCircle className="h-4 w-4 text-amber-600 shrink-0" />
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-foreground">{quiz.title}</p>
                                <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                                  <span>{quiz._count.questions} questions</span>
                                  <span>{quiz.timeLimit} min</span>
                                  <span>{quiz.passingScore}% to pass</span>
                                </div>
                              </div>
                              <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive" onClick={() => handleDeleteQuiz(quiz.id)}>
                                <Trash2 className="h-3.5 w-3.5" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}

          {/* Final Exam Section */}
          <Card className="border-border/50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                  <GraduationCap className="h-4 w-4 text-primary" /> Final Exam
                </h3>
                {modules.length > 0 && (
                  <Button variant="outline" size="sm" onClick={() => openCreateQuizDialog(modules[modules.length - 1].id, true)}>
                    <Plus className="h-3.5 w-3.5 mr-1" /> Create Final Exam
                  </Button>
                )}
              </div>
              {finalExams.length === 0 ? (
                <p className="text-sm text-muted-foreground py-2 text-center">No final exam created for this course yet.</p>
              ) : (
                <div className="space-y-2">
                  {finalExams.map((quiz) => (
                    <div key={quiz.id} className="flex items-center gap-3 p-3 rounded-lg border border-primary/20 bg-primary/5">
                      <GraduationCap className="h-5 w-5 text-primary shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground">{quiz.title}</p>
                        <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                          <span>{quiz._count.questions} questions</span>
                          <span>{quiz.timeLimit} min</span>
                          <span>{quiz.passingScore}% to pass</span>
                          <span>{quiz.maxAttempts} attempt{quiz.maxAttempts > 1 ? 's' : ''}</span>
                        </div>
                      </div>
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive" onClick={() => handleDeleteQuiz(quiz.id)}>
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Create/Edit Module Dialog */}
      <Dialog open={showModuleDialog} onOpenChange={setShowModuleDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{editingModule ? 'Edit Module' : 'Create Module'}</DialogTitle>
            <DialogDescription>
              {editingModule ? 'Update the module details.' : 'Add a new module to organize your course content.'}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="module-title">Title *</Label>
              <Input
                id="module-title"
                value={moduleTitle}
                onChange={(e) => setModuleTitle(e.target.value)}
                placeholder="e.g. Introduction to Leadership"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="module-desc">Description</Label>
              <Textarea
                id="module-desc"
                value={moduleDescription}
                onChange={(e) => setModuleDescription(e.target.value)}
                placeholder="Brief description of this module"
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button className="bg-primary hover:bg-primary/90" onClick={handleSaveModule} disabled={!moduleTitle || moduleSaving}>
              {moduleSaving ? <Loader2 className="h-4 w-4 animate-spin mr-1.5" /> : <Plus className="h-4 w-4 mr-1.5" />}
              {editingModule ? 'Save Changes' : 'Create Module'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create/Edit Lesson Dialog */}
      <Dialog open={showLessonDialog} onOpenChange={setShowLessonDialog}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingLesson ? 'Edit Lesson' : 'Create Lesson'}</DialogTitle>
            <DialogDescription>
              {editingLesson ? 'Update the lesson content and settings.' : 'Add a new lesson with any combination of content types.'}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-5 py-4">
            {/* Title & Duration */}
            <div className="grid grid-cols-[1fr_auto] gap-4">
              <div className="grid gap-2">
                <Label htmlFor="lesson-title">Title *</Label>
                <Input
                  id="lesson-title"
                  value={lessonTitle}
                  onChange={(e) => setLessonTitle(e.target.value)}
                  placeholder="e.g. Understanding Grace"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="lesson-duration">Duration</Label>
                <Input
                  id="lesson-duration"
                  value={lessonDuration}
                  onChange={(e) => setLessonDuration(e.target.value)}
                  placeholder="10 min"
                  className="w-24"
                />
              </div>
            </div>

            {/* Notes / Text Content */}
            <div className="grid gap-2">
              <Label className="flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-amber-600" /> Notes / Text Content
              </Label>
              <Textarea
                value={lessonContent}
                onChange={(e) => setLessonContent(e.target.value)}
                placeholder="Main lesson notes and text content..."
                rows={5}
              />
            </div>

            {/* Video */}
            <div className="grid gap-2">
              <Label className="flex items-center gap-2">
                <Video className="h-4 w-4 text-primary" /> Video
              </Label>
              <div className="space-y-2">
                {lessonVideoFile ? (
                  <div className="relative rounded-lg overflow-hidden border border-border/50">
                    <video src={URL.createObjectURL(lessonVideoFile)} className="w-full max-h-40 object-contain bg-black" controls />
                    <button
                      type="button"
                      onClick={() => setLessonVideoFile(null)}
                      className="absolute top-2 right-2 p-1 rounded-full bg-black/50 text-white hover:bg-destructive"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ) : lessonVideoUrl ? (
                  <div className="relative rounded-lg overflow-hidden border border-border/50">
                    <video src={lessonVideoUrl} className="w-full max-h-40 object-contain bg-black" controls />
                    <button
                      type="button"
                      onClick={() => setLessonVideoUrl('')}
                      className="absolute top-2 right-2 p-1 rounded-full bg-black/50 text-white hover:bg-destructive"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed border-border/50 rounded-lg cursor-pointer hover:border-primary/50 hover:bg-primary/5 transition-colors">
                    <Video className="h-6 w-6 text-muted-foreground mb-1" />
                    <span className="text-xs text-muted-foreground">Upload video</span>
                    <span className="text-[10px] text-muted-foreground">MP4, WebM, MOV — max 200MB</span>
                    <input
                      type="file"
                      accept="video/*"
                      className="hidden"
                      onChange={(e) => {
                        const f = e.target.files?.[0]
                        if (f) setLessonVideoFile(f)
                      }}
                    />
                  </label>
                )}
                <Input
                  placeholder="Or paste video URL..."
                  value={lessonVideoFile ? '' : lessonVideoUrl}
                  onChange={(e) => { setLessonVideoFile(null); setLessonVideoUrl(e.target.value) }}
                  disabled={!!lessonVideoFile}
                />
              </div>
            </div>

            {/* Audio */}
            <div className="grid gap-2">
              <Label className="flex items-center gap-2">
                <Headphones className="h-4 w-4 text-emerald-600" /> Audio
              </Label>
              <Input
                placeholder="Paste audio URL or embed code..."
                value={lessonAudioUrl}
                onChange={(e) => setLessonAudioUrl(e.target.value)}
              />
            </div>

            {/* Code Snippet */}
            <div className="grid gap-2">
              <Label className="flex items-center gap-2">
                <Code className="h-4 w-4 text-violet-600" /> Code Snippet
              </Label>
              <Textarea
                value={lessonCodeSnippet}
                onChange={(e) => setLessonCodeSnippet(e.target.value)}
                placeholder="Paste code snippet for webbook..."
                rows={4}
                className="font-mono text-sm"
              />
            </div>

            {/* PDF */}
            <div className="grid gap-2">
              <Label className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-red-500" /> PDF Document
              </Label>
              <div className="space-y-2">
                {lessonPdfFile ? (
                  <div className="flex items-center gap-2 p-2 rounded-lg border border-border/50 bg-muted/30">
                    <FileUp className="h-5 w-5 text-red-500" />
                    <span className="text-sm text-foreground flex-1 truncate">{lessonPdfFile.name}</span>
                    <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setLessonPdfFile(null)}>
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <label className="flex items-center gap-2 px-3 py-2 border border-dashed border-border/50 rounded-lg cursor-pointer hover:border-primary/50 hover:bg-primary/5 transition-colors">
                      <FileUp className="h-4 w-4 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">Upload PDF</span>
                      <input
                        type="file"
                        accept="application/pdf"
                        className="hidden"
                        onChange={(e) => {
                          const f = e.target.files?.[0]
                          if (f) setLessonPdfFile(f)
                        }}
                      />
                    </label>
                    <span className="text-xs text-muted-foreground">or</span>
                    <Input
                      placeholder="Paste PDF URL..."
                      value={lessonPdfUrl}
                      onChange={(e) => { setLessonPdfFile(null); setLessonPdfUrl(e.target.value) }}
                      className="flex-1"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* ─── Additional Content Types ─── */}
            <Separator className="my-1" />
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Additional Content Types</p>

            {/* Presentation / Slides */}
            <div className="grid gap-2">
              <Label className="flex items-center gap-2">
                <Newspaper className="h-4 w-4 text-orange-500" /> Presentation / Slides
              </Label>
              <div className="space-y-2">
                {lessonPresentationFile ? (
                  <div className="flex items-center gap-2 p-2 rounded-lg border border-border/50 bg-muted/30">
                    <Newspaper className="h-5 w-5 text-orange-500" />
                    <span className="text-sm text-foreground flex-1 truncate">{lessonPresentationFile.name}</span>
                    <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setLessonPresentationFile(null)}>
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <label className="flex items-center gap-2 px-3 py-2 border border-dashed border-border/50 rounded-lg cursor-pointer hover:border-orange-400/50 hover:bg-orange-50 dark:hover:bg-orange-950/20 transition-colors">
                      <Newspaper className="h-4 w-4 text-orange-400" />
                      <span className="text-xs text-muted-foreground">Upload PPT</span>
                      <input
                        type="file"
                        accept=".ppt,.pptx,.odp,application/vnd.ms-powerpoint,application/vnd.openxmlformats-officedocument.presentationml.presentation,application/vnd.oasis.opendocument.presentation"
                        className="hidden"
                        onChange={(e) => {
                          const f = e.target.files?.[0]
                          if (f) setLessonPresentationFile(f)
                        }}
                      />
                    </label>
                    <span className="text-xs text-muted-foreground">or</span>
                    <Input
                      placeholder="Paste Google Slides / SlideShare / PPT URL..."
                      value={lessonPresentationFile ? '' : lessonPresentationUrl}
                      onChange={(e) => { setLessonPresentationFile(null); setLessonPresentationUrl(e.target.value) }}
                      className="flex-1"
                      disabled={!!lessonPresentationFile}
                    />
                  </div>
                )}
                <p className="text-[10px] text-muted-foreground">Supports PPT, PPTX, ODP files or Google Slides / SlideShare links</p>
              </div>
            </div>

            {/* Embedded Content */}
            <div className="grid gap-2">
              <Label className="flex items-center gap-2">
                <Globe className="h-4 w-4 text-sky-600" /> Embedded Content
              </Label>
              <Textarea
                value={lessonEmbedCode}
                onChange={(e) => setLessonEmbedCode(e.target.value)}
                placeholder='Paste iframe or embed code here... e.g. <iframe src="https://..." width="100%" height="400"></iframe>'
                rows={3}
                className="font-mono text-sm"
              />
              <p className="text-[10px] text-muted-foreground">Embed YouTube, Vimeo, Google Docs, Maps, or any iframe content directly into the lesson</p>
            </div>

            {/* External Link / Reference */}
            <div className="grid gap-2">
              <Label className="flex items-center gap-2">
                <ExternalLink className="h-4 w-4 text-teal-600" /> External Link / Reference
              </Label>
              <Input
                placeholder="https://example.com/resource"
                value={lessonExternalUrl}
                onChange={(e) => setLessonExternalUrl(e.target.value)}
              />
              <p className="text-[10px] text-muted-foreground">Link to an external website, article, or reference material</p>
            </div>

            {/* Downloadable Resources */}
            <div className="grid gap-2">
              <Label className="flex items-center gap-2">
                <FileUp className="h-4 w-4 text-indigo-500" /> Downloadable Resources
              </Label>
              <div className="space-y-2">
                {lessonResourceFile ? (
                  <div className="flex items-center gap-2 p-2 rounded-lg border border-border/50 bg-muted/30">
                    <FileUp className="h-5 w-5 text-indigo-500" />
                    <span className="text-sm text-foreground flex-1 truncate">{lessonResourceFile.name}</span>
                    <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setLessonResourceFile(null)}>
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <label className="flex items-center gap-2 px-3 py-2 border border-dashed border-border/50 rounded-lg cursor-pointer hover:border-indigo-400/50 hover:bg-indigo-50 dark:hover:bg-indigo-950/20 transition-colors">
                      <FileUp className="h-4 w-4 text-indigo-400" />
                      <span className="text-xs text-muted-foreground">Upload File</span>
                      <input
                        type="file"
                        accept=".zip,.rar,.7z,.doc,.docx,.xls,.xlsx,.csv,.ppt,.pptx,.pdf,application/zip,application/x-zip-compressed,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                        className="hidden"
                        onChange={(e) => {
                          const f = e.target.files?.[0]
                          if (f) setLessonResourceFile(f)
                        }}
                      />
                    </label>
                    <span className="text-xs text-muted-foreground">or</span>
                    <Input
                      placeholder="Paste resource URL..."
                      value={lessonResourceFile ? '' : lessonResourceUrl}
                      onChange={(e) => { setLessonResourceFile(null); setLessonResourceUrl(e.target.value) }}
                      className="flex-1"
                      disabled={!!lessonResourceFile}
                    />
                  </div>
                )}
                <p className="text-[10px] text-muted-foreground">Templates, workbooks, spreadsheets, ZIP packages — any supplementary file students can download</p>
              </div>
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button className="bg-primary hover:bg-primary/90" onClick={handleSaveLesson} disabled={!lessonTitle || lessonSaving}>
              {lessonSaving ? <Loader2 className="h-4 w-4 animate-spin mr-1.5" /> : <Plus className="h-4 w-4 mr-1.5" />}
              {editingLesson ? 'Save Changes' : 'Create Lesson'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create Quiz Dialog */}
      <Dialog open={showQuizDialog} onOpenChange={setShowQuizDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{quizIsFinal ? 'Create Final Exam' : 'Create Module Quiz'}</DialogTitle>
            <DialogDescription>
              {quizIsFinal ? 'Set up the final exam for this course.' : 'Add a practice quiz for this module.'}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="quiz-title">Title *</Label>
              <Input
                id="quiz-title"
                value={quizTitle}
                onChange={(e) => setQuizTitle(e.target.value)}
                placeholder="e.g. Module 1 Quiz"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="quiz-desc">Description</Label>
              <Textarea
                id="quiz-desc"
                value={quizDescription}
                onChange={(e) => setQuizDescription(e.target.value)}
                placeholder="Brief description of this quiz"
                rows={2}
              />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="quiz-time">Time (min)</Label>
                <Input
                  id="quiz-time"
                  type="number"
                  value={quizTimeLimit}
                  onChange={(e) => setQuizTimeLimit(parseInt(e.target.value) || 30)}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="quiz-pass">Pass %</Label>
                <Input
                  id="quiz-pass"
                  type="number"
                  value={quizPassingScore}
                  onChange={(e) => setQuizPassingScore(parseInt(e.target.value) || 70)}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="quiz-attempts">Attempts</Label>
                <Input
                  id="quiz-attempts"
                  type="number"
                  value={quizMaxAttempts}
                  onChange={(e) => setQuizMaxAttempts(parseInt(e.target.value) || 3)}
                />
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              You can add questions to this quiz later from the Quizzes &amp; Exams section.
            </p>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button className="bg-primary hover:bg-primary/90" onClick={handleCreateQuiz} disabled={!quizTitle || quizSaving}>
              {quizSaving ? <Loader2 className="h-4 w-4 animate-spin mr-1.5" /> : <Plus className="h-4 w-4 mr-1.5" />}
              Create {quizIsFinal ? 'Final Exam' : 'Quiz'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

// ===================== STUDENTS SECTION =====================
function StudentsSection({ data, onRefresh }: { data: InstructorData; onRefresh: () => void }) {
  const { navigate, currentUser } = useAppStore()
  const [selectedCourseId, setSelectedCourseId] = useState<string>('all')
  const [expandedStudent, setExpandedStudent] = useState<string | null>(null)
  const [showEnrollDialog, setShowEnrollDialog] = useState(false)
  const [showUnenrollDialog, setShowUnenrollDialog] = useState(false)
  const [unenrollTarget, setUnenrollTarget] = useState<EnrollmentInfo & { courseTitle: string; courseId: string } | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<Array<{ id: string; name: string | null; email: string; avatar: string | null }>>([])
  const [searching, setSearching] = useState(false)
  const [enrolling, setEnrolling] = useState(false)
  const [unenrolling, setUnenrolling] = useState(false)
  const [enrollCourseId, setEnrollCourseId] = useState<string>('')

  const filteredCourses =
    selectedCourseId === 'all'
      ? data.courses
      : data.courses.filter((c) => c.id === selectedCourseId)

  const allEnrollments = filteredCourses.flatMap((c) =>
    c.enrollments.map((e) => ({
      ...e,
      courseTitle: c.title,
      courseId: c.id,
    }))
  )

  const handleSearchStudents = async () => {
    if (!searchQuery || searchQuery.length < 2) return
    setSearching(true)
    try {
      const res = await fetch(`/api/users/search?q=${encodeURIComponent(searchQuery)}&role=student&instructorId=${currentUser?.id || ''}`)
      if (res.ok) {
        const results = await res.json()
        setSearchResults(results)
      }
    } catch (err) {
      console.error('Error searching students:', err)
    } finally {
      setSearching(false)
    }
  }

  const handleEnrollStudent = async (studentId: string) => {
    if (!currentUser || !enrollCourseId) return
    setEnrolling(true)
    try {
      const res = await fetch('/api/enroll', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'enroll-student',
          userId: studentId,
          courseId: enrollCourseId,
          instructorId: currentUser.id,
        }),
      })
      if (res.ok) {
        setShowEnrollDialog(false)
        setSearchQuery('')
        setSearchResults([])
        setEnrollCourseId('')
        onRefresh()
      } else {
        const err = await res.json()
        console.error('Error enrolling student:', err.error)
      }
    } catch (err) {
      console.error('Error enrolling student:', err)
    } finally {
      setEnrolling(false)
    }
  }

  const handleUnenrollStudent = async () => {
    if (!unenrollTarget || !currentUser) return
    setUnenrolling(true)
    try {
      const res = await fetch('/api/enroll', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'unenroll-student',
          enrollmentId: unenrollTarget.id,
          instructorId: currentUser.id,
        }),
      })
      if (res.ok) {
        setShowUnenrollDialog(false)
        setUnenrollTarget(null)
        onRefresh()
      }
    } catch (err) {
      console.error('Error unenrolling student:', err)
    } finally {
      setUnenrolling(false)
    }
  }

  const openEnrollDialog = () => {
    setEnrollCourseId(selectedCourseId === 'all' && data.courses.length > 0 ? data.courses[0].id : selectedCourseId)
    setSearchQuery('')
    setSearchResults([])
    setShowEnrollDialog(true)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Students</h1>
          <p className="text-muted-foreground mt-1">View and manage student enrollments</p>
        </div>
        <div className="flex items-center gap-3">
          <Select value={selectedCourseId} onValueChange={setSelectedCourseId}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Select Course" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Courses</SelectItem>
              {data.courses.map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button className="bg-primary hover:bg-primary/90" size="sm" onClick={openEnrollDialog}>
            <Plus className="h-4 w-4 mr-1.5" /> Enroll Student
          </Button>
        </div>
      </div>

      {/* Enroll Student Dialog */}
      <Dialog open={showEnrollDialog} onOpenChange={setShowEnrollDialog}>
        <DialogContent className="sm:max-w-[525px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Enroll Student</DialogTitle>
            <DialogDescription>Search for a student and enroll them in a course.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>Course *</Label>
              <Select value={enrollCourseId} onValueChange={setEnrollCourseId}>
                <SelectTrigger><SelectValue placeholder="Select Course" /></SelectTrigger>
                <SelectContent>
                  {data.courses.map(c => <SelectItem key={c.id} value={c.id}>{c.title}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label>Search Student by Name or Email</Label>
              <div className="flex gap-2">
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Type at least 2 characters..."
                  onKeyDown={(e) => { if (e.key === 'Enter') handleSearchStudents() }}
                />
                <Button variant="outline" onClick={handleSearchStudents} disabled={searching || searchQuery.length < 2}>
                  {searching ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Search'}
                </Button>
              </div>
            </div>
            {searchResults.length > 0 && (
              <div className="space-y-2 max-h-60 overflow-y-auto">
                <Label className="text-xs text-muted-foreground">Found {searchResults.length} student(s) — Click to enroll</Label>
                {searchResults.map(student => (
                  <div
                    key={student.id}
                    className="flex items-center gap-3 p-3 rounded-lg border border-border/50 hover:border-primary/20 cursor-pointer transition-colors"
                    onClick={() => handleEnrollStudent(student.id)}
                  >
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-primary/10 text-primary text-xs">
                        {(student.name || 'U').split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground">{student.name || 'Unknown'}</p>
                      <p className="text-xs text-muted-foreground">{student.email}</p>
                    </div>
                    {enrolling ? (
                      <Loader2 className="h-4 w-4 animate-spin text-primary" />
                    ) : (
                      <Plus className="h-4 w-4 text-primary" />
                    )}
                  </div>
                ))}
              </div>
            )}
            {searchQuery.length >= 2 && searchResults.length === 0 && !searching && (
              <p className="text-sm text-muted-foreground text-center py-3">No students found. Try a different search.</p>
            )}
          </div>
          <DialogFooter>
            <DialogClose asChild><Button variant="outline">Close</Button></DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Unenroll Confirmation Dialog */}
      <Dialog open={showUnenrollDialog} onOpenChange={setShowUnenrollDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Unenroll Student</DialogTitle>
            <DialogDescription>
              Are you sure you want to unenroll {unenrollTarget?.user.name}? This should only be used for discipline issues. The student&apos;s enrollment will be suspended.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            {unenrollTarget && (
              <div className="p-3 rounded-lg bg-destructive/5 border border-destructive/20">
                <p className="text-sm font-medium text-foreground">{unenrollTarget.user.name}</p>
                <p className="text-xs text-muted-foreground">{unenrollTarget.user.email} · {unenrollTarget.courseTitle}</p>
                <p className="text-xs text-muted-foreground mt-1">Progress: {Math.round(unenrollTarget.progress)}% · Grade: {Math.round(unenrollTarget.overallGrade)}%</p>
              </div>
            )}
          </div>
          <DialogFooter>
            <DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose>
            <Button
              variant="destructive"
              onClick={handleUnenrollStudent}
              disabled={unenrolling}
            >
              {unenrolling ? <Loader2 className="h-4 w-4 animate-spin mr-1.5" /> : <X className="h-4 w-4 mr-1.5" />}
              Unenroll Student
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Card className="border-border/50">
        <CardContent className="p-0">
          {allEnrollments.length === 0 ? (
            <div className="p-12 text-center">
              <Users className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">No Students</h3>
              <p className="text-muted-foreground">No students enrolled in this course yet.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student</TableHead>
                    <TableHead>Course</TableHead>
                    <TableHead>Progress</TableHead>
                    <TableHead>Grade</TableHead>
                    <TableHead>Letter</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Last Accessed</TableHead>
                    <TableHead className="w-[50px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {allEnrollments.map((enr) => (
                    <>
                      <TableRow
                        key={enr.id}
                        className="cursor-pointer hover:bg-muted/50"
                        onClick={() =>
                          setExpandedStudent(expandedStudent === enr.id ? null : enr.id)
                        }
                      >
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Avatar className="h-8 w-8">
                              <AvatarImage src={enr.user.avatar || undefined} />
                              <AvatarFallback className="bg-primary/10 text-primary text-xs">
                                {enr.user.name
                                  .split(' ')
                                  .map((n: string) => n[0])
                                  .join('')
                                  .toUpperCase()
                                  .slice(0, 2)}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="text-sm font-medium text-foreground">
                                {enr.user.name}
                              </p>
                              <p className="text-xs text-muted-foreground">{enr.user.email}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <p className="text-sm text-foreground truncate max-w-[150px]">
                            {enr.courseTitle}
                          </p>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2 min-w-[100px]">
                            <Progress value={enr.progress} className="h-1.5 flex-1" />
                            <span className="text-xs text-muted-foreground w-8">
                              {Math.round(enr.progress)}%
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span
                            className={`text-sm font-medium ${getGradeColor(enr.overallGrade)}`}
                          >
                            {enr.overallGrade > 0 ? `${Math.round(enr.overallGrade)}%` : '-'}
                          </span>
                        </TableCell>
                        <TableCell>
                          {enr.letterGrade ? (
                            <Badge variant={getGradeBadgeVariant(enr.overallGrade)} className="text-xs">
                              {enr.letterGrade}
                            </Badge>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={enr.status === 'completed' ? 'default' : enr.status === 'suspended' ? 'destructive' : 'secondary'}
                            className="text-[10px]"
                          >
                            {enr.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <span className="text-xs text-muted-foreground">
                            {formatTimeAgo(enr.lastAccessedAt)}
                          </span>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <ChevronRight
                              className={`h-4 w-4 text-muted-foreground transition-transform ${
                                expandedStudent === enr.id ? 'rotate-90' : ''
                              }`}
                            />
                            {enr.status === 'active' && (
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6 text-destructive hover:text-destructive hover:bg-destructive/10"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  setUnenrollTarget(enr)
                                  setShowUnenrollDialog(true)
                                }}
                                title="Unenroll Student"
                              >
                                <X className="h-3.5 w-3.5" />
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                      {expandedStudent === enr.id && (
                        <TableRow key={`${enr.id}-detail`}>
                          <TableCell colSpan={8} className="bg-muted/30 p-4">
                            <div className="flex flex-wrap items-center gap-3">
                              <div className="text-sm">
                                <span className="text-muted-foreground">Quiz Attempts:</span>{' '}
                                <span className="font-medium">{enr._count.quizAttempts}</span>
                              </div>
                              <div className="text-sm">
                                <span className="text-muted-foreground">Lessons Accessed:</span>{' '}
                                <span className="font-medium">{enr._count.lessonProgress}</span>
                              </div>
                              {enr.certificate && (
                                <div className="text-sm">
                                  <span className="text-muted-foreground">Certificate:</span>{' '}
                                  <Badge variant="outline" className="text-xs font-mono">
                                    {enr.certificate.certificateNumber}
                                  </Badge>
                                </div>
                              )}
                              <Button
                                variant="outline"
                                size="sm"
                                className="ml-auto"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  navigate('chat', {
                                    chatInstructorId: currentUser?.id,
                                    chatStudentId: enr.user.id,
                                    courseId: enr.courseId,
                                  })
                                }}
                              >
                                <MessageCircle className="h-3.5 w-3.5 mr-1.5" />
                                Chat with Student
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      )}
                    </>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

// ===================== GRADING SECTION =====================
function GradingSection({
  data,
  onGradeSubmitted,
}: {
  data: InstructorData
  onGradeSubmitted: () => void
}) {
  const [expandedSubmission, setExpandedSubmission] = useState<string | null>(null)
  const [gradeScore, setGradeScore] = useState('')
  const [gradeFeedback, setGradeFeedback] = useState('')
  const [gradingId, setGradingId] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState('pending')
  const { currentUser } = useAppStore()

  const handleGrade = async (submissionId: string, assignmentId: string) => {
    if (!gradeScore || !currentUser) return
    setGradingId(submissionId)
    try {
      const res = await fetch(`/api/assignments/${assignmentId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'grade',
          submissionId,
          score: Number(gradeScore),
          feedback: gradeFeedback,
          graderId: currentUser.id,
        }),
      })
      if (res.ok) {
        setGradeScore('')
        setGradeFeedback('')
        setExpandedSubmission(null)
        onGradeSubmitted()
      }
    } catch (error) {
      console.error('Error grading submission:', error)
    } finally {
      setGradingId(null)
    }
  }

  const submissions =
    activeTab === 'pending' ? data.pendingSubmissions : data.gradedSubmissions

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Grading</h1>
        <p className="text-muted-foreground mt-1">Grade and review student submissions</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="pending" className="gap-1.5">
            <AlertCircle className="h-4 w-4" />
            Pending
            {data.pendingSubmissions.length > 0 && (
              <Badge className="bg-amber-100 text-amber-800 text-[10px] ml-1 px-1.5 py-0">
                {data.pendingSubmissions.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="graded" className="gap-1.5">
            <CheckCircle className="h-4 w-4" />
            Graded
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="mt-4 space-y-3">
          {data.pendingSubmissions.length === 0 ? (
            <Card className="border-border/50">
              <CardContent className="p-12 text-center">
                <CheckCircle className="h-12 w-12 text-emerald-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  All Submissions Graded
                </h3>
                <p className="text-muted-foreground">No pending submissions to review.</p>
              </CardContent>
            </Card>
          ) : (
            data.pendingSubmissions.map((sub) => {
              const isExpanded = expandedSubmission === sub.id
              return (
                <Card
                  key={sub.id}
                  className={`border-border/50 transition-all ${
                    isExpanded ? 'border-primary/20' : ''
                  }`}
                >
                  <CardContent className="p-4">
                    <div
                      className="cursor-pointer"
                      onClick={() => {
                        setExpandedSubmission(isExpanded ? null : sub.id)
                        if (!isExpanded) {
                          setGradeScore('')
                          setGradeFeedback('')
                        }
                      }}
                    >
                      <div className="flex items-start gap-4">
                        <Avatar className="h-10 w-10 shrink-0">
                          <AvatarImage src={sub.user.avatar || undefined} />
                          <AvatarFallback className="bg-primary/10 text-primary text-xs">
                            {sub.user.name
                              .split(' ')
                              .map((n: string) => n[0])
                              .join('')
                              .toUpperCase()
                              .slice(0, 2)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-sm font-semibold text-foreground">
                              {sub.user.name}
                            </span>
                            <Badge className="bg-amber-100 text-amber-800 text-[10px]">
                              Pending
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {sub.assignment.title}
                          </p>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {sub.assignment.module.course.title} · Submitted{' '}
                            {formatTimeAgo(sub.submittedAt)}
                          </p>
                          {!isExpanded && sub.content && (
                            <p className="text-xs text-muted-foreground mt-2 line-clamp-2">
                              {sub.content}
                            </p>
                          )}
                        </div>
                        <ChevronRight
                          className={`h-5 w-5 text-muted-foreground transition-transform shrink-0 ${
                            isExpanded ? 'rotate-90' : ''
                          }`}
                        />
                      </div>
                    </div>

                    {isExpanded && (
                      <div className="mt-4 pt-4 border-t border-border/50 space-y-4">
                        {/* Full Content */}
                        <div>
                          <h4 className="text-sm font-medium text-foreground mb-2">
                            Submission Content
                          </h4>
                          <div className="p-3 rounded-lg bg-muted/50 text-sm text-foreground whitespace-pre-wrap max-h-60 overflow-y-auto">
                            {sub.content || (
                              <span className="text-muted-foreground italic">
                                No written content submitted
                              </span>
                            )}
                          </div>
                          {sub.fileUrl && (
                            <a
                              href={sub.fileUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs text-primary hover:underline mt-2 inline-block"
                            >
                              📎 View attached file
                            </a>
                          )}
                        </div>

                        {/* Grade Form */}
                        <div className="flex flex-col sm:flex-row gap-4">
                          <div className="w-full sm:w-40">
                            <label className="text-sm font-medium text-foreground mb-1.5 block">
                              Score (0-100)
                            </label>
                            <Input
                              type="number"
                              min="0"
                              max="100"
                              placeholder="0-100"
                              value={gradeScore}
                              onChange={(e) => setGradeScore(e.target.value)}
                            />
                          </div>
                          <div className="flex-1">
                            <label className="text-sm font-medium text-foreground mb-1.5 block">
                              Feedback
                            </label>
                            <Textarea
                              placeholder="Provide feedback for the student..."
                              value={gradeFeedback}
                              onChange={(e) => setGradeFeedback(e.target.value)}
                              rows={2}
                            />
                          </div>
                        </div>
                        <div className="flex justify-end">
                          <Button
                            className="bg-primary hover:bg-primary/90"
                            disabled={!gradeScore || gradingId === sub.id}
                            onClick={() => handleGrade(sub.id, sub.assignmentId)}
                          >
                            {gradingId === sub.id ? (
                              <Loader2 className="h-4 w-4 mr-1.5 animate-spin" />
                            ) : (
                              <Send className="h-4 w-4 mr-1.5" />
                            )}
                            Submit Grade
                          </Button>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )
            })
          )}
        </TabsContent>

        <TabsContent value="graded" className="mt-4 space-y-3">
          {data.gradedSubmissions.length === 0 ? (
            <Card className="border-border/50">
              <CardContent className="p-12 text-center">
                <ClipboardCheck className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  No Graded Submissions
                </h3>
                <p className="text-muted-foreground">
                  Graded submissions will appear here.
                </p>
              </CardContent>
            </Card>
          ) : (
            data.gradedSubmissions.map((sub) => (
              <Card key={sub.id} className="border-border/50">
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    <Avatar className="h-10 w-10 shrink-0">
                      <AvatarImage src={sub.user.avatar || undefined} />
                      <AvatarFallback className="bg-primary/10 text-primary text-xs">
                        {sub.user.name
                          .split(' ')
                          .map((n: string) => n[0])
                          .join('')
                          .toUpperCase()
                          .slice(0, 2)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-semibold text-foreground">
                          {sub.user.name}
                        </span>
                        <Badge className="bg-emerald-100 text-emerald-800 text-[10px]">Graded</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{sub.assignment.title}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {sub.assignment.module.course.title}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <p
                        className={`text-lg font-bold ${
                          sub.score !== null && sub.score >= 70
                            ? 'text-emerald-600'
                            : 'text-destructive'
                        }`}
                      >
                        {sub.score !== null ? `${Math.round(sub.score)}%` : '-'}
                      </p>
                      {sub.score !== null && (
                        <Badge
                          variant={getGradeBadgeVariant(sub.score)}
                          className="text-[10px]"
                        >
                          {calculateLetterGrade(sub.score)}
                        </Badge>
                      )}
                    </div>
                  </div>
                  {sub.feedback && (
                    <div className="mt-3 p-3 rounded-lg bg-muted/50">
                      <p className="text-xs text-muted-foreground mb-1">Feedback:</p>
                      <p className="text-sm text-foreground">{sub.feedback}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}

// ===================== LIBRARY SECTION =====================
interface LibraryResource {
  id: string
  title: string
  description: string | null
  type: string
  url: string | null
  coverImage: string | null
  author: string | null
  courseId: string | null
  uploadedBy: string
  createdAt: string
  course: { id: string; title: string; category: string } | null
  uploader: { id: string; name: string; email: string }
}

function LibrarySection({ data }: { data: InstructorData }) {
  const { currentUser } = useAppStore()
  const [resources, setResources] = useState<LibraryResource[]>([])
  const [loading, setLoading] = useState(true)
  const [showUploadDialog, setShowUploadDialog] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [newResource, setNewResource] = useState({
    title: '',
    description: '',
    type: 'book',
    author: '',
    url: '',
    coverImage: '',
    courseId: '',
  })

  const fetchResources = useCallback(async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/library')
      if (res.ok) {
        const data = await res.json()
        setResources(data)
      }
    } catch (err) {
      console.error('Error fetching library resources:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchResources()
  }, [fetchResources])

  const handleUpload = async () => {
    if (!newResource.title || !newResource.url || !currentUser) return
    setUploading(true)
    try {
      const res = await fetch('/api/library', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'create',
          title: newResource.title,
          description: newResource.description || undefined,
          type: newResource.type,
          author: newResource.author || undefined,
          url: newResource.url,
          coverImage: newResource.coverImage || undefined,
          courseId: newResource.courseId && newResource.courseId !== 'none' ? newResource.courseId : undefined,
          uploadedBy: currentUser.id,
        }),
      })
      if (res.ok) {
        setShowUploadDialog(false)
        setNewResource({ title: '', description: '', type: 'book', author: '', url: '', coverImage: '', courseId: '' })
        fetchResources()
      }
    } catch (err) {
      console.error('Error uploading resource:', err)
    } finally {
      setUploading(false)
    }
  }

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch('/api/library', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'delete', id }),
      })
      if (res.ok) {
        fetchResources()
      }
    } catch (err) {
      console.error('Error deleting resource:', err)
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'video': return <Video className="h-5 w-5" />
      case 'audio': return <Headphones className="h-5 w-5" />
      case 'article': return <Newspaper className="h-5 w-5" />
      case 'document': return <FileText className="h-5 w-5" />
      default: return <BookOpen className="h-5 w-5" />
    }
  }

  const getTypeBadgeColor = (type: string) => {
    switch (type) {
      case 'video': return 'bg-rose-100 text-rose-700'
      case 'audio': return 'bg-violet-100 text-violet-700'
      case 'article': return 'bg-emerald-100 text-emerald-700'
      case 'document': return 'bg-sky-100 text-sky-700'
      default: return 'bg-amber-100 text-amber-700'
    }
  }

  const getTypeBgColor = (type: string) => {
    switch (type) {
      case 'video': return 'bg-rose-50'
      case 'audio': return 'bg-violet-50'
      case 'article': return 'bg-emerald-50'
      case 'document': return 'bg-sky-50'
      default: return 'bg-amber-50'
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Library</h1>
          <p className="text-muted-foreground mt-1">Manage digital library resources for your courses</p>
        </div>
        <Button
          className="bg-primary hover:bg-primary/90"
          size="sm"
          onClick={() => setShowUploadDialog(true)}
        >
          <Plus className="h-4 w-4 mr-1.5" />
          Upload Resource
        </Button>
      </div>

      {/* Upload Resource Dialog */}
      <Dialog open={showUploadDialog} onOpenChange={setShowUploadDialog}>
        <DialogContent className="sm:max-w-[525px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Upload Resource</DialogTitle>
            <DialogDescription>Add a new resource to the digital library.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="res-title">Title *</Label>
              <Input
                id="res-title"
                value={newResource.title}
                onChange={(e) => setNewResource({ ...newResource, title: e.target.value })}
                placeholder="Resource title"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="res-desc">Description</Label>
              <Textarea
                id="res-desc"
                value={newResource.description}
                onChange={(e) => setNewResource({ ...newResource, description: e.target.value })}
                placeholder="Brief description of this resource"
                rows={2}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Type</Label>
                <Select value={newResource.type} onValueChange={(v) => setNewResource({ ...newResource, type: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="book">Book</SelectItem>
                    <SelectItem value="article">Article</SelectItem>
                    <SelectItem value="video">Video</SelectItem>
                    <SelectItem value="audio">Audio</SelectItem>
                    <SelectItem value="document">Document</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="res-author">Author</Label>
                <Input
                  id="res-author"
                  value={newResource.author}
                  onChange={(e) => setNewResource({ ...newResource, author: e.target.value })}
                  placeholder="Author name"
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="res-url">URL *</Label>
              <Input
                id="res-url"
                value={newResource.url}
                onChange={(e) => setNewResource({ ...newResource, url: e.target.value })}
                placeholder="https://..."
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="res-cover">Cover Image URL</Label>
                <Input
                  id="res-cover"
                  value={newResource.coverImage}
                  onChange={(e) => setNewResource({ ...newResource, coverImage: e.target.value })}
                  placeholder="https://..."
                />
              </div>
              <div className="grid gap-2">
                <Label>Course</Label>
                <Select value={newResource.courseId} onValueChange={(v) => setNewResource({ ...newResource, courseId: v })}>
                  <SelectTrigger><SelectValue placeholder="None" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No Course</SelectItem>
                    {data.courses.map((c) => (
                      <SelectItem key={c.id} value={c.id}>{c.title}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button
              className="bg-primary hover:bg-primary/90"
              onClick={handleUpload}
              disabled={!newResource.title || !newResource.url || uploading}
            >
              {uploading ? <Loader2 className="h-4 w-4 animate-spin mr-1.5" /> : <Plus className="h-4 w-4 mr-1.5" />}
              Upload
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Resources Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 text-primary animate-spin" />
        </div>
      ) : resources.length === 0 ? (
        <Card className="border-border/50">
          <CardContent className="p-12 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-100 text-amber-700 mx-auto mb-4">
              <Library className="h-8 w-8" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">No Resources Yet</h3>
            <p className="text-muted-foreground max-w-md mx-auto mb-6">
              Upload your first resource to share with students.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {resources.map((res) => (
            <Card key={res.id} className="border-border/50 overflow-hidden group">
              {/* Cover / Type header */}
              <div className={`h-28 ${getTypeBgColor(res.type)} flex items-center justify-center relative`}>
                {res.coverImage ? (
                  <img src={res.coverImage} alt={res.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="text-muted-foreground/40">
                    {getTypeIcon(res.type)}
                  </div>
                )}
                <Badge className={`absolute top-2 left-2 text-[10px] ${getTypeBadgeColor(res.type)}`}>
                  {res.type}
                </Badge>
                {res.uploadedBy === currentUser?.id && (
                  <button
                    onClick={() => handleDelete(res.id)}
                    className="absolute top-2 right-2 p-1 rounded-md bg-white/80 hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors opacity-0 group-hover:opacity-100"
                    title="Delete resource"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
              <CardContent className="p-4">
                <h4 className="text-sm font-semibold text-foreground truncate mb-1">{res.title}</h4>
                {res.description && (
                  <p className="text-xs text-muted-foreground line-clamp-2 mb-2">{res.description}</p>
                )}
                <div className="flex items-center gap-2 flex-wrap">
                  {res.author && (
                    <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                      <User className="h-3 w-3" />
                      {res.author}
                    </span>
                  )}
                  {res.course && (
                    <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                      <BookOpen className="h-2.5 w-2.5 mr-0.5" />
                      {res.course.title.length > 20 ? res.course.title.slice(0, 20) + '...' : res.course.title}
                    </Badge>
                  )}
                </div>
                {res.url && (
                  <a
                    href={res.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 mt-2 text-xs text-primary hover:underline"
                  >
                    <ArrowRight className="h-3 w-3" />
                    Open Resource
                  </a>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

// ===================== FORUM SECTION =====================
interface ForumPost {
  id: string
  forumId: string
  userId: string
  parentId: string | null
  title: string | null
  content: string
  isPinned: boolean
  isModerated: boolean
  createdAt: string
  updatedAt: string
  user: { id: string; name: string; email: string; avatar: string | null; role: string }
  replies: ForumPost[]
}

interface ForumData {
  id: string
  courseId: string
  title: string
  description: string | null
  posts: ForumPost[]
}

function ForumSection({ data }: { data: InstructorData }) {
  const { currentUser } = useAppStore()
  const [selectedCourseId, setSelectedCourseId] = useState<string>('')
  const [forum, setForum] = useState<ForumData | null>(null)
  const [loading, setLoading] = useState(false)
  const [showPostDialog, setShowPostDialog] = useState(false)
  const [posting, setPosting] = useState(false)
  const [newPost, setNewPost] = useState({ title: '', content: '' })
  const [togglingPinId, setTogglingPinId] = useState<string | null>(null)

  const fetchForum = useCallback(async (courseId: string) => {
    setLoading(true)
    try {
      let res = await fetch(`/api/forums?courseId=${courseId}`)
      if (res.status === 404 && currentUser) {
        // Auto-create forum for instructor
        res = await fetch('/api/forums', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'create',
            courseId,
            title: `${data.courses.find((c) => c.id === courseId)?.title || 'Course'} Discussion Forum`,
            userId: currentUser.id,
          }),
        })
        if (res.ok) {
          res = await fetch(`/api/forums?courseId=${courseId}`)
        }
      }
      if (res.ok) {
        const forumData = await res.json()
        setForum(forumData)
      } else {
        setForum(null)
      }
    } catch (err) {
      console.error('Error fetching forum:', err)
      setForum(null)
    } finally {
      setLoading(false)
    }
  }, [currentUser, data.courses])

  useEffect(() => {
    if (selectedCourseId) {
      fetchForum(selectedCourseId)
    } else {
      setForum(null)
    }
  }, [selectedCourseId, fetchForum])

  const handlePost = async () => {
    if (!newPost.content || !forum || !currentUser) return
    setPosting(true)
    try {
      const res = await fetch('/api/forums', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'post',
          forumId: forum.id,
          userId: currentUser.id,
          title: newPost.title || null,
          content: newPost.content,
        }),
      })
      if (res.ok) {
        setShowPostDialog(false)
        setNewPost({ title: '', content: '' })
        fetchForum(selectedCourseId)
      }
    } catch (err) {
      console.error('Error posting:', err)
    } finally {
      setPosting(false)
    }
  }

  const handleTogglePin = async (postId: string) => {
    if (!currentUser) return
    setTogglingPinId(postId)
    try {
      const res = await fetch('/api/forums', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'pin', postId, userId: currentUser.id }),
      })
      if (res.ok) {
        fetchForum(selectedCourseId)
      }
    } catch (err) {
      console.error('Error toggling pin:', err)
    } finally {
      setTogglingPinId(null)
    }
  }

  const handleToggleModerate = async (postId: string) => {
    if (!currentUser) return
    try {
      const res = await fetch('/api/forums', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'moderate', postId, userId: currentUser.id }),
      })
      if (res.ok) {
        fetchForum(selectedCourseId)
      }
    } catch (err) {
      console.error('Error toggling moderation:', err)
    }
  }

  const getInitials = (name: string) =>
    name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Forum</h1>
          <p className="text-muted-foreground mt-1">Moderate and manage course discussion forums</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-full sm:w-64">
            <Select value={selectedCourseId} onValueChange={setSelectedCourseId}>
              <SelectTrigger>
                <SelectValue placeholder="Select Course" />
              </SelectTrigger>
              <SelectContent>
                {data.courses.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {selectedCourseId && forum && (
            <Button
              className="bg-primary hover:bg-primary/90 shrink-0"
              size="sm"
              onClick={() => setShowPostDialog(true)}
            >
              <Plus className="h-4 w-4 mr-1.5" />
              Post Update
            </Button>
          )}
        </div>
      </div>

      {/* Post Update Dialog */}
      <Dialog open={showPostDialog} onOpenChange={setShowPostDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Post Update</DialogTitle>
            <DialogDescription>Create a new post in the course discussion forum.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="post-title">Title</Label>
              <Input
                id="post-title"
                value={newPost.title}
                onChange={(e) => setNewPost({ ...newPost, title: e.target.value })}
                placeholder="Post title (optional)"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="post-content">Content *</Label>
              <Textarea
                id="post-content"
                value={newPost.content}
                onChange={(e) => setNewPost({ ...newPost, content: e.target.value })}
                placeholder="Share an update, announcement, or discussion topic..."
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button
              className="bg-primary hover:bg-primary/90"
              onClick={handlePost}
              disabled={!newPost.content || posting}
            >
              {posting ? <Loader2 className="h-4 w-4 animate-spin mr-1.5" /> : <Send className="h-4 w-4 mr-1.5" />}
              Post
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* No Course Selected */}
      {!selectedCourseId && (
        <Card className="border-border/50">
          <CardContent className="p-12 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700 mx-auto mb-4">
              <MessageSquare className="h-8 w-8" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">Select a Course</h3>
            <p className="text-muted-foreground max-w-md mx-auto">
              Choose a course above to access and moderate its discussion forum.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Loading */}
      {selectedCourseId && loading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 text-primary animate-spin" />
        </div>
      )}

      {/* No Forum Found */}
      {selectedCourseId && !loading && !forum && (
        <Card className="border-border/50">
          <CardContent className="p-12 text-center">
            <MessageSquare className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">No Forum Found</h3>
            <p className="text-muted-foreground">Could not load the forum for this course.</p>
          </CardContent>
        </Card>
      )}

      {/* Forum Posts */}
      {selectedCourseId && !loading && forum && (
        <div className="space-y-3">
          {forum.posts.length === 0 ? (
            <Card className="border-border/50">
              <CardContent className="p-12 text-center">
                <MessageSquare className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">No Posts Yet</h3>
                <p className="text-muted-foreground mb-4">Be the first to start a discussion!</p>
                <Button
                  className="bg-primary hover:bg-primary/90"
                  size="sm"
                  onClick={() => setShowPostDialog(true)}
                >
                  <Plus className="h-4 w-4 mr-1.5" />
                  Create First Post
                </Button>
              </CardContent>
            </Card>
          ) : (
            forum.posts.map((post) => (
              <Card
                key={post.id}
                className={`border-border/50 ${post.isPinned ? 'border-amber-200 bg-amber-50/30' : ''}`}
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <Avatar className="h-8 w-8 shrink-0">
                      <AvatarImage src={post.user.avatar || undefined} />
                      <AvatarFallback className="bg-primary/10 text-primary text-xs">
                        {getInitials(post.user.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className="text-sm font-medium text-foreground">{post.user.name}</span>
                        {(post.user.role === 'instructor' || post.user.role === 'admin') && (
                          <Badge className="bg-emerald-100 text-emerald-700 text-[10px] px-1.5 py-0">
                            <Shield className="h-2.5 w-2.5 mr-0.5" />
                            {post.user.role}
                          </Badge>
                        )}
                        {post.isPinned && (
                          <Badge className="bg-amber-100 text-amber-700 text-[10px] px-1.5 py-0">
                            <Pin className="h-2.5 w-2.5 mr-0.5" />
                            Pinned
                          </Badge>
                        )}
                        {post.isModerated && (
                          <Badge className="bg-rose-100 text-rose-700 text-[10px] px-1.5 py-0">
                            Moderated
                          </Badge>
                        )}
                        <span className="text-[10px] text-muted-foreground ml-auto">
                          {formatTimeAgo(post.createdAt)}
                        </span>
                      </div>
                      {post.title && (
                        <h4 className="text-sm font-semibold text-foreground mb-1">{post.title}</h4>
                      )}
                      <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                        {post.isModerated && post.user.id !== currentUser?.id
                          ? 'This content has been moderated.'
                          : post.content}
                      </p>

                      {/* Replies */}
                      {post.replies && post.replies.length > 0 && (
                        <div className="mt-3 space-y-2 pl-3 border-l-2 border-border/30">
                          {post.replies.map((reply) => (
                            <div key={reply.id} className="py-2">
                              <div className="flex items-center gap-2 mb-1">
                                <Avatar className="h-5 w-5">
                                  <AvatarImage src={reply.user.avatar || undefined} />
                                  <AvatarFallback className="bg-primary/10 text-primary text-[8px]">
                                    {getInitials(reply.user.name)}
                                  </AvatarFallback>
                                </Avatar>
                                <span className="text-xs font-medium text-foreground">{reply.user.name}</span>
                                {(reply.user.role === 'instructor' || reply.user.role === 'admin') && (
                                  <Badge className="bg-emerald-100 text-emerald-700 text-[8px] px-1 py-0">
                                    {reply.user.role}
                                  </Badge>
                                )}
                                <span className="text-[10px] text-muted-foreground">{formatTimeAgo(reply.createdAt)}</span>
                              </div>
                              <p className="text-xs text-muted-foreground whitespace-pre-wrap ml-7">
                                {reply.isModerated && reply.user.id !== currentUser?.id
                                  ? 'This content has been moderated.'
                                  : reply.content}
                              </p>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Moderation buttons */}
                      <div className="flex items-center gap-2 mt-3">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-xs h-7 px-2"
                          onClick={() => handleTogglePin(post.id)}
                          disabled={togglingPinId === post.id}
                        >
                          {post.isPinned ? (
                            <>
                              <PinOff className="h-3 w-3 mr-1" />
                              Unpin
                            </>
                          ) : (
                            <>
                              <Pin className="h-3 w-3 mr-1" />
                              Pin
                            </>
                          )}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-xs h-7 px-2"
                          onClick={() => handleToggleModerate(post.id)}
                        >
                          {post.isModerated ? 'Unmoderate' : 'Moderate'}
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}
    </div>
  )
}

// ===================== QUIZZES & EXAMS SECTION =====================
interface QuizInfo {
  id: string
  title: string
  description: string | null
  type: string
  isFinalExam: boolean
  timeLimit: number
  passingScore: number
  maxAttempts: number
  order: number
  questions: Array<{
    id: string
    text: string
    type: string
    options: string
    correctAnswer: string
    explanation: string | null
    points: number
    order: number
  }>
  module: { id: string; title: string; courseId: string }
  _count: { questions: number; attempts: number }
}

interface QuizAttemptInfo {
  id: string
  userId: string
  quizId: string
  enrollmentId: string
  score: number
  maxScore: number
  passed: boolean
  timeSpent: number
  letterGrade: string | null
  startedAt: string
  completedAt: string | null
  user: { id: string; name: string; email: string; avatar: string | null }
  quiz: { id: string; title: string; type: string; timeLimit: number; passingScore: number; isFinalExam?: boolean; module: { title: string; courseId: string } }
}

function QuizzesSection({ data, onRefresh }: { data: InstructorData; onRefresh: () => void }) {
  const { currentUser } = useAppStore()
  const [quizzes, setQuizzes] = useState<QuizInfo[]>([])
  const [courseModules, setCourseModules] = useState<Array<{ id: string; title: string; courseId: string; courseTitle: string }>>([])
  const [loading, setLoading] = useState(true)
  const [selectedCourseId, setSelectedCourseId] = useState<string>('all')
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [creating, setCreating] = useState(false)
  const [saving, setSaving] = useState(false)
  const [editQuizData, setEditQuizData] = useState<{
    id: string
    title: string
    description: string
    type: string
    isFinalExam: boolean
    timeLimit: number
    passingScore: number
    maxAttempts: number
    questions: Array<{
      id?: string
      text: string
      type: string
      options: string
      correctAnswer: string
      explanation: string
      points: number
    }>
  }>({
    id: '', title: '', description: '', type: 'practice', isFinalExam: false, timeLimit: 30, passingScore: 70, maxAttempts: 3, questions: []
  })
  const [newQuiz, setNewQuiz] = useState({
    courseId: '',
    moduleId: '',
    title: '',
    description: '',
    type: 'practice',
    isFinalExam: false,
    timeLimit: 30,
    passingScore: 70,
    maxAttempts: 3,
  })
  const [questions, setQuestions] = useState<Array<{
    text: string
    type: string
    options: string
    correctAnswer: string
    explanation: string
    points: number
  }>>([])

  const fetchQuizzes = useCallback(async () => {
    if (data.courses.length === 0) { setLoading(false); return }
    setLoading(true)
    try {
      const courseIds = selectedCourseId === 'all'
        ? data.courses.map(c => c.id)
        : [selectedCourseId]
      const allQuizzes: QuizInfo[] = []
      for (const cid of courseIds) {
        const res = await fetch(`/api/quizzes?courseId=${cid}&role=instructor`)
        if (res.ok) {
          const qz = await res.json()
          allQuizzes.push(...qz)
        }
      }
      setQuizzes(allQuizzes)
    } catch (err) {
      console.error('Error fetching quizzes:', err)
    } finally {
      setLoading(false)
    }
  }, [data.courses, selectedCourseId])

  // Fetch modules for the selected course in create dialog
  const fetchModulesForCourse = useCallback(async (courseId: string) => {
    if (!courseId) { setCourseModules([]); return }
    try {
      const res = await fetch(`/api/modules?courseId=${courseId}`)
      if (res.ok) {
        const mods = await res.json()
        const course = data.courses.find(c => c.id === courseId)
        setCourseModules(mods.map((m: { id: string; title: string }) => ({
          id: m.id,
          title: m.title,
          courseId,
          courseTitle: course?.title || '',
        })))
      }
    } catch (err) {
      console.error('Error fetching modules:', err)
    }
  }, [data.courses])

  useEffect(() => { fetchQuizzes() }, [fetchQuizzes])

  // When course changes in create dialog, load its modules
  useEffect(() => {
    if (newQuiz.courseId) {
      fetchModulesForCourse(newQuiz.courseId)
      setNewQuiz(prev => ({ ...prev, moduleId: '' }))
    } else {
      setCourseModules([])
    }
  }, [newQuiz.courseId, fetchModulesForCourse])

  const handleCreateQuiz = async () => {
    if (!newQuiz.title || !newQuiz.moduleId || !currentUser) return
    setCreating(true)
    try {
      const isFinal = newQuiz.isFinalExam
      const res = await fetch('/api/quizzes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'create',
          moduleId: newQuiz.moduleId,
          title: newQuiz.title,
          description: newQuiz.description,
          type: isFinal ? 'exam' : 'practice',
          isFinalExam: isFinal,
          timeLimit: newQuiz.timeLimit,
          passingScore: newQuiz.passingScore,
          maxAttempts: newQuiz.maxAttempts,
          questions: questions.filter(q => q.text && q.correctAnswer),
        }),
      })
      if (res.ok) {
        setShowCreateDialog(false)
        setNewQuiz({ courseId: '', moduleId: '', title: '', description: '', type: 'practice', isFinalExam: false, timeLimit: 30, passingScore: 70, maxAttempts: 3 })
        setQuestions([])
        setCourseModules([])
        fetchQuizzes()
        onRefresh()
      } else {
        const err = await res.json()
        console.error('Error creating quiz:', err.error)
      }
    } catch (err) {
      console.error('Error creating quiz:', err)
    } finally {
      setCreating(false)
    }
  }

  const handleDeleteQuiz = async (quizId: string) => {
    if (!confirm('Delete this quiz? This cannot be undone.')) return
    try {
      await fetch('/api/quizzes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'delete-quiz', quizId }),
      })
      fetchQuizzes()
      onRefresh()
    } catch (err) {
      console.error('Error deleting quiz:', err)
    }
  }

  const addQuestion = () => {
    setQuestions([...questions, { text: '', type: 'multiple_choice', options: 'Option A,Option B,Option C,Option D', correctAnswer: 'Option A', explanation: '', points: 1 }])
  }

  const removeQuestion = (idx: number) => {
    setQuestions(questions.filter((_, i) => i !== idx))
  }

  const updateQuestion = (idx: number, field: string, value: string | number) => {
    const updated = [...questions]
    updated[idx] = { ...updated[idx], [field]: value }
    setQuestions(updated)
  }

  const openEditQuizDialog = (quiz: QuizInfo) => {
    setEditQuizData({
      id: quiz.id,
      title: quiz.title,
      description: quiz.description || '',
      type: quiz.type,
      isFinalExam: quiz.isFinalExam,
      timeLimit: quiz.timeLimit,
      passingScore: quiz.passingScore,
      maxAttempts: quiz.maxAttempts,
      questions: quiz.questions.map(q => ({
        id: q.id,
        text: q.text,
        type: q.type,
        options: q.options,
        correctAnswer: q.correctAnswer,
        explanation: q.explanation || '',
        points: q.points,
      })),
    })
    setShowEditDialog(true)
  }

  const handleEditQuizSave = async () => {
    if (!editQuizData.title || !currentUser) return
    setSaving(true)
    try {
      await fetch('/api/quizzes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'update-quiz',
          quizId: editQuizData.id,
          title: editQuizData.title,
          description: editQuizData.description,
          type: editQuizData.isFinalExam ? 'exam' : 'practice',
          isFinalExam: editQuizData.isFinalExam,
          timeLimit: editQuizData.timeLimit,
          passingScore: editQuizData.passingScore,
          maxAttempts: editQuizData.maxAttempts,
        }),
      })

      const currentQuiz = quizzes.find(q => q.id === editQuizData.id)
      if (currentQuiz) {
        const currentQuestionIds = new Set(currentQuiz.questions.map(q => q.id))
        const editQuestionIds = new Set(editQuizData.questions.filter(q => q.id).map(q => q.id))

        for (const qId of currentQuestionIds) {
          if (!editQuestionIds.has(qId)) {
            await fetch('/api/quizzes', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ action: 'delete-question', questionId: qId }),
            })
          }
        }
      }

      for (const q of editQuizData.questions.filter(q => !q.id && q.text && q.correctAnswer)) {
        await fetch('/api/quizzes', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'add-question',
            quizId: editQuizData.id,
            text: q.text,
            type: q.type,
            options: q.options,
            correctAnswer: q.correctAnswer,
            explanation: q.explanation,
            points: q.points,
          }),
        })
      }

      setShowEditDialog(false)
      fetchQuizzes()
      onRefresh()
    } catch (err) {
      console.error('Error updating quiz:', err)
    } finally {
      setSaving(false)
    }
  }

  const addEditQuestion = () => {
    setEditQuizData({
      ...editQuizData,
      questions: [...editQuizData.questions, { text: '', type: 'multiple_choice', options: 'Option A,Option B,Option C,Option D', correctAnswer: 'Option A', explanation: '', points: 1 }]
    })
  }

  const removeEditQuestion = (idx: number) => {
    setEditQuizData({
      ...editQuizData,
      questions: editQuizData.questions.filter((_, i) => i !== idx)
    })
  }

  const updateEditQuestion = (idx: number, field: string, value: string | number) => {
    const updated = [...editQuizData.questions]
    updated[idx] = { ...updated[idx], [field]: value }
    setEditQuizData({ ...editQuizData, questions: updated })
  }

  // Group quizzes by course
  const quizzesByCourse = data.courses.map(course => ({
    course,
    courseQuizzes: quizzes.filter(q => q.module.courseId === course.id),
    practiceQuizzes: quizzes.filter(q => q.module.courseId === course.id && !q.isFinalExam),
    finalExams: quizzes.filter(q => q.module.courseId === course.id && q.isFinalExam),
  }))

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Quizzes & Exams</h1>
          <p className="text-muted-foreground mt-1">View all quizzes across your courses, or create new ones here</p>
        </div>
        <div className="flex items-center gap-3">
          <Select value={selectedCourseId} onValueChange={setSelectedCourseId}>
            <SelectTrigger className="w-48"><SelectValue placeholder="Filter Course" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Courses</SelectItem>
              {data.courses.map(c => <SelectItem key={c.id} value={c.id}>{c.title}</SelectItem>)}
            </SelectContent>
          </Select>
          <Button className="bg-primary hover:bg-primary/90" size="sm" onClick={() => setShowCreateDialog(true)}>
            <Plus className="h-4 w-4 mr-1.5" /> Create Quiz
          </Button>
        </div>
      </div>

      {/* Create Quiz Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="sm:max-w-[650px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create Quiz / Exam</DialogTitle>
            <DialogDescription>Create a new practice quiz or final exam and assign it to a course module.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>Title *</Label>
              <Input value={newQuiz.title} onChange={e => setNewQuiz({...newQuiz, title: e.target.value})} placeholder="e.g. Module 1 Quiz" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Course *</Label>
                <Select value={newQuiz.courseId} onValueChange={v => setNewQuiz({...newQuiz, courseId: v, moduleId: ''})}>
                  <SelectTrigger><SelectValue placeholder="Select Course" /></SelectTrigger>
                  <SelectContent>
                    {data.courses.map(c => <SelectItem key={c.id} value={c.id}>{c.title}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label>Module *</Label>
                <Select value={newQuiz.moduleId} onValueChange={v => setNewQuiz({...newQuiz, moduleId: v})} disabled={!newQuiz.courseId}>
                  <SelectTrigger><SelectValue placeholder={newQuiz.courseId ? 'Select Module' : 'Select a course first'} /></SelectTrigger>
                  <SelectContent>
                    {courseModules.map(m => <SelectItem key={m.id} value={m.id}>{m.title}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Quiz Type</Label>
                <Select value={newQuiz.isFinalExam ? 'exam' : 'practice'} onValueChange={v => setNewQuiz({...newQuiz, isFinalExam: v === 'exam', type: v === 'exam' ? 'exam' : 'practice', timeLimit: v === 'exam' ? 60 : 30, maxAttempts: v === 'exam' ? 1 : 3 })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="practice">Practice Quiz</SelectItem>
                    <SelectItem value="exam">Final Exam</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label>&nbsp;</Label>
                <div className="flex items-center gap-2 text-sm text-muted-foreground h-9">
                  {newQuiz.isFinalExam ? (
                    <><GraduationCap className="h-4 w-4 text-primary" /> Final exam — graded, counts toward certificate</>
                  ) : (
                    <><HelpCircle className="h-4 w-4 text-emerald-600" /> Practice quiz — knowledge check per module</>
                  )}
                </div>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="grid gap-2">
                <Label>Time (min)</Label>
                <Input type="number" value={newQuiz.timeLimit} onChange={e => setNewQuiz({...newQuiz, timeLimit: Number(e.target.value)})} />
              </div>
              <div className="grid gap-2">
                <Label>Pass Score %</Label>
                <Input type="number" value={newQuiz.passingScore} onChange={e => setNewQuiz({...newQuiz, passingScore: Number(e.target.value)})} />
              </div>
              <div className="grid gap-2">
                <Label>Max Attempts</Label>
                <Input type="number" value={newQuiz.maxAttempts} onChange={e => setNewQuiz({...newQuiz, maxAttempts: Number(e.target.value)})} />
              </div>
            </div>
            <div className="grid gap-2">
              <Label>Description</Label>
              <Textarea value={newQuiz.description} onChange={e => setNewQuiz({...newQuiz, description: e.target.value})} placeholder="Brief description" rows={2} />
            </div>

            <Separator />
            <div className="flex items-center justify-between">
              <Label className="text-base font-semibold">Questions ({questions.length})</Label>
              <Button variant="outline" size="sm" onClick={addQuestion}><Plus className="h-3 w-3 mr-1" /> Add Question</Button>
            </div>
            {questions.map((q, idx) => (
              <Card key={idx} className="border-border/50 p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Question {idx + 1}</span>
                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => removeQuestion(idx)}><Trash2 className="h-3.5 w-3.5 text-destructive" /></Button>
                </div>
                <Input value={q.text} onChange={e => updateQuestion(idx, 'text', e.target.value)} placeholder="Question text" />
                <div className="grid grid-cols-2 gap-3">
                  <Select value={q.type} onValueChange={v => updateQuestion(idx, 'type', v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="multiple_choice">Multiple Choice</SelectItem>
                      <SelectItem value="true_false">True/False</SelectItem>
                      <SelectItem value="short_answer">Short Answer</SelectItem>
                    </SelectContent>
                  </Select>
                  <div className="grid gap-1">
                    <Label className="text-xs">Points</Label>
                    <Input type="number" value={q.points} onChange={e => updateQuestion(idx, 'points', Number(e.target.value))} className="h-9" />
                  </div>
                </div>
                {q.type !== 'short_answer' && (
                  <Input value={q.options} onChange={e => updateQuestion(idx, 'options', e.target.value)} placeholder="Comma-separated options" />
                )}
                <Input value={q.correctAnswer} onChange={e => updateQuestion(idx, 'correctAnswer', e.target.value)} placeholder="Correct answer" />
                <Input value={q.explanation} onChange={e => updateQuestion(idx, 'explanation', e.target.value)} placeholder="Explanation (optional)" />
              </Card>
            ))}
          </div>
          <DialogFooter>
            <DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose>
            <Button className="bg-primary hover:bg-primary/90" onClick={handleCreateQuiz} disabled={!newQuiz.title || !newQuiz.moduleId || creating}>
              {creating ? <Loader2 className="h-4 w-4 animate-spin mr-1.5" /> : <Plus className="h-4 w-4 mr-1.5" />}
              Create Quiz
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Quiz Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="sm:max-w-[650px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Quiz / Exam</DialogTitle>
            <DialogDescription>Update quiz settings and manage questions.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>Title *</Label>
              <Input value={editQuizData.title} onChange={e => setEditQuizData({...editQuizData, title: e.target.value})} placeholder="e.g. Module 1 Quiz" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Type</Label>
                <Select value={editQuizData.isFinalExam ? 'exam' : 'practice'} onValueChange={v => setEditQuizData({...editQuizData, isFinalExam: v === 'exam', type: v === 'exam' ? 'exam' : 'practice'})}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="practice">Practice Quiz</SelectItem>
                    <SelectItem value="exam">Final Exam</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label>Description</Label>
                <Input value={editQuizData.description} onChange={e => setEditQuizData({...editQuizData, description: e.target.value})} placeholder="Brief description" />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="grid gap-2">
                <Label>Time (min)</Label>
                <Input type="number" value={editQuizData.timeLimit} onChange={e => setEditQuizData({...editQuizData, timeLimit: Number(e.target.value)})} />
              </div>
              <div className="grid gap-2">
                <Label>Pass Score %</Label>
                <Input type="number" value={editQuizData.passingScore} onChange={e => setEditQuizData({...editQuizData, passingScore: Number(e.target.value)})} />
              </div>
              <div className="grid gap-2">
                <Label>Max Attempts</Label>
                <Input type="number" value={editQuizData.maxAttempts} onChange={e => setEditQuizData({...editQuizData, maxAttempts: Number(e.target.value)})} />
              </div>
            </div>

            <Separator />
            <div className="flex items-center justify-between">
              <Label className="text-base font-semibold">Questions ({editQuizData.questions.length})</Label>
              <Button variant="outline" size="sm" onClick={addEditQuestion}><Plus className="h-3 w-3 mr-1" /> Add Question</Button>
            </div>
            {editQuizData.questions.map((q, idx) => (
              <Card key={idx} className="border-border/50 p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Question {idx + 1} {q.id && <span className="text-xs text-muted-foreground">(existing)</span>}</span>
                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => removeEditQuestion(idx)}><Trash2 className="h-3.5 w-3.5 text-destructive" /></Button>
                </div>
                <Input value={q.text} onChange={e => updateEditQuestion(idx, 'text', e.target.value)} placeholder="Question text" />
                <div className="grid grid-cols-2 gap-3">
                  <Select value={q.type} onValueChange={v => updateEditQuestion(idx, 'type', v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="multiple_choice">Multiple Choice</SelectItem>
                      <SelectItem value="true_false">True/False</SelectItem>
                      <SelectItem value="short_answer">Short Answer</SelectItem>
                    </SelectContent>
                  </Select>
                  <div className="grid gap-1">
                    <Label className="text-xs">Points</Label>
                    <Input type="number" value={q.points} onChange={e => updateEditQuestion(idx, 'points', Number(e.target.value))} className="h-9" />
                  </div>
                </div>
                {q.type !== 'short_answer' && (
                  <Input value={q.options} onChange={e => updateEditQuestion(idx, 'options', e.target.value)} placeholder="Comma-separated options" />
                )}
                <Input value={q.correctAnswer} onChange={e => updateEditQuestion(idx, 'correctAnswer', e.target.value)} placeholder="Correct answer" />
                <Input value={q.explanation} onChange={e => updateEditQuestion(idx, 'explanation', e.target.value)} placeholder="Explanation (optional)" />
              </Card>
            ))}
          </div>
          <DialogFooter>
            <DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose>
            <Button className="bg-primary hover:bg-primary/90" onClick={handleEditQuizSave} disabled={!editQuizData.title || saving}>
              {saving ? <Loader2 className="h-4 w-4 animate-spin mr-1.5" /> : <Save className="h-4 w-4 mr-1.5" />}
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Loading State */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : quizzes.length === 0 ? (
        <Card className="border-border/50">
          <CardContent className="p-12 text-center">
            <HelpCircle className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">No Quizzes Yet</h3>
            <p className="text-muted-foreground mb-4">Create quizzes from within your course modules, or use the button above to create one here.</p>
            <Button onClick={() => setShowCreateDialog(true)} className="bg-primary hover:bg-primary/90">
              <Plus className="h-4 w-4 mr-1.5" /> Create Quiz
            </Button>
          </CardContent>
        </Card>
      ) : (
        /* Grouped by Course */
        <div className="space-y-6">
          {quizzesByCourse.filter(g => g.courseQuizzes.length > 0).map(({ course, courseQuizzes, practiceQuizzes, finalExams }) => (
            <Card key={course.id} className="border-border/50">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-3">
                  {course.image ? (
                    <img src={course.image} alt={course.title} className="h-10 w-10 rounded-lg object-cover shrink-0" />
                  ) : (
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-amber-50 to-emerald-50 text-primary shrink-0">
                      <BookOpen className="h-5 w-5" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-base truncate">{course.title}</CardTitle>
                    <div className="flex items-center gap-3 mt-0.5 text-xs text-muted-foreground">
                      <Badge className="bg-amber-100 text-amber-800 text-[10px]">{course.category}</Badge>
                      <span>{practiceQuizzes.length} quizzes</span>
                      <span>{finalExams.length} final exam{finalExams.length !== 1 ? 's' : ''}</span>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {/* Practice Quizzes */}
                {practiceQuizzes.length > 0 && (
                  <div>
                    <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-2">
                      <HelpCircle className="h-3.5 w-3.5" /> Practice Quizzes
                    </h4>
                    <div className="space-y-2">
                      {practiceQuizzes.map(quiz => (
                        <div key={quiz.id} className="p-3 rounded-lg border border-border/50 hover:border-primary/20 transition-colors">
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <Badge className="bg-emerald-100 text-emerald-800 text-[10px]">Quiz</Badge>
                                <Badge variant="outline" className="text-[10px]">{quiz.questions.length} Q</Badge>
                                <Badge variant="outline" className="text-[10px]"><Clock className="h-2.5 w-2.5 mr-0.5" />{quiz.timeLimit}m</Badge>
                              </div>
                              <h5 className="text-sm font-semibold text-foreground truncate">{quiz.title}</h5>
                              <p className="text-xs text-muted-foreground mt-0.5">
                                {quiz.module.title} · Pass: {quiz.passingScore}% · {quiz.maxAttempts} attempt{quiz.maxAttempts > 1 ? 's' : ''}
                                {quiz._count.attempts > 0 && <span className="ml-1 text-primary">· {quiz._count.attempts} taken</span>}
                              </p>
                            </div>
                            <div className="flex items-center gap-1 shrink-0">
                              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEditQuizDialog(quiz)}>
                                <Edit className="h-3.5 w-3.5" />
                              </Button>
                              <Button variant="ghost" size="icon" className="h-7 w-7 hover:text-destructive" onClick={() => handleDeleteQuiz(quiz.id)}>
                                <Trash2 className="h-3.5 w-3.5" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Final Exams */}
                {finalExams.length > 0 && (
                  <div>
                    <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-2">
                      <GraduationCap className="h-3.5 w-3.5" /> Final Exams
                    </h4>
                    <div className="space-y-2">
                      {finalExams.map(quiz => (
                        <div key={quiz.id} className="p-3 rounded-lg border border-primary/20 bg-primary/5 hover:border-primary/30 transition-colors">
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <Badge className="bg-rose-100 text-rose-800 text-[10px]">Final Exam</Badge>
                                <Badge variant="outline" className="text-[10px]">{quiz.questions.length} Q</Badge>
                                <Badge variant="outline" className="text-[10px]"><Clock className="h-2.5 w-2.5 mr-0.5" />{quiz.timeLimit}m</Badge>
                              </div>
                              <h5 className="text-sm font-semibold text-foreground truncate">{quiz.title}</h5>
                              <p className="text-xs text-muted-foreground mt-0.5">
                                Pass: {quiz.passingScore}% · {quiz.maxAttempts} attempt{quiz.maxAttempts > 1 ? 's' : ''}
                                {quiz._count.attempts > 0 && <span className="ml-1 text-primary">· {quiz._count.attempts} taken</span>}
                              </p>
                            </div>
                            <div className="flex items-center gap-1 shrink-0">
                              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEditQuizDialog(quiz)}>
                                <Edit className="h-3.5 w-3.5" />
                              </Button>
                              <Button variant="ghost" size="icon" className="h-7 w-7 hover:text-destructive" onClick={() => handleDeleteQuiz(quiz.id)}>
                                <Trash2 className="h-3.5 w-3.5" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

// ===================== LIVE CLASSES SECTION =====================
interface LiveClassInfo {
  id: string
  courseId: string
  title: string
  description: string | null
  instructor: string
  scheduledAt: string
  duration: number
  meetingUrl: string | null
  status: string
  course: { id: string; title: string; category: string; instructor: string; image: string | null }
}

function LiveClassesSection({ data, onRefresh }: { data: InstructorData; onRefresh: () => void }) {
  const { currentUser } = useAppStore()
  const [liveClasses, setLiveClasses] = useState<LiveClassInfo[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [creating, setCreating] = useState(false)
  const [saving, setSaving] = useState(false)
  const [newClass, setNewClass] = useState({
    courseId: '',
    title: '',
    description: '',
    scheduledAt: '',
    duration: 60,
    meetingUrl: '',
  })
  const [editClass, setEditClass] = useState({
    id: '',
    courseId: '',
    title: '',
    description: '',
    scheduledAt: '',
    duration: 60,
    meetingUrl: '',
  })

  const fetchLiveClasses = useCallback(async () => {
    setLoading(true)
    try {
      const allClasses: LiveClassInfo[] = []
      for (const course of data.courses) {
        const res = await fetch(`/api/live-classes?courseId=${course.id}`)
        if (res.ok) {
          const cls = await res.json()
          allClasses.push(...cls)
        }
      }
      allClasses.sort((a, b) => new Date(b.scheduledAt).getTime() - new Date(a.scheduledAt).getTime())
      setLiveClasses(allClasses)
    } catch (err) {
      console.error('Error fetching live classes:', err)
    } finally {
      setLoading(false)
    }
  }, [data.courses])

  useEffect(() => { fetchLiveClasses() }, [fetchLiveClasses])

  const handleCreate = async () => {
    if (!newClass.title || !newClass.courseId || !newClass.scheduledAt || !currentUser) return
    setCreating(true)
    try {
      const res = await fetch('/api/live-classes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'create',
          ...newClass,
          instructor: currentUser.name,
        }),
      })
      if (res.ok) {
        setShowCreateDialog(false)
        setNewClass({ courseId: '', title: '', description: '', scheduledAt: '', duration: 60, meetingUrl: '' })
        fetchLiveClasses()
      }
    } catch (err) {
      console.error('Error creating live class:', err)
    } finally {
      setCreating(false)
    }
  }

  const handleDelete = async (id: string) => {
    try {
      await fetch('/api/live-classes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'delete', id }),
      })
      fetchLiveClasses()
    } catch (err) {
      console.error('Error deleting live class:', err)
    }
  }

  const handleUpdateStatus = async (id: string, status: string) => {
    try {
      await fetch('/api/live-classes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'update', id, status }),
      })
      fetchLiveClasses()
    } catch (err) {
      console.error('Error updating live class:', err)
    }
  }

  const openEditDialog = (lc: LiveClassInfo) => {
    const dateStr = new Date(lc.scheduledAt).toISOString().slice(0, 16)
    setEditClass({
      id: lc.id,
      courseId: lc.courseId,
      title: lc.title,
      description: lc.description || '',
      scheduledAt: dateStr,
      duration: lc.duration,
      meetingUrl: lc.meetingUrl || '',
    })
    setShowEditDialog(true)
  }

  const handleEditSave = async () => {
    if (!editClass.title || !editClass.scheduledAt || !currentUser) return
    setSaving(true)
    try {
      await fetch('/api/live-classes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'update',
          id: editClass.id,
          title: editClass.title,
          description: editClass.description,
          scheduledAt: editClass.scheduledAt,
          duration: editClass.duration,
          meetingUrl: editClass.meetingUrl,
        }),
      })
      setShowEditDialog(false)
      fetchLiveClasses()
    } catch (err) {
      console.error('Error updating live class:', err)
    } finally {
      setSaving(false)
    }
  }

  const upcoming = liveClasses.filter(c => c.status === 'upcoming' && new Date(c.scheduledAt) > new Date())
  const past = liveClasses.filter(c => c.status === 'completed' || new Date(c.scheduledAt) <= new Date())

  const formatDateTime = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit',
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Live Classes</h1>
          <p className="text-muted-foreground mt-1">Schedule and manage live class sessions</p>
        </div>
        <Button className="bg-primary hover:bg-primary/90" size="sm" onClick={() => setShowCreateDialog(true)}>
          <Plus className="h-4 w-4 mr-1.5" /> Schedule Class
        </Button>
      </div>

      {/* Create Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="sm:max-w-[525px]">
          <DialogHeader>
            <DialogTitle>Schedule Live Class</DialogTitle>
            <DialogDescription>Create a new live class session for your students.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>Title *</Label>
              <Input value={newClass.title} onChange={e => setNewClass({...newClass, title: e.target.value})} placeholder="e.g. Introduction to Biblical Hermeneutics" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Course *</Label>
                <Select value={newClass.courseId} onValueChange={v => setNewClass({...newClass, courseId: v})}>
                  <SelectTrigger><SelectValue placeholder="Select Course" /></SelectTrigger>
                  <SelectContent>
                    {data.courses.map(c => <SelectItem key={c.id} value={c.id}>{c.title}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label>Duration (min)</Label>
                <Input type="number" value={newClass.duration} onChange={e => setNewClass({...newClass, duration: Number(e.target.value)})} />
              </div>
            </div>
            <div className="grid gap-2">
              <Label>Date & Time *</Label>
              <Input type="datetime-local" value={newClass.scheduledAt} onChange={e => setNewClass({...newClass, scheduledAt: e.target.value})} />
            </div>
            <div className="grid gap-2">
              <Label>Meeting URL</Label>
              <Input value={newClass.meetingUrl} onChange={e => setNewClass({...newClass, meetingUrl: e.target.value})} placeholder="https://zoom.us/..." />
            </div>
            <div className="grid gap-2">
              <Label>Description</Label>
              <Textarea value={newClass.description} onChange={e => setNewClass({...newClass, description: e.target.value})} placeholder="What will be covered in this session" rows={2} />
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose>
            <Button className="bg-primary hover:bg-primary/90" onClick={handleCreate} disabled={!newClass.title || !newClass.courseId || !newClass.scheduledAt || creating}>
              {creating ? <Loader2 className="h-4 w-4 animate-spin mr-1.5" /> : <Calendar className="h-4 w-4 mr-1.5" />}
              Schedule Class
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="sm:max-w-[525px]">
          <DialogHeader>
            <DialogTitle>Edit Live Class</DialogTitle>
            <DialogDescription>Update the live class session details.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>Title *</Label>
              <Input value={editClass.title} onChange={e => setEditClass({...editClass, title: e.target.value})} placeholder="e.g. Introduction to Biblical Hermeneutics" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Duration (min)</Label>
                <Input type="number" value={editClass.duration} onChange={e => setEditClass({...editClass, duration: Number(e.target.value)})} />
              </div>
              <div className="grid gap-2">
                <Label>Date & Time *</Label>
                <Input type="datetime-local" value={editClass.scheduledAt} onChange={e => setEditClass({...editClass, scheduledAt: e.target.value})} />
              </div>
            </div>
            <div className="grid gap-2">
              <Label>Meeting URL</Label>
              <Input value={editClass.meetingUrl} onChange={e => setEditClass({...editClass, meetingUrl: e.target.value})} placeholder="https://zoom.us/..." />
            </div>
            <div className="grid gap-2">
              <Label>Description</Label>
              <Textarea value={editClass.description} onChange={e => setEditClass({...editClass, description: e.target.value})} placeholder="What will be covered in this session" rows={2} />
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose>
            <Button className="bg-primary hover:bg-primary/90" onClick={handleEditSave} disabled={!editClass.title || !editClass.scheduledAt || saving}>
              {saving ? <Loader2 className="h-4 w-4 animate-spin mr-1.5" /> : <Save className="h-4 w-4 mr-1.5" />}
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 text-primary animate-spin" /></div>
      ) : liveClasses.length === 0 ? (
        <Card className="border-border/50">
          <CardContent className="p-12 text-center">
            <Calendar className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">No Live Classes</h3>
            <p className="text-muted-foreground">Schedule your first live class session.</p>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Upcoming */}
          {upcoming.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                <Clock className="h-5 w-5 text-primary" /> Upcoming Classes ({upcoming.length})
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {upcoming.map(lc => (
                  <Card key={lc.id} className="border-primary/20 bg-primary/5">
                    <CardContent className="p-5">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <Badge className="bg-emerald-100 text-emerald-800 text-[10px] mb-2">Upcoming</Badge>
                          <h3 className="text-sm font-semibold text-foreground mb-1">{lc.title}</h3>
                          <p className="text-xs text-muted-foreground mb-2">{lc.course.title}</p>
                          <div className="flex items-center gap-3 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />{formatDateTime(lc.scheduledAt)}</span>
                            <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{lc.duration} min</span>
                          </div>
                          {lc.meetingUrl && (
                            <a href={lc.meetingUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 mt-2 text-xs text-primary hover:underline">
                              <ArrowRight className="h-3 w-3" /> Join Meeting
                            </a>
                          )}
                        </div>
                        <div className="flex flex-col gap-1 shrink-0">
                          <Button variant="outline" size="sm" className="h-7 text-xs" onClick={() => handleUpdateStatus(lc.id, 'completed')}>
                            <CheckCircle className="h-3 w-3 mr-1" /> Done
                          </Button>
                          <Button variant="outline" size="sm" className="h-7 text-xs" onClick={() => openEditDialog(lc)}>
                            <Edit className="h-3 w-3 mr-1" /> Edit
                          </Button>
                          <Button variant="ghost" size="sm" className="h-7 text-xs text-destructive" onClick={() => handleDelete(lc.id)}>
                            <Trash2 className="h-3 w-3 mr-1" /> Cancel
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Past */}
          {past.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-emerald-600" /> Past Classes ({past.length})
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {past.slice(0, 10).map(lc => (
                  <Card key={lc.id} className="border-border/50 opacity-75">
                    <CardContent className="p-4">
                      <Badge variant="secondary" className="text-[10px] mb-2">{lc.status === 'completed' ? 'Completed' : 'Ended'}</Badge>
                      <h3 className="text-sm font-semibold text-foreground mb-1">{lc.title}</h3>
                      <p className="text-xs text-muted-foreground">{lc.course.title} · {formatDateTime(lc.scheduledAt)}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}

// ===================== COMMUNICATION SECTION =====================
function CommunicationSection() {
  const { currentUser } = useAppStore()
  const [adminUsers, setAdminUsers] = useState<ChatUser[]>([])
  const [instructorUsers, setInstructorUsers] = useState<ChatUser[]>([])
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [selectedUser, setSelectedUser] = useState<ChatUser | null>(null)
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const [unreadCounts, setUnreadCounts] = useState<Record<string, number>>({})

  const fetchContacts = useCallback(async () => {
    try {
      const [adminRes, instructorRes] = await Promise.all([
        fetch('/api/admin/users?role=admin'),
        fetch('/api/admin/users?role=instructor'),
      ])
      if (adminRes.ok) {
        const adminData = await adminRes.json()
        setAdminUsers((adminData.users || []).filter((u: ChatUser) => u.id !== currentUser?.id))
      }
      if (instructorRes.ok) {
        const instructorData = await instructorRes.json()
        setInstructorUsers((instructorData.users || []).filter((u: ChatUser) => u.id !== currentUser?.id))
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [currentUser?.id])

  const fetchMessages = useCallback(async (otherUserId: string) => {
    if (!currentUser) return
    try {
      const res = await fetch(`/api/chat?userId=${currentUser.id}&otherUserId=${otherUserId}`)
      if (!res.ok) throw new Error('Failed')
      const data = await res.json()
      setMessages(data)
    } catch (err) {
      console.error(err)
    }
  }, [currentUser])

  const fetchUnreadCounts = useCallback(async () => {
    if (!currentUser) return
    try {
      const allUsers = [...adminUsers, ...instructorUsers]
      const counts: Record<string, number> = {}
      await Promise.all(
        allUsers.map(async (u) => {
          try {
            const res = await fetch(`/api/chat?userId=${currentUser.id}&otherUserId=${u.id}`)
            if (res.ok) {
              const msgs: ChatMessage[] = await res.json()
              const unread = msgs.filter((m) => m.senderId === u.id && !m.isRead).length
              if (unread > 0) counts[u.id] = unread
            }
          } catch {
            // skip
          }
        })
      )
      setUnreadCounts(counts)
    } catch (err) {
      console.error(err)
    }
  }, [currentUser, adminUsers, instructorUsers])

  useEffect(() => {
    fetchContacts()
  }, [fetchContacts])

  useEffect(() => {
    if (adminUsers.length > 0 || instructorUsers.length > 0) {
      fetchUnreadCounts()
    }
  }, [adminUsers, instructorUsers, fetchUnreadCounts])

  useEffect(() => {
    if (selectedUser) fetchMessages(selectedUser.id)
  }, [selectedUser, fetchMessages])

  // Auto-poll for new messages every 5 seconds
  useEffect(() => {
    if (!selectedUser) return
    const interval = setInterval(() => {
      fetchMessages(selectedUser.id)
    }, 5000)
    return () => clearInterval(interval)
  }, [selectedUser, fetchMessages])

  // Auto-poll unread counts every 10 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      fetchUnreadCounts()
    }, 10000)
    return () => clearInterval(interval)
  }, [fetchUnreadCounts])

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSend = async () => {
    if (!newMessage.trim() || !selectedUser || !currentUser) return
    try {
      setSending(true)
      await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: newMessage,
          senderId: currentUser.id,
          receiverId: selectedUser.id,
        }),
      })
      setNewMessage('')
      fetchMessages(selectedUser.id)
      fetchUnreadCounts()
    } catch (err) {
      console.error(err)
    } finally {
      setSending(false)
    }
  }

  const getInitials = (name: string) =>
    name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)

  const formatDateTime = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })

  const allContacts = [...adminUsers, ...instructorUsers]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Communication</h1>
        <p className="text-muted-foreground mt-1">Chat with admin and fellow instructors</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Contacts List */}
        <Card className="border-border/50 lg:col-span-1">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold">Contacts</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-3">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-3 p-2.5">
                    <div className="h-8 w-8 rounded-full bg-muted animate-pulse" />
                    <div className="flex-1 space-y-1.5">
                      <div className="h-3 w-24 bg-muted animate-pulse rounded" />
                      <div className="h-2 w-32 bg-muted animate-pulse rounded" />
                    </div>
                  </div>
                ))}
              </div>
            ) : allContacts.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">No contacts found</p>
            ) : (
              <div className="space-y-4">
                {/* Admin Section */}
                {adminUsers.length > 0 && (
                  <div>
                    <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2 px-1">
                      Admin
                    </p>
                    <div className="space-y-1">
                      {adminUsers.map((admin) => (
                        <button
                          key={admin.id}
                          onClick={() => setSelectedUser(admin)}
                          className={`w-full flex items-center gap-3 p-2.5 rounded-lg text-left transition-all ${
                            selectedUser?.id === admin.id
                              ? 'bg-primary/10 text-primary'
                              : 'hover:bg-muted'
                          }`}
                        >
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={admin.avatar || undefined} />
                            <AvatarFallback className="bg-violet-100 text-violet-700 text-xs">
                              {getInitials(admin.name)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <p className="text-sm font-medium truncate">{admin.name}</p>
                              <Badge className="bg-violet-100 text-violet-700 text-[9px] px-1.5 py-0">
                                Admin
                              </Badge>
                            </div>
                            <p className="text-[10px] text-muted-foreground truncate">{admin.email}</p>
                          </div>
                          {unreadCounts[admin.id] && (
                            <Badge className="bg-primary text-primary-foreground text-[10px] h-5 w-5 flex items-center justify-center p-0 rounded-full shrink-0">
                              {unreadCounts[admin.id]}
                            </Badge>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Fellow Instructors Section */}
                {instructorUsers.length > 0 && (
                  <div>
                    <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2 px-1">
                      Fellow Instructors
                    </p>
                    <div className="space-y-1 max-h-64 overflow-y-auto">
                      {instructorUsers.map((inst) => (
                        <button
                          key={inst.id}
                          onClick={() => setSelectedUser(inst)}
                          className={`w-full flex items-center gap-3 p-2.5 rounded-lg text-left transition-all ${
                            selectedUser?.id === inst.id
                              ? 'bg-primary/10 text-primary'
                              : 'hover:bg-muted'
                          }`}
                        >
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={inst.avatar || undefined} />
                            <AvatarFallback className="bg-emerald-100 text-emerald-700 text-xs">
                              {getInitials(inst.name)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <p className="text-sm font-medium truncate">{inst.name}</p>
                              <Badge className="bg-emerald-100 text-emerald-700 text-[9px] px-1.5 py-0">
                                Instructor
                              </Badge>
                            </div>
                            <p className="text-[10px] text-muted-foreground truncate">{inst.email}</p>
                          </div>
                          {unreadCounts[inst.id] && (
                            <Badge className="bg-primary text-primary-foreground text-[10px] h-5 w-5 flex items-center justify-center p-0 rounded-full shrink-0">
                              {unreadCounts[inst.id]}
                            </Badge>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Chat Thread */}
        <Card className="border-border/50 lg:col-span-2">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              {selectedUser ? (
                <>
                  <Avatar className="h-6 w-6">
                    <AvatarImage src={selectedUser.avatar || undefined} />
                    <AvatarFallback
                      className={`text-[10px] ${
                        selectedUser.role === 'admin'
                          ? 'bg-violet-100 text-violet-700'
                          : 'bg-emerald-100 text-emerald-700'
                      }`}
                    >
                      {getInitials(selectedUser.name)}
                    </AvatarFallback>
                  </Avatar>
                  Chat with {selectedUser.name}
                  <Badge
                    className={`text-[9px] px-1.5 py-0 ${
                      selectedUser.role === 'admin'
                        ? 'bg-violet-100 text-violet-700'
                        : 'bg-emerald-100 text-emerald-700'
                    }`}
                  >
                    {selectedUser.role === 'admin' ? 'Admin' : 'Instructor'}
                  </Badge>
                </>
              ) : (
                'Select a Contact'
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {!selectedUser ? (
              <div className="text-center py-12">
                <MessageCircle className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
                <p className="text-muted-foreground">Select a contact to start messaging</p>
              </div>
            ) : (
              <div className="flex flex-col h-[480px]">
                <div className="flex-1 overflow-y-auto space-y-3 mb-4 p-2">
                  {messages.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-8">
                      No messages yet. Start the conversation!
                    </p>
                  ) : (
                    messages.map((msg) => (
                      <div
                        key={msg.id}
                        className={`flex ${
                          msg.senderId === currentUser?.id ? 'justify-end' : 'justify-start'
                        }`}
                      >
                        <div
                          className={`max-w-[80%] p-3 rounded-lg ${
                            msg.senderId === currentUser?.id
                              ? 'bg-primary text-primary-foreground'
                              : 'bg-muted'
                          }`}
                        >
                          <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                          <p
                            className={`text-[10px] mt-1 ${
                              msg.senderId === currentUser?.id
                                ? 'text-primary-foreground/70'
                                : 'text-muted-foreground'
                            }`}
                          >
                            {formatDateTime(msg.createdAt)}
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                  <div ref={messagesEndRef} />
                </div>
                <div className="flex gap-2 pt-2 border-t border-border/50">
                  <Input
                    placeholder="Type a message..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault()
                        handleSend()
                      }
                    }}
                    disabled={sending}
                  />
                  <Button
                    className="bg-primary hover:bg-primary/90 shrink-0"
                    onClick={handleSend}
                    disabled={sending || !newMessage.trim()}
                  >
                    {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

// ===================== APPOINTMENTS SECTION =====================
interface AppointmentInfo {
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
  updatedAt: string
  requester: { id: string; name: string; email: string; avatar: string | null; role: string }
  recipient: { id: string; name: string; email: string; avatar: string | null; role: string }
}

function AppointmentsSection({ data }: { data: InstructorData }) {
  const { currentUser } = useAppStore()
  const [appointments, setAppointments] = useState<AppointmentInfo[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('my-appointments')
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [creating, setCreating] = useState(false)
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  // For creating appointments
  const [adminUsers, setAdminUsers] = useState<{ id: string; name: string; email: string; avatar: string | null; role: string }[]>([])
  const [recipientType, setRecipientType] = useState<'admin' | 'student'>('admin')
  const [selectedCourseId, setSelectedCourseId] = useState('')
  const [newAppointment, setNewAppointment] = useState({
    title: '',
    description: '',
    recipientId: '',
    date: '',
    time: '',
    duration: 30,
    location: '',
    meetingUrl: '',
  })

  const fetchAppointments = useCallback(async () => {
    if (!currentUser) return
    try {
      setLoading(true)
      const res = await fetch(`/api/appointments?userId=${currentUser.id}&role=instructor`)
      if (res.ok) {
        const data = await res.json()
        setAppointments(data.appointments || [])
      }
    } catch (err) {
      console.error('Error fetching appointments:', err)
    } finally {
      setLoading(false)
    }
  }, [currentUser])

  const fetchAdminUsers = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/users?role=admin')
      if (res.ok) {
        const data = await res.json()
        setAdminUsers((data.users || []).filter((u: { id: string }) => u.id !== currentUser?.id))
      }
    } catch (err) {
      console.error('Error fetching admin users:', err)
    }
  }, [currentUser])

  useEffect(() => {
    fetchAppointments()
  }, [fetchAppointments])

  useEffect(() => {
    if (showCreateDialog) {
      fetchAdminUsers()
    }
  }, [showCreateDialog, fetchAdminUsers])

  const myAppointments = appointments.filter((a) => a.requesterId === currentUser?.id)
  const meetingRequests = appointments.filter((a) => a.recipientId === currentUser?.id)

  const getStudentsForCourse = (courseId: string) => {
    const course = data.courses.find((c) => c.id === courseId)
    if (!course) return []
    return course.enrollments.map((e) => ({
      id: e.user.id,
      name: e.user.name,
      email: e.user.email,
      avatar: e.user.avatar,
      role: 'student' as const,
    }))
  }

  const handleCreateAppointment = async () => {
    if (!newAppointment.title || !newAppointment.recipientId || !newAppointment.date || !newAppointment.time || !currentUser) return
    setCreating(true)
    try {
      const dateTime = new Date(`${newAppointment.date}T${newAppointment.time}`)
      const res = await fetch('/api/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'create',
          title: newAppointment.title,
          description: newAppointment.description,
          requesterId: currentUser.id,
          recipientId: newAppointment.recipientId,
          courseId: recipientType === 'student' ? selectedCourseId : undefined,
          date: dateTime.toISOString(),
          duration: newAppointment.duration,
          location: newAppointment.location,
          meetingUrl: newAppointment.meetingUrl,
        }),
      })
      if (res.ok) {
        setShowCreateDialog(false)
        setNewAppointment({
          title: '',
          description: '',
          recipientId: '',
          date: '',
          time: '',
          duration: 30,
          location: '',
          meetingUrl: '',
        })
        setRecipientType('admin')
        setSelectedCourseId('')
        fetchAppointments()
      } else {
        const err = await res.json()
        console.error('Error creating appointment:', err.error)
      }
    } catch (err) {
      console.error('Error creating appointment:', err)
    } finally {
      setCreating(false)
    }
  }

  const handleUpdateStatus = async (appointmentId: string, status: string) => {
    setActionLoading(appointmentId)
    try {
      const res = await fetch('/api/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'update-status',
          id: appointmentId,
          status,
        }),
      })
      if (res.ok) {
        fetchAppointments()
      }
    } catch (err) {
      console.error('Error updating appointment:', err)
    } finally {
      setActionLoading(null)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge className="bg-amber-100 text-amber-800 text-[10px]">Pending</Badge>
      case 'confirmed':
        return <Badge className="bg-emerald-100 text-emerald-800 text-[10px]">Confirmed</Badge>
      case 'cancelled':
        return <Badge className="bg-red-100 text-red-800 text-[10px]">Cancelled</Badge>
      case 'completed':
        return <Badge className="bg-primary/10 text-primary text-[10px]">Completed</Badge>
      default:
        return <Badge variant="secondary" className="text-[10px]">{status}</Badge>
    }
  }

  const formatAppointmentDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  }

  const formatAppointmentTime = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const getInitials = (name: string) =>
    name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)

  const renderAppointmentCard = (appointment: AppointmentInfo, isRecipient: boolean) => (
    <Card key={appointment.id} className="border-border/50 hover:border-primary/20 transition-colors">
      <CardContent className="p-4">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1.5">
              <h4 className="text-sm font-semibold text-foreground truncate">{appointment.title}</h4>
              {getStatusBadge(appointment.status)}
            </div>
            {appointment.description && (
              <p className="text-xs text-muted-foreground mb-2 line-clamp-2">{appointment.description}</p>
            )}
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5">
              <span className="text-xs text-muted-foreground flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {formatAppointmentDate(appointment.date)}
              </span>
              <span className="text-xs text-muted-foreground flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {formatAppointmentTime(appointment.date)}
              </span>
              <span className="text-xs text-muted-foreground flex items-center gap-1">
                <Timer className="h-3 w-3" />
                {appointment.duration} min
              </span>
              {appointment.location && (
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <Globe className="h-3 w-3" />
                  {appointment.location}
                </span>
              )}
              {appointment.meetingUrl && (
                <a
                  href={appointment.meetingUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-primary hover:underline flex items-center gap-1"
                >
                  <ExternalLink className="h-3 w-3" />
                  Meeting Link
                </a>
              )}
            </div>
            <div className="flex items-center gap-2 mt-2">
              <span className="text-[10px] text-muted-foreground">
                {isRecipient ? 'From' : 'With'}:
              </span>
              <div className="flex items-center gap-1.5">
                <Avatar className="h-5 w-5">
                  <AvatarImage src={(isRecipient ? appointment.requester.avatar : appointment.recipient.avatar) || undefined} />
                  <AvatarFallback className="bg-primary/10 text-primary text-[8px]">
                    {getInitials(isRecipient ? appointment.requester.name : appointment.recipient.name)}
                  </AvatarFallback>
                </Avatar>
                <span className="text-xs font-medium text-foreground">
                  {isRecipient ? appointment.requester.name : appointment.recipient.name}
                </span>
                <Badge
                  className={`text-[8px] px-1 py-0 ${
                    (isRecipient ? appointment.requester.role : appointment.recipient.role) === 'admin'
                      ? 'bg-violet-100 text-violet-700'
                      : (isRecipient ? appointment.requester.role : appointment.recipient.role) === 'instructor'
                      ? 'bg-emerald-100 text-emerald-700'
                      : 'bg-amber-100 text-amber-700'
                  }`}
                >
                  {(isRecipient ? appointment.requester.role : appointment.recipient.role)}
                </Badge>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 shrink-0">
            {isRecipient && appointment.status === 'pending' && (
              <Button
                size="sm"
                variant="outline"
                className="text-emerald-600 border-emerald-200 hover:bg-emerald-50 text-xs h-7"
                onClick={() => handleUpdateStatus(appointment.id, 'confirm')}
                disabled={actionLoading === appointment.id}
              >
                {actionLoading === appointment.id ? <Loader2 className="h-3 w-3 animate-spin" /> : <CheckCircle className="h-3 w-3" />}
                Confirm
              </Button>
            )}
            {(appointment.status === 'pending' || appointment.status === 'confirmed') && (
              <Button
                size="sm"
                variant="outline"
                className="text-red-600 border-red-200 hover:bg-red-50 text-xs h-7"
                onClick={() => handleUpdateStatus(appointment.id, 'cancel')}
                disabled={actionLoading === appointment.id}
              >
                <X className="h-3 w-3" />
                Cancel
              </Button>
            )}
            {appointment.status === 'confirmed' && (
              <Button
                size="sm"
                variant="outline"
                className="text-primary border-primary/20 hover:bg-primary/5 text-xs h-7"
                onClick={() => handleUpdateStatus(appointment.id, 'complete')}
                disabled={actionLoading === appointment.id}
              >
                {actionLoading === appointment.id ? <Loader2 className="h-3 w-3 animate-spin" /> : <CheckCircle className="h-3 w-3" />}
                Complete
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )

  const displayedAppointments = activeTab === 'my-appointments' ? myAppointments : meetingRequests

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Appointments</h1>
          <p className="text-muted-foreground mt-1">Schedule and manage your appointments</p>
        </div>
        <Button
          className="bg-primary hover:bg-primary/90"
          size="sm"
          onClick={() => setShowCreateDialog(true)}
        >
          <Plus className="h-4 w-4 mr-1.5" />
          New Appointment
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-border/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-100 text-amber-700 shrink-0">
                <Clock className="h-4 w-4" />
              </div>
              <div>
                <p className="text-lg font-bold">{appointments.filter((a) => a.status === 'pending').length}</p>
                <p className="text-[10px] text-muted-foreground">Pending</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700 shrink-0">
                <CheckCircle className="h-4 w-4" />
              </div>
              <div>
                <p className="text-lg font-bold">{appointments.filter((a) => a.status === 'confirmed').length}</p>
                <p className="text-[10px] text-muted-foreground">Confirmed</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary shrink-0">
                <Calendar className="h-4 w-4" />
              </div>
              <div>
                <p className="text-lg font-bold">{appointments.filter((a) => a.status === 'completed').length}</p>
                <p className="text-[10px] text-muted-foreground">Completed</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-red-100 text-red-700 shrink-0">
                <X className="h-4 w-4" />
              </div>
              <div>
                <p className="text-lg font-bold">{appointments.filter((a) => a.status === 'cancelled').length}</p>
                <p className="text-[10px] text-muted-foreground">Cancelled</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="my-appointments">
            My Appointments
            {myAppointments.length > 0 && (
              <Badge className="ml-1.5 bg-primary/10 text-primary text-[9px] px-1.5 py-0">
                {myAppointments.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="meeting-requests">
            Meeting Requests
            {meetingRequests.filter((a) => a.status === 'pending').length > 0 && (
              <Badge className="ml-1.5 bg-amber-100 text-amber-800 text-[9px] px-1.5 py-0">
                {meetingRequests.filter((a) => a.status === 'pending').length}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-4">
          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <Card key={i} className="border-border/50">
                  <CardContent className="p-4">
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <div className="h-4 w-40 bg-muted animate-pulse rounded" />
                        <div className="h-4 w-16 bg-muted animate-pulse rounded" />
                      </div>
                      <div className="h-3 w-64 bg-muted animate-pulse rounded" />
                      <div className="flex gap-4">
                        <div className="h-3 w-24 bg-muted animate-pulse rounded" />
                        <div className="h-3 w-20 bg-muted animate-pulse rounded" />
                        <div className="h-3 w-16 bg-muted animate-pulse rounded" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : displayedAppointments.length === 0 ? (
            <Card className="border-border/50">
              <CardContent className="p-12 text-center">
                <Calendar className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
                <p className="text-muted-foreground">
                  {activeTab === 'my-appointments'
                    ? 'No appointments scheduled yet. Create one to get started!'
                    : 'No meeting requests at this time.'}
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {displayedAppointments
                .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                .map((appointment) =>
                  renderAppointmentCard(appointment, activeTab === 'meeting-requests')
                )}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Create Appointment Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="sm:max-w-[550px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New Appointment</DialogTitle>
            <DialogDescription>Schedule an appointment with an admin or a student from your courses.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="appt-title">Title *</Label>
              <Input
                id="appt-title"
                value={newAppointment.title}
                onChange={(e) => setNewAppointment({ ...newAppointment, title: e.target.value })}
                placeholder="e.g. Course Discussion"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="appt-desc">Description</Label>
              <Textarea
                id="appt-desc"
                value={newAppointment.description}
                onChange={(e) => setNewAppointment({ ...newAppointment, description: e.target.value })}
                placeholder="Brief description of the appointment"
                rows={2}
              />
            </div>

            {/* Recipient Type */}
            <div className="grid gap-2">
              <Label>Meet With *</Label>
              <Select value={recipientType} onValueChange={(v: 'admin' | 'student') => {
                setRecipientType(v)
                setNewAppointment({ ...newAppointment, recipientId: '' })
                setSelectedCourseId('')
              }}>
                <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="student">Student (from my courses)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {recipientType === 'admin' ? (
              <div className="grid gap-2">
                <Label>Select Admin *</Label>
                <Select value={newAppointment.recipientId} onValueChange={(v) => setNewAppointment({ ...newAppointment, recipientId: v })}>
                  <SelectTrigger><SelectValue placeholder="Choose an admin" /></SelectTrigger>
                  <SelectContent>
                    {adminUsers.length === 0 ? (
                      <SelectItem value="_none" disabled>No admins found</SelectItem>
                    ) : (
                      adminUsers.map((admin) => (
                        <SelectItem key={admin.id} value={admin.id}>
                          {admin.name} ({admin.email})
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>
            ) : (
              <>
                <div className="grid gap-2">
                  <Label>Select Course *</Label>
                  <Select value={selectedCourseId} onValueChange={(v) => {
                    setSelectedCourseId(v)
                    setNewAppointment({ ...newAppointment, recipientId: '' })
                  }}>
                    <SelectTrigger><SelectValue placeholder="Choose a course" /></SelectTrigger>
                    <SelectContent>
                      {data.courses.length === 0 ? (
                        <SelectItem value="_none" disabled>No courses found</SelectItem>
                      ) : (
                        data.courses.map((course) => (
                          <SelectItem key={course.id} value={course.id}>
                            {course.title} ({course.enrollments.length} students)
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                </div>
                {selectedCourseId && (
                  <div className="grid gap-2">
                    <Label>Select Student *</Label>
                    <Select value={newAppointment.recipientId} onValueChange={(v) => setNewAppointment({ ...newAppointment, recipientId: v })}>
                      <SelectTrigger><SelectValue placeholder="Choose a student" /></SelectTrigger>
                      <SelectContent>
                        {getStudentsForCourse(selectedCourseId).length === 0 ? (
                          <SelectItem value="_none" disabled>No students enrolled</SelectItem>
                        ) : (
                          getStudentsForCourse(selectedCourseId).map((student) => (
                            <SelectItem key={student.id} value={student.id}>
                              {student.name} ({student.email})
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="appt-date">Date *</Label>
                <Input
                  id="appt-date"
                  type="date"
                  value={newAppointment.date}
                  onChange={(e) => setNewAppointment({ ...newAppointment, date: e.target.value })}
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="appt-time">Time *</Label>
                <Input
                  id="appt-time"
                  type="time"
                  value={newAppointment.time}
                  onChange={(e) => setNewAppointment({ ...newAppointment, time: e.target.value })}
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label>Duration</Label>
              <Select
                value={String(newAppointment.duration)}
                onValueChange={(v) => setNewAppointment({ ...newAppointment, duration: parseInt(v) })}
              >
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="15">15 minutes</SelectItem>
                  <SelectItem value="30">30 minutes</SelectItem>
                  <SelectItem value="45">45 minutes</SelectItem>
                  <SelectItem value="60">60 minutes</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="appt-location">Location</Label>
              <Input
                id="appt-location"
                value={newAppointment.location}
                onChange={(e) => setNewAppointment({ ...newAppointment, location: e.target.value })}
                placeholder="e.g. Room 201, Main Office"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="appt-url">Meeting URL</Label>
              <Input
                id="appt-url"
                value={newAppointment.meetingUrl}
                onChange={(e) => setNewAppointment({ ...newAppointment, meetingUrl: e.target.value })}
                placeholder="e.g. https://zoom.us/j/..."
              />
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button
              className="bg-primary hover:bg-primary/90"
              onClick={handleCreateAppointment}
              disabled={!newAppointment.title || !newAppointment.recipientId || !newAppointment.date || !newAppointment.time || creating}
            >
              {creating ? <Loader2 className="h-4 w-4 animate-spin mr-1.5" /> : <Plus className="h-4 w-4 mr-1.5" />}
              Create Appointment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

// ===================== MAIN COMPONENT =====================
export function InstructorDashboard() {
  const { currentUser, navigate, currentPage, setUser } = useAppStore()
  const [data, setData] = useState<InstructorData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false)

  const fetchData = useCallback(async () => {
    if (!currentUser?.name) {
      setLoading(false)
      return
    }
    try {
      setLoading(true)
      setError(null)
      const res = await fetch(
        `/api/instructor?instructor=${encodeURIComponent(currentUser.name)}&includeGraded=true`
      )
      if (!res.ok) throw new Error('Failed to fetch instructor data')
      const json = await res.json()
      setData(json)
    } catch (err) {
      console.error('Error loading instructor data:', err)
      setError('Failed to load instructor data. Please try again.')
    } finally {
      setLoading(false)
    }
  }, [currentUser?.name])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  // Access check
  if (!currentUser || currentUser.role !== 'instructor') {
    return (
      <div className="min-h-[calc(100vh-200px)] flex items-center justify-center">
        <Card className="max-w-md mx-auto border-border/50">
          <CardContent className="p-12 text-center">
            <Shield className="h-16 w-16 text-destructive/30 mx-auto mb-6" />
            <h2 className="text-2xl font-bold text-foreground mb-3">Access Denied</h2>
            <p className="text-muted-foreground mb-6">
              You do not have permission to access the instructor portal. Only instructors can
              view this page.
            </p>
            <Button className="bg-primary hover:bg-primary/90" onClick={() => navigate('home')}>
              Go to Home
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Loading
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 text-primary animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading instructor portal...</p>
        </div>
      </div>
    )
  }

  // Error
  if (error || !data) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="max-w-md mx-auto border-border/50">
          <CardContent className="p-12 text-center">
            <AlertCircle className="h-12 w-12 text-destructive/50 mx-auto mb-4" />
            <h2 className="text-lg font-semibold text-foreground mb-2">Error Loading Data</h2>
            <p className="text-muted-foreground mb-4">{error || 'Unknown error'}</p>
            <Button variant="outline" onClick={fetchData}>
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const handleSignOut = () => {
    setUser(null)
    navigate('home')
  }

  const handleNavigate = (page: string) => {
    navigate(page as Page)
    setMobileSidebarOpen(false)
  }

  // Get the active section
  const getActiveSection = () => {
    switch (currentPage) {
      case 'instructor-courses':
        return <MyCoursesSection data={data} onRefresh={fetchData} />
      case 'instructor-students':
        return <StudentsSection data={data} onRefresh={fetchData} />
      case 'instructor-grading':
        return <GradingSection data={data} onGradeSubmitted={fetchData} />
      case 'instructor-library':
        return <LibrarySection data={data} />
      case 'instructor-forum':
        return <ForumSection data={data} />
      case 'instructor-quizzes':
        return <QuizzesSection data={data} onRefresh={fetchData} />
      case 'instructor-live-classes':
        return <LiveClassesSection data={data} onRefresh={fetchData} />
      case 'instructor-communication':
        return <CommunicationSection />
      case 'instructor-appointments':
        return <AppointmentsSection data={data} />
      default:
        return <DashboardSection data={data} onNavigate={handleNavigate} />
    }
  }

  const getSectionTitle = () => {
    switch (currentPage) {
      case 'instructor-courses':
        return 'My Courses'
      case 'instructor-students':
        return 'Students'
      case 'instructor-grading':
        return 'Grading'
      case 'instructor-library':
        return 'Library'
      case 'instructor-forum':
        return 'Forum'
      case 'instructor-quizzes':
        return 'Quizzes & Exams'
      case 'instructor-live-classes':
        return 'Live Classes'
      case 'instructor-communication':
        return 'Communication'
      case 'instructor-appointments':
        return 'Appointments'
      default:
        return 'Dashboard'
    }
  }

  return (
    <div className="min-h-screen flex bg-muted/30">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:block w-[280px] shrink-0 sticky top-0 h-screen">
        <InstructorSidebar
          currentPage={currentPage}
          onNavigate={handleNavigate}
          currentUser={currentUser}
          onSignOut={handleSignOut}
        />
      </aside>

      {/* Mobile Sidebar Sheet */}
      <Sheet open={mobileSidebarOpen} onOpenChange={setMobileSidebarOpen}>
        <SheetContent side="left" className="w-[280px] p-0">
          <SheetTitle className="sr-only">Instructor Navigation</SheetTitle>
          <InstructorSidebar
            currentPage={currentPage}
            onNavigate={handleNavigate}
            currentUser={currentUser}
            onSignOut={handleSignOut}
          />
        </SheetContent>
      </Sheet>

      {/* Main Content */}
      <main className="flex-1 min-w-0">
        {/* Mobile Header */}
        <div className="lg:hidden sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-border/50 px-4 py-3 flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            className="shrink-0"
            onClick={() => setMobileSidebarOpen(true)}
          >
            <Menu className="h-5 w-5" />
          </Button>
          <div className="flex items-center gap-2">
            <img src="/main-logo.png" alt="DreamCraft" className="h-7 w-7 rounded-md object-cover" />
            <div>
              <p className="text-sm font-bold leading-tight text-foreground">Instructor Portal</p>
              <p className="text-[10px] text-muted-foreground">{getSectionTitle()}</p>
            </div>
          </div>
        </div>

        <div className="p-4 sm:p-6 lg:p-8 max-w-7xl">{getActiveSection()}</div>
      </main>
    </div>
  )
}
