'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useAppStore } from '@/lib/store'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Skeleton } from '@/components/ui/skeleton'
import { Separator } from '@/components/ui/separator'
import { Progress } from '@/components/ui/progress'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog'
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
import {
  Sheet,
  SheetContent,
  SheetHeader as SheetHeaderUI,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  LayoutDashboard,
  Users,
  BookOpen,
  BarChart3,
  Library,
  Settings,
  Shield,
  LogOut,
  Plus,
  Search,
  ChevronDown,
  Trash2,
  UserPlus,
  TrendingUp,
  Award,
  GraduationCap,
  Activity,
  Clock,
  Star,
  Menu,
  Loader2,
  CheckCircle,
  AlertTriangle,
  ArrowRight,
  FileQuestion,
  Target,
  UsersRound,
  BookMarked,
  Save,
  ExternalLink,
  MessageSquare,
  Palette,
  Key,
  Eye,
  EyeOff,
  Send,
  Edit,
  ChevronRight,
  Video,
  FileText,
  Headphones,
  Code,
  Presentation,
  Globe,
  Link2,
  Download,
  Pencil,
  RefreshCw,
  X,
  Upload,
  ImageIcon,
  Megaphone,
  Calendar,
  Newspaper,
  MessageCircle,
  Bot,
  XCircle,
  Eye as EyeIcon,
  MousePointerClick,
  BarChart2,
  ArrowUpRight,
  ArrowDownRight,
  ShoppingBag,
  CreditCard,
  Building2,
  Smartphone,
  Phone,
  Package,
  Copy,
  Check,
  Heart,
  DollarSign,
} from 'lucide-react'
import { AreaChart, Area, BarChart as RechartsBarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'

// ─── Types ───────────────────────────────────────────────────────────────────

type AdminPage = 'admin-dashboard' | 'admin-users' | 'admin-courses' | 'admin-quizzes' | 'admin-grading' | 'admin-communication' | 'admin-appointments' | 'admin-newsletters' | 'admin-live-chat' | 'admin-analytics' | 'admin-customization' | 'admin-library' | 'admin-settings' | 'admin-certificate-orders' | 'admin-donations'

interface AnalyticsOverview {
  totalUsers: number
  totalStudents: number
  totalInstructors: number
  totalCourses: number
  totalEnrollments: number
  totalCertificates: number
  totalQuizAttempts: number
  totalLessons: number
  totalAssignments: number
  averageGrade: number
  activeStudents: number
  completionRate: number
}

interface RecentEnrollment {
  id: string
  progress: number
  overallGrade: number
  letterGrade: string | null
  status: string
  enrolledAt: string
  user: { id: string; name: string; email: string; avatar: string | null }
  course: { id: string; title: string; category: string }
}

interface CourseWithStats {
  id: string
  title: string
  category: string
  enrolled: number
  rating: number
  featured: boolean
  _count: { enrollments: number; modules: number }
}

interface GradeDistribution { grade: string | null; count: number }
interface EnrollmentTrend { month: string; count: number }

interface AnalyticsData {
  overview: AnalyticsOverview
  recentEnrollments: RecentEnrollment[]
  coursesWithStats: CourseWithStats[]
  gradeDistribution: GradeDistribution[]
  enrollmentTrend: EnrollmentTrend[]
}

interface VisitorAnalytics {
  totalPageViews: number
  uniqueVisitors: number
  avgViewsPerVisitor: string
  bounceRate: number
  todayViews: number
  todayVisitors: number
  yesterdayViews: number
  yesterdayVisitors: number
  dailyViews: { date: string; views: number; visitors: number }[]
  topPages: { page: string; views: number; uniqueVisitors: number }[]
  referrers: { referrer: string; count: number }[]
}

interface AdminUser {
  id: string
  email: string
  name: string
  avatar: string | null
  role: string
  bio: string | null
  phone: string | null
  country: string | null
  createdAt: string
  _count: { enrollments: number; certificates: number; quizAttempts: number }
}

interface UserCounts { students: number; instructors: number; admins: number }

interface CourseData {
  id: string
  title: string
  description: string
  category: string
  level: string
  duration: string
  image: string | null
  instructor: string
  instructorId?: string
  featured: boolean
  rating: number
  enrolled: number
  modulesCount: number
  lessonsCount: number
}

interface ModuleData {
  id: string
  title: string
  description: string
  order: number
  courseId: string
  _count?: { lessons: number; quizzes: number }
  lessons?: LessonData[]
}

interface LessonData {
  id: string
  title: string
  content: string | null
  videoUrl: string | null
  audioUrl: string | null
  codeSnippet: string | null
  pdfUrl: string | null
  presentationUrl: string | null
  embedCode: string | null
  externalUrl: string | null
  resourceUrl: string | null
  order: number
  moduleId: string
}

interface QuizData {
  id: string
  title: string
  type: string
  isFinalExam: boolean
  timeLimit: number
  passingScore: number
  maxAttempts: number
  lessonId: string | null
  moduleId: string | null
  courseId: string
  course?: { id: string; title: string }
  module?: { id: string; title: string }
  _count?: { questions: number; attempts: number }
  questions?: QuestionData[]
}

interface QuestionData {
  id: string
  text: string
  options: string[]
  correctAnswer: number
  explanation: string | null
  points: number
}

interface SubmissionData {
  id: string
  content: string
  fileUrl: string | null
  score: number | null
  feedback: string | null
  status: string
  submittedAt: string
  user: { id: string; name: string; email: string; avatar: string | null }
  assignment: { id: string; title: string; maxScore: number; module: { course: { id: string; title: string } } }
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

interface SiteSetting {
  id: string
  key: string
  value: string
  createdAt: string
  updatedAt: string
}

// ─── Sidebar Navigation Config ───────────────────────────────────────────────

const NAV_ITEMS: { page: AdminPage; label: string; icon: typeof LayoutDashboard }[] = [
  { page: 'admin-dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { page: 'admin-users', label: 'Users & Roles', icon: Users },
  { page: 'admin-courses', label: 'Courses', icon: BookOpen },
  { page: 'admin-quizzes', label: 'Quizzes & Exams', icon: FileQuestion },
  { page: 'admin-grading', label: 'Grading', icon: Award },
  { page: 'admin-communication', label: 'Communication', icon: MessageSquare },
  { page: 'admin-appointments', label: 'Appointments', icon: Calendar },
  { page: 'admin-newsletters', label: 'Newsletters', icon: Newspaper },
  { page: 'admin-live-chat', label: 'Live Chat', icon: MessageCircle },
  { page: 'admin-analytics', label: 'Analytics', icon: BarChart3 },
  { page: 'admin-certificate-orders', label: 'Certificate Orders', icon: ShoppingBag },
  { page: 'admin-donations', label: 'Donations', icon: Heart },
  { page: 'admin-customization', label: 'Customization', icon: Palette },
  { page: 'admin-library', label: 'Library', icon: Library },
  { page: 'admin-settings', label: 'Settings', icon: Settings },
]

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function formatDateTime(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}

function formatMonth(monthStr: string) {
  const [year, month] = monthStr.split('-')
  const date = new Date(parseInt(year), parseInt(month) - 1)
  return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
}

function getInitials(name: string) {
  return name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
}

function getRoleBadgeClass(role: string) {
  switch (role) {
    case 'admin': return 'bg-violet-100 text-violet-800 border-violet-200'
    case 'instructor': return 'bg-emerald-100 text-emerald-800 border-emerald-200'
    case 'student': return 'bg-amber-100 text-amber-800 border-amber-200'
    default: return 'bg-gray-100 text-gray-800 border-gray-200'
  }
}

function getGradeBarColor(grade: string | null) {
  if (!grade) return 'bg-gray-300'
  if (grade.startsWith('A')) return 'bg-emerald-500'
  if (grade.startsWith('B')) return 'bg-emerald-400'
  if (grade.startsWith('C')) return 'bg-amber-500'
  if (grade.startsWith('D')) return 'bg-orange-500'
  return 'bg-red-500'
}

// ─── Sidebar Content Component ───────────────────────────────────────────────

function AdminSidebarContent({
  activePage, onNavClick, currentUser, onExitAdmin,
}: {
  activePage: AdminPage
  onNavClick: (page: AdminPage) => void
  currentUser: { id: string; name: string; email: string; avatar?: string; role?: string }
  onExitAdmin: () => void
}) {
  return (
    <div className="flex flex-col h-full">
      <div className="p-6 border-b border-border/50">
        <div className="flex items-center gap-3">
          <img src="/main-logo.png" alt="DreamCraft" className="h-10 w-10 rounded-lg object-contain" />
          <div>
            <h2 className="font-bold text-foreground text-sm">DreamCraft</h2>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Admin Panel</p>
          </div>
        </div>
      </div>
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon
          const isActive = activePage === item.page
          return (
            <button key={item.page} onClick={() => onNavClick(item.page)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                isActive ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              }`}>
              <Icon className="h-4.5 w-4.5" />
              {item.label}
            </button>
          )
        })}
      </nav>
      <div className="p-4 border-t border-border/50">
        <div className="flex items-center gap-3 mb-3">
          <Avatar className="h-9 w-9">
            <AvatarImage src={currentUser.avatar || undefined} />
            <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">{getInitials(currentUser.name)}</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-foreground truncate">{currentUser.name}</p>
            <p className="text-[11px] text-muted-foreground truncate">{currentUser.email}</p>
          </div>
        </div>
        <Button variant="ghost" size="sm" className="w-full justify-start text-muted-foreground hover:text-foreground" onClick={onExitAdmin}>
          <LogOut className="h-4 w-4 mr-2" /> Exit Admin
        </Button>
      </div>
    </div>
  )
}

// ─── Main Component ──────────────────────────────────────────────────────────

export function AdminDashboard() {
  const { currentUser, navigate, currentPage } = useAppStore()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const adminPages: AdminPage[] = ['admin-dashboard', 'admin-users', 'admin-courses', 'admin-quizzes', 'admin-grading', 'admin-communication', 'admin-appointments', 'admin-newsletters', 'admin-live-chat', 'admin-analytics', 'admin-customization', 'admin-library', 'admin-settings']
  const activePage = (adminPages.includes(currentPage as AdminPage) ? currentPage : 'admin-dashboard') as AdminPage

  if (!currentUser || currentUser.role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="max-w-md w-full mx-4">
          <CardContent className="p-8 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-100 mx-auto mb-4">
              <Shield className="h-8 w-8 text-red-600" />
            </div>
            <h2 className="text-2xl font-bold text-foreground mb-2">Access Denied</h2>
            <p className="text-muted-foreground mb-6">You don&apos;t have permission to access the admin dashboard.</p>
            <Button className="bg-primary hover:bg-primary/90" onClick={() => navigate('home')}>Back to Home</Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const handleNavClick = (page: AdminPage) => { navigate(page); setMobileMenuOpen(false) }

  return (
    <div className="min-h-screen flex bg-muted/30">
      <aside className="hidden lg:flex lg:w-[280px] lg:flex-col lg:fixed lg:inset-y-0 bg-card border-r border-border/50">
        <AdminSidebarContent activePage={activePage} onNavClick={handleNavClick} currentUser={currentUser} onExitAdmin={() => navigate('home')} />
      </aside>
      <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
        <SheetContent side="left" className="w-[280px] p-0">
          <SheetHeaderUI className="sr-only"><SheetTitle>Admin Navigation</SheetTitle></SheetHeaderUI>
          <AdminSidebarContent activePage={activePage} onNavClick={handleNavClick} currentUser={currentUser} onExitAdmin={() => navigate('home')} />
        </SheetContent>
      </Sheet>
      <div className="flex-1 lg:ml-[280px]">
        <header className="sticky top-0 z-30 bg-card/80 backdrop-blur-lg border-b border-border/50 lg:hidden">
          <div className="flex items-center justify-between px-4 py-3">
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild><Button variant="ghost" size="icon" className="lg:hidden"><Menu className="h-5 w-5" /></Button></SheetTrigger>
            </Sheet>
            <div className="flex items-center gap-2">
              <img src="/main-logo.png" alt="DreamCraft" className="h-7 w-7 rounded object-contain" />
              <span className="font-bold text-sm">Admin</span>
            </div>
            <Avatar className="h-8 w-8">
              <AvatarImage src={currentUser.avatar || undefined} />
              <AvatarFallback className="bg-primary/10 text-primary text-xs">{getInitials(currentUser.name)}</AvatarFallback>
            </Avatar>
          </div>
        </header>
        <main className="p-4 sm:p-6 lg:p-8">
          {activePage === 'admin-dashboard' && <DashboardSection />}
          {activePage === 'admin-users' && <UsersSection />}
          {activePage === 'admin-courses' && <CoursesSection />}
          {activePage === 'admin-quizzes' && <QuizzesSection />}
          {activePage === 'admin-grading' && <GradingSection />}
          {activePage === 'admin-communication' && <CommunicationSection />}
          {activePage === 'admin-appointments' && <AppointmentsSection />}
          {activePage === 'admin-newsletters' && <NewslettersSection />}
          {activePage === 'admin-live-chat' && <LiveChatManagementSection />}
          {activePage === 'admin-analytics' && <AnalyticsSection />}
          {activePage === 'admin-certificate-orders' && <CertificateOrdersSection />}
          {activePage === 'admin-donations' && <DonationsSection />}
          {activePage === 'admin-customization' && <CustomizationSection />}
          {activePage === 'admin-library' && <LibrarySection />}
          {activePage === 'admin-settings' && <SettingsSection />}
        </main>
      </div>
    </div>
  )
}

// ─── Metric Card ─────────────────────────────────────────────────────────────

function MetricCard({ icon: Icon, label, value, color }: { icon: typeof Users; label: string; value: number | string; color: 'amber' | 'emerald' | 'violet' }) {
  const colorClasses = {
    amber: 'bg-amber-100 text-amber-700',
    emerald: 'bg-emerald-100 text-emerald-700',
    violet: 'bg-violet-100 text-violet-700',
  }
  return (
    <Card className="border-border/50">
      <CardContent className="p-4">
        <div className="flex items-center gap-2 mb-2">
          <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${colorClasses[color]}`}><Icon className="h-4 w-4" /></div>
        </div>
        <p className="text-xl font-bold text-foreground">{value}</p>
        <p className="text-xs text-muted-foreground">{label}</p>
      </CardContent>
    </Card>
  )
}

// ─── Dashboard Section ───────────────────────────────────────────────────────

function DashboardSection() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { navigate } = useAppStore()

  const fetchAnalytics = useCallback(async () => {
    try {
      setLoading(true); setError(null)
      const res = await fetch('/api/admin/analytics')
      if (!res.ok) throw new Error('Failed to fetch analytics')
      setAnalytics(await res.json())
    } catch (err) { setError(err instanceof Error ? err.message : 'Failed to load analytics') }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { fetchAnalytics() }, [fetchAnalytics])

  if (loading) return <DashboardSkeleton />
  if (error || !analytics) return (
    <div className="text-center py-16">
      <AlertTriangle className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
      <h3 className="text-lg font-semibold mb-2">Failed to Load Dashboard</h3>
      <p className="text-muted-foreground mb-4">{error}</p>
      <Button variant="outline" onClick={fetchAnalytics}>Try Again</Button>
    </div>
  )

  const { overview, recentEnrollments, coursesWithStats, gradeDistribution, enrollmentTrend } = analytics
  const maxCourseEnrollments = Math.max(...coursesWithStats.map((c) => c._count.enrollments), 1)
  const maxTrendCount = Math.max(...enrollmentTrend.map((t) => t.count), 1)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Admin Dashboard</h1>
        <p className="text-muted-foreground mt-1">Overview of DreamCraft Christian Institute</p>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <MetricCard icon={Users} label="Total Users" value={overview.totalUsers} color="amber" />
        <MetricCard icon={BookOpen} label="Total Courses" value={overview.totalCourses} color="emerald" />
        <MetricCard icon={GraduationCap} label="Enrollments" value={overview.totalEnrollments} color="amber" />
        <MetricCard icon={Award} label="Certificates" value={overview.totalCertificates} color="emerald" />
        <MetricCard icon={Activity} label="Active Students" value={overview.activeStudents} color="violet" />
        <MetricCard icon={TrendingUp} label="Avg Grade" value={`${overview.averageGrade}%`} color="emerald" />
      </div>
      <div className="flex flex-wrap gap-3">
        <Button className="bg-primary hover:bg-primary/90" onClick={() => navigate('admin-courses')}><Plus className="h-4 w-4 mr-2" />Add Course</Button>
        <Button variant="outline" onClick={() => navigate('admin-users')}><Users className="h-4 w-4 mr-2" />Manage Users</Button>
        <Button variant="outline" onClick={() => navigate('admin-communication')}><MessageSquare className="h-4 w-4 mr-2" />Messages</Button>
        <Button variant="outline" onClick={() => navigate('admin-analytics')}><BarChart3 className="h-4 w-4 mr-2" />Analytics</Button>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-border/50">
          <CardHeader className="pb-3"><CardTitle className="text-base font-semibold flex items-center gap-2"><Clock className="h-4 w-4 text-primary" />Recent Enrollments</CardTitle></CardHeader>
          <CardContent>
            {recentEnrollments.length === 0 ? <p className="text-sm text-muted-foreground text-center py-4">No recent enrollments</p> : (
              <div className="space-y-3 max-h-80 overflow-y-auto">
                {recentEnrollments.map((e) => (
                  <div key={e.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors">
                    <Avatar className="h-8 w-8"><AvatarFallback className="bg-amber-100 text-amber-700 text-xs">{getInitials(e.user.name)}</AvatarFallback></Avatar>
                    <div className="flex-1 min-w-0"><p className="text-sm font-medium truncate">{e.user.name}</p><p className="text-xs text-muted-foreground truncate">{e.course.title}</p></div>
                    <div className="text-right shrink-0"><Badge className={`text-[10px] ${getRoleBadgeClass(e.status === 'completed' ? 'instructor' : 'student')}`}>{e.status}</Badge><p className="text-[10px] text-muted-foreground mt-0.5">{formatDate(e.enrolledAt)}</p></div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
        <Card className="border-border/50">
          <CardHeader className="pb-3"><CardTitle className="text-base font-semibold flex items-center gap-2"><Star className="h-4 w-4 text-primary" />Course Popularity</CardTitle></CardHeader>
          <CardContent>
            {coursesWithStats.length === 0 ? <p className="text-sm text-muted-foreground text-center py-4">No courses yet</p> : (
              <div className="space-y-3 max-h-80 overflow-y-auto">
                {coursesWithStats.slice(0, 8).map((c) => (
                  <div key={c.id} className="space-y-1.5">
                    <div className="flex items-center justify-between"><p className="text-sm font-medium truncate pr-2">{c.title}</p><span className="text-xs text-muted-foreground shrink-0">{c._count.enrollments} enrolled</span></div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden"><div className="h-full bg-gradient-to-r from-amber-500 to-emerald-500 rounded-full transition-all" style={{ width: `${(c._count.enrollments / maxCourseEnrollments) * 100}%` }} /></div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
        <Card className="border-border/50">
          <CardHeader className="pb-3"><CardTitle className="text-base font-semibold flex items-center gap-2"><Target className="h-4 w-4 text-primary" />Grade Distribution</CardTitle></CardHeader>
          <CardContent>
            {gradeDistribution.length === 0 ? <p className="text-sm text-muted-foreground text-center py-4">No graded enrollments yet</p> : (
              <div className="space-y-2">{gradeDistribution.map((g) => (
                <div key={g.grade} className="flex items-center gap-3">
                  <span className="text-sm font-mono font-semibold w-8">{g.grade || 'N/A'}</span>
                  <div className="flex-1 h-6 bg-muted rounded overflow-hidden"><div className={`h-full ${getGradeBarColor(g.grade)} rounded transition-all`} style={{ width: `${(g.count / Math.max(...gradeDistribution.map((x) => x.count))) * 100}%`, minWidth: g.count > 0 ? '2rem' : '0' }} /></div>
                  <span className="text-xs text-muted-foreground w-6 text-right">{g.count}</span>
                </div>
              ))}</div>
            )}
          </CardContent>
        </Card>
        <Card className="border-border/50">
          <CardHeader className="pb-3"><CardTitle className="text-base font-semibold flex items-center gap-2"><TrendingUp className="h-4 w-4 text-primary" />Enrollment Trend</CardTitle></CardHeader>
          <CardContent>
            {enrollmentTrend.length === 0 ? <p className="text-sm text-muted-foreground text-center py-4">No enrollment data yet</p> : (
              <div className="space-y-2">{enrollmentTrend.map((t) => (
                <div key={t.month} className="flex items-center gap-3">
                  <span className="text-xs text-muted-foreground w-20">{formatMonth(t.month)}</span>
                  <div className="flex-1 h-6 bg-muted rounded overflow-hidden"><div className="h-full bg-gradient-to-r from-primary/80 to-primary rounded transition-all" style={{ width: `${(t.count / maxTrendCount) * 100}%`, minWidth: t.count > 0 ? '1.5rem' : '0' }} /></div>
                  <span className="text-xs font-semibold w-6 text-right">{t.count}</span>
                </div>
              ))}</div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div><Skeleton className="h-8 w-48 mb-2" /><Skeleton className="h-4 w-72" /></div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">{Array.from({ length: 6 }).map((_, i) => (<Card key={i} className="border-border/50"><CardContent className="p-4"><Skeleton className="h-8 w-8 rounded-lg mb-2" /><Skeleton className="h-6 w-16 mb-1" /><Skeleton className="h-3 w-20" /></CardContent></Card>))}</div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">{Array.from({ length: 4 }).map((_, i) => (<Card key={i} className="border-border/50"><CardContent className="p-6"><Skeleton className="h-5 w-32 mb-4" />{Array.from({ length: 4 }).map((_, j) => (<Skeleton key={j} className="h-10 w-full mb-2" />))}</CardContent></Card>))}</div>
    </div>
  )
}

// ─── Users & Roles Section ───────────────────────────────────────────────────

function UsersSection() {
  const [users, setUsers] = useState<AdminUser[]>([])
  const [counts, setCounts] = useState<UserCounts>({ students: 0, instructors: 0, admins: 0 })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [roleFilter, setRoleFilter] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [addDialogOpen, setAddDialogOpen] = useState(false)
  const [instructorDialogOpen, setInstructorDialogOpen] = useState(false)
  const [resetDialogOpen, setResetDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const [formName, setFormName] = useState('')
  const [formEmail, setFormEmail] = useState('')
  const [formPassword, setFormPassword] = useState('')
  const [formRole, setFormRole] = useState('student')
  const [newPassword, setNewPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true); setError(null)
      const params = new URLSearchParams()
      if (roleFilter !== 'all') params.set('role', roleFilter)
      if (searchQuery.trim()) params.set('search', searchQuery.trim())
      const res = await fetch(`/api/admin/users?${params.toString()}`)
      if (!res.ok) throw new Error('Failed to fetch users')
      const data = await res.json()
      setUsers(data.users); setCounts(data.counts)
    } catch (err) { setError(err instanceof Error ? err.message : 'Failed to load users') }
    finally { setLoading(false) }
  }, [roleFilter, searchQuery])

  useEffect(() => { fetchUsers() }, [fetchUsers])

  const handleCreateUser = async () => {
    if (!formName.trim() || !formEmail.trim() || !formPassword.trim()) return
    try {
      setSubmitting(true)
      const res = await fetch('/api/admin/users', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'create', name: formName.trim(), email: formEmail.trim(), password: formPassword, role: formRole }) })
      if (!res.ok) { const data = await res.json(); throw new Error(data.error || 'Failed to create user') }
      setFormName(''); setFormEmail(''); setFormPassword(''); setFormRole('student'); setAddDialogOpen(false); fetchUsers()
    } catch (err) { console.error(err) } finally { setSubmitting(false) }
  }

  const handleCreateInstructor = async () => {
    if (!formName.trim() || !formEmail.trim() || !formPassword.trim()) return
    try {
      setSubmitting(true)
      const res = await fetch('/api/admin/users', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'create', name: formName.trim(), email: formEmail.trim(), password: formPassword, role: 'instructor' }) })
      if (!res.ok) { const data = await res.json(); throw new Error(data.error || 'Failed to create instructor') }
      setFormName(''); setFormEmail(''); setFormPassword(''); setInstructorDialogOpen(false); fetchUsers()
    } catch (err) { console.error(err) } finally { setSubmitting(false) }
  }

  const handleUpdateRole = async (userId: string, role: string) => {
    try {
      const res = await fetch('/api/admin/users', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'update-role', userId, role }) })
      if (!res.ok) throw new Error('Failed to update role')
      fetchUsers()
    } catch (err) { console.error(err) }
  }

  const handleResetPassword = async () => {
    if (!selectedUser || !newPassword.trim()) return
    try {
      setSubmitting(true)
      const res = await fetch('/api/admin/users', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'reset-password', userId: selectedUser.id, newPassword: newPassword }) })
      if (!res.ok) throw new Error('Failed to reset password')
      setResetDialogOpen(false); setSelectedUser(null); setNewPassword('')
    } catch (err) { console.error(err) } finally { setSubmitting(false) }
  }

  const handleDeleteUser = async () => {
    if (!selectedUser) return
    try {
      const res = await fetch('/api/admin/users', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'delete', userId: selectedUser.id }) })
      if (!res.ok) throw new Error('Failed to delete user')
      setDeleteDialogOpen(false); setSelectedUser(null); fetchUsers()
    } catch (err) { console.error(err) }
  }

  const roleFilters = [
    { key: 'all', label: 'All', count: counts.students + counts.instructors + counts.admins },
    { key: 'student', label: 'Students', count: counts.students },
    { key: 'instructor', label: 'Instructors', count: counts.instructors },
    { key: 'admin', label: 'Admins', count: counts.admins },
  ]

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div><h1 className="text-2xl sm:text-3xl font-bold text-foreground">Users & Roles</h1><p className="text-muted-foreground mt-1">Manage users, assign roles, and control access</p></div>
        <div className="flex gap-2">
          <Button variant="outline" className="shrink-0" onClick={() => { setFormName(''); setFormEmail(''); setFormPassword(''); setInstructorDialogOpen(true) }}><Key className="h-4 w-4 mr-2" />Create Instructor</Button>
          <Button className="bg-primary hover:bg-primary/90 shrink-0" onClick={() => { setFormName(''); setFormEmail(''); setFormPassword(''); setFormRole('student'); setAddDialogOpen(true) }}><UserPlus className="h-4 w-4 mr-2" />Add User</Button>
        </div>
      </div>
      <div className="flex items-center gap-2 flex-wrap">{roleFilters.map((f) => (<Button key={f.key} variant={roleFilter === f.key ? 'default' : 'outline'} size="sm" className={roleFilter === f.key ? 'bg-primary hover:bg-primary/90' : ''} onClick={() => setRoleFilter(f.key)}>{f.label}<Badge variant="secondary" className="ml-2 text-[10px] px-1.5">{f.count}</Badge></Button>))}</div>
      <div className="relative max-w-sm"><Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" /><Input placeholder="Search by name or email..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-9" /></div>

      {loading ? <div className="space-y-3">{Array.from({ length: 5 }).map((_, i) => (<Skeleton key={i} className="h-16 w-full" />))}</div>
       : error ? <div className="text-center py-12"><AlertTriangle className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" /><p className="text-muted-foreground">{error}</p><Button variant="outline" className="mt-4" onClick={fetchUsers}>Try Again</Button></div>
       : users.length === 0 ? <div className="text-center py-12"><UsersRound className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" /><h3 className="text-lg font-semibold mb-2">No Users Found</h3><p className="text-muted-foreground">Try adjusting your search or filter.</p></div>
       : (
        <Card className="border-border/50 overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader><TableRow><TableHead>User</TableHead><TableHead>Role</TableHead><TableHead className="hidden md:table-cell">Enrollments</TableHead><TableHead className="hidden md:table-cell">Certificates</TableHead><TableHead className="hidden sm:table-cell">Join Date</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader>
              <TableBody>{users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell><div className="flex items-center gap-3"><Avatar className="h-9 w-9"><AvatarImage src={user.avatar || undefined} /><AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">{getInitials(user.name)}</AvatarFallback></Avatar><div className="min-w-0"><p className="text-sm font-medium truncate max-w-[180px]">{user.name}</p><p className="text-xs text-muted-foreground truncate max-w-[180px]">{user.email}</p></div></div></TableCell>
                  <TableCell><Badge className={`text-[10px] ${getRoleBadgeClass(user.role)}`}>{user.role.charAt(0).toUpperCase() + user.role.slice(1)}</Badge></TableCell>
                  <TableCell className="hidden md:table-cell"><span className="text-sm">{user._count.enrollments}</span></TableCell>
                  <TableCell className="hidden md:table-cell"><span className="text-sm">{user._count.certificates}</span></TableCell>
                  <TableCell className="hidden sm:table-cell text-sm text-muted-foreground">{formatDate(user.createdAt)}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild><Button variant="ghost" size="sm" className="h-8 text-xs"><ChevronDown className="h-3 w-3 mr-1" />Role</Button></DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem className={user.role === 'student' ? 'bg-muted' : ''} onClick={() => handleUpdateRole(user.id, 'student')}>Student</DropdownMenuItem>
                          <DropdownMenuItem className={user.role === 'instructor' ? 'bg-muted' : ''} onClick={() => handleUpdateRole(user.id, 'instructor')}>Instructor</DropdownMenuItem>
                          <DropdownMenuItem className={user.role === 'admin' ? 'bg-muted' : ''} onClick={() => handleUpdateRole(user.id, 'admin')}>Admin</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary" onClick={() => { setSelectedUser(user); setNewPassword(''); setResetDialogOpen(true) }} title="Reset Password"><Key className="h-3.5 w-3.5" /></Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive" onClick={() => { setSelectedUser(user); setDeleteDialogOpen(true) }}><Trash2 className="h-3.5 w-3.5" /></Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}</TableBody>
            </Table>
          </div>
        </Card>
      )}

      {/* Add User Dialog */}
      <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle>Add New User</DialogTitle><DialogDescription>Create a new user account in the system.</DialogDescription></DialogHeader>
          <div className="space-y-4 mt-4">
            <div><Label>Full Name *</Label><Input placeholder="Enter full name" value={formName} onChange={(e) => setFormName(e.target.value)} className="mt-1.5" /></div>
            <div><Label>Email *</Label><Input type="email" placeholder="user@example.com" value={formEmail} onChange={(e) => setFormEmail(e.target.value)} className="mt-1.5" /></div>
            <div><Label>Password *</Label><div className="relative mt-1.5"><Input type={showPassword ? 'text' : 'password'} placeholder="Enter password" value={formPassword} onChange={(e) => setFormPassword(e.target.value)} /><Button variant="ghost" size="icon" className="absolute right-1 top-1 h-7 w-7" onClick={() => setShowPassword(!showPassword)}>{showPassword ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}</Button></div></div>
            <div><Label>Role</Label><Select value={formRole} onValueChange={setFormRole}><SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="student">Student</SelectItem><SelectItem value="instructor">Instructor</SelectItem><SelectItem value="admin">Admin</SelectItem></SelectContent></Select></div>
          </div>
          <DialogFooter className="mt-6"><Button variant="outline" onClick={() => setAddDialogOpen(false)}>Cancel</Button><Button className="bg-primary hover:bg-primary/90" onClick={handleCreateUser} disabled={submitting || !formName.trim() || !formEmail.trim() || !formPassword.trim()}>{submitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}Create User</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create Instructor Dialog */}
      <Dialog open={instructorDialogOpen} onOpenChange={setInstructorDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle>Create Instructor Account</DialogTitle><DialogDescription>Create login credentials for a new instructor.</DialogDescription></DialogHeader>
          <div className="space-y-4 mt-4">
            <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200"><p className="text-sm text-emerald-800 flex items-center gap-2"><Shield className="h-4 w-4" />This will create an account with <strong>Instructor</strong> role.</p></div>
            <div><Label>Full Name *</Label><Input placeholder="Instructor name" value={formName} onChange={(e) => setFormName(e.target.value)} className="mt-1.5" /></div>
            <div><Label>Email *</Label><Input type="email" placeholder="instructor@example.com" value={formEmail} onChange={(e) => setFormEmail(e.target.value)} className="mt-1.5" /></div>
            <div><Label>Password *</Label><div className="relative mt-1.5"><Input type={showPassword ? 'text' : 'password'} placeholder="Enter password" value={formPassword} onChange={(e) => setFormPassword(e.target.value)} /><Button variant="ghost" size="icon" className="absolute right-1 top-1 h-7 w-7" onClick={() => setShowPassword(!showPassword)}>{showPassword ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}</Button></div></div>
          </div>
          <DialogFooter className="mt-6"><Button variant="outline" onClick={() => setInstructorDialogOpen(false)}>Cancel</Button><Button className="bg-emerald-600 hover:bg-emerald-700 text-white" onClick={handleCreateInstructor} disabled={submitting || !formName.trim() || !formEmail.trim() || !formPassword.trim()}>{submitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}Create Instructor</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reset Password Dialog */}
      <Dialog open={resetDialogOpen} onOpenChange={setResetDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle>Reset Password</DialogTitle><DialogDescription>Set a new password for <strong>{selectedUser?.name}</strong></DialogDescription></DialogHeader>
          <div className="space-y-4 mt-4">
            <div><Label>New Password *</Label><div className="relative mt-1.5"><Input type={showPassword ? 'text' : 'password'} placeholder="Enter new password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} /><Button variant="ghost" size="icon" className="absolute right-1 top-1 h-7 w-7" onClick={() => setShowPassword(!showPassword)}>{showPassword ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}</Button></div></div>
          </div>
          <DialogFooter className="mt-6"><Button variant="outline" onClick={() => { setResetDialogOpen(false); setNewPassword('') }}>Cancel</Button><Button className="bg-primary hover:bg-primary/90" onClick={handleResetPassword} disabled={submitting || !newPassword.trim()}>{submitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}Reset Password</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader><AlertDialogTitle>Delete User</AlertDialogTitle><AlertDialogDescription>Are you sure you want to delete <strong>{selectedUser?.name}</strong>? This action cannot be undone.</AlertDialogDescription></AlertDialogHeader>
          <AlertDialogFooter><AlertDialogCancel onClick={() => setSelectedUser(null)}>Cancel</AlertDialogCancel><AlertDialogAction className="bg-destructive text-destructive-foreground hover:bg-destructive/90" onClick={handleDeleteUser}>Delete User</AlertDialogAction></AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

// ─── Courses Section ─────────────────────────────────────────────────────────

function CoursesSection() {
  const [courses, setCourses] = useState<CourseData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [selectedCourse, setSelectedCourse] = useState<CourseData | null>(null)
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const { navigate } = useAppStore()

  // Create course form
  const [formTitle, setFormTitle] = useState('')
  const [formDesc, setFormDesc] = useState('')
  const [formCategory, setFormCategory] = useState('Life Coaching')
  const [formLevel, setFormLevel] = useState('Beginner')
  const [formDuration, setFormDuration] = useState('')
  const [formInstructor, setFormInstructor] = useState('')

  const fetchCourses = useCallback(async () => {
    try { setLoading(true); setError(null); const res = await fetch('/api/courses'); if (!res.ok) throw new Error('Failed'); setCourses(await res.json()) }
    catch (err) { setError(err instanceof Error ? err.message : 'Failed to load courses') } finally { setLoading(false) }
  }, [])

  useEffect(() => { fetchCourses() }, [fetchCourses])

  const categories = ['all', ...Array.from(new Set(courses.map((c) => c.category)))]
  const filteredCourses = courses.filter((c) => {
    const matchCat = categoryFilter === 'all' || c.category === categoryFilter
    const matchSearch = !searchQuery.trim() || c.title.toLowerCase().includes(searchQuery.toLowerCase()) || c.instructor.toLowerCase().includes(searchQuery.toLowerCase())
    return matchCat && matchSearch
  })

  const handleCreateCourse = async () => {
    if (!formTitle.trim()) return
    try {
      setSubmitting(true)
      const res = await fetch('/api/courses', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ title: formTitle, description: formDesc, category: formCategory, level: formLevel, duration: formDuration, instructor: formInstructor }) })
      if (!res.ok) throw new Error('Failed to create course')
      setFormTitle(''); setFormDesc(''); setFormCategory('Life Coaching'); setFormLevel('Beginner'); setFormDuration(''); setFormInstructor('')
      setCreateDialogOpen(false); fetchCourses()
    } catch (err) { console.error(err) } finally { setSubmitting(false) }
  }

  const handleDeleteCourse = async (courseId: string) => {
    try {
      const res = await fetch('/api/courses', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'delete', courseId }) })
      if (!res.ok) throw new Error('Failed')
      fetchCourses()
    } catch (err) { console.error(err) }
  }

  // If a course is selected, show course management view
  if (selectedCourse) {
    return <CourseManagementView course={selectedCourse} onBack={() => setSelectedCourse(null)} onUpdate={() => fetchCourses()} />
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div><h1 className="text-2xl sm:text-3xl font-bold text-foreground">Course Management</h1><p className="text-muted-foreground mt-1">Create, edit, and manage all courses</p></div>
        <Button className="bg-primary hover:bg-primary/90 shrink-0" onClick={() => setCreateDialogOpen(true)}><Plus className="h-4 w-4 mr-2" />Create Course</Button>
      </div>
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-sm"><Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" /><Input placeholder="Search courses..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-9" /></div>
        <div className="flex items-center gap-2 flex-wrap">{categories.map((cat) => (<Button key={cat} variant={categoryFilter === cat ? 'default' : 'outline'} size="sm" className={categoryFilter === cat ? 'bg-primary hover:bg-primary/90' : ''} onClick={() => setCategoryFilter(cat)}>{cat === 'all' ? 'All' : cat}</Button>))}</div>
      </div>

      {loading ? <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">{Array.from({ length: 6 }).map((_, i) => (<Card key={i} className="border-border/50 overflow-hidden"><Skeleton className="h-40" /><CardContent className="p-5 space-y-3"><Skeleton className="h-4 w-2/3" /><Skeleton className="h-3 w-full" /></CardContent></Card>))}</div>
       : error ? <div className="text-center py-12"><AlertTriangle className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" /><p className="text-muted-foreground">{error}</p><Button variant="outline" className="mt-4" onClick={fetchCourses}>Try Again</Button></div>
       : filteredCourses.length === 0 ? <div className="text-center py-12"><BookMarked className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" /><h3 className="text-lg font-semibold mb-2">No Courses Found</h3></div>
       : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCourses.map((course) => (
            <Card key={course.id} className="border-border/50 overflow-hidden group cursor-pointer card-hover">
              <div className="relative h-40 overflow-hidden" onClick={() => setSelectedCourse(course)}>
                {course.image ? <img src={course.image} alt={course.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                  : <div className="w-full h-full bg-gradient-to-br from-amber-50 to-emerald-50 flex items-center justify-center"><BookOpen className="h-12 w-12 text-primary/20" /></div>}
                <div className="absolute top-3 left-3 flex gap-2"><Badge className="bg-amber-100 text-amber-800 text-[10px]">{course.category}</Badge><Badge className="bg-emerald-100 text-emerald-800 text-[10px]">{course.level}</Badge></div>
              </div>
              <CardContent className="p-5">
                <h3 className="font-semibold text-foreground mb-1 line-clamp-2 group-hover:text-primary transition-colors cursor-pointer" onClick={() => setSelectedCourse(course)}>{course.title}</h3>
                <p className="text-xs text-muted-foreground mb-3">{course.instructor} · {course.duration}</p>
                <div className="flex items-center gap-3 text-xs text-muted-foreground mb-3">
                  <span className="flex items-center gap-1"><Users className="h-3 w-3" />{course.enrolled}</span>
                  <span className="flex items-center gap-1"><Star className="h-3 w-3 text-amber-500" />{course.rating.toFixed(1)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex gap-1"><Badge variant="outline" className="text-[10px]">{course.modulesCount} modules</Badge><Badge variant="outline" className="text-[10px]">{course.lessonsCount} lessons</Badge></div>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive" onClick={(e) => { e.stopPropagation(); handleDeleteCourse(course.id) }}><Trash2 className="h-3.5 w-3.5" /></Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Create Course Dialog */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader><DialogTitle>Create New Course</DialogTitle><DialogDescription>Add a new course to the institute.</DialogDescription></DialogHeader>
          <div className="space-y-4 mt-4">
            <div><Label>Course Title *</Label><Input placeholder="Enter course title" value={formTitle} onChange={(e) => setFormTitle(e.target.value)} className="mt-1.5" /></div>
            <div><Label>Description</Label><Textarea placeholder="Course description..." value={formDesc} onChange={(e) => setFormDesc(e.target.value)} className="mt-1.5" rows={3} /></div>
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Category</Label><Select value={formCategory} onValueChange={setFormCategory}><SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="Life Coaching">Life Coaching</SelectItem><SelectItem value="Leadership">Leadership</SelectItem><SelectItem value="Ministry">Ministry</SelectItem><SelectItem value="Management">Management</SelectItem></SelectContent></Select></div>
              <div><Label>Level</Label><Select value={formLevel} onValueChange={setFormLevel}><SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="Beginner">Beginner</SelectItem><SelectItem value="Intermediate">Intermediate</SelectItem><SelectItem value="Advanced">Advanced</SelectItem></SelectContent></Select></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Duration</Label><Input placeholder="e.g. 8 weeks" value={formDuration} onChange={(e) => setFormDuration(e.target.value)} className="mt-1.5" /></div>
              <div><Label>Instructor</Label><Input placeholder="Instructor name" value={formInstructor} onChange={(e) => setFormInstructor(e.target.value)} className="mt-1.5" /></div>
            </div>
          </div>
          <DialogFooter className="mt-6"><Button variant="outline" onClick={() => setCreateDialogOpen(false)}>Cancel</Button><Button className="bg-primary hover:bg-primary/90" onClick={handleCreateCourse} disabled={submitting || !formTitle.trim()}>{submitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}Create Course</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

// ─── Course Management View (Modules/Lessons/Quizzes) ────────────────────────

function CourseManagementView({ course, onBack, onUpdate }: { course: CourseData; onBack: () => void; onUpdate: () => void }) {
  const [modules, setModules] = useState<ModuleData[]>([])
  const [loading, setLoading] = useState(true)
  const [expandedModule, setExpandedModule] = useState<string | null>(null)
  const [addModuleOpen, setAddModuleOpen] = useState(false)
  const [addLessonOpen, setAddLessonOpen] = useState(false)
  const [selectedModuleId, setSelectedModuleId] = useState<string | null>(null)
  const [moduleName, setModuleName] = useState('')
  const [moduleDesc, setModuleDesc] = useState('')
  const [lessonTitle, setLessonTitle] = useState('')
  const [lessonContent, setLessonContent] = useState('')
  const [lessonVideoUrl, setLessonVideoUrl] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const fetchModules = useCallback(async () => {
    try {
      setLoading(true)
      const res = await fetch(`/api/modules?courseId=${course.id}`)
      if (!res.ok) throw new Error('Failed')
      const data = await res.json()
      setModules(data)
    } catch (err) { console.error(err) } finally { setLoading(false) }
  }, [course.id])

  useEffect(() => { fetchModules() }, [fetchModules])

  const handleAddModule = async () => {
    if (!moduleName.trim()) return
    try {
      setSubmitting(true)
      await fetch('/api/modules', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ title: moduleName, description: moduleDesc, courseId: course.id }) })
      setModuleName(''); setModuleDesc(''); setAddModuleOpen(false); fetchModules()
    } catch (err) { console.error(err) } finally { setSubmitting(false) }
  }

  const handleDeleteModule = async (id: string) => {
    try { await fetch('/api/modules', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'delete', moduleId: id }) }); fetchModules() } catch (err) { console.error(err) }
  }

  const handleAddLesson = async () => {
    if (!lessonTitle.trim() || !selectedModuleId) return
    try {
      setSubmitting(true)
      await fetch('/api/lessons', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ title: lessonTitle, content: lessonContent, videoUrl: lessonVideoUrl, moduleId: selectedModuleId }) })
      setLessonTitle(''); setLessonContent(''); setLessonVideoUrl(''); setAddLessonOpen(false); fetchModules()
    } catch (err) { console.error(err) } finally { setSubmitting(false) }
  }

  const handleDeleteLesson = async (id: string) => {
    try { await fetch('/api/lessons', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'delete', lessonId: id }) }); fetchModules() } catch (err) { console.error(err) }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" onClick={onBack}><ArrowRight className="h-4 w-4 mr-1 rotate-180" />Back</Button>
      </div>
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-foreground">{course.title}</h1>
        <p className="text-muted-foreground mt-1">{course.category} · {course.level} · {course.instructor}</p>
      </div>

      <div className="flex gap-3">
        <Button className="bg-primary hover:bg-primary/90" onClick={() => setAddModuleOpen(true)}><Plus className="h-4 w-4 mr-2" />Add Module</Button>
      </div>

      {loading ? <div className="space-y-4">{Array.from({ length: 3 }).map((_, i) => (<Skeleton key={i} className="h-24 w-full" />))}</div>
       : modules.length === 0 ? <Card className="border-border/50"><CardContent className="p-8 text-center"><BookOpen className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" /><h3 className="text-lg font-semibold mb-2">No Modules Yet</h3><p className="text-muted-foreground">Add modules to structure your course content.</p></CardContent></Card>
       : (
        <div className="space-y-4">
          {modules.map((mod, idx) => (
            <Card key={mod.id} className="border-border/50">
              <div className="p-4 cursor-pointer hover:bg-muted/30 transition-colors" onClick={() => setExpandedModule(expandedModule === mod.id ? null : mod.id)}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary font-semibold text-sm">{idx + 1}</div>
                    <div><h3 className="font-semibold text-foreground">{mod.title}</h3><p className="text-xs text-muted-foreground">{mod._count?.lessons || 0} lessons · {mod._count?.quizzes || 0} quizzes</p></div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={(e) => { e.stopPropagation(); handleDeleteModule(mod.id) }}><Trash2 className="h-3.5 w-3.5 text-muted-foreground hover:text-destructive" /></Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={(e) => { e.stopPropagation(); setSelectedModuleId(mod.id); setAddLessonOpen(true) }}><Plus className="h-3.5 w-3.5" /></Button>
                    <ChevronRight className={`h-4 w-4 text-muted-foreground transition-transform ${expandedModule === mod.id ? 'rotate-90' : ''}`} />
                  </div>
                </div>
              </div>
              {expandedModule === mod.id && mod.lessons && mod.lessons.length > 0 && (
                <div className="border-t border-border/50 p-4 space-y-2">
                  {mod.lessons.map((lesson) => (
                    <div key={lesson.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50">
                      <div className="flex items-center gap-2"><FileText className="h-4 w-4 text-muted-foreground" /><span className="text-sm">{lesson.title}</span></div>
                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleDeleteLesson(lesson.id)}><Trash2 className="h-3 w-3 text-muted-foreground hover:text-destructive" /></Button>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          ))}
        </div>
      )}

      {/* Add Module Dialog */}
      <Dialog open={addModuleOpen} onOpenChange={setAddModuleOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle>Add Module</DialogTitle><DialogDescription>Add a new module to this course.</DialogDescription></DialogHeader>
          <div className="space-y-4 mt-4">
            <div><Label>Module Title *</Label><Input placeholder="Enter module title" value={moduleName} onChange={(e) => setModuleName(e.target.value)} className="mt-1.5" /></div>
            <div><Label>Description</Label><Textarea placeholder="Module description..." value={moduleDesc} onChange={(e) => setModuleDesc(e.target.value)} className="mt-1.5" rows={2} /></div>
          </div>
          <DialogFooter className="mt-6"><Button variant="outline" onClick={() => setAddModuleOpen(false)}>Cancel</Button><Button className="bg-primary hover:bg-primary/90" onClick={handleAddModule} disabled={submitting || !moduleName.trim()}>{submitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}Add Module</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Lesson Dialog */}
      <Dialog open={addLessonOpen} onOpenChange={setAddLessonOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader><DialogTitle>Add Lesson</DialogTitle><DialogDescription>Add a new lesson to the module.</DialogDescription></DialogHeader>
          <div className="space-y-4 mt-4">
            <div><Label>Lesson Title *</Label><Input placeholder="Enter lesson title" value={lessonTitle} onChange={(e) => setLessonTitle(e.target.value)} className="mt-1.5" /></div>
            <div><Label>Notes / Content</Label><Textarea placeholder="Lesson notes..." value={lessonContent} onChange={(e) => setLessonContent(e.target.value)} className="mt-1.5" rows={3} /></div>
            <div><Label>Video URL</Label><Input placeholder="https://..." value={lessonVideoUrl} onChange={(e) => setLessonVideoUrl(e.target.value)} className="mt-1.5" /></div>
          </div>
          <DialogFooter className="mt-6"><Button variant="outline" onClick={() => setAddLessonOpen(false)}>Cancel</Button><Button className="bg-primary hover:bg-primary/90" onClick={handleAddLesson} disabled={submitting || !lessonTitle.trim()}>{submitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}Add Lesson</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

// ─── Quizzes & Exams Section ─────────────────────────────────────────────────

function QuizzesSection() {
  const [quizzes, setQuizzes] = useState<QuizData[]>([])
  const [courses, setCourses] = useState<CourseData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [courseFilter, setCourseFilter] = useState('all')
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [questionDialogOpen, setQuestionDialogOpen] = useState(false)
  const [selectedQuiz, setSelectedQuiz] = useState<QuizData | null>(null)
  const [submitting, setSubmitting] = useState(false)

  // Form state
  const [formTitle, setFormTitle] = useState('')
  const [formCourseId, setFormCourseId] = useState('')
  const [formType, setFormType] = useState('practice')
  const [formIsFinal, setFormIsFinal] = useState(false)
  const [formTimeLimit, setFormTimeLimit] = useState('30')
  const [formPassingScore, setFormPassingScore] = useState('70')
  const [formMaxAttempts, setFormMaxAttempts] = useState('3')

  // Question form
  const [qText, setQText] = useState('')
  const [qOptions, setQOptions] = useState(['', '', '', ''])
  const [qCorrect, setQCorrect] = useState(0)
  const [qExplanation, setQExplanation] = useState('')

  const fetchData = useCallback(async () => {
    try {
      setLoading(true); setError(null)
      const [qRes, cRes] = await Promise.all([fetch('/api/quizzes'), fetch('/api/courses')])
      if (!qRes.ok || !cRes.ok) throw new Error('Failed')
      setQuizzes(await qRes.json()); setCourses(await cRes.json())
    } catch (err) { setError(err instanceof Error ? err.message : 'Failed to load') }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { fetchData() }, [fetchData])

  const filteredQuizzes = quizzes.filter(q => courseFilter === 'all' || q.courseId === courseFilter)

  const groupedByCourse = filteredQuizzes.reduce((acc, q) => {
    const cTitle = q.course?.title || courses.find(c => c.id === q.courseId)?.title || 'Unknown Course'
    if (!acc[cTitle]) acc[cTitle] = []
    acc[cTitle].push(q)
    return acc
  }, {} as Record<string, QuizData[]>)

  const handleCreateQuiz = async () => {
    if (!formTitle.trim() || !formCourseId) return
    try {
      setSubmitting(true)
      await fetch('/api/quizzes', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ title: formTitle, courseId: formCourseId, type: formType, isFinalExam: formIsFinal, timeLimit: parseInt(formTimeLimit) || 30, passingScore: parseInt(formPassingScore) || 70, maxAttempts: parseInt(formMaxAttempts) || 3 }) })
      setFormTitle(''); setFormCourseId(''); setFormType('practice'); setFormIsFinal(false); setFormTimeLimit('30'); setFormPassingScore('70'); setFormMaxAttempts('3')
      setCreateDialogOpen(false); fetchData()
    } catch (err) { console.error(err) } finally { setSubmitting(false) }
  }

  const handleDeleteQuiz = async (id: string) => {
    try { await fetch('/api/quizzes', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'delete', quizId: id }) }); fetchData() } catch (err) { console.error(err) }
  }

  const handleAddQuestion = async () => {
    if (!selectedQuiz || !qText.trim() || qOptions.some(o => !o.trim())) return
    try {
      setSubmitting(true)
      await fetch('/api/quizzes', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'add-question', quizId: selectedQuiz.id, text: qText, options: qOptions, correctAnswer: qCorrect, explanation: qExplanation, points: 1 }) })
      setQText(''); setQOptions(['', '', '', '']); setQCorrect(0); setQExplanation('')
      setQuestionDialogOpen(false); fetchData()
    } catch (err) { console.error(err) } finally { setSubmitting(false) }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div><h1 className="text-2xl sm:text-3xl font-bold text-foreground">Quizzes & Exams</h1><p className="text-muted-foreground mt-1">Manage all quizzes and final exams across courses</p></div>
        <Button className="bg-primary hover:bg-primary/90 shrink-0" onClick={() => setCreateDialogOpen(true)}><Plus className="h-4 w-4 mr-2" />Create Quiz/Exam</Button>
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        <Button variant={courseFilter === 'all' ? 'default' : 'outline'} size="sm" className={courseFilter === 'all' ? 'bg-primary hover:bg-primary/90' : ''} onClick={() => setCourseFilter('all')}>All Courses</Button>
        {courses.map((c) => (<Button key={c.id} variant={courseFilter === c.id ? 'default' : 'outline'} size="sm" className={courseFilter === c.id ? 'bg-primary hover:bg-primary/90' : ''} onClick={() => setCourseFilter(c.id)}>{c.title}</Button>))}
      </div>

      {loading ? <div className="space-y-4">{Array.from({ length: 4 }).map((_, i) => (<Skeleton key={i} className="h-24 w-full" />))}</div>
       : error ? <div className="text-center py-12"><AlertTriangle className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" /><p className="text-muted-foreground">{error}</p><Button variant="outline" className="mt-4" onClick={fetchData}>Try Again</Button></div>
       : filteredQuizzes.length === 0 ? <Card className="border-border/50"><CardContent className="p-8 text-center"><FileQuestion className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" /><h3 className="text-lg font-semibold mb-2">No Quizzes Found</h3><p className="text-muted-foreground">Create quizzes or add them through course modules.</p></CardContent></Card>
       : (
        <div className="space-y-6">
          {Object.entries(groupedByCourse).map(([courseTitle, courseQuizzes]) => (
            <Card key={courseTitle} className="border-border/50">
              <CardHeader className="pb-3"><CardTitle className="text-base font-semibold flex items-center gap-2"><BookOpen className="h-4 w-4 text-primary" />{courseTitle}</CardTitle></CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {courseQuizzes.map((q) => (
                    <div key={q.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${q.isFinalExam ? 'bg-violet-100 text-violet-700' : 'bg-amber-100 text-amber-700'}`}>
                          {q.isFinalExam ? <Award className="h-4 w-4" /> : <FileQuestion className="h-4 w-4" />}
                        </div>
                        <div>
                          <p className="text-sm font-medium">{q.title}</p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <Badge className={`text-[10px] ${q.isFinalExam ? 'bg-violet-100 text-violet-800' : 'bg-amber-100 text-amber-800'}`}>{q.isFinalExam ? 'Final Exam' : q.type === 'exam' ? 'Exam' : 'Practice'}</Badge>
                            <span className="text-[10px] text-muted-foreground">{q._count?.questions || 0} questions</span>
                            <span className="text-[10px] text-muted-foreground">{q.timeLimit} min</span>
                            <span className="text-[10px] text-muted-foreground">{q.passingScore}% pass</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="sm" className="h-8 text-xs" onClick={() => { setSelectedQuiz(q); setQuestionDialogOpen(true) }}><Plus className="h-3 w-3 mr-1" />Question</Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive" onClick={() => handleDeleteQuiz(q.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Create Quiz/Exam Dialog */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader><DialogTitle>Create Quiz / Exam</DialogTitle><DialogDescription>Create a new quiz or final exam and assign it to a course.</DialogDescription></DialogHeader>
          <div className="space-y-4 mt-4">
            <div><Label>Quiz Title *</Label><Input placeholder="Enter quiz title" value={formTitle} onChange={(e) => setFormTitle(e.target.value)} className="mt-1.5" /></div>
            <div><Label>Assign to Course *</Label><Select value={formCourseId} onValueChange={setFormCourseId}><SelectTrigger className="mt-1.5"><SelectValue placeholder="Select course" /></SelectTrigger><SelectContent>{courses.map(c => (<SelectItem key={c.id} value={c.id}>{c.title}</SelectItem>))}</SelectContent></Select></div>
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Type</Label><Select value={formType} onValueChange={setFormType}><SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="practice">Practice Quiz</SelectItem><SelectItem value="exam">Exam</SelectItem></SelectContent></Select></div>
              <div className="flex items-end gap-2 pb-1"><input type="checkbox" id="isFinal" checked={formIsFinal} onChange={(e) => setFormIsFinal(e.target.checked)} className="rounded" /><Label htmlFor="isFinal" className="text-sm">Final Exam</Label></div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div><Label>Time Limit (min)</Label><Input type="number" value={formTimeLimit} onChange={(e) => setFormTimeLimit(e.target.value)} className="mt-1.5" /></div>
              <div><Label>Passing Score (%)</Label><Input type="number" value={formPassingScore} onChange={(e) => setFormPassingScore(e.target.value)} className="mt-1.5" /></div>
              <div><Label>Max Attempts</Label><Input type="number" value={formMaxAttempts} onChange={(e) => setFormMaxAttempts(e.target.value)} className="mt-1.5" /></div>
            </div>
          </div>
          <DialogFooter className="mt-6"><Button variant="outline" onClick={() => setCreateDialogOpen(false)}>Cancel</Button><Button className="bg-primary hover:bg-primary/90" onClick={handleCreateQuiz} disabled={submitting || !formTitle.trim() || !formCourseId}>{submitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}Create</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Question Dialog */}
      <Dialog open={questionDialogOpen} onOpenChange={setQuestionDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader><DialogTitle>Add Question</DialogTitle><DialogDescription>Add a multiple-choice question to &quot;{selectedQuiz?.title}&quot;</DialogDescription></DialogHeader>
          <div className="space-y-4 mt-4">
            <div><Label>Question Text *</Label><Textarea placeholder="Enter the question" value={qText} onChange={(e) => setQText(e.target.value)} className="mt-1.5" rows={2} /></div>
            {qOptions.map((opt, i) => (
              <div key={i} className="flex items-center gap-2">
                <input type="radio" name="correct" checked={qCorrect === i} onChange={() => setQCorrect(i)} className="shrink-0" />
                <Label className="text-xs text-muted-foreground shrink-0">Option {String.fromCharCode(65 + i)}</Label>
                <Input placeholder={`Option ${String.fromCharCode(65 + i)}`} value={opt} onChange={(e) => { const newOpts = [...qOptions]; newOpts[i] = e.target.value; setQOptions(newOpts) }} />
              </div>
            ))}
            <div><Label>Explanation</Label><Textarea placeholder="Explain the correct answer" value={qExplanation} onChange={(e) => setQExplanation(e.target.value)} className="mt-1.5" rows={2} /></div>
          </div>
          <DialogFooter className="mt-6"><Button variant="outline" onClick={() => setQuestionDialogOpen(false)}>Cancel</Button><Button className="bg-primary hover:bg-primary/90" onClick={handleAddQuestion} disabled={submitting || !qText.trim() || qOptions.some(o => !o.trim())}>{submitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}Add Question</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

// ─── Grading Section ─────────────────────────────────────────────────────────

function GradingSection() {
  const [pending, setPending] = useState<SubmissionData[]>([])
  const [graded, setGraded] = useState<SubmissionData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [gradeDialogOpen, setGradeDialogOpen] = useState(false)
  const [selectedSub, setSelectedSub] = useState<SubmissionData | null>(null)
  const [score, setScore] = useState('')
  const [feedback, setFeedback] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [tab, setTab] = useState('pending')

  const fetchData = useCallback(async () => {
    try {
      setLoading(true); setError(null)
      const res = await fetch('/api/assignments')
      if (!res.ok) throw new Error('Failed')
      const data = await res.json()
      const allSubs = (data || []).flatMap((a: Record<string, unknown>) => (a.submissions || []) as SubmissionData[])
      setPending(allSubs.filter((s: SubmissionData) => s.status === 'submitted' || s.status === 'pending'))
      setGraded(allSubs.filter((s: SubmissionData) => s.status === 'graded'))
    } catch (err) { setError(err instanceof Error ? err.message : 'Failed to load') }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { fetchData() }, [fetchData])

  const handleGrade = async () => {
    if (!selectedSub || !score) return
    try {
      setSubmitting(true)
      await fetch(`/api/assignments/${selectedSub.assignment.id}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'grade', submissionId: selectedSub.id, score: parseFloat(score), feedback }) })
      setGradeDialogOpen(false); setScore(''); setFeedback(''); fetchData()
    } catch (err) { console.error(err) } finally { setSubmitting(false) }
  }

  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl sm:text-3xl font-bold text-foreground">Grading</h1><p className="text-muted-foreground mt-1">Grade student submissions and provide feedback</p></div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList><TabsTrigger value="pending">Pending ({pending.length})</TabsTrigger><TabsTrigger value="graded">Graded ({graded.length})</TabsTrigger></TabsList>

        <TabsContent value="pending" className="mt-4">
          {loading ? <div className="space-y-3">{Array.from({ length: 3 }).map((_, i) => (<Skeleton key={i} className="h-20 w-full" />))}</div>
           : pending.length === 0 ? <Card className="border-border/50"><CardContent className="p-8 text-center"><CheckCircle className="h-12 w-12 text-emerald-500/30 mx-auto mb-4" /><h3 className="text-lg font-semibold mb-2">All Caught Up!</h3><p className="text-muted-foreground">No pending submissions to grade.</p></CardContent></Card>
           : (
            <div className="space-y-3">
              {pending.map((sub) => (
                <Card key={sub.id} className="border-border/50">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium">{sub.user.name}</p>
                        <p className="text-xs text-muted-foreground">{sub.assignment.title} · {sub.assignment.module.course.title}</p>
                        <p className="text-xs text-muted-foreground mt-1">Submitted: {formatDate(sub.submittedAt)}</p>
                      </div>
                      <Button className="bg-primary hover:bg-primary/90" size="sm" onClick={() => { setSelectedSub(sub); setScore(''); setFeedback(''); setGradeDialogOpen(true) }}><Pencil className="h-3.5 w-3.5 mr-1" />Grade</Button>
                    </div>
                    {sub.content && <p className="text-sm text-muted-foreground mt-2 p-2 bg-muted/50 rounded line-clamp-3">{sub.content}</p>}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="graded" className="mt-4">
          {loading ? <div className="space-y-3">{Array.from({ length: 3 }).map((_, i) => (<Skeleton key={i} className="h-16 w-full" />))}</div>
           : graded.length === 0 ? <Card className="border-border/50"><CardContent className="p-8 text-center"><Award className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" /><h3 className="text-lg font-semibold mb-2">No Graded Submissions</h3></CardContent></Card>
           : (
            <Card className="border-border/50 overflow-hidden">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader><TableRow><TableHead>Student</TableHead><TableHead>Assignment</TableHead><TableHead>Score</TableHead><TableHead>Feedback</TableHead></TableRow></TableHeader>
                  <TableBody>{graded.map((sub) => (
                    <TableRow key={sub.id}>
                      <TableCell className="text-sm">{sub.user.name}</TableCell>
                      <TableCell className="text-sm">{sub.assignment.title}</TableCell>
                      <TableCell><Badge className={sub.score && sub.score >= sub.assignment.maxScore * 0.7 ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}>{sub.score}/{sub.assignment.maxScore}</Badge></TableCell>
                      <TableCell className="text-sm text-muted-foreground max-w-[200px] truncate">{sub.feedback || '-'}</TableCell>
                    </TableRow>
                  ))}</TableBody>
                </Table>
              </div>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Grade Dialog */}
      <Dialog open={gradeDialogOpen} onOpenChange={setGradeDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle>Grade Submission</DialogTitle><DialogDescription>{selectedSub?.user.name} - {selectedSub?.assignment.title}</DialogDescription></DialogHeader>
          <div className="space-y-4 mt-4">
            <div><Label>Score (out of {selectedSub?.assignment.maxScore}) *</Label><Input type="number" placeholder="Enter score" value={score} onChange={(e) => setScore(e.target.value)} className="mt-1.5" min={0} max={selectedSub?.assignment.maxScore} /></div>
            <div><Label>Feedback</Label><Textarea placeholder="Provide feedback..." value={feedback} onChange={(e) => setFeedback(e.target.value)} className="mt-1.5" rows={3} /></div>
          </div>
          <DialogFooter className="mt-6"><Button variant="outline" onClick={() => setGradeDialogOpen(false)}>Cancel</Button><Button className="bg-primary hover:bg-primary/90" onClick={handleGrade} disabled={submitting || !score}>{submitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}Submit Grade</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

// ─── Communication Section ───────────────────────────────────────────────────

function CommunicationSection() {
  const [instructors, setInstructors] = useState<AdminUser[]>([])
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [selectedInstructor, setSelectedInstructor] = useState<AdminUser | null>(null)
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const { currentUser } = useAppStore()

  // Broadcast state
  const [commTab, setCommTab] = useState<'private' | 'broadcast'>('private')
  const [broadcastMessage, setBroadcastMessage] = useState('')
  const [broadcasting, setBroadcasting] = useState(false)
  const [broadcastProgress, setBroadcastProgress] = useState(0)
  const [broadcastTotal, setBroadcastTotal] = useState(0)
  const [broadcastSuccess, setBroadcastSuccess] = useState(false)
  const [broadcastHistory, setBroadcastHistory] = useState<{ content: string; sentAt: string; recipientCount: number }[]>([])
  const [historyLoading, setHistoryLoading] = useState(false)

  const fetchData = useCallback(async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/admin/users?role=instructor')
      if (!res.ok) throw new Error('Failed')
      const data = await res.json()
      setInstructors(data.users || [])
    } catch (err) { console.error(err) } finally { setLoading(false) }
  }, [])

  const fetchMessages = useCallback(async (instructorId: string) => {
    if (!currentUser) return
    try {
      const res = await fetch(`/api/chat?userId=${currentUser.id}&otherUserId=${instructorId}`)
      if (!res.ok) throw new Error('Failed')
      setMessages(await res.json())
    } catch (err) { console.error(err) }
  }, [currentUser])

  // Fetch broadcast history by grouping admin-sent messages by content
  const fetchBroadcastHistory = useCallback(async () => {
    if (!currentUser || instructors.length === 0) return
    try {
      setHistoryLoading(true)
      // Fetch all messages from admin to each instructor
      const allAdminMessages: ChatMessage[] = []
      for (const inst of instructors) {
        try {
          const res = await fetch(`/api/chat?userId=${currentUser.id}&otherUserId=${inst.id}`)
          if (res.ok) {
            const msgs: ChatMessage[] = await res.json()
            allAdminMessages.push(...msgs.filter((m: ChatMessage) => m.senderId === currentUser.id))
          }
        } catch { /* skip */ }
      }

      // Group messages by content within a 5-second window to identify broadcasts
      const groups: { content: string; sentAt: string; recipientCount: number }[] = []
      const sorted = [...allAdminMessages].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      const processed = new Set<string>()

      for (const msg of sorted) {
        if (processed.has(msg.id)) continue
        // Find all messages with the same content within a 10-second window
        const sentTime = new Date(msg.createdAt).getTime()
        const siblings = sorted.filter((m) => {
          if (processed.has(m.id)) return false
          if (m.content !== msg.content) return false
          const mTime = new Date(m.createdAt).getTime()
          return Math.abs(mTime - sentTime) < 10000
        })
        siblings.forEach((s) => processed.add(s.id))

        // Only show as broadcast if sent to 2+ recipients
        if (siblings.length >= 2) {
          groups.push({
            content: msg.content,
            sentAt: msg.createdAt,
            recipientCount: siblings.length,
          })
        }
      }
      setBroadcastHistory(groups)
    } catch (err) { console.error(err) } finally { setHistoryLoading(false) }
  }, [currentUser, instructors])

  useEffect(() => { fetchData() }, [fetchData])

  useEffect(() => {
    if (selectedInstructor) fetchMessages(selectedInstructor.id)
  }, [selectedInstructor, fetchMessages])

  useEffect(() => {
    if (commTab === 'broadcast' && instructors.length > 0) {
      fetchBroadcastHistory()
    }
  }, [commTab, instructors, fetchBroadcastHistory])

  const handleSend = async () => {
    if (!newMessage.trim() || !selectedInstructor || !currentUser) return
    try {
      setSending(true)
      await fetch('/api/chat', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ content: newMessage, senderId: currentUser.id, receiverId: selectedInstructor.id }) })
      setNewMessage(''); fetchMessages(selectedInstructor.id)
    } catch (err) { console.error(err) } finally { setSending(false) }
  }

  const handleBroadcast = async () => {
    if (!broadcastMessage.trim() || instructors.length === 0 || !currentUser) return
    try {
      setBroadcasting(true)
      setBroadcastSuccess(false)
      setBroadcastTotal(instructors.length)
      setBroadcastProgress(0)

      for (let i = 0; i < instructors.length; i++) {
        try {
          await fetch('/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              content: broadcastMessage.trim(),
              senderId: currentUser.id,
              receiverId: instructors[i].id,
            }),
          })
        } catch { /* continue sending to others */ }
        setBroadcastProgress(i + 1)
      }

      setBroadcastMessage('')
      setBroadcastSuccess(true)
      fetchBroadcastHistory()
      setTimeout(() => setBroadcastSuccess(false), 4000)
    } catch (err) {
      console.error(err)
    } finally {
      setBroadcasting(false)
      setBroadcastProgress(0)
      setBroadcastTotal(0)
    }
  }

  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl sm:text-3xl font-bold text-foreground">Communication</h1><p className="text-muted-foreground mt-1">Manage communication between admin and instructors</p></div>

      {/* Tab Switcher */}
      <div className="flex items-center gap-1 p-1 bg-muted rounded-lg w-fit">
        <button
          onClick={() => setCommTab('private')}
          className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
            commTab === 'private' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <MessageSquare className="h-4 w-4" />
          Private Chat
        </button>
        <button
          onClick={() => setCommTab('broadcast')}
          className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
            commTab === 'broadcast' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <Megaphone className="h-4 w-4" />
          Broadcast
        </button>
      </div>

      {/* Private Chat View */}
      {commTab === 'private' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Instructor List */}
          <Card className="border-border/50 lg:col-span-1">
            <CardHeader className="pb-3"><CardTitle className="text-base font-semibold">Instructors</CardTitle></CardHeader>
            <CardContent>
              {loading ? <div className="space-y-3">{Array.from({ length: 4 }).map((_, i) => (<Skeleton key={i} className="h-12 w-full" />))}</div>
               : instructors.length === 0 ? <p className="text-sm text-muted-foreground text-center py-4">No instructors found</p>
               : (
                <div className="space-y-1 max-h-96 overflow-y-auto">
                  {instructors.map((inst) => (
                    <button key={inst.id} onClick={() => setSelectedInstructor(inst)}
                      className={`w-full flex items-center gap-3 p-2.5 rounded-lg text-left transition-all ${selectedInstructor?.id === inst.id ? 'bg-primary/10 text-primary' : 'hover:bg-muted'}`}>
                      <Avatar className="h-8 w-8"><AvatarFallback className="bg-emerald-100 text-emerald-700 text-xs">{getInitials(inst.name)}</AvatarFallback></Avatar>
                      <div className="flex-1 min-w-0"><p className="text-sm font-medium truncate">{inst.name}</p><p className="text-[10px] text-muted-foreground truncate">{inst.email}</p></div>
                    </button>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Message Thread */}
          <Card className="border-border/50 lg:col-span-2">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold">
                {selectedInstructor ? `Chat with ${selectedInstructor.name}` : 'Select an Instructor'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {!selectedInstructor ? (
                <div className="text-center py-12"><MessageSquare className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" /><p className="text-muted-foreground">Select an instructor to start messaging</p></div>
              ) : (
                <div className="flex flex-col h-96">
                  <div className="flex-1 overflow-y-auto space-y-3 mb-4 p-2">
                    {messages.length === 0 ? <p className="text-sm text-muted-foreground text-center py-8">No messages yet. Start the conversation!</p>
                     : messages.map((msg) => (
                      <div key={msg.id} className={`flex ${msg.senderId === currentUser?.id ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[80%] p-3 rounded-lg ${msg.senderId === currentUser?.id ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                          <p className="text-sm">{msg.content}</p>
                          <p className={`text-[10px] mt-1 ${msg.senderId === currentUser?.id ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>{formatDateTime(msg.createdAt)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <Input placeholder="Type a message..." value={newMessage} onChange={(e) => setNewMessage(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend() } }} />
                    <Button className="bg-primary hover:bg-primary/90 shrink-0" onClick={handleSend} disabled={sending || !newMessage.trim()}>{sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}</Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Broadcast View */}
      {commTab === 'broadcast' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Broadcast Composer */}
          <Card className="border-border/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <Megaphone className="h-4 w-4 text-primary" />
                Broadcast Message
              </CardTitle>
              <CardDescription>Send a message to all {instructors.length} instructor{instructors.length !== 1 ? 's' : ''} at once</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="broadcast-msg" className="text-sm font-medium">Message</Label>
                <Textarea
                  id="broadcast-msg"
                  placeholder="Type your announcement or message for all instructors..."
                  value={broadcastMessage}
                  onChange={(e) => setBroadcastMessage(e.target.value)}
                  className="mt-1.5 min-h-[120px] resize-none"
                  disabled={broadcasting}
                />
              </div>

              {/* Broadcast Progress */}
              {broadcasting && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Sending to instructors...</span>
                    <span className="font-medium">{broadcastProgress}/{broadcastTotal}</span>
                  </div>
                  <Progress value={(broadcastProgress / broadcastTotal) * 100} className="h-2" />
                </div>
              )}

              {/* Success Indicator */}
              {broadcastSuccess && (
                <div className="flex items-center gap-2 p-3 rounded-lg bg-emerald-50 border border-emerald-200">
                  <CheckCircle className="h-5 w-5 text-emerald-600 shrink-0" />
                  <p className="text-sm text-emerald-800 font-medium">Broadcast sent successfully to all {instructors.length} instructor{instructors.length !== 1 ? 's' : ''}!</p>
                </div>
              )}

              <Button
                className="bg-primary hover:bg-primary/90 w-full"
                onClick={handleBroadcast}
                disabled={broadcasting || !broadcastMessage.trim() || instructors.length === 0}
              >
                {broadcasting ? (
                  <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Sending...</>
                ) : (
                  <><Megaphone className="h-4 w-4 mr-2" />Send to All Instructors</>
                )}
              </Button>

              {instructors.length === 0 && !loading && (
                <p className="text-xs text-muted-foreground text-center">No instructors available to broadcast to.</p>
              )}
            </CardContent>
          </Card>

          {/* Broadcast History */}
          <Card className="border-border/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <Clock className="h-4 w-4 text-primary" />
                Broadcast History
              </CardTitle>
              <CardDescription>Previous announcements sent to instructors</CardDescription>
            </CardHeader>
            <CardContent>
              {historyLoading ? (
                <div className="space-y-3">{Array.from({ length: 3 }).map((_, i) => (<Skeleton key={i} className="h-20 w-full" />))}</div>
              ) : broadcastHistory.length === 0 ? (
                <div className="text-center py-8">
                  <Megaphone className="h-10 w-10 text-muted-foreground/20 mx-auto mb-3" />
                  <p className="text-sm text-muted-foreground">No broadcasts sent yet</p>
                  <p className="text-xs text-muted-foreground mt-1">Your broadcast announcements will appear here</p>
                </div>
              ) : (
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {broadcastHistory.map((item, idx) => (
                    <div key={idx} className="p-3 rounded-lg border border-border/50 bg-muted/30">
                      <p className="text-sm text-foreground whitespace-pre-wrap">{item.content}</p>
                      <div className="flex items-center gap-3 mt-2 pt-2 border-t border-border/30">
                        <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          {item.recipientCount} instructor{item.recipientCount !== 1 ? 's' : ''}
                        </span>
                        <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {formatDateTime(item.sentAt)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}

// ─── Analytics Section ───────────────────────────────────────────────────────

const PIE_COLORS = ['#d97706', '#059669', '#7c3aed', '#dc2626', '#2563eb', '#0891b2', '#c026d3', '#65a30d', '#ea580c', '#4f46e5']

function AnalyticsSection() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null)
  const [visitorData, setVisitorData] = useState<VisitorAnalytics | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [dateRange, setDateRange] = useState('30d')
  const [activeTab, setActiveTab] = useState<'overview' | 'visitors'>('overview')

  const fetchData = useCallback(async () => {
    try {
      setLoading(true); setError(null)
      const [analyticsRes, visitorsRes] = await Promise.all([
        fetch('/api/admin/analytics'),
        fetch(`/api/admin/analytics/visitors?range=${dateRange}`),
      ])
      if (!analyticsRes.ok) throw new Error('Failed to fetch analytics')
      setAnalytics(await analyticsRes.json())
      if (visitorsRes.ok) setVisitorData(await visitorsRes.json())
    } catch (err) { setError(err instanceof Error ? err.message : 'Failed to load') }
    finally { setLoading(false) }
  }, [dateRange])

  useEffect(() => { fetchData() }, [fetchData])

  if (loading) return <AnalyticsSkeleton />
  if (error || !analytics) return (
    <div className="text-center py-16">
      <AlertTriangle className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
      <h3 className="text-lg font-semibold mb-2">Failed to Load</h3>
      <Button variant="outline" onClick={fetchData}>Try Again</Button>
    </div>
  )

  const { overview, gradeDistribution, enrollmentTrend, coursesWithStats } = analytics
  const topCourses = coursesWithStats.slice(0, 5)

  // Calculate day-over-day change
  const viewsChange = visitorData && visitorData.yesterdayViews > 0
    ? Math.round(((visitorData.todayViews - visitorData.yesterdayViews) / visitorData.yesterdayViews) * 100)
    : 0
  const visitorsChange = visitorData && visitorData.yesterdayVisitors > 0
    ? Math.round(((visitorData.todayVisitors - visitorData.yesterdayVisitors) / visitorData.yesterdayVisitors) * 100)
    : 0

  // Format chart data for daily views
  const chartData = visitorData?.dailyViews.map((d) => ({
    ...d,
    date: new Date(d.date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
  })) || []

  // Page label formatter
  const formatPageLabel = (page: string) => {
    const labels: Record<string, string> = {
      'home': 'Home', 'courses': 'Courses', 'course-detail': 'Course Detail',
      'dashboard': 'Student Dashboard', 'lesson': 'Lesson Player', 'about': 'About',
      'apply': 'Apply Now', 'doctrine': 'Doctrine', 'login': 'Login', 'register': 'Register',
      'quiz': 'Quiz', 'assignment': 'Assignment', 'certificate': 'Certificate',
      'live-classes': 'Live Classes', 'forum': 'Forum', 'library': 'Library',
      'chat': 'Chat', 'profile': 'Profile',
      'admin-dashboard': 'Admin Dashboard', 'admin-users': 'Admin Users',
      'admin-courses': 'Admin Courses', 'admin-analytics': 'Admin Analytics',
      'instructor-dashboard': 'Instructor Dashboard',
    }
    return labels[page] || page.replace(/-/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Analytics</h1>
          <p className="text-muted-foreground mt-1">Detailed reports and insights</p>
        </div>
        <div className="flex gap-2">
          <Button variant={activeTab === 'overview' ? 'default' : 'outline'} size="sm" onClick={() => setActiveTab('overview')} className={activeTab === 'overview' ? 'bg-primary hover:bg-primary/90' : ''}>
            <BarChart3 className="h-4 w-4 mr-1.5" />Course Analytics
          </Button>
          <Button variant={activeTab === 'visitors' ? 'default' : 'outline'} size="sm" onClick={() => setActiveTab('visitors')} className={activeTab === 'visitors' ? 'bg-primary hover:bg-primary/90' : ''}>
            <EyeIcon className="h-4 w-4 mr-1.5" />Visitor Analytics
          </Button>
        </div>
      </div>

      {/* Course Analytics Tab */}
      {activeTab === 'overview' && (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="border-border/50"><CardContent className="p-5"><div className="flex items-center gap-3 mb-3"><div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700"><Target className="h-5 w-5" /></div><p className="text-sm text-muted-foreground">Completion Rate</p></div><p className="text-3xl font-bold">{overview.completionRate}%</p><Progress value={overview.completionRate} className="h-1.5 mt-2" /></CardContent></Card>
            <Card className="border-border/50"><CardContent className="p-5"><div className="flex items-center gap-3 mb-3"><div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100 text-amber-700"><Activity className="h-5 w-5" /></div><p className="text-sm text-muted-foreground">Active Students</p></div><p className="text-3xl font-bold">{overview.activeStudents}</p><p className="text-xs text-muted-foreground mt-1">Last 30 days</p></CardContent></Card>
            <Card className="border-border/50"><CardContent className="p-5"><div className="flex items-center gap-3 mb-3"><div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700"><TrendingUp className="h-5 w-5" /></div><p className="text-sm text-muted-foreground">Average Grade</p></div><p className="text-3xl font-bold">{overview.averageGrade}%</p></CardContent></Card>
            <Card className="border-border/50"><CardContent className="p-5"><div className="flex items-center gap-3 mb-3"><div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100 text-amber-700"><FileQuestion className="h-5 w-5" /></div><p className="text-sm text-muted-foreground">Quiz Attempts</p></div><p className="text-3xl font-bold">{overview.totalQuizAttempts}</p></CardContent></Card>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="border-border/50">
              <CardHeader className="pb-3"><CardTitle className="text-base font-semibold flex items-center gap-2"><GraduationCap className="h-4 w-4 text-primary" />Grade Distribution</CardTitle></CardHeader>
              <CardContent>
                {gradeDistribution.length === 0 ? <p className="text-sm text-muted-foreground text-center py-8">No data</p> : (
                  <ResponsiveContainer width="100%" height={220}>
                    <RechartsBarChart data={gradeDistribution.map((g) => ({ grade: g.grade || 'N/A', count: g.count }))} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                      <XAxis dataKey="grade" tick={{ fontSize: 12 }} className="fill-muted-foreground" />
                      <YAxis tick={{ fontSize: 12 }} className="fill-muted-foreground" />
                      <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px', fontSize: '12px' }} />
                      <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                        {gradeDistribution.map((g, i) => (
                          <Cell key={i} fill={g.grade?.startsWith('A') ? '#059669' : g.grade?.startsWith('B') ? '#34d399' : g.grade?.startsWith('C') ? '#d97706' : g.grade?.startsWith('D') ? '#ea580c' : '#dc2626'} />
                        ))}
                      </Bar>
                    </RechartsBarChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>
            <Card className="border-border/50">
              <CardHeader className="pb-3"><CardTitle className="text-base font-semibold flex items-center gap-2"><TrendingUp className="h-4 w-4 text-primary" />Monthly Signups</CardTitle></CardHeader>
              <CardContent>
                {enrollmentTrend.length === 0 ? <p className="text-sm text-muted-foreground text-center py-8">No data</p> : (
                  <ResponsiveContainer width="100%" height={220}>
                    <AreaChart data={enrollmentTrend.map((t) => ({ month: formatMonth(t.month), signups: t.count }))} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                      <XAxis dataKey="month" tick={{ fontSize: 11 }} className="fill-muted-foreground" />
                      <YAxis tick={{ fontSize: 12 }} className="fill-muted-foreground" />
                      <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px', fontSize: '12px' }} />
                      <defs>
                        <linearGradient id="signupGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#d97706" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#d97706" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <Area type="monotone" dataKey="signups" stroke="#d97706" strokeWidth={2} fill="url(#signupGradient)" />
                    </AreaChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>
          </div>
          <Card className="border-border/50">
            <CardHeader className="pb-3"><CardTitle className="text-base font-semibold flex items-center gap-2"><Star className="h-4 w-4 text-primary" />Top Performing Courses</CardTitle></CardHeader>
            <CardContent>
              {topCourses.length === 0 ? <p className="text-sm text-muted-foreground text-center py-8">No courses</p> : (
                <div className="space-y-3">{topCourses.map((c, i) => (
                  <div key={c.id} className="flex items-center gap-4 p-3 rounded-lg hover:bg-muted/50">
                    <div className={`flex h-10 w-10 items-center justify-center rounded-lg font-bold text-sm ${i === 0 ? 'bg-amber-100 text-amber-800' : i === 1 ? 'bg-stone-200 text-stone-700' : i === 2 ? 'bg-orange-100 text-orange-800' : 'bg-muted text-muted-foreground'}`}>#{i + 1}</div>
                    <div className="flex-1 min-w-0"><p className="text-sm font-medium truncate">{c.title}</p><div className="flex items-center gap-2 mt-0.5"><Badge variant="outline" className="text-[10px]">{c.category}</Badge><span className="text-xs text-muted-foreground">{c._count.modules} modules</span></div></div>
                    <div className="text-right shrink-0"><p className="text-sm font-semibold">{c._count.enrollments}</p><p className="text-[10px] text-muted-foreground">enrollments</p></div>
                  </div>
                ))}</div>
              )}
            </CardContent>
          </Card>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="border-border/50"><CardContent className="p-4 text-center"><p className="text-2xl font-bold">{overview.totalLessons}</p><p className="text-xs text-muted-foreground">Total Lessons</p></CardContent></Card>
            <Card className="border-border/50"><CardContent className="p-4 text-center"><p className="text-2xl font-bold">{overview.totalAssignments}</p><p className="text-xs text-muted-foreground">Assignments</p></CardContent></Card>
            <Card className="border-border/50"><CardContent className="p-4 text-center"><p className="text-2xl font-bold">{overview.totalCertificates}</p><p className="text-xs text-muted-foreground">Certificates</p></CardContent></Card>
            <Card className="border-border/50"><CardContent className="p-4 text-center"><p className="text-2xl font-bold">{overview.totalInstructors}</p><p className="text-xs text-muted-foreground">Instructors</p></CardContent></Card>
          </div>
        </>
      )}

      {/* Visitor Analytics Tab */}
      {activeTab === 'visitors' && visitorData && (
        <>
          {/* Date range selector */}
          <div className="flex items-center gap-2 flex-wrap">
            {[
              { key: '7d', label: 'Last 7 days' },
              { key: '30d', label: 'Last 30 days' },
              { key: '90d', label: 'Last 90 days' },
              { key: '12m', label: 'Last 12 months' },
            ].map((r) => (
              <Button key={r.key} variant={dateRange === r.key ? 'default' : 'outline'} size="sm"
                className={dateRange === r.key ? 'bg-primary hover:bg-primary/90' : ''}
                onClick={() => setDateRange(r.key)}>
                {r.label}
              </Button>
            ))}
          </div>

          {/* Key metrics */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="border-border/50">
              <CardContent className="p-5">
                <div className="flex items-center gap-3 mb-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100 text-amber-700"><EyeIcon className="h-5 w-5" /></div>
                  <p className="text-sm text-muted-foreground">Total Page Views</p>
                </div>
                <p className="text-3xl font-bold">{visitorData.totalPageViews.toLocaleString()}</p>
                <div className="flex items-center gap-1 mt-1">
                  {viewsChange >= 0 ? <ArrowUpRight className="h-3 w-3 text-emerald-600" /> : <ArrowDownRight className="h-3 w-3 text-red-500" />}
                  <span className={`text-xs font-medium ${viewsChange >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>{Math.abs(viewsChange)}% vs yesterday</span>
                </div>
              </CardContent>
            </Card>
            <Card className="border-border/50">
              <CardContent className="p-5">
                <div className="flex items-center gap-3 mb-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700"><Users className="h-5 w-5" /></div>
                  <p className="text-sm text-muted-foreground">Unique Visitors</p>
                </div>
                <p className="text-3xl font-bold">{visitorData.uniqueVisitors.toLocaleString()}</p>
                <div className="flex items-center gap-1 mt-1">
                  {visitorsChange >= 0 ? <ArrowUpRight className="h-3 w-3 text-emerald-600" /> : <ArrowDownRight className="h-3 w-3 text-red-500" />}
                  <span className={`text-xs font-medium ${visitorsChange >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>{Math.abs(visitorsChange)}% vs yesterday</span>
                </div>
              </CardContent>
            </Card>
            <Card className="border-border/50">
              <CardContent className="p-5">
                <div className="flex items-center gap-3 mb-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-100 text-violet-700"><MousePointerClick className="h-5 w-5" /></div>
                  <p className="text-sm text-muted-foreground">Avg. Pages/Visitor</p>
                </div>
                <p className="text-3xl font-bold">{visitorData.avgViewsPerVisitor}</p>
              </CardContent>
            </Card>
            <Card className="border-border/50">
              <CardContent className="p-5">
                <div className="flex items-center gap-3 mb-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-100 text-red-700"><Activity className="h-5 w-5" /></div>
                  <p className="text-sm text-muted-foreground">Bounce Rate</p>
                </div>
                <p className="text-3xl font-bold">{visitorData.bounceRate}%</p>
                <p className="text-xs text-muted-foreground mt-1">Single-page visits</p>
              </CardContent>
            </Card>
          </div>

          {/* Today vs Yesterday summary */}
          <div className="grid grid-cols-2 gap-4">
            <Card className="border-border/50">
              <CardContent className="p-5">
                <p className="text-sm text-muted-foreground mb-1">Today</p>
                <div className="flex items-baseline gap-4">
                  <div><p className="text-2xl font-bold">{visitorData.todayViews}</p><p className="text-xs text-muted-foreground">page views</p></div>
                  <div><p className="text-2xl font-bold">{visitorData.todayVisitors}</p><p className="text-xs text-muted-foreground">visitors</p></div>
                </div>
              </CardContent>
            </Card>
            <Card className="border-border/50">
              <CardContent className="p-5">
                <p className="text-sm text-muted-foreground mb-1">Yesterday</p>
                <div className="flex items-baseline gap-4">
                  <div><p className="text-2xl font-bold">{visitorData.yesterdayViews}</p><p className="text-xs text-muted-foreground">page views</p></div>
                  <div><p className="text-2xl font-bold">{visitorData.yesterdayVisitors}</p><p className="text-xs text-muted-foreground">visitors</p></div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Page Views & Visitors Over Time */}
          <Card className="border-border/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <BarChart2 className="h-4 w-4 text-primary" />Page Views & Visitors Over Time
              </CardTitle>
            </CardHeader>
            <CardContent>
              {chartData.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">No visitor data yet. Data will appear as visitors browse the site.</p>
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={chartData} margin={{ top: 10, right: 20, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                    <XAxis dataKey="date" tick={{ fontSize: 11 }} className="fill-muted-foreground" interval="preserveStartEnd" />
                    <YAxis tick={{ fontSize: 12 }} className="fill-muted-foreground" />
                    <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px', fontSize: '12px' }} />
                    <defs>
                      <linearGradient id="viewsGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#d97706" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#d97706" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="visitorsGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#059669" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#059669" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <Area type="monotone" dataKey="views" name="Page Views" stroke="#d97706" strokeWidth={2} fill="url(#viewsGradient)" />
                    <Area type="monotone" dataKey="visitors" name="Unique Visitors" stroke="#059669" strokeWidth={2} fill="url(#visitorsGradient)" />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Top Pages */}
            <Card className="border-border/50">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                  <BookOpen className="h-4 w-4 text-primary" />Most Visited Pages
                </CardTitle>
              </CardHeader>
              <CardContent>
                {visitorData.topPages.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-8">No page view data yet</p>
                ) : (
                  <div className="space-y-3">
                    {visitorData.topPages.map((tp, i) => (
                      <div key={tp.page} className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50">
                        <div className={`flex h-8 w-8 items-center justify-center rounded-lg font-bold text-xs ${i === 0 ? 'bg-amber-100 text-amber-800' : i === 1 ? 'bg-stone-200 text-stone-700' : i === 2 ? 'bg-orange-100 text-orange-800' : 'bg-muted text-muted-foreground'}`}>
                          #{i + 1}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{formatPageLabel(tp.page)}</p>
                          <p className="text-xs text-muted-foreground">{tp.uniqueVisitors} unique visitors</p>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="text-sm font-semibold">{tp.views.toLocaleString()}</p>
                          <p className="text-[10px] text-muted-foreground">views</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Traffic Sources / Referrers */}
            <Card className="border-border/50">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                  <Globe className="h-4 w-4 text-primary" />Traffic Sources
                </CardTitle>
              </CardHeader>
              <CardContent>
                {visitorData.referrers.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-8">No referrer data yet</p>
                ) : (
                  <div className="space-y-4">
                    <ResponsiveContainer width="100%" height={180}>
                      <PieChart>
                        <Pie
                          data={visitorData.referrers.map((r) => ({ name: r.referrer === 'Direct' ? 'Direct' : (() => { try { return new URL(r.referrer).hostname } catch { return r.referrer } })(), value: r.count }))}
                          cx="50%" cy="50%" innerRadius={40} outerRadius={70} paddingAngle={3} dataKey="value"
                        >
                          {visitorData.referrers.map((_, i) => (
                            <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px', fontSize: '12px' }} />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="space-y-2">
                      {visitorData.referrers.map((r, i) => {
                        const total = visitorData.referrers.reduce((sum, x) => sum + x.count, 0)
                        const pct = total > 0 ? Math.round((r.count / total) * 100) : 0
                        return (
                          <div key={i} className="flex items-center gap-3">
                            <div className="h-3 w-3 rounded-full shrink-0" style={{ backgroundColor: PIE_COLORS[i % PIE_COLORS.length] }} />
                            <p className="text-sm flex-1 truncate">{r.referrer === 'Direct' ? 'Direct / Bookmark' : r.referrer}</p>
                            <p className="text-xs text-muted-foreground shrink-0">{pct}%</p>
                            <p className="text-xs font-semibold w-10 text-right">{r.count}</p>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </>
      )}

      {/* Visitor Analytics empty state */}
      {activeTab === 'visitors' && !visitorData && (
        <Card className="border-border/50">
          <CardContent className="py-16 text-center">
            <EyeIcon className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Visitor Data Yet</h3>
            <p className="text-muted-foreground text-sm max-w-md mx-auto">Visitor analytics will appear here as people browse your website. Page views are tracked automatically.</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

function AnalyticsSkeleton() {
  return (
    <div className="space-y-6">
      <div><Skeleton className="h-8 w-32 mb-2" /><Skeleton className="h-4 w-64" /></div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">{Array.from({ length: 4 }).map((_, i) => (<Card key={i} className="border-border/50"><CardContent className="p-5"><Skeleton className="h-10 w-10 rounded-xl mb-3" /><Skeleton className="h-8 w-20 mb-1" /><Skeleton className="h-3 w-28" /></CardContent></Card>))}</div>
    </div>
  )
}

// ─── Customization Section ───────────────────────────────────────────────────

function CustomizationSection() {
  const [settings, setSettings] = useState<SiteSetting[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)
  const [formFields, setFormFields] = useState<Record<string, string>>({})
  const [logoUploading, setLogoUploading] = useState(false)
  const [faviconUploading, setFaviconUploading] = useState(false)
  const [heroBgUploading, setHeroBgUploading] = useState(false)
  const [logoPreview, setLogoPreview] = useState<string | null>(null)
  const [faviconPreview, setFaviconPreview] = useState<string | null>(null)
  const [heroBgPreview, setHeroBgPreview] = useState<string | null>(null)

  // All customization field keys for loading
  const allSettingKeys = [
    'hero_title', 'hero_subtitle', 'hero_description', 'hero_background_url',
    'cta_title', 'cta_description', 'cta_button_text', 'cta_secondary_button_text',
    'logo_url', 'favicon_url',
    'primary_color', 'accent_color', 'secondary_color', 'background_color', 'text_color', 'font_style',
    'site_name', 'site_tagline', 'site_description',
    'footer_text', 'footer_copyright',
    'social_facebook', 'social_twitter', 'social_instagram', 'social_youtube', 'social_linkedin', 'social_whatsapp',
    'contact_email', 'contact_phone', 'contact_address',
    'about_title', 'about_description',
    'seo_title', 'seo_description', 'seo_keywords',
    'google_analytics_id', 'google_tag_manager_id',
    'maintenance_mode', 'registration_open', 'enable_forum', 'enable_chat', 'enable_live_classes',
    'custom_css', 'custom_header_script', 'custom_footer_script',
    'chatbot_embed_code', 'live_chat_enabled', 'live_chat_welcome_message',
  ]

  const fetchSettings = useCallback(async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/settings')
      if (!res.ok) throw new Error('Failed')
      const data = await res.json()
      setSettings(data)
      const fields: Record<string, string> = {}
      allSettingKeys.forEach((key) => { const existing = data.find((s: SiteSetting) => s.key === key); fields[key] = existing ? existing.value : '' })
      setFormFields(fields)
      setLogoPreview(fields['logo_url'] || '/main-logo.png')
      setFaviconPreview(fields['favicon_url'] || '/logo.svg')
      setHeroBgPreview(fields['hero_background_url'] || '/hero-image.png')
    } catch (err) { console.error(err) } finally { setLoading(false) }
  }, [])

  useEffect(() => { fetchSettings() }, [fetchSettings])

  const handleSave = async () => {
    try {
      setSaving(true); setSaveSuccess(false)
      await Promise.all(Object.entries(formFields).map(([key, value]) => fetch('/api/settings', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ key, value }) })))
      setSaveSuccess(true); setTimeout(() => setSaveSuccess(false), 3000); fetchSettings()
    } catch (err) { console.error(err) } finally { setSaving(false) }
  }

  const updateField = (key: string, value: string) => {
    setFormFields((prev) => ({ ...prev, [key]: value }))
  }

  // Generic image upload handler
  const handleImageUpload = async (file: File, category: string, fieldKey: string, setUploading: (v: boolean) => void, setPreview: (v: string | null) => void) => {
    if (!file.type.startsWith('image/') && !file.type.includes('icon')) {
      alert('Please upload an image file')
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      alert('Image must be less than 5MB')
      return
    }
    try {
      setUploading(true)
      const formData = new FormData()
      formData.append('file', file)
      formData.append('category', category)
      const res = await fetch('/api/upload', { method: 'POST', body: formData })
      if (!res.ok) throw new Error('Upload failed')
      const data = await res.json()
      updateField(fieldKey, data.url)
      setPreview(data.url)
      await fetch('/api/settings', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ key: fieldKey, value: data.url }) })
      setSaveSuccess(true); setTimeout(() => setSaveSuccess(false), 3000)
    } catch (err) { console.error(err); alert('Failed to upload image') }
    finally { setUploading(false) }
  }

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) handleImageUpload(file, 'logo', 'logo_url', setLogoUploading, setLogoPreview)
  }

  const handleFaviconUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) handleImageUpload(file, 'favicon', 'favicon_url', setFaviconUploading, setFaviconPreview)
  }

  const handleHeroBgUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) handleImageUpload(file, 'hero', 'hero_background_url', setHeroBgUploading, setHeroBgPreview)
  }

  const handleRemoveImage = async (fieldKey: string, defaultUrl: string, setPreview: (v: string | null) => void) => {
    updateField(fieldKey, '')
    setPreview(defaultUrl)
    await fetch('/api/settings', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ key: fieldKey, value: '' }) })
  }

  // Reusable image upload row with both file upload and URL input
  const ImageUploadField = ({ label, hint, fieldKey, preview, uploading, onFileUpload, onRemove, defaultUrl }: {
    label: string; hint: string; fieldKey: string; preview: string | null; uploading: boolean
    onFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void; onRemove: () => void; defaultUrl: string
  }) => (
    <div className="space-y-3">
      <Label className="text-sm font-medium">{label}</Label>
      <p className="text-xs text-muted-foreground">{hint}</p>
      <div className="flex items-start gap-4">
        <div className="relative group shrink-0">
          <div className="h-24 w-24 rounded-xl border-2 border-dashed border-border bg-muted/30 flex items-center justify-center overflow-hidden transition-colors group-hover:border-primary/50">
            {uploading ? (
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            ) : preview ? (
              <img src={preview} alt={`${label} preview`} className="h-full w-full object-contain p-1" />
            ) : (
              <ImageIcon className="h-8 w-8 text-muted-foreground/40" />
            )}
          </div>
          {preview && preview !== defaultUrl && !uploading && (
            <button onClick={onRemove} className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center shadow-sm hover:bg-destructive/90 transition-colors" title={`Remove ${label.toLowerCase()}`}>
              <X className="h-3 w-3" />
            </button>
          )}
        </div>
        <div className="flex-1 space-y-3">
          {/* File Upload */}
          <label className="cursor-pointer inline-flex">
            <div className="flex items-center gap-2 px-4 py-2.5 rounded-lg border border-border bg-card hover:bg-muted/50 transition-colors text-sm font-medium text-foreground">
              <Upload className="h-4 w-4 text-primary" />
              {uploading ? 'Uploading...' : 'Upload File'}
            </div>
            <input type="file" accept="image/*,.ico,.svg" className="hidden" onChange={onFileUpload} disabled={uploading} />
          </label>
          {/* URL Input */}
          <div>
            <p className="text-[11px] text-muted-foreground mb-1.5">Or enter a URL:</p>
            <div className="flex items-center gap-2">
              <Input placeholder="https://example.com/image.png" value={formFields[fieldKey] || ''} onChange={(e) => { updateField(fieldKey, e.target.value); if (e.target.value) setPreview(e.target.value) }} className="text-sm" />
              {formFields[fieldKey] && (
                <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0 text-muted-foreground hover:text-destructive" onClick={onRemove} title="Clear">
                  <X className="h-3.5 w-3.5" />
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )

  // Toggle field for boolean settings
  const ToggleField = ({ fieldKey, label, description }: { fieldKey: string; label: string; description: string }) => {
    const isEnabled = formFields[fieldKey] === 'true' || formFields[fieldKey] === '1'
    return (
      <div className="flex items-center justify-between gap-4 py-2">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-foreground">{label}</p>
          <p className="text-xs text-muted-foreground">{description}</p>
        </div>
        <button
          onClick={() => updateField(fieldKey, isEnabled ? 'false' : 'true')}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors shrink-0 ${isEnabled ? 'bg-primary' : 'bg-muted'}`}
        >
          <span className={`inline-block h-4 w-4 rounded-full bg-white shadow-sm transition-transform ${isEnabled ? 'translate-x-6' : 'translate-x-1'}`} />
        </button>
      </div>
    )
  }

  if (loading) return (<div className="space-y-6"><div><Skeleton className="h-8 w-48 mb-2" /><Skeleton className="h-4 w-64" /></div><Card className="border-border/50"><CardContent className="p-6 space-y-4">{Array.from({ length: 5 }).map((_, i) => (<div key={i}><Skeleton className="h-4 w-32 mb-2" /><Skeleton className="h-10 w-full" /></div>))}</CardContent></Card></div>)

  return (
    <div className="space-y-6 max-w-3xl">
      <div><h1 className="text-2xl sm:text-3xl font-bold text-foreground">Customization</h1><p className="text-muted-foreground mt-1">Customize the website appearance, content, and settings</p></div>
      {saveSuccess && (<div className="flex items-center gap-2 p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800"><CheckCircle className="h-4 w-4 shrink-0" /><p className="text-sm font-medium">Changes saved successfully!</p></div>)}

      {/* ── Brand Assets ── */}
      <Card className="border-border/50">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2"><ImageIcon className="h-5 w-5 text-primary" />Brand Assets</CardTitle>
          <CardDescription>Upload your institution logo, favicon, and hero background</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <ImageUploadField label="Institution Logo" hint="Upload your logo image or paste a URL. Recommended: PNG or SVG, at least 200x200px, max 5MB." fieldKey="logo_url" preview={logoPreview} uploading={logoUploading} onFileUpload={handleLogoUpload} onRemove={() => handleRemoveImage('logo_url', '/main-logo.png', setLogoPreview)} defaultUrl="/main-logo.png" />
          <Separator />
          <ImageUploadField label="Favicon" hint="Upload a favicon for browser tabs or paste a URL. Recommended: ICO, PNG, or SVG, 32x32px or 64x64px, max 5MB." fieldKey="favicon_url" preview={faviconPreview} uploading={faviconUploading} onFileUpload={handleFaviconUpload} onRemove={() => handleRemoveImage('favicon_url', '/logo.svg', setFaviconPreview)} defaultUrl="/logo.svg" />
          <Separator />
          <ImageUploadField label="Hero Background Image" hint="Upload a background image for the homepage hero section or paste a URL. Recommended: 1920x1080px, max 5MB." fieldKey="hero_background_url" preview={heroBgPreview} uploading={heroBgUploading} onFileUpload={handleHeroBgUpload} onRemove={() => handleRemoveImage('hero_background_url', '/hero-image.png', setHeroBgPreview)} defaultUrl="/hero-image.png" />
        </CardContent>
      </Card>

      {/* ── Site Identity ── */}
      <Card className="border-border/50">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2"><Globe className="h-5 w-5 text-primary" />Site Identity</CardTitle>
          <CardDescription>Basic information about your institution</CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <div><Label htmlFor="site_name" className="text-sm font-medium mb-1.5 block">Institution Name</Label><Input id="site_name" placeholder="DreamCraft Christian Institute" value={formFields['site_name'] || ''} onChange={(e) => updateField('site_name', e.target.value)} /></div>
          <div><Label htmlFor="site_tagline" className="text-sm font-medium mb-1.5 block">Tagline</Label><Input id="site_tagline" placeholder="Walk in Faith, Grow in Knowledge" value={formFields['site_tagline'] || ''} onChange={(e) => updateField('site_tagline', e.target.value)} /></div>
          <div><Label htmlFor="site_description" className="text-sm font-medium mb-1.5 block">Site Description</Label><Textarea id="site_description" placeholder="A brief description of your institution for search engines and social sharing..." value={formFields['site_description'] || ''} onChange={(e) => updateField('site_description', e.target.value)} rows={3} /></div>
        </CardContent>
      </Card>

      {/* ── Homepage Content ── */}
      <Card className="border-border/50">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2"><BookOpen className="h-5 w-5 text-primary" />Homepage Content</CardTitle>
          <CardDescription>Customize hero section and call-to-action</CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <div><Label htmlFor="hero_title" className="text-sm font-medium mb-1.5 block">Hero Title</Label><Input id="hero_title" placeholder="Welcome to DreamCraft Christian Institute" value={formFields['hero_title'] || ''} onChange={(e) => updateField('hero_title', e.target.value)} /></div>
          <div><Label htmlFor="hero_subtitle" className="text-sm font-medium mb-1.5 block">Hero Subtitle</Label><Input id="hero_subtitle" placeholder="Walk in Faith, Grow in Knowledge" value={formFields['hero_subtitle'] || ''} onChange={(e) => updateField('hero_subtitle', e.target.value)} /></div>
          <div><Label htmlFor="hero_description" className="text-sm font-medium mb-1.5 block">Hero Description</Label><Textarea id="hero_description" placeholder="Discover courses designed to deepen your faith..." value={formFields['hero_description'] || ''} onChange={(e) => updateField('hero_description', e.target.value)} rows={3} /></div>
          <Separator />
          <div><Label htmlFor="cta_title" className="text-sm font-medium mb-1.5 block">CTA Title</Label><Input id="cta_title" placeholder="Start Your Journey Today" value={formFields['cta_title'] || ''} onChange={(e) => updateField('cta_title', e.target.value)} /></div>
          <div><Label htmlFor="cta_description" className="text-sm font-medium mb-1.5 block">CTA Description</Label><Textarea id="cta_description" placeholder="Join thousands of learners..." value={formFields['cta_description'] || ''} onChange={(e) => updateField('cta_description', e.target.value)} rows={3} /></div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div><Label htmlFor="cta_button_text" className="text-sm font-medium mb-1.5 block">Primary Button Text</Label><Input id="cta_button_text" placeholder="Get Started" value={formFields['cta_button_text'] || ''} onChange={(e) => updateField('cta_button_text', e.target.value)} /></div>
            <div><Label htmlFor="cta_secondary_button_text" className="text-sm font-medium mb-1.5 block">Secondary Button Text</Label><Input id="cta_secondary_button_text" placeholder="Browse Courses" value={formFields['cta_secondary_button_text'] || ''} onChange={(e) => updateField('cta_secondary_button_text', e.target.value)} /></div>
          </div>
        </CardContent>
      </Card>

      {/* ── About Section ── */}
      <Card className="border-border/50">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2"><BookMarked className="h-5 w-5 text-primary" />About Section</CardTitle>
          <CardDescription>Customize the About page content</CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <div><Label htmlFor="about_title" className="text-sm font-medium mb-1.5 block">About Title</Label><Input id="about_title" placeholder="About DreamCraft Christian Institute" value={formFields['about_title'] || ''} onChange={(e) => updateField('about_title', e.target.value)} /></div>
          <div><Label htmlFor="about_description" className="text-sm font-medium mb-1.5 block">About Description</Label><Textarea id="about_description" placeholder="Tell visitors about your institution, mission, and values..." value={formFields['about_description'] || ''} onChange={(e) => updateField('about_description', e.target.value)} rows={5} /></div>
        </CardContent>
      </Card>

      {/* ── Theme & Colors ── */}
      <Card className="border-border/50">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2"><Palette className="h-5 w-5 text-primary" />Theme & Colors</CardTitle>
          <CardDescription>Customize the visual appearance of your website</CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg border border-border shrink-0 cursor-pointer overflow-hidden" style={{ backgroundColor: formFields['primary_color'] || '#92400e' }}>
              <input type="color" value={formFields['primary_color'] || '#92400e'} onChange={(e) => updateField('primary_color', e.target.value)} className="h-full w-full opacity-0 cursor-pointer" />
            </div>
            <div className="flex-1"><Label htmlFor="primary_color" className="text-sm font-medium mb-1.5 block">Primary Color</Label><Input id="primary_color" placeholder="#92400e" value={formFields['primary_color'] || ''} onChange={(e) => updateField('primary_color', e.target.value)} /></div>
          </div>
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg border border-border shrink-0 cursor-pointer overflow-hidden" style={{ backgroundColor: formFields['accent_color'] || '#059669' }}>
              <input type="color" value={formFields['accent_color'] || '#059669'} onChange={(e) => updateField('accent_color', e.target.value)} className="h-full w-full opacity-0 cursor-pointer" />
            </div>
            <div className="flex-1"><Label htmlFor="accent_color" className="text-sm font-medium mb-1.5 block">Accent Color</Label><Input id="accent_color" placeholder="#059669" value={formFields['accent_color'] || ''} onChange={(e) => updateField('accent_color', e.target.value)} /></div>
          </div>
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg border border-border shrink-0 cursor-pointer overflow-hidden" style={{ backgroundColor: formFields['secondary_color'] || '#78716c' }}>
              <input type="color" value={formFields['secondary_color'] || '#78716c'} onChange={(e) => updateField('secondary_color', e.target.value)} className="h-full w-full opacity-0 cursor-pointer" />
            </div>
            <div className="flex-1"><Label htmlFor="secondary_color" className="text-sm font-medium mb-1.5 block">Secondary Color</Label><Input id="secondary_color" placeholder="#78716c" value={formFields['secondary_color'] || ''} onChange={(e) => updateField('secondary_color', e.target.value)} /></div>
          </div>
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg border border-border shrink-0 cursor-pointer overflow-hidden" style={{ backgroundColor: formFields['background_color'] || '#ffffff' }}>
              <input type="color" value={formFields['background_color'] || '#ffffff'} onChange={(e) => updateField('background_color', e.target.value)} className="h-full w-full opacity-0 cursor-pointer" />
            </div>
            <div className="flex-1"><Label htmlFor="background_color" className="text-sm font-medium mb-1.5 block">Background Color</Label><Input id="background_color" placeholder="#ffffff" value={formFields['background_color'] || ''} onChange={(e) => updateField('background_color', e.target.value)} /></div>
          </div>
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg border border-border shrink-0 cursor-pointer overflow-hidden" style={{ backgroundColor: formFields['text_color'] || '#1c1917' }}>
              <input type="color" value={formFields['text_color'] || '#1c1917'} onChange={(e) => updateField('text_color', e.target.value)} className="h-full w-full opacity-0 cursor-pointer" />
            </div>
            <div className="flex-1"><Label htmlFor="text_color" className="text-sm font-medium mb-1.5 block">Text Color</Label><Input id="text_color" placeholder="#1c1917" value={formFields['text_color'] || ''} onChange={(e) => updateField('text_color', e.target.value)} /></div>
          </div>
          <Separator />
          <div><Label htmlFor="font_style" className="text-sm font-medium mb-1.5 block">Font Family</Label>
            <Select value={formFields['font_style'] || 'Inter'} onValueChange={(v) => updateField('font_style', v)}>
              <SelectTrigger><SelectValue placeholder="Select font" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="Inter">Inter</SelectItem>
                <SelectItem value="Roboto">Roboto</SelectItem>
                <SelectItem value="Open Sans">Open Sans</SelectItem>
                <SelectItem value="Lato">Lato</SelectItem>
                <SelectItem value="Montserrat">Montserrat</SelectItem>
                <SelectItem value="Poppins">Poppins</SelectItem>
                <SelectItem value="Playfair Display">Playfair Display</SelectItem>
                <SelectItem value="Merriweather">Merriweather</SelectItem>
                <SelectItem value="Source Sans Pro">Source Sans Pro</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* ── Contact Information ── */}
      <Card className="border-border/50">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2"><MessageSquare className="h-5 w-5 text-primary" />Contact Information</CardTitle>
          <CardDescription>Public contact details displayed on the website</CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <div><Label htmlFor="contact_email" className="text-sm font-medium mb-1.5 block">Contact Email</Label><Input id="contact_email" type="email" placeholder="info@dreamcraftinstitute.org" value={formFields['contact_email'] || ''} onChange={(e) => updateField('contact_email', e.target.value)} /></div>
          <div><Label htmlFor="contact_phone" className="text-sm font-medium mb-1.5 block">Contact Phone</Label><Input id="contact_phone" placeholder="+27 12 345 6789" value={formFields['contact_phone'] || ''} onChange={(e) => updateField('contact_phone', e.target.value)} /></div>
          <div><Label htmlFor="contact_address" className="text-sm font-medium mb-1.5 block">Physical Address</Label><Textarea id="contact_address" placeholder="123 Faith Street, Johannesburg, South Africa" value={formFields['contact_address'] || ''} onChange={(e) => updateField('contact_address', e.target.value)} rows={2} /></div>
        </CardContent>
      </Card>

      {/* ── Social Media Links ── */}
      <Card className="border-border/50">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2"><ExternalLink className="h-5 w-5 text-primary" />Social Media Links</CardTitle>
          <CardDescription>Add social media links to the website footer</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div><Label className="text-sm font-medium mb-1.5 block">Facebook</Label><Input placeholder="https://facebook.com/..." value={formFields['social_facebook'] || ''} onChange={(e) => updateField('social_facebook', e.target.value)} /></div>
            <div><Label className="text-sm font-medium mb-1.5 block">Twitter / X</Label><Input placeholder="https://twitter.com/..." value={formFields['social_twitter'] || ''} onChange={(e) => updateField('social_twitter', e.target.value)} /></div>
            <div><Label className="text-sm font-medium mb-1.5 block">Instagram</Label><Input placeholder="https://instagram.com/..." value={formFields['social_instagram'] || ''} onChange={(e) => updateField('social_instagram', e.target.value)} /></div>
            <div><Label className="text-sm font-medium mb-1.5 block">YouTube</Label><Input placeholder="https://youtube.com/..." value={formFields['social_youtube'] || ''} onChange={(e) => updateField('social_youtube', e.target.value)} /></div>
            <div><Label className="text-sm font-medium mb-1.5 block">LinkedIn</Label><Input placeholder="https://linkedin.com/..." value={formFields['social_linkedin'] || ''} onChange={(e) => updateField('social_linkedin', e.target.value)} /></div>
            <div><Label className="text-sm font-medium mb-1.5 block">WhatsApp</Label><Input placeholder="https://wa.me/..." value={formFields['social_whatsapp'] || ''} onChange={(e) => updateField('social_whatsapp', e.target.value)} /></div>
          </div>
        </CardContent>
      </Card>

      {/* ── Footer Settings ── */}
      <Card className="border-border/50">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2"><LayoutDashboard className="h-5 w-5 text-primary" />Footer Settings</CardTitle>
          <CardDescription>Customize the website footer content</CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <div><Label htmlFor="footer_text" className="text-sm font-medium mb-1.5 block">Footer Text</Label><Textarea id="footer_text" placeholder="Empowering faith-driven leaders through quality education..." value={formFields['footer_text'] || ''} onChange={(e) => updateField('footer_text', e.target.value)} rows={3} /></div>
          <div><Label htmlFor="footer_copyright" className="text-sm font-medium mb-1.5 block">Copyright Text</Label><Input id="footer_copyright" placeholder="© 2025 DreamCraft Christian Institute. All rights reserved." value={formFields['footer_copyright'] || ''} onChange={(e) => updateField('footer_copyright', e.target.value)} /></div>
        </CardContent>
      </Card>

      {/* ── SEO Settings ── */}
      <Card className="border-border/50">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2"><Search className="h-5 w-5 text-primary" />SEO Settings</CardTitle>
          <CardDescription>Optimize your website for search engines</CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <div><Label htmlFor="seo_title" className="text-sm font-medium mb-1.5 block">Meta Title</Label><Input id="seo_title" placeholder="DreamCraft Christian Institute - Walk in Faith, Grow in Knowledge" value={formFields['seo_title'] || ''} onChange={(e) => updateField('seo_title', e.target.value)} /></div>
          <div><Label htmlFor="seo_description" className="text-sm font-medium mb-1.5 block">Meta Description</Label><Textarea id="seo_description" placeholder="Discover online courses in Life Coaching, Leadership, Ministry, and Management at DreamCraft Christian Institute..." value={formFields['seo_description'] || ''} onChange={(e) => updateField('seo_description', e.target.value)} rows={3} /></div>
          <div><Label htmlFor="seo_keywords" className="text-sm font-medium mb-1.5 block">Meta Keywords</Label><Input id="seo_keywords" placeholder="christian education, online courses, life coaching, leadership, ministry" value={formFields['seo_keywords'] || ''} onChange={(e) => updateField('seo_keywords', e.target.value)} /></div>
        </CardContent>
      </Card>

      {/* ── Feature Toggles ── */}
      <Card className="border-border/50">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2"><Settings className="h-5 w-5 text-primary" />Feature Toggles</CardTitle>
          <CardDescription>Enable or disable website features</CardDescription>
        </CardHeader>
        <CardContent className="space-y-1">
          <ToggleField fieldKey="maintenance_mode" label="Maintenance Mode" description="Temporarily disable the website for visitors" />
          <Separator />
          <ToggleField fieldKey="registration_open" label="Open Registration" description="Allow new users to register on the platform" />
          <Separator />
          <ToggleField fieldKey="enable_forum" label="Course Forums" description="Enable discussion forums for courses" />
          <Separator />
          <ToggleField fieldKey="enable_chat" label="Private Chat" description="Enable private messaging between students and instructors" />
          <Separator />
          <ToggleField fieldKey="enable_live_classes" label="Live Classes" description="Enable live class scheduling and hosting" />
        </CardContent>
      </Card>

      {/* ── Analytics & Tracking ── */}
      <Card className="border-border/50">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2"><BarChart3 className="h-5 w-5 text-primary" />Analytics & Tracking</CardTitle>
          <CardDescription>Configure analytics and tracking scripts</CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <div><Label htmlFor="google_analytics_id" className="text-sm font-medium mb-1.5 block">Google Analytics ID</Label><Input id="google_analytics_id" placeholder="G-XXXXXXXXXX" value={formFields['google_analytics_id'] || ''} onChange={(e) => updateField('google_analytics_id', e.target.value)} /></div>
          <div><Label htmlFor="google_tag_manager_id" className="text-sm font-medium mb-1.5 block">Google Tag Manager ID</Label><Input id="google_tag_manager_id" placeholder="GTM-XXXXXXX" value={formFields['google_tag_manager_id'] || ''} onChange={(e) => updateField('google_tag_manager_id', e.target.value)} /></div>
        </CardContent>
      </Card>

      {/* ── Custom Code ── */}
      <Card className="border-border/50">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2"><Code className="h-5 w-5 text-primary" />Custom Code</CardTitle>
          <CardDescription>Add custom CSS and scripts to your website</CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <div><Label htmlFor="custom_css" className="text-sm font-medium mb-1.5 block">Custom CSS</Label><Textarea id="custom_css" placeholder="/* Add custom CSS here */" value={formFields['custom_css'] || ''} onChange={(e) => updateField('custom_css', e.target.value)} rows={6} className="font-mono text-sm" /></div>
          <div><Label htmlFor="custom_header_script" className="text-sm font-medium mb-1.5 block">Header Script</Label><Textarea id="custom_header_script" placeholder="<!-- Scripts to include in <head> -->" value={formFields['custom_header_script'] || ''} onChange={(e) => updateField('custom_header_script', e.target.value)} rows={4} className="font-mono text-sm" /></div>
          <div><Label htmlFor="custom_footer_script" className="text-sm font-medium mb-1.5 block">Footer Script</Label><Textarea id="custom_footer_script" placeholder="<!-- Scripts to include before </body> -->" value={formFields['custom_footer_script'] || ''} onChange={(e) => updateField('custom_footer_script', e.target.value)} rows={4} className="font-mono text-sm" /></div>
        </CardContent>
      </Card>

      {/* ── Live Chat & Chatbot ── */}
      <Card className="border-border/50">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2"><MessageCircle className="h-5 w-5 text-primary" />Live Chat & Chatbot</CardTitle>
          <CardDescription>Configure live chat and third-party chatbot integrations</CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <ToggleField fieldKey="live_chat_enabled" label="Enable System Live Chat" description="Allow visitors to start live chat sessions with administrators" />
          <Separator />
          <div><Label htmlFor="live_chat_welcome_message" className="text-sm font-medium mb-1.5 block">Live Chat Welcome Message</Label><Textarea id="live_chat_welcome_message" placeholder="Hello! How can we help you today? An agent will be with you shortly." value={formFields['live_chat_welcome_message'] || ''} onChange={(e) => updateField('live_chat_welcome_message', e.target.value)} rows={3} /></div>
          <Separator />
          <div>
            <Label htmlFor="chatbot_embed_code" className="text-sm font-medium mb-1.5 block">External Chatbot/Chat Widget Embed Code</Label>
            <p className="text-xs text-muted-foreground mb-2">Paste your third-party chatbot or live chat widget HTML/JavaScript code here (e.g., Tawk.to, Crisp, Intercom). This will be embedded on every page.</p>
            <Textarea id="chatbot_embed_code" placeholder="<!-- Paste your chat widget embed code here -->&#10;<script>&#10;  // Example: Tawk.to, Crisp, Intercom embed code&#10;</script>" value={formFields['chatbot_embed_code'] || ''} onChange={(e) => updateField('chatbot_embed_code', e.target.value)} rows={8} className="font-mono text-sm" />
          </div>
        </CardContent>
      </Card>

      <div className="flex items-center justify-end gap-3">
        <Button variant="outline" onClick={fetchSettings}><RefreshCw className="h-4 w-4 mr-2" />Reset</Button>
        <Button className="bg-primary hover:bg-primary/90" onClick={handleSave} disabled={saving}>{saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}Save Changes</Button>
      </div>
    </div>
  )
}

// ─── Appointments Section ────────────────────────────────────────────────────

interface AppointmentData {
  id: string
  title: string
  description: string | null
  status: string
  date: string
  duration: number
  location: string | null
  meetingUrl: string | null
  requesterId: string
  recipientId: string
  requester: { id: string; name: string; email: string; avatar: string | null; role: string }
  recipient: { id: string; name: string; email: string; avatar: string | null; role: string }
  createdAt: string
}

function AppointmentsSection() {
  const { currentUser } = useAppStore()
  const [appointments, setAppointments] = useState<AppointmentData[]>([])
  const [instructors, setInstructors] = useState<{ id: string; name: string }[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [tab, setTab] = useState<'mine' | 'all'>('all')
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [formTitle, setFormTitle] = useState('')
  const [formDescription, setFormDescription] = useState('')
  const [formInstructorId, setFormInstructorId] = useState('')
  const [formDate, setFormDate] = useState('')
  const [formTime, setFormTime] = useState('')
  const [formDuration, setFormDuration] = useState('30')
  const [formLocation, setFormLocation] = useState('')
  const [formMeetingUrl, setFormMeetingUrl] = useState('')

  const fetchAppointments = useCallback(async () => {
    try {
      setLoading(true); setError(null)
      const res = await fetch(`/api/appointments?userId=${currentUser?.id}&role=admin`)
      if (!res.ok) throw new Error('Failed to fetch appointments')
      const data = await res.json()
      setAppointments(data.appointments || data)
    } catch (err) { setError(err instanceof Error ? err.message : 'Failed to load appointments') }
    finally { setLoading(false) }
  }, [currentUser?.id])

  const fetchInstructors = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/users?role=instructor')
      if (!res.ok) throw new Error('Failed to fetch instructors')
      const data = await res.json()
      setInstructors(data.users?.map((u: AdminUser) => ({ id: u.id, name: u.name })) || [])
    } catch (err) { console.error(err) }
  }, [])

  useEffect(() => { fetchAppointments(); fetchInstructors() }, [fetchAppointments, fetchInstructors])

  const handleCreate = async () => {
    if (!formTitle.trim() || !formInstructorId || !formDate || !formTime) return
    try {
      setSubmitting(true)
      const res = await fetch('/api/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'create',
          title: formTitle.trim(),
          description: formDescription.trim() || null,
          requesterId: currentUser?.id,
          recipientId: formInstructorId,
          date: `${formDate}T${formTime}`,
          duration: parseInt(formDuration),
          location: formLocation.trim() || null,
          meetingUrl: formMeetingUrl.trim() || null,
        }),
      })
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}))
        throw new Error(errData.error || 'Failed to create appointment')
      }
      setCreateDialogOpen(false)
      setFormTitle(''); setFormDescription(''); setFormInstructorId(''); setFormDate(''); setFormTime(''); setFormDuration('30'); setFormLocation(''); setFormMeetingUrl('')
      fetchAppointments()
    } catch (err) { console.error(err) } finally { setSubmitting(false) }
  }

  const handleAction = async (appointmentId: string, action: string) => {
    try {
      const body: Record<string, unknown> = {}
      if (action === 'delete') {
        body.action = 'delete'
        body.id = appointmentId
      } else {
        body.action = 'update-status'
        body.id = appointmentId
        body.status = action // 'confirm', 'cancel', or 'complete'
      }
      const res = await fetch('/api/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}))
        throw new Error(errData.error || `Failed to ${action} appointment`)
      }
      fetchAppointments()
    } catch (err) { console.error(err) }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending': return <Badge className="bg-amber-100 text-amber-800 border-amber-200">Pending</Badge>
      case 'confirmed': return <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200">Confirmed</Badge>
      case 'cancelled': return <Badge className="bg-red-100 text-red-800 border-red-200">Cancelled</Badge>
      case 'completed': return <Badge className="bg-primary/10 text-primary border-primary/20">Completed</Badge>
      default: return <Badge variant="secondary">{status}</Badge>
    }
  }

  const displayed = tab === 'mine' ? appointments.filter((a) => a.requesterId === currentUser?.id || a.recipientId === currentUser?.id) : appointments

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div><h1 className="text-2xl sm:text-3xl font-bold text-foreground">Appointments</h1><p className="text-muted-foreground mt-1">Schedule and manage appointments with instructors</p></div>
        <Button className="bg-primary hover:bg-primary/90 shrink-0" onClick={() => setCreateDialogOpen(true)}><Plus className="h-4 w-4 mr-2" />New Appointment</Button>
      </div>

      <Tabs value={tab} onValueChange={(v) => setTab(v as 'mine' | 'all')}>
        <TabsList><TabsTrigger value="all">All Appointments</TabsTrigger><TabsTrigger value="mine">My Appointments</TabsTrigger></TabsList>
      </Tabs>

      {loading ? (
        <div className="space-y-3">{Array.from({ length: 4 }).map((_, i) => (<Skeleton key={i} className="h-20 w-full" />))}</div>
      ) : error ? (
        <div className="text-center py-12"><AlertTriangle className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" /><p className="text-muted-foreground">{error}</p><Button variant="outline" className="mt-4" onClick={fetchAppointments}>Try Again</Button></div>
      ) : displayed.length === 0 ? (
        <div className="text-center py-12"><Calendar className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" /><h3 className="text-lg font-semibold mb-2">No Appointments</h3><p className="text-muted-foreground">Create a new appointment to get started.</p></div>
      ) : (
        <Card className="border-border/50 overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader><TableRow><TableHead>Title</TableHead><TableHead>Status</TableHead><TableHead className="hidden md:table-cell">With</TableHead><TableHead className="hidden sm:table-cell">Date & Time</TableHead><TableHead className="hidden lg:table-cell">Duration</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader>
              <TableBody>{displayed.map((apt) => (
                <TableRow key={apt.id}>
                  <TableCell><div><p className="text-sm font-medium">{apt.title}</p>{apt.description && <p className="text-xs text-muted-foreground truncate max-w-[200px]">{apt.description}</p>}</div></TableCell>
                  <TableCell>{getStatusBadge(apt.status)}</TableCell>
                  <TableCell className="hidden md:table-cell"><div className="flex items-center gap-2"><Avatar className="h-6 w-6"><AvatarFallback className="bg-emerald-100 text-emerald-700 text-[10px]">{getInitials(apt.recipient?.name || 'N/A')}</AvatarFallback></Avatar><span className="text-sm">{apt.recipient?.name || 'N/A'}</span></div></TableCell>
                  <TableCell className="hidden sm:table-cell text-sm text-muted-foreground">{formatDateTime(apt.date)}</TableCell>
                  <TableCell className="hidden lg:table-cell text-sm text-muted-foreground">{apt.duration} min</TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      {apt.status === 'pending' && <Button variant="ghost" size="sm" className="h-7 text-xs text-emerald-600 hover:text-emerald-700" onClick={() => handleAction(apt.id, 'confirm')}>Confirm</Button>}
                      {apt.status === 'pending' && <Button variant="ghost" size="sm" className="h-7 text-xs text-red-600 hover:text-red-700" onClick={() => handleAction(apt.id, 'cancel')}>Cancel</Button>}
                      {apt.status === 'confirmed' && <Button variant="ghost" size="sm" className="h-7 text-xs text-primary hover:text-primary/80" onClick={() => handleAction(apt.id, 'complete')}>Complete</Button>}
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-destructive" onClick={() => handleAction(apt.id, 'delete')}><Trash2 className="h-3.5 w-3.5" /></Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}</TableBody>
            </Table>
          </div>
        </Card>
      )}

      {/* Create Appointment Dialog */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader><DialogTitle>Create New Appointment</DialogTitle><DialogDescription>Schedule an appointment with an instructor.</DialogDescription></DialogHeader>
          <div className="space-y-4 mt-4">
            <div><Label>Title *</Label><Input placeholder="Appointment title" value={formTitle} onChange={(e) => setFormTitle(e.target.value)} className="mt-1.5" /></div>
            <div><Label>Description</Label><Textarea placeholder="Optional description..." value={formDescription} onChange={(e) => setFormDescription(e.target.value)} rows={3} className="mt-1.5" /></div>
            <div><Label>With (Instructor) *</Label><Select value={formInstructorId} onValueChange={setFormInstructorId}><SelectTrigger className="mt-1.5"><SelectValue placeholder="Select instructor" /></SelectTrigger><SelectContent>{instructors.map((inst) => (<SelectItem key={inst.id} value={inst.id}>{inst.name}</SelectItem>))}</SelectContent></Select></div>
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Date *</Label><Input type="date" value={formDate} onChange={(e) => setFormDate(e.target.value)} className="mt-1.5" /></div>
              <div><Label>Time *</Label><Input type="time" value={formTime} onChange={(e) => setFormTime(e.target.value)} className="mt-1.5" /></div>
            </div>
            <div><Label>Duration (minutes)</Label><Select value={formDuration} onValueChange={setFormDuration}><SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="15">15 minutes</SelectItem><SelectItem value="30">30 minutes</SelectItem><SelectItem value="45">45 minutes</SelectItem><SelectItem value="60">1 hour</SelectItem><SelectItem value="90">1.5 hours</SelectItem><SelectItem value="120">2 hours</SelectItem></SelectContent></Select></div>
            <div><Label>Location</Label><Input placeholder="Office, Room, etc." value={formLocation} onChange={(e) => setFormLocation(e.target.value)} className="mt-1.5" /></div>
            <div><Label>Meeting URL</Label><Input placeholder="https://zoom.us/..." value={formMeetingUrl} onChange={(e) => setFormMeetingUrl(e.target.value)} className="mt-1.5" /></div>
          </div>
          <DialogFooter className="mt-6"><Button variant="outline" onClick={() => setCreateDialogOpen(false)}>Cancel</Button><Button className="bg-primary hover:bg-primary/90" onClick={handleCreate} disabled={submitting || !formTitle.trim() || !formInstructorId || !formDate || !formTime}>{submitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}Create</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

// ─── Newsletters Section ─────────────────────────────────────────────────────

interface NewsletterData {
  id: string
  subject: string
  content: string
  status: string
  scheduledAt: string | null
  sentAt: string | null
  createdAt: string
  _count?: { recipients: number }
}

interface SubscriberData {
  id: string
  email: string
  name: string | null
  isActive: boolean
  subscribedAt: string
  unsubscribedAt: string | null
}

interface NewsletterStats {
  subscriberCount: number
  activeSubscriberCount: number
  inactiveSubscriberCount: number
  totalNewslettersSent: number
  draftCount: number
  scheduledCount: number
  totalRecipients: number
}

function NewslettersSection() {
  const { currentUser } = useAppStore()
  const [newsletters, setNewsletters] = useState<NewsletterData[]>([])
  const [subscribers, setSubscribers] = useState<SubscriberData[]>([])
  const [stats, setStats] = useState<NewsletterStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [tab, setTab] = useState<'newsletters' | 'subscribers'>('newsletters')
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [formSubject, setFormSubject] = useState('')
  const [formContent, setFormContent] = useState('')
  const [formStatus, setFormStatus] = useState('draft')
  const [formScheduledDate, setFormScheduledDate] = useState('')

  const fetchNewsletters = useCallback(async () => {
    try {
      setLoading(true); setError(null)
      const [listRes, statsRes] = await Promise.all([
        fetch('/api/newsletter?action=list'),
        fetch('/api/newsletter?action=stats'),
      ])
      if (!listRes.ok || !statsRes.ok) throw new Error('Failed to fetch newsletters')
      const listData = await listRes.json()
      const statsData = await statsRes.json()
      setNewsletters(listData.newsletters || listData)
      setStats(statsData.stats || statsData)
    } catch (err) { setError(err instanceof Error ? err.message : 'Failed to load newsletters') }
    finally { setLoading(false) }
  }, [])

  const fetchSubscribers = useCallback(async () => {
    try {
      const res = await fetch('/api/newsletter?action=subscribers')
      if (!res.ok) throw new Error('Failed to fetch subscribers')
      const data = await res.json()
      setSubscribers(data.subscribers || data)
    } catch (err) { console.error(err) }
  }, [])

  useEffect(() => { fetchNewsletters(); fetchSubscribers() }, [fetchNewsletters, fetchSubscribers])

  const handleCreate = async () => {
    if (!formSubject.trim() || !formContent.trim()) return
    try {
      setSubmitting(true)
      const res = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'create',
          subject: formSubject.trim(),
          content: formContent.trim(),
          createdById: currentUser?.id,
          status: formStatus,
          scheduledAt: formStatus === 'scheduled' && formScheduledDate ? new Date(formScheduledDate).toISOString() : null,
        }),
      })
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}))
        throw new Error(errData.error || 'Failed to create newsletter')
      }
      setCreateDialogOpen(false)
      setFormSubject(''); setFormContent(''); setFormStatus('draft'); setFormScheduledDate('')
      fetchNewsletters()
    } catch (err) { console.error(err) } finally { setSubmitting(false) }
  }

  const handleAction = async (newsletterId: string, action: string) => {
    try {
      const body: Record<string, unknown> = { action }
      if (action === 'send') {
        body.id = newsletterId
      } else if (action === 'send-test') {
        body.id = newsletterId
        body.email = currentUser?.email || ''
      } else if (action === 'delete') {
        body.id = newsletterId
      } else if (action === 'update') {
        body.id = newsletterId
      } else {
        body.id = newsletterId
      }
      const res = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}))
        throw new Error(errData.error || `Failed to ${action} newsletter`)
      }
      fetchNewsletters()
    } catch (err) { console.error(err) }
  }

  const handleRemoveSubscriber = async (subscriberEmail: string) => {
    try {
      const res = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'unsubscribe', email: subscriberEmail }),
      })
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}))
        throw new Error(errData.error || 'Failed to remove subscriber')
      }
      fetchSubscribers(); fetchNewsletters()
    } catch (err) { console.error(err) }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'draft': return <Badge className="bg-gray-100 text-gray-800 border-gray-200">Draft</Badge>
      case 'scheduled': return <Badge className="bg-amber-100 text-amber-800 border-amber-200">Scheduled</Badge>
      case 'sent': return <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200">Sent</Badge>
      default: return <Badge variant="secondary">{status}</Badge>
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div><h1 className="text-2xl sm:text-3xl font-bold text-foreground">Newsletters</h1><p className="text-muted-foreground mt-1">Create and manage email newsletters</p></div>
        <Button className="bg-primary hover:bg-primary/90 shrink-0" onClick={() => setCreateDialogOpen(true)}><Plus className="h-4 w-4 mr-2" />Create Newsletter</Button>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="border-border/50"><CardContent className="p-4"><div className="flex items-center gap-2 mb-1"><Users className="h-4 w-4 text-amber-600" /></div><p className="text-xl font-bold">{stats.subscriberCount}</p><p className="text-xs text-muted-foreground">Total Subscribers</p></CardContent></Card>
          <Card className="border-border/50"><CardContent className="p-4"><div className="flex items-center gap-2 mb-1"><CheckCircle className="h-4 w-4 text-emerald-600" /></div><p className="text-xl font-bold">{stats.activeSubscriberCount}</p><p className="text-xs text-muted-foreground">Active Subscribers</p></CardContent></Card>
          <Card className="border-border/50"><CardContent className="p-4"><div className="flex items-center gap-2 mb-1"><Send className="h-4 w-4 text-primary" /></div><p className="text-xl font-bold">{stats.totalNewslettersSent}</p><p className="text-xs text-muted-foreground">Newsletters Sent</p></CardContent></Card>
          <Card className="border-border/50"><CardContent className="p-4"><div className="flex items-center gap-2 mb-1"><FileText className="h-4 w-4 text-gray-500" /></div><p className="text-xl font-bold">{stats.draftCount}</p><p className="text-xs text-muted-foreground">Draft Newsletters</p></CardContent></Card>
        </div>
      )}

      <Tabs value={tab} onValueChange={(v) => setTab(v as 'newsletters' | 'subscribers')}>
        <TabsList><TabsTrigger value="newsletters">Newsletters</TabsTrigger><TabsTrigger value="subscribers">Subscribers</TabsTrigger></TabsList>
      </Tabs>

      {tab === 'newsletters' ? (
        loading ? <div className="space-y-3">{Array.from({ length: 4 }).map((_, i) => (<Skeleton key={i} className="h-16 w-full" />))}</div>
        : error ? <div className="text-center py-12"><AlertTriangle className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" /><p className="text-muted-foreground">{error}</p><Button variant="outline" className="mt-4" onClick={fetchNewsletters}>Try Again</Button></div>
        : newsletters.length === 0 ? <div className="text-center py-12"><Newspaper className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" /><h3 className="text-lg font-semibold mb-2">No Newsletters</h3><p className="text-muted-foreground">Create your first newsletter to get started.</p></div>
        : (
          <Card className="border-border/50 overflow-hidden">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader><TableRow><TableHead>Subject</TableHead><TableHead>Status</TableHead><TableHead className="hidden md:table-cell">Created</TableHead><TableHead className="hidden sm:table-cell">Scheduled</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader>
                <TableBody>{newsletters.map((nl) => (
                  <TableRow key={nl.id}>
                    <TableCell><p className="text-sm font-medium truncate max-w-[280px]">{nl.subject}</p><p className="text-xs text-muted-foreground truncate max-w-[280px]">{(nl.content || '').slice(0, 80)}{(nl.content || '').length > 80 ? '...' : ''}</p></TableCell>
                    <TableCell>{getStatusBadge(nl.status)}</TableCell>
                    <TableCell className="hidden md:table-cell text-sm text-muted-foreground">{formatDate(nl.createdAt)}</TableCell>
                    <TableCell className="hidden sm:table-cell text-sm text-muted-foreground">{nl.scheduledAt ? formatDateTime(nl.scheduledAt) : '—'}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        {nl.status === 'draft' && <Button variant="ghost" size="sm" className="h-7 text-xs text-emerald-600" onClick={() => handleAction(nl.id, 'send')}>Send Now</Button>}
                        {nl.status === 'draft' && <Button variant="ghost" size="sm" className="h-7 text-xs text-primary" onClick={() => handleAction(nl.id, 'send-test')}>Send Test</Button>}
                        {nl.status === 'draft' && <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={() => handleAction(nl.id, 'edit')}><Pencil className="h-3 w-3" /></Button>}
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-destructive" onClick={() => handleAction(nl.id, 'delete')}><Trash2 className="h-3.5 w-3.5" /></Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}</TableBody>
              </Table>
            </div>
          </Card>
        )
      ) : (
        <Card className="border-border/50 overflow-hidden">
          <CardHeader><CardTitle className="text-base">Subscribers</CardTitle><CardDescription>Manage your newsletter subscriber list</CardDescription></CardHeader>
          <CardContent>
            {subscribers.length === 0 ? <p className="text-sm text-muted-foreground text-center py-6">No subscribers yet</p> : (
              <div className="space-y-2 max-h-96 overflow-y-auto">{subscribers.map((sub) => (
                <div key={sub.id} className="flex items-center justify-between gap-3 p-2.5 rounded-lg hover:bg-muted/50">
                  <div className="flex items-center gap-3 min-w-0">
                    <Avatar className="h-8 w-8"><AvatarFallback className="bg-primary/10 text-primary text-xs">{getInitials(sub.name || sub.email)}</AvatarFallback></Avatar>
                    <div className="min-w-0"><p className="text-sm font-medium truncate">{sub.name || 'Unknown'}</p><p className="text-xs text-muted-foreground truncate">{sub.email}</p></div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Badge className={sub.isActive ? 'bg-emerald-100 text-emerald-800 border-emerald-200' : 'bg-gray-100 text-gray-800 border-gray-200'}>{sub.isActive ? 'Active' : 'Inactive'}</Badge>
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-destructive" onClick={() => handleRemoveSubscriber(sub.email)}><Trash2 className="h-3.5 w-3.5" /></Button>
                  </div>
                </div>
              ))}</div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Create Newsletter Dialog */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader><DialogTitle>Create Newsletter</DialogTitle><DialogDescription>Compose a new newsletter for your subscribers.</DialogDescription></DialogHeader>
          <div className="space-y-4 mt-4">
            <div><Label>Subject *</Label><Input placeholder="Newsletter subject line" value={formSubject} onChange={(e) => setFormSubject(e.target.value)} className="mt-1.5" /></div>
            <div><Label>Content *</Label><Textarea placeholder="Write your newsletter content here..." value={formContent} onChange={(e) => setFormContent(e.target.value)} rows={8} className="mt-1.5" /></div>
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Status</Label><Select value={formStatus} onValueChange={setFormStatus}><SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="draft">Draft</SelectItem><SelectItem value="scheduled">Scheduled</SelectItem></SelectContent></Select></div>
              {formStatus === 'scheduled' && <div><Label>Scheduled Date</Label><Input type="datetime-local" value={formScheduledDate} onChange={(e) => setFormScheduledDate(e.target.value)} className="mt-1.5" /></div>}
            </div>
          </div>
          <DialogFooter className="mt-6"><Button variant="outline" onClick={() => setCreateDialogOpen(false)}>Cancel</Button><Button className="bg-primary hover:bg-primary/90" onClick={handleCreate} disabled={submitting || !formSubject.trim() || !formContent.trim()}>{submitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}Create</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

// ─── Live Chat Management Section ────────────────────────────────────────────

interface ChatSession {
  id: string
  sessionId: string
  visitorName: string
  visitorEmail: string | null
  status: string
  assignedToId: string | null
  assignedTo: { id: string; name: string; email: string; avatar: string | null; role: string } | null
  lastMessageAt: string
  unreadCount: number
  messageCount: number
  lastMessage: { id: string; content: string; senderType: string; senderName: string | null; createdAt: string } | null
  createdAt: string
}

interface LiveChatMessage {
  id: string
  sessionId: string
  content: string
  senderType: string
  senderId: string | null
  senderName: string | null
  isRead: boolean
  createdAt: string
  sender: { id: string; name: string; email: string; avatar: string | null; role: string } | null
}

function LiveChatManagementSection() {
  const { currentUser } = useAppStore()
  const [sessions, setSessions] = useState<ChatSession[]>([])
  const [selectedSession, setSelectedSession] = useState<ChatSession | null>(null)
  const [messages, setMessages] = useState<LiveChatMessage[]>([])
  const [replyText, setReplyText] = useState('')
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const showToast = useCallback((message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3000)
  }, [])

  const fetchSessions = useCallback(async () => {
    try {
      const res = await fetch('/api/live-chat?action=sessions')
      if (!res.ok) throw new Error('Failed to fetch sessions')
      const data = await res.json()
      const mapped: ChatSession[] = data.map((s: Record<string, unknown>) => ({
        id: s.id as string,
        sessionId: s.sessionId as string,
        visitorName: (s.visitorName as string) || 'Anonymous',
        visitorEmail: (s.visitorEmail as string) || null,
        status: s.status as string,
        assignedToId: (s.assignedToId as string) || null,
        assignedTo: s.assignedTo as { id: string; name: string; email: string; avatar: string | null; role: string } | null,
        lastMessageAt: s.updatedAt as string,
        unreadCount: 0,
        messageCount: (s.messageCount as number) || 0,
        lastMessage: (s.lastMessage as { id: string; content: string; senderType: string; senderName: string | null; createdAt: string }) || null,
        createdAt: s.createdAt as string,
      }))
      setSessions(mapped)
      // Update selectedSession if it still exists
      if (selectedSession) {
        const updated = mapped.find(s => s.sessionId === selectedSession.sessionId)
        if (updated) {
          setSelectedSession(updated)
        }
      }
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load sessions')
    } finally {
      setLoading(false)
    }
  }, [selectedSession])

  const fetchMessages = useCallback(async (visitorSessionId: string) => {
    try {
      const res = await fetch(`/api/live-chat?action=messages&sessionId=${encodeURIComponent(visitorSessionId)}`)
      if (!res.ok) throw new Error('Failed to fetch messages')
      const data = await res.json()
      if (Array.isArray(data)) {
        setMessages(data)
      }
    } catch (err) {
      console.error('Failed to fetch messages:', err)
    }
  }, [])

  // Initial load
  useEffect(() => { fetchSessions() }, [])

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Auto-poll every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      fetchSessions()
      if (selectedSession) {
        fetchMessages(selectedSession.sessionId)
      }
    }, 5000)
    return () => clearInterval(interval)
  }, [fetchSessions, fetchMessages, selectedSession])

  const handleSelectSession = async (session: ChatSession) => {
    setSelectedSession(session)
    setMessages([])
    await fetchMessages(session.sessionId)
    // Mark visitor messages as read
    try {
      await fetch('/api/live-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'mark-read', sessionId: session.sessionId }),
      })
    } catch {
      // Silent fail - not critical
    }
  }

  const handleReply = async () => {
    if (!replyText.trim() || !selectedSession || sending) return
    const content = replyText.trim()
    try {
      setSending(true)
      setReplyText('')
      const res = await fetch('/api/live-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'send-message',
          sessionId: selectedSession.sessionId,
          content,
          senderId: currentUser?.id || '',
          senderType: 'admin',
          senderName: currentUser?.name || 'Admin',
        }),
      })
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}))
        throw new Error(errData.error || 'Failed to send message')
      }
      const newMsg = await res.json()
      setMessages(prev => [...prev, newMsg])
      showToast('Message sent')
      fetchSessions()
    } catch (err) {
      setReplyText(content) // Restore message on failure
      showToast(err instanceof Error ? err.message : 'Failed to send message', 'error')
    } finally {
      setSending(false)
    }
  }

  const handleAssignToSelf = async () => {
    if (!selectedSession || actionLoading) return
    try {
      setActionLoading('assign')
      const res = await fetch('/api/live-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'assign',
          sessionId: selectedSession.sessionId,
          assignedToId: currentUser?.id || '',
        }),
      })
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}))
        throw new Error(errData.error || 'Failed to assign session')
      }
      showToast('Session assigned to you')
      await fetchSessions()
      // Also re-fetch to update selectedSession
      const updated = sessions.find(s => s.sessionId === selectedSession.sessionId)
      if (updated) {
        // Will be updated on next fetchSessions
      }
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Failed to assign session', 'error')
    } finally {
      setActionLoading(null)
    }
  }

  const handleCloseSession = async () => {
    if (!selectedSession || actionLoading) return
    try {
      setActionLoading('close')
      const res = await fetch('/api/live-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'close',
          sessionId: selectedSession.sessionId,
        }),
      })
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}))
        throw new Error(errData.error || 'Failed to close session')
      }
      showToast('Session closed')
      setSelectedSession(null)
      setMessages([])
      await fetchSessions()
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Failed to close session', 'error')
    } finally {
      setActionLoading(null)
    }
  }

  const handleRefresh = async () => {
    setLoading(true)
    await fetchSessions()
    if (selectedSession) {
      await fetchMessages(selectedSession.sessionId)
    }
    showToast('Refreshed')
  }

  const totalUnread = sessions.reduce((sum, s) => sum + s.unreadCount, 0)
  const activeSessions = sessions.filter(s => s.status === 'active').length
  const closedSessions = sessions.filter(s => s.status === 'closed').length

  return (
    <div className="space-y-6">
      {/* Toast notification */}
      {toast && (
        <div className={`fixed top-4 right-4 z-[100] px-4 py-3 rounded-lg shadow-lg text-sm font-medium transition-all ${
          toast.type === 'success' ? 'bg-emerald-500 text-white' : 'bg-red-500 text-white'
        }`}>
          {toast.message}
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground flex items-center gap-3">
            <MessageCircle className="h-7 w-7 text-primary" />
            Live Chat
            {totalUnread > 0 && <Badge className="bg-red-500 text-white text-xs px-2">{totalUnread} unread</Badge>}
          </h1>
          <p className="text-muted-foreground mt-1">Manage live chat sessions with website visitors</p>
        </div>
        <Button variant="outline" onClick={handleRefresh} disabled={loading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="border-border/50">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-foreground">{sessions.length}</p>
            <p className="text-xs text-muted-foreground">Total Sessions</p>
          </CardContent>
        </Card>
        <Card className="border-border/50">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-emerald-600">{activeSessions}</p>
            <p className="text-xs text-muted-foreground">Active</p>
          </CardContent>
        </Card>
        <Card className="border-border/50">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-gray-500">{closedSessions}</p>
            <p className="text-xs text-muted-foreground">Closed</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      {loading && sessions.length === 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-64 w-full" />
          ))}
        </div>
      ) : error ? (
        <div className="text-center py-12">
          <AlertTriangle className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
          <p className="text-muted-foreground mb-4">{error}</p>
          <Button variant="outline" onClick={handleRefresh}>Try Again</Button>
        </div>
      ) : sessions.length === 0 ? (
        <div className="text-center py-12">
          <MessageCircle className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No Chat Sessions</h3>
          <p className="text-muted-foreground">When visitors start a live chat, their sessions will appear here.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 min-h-[500px]">
          {/* Sessions List */}
          <Card className="border-border/50 lg:col-span-1">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Users className="h-4 w-4 text-primary" />
                Sessions
                <Badge variant="secondary" className="text-[10px]">{sessions.length}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <ScrollArea className="max-h-[450px]">
                <div className="space-y-1 px-3 pb-3">
                  {sessions.map((session) => (
                    <button
                      key={session.id}
                      onClick={() => handleSelectSession(session)}
                      className={`w-full text-left p-3 rounded-lg transition-all duration-150 ${
                        selectedSession?.sessionId === session.sessionId
                          ? 'bg-primary/10 border border-primary/30 shadow-sm'
                          : 'hover:bg-muted/50 border border-transparent'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <p className="text-sm font-medium truncate">{session.visitorName}</p>
                        <div className="flex items-center gap-1.5 shrink-0">
                          <Badge className={`text-[10px] ${
                            session.status === 'active'
                              ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
                              : session.status === 'closed'
                              ? 'bg-gray-100 text-gray-800 border-gray-200'
                              : 'bg-amber-100 text-amber-800 border-amber-200'
                          }`}>
                            {session.status}
                          </Badge>
                        </div>
                      </div>
                      {session.lastMessage && (
                        <p className="text-xs text-muted-foreground truncate">{session.lastMessage.content}</p>
                      )}
                      {!session.lastMessage && (
                        <p className="text-xs text-muted-foreground italic">No messages yet</p>
                      )}
                      <div className="flex items-center gap-2 mt-1">
                        <p className="text-[10px] text-muted-foreground">{formatDateTime(session.lastMessageAt)}</p>
                        {session.assignedTo && (
                          <p className="text-[10px] text-primary">· Assigned: {session.assignedTo.name}</p>
                        )}
                        {session.messageCount > 0 && (
                          <p className="text-[10px] text-muted-foreground">· {session.messageCount} msgs</p>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>

          {/* Chat Thread */}
          <Card className="border-border/50 lg:col-span-2 flex flex-col">
            {selectedSession ? (
              <>
                {/* Chat Header */}
                <CardHeader className="pb-3 border-b shrink-0">
                  <div className="flex items-center justify-between">
                    <div className="min-w-0 flex-1">
                      <CardTitle className="text-base truncate">{selectedSession.visitorName}</CardTitle>
                      <p className="text-xs text-muted-foreground truncate">
                        {selectedSession.visitorEmail || 'No email'}
                        {' · '}
                        <span className={selectedSession.status === 'active' ? 'text-emerald-600' : selectedSession.status === 'closed' ? 'text-gray-500' : 'text-amber-600'}>
                          {selectedSession.status}
                        </span>
                        {selectedSession.assignedTo && (
                          <> · Assigned: {selectedSession.assignedTo.name}</>
                        )}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0 ml-3">
                      {selectedSession.status !== 'closed' && !selectedSession.assignedToId && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-8 text-xs"
                          onClick={handleAssignToSelf}
                          disabled={actionLoading === 'assign'}
                        >
                          {actionLoading === 'assign' ? (
                            <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                          ) : (
                            <UserPlus className="h-3 w-3 mr-1" />
                          )}
                          Assign to Me
                        </Button>
                      )}
                      {selectedSession.status !== 'closed' && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-8 text-xs text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
                          onClick={handleCloseSession}
                          disabled={actionLoading === 'close'}
                        >
                          {actionLoading === 'close' ? (
                            <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                          ) : (
                            <XCircle className="h-3 w-3 mr-1" />
                          )}
                          Close
                        </Button>
                      )}
                    </div>
                  </div>
                </CardHeader>

                {/* Messages */}
                <CardContent className="flex-1 p-4 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 400px)', minHeight: '200px' }}>
                  <div className="space-y-3">
                    {messages.length === 0 && (
                      <div className="text-center py-8">
                        <Bot className="h-10 w-10 text-muted-foreground/20 mx-auto mb-3" />
                        <p className="text-sm text-muted-foreground">No messages in this conversation yet</p>
                      </div>
                    )}
                    {messages.map((msg) => {
                      const isAdmin = msg.senderType === 'admin'
                      return (
                        <div key={msg.id} className={`flex ${isAdmin ? 'justify-end' : 'justify-start'}`}>
                          <div className={`max-w-[80%] rounded-2xl px-4 py-2.5 ${
                            isAdmin
                              ? 'bg-primary text-primary-foreground rounded-br-sm'
                              : 'bg-muted text-foreground rounded-bl-sm'
                          }`}>
                            {!isAdmin && msg.senderName && (
                              <p className="text-[10px] font-semibold text-primary mb-0.5">{msg.senderName}</p>
                            )}
                            {isAdmin && msg.sender?.name && (
                              <p className="text-[10px] font-semibold text-primary-foreground/70 mb-0.5">{msg.sender.name}</p>
                            )}
                            <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">{msg.content}</p>
                            <p className={`text-[10px] mt-1 ${
                              isAdmin ? 'text-primary-foreground/60' : 'text-muted-foreground'
                            }`}>
                              {formatDateTime(msg.createdAt)}
                            </p>
                          </div>
                        </div>
                      )
                    })}
                    <div ref={messagesEndRef} />
                  </div>
                </CardContent>

                {/* Reply Input */}
                {selectedSession.status !== 'closed' && (
                  <div className="p-4 border-t shrink-0">
                    <form
                      onSubmit={(e) => { e.preventDefault(); handleReply() }}
                      className="flex items-center gap-2"
                    >
                      <Input
                        placeholder="Type your reply..."
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        className="flex-1 h-10"
                        disabled={sending}
                        maxLength={2000}
                      />
                      <Button
                        type="submit"
                        className="bg-primary hover:bg-primary/90 shrink-0 h-10 w-10 p-0"
                        disabled={sending || !replyText.trim()}
                      >
                        {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                      </Button>
                    </form>
                  </div>
                )}

                {/* Closed notice */}
                {selectedSession.status === 'closed' && (
                  <div className="p-4 border-t bg-muted/30 shrink-0">
                    <p className="text-sm text-muted-foreground text-center">
                      This conversation has been closed. No further messages can be sent.
                    </p>
                  </div>
                )}
              </>
            ) : (
              <CardContent className="flex-1 flex items-center justify-center">
                <div className="text-center">
                  <MessageCircle className="h-16 w-16 text-muted-foreground/20 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-foreground mb-1">No Conversation Selected</h3>
                  <p className="text-sm text-muted-foreground">Click on a session from the list to view the conversation</p>
                </div>
              </CardContent>
            )}
          </Card>
        </div>
      )}
    </div>
  )
}

// ─── Library Section ─────────────────────────────────────────────────────────

function LibrarySection() {
  const { navigate } = useAppStore()
  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl sm:text-3xl font-bold text-foreground">Library Management</h1><p className="text-muted-foreground mt-1">Manage digital library resources</p></div>
      <Card className="border-border/50"><CardContent className="p-8 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-amber-100 mx-auto mb-4"><Library className="h-8 w-8 text-amber-700" /></div>
        <h2 className="text-xl font-bold text-foreground mb-2">Digital Library</h2>
        <p className="text-muted-foreground max-w-md mx-auto mb-6">Access the full digital library to browse, add, and manage resources.</p>
        <Button className="bg-primary hover:bg-primary/90" onClick={() => navigate('library')}><BookOpen className="h-4 w-4 mr-2" />Open Library<ExternalLink className="h-4 w-4 ml-2" /></Button>
      </CardContent></Card>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="border-border/50"><CardContent className="p-4 text-center"><BookOpen className="h-6 w-6 text-amber-600 mx-auto mb-2" /><p className="text-lg font-bold">Books</p></CardContent></Card>
        <Card className="border-border/50"><CardContent className="p-4 text-center"><FileQuestion className="h-6 w-6 text-emerald-600 mx-auto mb-2" /><p className="text-lg font-bold">Articles</p></CardContent></Card>
        <Card className="border-border/50"><CardContent className="p-4 text-center"><Video className="h-6 w-6 text-rose-600 mx-auto mb-2" /><p className="text-lg font-bold">Videos</p></CardContent></Card>
        <Card className="border-border/50"><CardContent className="p-4 text-center"><BookMarked className="h-6 w-6 text-violet-600 mx-auto mb-2" /><p className="text-lg font-bold">Documents</p></CardContent></Card>
      </div>
    </div>
  )
}

// ─── Settings Section ────────────────────────────────────────────────────────

function SettingsSection() {
  const [settings, setSettings] = useState<SiteSetting[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)
  const [formFields, setFormFields] = useState<Record<string, string>>({})

  const settingsConfig = [
    { key: 'institute_name', label: 'Institute Name', type: 'text', placeholder: 'DreamCraft Christian Institute' },
    { key: 'tagline', label: 'Tagline', type: 'text', placeholder: 'Walk in Faith, Grow in Knowledge' },
    { key: 'contact_email', label: 'Contact Email', type: 'text', placeholder: 'info@dreamcraftinstitute.org' },
    { key: 'contact_phone', label: 'Contact Phone', type: 'text', placeholder: '+1 (555) 123-4567' },
    { key: 'address', label: 'Address', type: 'text', placeholder: '123 Faith Avenue, Nairobi, Kenya' },
    { key: 'welcome_message', label: 'Welcome Message', type: 'textarea', placeholder: 'Welcome to DreamCraft Christian Institute...' },
    { key: 'footer_text', label: 'Footer Text', type: 'text', placeholder: '© 2025 DreamCraft Christian Institute' },
    { key: 'social_facebook', label: 'Facebook URL', type: 'text', placeholder: 'https://facebook.com/dreamcraft' },
    { key: 'social_twitter', label: 'Twitter URL', type: 'text', placeholder: 'https://twitter.com/dreamcraft' },
    { key: 'social_youtube', label: 'YouTube URL', type: 'text', placeholder: 'https://youtube.com/dreamcraft' },
  ]

  const fetchSettings = useCallback(async () => {
    try {
      setLoading(true); setError(null)
      const res = await fetch('/api/settings')
      if (!res.ok) throw new Error('Failed')
      const data = await res.json()
      setSettings(data)
      const fields: Record<string, string> = {}
      settingsConfig.forEach((c) => { const existing = data.find((s: SiteSetting) => s.key === c.key); fields[c.key] = existing ? existing.value : '' })
      setFormFields(fields)
    } catch (err) { setError(err instanceof Error ? err.message : 'Failed') } finally { setLoading(false) }
  }, [])

  useEffect(() => { fetchSettings() }, [fetchSettings])

  const handleSave = async () => {
    try {
      setSaving(true); setSaveSuccess(false)
      await Promise.all(Object.entries(formFields).map(([key, value]) => fetch('/api/settings', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ key, value }) })))
      setSaveSuccess(true); setTimeout(() => setSaveSuccess(false), 3000); fetchSettings()
    } catch (err) { console.error(err) } finally { setSaving(false) }
  }

  const updateField = (key: string, value: string) => setFormFields((prev) => ({ ...prev, [key]: value }))

  if (loading) return (<div className="space-y-6"><div><Skeleton className="h-8 w-40 mb-2" /><Skeleton className="h-4 w-64" /></div><Card className="border-border/50"><CardContent className="p-6 space-y-4">{Array.from({ length: 5 }).map((_, i) => (<div key={i}><Skeleton className="h-4 w-32 mb-2" /><Skeleton className="h-10 w-full" /></div>))}</CardContent></Card></div>)
  if (error) return (<div className="text-center py-16"><AlertTriangle className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" /><p className="text-muted-foreground mb-4">{error}</p><Button variant="outline" onClick={fetchSettings}>Try Again</Button></div>)

  return (
    <div className="space-y-6 max-w-3xl">
      <div><h1 className="text-2xl sm:text-3xl font-bold text-foreground">Site Settings</h1><p className="text-muted-foreground mt-1">Configure your learning management system</p></div>
      {saveSuccess && (<div className="flex items-center gap-2 p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800"><CheckCircle className="h-4 w-4 shrink-0" /><p className="text-sm font-medium">Settings saved!</p></div>)}
      <Card className="border-border/50">
        <CardHeader><CardTitle className="text-lg">General Settings</CardTitle><CardDescription>Manage your institute information</CardDescription></CardHeader>
        <CardContent className="space-y-5">
          <div><h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">Institute Information</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {settingsConfig.filter(c => ['institute_name', 'tagline', 'contact_email', 'contact_phone', 'address'].includes(c.key)).map((c) => (
                <div key={c.key} className={c.key === 'address' ? 'sm:col-span-2' : ''}><Label htmlFor={c.key} className="text-sm font-medium mb-1.5 block">{c.label}</Label><Input id={c.key} placeholder={c.placeholder} value={formFields[c.key] || ''} onChange={(e) => updateField(c.key, e.target.value)} /></div>
              ))}
            </div>
          </div>
          <Separator />
          <div><h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">Content</h3>
            <div className="space-y-4">
              {settingsConfig.filter(c => ['welcome_message', 'footer_text'].includes(c.key)).map((c) => (
                <div key={c.key}><Label htmlFor={c.key} className="text-sm font-medium mb-1.5 block">{c.label}</Label>
                  {c.type === 'textarea' ? <Textarea id={c.key} placeholder={c.placeholder} value={formFields[c.key] || ''} onChange={(e) => updateField(c.key, e.target.value)} rows={3} />
                    : <Input id={c.key} placeholder={c.placeholder} value={formFields[c.key] || ''} onChange={(e) => updateField(c.key, e.target.value)} />}
                </div>
              ))}
            </div>
          </div>
          <Separator />
          <div><h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">Social Media</h3>
            <div className="space-y-4">
              {settingsConfig.filter(c => c.key.startsWith('social_')).map((c) => (
                <div key={c.key}><Label htmlFor={c.key} className="text-sm font-medium mb-1.5 block">{c.label}</Label><Input id={c.key} placeholder={c.placeholder} value={formFields[c.key] || ''} onChange={(e) => updateField(c.key, e.target.value)} /></div>
              ))}
            </div>
          </div>
          <Separator />
          <div className="flex items-center justify-end gap-3">
            <Button variant="outline" onClick={fetchSettings}>Reset</Button>
            <Button className="bg-primary hover:bg-primary/90" onClick={handleSave} disabled={saving}>{saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}Save Settings</Button>
          </div>
        </CardContent>
      </Card>
      <Card className="border-border/50">
        <CardHeader><CardTitle className="text-lg">All Settings</CardTitle><CardDescription>Settings stored in database</CardDescription></CardHeader>
        <CardContent>
          {settings.length === 0 ? <p className="text-sm text-muted-foreground text-center py-4">No custom settings</p> : (
            <div className="space-y-2 max-h-64 overflow-y-auto">{settings.map((s) => (
              <div key={s.id} className="flex items-center gap-3 p-2 rounded hover:bg-muted/50">
                <span className="text-xs font-mono font-medium text-primary w-40 truncate">{s.key}</span>
                <span className="text-xs text-muted-foreground flex-1 truncate">{s.value}</span>
                <span className="text-[10px] text-muted-foreground shrink-0">{formatDate(s.updatedAt)}</span>
              </div>
            ))}</div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

// ─── Certificate Orders Section ────────────────────────────────────────────

interface CertOrder {
  id: string
  userId: string
  certificateId: string | null
  orderType: string
  quantity: number
  amount: number
  currency: string
  paymentMethod: string
  paymentStatus: string
  orderStatus: string
  paymentReference: string | null
  recipientName: string
  recipientPhone: string | null
  recipientEmail: string | null
  shippingAddress: string | null
  city: string | null
  country: string
  notes: string | null
  adminNotes: string | null
  createdAt: string
  updatedAt: string
  user: { id: string; name: string; email: string; phone: string | null }
  certificate: {
    course: { title: string } | null
  } | null
}

function CertificateOrdersSection() {
  const [orders, setOrders] = useState<CertOrder[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedOrder, setSelectedOrder] = useState<CertOrder | null>(null)
  const [showDetail, setShowDetail] = useState(false)
  const [updating, setUpdating] = useState(false)
  const [adminNotes, setAdminNotes] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [filterPayment, setFilterPayment] = useState('all')

  const fetchOrders = useCallback(async () => {
    try {
      const res = await fetch('/api/certificate-orders?role=admin')
      if (res.ok) {
        const data = await res.json()
        setOrders(data)
      }
    } catch { /* silent */ }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { fetchOrders() }, [fetchOrders])

  const handleUpdateOrder = async (orderId: string, updates: Record<string, string>) => {
    setUpdating(true)
    try {
      const res = await fetch('/api/certificate-orders', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId, ...updates }),
      })
      if (res.ok) {
        await fetchOrders()
        if (selectedOrder?.id === orderId) {
          setSelectedOrder(prev => prev ? { ...prev, ...updates } : null)
        }
      }
    } catch { /* silent */ }
    finally { setUpdating(false) }
  }

  const getPaymentMethodIcon = (method: string) => {
    switch (method) {
      case 'bank': return <Building2 className="h-4 w-4 text-blue-600" />
      case 'airtel_money': return <Smartphone className="h-4 w-4 text-red-600" />
      case 'tnm_mpamba': return <Phone className="h-4 w-4 text-orange-600" />
      default: return <CreditCard className="h-4 w-4" />
    }
  }

  const getPaymentMethodLabel = (method: string) => {
    switch (method) {
      case 'bank': return 'Bank Transfer'
      case 'airtel_money': return 'Airtel Money'
      case 'tnm_mpamba': return 'TNM Mpamba'
      default: return method
    }
  }

  const getPaymentStatusBadge = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-emerald-100 text-emerald-800 border-emerald-200'
      case 'pending': return 'bg-amber-100 text-amber-800 border-amber-200'
      case 'failed': return 'bg-red-100 text-red-800 border-red-200'
      case 'refunded': return 'bg-gray-100 text-gray-800 border-gray-200'
      default: return 'bg-muted text-muted-foreground'
    }
  }

  const getOrderStatusBadge = (status: string) => {
    switch (status) {
      case 'delivered': return 'bg-emerald-100 text-emerald-800 border-emerald-200'
      case 'processing': return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'shipped': return 'bg-purple-100 text-purple-800 border-purple-200'
      case 'pending': return 'bg-amber-100 text-amber-800 border-amber-200'
      case 'cancelled': return 'bg-red-100 text-red-800 border-red-200'
      default: return 'bg-muted text-muted-foreground'
    }
  }

  const formatCurrency = (amount: number, currency: string = 'USD') => {
    if (currency === 'USD') {
      return `$${amount} (MK ${(amount * 1750).toLocaleString()})`
    }
    return `MK ${amount.toLocaleString()}`
  }

  // Stats
  const totalOrders = orders.length
  const pendingPayment = orders.filter(o => o.paymentStatus === 'pending').length
  const paidOrders = orders.filter(o => o.paymentStatus === 'paid').length
  const totalRevenue = orders.filter(o => o.paymentStatus === 'paid').reduce((sum, o) => sum + o.amount, 0)
  const totalRevenueMwk = totalRevenue * 1750

  // Filtered orders
  const filteredOrders = orders.filter(o => {
    if (filterStatus !== 'all' && o.orderStatus !== filterStatus) return false
    if (filterPayment !== 'all' && o.paymentStatus !== filterPayment) return false
    return true
  })

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-24" />)}
        </div>
        <Skeleton className="h-96" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100">
          <ShoppingBag className="h-5 w-5 text-amber-700" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-foreground">Certificate Orders</h2>
          <p className="text-sm text-muted-foreground">Manage certificate and diploma orders</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card className="border-border/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <Package className="h-4 w-4 text-amber-600" />
              <span className="text-xs text-muted-foreground">Total Orders</span>
            </div>
            <p className="text-2xl font-bold text-foreground">{totalOrders}</p>
          </CardContent>
        </Card>
        <Card className="border-border/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <Clock className="h-4 w-4 text-amber-600" />
              <span className="text-xs text-muted-foreground">Pending Payment</span>
            </div>
            <p className="text-2xl font-bold text-amber-700">{pendingPayment}</p>
          </CardContent>
        </Card>
        <Card className="border-border/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <CheckCircle className="h-4 w-4 text-emerald-600" />
              <span className="text-xs text-muted-foreground">Paid Orders</span>
            </div>
            <p className="text-2xl font-bold text-emerald-700">{paidOrders}</p>
          </CardContent>
        </Card>
        <Card className="border-border/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <Award className="h-4 w-4 text-primary" />
              <span className="text-xs text-muted-foreground">Revenue</span>
            </div>
            <p className="text-lg font-bold text-primary">${totalRevenue} (MK {totalRevenueMwk.toLocaleString()})</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <Select value={filterPayment} onValueChange={setFilterPayment}>
          <SelectTrigger className="w-44"><SelectValue placeholder="Payment Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Payment</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="paid">Paid</SelectItem>
            <SelectItem value="failed">Failed</SelectItem>
            <SelectItem value="refunded">Refunded</SelectItem>
          </SelectContent>
        </Select>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-44"><SelectValue placeholder="Order Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Orders</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="processing">Processing</SelectItem>
            <SelectItem value="shipped">Shipped</SelectItem>
            <SelectItem value="delivered">Delivered</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
        <Button variant="outline" size="sm" onClick={fetchOrders}>
          <RefreshCw className="h-3.5 w-3.5 mr-1.5" />
          Refresh
        </Button>
      </div>

      {/* Orders Table */}
      <Card className="border-border/50">
        <CardHeader>
          <CardTitle className="text-lg">All Orders</CardTitle>
          <CardDescription>{filteredOrders.length} orders found</CardDescription>
        </CardHeader>
        <CardContent>
          {filteredOrders.length === 0 ? (
            <div className="text-center py-12">
              <ShoppingBag className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
              <p className="text-muted-foreground">No orders found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order</TableHead>
                    <TableHead>Student</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Payment</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredOrders.map((order) => (
                    <TableRow key={order.id} className="cursor-pointer hover:bg-muted/50" onClick={() => { setSelectedOrder(order); setAdminNotes(order.adminNotes || ''); setShowDetail(true) }}>
                      <TableCell>
                        <span className="font-mono text-xs text-primary">{order.id.slice(-8).toUpperCase()}</span>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="text-sm font-medium text-foreground">{order.recipientName}</p>
                          <p className="text-xs text-muted-foreground">{order.user?.email}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1.5">
                          {order.orderType === 'diploma' ? <GraduationCap className="h-3.5 w-3.5 text-amber-600" /> : <Award className="h-3.5 w-3.5 text-amber-600" />}
                          <span className="text-sm capitalize">{order.orderType}</span>
                          {order.quantity > 1 && <span className="text-xs text-muted-foreground">×{order.quantity}</span>}
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm font-medium">{formatCurrency(order.amount)}</span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1.5">
                          {getPaymentMethodIcon(order.paymentMethod)}
                          <Badge className={`${getPaymentStatusBadge(order.paymentStatus)} text-[10px]`}>
                            {order.paymentStatus}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={`${getOrderStatusBadge(order.orderStatus)} text-[10px]`}>
                          {order.orderStatus}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <span className="text-xs text-muted-foreground">{formatDate(order.createdAt)}</span>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => { e.stopPropagation(); setSelectedOrder(order); setAdminNotes(order.adminNotes || ''); setShowDetail(true) }}
                        >
                          View
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Order Detail Dialog */}
      <Dialog open={showDetail} onOpenChange={setShowDetail}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ShoppingBag className="h-5 w-5 text-primary" />
              Order Details — {selectedOrder?.id.slice(-8).toUpperCase()}
            </DialogTitle>
            <DialogDescription>Certificate order information and management</DialogDescription>
          </DialogHeader>

          {selectedOrder && (
            <div className="space-y-5">
              {/* Order Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Order Type</p>
                  <div className="flex items-center gap-2">
                    {selectedOrder.orderType === 'diploma' ? <GraduationCap className="h-4 w-4 text-amber-600" /> : <Award className="h-4 w-4 text-amber-600" />}
                    <span className="font-medium capitalize">{selectedOrder.orderType}</span>
                    {selectedOrder.quantity > 1 && <span className="text-sm text-muted-foreground">×{selectedOrder.quantity}</span>}
                  </div>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Amount</p>
                  <p className="text-lg font-bold text-primary">{formatCurrency(selectedOrder.amount)}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Payment Method</p>
                  <div className="flex items-center gap-2">
                    {getPaymentMethodIcon(selectedOrder.paymentMethod)}
                    <span className="text-sm">{getPaymentMethodLabel(selectedOrder.paymentMethod)}</span>
                  </div>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Payment Reference</p>
                  <p className="text-sm font-mono">{selectedOrder.paymentReference || '—'}</p>
                </div>
              </div>

              <Separator />

              {/* Student Info */}
              <div>
                <h4 className="text-sm font-semibold text-muted-foreground mb-2">Student Information</h4>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-xs text-muted-foreground">Name</p>
                    <p className="font-medium">{selectedOrder.recipientName}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Email</p>
                    <p className="font-medium">{selectedOrder.user?.email}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Phone</p>
                    <p className="font-medium">{selectedOrder.recipientPhone || selectedOrder.user?.phone || '—'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Course</p>
                    <p className="font-medium">{selectedOrder.certificate?.course?.title || '—'}</p>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Shipping */}
              <div>
                <h4 className="text-sm font-semibold text-muted-foreground mb-2">Shipping Address</h4>
                <div className="text-sm space-y-1">
                  <p>{selectedOrder.shippingAddress || '—'}</p>
                  <p>{[selectedOrder.city, selectedOrder.country].filter(Boolean).join(', ') || '—'}</p>
                </div>
              </div>

              {selectedOrder.notes && (
                <>
                  <Separator />
                  <div>
                    <h4 className="text-sm font-semibold text-muted-foreground mb-2">Student Notes</h4>
                    <p className="text-sm bg-secondary/50 p-3 rounded">{selectedOrder.notes}</p>
                  </div>
                </>
              )}

              <Separator />

              {/* Status Badges */}
              <div className="flex items-center gap-4">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Payment Status</p>
                  <Badge className={`${getPaymentStatusBadge(selectedOrder.paymentStatus)} text-sm`}>
                    {selectedOrder.paymentStatus}
                  </Badge>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Order Status</p>
                  <Badge className={`${getOrderStatusBadge(selectedOrder.orderStatus)} text-sm`}>
                    {selectedOrder.orderStatus}
                  </Badge>
                </div>
              </div>

              {/* Admin Actions */}
              <Separator />
              <div>
                <h4 className="text-sm font-semibold text-muted-foreground mb-3">Admin Actions</h4>
                <div className="space-y-4">
                  {/* Payment Status */}
                  <div>
                    <Label className="text-xs text-muted-foreground">Update Payment Status</Label>
                    <div className="flex flex-wrap gap-2 mt-1.5">
                      {['pending', 'paid', 'failed', 'refunded'].map((status) => (
                        <Button
                          key={status}
                          variant={selectedOrder.paymentStatus === status ? 'default' : 'outline'}
                          size="sm"
                          disabled={updating}
                          onClick={() => handleUpdateOrder(selectedOrder.id, { paymentStatus: status })}
                        >
                          {status}
                        </Button>
                      ))}
                    </div>
                  </div>

                  {/* Order Status */}
                  <div>
                    <Label className="text-xs text-muted-foreground">Update Order Status</Label>
                    <div className="flex flex-wrap gap-2 mt-1.5">
                      {['pending', 'processing', 'shipped', 'delivered', 'cancelled'].map((status) => (
                        <Button
                          key={status}
                          variant={selectedOrder.orderStatus === status ? 'default' : 'outline'}
                          size="sm"
                          disabled={updating}
                          onClick={() => handleUpdateOrder(selectedOrder.id, { orderStatus: status })}
                        >
                          {status}
                        </Button>
                      ))}
                    </div>
                  </div>

                  {/* Admin Notes */}
                  <div>
                    <Label className="text-xs text-muted-foreground">Admin Notes</Label>
                    <Textarea
                      value={adminNotes}
                      onChange={(e) => setAdminNotes(e.target.value)}
                      placeholder="Add internal notes about this order..."
                      className="mt-1.5"
                      rows={3}
                    />
                    <Button
                      size="sm"
                      className="mt-2"
                      disabled={updating}
                      onClick={() => handleUpdateOrder(selectedOrder.id, { adminNotes })}
                    >
                      {updating ? <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" /> : <Save className="h-3.5 w-3.5 mr-1.5" />}
                      Save Notes
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

// ─── Donations Section ────────────────────────────────────────────────────────

interface DonationRecord {
  id: string
  donorName: string
  donorEmail: string
  donorPhone: string | null
  amountUsd: number
  amountMwk: number
  paymentMethod: string
  paymentStatus: string
  paymentReference: string | null
  message: string | null
  emailSentToDonor: boolean
  emailSentToAdmin: boolean
  userId: string | null
  createdAt: string
  user: { id: string; name: string; email: string } | null
}

function DonationsSection() {
  const [donations, setDonations] = useState<DonationRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)
  const [filterStatus, setFilterStatus] = useState('all')
  const [selectedDonation, setSelectedDonation] = useState<DonationRecord | null>(null)
  const [showDetail, setShowDetail] = useState(false)

  const fetchDonations = useCallback(async () => {
    try {
      const res = await fetch('/api/donations?role=admin')
      if (res.ok) {
        const data = await res.json()
        setDonations(data)
      }
    } catch { /* silent */ }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { fetchDonations() }, [fetchDonations])

  const handleUpdateStatus = async (donationId: string, paymentStatus: string) => {
    setUpdating(true)
    try {
      const res = await fetch('/api/donations', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ donationId, paymentStatus }),
      })
      if (res.ok) {
        await fetchDonations()
        if (selectedDonation?.id === donationId) {
          setSelectedDonation(prev => prev ? { ...prev, paymentStatus } : null)
        }
      }
    } catch { /* silent */ }
    finally { setUpdating(false) }
  }

  const getPaymentMethodLabel = (method: string) => {
    switch (method) {
      case 'bank': return 'Bank Transfer'
      case 'airtel_money': return 'Airtel Money'
      case 'tnm_mpamba': return 'TNM Mpamba'
      default: return method
    }
  }

  const getPaymentMethodIcon = (method: string) => {
    switch (method) {
      case 'bank': return <Building2 className="h-4 w-4 text-blue-600" />
      case 'airtel_money': return <Smartphone className="h-4 w-4 text-red-600" />
      case 'tnm_mpamba': return <Phone className="h-4 w-4 text-orange-600" />
      default: return <CreditCard className="h-4 w-4" />
    }
  }

  const getPaymentStatusBadge = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-emerald-100 text-emerald-800 border-emerald-200'
      case 'pending': return 'bg-amber-100 text-amber-800 border-amber-200'
      case 'failed': return 'bg-red-100 text-red-800 border-red-200'
      default: return 'bg-muted text-muted-foreground'
    }
  }

  // Stats
  const totalDonations = donations.length
  const totalAmountUsd = donations.reduce((sum, d) => sum + d.amountUsd, 0)
  const totalAmountMwk = donations.reduce((sum, d) => sum + d.amountMwk, 0)
  const confirmedDonations = donations.filter(d => d.paymentStatus === 'confirmed')
  const confirmedUsd = confirmedDonations.reduce((sum, d) => sum + d.amountUsd, 0)
  const confirmedMwk = confirmedDonations.reduce((sum, d) => sum + d.amountMwk, 0)
  const pendingDonations = donations.filter(d => d.paymentStatus === 'pending')
  const pendingUsd = pendingDonations.reduce((sum, d) => sum + d.amountUsd, 0)

  // Filtered donations
  const filteredDonations = donations.filter(d => {
    if (filterStatus !== 'all' && d.paymentStatus !== filterStatus) return false
    return true
  })

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-24" />)}
        </div>
        <Skeleton className="h-96" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-100">
          <Heart className="h-5 w-5 text-rose-700" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-foreground">Donations</h2>
          <p className="text-sm text-muted-foreground">Manage and track donations</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card className="border-border/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <Heart className="h-4 w-4 text-rose-600" />
              <span className="text-xs text-muted-foreground">Total Donations</span>
            </div>
            <p className="text-2xl font-bold text-foreground">{totalDonations}</p>
            <p className="text-xs text-muted-foreground">${totalAmountUsd.toFixed(2)} total</p>
          </CardContent>
        </Card>
        <Card className="border-border/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <CheckCircle className="h-4 w-4 text-emerald-600" />
              <span className="text-xs text-muted-foreground">Confirmed</span>
            </div>
            <p className="text-2xl font-bold text-emerald-600">${confirmedUsd.toFixed(2)}</p>
            <p className="text-xs text-muted-foreground">MK {confirmedMwk.toLocaleString()}</p>
          </CardContent>
        </Card>
        <Card className="border-border/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <Clock className="h-4 w-4 text-amber-600" />
              <span className="text-xs text-muted-foreground">Pending</span>
            </div>
            <p className="text-2xl font-bold text-amber-600">${pendingUsd.toFixed(2)}</p>
            <p className="text-xs text-muted-foreground">{pendingDonations.length} donation{pendingDonations.length !== 1 ? 's' : ''}</p>
          </CardContent>
        </Card>
        <Card className="border-border/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <DollarSign className="h-4 w-4 text-primary" />
              <span className="text-xs text-muted-foreground">Total MWK</span>
            </div>
            <p className="text-2xl font-bold text-foreground">MK {totalAmountMwk.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground">All donations</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3">
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="confirmed">Confirmed</SelectItem>
            <SelectItem value="failed">Failed</SelectItem>
          </SelectContent>
        </Select>
        <span className="text-sm text-muted-foreground">
          {filteredDonations.length} donation{filteredDonations.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Donations List */}
      {filteredDonations.length === 0 ? (
        <Card className="border-border/50">
          <CardContent className="p-8 text-center">
            <Heart className="h-12 w-12 text-muted-foreground/20 mx-auto mb-3" />
            <p className="text-sm font-medium text-muted-foreground">No donations found</p>
            <p className="text-xs text-muted-foreground/70 mt-1">Donations will appear here when someone makes a donation</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3 max-h-[600px] overflow-y-auto">
          {filteredDonations.map((donation) => (
            <Card key={donation.id} className="border-border/50 hover:border-border transition-colors">
              <CardContent className="p-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      {getPaymentMethodIcon(donation.paymentMethod)}
                      <span className="font-semibold text-foreground">{donation.donorName}</span>
                      <Badge className={`${getPaymentStatusBadge(donation.paymentStatus)} text-xs`}>
                        {donation.paymentStatus}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground flex-wrap">
                      <span>${donation.amountUsd.toFixed(2)} (MK {donation.amountMwk.toLocaleString()})</span>
                      <span>•</span>
                      <span>{getPaymentMethodLabel(donation.paymentMethod)}</span>
                      <span>•</span>
                      <span>{donation.donorEmail}</span>
                      <span>•</span>
                      <span>{formatDate(donation.createdAt)}</span>
                    </div>
                    {donation.message && (
                      <p className="text-xs text-muted-foreground mt-1 italic truncate max-w-md">&quot;{donation.message}&quot;</p>
                    )}
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {donation.paymentStatus === 'pending' && (
                      <>
                        <Button
                          size="sm"
                          className="h-8 text-xs bg-emerald-600 hover:bg-emerald-700"
                          disabled={updating}
                          onClick={() => handleUpdateStatus(donation.id, 'confirmed')}
                        >
                          Confirm
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-8 text-xs text-red-600 border-red-200 hover:bg-red-50"
                          disabled={updating}
                          onClick={() => handleUpdateStatus(donation.id, 'failed')}
                        >
                          Reject
                        </Button>
                      </>
                    )}
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-8 text-xs"
                      onClick={() => {
                        setSelectedDonation(donation)
                        setShowDetail(true)
                      }}
                    >
                      View
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Donation Detail Dialog */}
      <Dialog open={showDetail} onOpenChange={setShowDetail}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Heart className="h-5 w-5 text-rose-600" />
              Donation Details
            </DialogTitle>
            <DialogDescription>
              Review and manage this donation
            </DialogDescription>
          </DialogHeader>
          {selectedDonation && (
            <div className="space-y-4">
              <div className="text-center">
                <p className="text-3xl font-bold text-primary">${selectedDonation.amountUsd.toFixed(2)}</p>
                <p className="text-muted-foreground">MK {selectedDonation.amountMwk.toLocaleString()}</p>
              </div>

              <Separator />

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Donor Name</span>
                  <span className="font-medium">{selectedDonation.donorName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Email</span>
                  <span className="font-medium">{selectedDonation.donorEmail}</span>
                </div>
                {selectedDonation.donorPhone && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Phone</span>
                    <span className="font-medium">{selectedDonation.donorPhone}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Payment Method</span>
                  <span className="font-medium">{getPaymentMethodLabel(selectedDonation.paymentMethod)}</span>
                </div>
                {selectedDonation.paymentReference && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Reference</span>
                    <span className="font-medium font-mono text-xs">{selectedDonation.paymentReference}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Status</span>
                  <Badge className={getPaymentStatusBadge(selectedDonation.paymentStatus)}>
                    {selectedDonation.paymentStatus}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Date</span>
                  <span className="font-medium">{formatDateTime(selectedDonation.createdAt)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Email Sent</span>
                  <span className="font-medium">{selectedDonation.emailSentToDonor ? 'Yes' : 'No'}</span>
                </div>
                {selectedDonation.user && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Registered User</span>
                    <span className="font-medium">{selectedDonation.user.name}</span>
                  </div>
                )}
              </div>

              {selectedDonation.message && (
                <>
                  <Separator />
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Donor Message</p>
                    <p className="text-sm text-foreground bg-secondary/50 p-3 rounded-lg">&quot;{selectedDonation.message}&quot;</p>
                  </div>
                </>
              )}

              {selectedDonation.paymentStatus === 'pending' && (
                <>
                  <Separator />
                  <div className="flex gap-2">
                    <Button
                      className="flex-1 bg-emerald-600 hover:bg-emerald-700"
                      disabled={updating}
                      onClick={() => handleUpdateStatus(selectedDonation.id, 'confirmed')}
                    >
                      <CheckCircle className="h-4 w-4 mr-1" />
                      Confirm Payment
                    </Button>
                    <Button
                      variant="outline"
                      className="text-red-600 border-red-200 hover:bg-red-50"
                      disabled={updating}
                      onClick={() => handleUpdateStatus(selectedDonation.id, 'failed')}
                    >
                      Mark Failed
                    </Button>
                  </div>
                </>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
