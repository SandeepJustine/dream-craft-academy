'use client'

import { useState, useEffect, useCallback, useSyncExternalStore } from 'react'
import { useAppStore, type Page } from '@/lib/store'
import { useTheme } from 'next-themes'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from '@/components/ui/sheet'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { 
  BookOpen, 
  Menu, 
  Home, 
  GraduationCap, 
  LayoutDashboard, 
  Info, 
  FileText, 
  LogIn,
  LogOut,
  Award,
  Video,
  ChevronDown,
  User,
  BookMarked,
  Shield,
  Sun,
  Moon,
  Bell,
  Mail,
  Trophy,
  MessageSquare,
  Check,
  CheckCheck,
  Heart,
} from 'lucide-react'

interface NotificationItem {
  id: string
  userId: string
  type: string
  title: string
  message: string
  isRead: boolean
  courseId: string | null
  link: string | null
  createdAt: string
}

const emptySubscribe = () => () => {}

function useMounted() {
  return useSyncExternalStore(emptySubscribe, () => true, () => false)
}

const publicNavItems: { page: Page; label: string; icon: React.ReactNode }[] = [
  { page: 'home', label: 'Home', icon: <Home className="h-4 w-4" /> },
  { page: 'courses', label: 'Courses', icon: <BookOpen className="h-4 w-4" /> },
  { page: 'about', label: 'About Us', icon: <Info className="h-4 w-4" /> },
  { page: 'doctrine', label: 'Our Doctrine', icon: <FileText className="h-4 w-4" /> },
  { page: 'apply', label: 'Apply', icon: <GraduationCap className="h-4 w-4" /> },
  { page: 'donate', label: 'Donate', icon: <Heart className="h-4 w-4" /> },
]

const authNavItems: { page: Page; label: string; icon: React.ReactNode }[] = [
  { page: 'home', label: 'Home', icon: <Home className="h-4 w-4" /> },
  { page: 'courses', label: 'Courses', icon: <BookOpen className="h-4 w-4" /> },
  { page: 'dashboard', label: 'My Learning', icon: <LayoutDashboard className="h-4 w-4" /> },
  { page: 'library', label: 'Library', icon: <BookMarked className="h-4 w-4" /> },
  { page: 'live-classes', label: 'Live Classes', icon: <Video className="h-4 w-4" /> },
  { page: 'certificates', label: 'Certificates', icon: <Award className="h-4 w-4" /> },
  { page: 'donate', label: 'Donate', icon: <Heart className="h-4 w-4" /> },
]

function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const mounted = useMounted()

  if (!mounted) {
    return (
      <Button variant="ghost" size="icon" className="h-9 w-9" aria-label="Toggle theme">
        <Sun className="h-4 w-4" />
      </Button>
    )
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      className="h-9 w-9"
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
      aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      {theme === 'dark' ? (
        <Sun className="h-4 w-4 text-amber-400" />
      ) : (
        <Moon className="h-4 w-4" />
      )}
    </Button>
  )
}

function getNotificationIcon(type: string) {
  switch (type) {
    case 'enrollment':
      return <Mail className="h-4 w-4 text-primary" />
    case 'completion':
      return <Trophy className="h-4 w-4 text-amber-500" />
    case 'message':
      return <MessageSquare className="h-4 w-4 text-emerald-500" />
    default:
      return <Bell className="h-4 w-4 text-muted-foreground" />
  }
}

