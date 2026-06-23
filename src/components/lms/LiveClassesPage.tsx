'use client'

import { useState, useEffect, useCallback } from 'react'
import { useAppStore } from '@/lib/store'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'
import {
  Video,
  Clock,
  Calendar,
  Users,
  ExternalLink,
  LayoutList,
  LayoutGrid,
  MapPin,
  User,
  BookOpen,
  ArrowRight,
  Radio,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react'

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
  course: {
    id: string
    title: string
    category: string
    instructor: string
    image: string | null
  }
}

interface CountdownTime {
  days: number
  hours: number
  minutes: number
  seconds: number
  isExpired: boolean
}

function CountdownTimer({ targetDate }: { targetDate: string }) {
  const calculateTime = useCallback((): CountdownTime => {
    const now = new Date().getTime()
    const target = new Date(targetDate).getTime()
    const diff = target - now

    if (diff <= 0) {
      return { days: 0, hours: 0, minutes: 0, seconds: 0, isExpired: true }
    }

    return {
      days: Math.floor(diff / (1000 * 60 * 60 * 24)),
      hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
      minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
      seconds: Math.floor((diff % (1000 * 60)) / 1000),
      isExpired: false,
    }
  }, [targetDate])

  const [time, setTime] = useState<CountdownTime>(calculateTime)

  useEffect(() => {
    const interval = setInterval(() => {
      setTime(calculateTime())
    }, 1000)
    return () => clearInterval(interval)
  }, [calculateTime])

  if (time.isExpired) {
    return (
      <span className="text-xs text-muted-foreground">Started</span>
    )
  }

  const parts: Array<{ value: number; label: string }> = []
  if (time.days > 0) parts.push({ value: time.days, label: 'd' })
  parts.push({ value: time.hours, label: 'h' })
  parts.push({ value: time.minutes, label: 'm' })
  parts.push({ value: time.seconds, label: 's' })

  return (
    <div className="flex items-center gap-1">
      {parts.map((part, i) => (
        <span key={i} className="inline-flex items-center">
          <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">
            {String(part.value).padStart(2, '0')}
          </span>
          <span className="text-[10px] text-muted-foreground ml-0.5">{part.label}</span>
          {i < parts.length - 1 && <span className="text-muted-foreground/50 mx-0.5">:</span>}
        </span>
      ))}
    </div>
  )
}

function StatusBadge({ status }: { status: string }) {
  switch (status) {
    case 'live':
      return (
        <Badge className="bg-red-100 text-red-700 border-red-200 gap-1">
          <Radio className="h-3 w-3 animate-pulse" />
          Live Now
        </Badge>
      )
    case 'upcoming':
      return (
        <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 gap-1">
          <AlertCircle className="h-3 w-3" />
          Upcoming
        </Badge>
      )
    case 'completed':
      return (
        <Badge className="bg-stone-100 text-stone-600 border-stone-200 gap-1">
          <CheckCircle2 className="h-3 w-3" />
          Completed
        </Badge>
      )
    default:
      return <Badge variant="outline">{status}</Badge>
  }
}

