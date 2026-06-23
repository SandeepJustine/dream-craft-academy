'use client'

import { useState, useEffect } from 'react'
import { useAppStore } from '@/lib/store'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { toast } from 'sonner'
import {
  ArrowLeft,
  BookOpen,
  Clock,
  Star,
  Users,
  Play,
  CheckCircle,
  GraduationCap,
  ChevronDown,
  Loader2,
  FileQuestion,
  ClipboardList,
  MessageSquare,
  MessageCircle,
} from 'lucide-react'

interface Quiz {
  id: string
  title: string
  type: string
  order: number
}

interface AssignmentItem {
  id: string
  title: string
  type: string
  order: number
}

interface Module {
  id: string
  title: string
  description: string | null
  order: number
  lessons: Lesson[]
  quizzes?: Quiz[]
  assignments?: AssignmentItem[]
}

interface Lesson {
  id: string
  title: string
  type: string
  duration: string
  order: number
}

interface CourseData {
  id: string
  title: string
  description: string
  category: string
  level: string
  duration: string
  instructor: string
  featured: boolean
  rating: number
  enrolled: number
  modules: Module[]
  modulesCount: number
  lessonsCount: number
}

export function CourseDetail() {
  const { selectedCourseId, navigate, currentUser } = useAppStore()
  const [course, setCourse] = useState<CourseData | null>(null)
  const [loading, setLoading] = useState(true)
  const [enrolling, setEnrolling] = useState(false)
  const [completedLessons, setCompletedLessons] = useState<string[]>([])
  const [moduleQuizzes, setModuleQuizzes] = useState<Record<string, Quiz[]>>({})
  const [moduleAssignments, setModuleAssignments] = useState<Record<string, AssignmentItem[]>>({})

  useEffect(() => {
    if (selectedCourseId) {
      fetchCourse()
      fetchProgress()
    }
  }, [selectedCourseId])

  // Fetch quizzes and assignments for each module
  useEffect(() => {
    if (course) {
      course.modules.forEach((mod) => {
        fetch(`/api/quizzes?moduleId=${mod.id}`)
          .then((res) => res.ok ? res.json() : [])
          .then((data) => {
            setModuleQuizzes((prev) => ({ ...prev, [mod.id]: data }))
          })
          .catch(() => {})

        fetch(`/api/assignments?moduleId=${mod.id}`)
          .then((res) => res.ok ? res.json() : [])
          .then((data) => {
            setModuleAssignments((prev) => ({ ...prev, [mod.id]: data }))
          })
          .catch(() => {})
      })
    }
  }, [course])

  const fetchCourse = async () => {
    try {
      const res = await fetch(`/api/courses/${selectedCourseId}`)
      const data = await res.json()
      setCourse(data)
    } catch (error) {
      console.error('Error fetching course:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchProgress = async () => {
    if (!currentUser || !selectedCourseId) return
    try {
      const res = await fetch(`/api/progress?userId=${currentUser.id}&courseId=${selectedCourseId}`)
      if (res.ok) {
        const data = await res.json()
        setCompletedLessons(data.completedLessons || [])
      }
    } catch {
      // Not enrolled yet, that's fine
    }
  }

  const handleEnroll = async () => {
    if (!currentUser) {
      toast.error('Please sign in first to enroll')
      navigate('apply')
      return
    }
    setEnrolling(true)
    try {
      const res = await fetch('/api/enroll', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: currentUser.id, courseId: selectedCourseId }),
      })
      if (res.ok) {
        toast.success('Successfully enrolled! Start learning now.')
        fetchProgress()
      } else {
        const data = await res.json()
        toast.error(data.error || 'Failed to enroll')
      }
    } catch {
      toast.error('Failed to enroll')
    } finally {
      setEnrolling(false)
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-muted rounded w-1/3" />
          <div className="h-64 bg-muted rounded-xl" />
          <div className="h-4 bg-muted rounded w-2/3" />
        </div>
      </div>
    )
  }

  if (!course) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h2 className="text-xl font-semibold mb-4">Course not found</h2>
        <Button onClick={() => navigate('courses')}>Back to Courses</Button>
      </div>
    )
  }

  const isEnrolled = completedLessons.length > 0 || (currentUser ? true : false)
  const totalLessons = course.modules.reduce((sum, m) => sum + m.lessons.length, 0)
  const progress = totalLessons > 0 ? Math.round((completedLessons.length / totalLessons) * 100) : 0

  return (
    <div className="min-h-[calc(100vh-200px)]">
      {/* Header */}
      <div className="bg-gradient-to-r from-amber-50 to-emerald-50 py-10 sm:py-14">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <Button
            variant="ghost"
            size="sm"
            className="mb-6 text-muted-foreground"
            onClick={() => navigate('courses')}
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to Courses
          </Button>

          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <div className="flex flex-wrap gap-2 mb-4">
                <Badge className="bg-amber-100 text-amber-800">{course.category}</Badge>
                <Badge variant="outline">{course.level}</Badge>
                {course.featured && (
                  <Badge className="bg-amber-600 text-white">Featured</Badge>
                )}
              </div>

              <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
                {course.title}
              </h1>

              <p className="text-lg text-muted-foreground mb-6 leading-relaxed">
                {course.description}
              </p>

              <div className="flex flex-wrap gap-6 text-sm text-muted-foreground">
                <div className="flex items-center gap-1.5">
                  <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                  <span className="font-medium">{course.rating}</span> rating
                </div>
                <div className="flex items-center gap-1.5">
                  <Users className="h-4 w-4" />
                  <span>{course.enrolled}</span> students
                </div>
                <div className="flex items-center gap-1.5">
                  <Clock className="h-4 w-4" />
                  {course.duration}
                </div>
                <div className="flex items-center gap-1.5">
                  <BookOpen className="h-4 w-4" />
                  {course.lessonsCount} lessons
                </div>
              </div>
            </div>

            {/* Enrollment Card */}
            <div>
              <Card className="border-border/50 shadow-lg sticky top-24">
                <CardContent className="p-6">
                  {isEnrolled ? (
                    <>
                      <div className="mb-4">
                        <div className="flex justify-between text-sm mb-2">
                          <span className="text-muted-foreground">Your Progress</span>
                          <span className="font-semibold text-primary">{progress}%</span>
                        </div>
                        <div className="h-2 bg-secondary rounded-full overflow-hidden">
                          <div
                            className="h-full bg-primary rounded-full progress-animate"
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                      </div>
                      <Button
                        className="w-full bg-primary hover:bg-primary/90 mb-2"
                        onClick={() => {
                          const nextLesson = course.modules
                            .flatMap((m) => m.lessons.sort((a, b) => a.order - b.order))
                            .find((l) => !completedLessons.includes(l.id))
                          if (nextLesson) {
                            navigate('lesson', { courseId: course.id, lessonId: nextLesson.id })
                          } else {
                            navigate('lesson', { courseId: course.id, lessonId: course.modules[0]?.lessons[0]?.id })
                          }
                        }}
                      >
                        <Play className="h-4 w-4 mr-2" />
                        Continue Learning
                      </Button>
                    </>
                  ) : (
                    <>
                      <div className="text-center mb-4">
                        <p className="text-2xl font-bold text-primary">Free</p>
                        <p className="text-sm text-muted-foreground">No hidden fees</p>
                      </div>
                      <Button
                        className="w-full bg-primary hover:bg-primary/90 mb-2"
                        onClick={handleEnroll}
                        disabled={enrolling}
                      >
                        {enrolling ? (
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        ) : (
                          <GraduationCap className="h-4 w-4 mr-2" />
                        )}
                        Enroll Now
                      </Button>
                    </>
                  )}
                  
                  <Separator className="my-4" />
                  
                  <div className="space-y-3 text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <CheckCircle className="h-4 w-4 text-emerald-600" />
                      {course.modulesCount} modules included
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <CheckCircle className="h-4 w-4 text-emerald-600" />
                      {course.lessonsCount} video & text lessons
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <CheckCircle className="h-4 w-4 text-emerald-600" />
                      Certificate of completion
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <CheckCircle className="h-4 w-4 text-emerald-600" />
                      Self-paced learning
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* Course Forum & Chat Section */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 pb-6">
        <div className="grid md:grid-cols-2 gap-4">
          <Card className="border-border/50 hover:shadow-md transition-shadow cursor-pointer" onClick={() => navigate('forum', { forumCourseId: course.id, courseId: course.id })}>
            <CardContent className="p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100 text-amber-700 shrink-0">
                  <MessageSquare className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">Course Forum</h3>
                  <p className="text-xs text-muted-foreground">Discuss with fellow students</p>
                </div>
              </div>
              <p className="text-sm text-muted-foreground mb-3">
                Ask questions, share insights, and engage with other learners in the course discussion forum.
              </p>
              <Button size="sm" className="bg-primary hover:bg-primary/90">
                <MessageSquare className="h-4 w-4 mr-2" />
                Join Discussion
              </Button>
            </CardContent>
          </Card>

          <Card className="border-border/50 hover:shadow-md transition-shadow cursor-pointer" onClick={() => navigate('chat', { courseId: course.id })}>
            <CardContent className="p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700 shrink-0">
                  <MessageCircle className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">Chat with Instructor</h3>
                  <p className="text-xs text-muted-foreground">Get personal guidance</p>
                </div>
              </div>
              <p className="text-sm text-muted-foreground mb-3">
                Have a question for {course.instructor}? Send a private message and get personalized help.
              </p>
              <Button size="sm" variant="outline" className="border-primary/20 text-primary hover:bg-primary/5">
                <MessageCircle className="h-4 w-4 mr-2" />
                Start Conversation
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Curriculum */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <h2 className="text-2xl font-bold text-foreground mb-6">Course Curriculum</h2>
        
        <Accordion type="multiple" defaultValue={course.modules.map((m) => m.id)} className="space-y-3">
          {course.modules
            .sort((a, b) => a.order - b.order)
            .map((mod, modIndex) => (
              <AccordionItem
                key={mod.id}
                value={mod.id}
                className="border border-border/50 rounded-xl overflow-hidden"
              >
                <AccordionTrigger className="px-6 py-4 hover:no-underline hover:bg-accent/50">
                  <div className="flex items-center gap-4 text-left">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary text-sm font-semibold shrink-0">
                      {modIndex + 1}
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground">{mod.title}</h3>
                      <p className="text-sm text-muted-foreground mt-0.5">
                        {mod.lessons.length} lesson{mod.lessons.length !== 1 ? 's' : ''}
                        {mod.description && ` · ${mod.description}`}
                      </p>
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-6 pb-4">
                  <div className="space-y-1">
                    {mod.lessons
                      .sort((a, b) => a.order - b.order)
                      .map((lesson) => {
                        const isCompleted = completedLessons.includes(lesson.id)
                        return (
                          <button
                            key={lesson.id}
                            onClick={() => navigate('lesson', { courseId: course.id, lessonId: lesson.id })}
                            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-accent/50 transition-colors text-left group"
                          >
                            <div className={`flex h-7 w-7 items-center justify-center rounded-full shrink-0 ${
                              isCompleted
                                ? 'bg-emerald-100 text-emerald-700'
                                : 'bg-muted text-muted-foreground'
                            }`}>
                              {isCompleted ? (
                                <CheckCircle className="h-4 w-4" />
                              ) : (
                                <Play className="h-3 w-3" />
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className={`text-sm font-medium ${
                                isCompleted ? 'text-muted-foreground line-through' : 'text-foreground'
                              }`}>
                                {lesson.title}
                              </p>
                            </div>
                            <span className="text-xs text-muted-foreground shrink-0">
                              {lesson.duration}
                            </span>
                          </button>
                        )
                      })}
                    
                    {/* Quizzes */}
                    {(moduleQuizzes[mod.id] || []).map((quiz) => (
                      <button
                        key={quiz.id}
                        onClick={() => navigate('quiz', { courseId: course.id, quizId: quiz.id })}
                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-amber-50 transition-colors text-left group"
                      >
                        <div className="flex h-7 w-7 items-center justify-center rounded-full shrink-0 bg-amber-100 text-amber-700">
                          <FileQuestion className="h-3.5 w-3.5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-foreground">
                            {quiz.title}
                          </p>
                        </div>
                        <Badge className={`text-xs ${
                          quiz.type === 'final' 
                            ? 'bg-red-100 text-red-700'
                            : quiz.type === 'graded'
                            ? 'bg-amber-100 text-amber-700'
                            : 'bg-emerald-100 text-emerald-700'
                        }`}>
                          {quiz.type === 'final' ? 'Final' : quiz.type === 'graded' ? 'Graded' : 'Practice'}
                        </Badge>
                      </button>
                    ))}
                    
                    {/* Assignments */}
                    {(moduleAssignments[mod.id] || []).map((assignment) => (
                      <button
                        key={assignment.id}
                        onClick={() => navigate('assignment', { courseId: course.id, assignmentId: assignment.id })}
                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-emerald-50 transition-colors text-left group"
                      >
                        <div className="flex h-7 w-7 items-center justify-center rounded-full shrink-0 bg-emerald-100 text-emerald-700">
                          <ClipboardList className="h-3.5 w-3.5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-foreground">
                            {assignment.title}
                          </p>
                        </div>
                        <Badge variant="outline" className="text-xs">
                          Assignment
                        </Badge>
                      </button>
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
        </Accordion>
      </div>
    </div>
  )
}