function formatTimeAgo(dateStr: string): string {
  const date = new Date(dateStr)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffSeconds = Math.floor(diffMs / 1000)
  const diffMinutes = Math.floor(diffSeconds / 60)
  const diffHours = Math.floor(diffMinutes / 60)
  const diffDays = Math.floor(diffHours / 24)

  if (diffSeconds < 60) return 'Just now'
  if (diffMinutes < 60) return `${diffMinutes}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays < 7) return `${diffDays}d ago`
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

function NotificationBell({ userId }: { userId: string }) {
  const [notifications, setNotifications] = useState<NotificationItem[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(false)
  const [open, setOpen] = useState(false)
  const { navigate } = useAppStore()

  useEffect(() => {
    if (!userId) return
    const load = async () => {
      try {
        const res = await fetch(`/api/notifications?userId=${userId}`)
        if (res.ok) {
          const data = await res.json()
          setNotifications(data.notifications || [])
          setUnreadCount(data.unreadCount || 0)
        }
      } catch (err) {
        console.error('Error fetching notifications:', err)
      }
    }
    const interval = setInterval(load, 30000)
    // Queue initial load via setTimeout to avoid synchronous setState in effect
    const initialTimer = setTimeout(load, 0)
    return () => {
      clearInterval(interval)
      clearTimeout(initialTimer)
    }
  }, [userId])

  const markAsRead = async (notificationId: string) => {
    try {
      await fetch('/api/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'mark-read', notificationId }),
      })
      setNotifications((prev) =>
        prev.map((n) => (n.id === notificationId ? { ...n, isRead: true } : n))
      )
      setUnreadCount((prev) => Math.max(0, prev - 1))
    } catch (err) {
      console.error('Error marking notification as read:', err)
    }
  }

  const markAllAsRead = async () => {
    try {
      await fetch('/api/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'mark-all-read', userId }),
      })
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })))
      setUnreadCount(0)
    } catch (err) {
      console.error('Error marking all notifications as read:', err)
    }
  }

  const handleNotificationClick = (notification: NotificationItem) => {
    if (!notification.isRead) {
      markAsRead(notification.id)
    }
    if (notification.link) {
      const link = notification.link
      if (link === '/courses') {
        navigate('courses')
      } else if (link === '/certificates') {
        navigate('certificates')
      } else if (link === '/chat') {
        if (notification.courseId) {
          navigate('chat', { forumCourseId: notification.courseId })
        } else {
          navigate('dashboard')
        }
      } else {
        navigate('dashboard')
      }
    }
    setOpen(false)
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9 relative"
          aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ''}`}
        >
          <Bell className="h-4 w-4" />
          {unreadCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-destructive-foreground px-1">
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 p-0">
        <div className="flex items-center justify-between p-3 border-b">
          <h3 className="text-sm font-semibold text-foreground">Notifications</h3>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="h-7 text-xs text-primary hover:text-primary/80 px-2"
              onClick={markAllAsRead}
            >
              <CheckCheck className="h-3.5 w-3.5 mr-1" />
              Mark all read
            </Button>
          )}
        </div>
        <ScrollArea className="max-h-96">
          {loading ? (
            <div className="p-4 text-center text-sm text-muted-foreground">Loading...</div>
          ) : notifications.length === 0 ? (
            <div className="p-6 text-center">
              <Bell className="h-8 w-8 text-muted-foreground/30 mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">No notifications yet</p>
            </div>
          ) : (
            <div className="divide-y divide-border/50">
              {notifications.map((notification) => (
                <button
                  key={notification.id}
                  className={`w-full text-left p-3 hover:bg-accent/50 transition-colors cursor-pointer ${
                    !notification.isRead ? 'bg-primary/5' : ''
                  }`}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div className="flex gap-3">
                    <div className="shrink-0 mt-0.5">
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <p className={`text-sm leading-tight ${!notification.isRead ? 'font-semibold text-foreground' : 'font-medium text-foreground/80'}`}>
                          {notification.title}
                        </p>
                        {!notification.isRead && (
                          <span className="shrink-0 h-2 w-2 rounded-full bg-primary mt-1.5" />
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2 leading-relaxed">
                        {notification.message}
                      </p>
                      <p className="text-[10px] text-muted-foreground/70 mt-1.5">
                        {formatTimeAgo(notification.createdAt)}
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </ScrollArea>
        {notifications.length > 0 && (
          <div className="border-t p-2">
            <Button
              variant="ghost"
              size="sm"
              className="w-full text-xs text-muted-foreground hover:text-foreground"
              onClick={() => {
                navigate('dashboard')
                setOpen(false)
              }}
            >
              View Dashboard
            </Button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  )
}

export function Navbar() {
  const { currentPage, navigate, currentUser, setUser } = useAppStore()
  const { theme, setTheme } = useTheme()
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [mobileNotifOpen, setMobileNotifOpen] = useState(false)
  const mounted = useMounted()

  const isLoggedIn = !!currentUser
  const navItems = isLoggedIn ? authNavItems : publicNavItems

  // Mobile notification state
  const [mobileNotifications, setMobileNotifications] = useState<NotificationItem[]>([])
  const [mobileUnreadCount, setMobileUnreadCount] = useState(0)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Fetch notifications count for mobile badge
  useEffect(() => {
    if (!currentUser) return
    const load = async () => {
      try {
        const res = await fetch(`/api/notifications?userId=${currentUser.id}`)
        if (res.ok) {
          const data = await res.json()
          setMobileUnreadCount(data.unreadCount || 0)
        }
      } catch {
        // ignore
      }
    }
    const interval = setInterval(load, 30000)
    // Queue initial load via setTimeout to avoid synchronous setState in effect
    const initialTimer = setTimeout(load, 0)
    return () => {
      clearInterval(interval)
      clearTimeout(initialTimer)
    }
  }, [currentUser])

  // Fetch mobile notifications when panel opens
  useEffect(() => {
    if (!mobileNotifOpen || !currentUser) return
    const fetchNotifs = async () => {
      try {
        const res = await fetch(`/api/notifications?userId=${currentUser.id}`)
        if (res.ok) {
          const data = await res.json()
          setMobileNotifications(data.notifications || [])
        }
      } catch {
        // ignore
      }
    }
    fetchNotifs()
  }, [mobileNotifOpen, currentUser])

  const markMobileAsRead = async (notificationId: string) => {
    try {
      await fetch('/api/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'mark-read', notificationId }),
      })
      setMobileNotifications((prev) =>
        prev.map((n) => (n.id === notificationId ? { ...n, isRead: true } : n))
      )
      setMobileUnreadCount((prev) => Math.max(0, prev - 1))
    } catch {
      // ignore
    }
  }

  const markAllMobileAsRead = async () => {
    if (!currentUser) return
    try {
      await fetch('/api/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'mark-all-read', userId: currentUser.id }),
      })
      setMobileNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })))
      setMobileUnreadCount(0)
    } catch {
      // ignore
    }
  }

  const handleSignOut = () => {
    setUser(null)
    navigate('home')
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <header
      className={`sticky top-0 z-50 w-full transition-all duration-300 ${
        scrolled
          ? 'bg-background/90 backdrop-blur-md shadow-sm border-b border-border/50'
          : 'bg-background/70 backdrop-blur-sm'
      }`}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <button
            onClick={() => navigate('home')}
            className="flex items-center gap-2.5 transition-opacity hover:opacity-80"
          >
            <img src="/main-logo.png" alt="DreamCraft Christian Institute" className="h-9 w-9 rounded-lg object-cover" />
            <div className="flex flex-col">
              <span className="text-base font-bold leading-tight text-foreground tracking-tight">
                DreamCraft
              </span>
              <span className="text-[10px] font-medium text-muted-foreground leading-tight tracking-wider uppercase">
                Christian Institute
              </span>
            </div>
          </button>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-1">
            {navItems.filter(item => item.page !== 'donate').map((item) => (
              <button
                key={item.page}
                onClick={() => navigate(item.page)}
                className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                  currentPage === item.page
                    ? 'text-primary bg-primary/5'
                    : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                }`}
              >
                {item.label}
              </button>
            ))}
            {/* Donate Button - Prominent */}
            <button
              onClick={() => navigate('donate')}
              className={`ml-1 flex items-center gap-1.5 px-4 py-2 text-sm font-semibold rounded-full transition-all ${
                currentPage === 'donate'
                  ? 'bg-rose-600 text-white shadow-md'
                  : 'bg-rose-500/10 text-rose-600 hover:bg-rose-500 hover:text-white shadow-sm hover:shadow-md'
              }`}
            >
              <Heart className="h-4 w-4" />
              Donate
            </button>
          </nav>

          {/* Desktop Actions */}
          <div className="hidden lg:flex items-center gap-3">
            {/* Theme Toggle */}
            <ThemeToggle />

            {/* Notification Bell */}
            {isLoggedIn && currentUser && (
              <NotificationBell userId={currentUser.id} />
            )}

            {isLoggedIn ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-accent transition-colors focus:outline-none">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={currentUser.avatar || undefined} alt={currentUser.name} />
                      <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
                        {getInitials(currentUser.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="hidden xl:block text-left">
                      <p className="text-sm font-medium text-foreground leading-tight">{currentUser.name}</p>
                      <p className="text-[10px] text-muted-foreground leading-tight">{currentUser.role === 'admin' ? 'Admin' : currentUser.role === 'instructor' ? 'Instructor' : 'Student'}</p>
                    </div>
                    <ChevronDown className="h-3.5 w-3.5 text-muted-foreground hidden xl:block" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{currentUser.name}</p>
                      <p className="text-xs text-muted-foreground leading-none">{currentUser.email}</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => navigate('dashboard')} className="cursor-pointer">
                    <LayoutDashboard className="h-4 w-4 mr-2" />
                    My Learning
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate('certificates')} className="cursor-pointer">
                    <Award className="h-4 w-4 mr-2" />
                    My Certificates
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate('live-classes')} className="cursor-pointer">
                    <Video className="h-4 w-4 mr-2" />
                    Live Classes
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate('profile')} className="cursor-pointer">
                    <User className="h-4 w-4 mr-2" />
                    My Profile
                  </DropdownMenuItem>
                  {currentUser.role === 'instructor' && (
                    <DropdownMenuItem onClick={() => navigate('instructor-dashboard')} className="cursor-pointer">
                      <GraduationCap className="h-4 w-4 mr-2" />
                      Instructor Portal
                    </DropdownMenuItem>
                  )}
                  {currentUser.role === 'admin' && (
                    <DropdownMenuItem onClick={() => navigate('admin-dashboard')} className="cursor-pointer">
                      <Shield className="h-4 w-4 mr-2" />
                      Admin Panel
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer text-destructive focus:text-destructive">
                    <LogOut className="h-4 w-4 mr-2" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate('login')}
                  className="text-sm"
                >
                  <LogIn className="h-4 w-4 mr-1.5" />
                  Sign In
                </Button>
                <Button
                  size="sm"
                  onClick={() => navigate('register')}
                  className="bg-primary hover:bg-primary/90 text-sm"
                >
                  <GraduationCap className="h-4 w-4 mr-1.5" />
                  Enroll Free
                </Button>
              </>
            )}
          </div>

          {/* Mobile Menu */}
          <div className="flex items-center gap-2 lg:hidden">
            <ThemeToggle />
            {/* Mobile Notification Bell */}
            {isLoggedIn && (
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9 relative"
                onClick={() => setMobileNotifOpen(true)}
                aria-label={`Notifications${mobileUnreadCount > 0 ? ` (${mobileUnreadCount} unread)` : ''}`}
              >
                <Bell className="h-4 w-4" />
                {mobileUnreadCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-destructive-foreground px-1">
                    {mobileUnreadCount > 99 ? '99+' : mobileUnreadCount}
                  </span>
                )}
              </Button>
            )}
            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] p-0">
                <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
                <div className="flex flex-col h-full">
                  <div className="flex items-center justify-between p-4 border-b">
                    <div className="flex items-center gap-2">
                      <img src="/main-logo.png" alt="DreamCraft" className="h-8 w-8 rounded-lg object-cover" />
                      <span className="font-bold text-sm">DreamCraft</span>
                    </div>
                  </div>

                  {/* User info in mobile when logged in */}
                  {isLoggedIn && (
                    <div className="p-4 border-b bg-primary/5">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={currentUser!.avatar || undefined} alt={currentUser!.name} />
                          <AvatarFallback className="bg-primary/10 text-primary text-sm font-semibold">
                            {getInitials(currentUser!.name)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-sm font-medium text-foreground">{currentUser!.name}</p>
                          <p className="text-xs text-muted-foreground">{currentUser!.email}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  <nav className="flex-1 p-4 space-y-1">
                    {navItems.filter(item => item.page !== 'donate').map((item) => (
                      <button
                        key={item.page}
                        onClick={() => {
                          navigate(item.page)
                          setMobileOpen(false)
                        }}
                        className={`w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-lg transition-colors ${
                          currentPage === item.page
                            ? 'text-primary bg-primary/5'
                            : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                        }`}
                      >
                        {item.icon}
                        {item.label}
                      </button>
                    ))}
                    {/* Donate Button - Prominent in mobile */}
                    <button
                      onClick={() => {
                        navigate('donate')
                        setMobileOpen(false)
                      }}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 text-sm font-semibold rounded-lg transition-all ${
                        currentPage === 'donate'
                          ? 'bg-rose-600 text-white'
                          : 'bg-rose-500/10 text-rose-600 hover:bg-rose-500/20'
                      }`}
                    >
                      <Heart className="h-4 w-4" />
                      Donate
                    </button>
                    {isLoggedIn && currentUser?.role === 'instructor' && (
                      <button
                        onClick={() => {
                          navigate('instructor-dashboard')
                          setMobileOpen(false)
                        }}
                        className={`w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-lg transition-colors ${
                          currentPage === 'instructor-dashboard' || currentPage.startsWith('instructor-')
                            ? 'text-primary bg-primary/5'
                            : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                        }`}
                      >
                        <GraduationCap className="h-4 w-4" />
                        Instructor Portal
                      </button>
                    )}
                    {isLoggedIn && currentUser?.role === 'admin' && (
                      <button
                        onClick={() => {
                          navigate('admin-dashboard')
                          setMobileOpen(false)
                        }}
                        className={`w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-lg transition-colors ${
                          currentPage.startsWith('admin-')
                            ? 'text-primary bg-primary/5'
                            : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                        }`}
                      >
                        <Shield className="h-4 w-4" />
                        Admin Panel
                      </button>
                    )}
                  </nav>
                  <div className="p-4 border-t space-y-2">
                    {/* Mobile theme toggle */}
                    <div className="flex items-center justify-between px-3 py-2">
                      <span className="text-sm text-muted-foreground">
                        {mounted && theme === 'dark' ? 'Night Mode' : 'Day Mode'}
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                        className="gap-2"
                      >
                        {mounted && theme === 'dark' ? (
                          <>
                            <Sun className="h-4 w-4 text-amber-400" />
                            <span className="text-xs">Day</span>
                          </>
                        ) : (
                          <>
                            <Moon className="h-4 w-4" />
                            <span className="text-xs">Night</span>
                          </>
                        )}
                      </Button>
                    </div>
                    {isLoggedIn ? (
                      <Button
                        variant="outline"
                        className="w-full text-destructive border-destructive/20 hover:bg-destructive/5 hover:text-destructive"
                        onClick={() => {
                          handleSignOut()
                          setMobileOpen(false)
                        }}
                      >
                        <LogOut className="h-4 w-4 mr-1.5" />
                        Sign Out
                      </Button>
                    ) : (
                      <>
                        <Button
                          variant="outline"
                          className="w-full"
                          onClick={() => {
                            navigate('login')
                            setMobileOpen(false)
                          }}
                        >
                          <LogIn className="h-4 w-4 mr-1.5" />
                          Sign In
                        </Button>
                        <Button
                          className="w-full bg-primary hover:bg-primary/90"
                          onClick={() => {
                            navigate('register')
                            setMobileOpen(false)
                          }}
                        >
                          <GraduationCap className="h-4 w-4 mr-1.5" />
                          Enroll Free
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>

      {/* Mobile Notifications Sheet */}
      <Sheet open={mobileNotifOpen} onOpenChange={setMobileNotifOpen}>
        <SheetContent side="right" className="w-full sm:w-[400px] p-0">
          <SheetTitle className="sr-only">Notifications</SheetTitle>
          <div className="flex flex-col h-full">
            <div className="flex items-center justify-between p-4 border-b">
              <div className="flex items-center gap-2">
                <Bell className="h-5 w-5 text-primary" />
                <h2 className="text-lg font-semibold text-foreground">Notifications</h2>
              </div>
              {mobileUnreadCount > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-xs text-primary hover:text-primary/80"
                  onClick={markAllMobileAsRead}
                >
                  <CheckCheck className="h-3.5 w-3.5 mr-1" />
                  Mark all read
                </Button>
              )}
            </div>
            <ScrollArea className="flex-1">
              {mobileNotifications.length === 0 ? (
                <div className="p-8 text-center">
                  <Bell className="h-12 w-12 text-muted-foreground/20 mx-auto mb-3" />
                  <p className="text-sm font-medium text-muted-foreground">No notifications yet</p>
                  <p className="text-xs text-muted-foreground/70 mt-1">
                    We&apos;ll notify you about enrollments, completions, and messages
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-border/50">
                  {mobileNotifications.map((notification) => (
                    <button
                      key={notification.id}
                      className={`w-full text-left p-4 hover:bg-accent/50 transition-colors cursor-pointer ${
                        !notification.isRead ? 'bg-primary/5' : ''
                      }`}
                      onClick={() => {
                        if (!notification.isRead) {
                          markMobileAsRead(notification.id)
                        }
                        if (notification.link) {
                          const link = notification.link
                          if (link === '/courses') {
                            navigate('courses')
                          } else if (link === '/certificates') {
                            navigate('certificates')
                          } else if (link === '/chat') {
                            navigate('dashboard')
                          } else {
                            navigate('dashboard')
                          }
                        }
                        setMobileNotifOpen(false)
                      }}
                    >
                      <div className="flex gap-3">
                        <div className="shrink-0 mt-0.5">
                          {getNotificationIcon(notification.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <p className={`text-sm leading-tight ${!notification.isRead ? 'font-semibold text-foreground' : 'font-medium text-foreground/80'}`}>
                              {notification.title}
                            </p>
                            {!notification.isRead && (
                              <span className="shrink-0 h-2 w-2 rounded-full bg-primary mt-1.5" />
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                            {notification.message}
                          </p>
                          <p className="text-[10px] text-muted-foreground/70 mt-1.5">
                            {formatTimeAgo(notification.createdAt)}
                          </p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </ScrollArea>
          </div>
        </SheetContent>
      </Sheet>
    </header>
  )
}