export function LiveClassesPage() {
  const { currentUser, navigate } = useAppStore()
  const [liveClasses, setLiveClasses] = useState<LiveClassData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState('upcoming')
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list')

  useEffect(() => {
    fetchLiveClasses()
  }, [activeTab])

  const fetchLiveClasses = async () => {
    setLoading(true)
    try {
      const status = activeTab === 'upcoming' ? 'upcoming' : 'completed'
      const res = await fetch(`/api/live-classes?status=${status}`)
      if (!res.ok) throw new Error('Failed to fetch live classes')
      const data = await res.json()
      setLiveClasses(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load live classes')
    } finally {
      setLoading(false)
    }
  }

  const formatDateTime = (dateStr: string) => {
    const date = new Date(dateStr)
    return {
      date: date.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      }),
      time: date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
      }),
    }
  }

  const formatDuration = (minutes: number) => {
    if (minutes >= 60) {
      const h = Math.floor(minutes / 60)
      const m = minutes % 60
      return m > 0 ? `${h}h ${m}m` : `${h}h`
    }
    return `${minutes}m`
  }

  const isClassLive = (scheduledAt: string, duration: number) => {
    const now = new Date().getTime()
    const start = new Date(scheduledAt).getTime()
    const end = start + duration * 60 * 1000
    return now >= start && now <= end
  }

  const isClassUpcoming = (scheduledAt: string) => {
    return new Date(scheduledAt).getTime() > new Date().getTime()
  }

  const handleJoinClass = (meetingUrl: string | null) => {
    if (meetingUrl) {
      window.open(meetingUrl, '_blank')
    }
  }

  return (
    <div className="min-h-[calc(100vh-200px)]">
      {/* Header */}
      <div className="bg-gradient-to-r from-amber-50 to-emerald-50 py-10 sm:py-14">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100">
              <Video className="h-5 w-5 text-emerald-700" />
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold text-foreground">
              Live Classes
            </h1>
          </div>
          <p className="text-lg text-muted-foreground ml-13">
            Join interactive live sessions with instructors and fellow students
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList>
              <TabsTrigger value="upcoming" className="gap-1.5">
                <AlertCircle className="h-3.5 w-3.5" />
                Upcoming
              </TabsTrigger>
              <TabsTrigger value="past" className="gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5" />
                Past
              </TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="flex items-center gap-2">
            <Button
              variant={viewMode === 'list' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('list')}
              className="h-8 w-8 p-0"
            >
              <LayoutList className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'grid' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('grid')}
              className="h-8 w-8 p-0"
            >
              <LayoutGrid className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Content */}
        {loading ? (
          viewMode === 'list' ? (
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="rounded-2xl border border-border/50 p-5 animate-pulse">
                  <div className="flex items-start gap-4">
                    <div className="h-16 w-16 bg-muted rounded-xl shrink-0" />
                    <div className="flex-1">
                      <div className="h-5 bg-muted rounded w-1/2 mb-2" />
                      <div className="h-3 bg-muted rounded w-1/3 mb-1" />
                      <div className="h-3 bg-muted rounded w-1/4" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="rounded-2xl border border-border/50 p-5 animate-pulse">
                  <div className="h-4 bg-muted rounded w-2/3 mb-3" />
                  <div className="h-3 bg-muted rounded w-1/2 mb-2" />
                  <div className="h-3 bg-muted rounded w-3/4 mb-1" />
                  <div className="h-3 bg-muted rounded w-1/3" />
                </div>
              ))}
            </div>
          )
        ) : error ? (
          <div className="text-center py-16">
            <Video className="h-16 w-16 text-muted-foreground/30 mx-auto mb-6" />
            <h2 className="text-2xl font-bold text-foreground mb-3">Something Went Wrong</h2>
            <p className="text-muted-foreground mb-6">{error}</p>
            <Button variant="outline" onClick={fetchLiveClasses}>Try Again</Button>
          </div>
        ) : liveClasses.length === 0 ? (
          <div className="text-center py-16">
            <Video className="h-16 w-16 text-muted-foreground/30 mx-auto mb-6" />
            <h2 className="text-2xl font-bold text-foreground mb-3">
              {activeTab === 'upcoming' ? 'No Upcoming Classes' : 'No Past Classes'}
            </h2>
            <p className="text-muted-foreground mb-8 max-w-md mx-auto">
              {activeTab === 'upcoming'
                ? 'There are no upcoming live classes scheduled at the moment. Check back soon or browse our courses.'
                : 'You haven\'t attended any live classes yet. Join upcoming sessions to see them here.'}
            </p>
            {activeTab === 'upcoming' && (
              <Button className="bg-primary hover:bg-primary/90" onClick={() => navigate('courses')}>
                <BookOpen className="h-4 w-4 mr-2" />
                Browse Courses
              </Button>
            )}
            {activeTab === 'past' && (
              <Button variant="outline" onClick={() => setActiveTab('upcoming')}>
                View Upcoming Classes
              </Button>
            )}
          </div>
        ) : viewMode === 'list' ? (
          /* List View */
          <div className="space-y-4 stagger-children">
            {liveClasses.map((liveClass) => {
              const { date, time } = formatDateTime(liveClass.scheduledAt)
              const live = isClassLive(liveClass.scheduledAt, liveClass.duration)
              const upcoming = isClassUpcoming(liveClass.scheduledAt)
              const effectiveStatus = live ? 'live' : liveClass.status

              return (
                <Card key={liveClass.id} className="card-hover border-border/50 overflow-hidden">
                  <CardContent className="p-5">
                    <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                      {/* Date Block */}
                      <div className="flex sm:flex-col items-center sm:items-center gap-2 sm:gap-0 shrink-0">
                        <div className="flex flex-col items-center justify-center w-16 h-16 rounded-xl bg-gradient-to-br from-amber-50 to-emerald-50 border border-amber-100/50">
                          <span className="text-xs font-medium text-amber-600 uppercase">
                            {new Date(liveClass.scheduledAt).toLocaleDateString('en-US', { month: 'short' })}
                          </span>
                          <span className="text-xl font-bold text-foreground leading-tight">
                            {new Date(liveClass.scheduledAt).getDate()}
                          </span>
                        </div>
                      </div>

                      {/* Main Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 mb-2">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-semibold text-foreground text-base leading-snug">
                                {liveClass.title}
                              </h3>
                              <StatusBadge status={effectiveStatus} />
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {liveClass.course.title}
                            </p>
                          </div>
                          {upcoming && !live && (
                            <CountdownTimer targetDate={liveClass.scheduledAt} />
                          )}
                        </div>

                        {liveClass.description && (
                          <p className="text-xs text-muted-foreground mb-3 line-clamp-2">
                            {liveClass.description}
                          </p>
                        )}

                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-muted-foreground">
                          <div className="flex items-center gap-1.5">
                            <User className="h-3.5 w-3.5 text-amber-500" />
                            <span>{liveClass.instructor}</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <Clock className="h-3.5 w-3.5 text-amber-500" />
                            <span>{formatDuration(liveClass.duration)}</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <Calendar className="h-3.5 w-3.5 text-amber-500" />
                            <span>{date}</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <MapPin className="h-3.5 w-3.5 text-amber-500" />
                            <span>{time}</span>
                          </div>
                        </div>
                      </div>

                      {/* Action */}
                      <div className="sm:ml-4 shrink-0">
                        {(upcoming || live) && liveClass.meetingUrl ? (
                          <Button
                            className={live
                              ? 'bg-red-600 hover:bg-red-700 text-white'
                              : 'bg-primary hover:bg-primary/90'
                            }
                            size="sm"
                            onClick={() => handleJoinClass(liveClass.meetingUrl)}
                          >
                            {live ? (
                              <>
                                <Radio className="h-4 w-4 mr-1.5 animate-pulse" />
                                Join Now
                              </>
                            ) : (
                              <>
                                <Video className="h-4 w-4 mr-1.5" />
                                Join Class
                              </>
                            )}
                          </Button>
                        ) : upcoming ? (
                          <Button variant="outline" size="sm" disabled>
                            <Clock className="h-4 w-4 mr-1.5" />
                            Not Yet
                          </Button>
                        ) : (
                          <Button variant="ghost" size="sm" className="text-muted-foreground">
                            <CheckCircle2 className="h-4 w-4 mr-1.5" />
                            Ended
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        ) : (
          /* Grid View */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 stagger-children">
            {liveClasses.map((liveClass) => {
              const { date, time } = formatDateTime(liveClass.scheduledAt)
              const live = isClassLive(liveClass.scheduledAt, liveClass.duration)
              const upcoming = isClassUpcoming(liveClass.scheduledAt)
              const effectiveStatus = live ? 'live' : liveClass.status

              return (
                <Card key={liveClass.id} className="card-hover border-border/50 overflow-hidden">
                  {/* Card Header */}
                  <div className="relative h-24 bg-gradient-to-br from-amber-50 via-emerald-50/50 to-amber-50 flex items-center justify-center">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/80 shadow-sm border border-amber-200/50">
                      <Video className="h-5 w-5 text-amber-700" />
                    </div>
                    <div className="absolute top-3 left-3">
                      <StatusBadge status={effectiveStatus} />
                    </div>
                    {upcoming && !live && (
                      <div className="absolute top-3 right-3">
                        <CountdownTimer targetDate={liveClass.scheduledAt} />
                      </div>
                    )}
                  </div>

                  <CardContent className="p-5">
                    <h3 className="font-semibold text-foreground mb-1 line-clamp-1 text-sm">
                      {liveClass.title}
                    </h3>
                    <p className="text-xs text-muted-foreground mb-3 line-clamp-1">
                      {liveClass.course.title}
                    </p>

                    <div className="space-y-1.5 mb-4">
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <User className="h-3 w-3 text-amber-500 shrink-0" />
                        <span>{liveClass.instructor}</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Calendar className="h-3 w-3 text-amber-500 shrink-0" />
                        <span className="truncate">{date}</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3 text-amber-500 shrink-0" />
                        <span>{time} · {formatDuration(liveClass.duration)}</span>
                      </div>
                    </div>

                    {(upcoming || live) && liveClass.meetingUrl ? (
                      <Button
                        className={`w-full text-sm ${live
                          ? 'bg-red-600 hover:bg-red-700 text-white'
                          : 'bg-primary hover:bg-primary/90'
                        }`}
                        size="sm"
                        onClick={() => handleJoinClass(liveClass.meetingUrl)}
                      >
                        {live ? (
                          <>
                            <Radio className="h-4 w-4 mr-1.5 animate-pulse" />
                            Join Now
                          </>
                        ) : (
                          <>
                            <ExternalLink className="h-3.5 w-3.5 mr-1.5" />
                            Join Class
                          </>
                        )}
                      </Button>
                    ) : upcoming ? (
                      <Button variant="outline" size="sm" className="w-full text-sm" disabled>
                        <Clock className="h-4 w-4 mr-1.5" />
                        Not Yet Available
                      </Button>
                    ) : (
                      <Button variant="ghost" size="sm" className="w-full text-sm text-muted-foreground">
                        <CheckCircle2 className="h-4 w-4 mr-1.5" />
                        Session Ended
                      </Button>
                    )}
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}

        {/* Live Now Banner - only show when there are live classes */}
        {activeTab === 'upcoming' && liveClasses.some(lc => isClassLive(lc.scheduledAt, lc.duration)) && (
          <div className="mt-8">
            <Card className="border-red-200 bg-gradient-to-r from-red-50 to-amber-50 overflow-hidden">
              <CardContent className="p-5">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100 shrink-0">
                    <Radio className="h-6 w-6 text-red-600 animate-pulse" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-foreground text-sm">
                      A class is happening right now!
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      Don&apos;t miss out — join before it ends.
                    </p>
                  </div>
                  {(() => {
                    const liveClass = liveClasses.find(lc => isClassLive(lc.scheduledAt, lc.duration))
                    if (liveClass?.meetingUrl) {
                      return (
                        <Button
                          className="bg-red-600 hover:bg-red-700 text-white shrink-0"
                          size="sm"
                          onClick={() => handleJoinClass(liveClass.meetingUrl)}
                        >
                          Join Now
                          <ArrowRight className="h-4 w-4 ml-1.5" />
                        </Button>
                      )
                    }
                    return null
                  })()}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}
