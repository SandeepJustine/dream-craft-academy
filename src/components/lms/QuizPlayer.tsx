'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useAppStore } from '@/lib/store'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { toast } from 'sonner'
import {
  calculateLetterGrade,
  getGradeColor,
  getGradeBgColor,
  getGradeLabel,
  GRADE_SCALE,
} from '@/lib/grading'
import {
  ArrowLeft,
  ArrowRight,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Trophy,
  Flag,
  Loader2,
  GraduationCap,
  RotateCcw,
  Send,
  Star,
  MessageSquare,
  Award,
  Info,
} from 'lucide-react'

// --- Types ---

interface QuestionData {
  id: string
  text: string
  type: string
  options: string // JSON string - needs parsing
  points: number
  order: number
  correctAnswer?: string
  explanation?: string
}

interface QuizData {
  id: string
  title: string
  description: string | null
  type: string
  timeLimit: number
  passingScore: number
  maxAttempts: number
  order: number
  moduleId: string
  questions: QuestionData[]
  module: {
    id: string
    title: string
    courseId: string
  }
}

interface AttemptData {
  id: string
  userId: string
  quizId: string
  enrollmentId: string
  score: number
  maxScore: number
  passed: boolean
  timeSpent: number
  startedAt: string
  completedAt: string | null
}

interface PreviousAttempt {
  id: string
  score: number
  maxScore: number
  passed: boolean
  completedAt: string | null
  startedAt: string
  quiz: {
    id: string
    title: string
    type: string
    passingScore: number
  }
}

type QuizPhase = 'start' | 'taking' | 'results' | 'feedback'

// --- Helper: Confetti Particles ---

function CelebrationOverlay() {
  const particles = Array.from({ length: 60 }, (_, i) => {
    const colors = ['#f59e0b', '#10b981', '#6366f1', '#f43f5e', '#8b5cf6', '#ec4899', '#14b8a6']
    const color = colors[i % colors.length]
    const left = Math.random() * 100
    const delay = Math.random() * 2
    const duration = 2 + Math.random() * 2
    const size = 6 + Math.random() * 8
    const rotation = Math.random() * 360
    return (
      <div
        key={i}
        className="absolute animate-bounce"
        style={{
          left: `${left}%`,
          top: '-20px',
          width: `${size}px`,
          height: `${size}px`,
          backgroundColor: color,
          borderRadius: i % 3 === 0 ? '50%' : i % 3 === 1 ? '2px' : '0',
          animationDelay: `${delay}s`,
          animationDuration: `${duration}s`,
          animation: `confetti-fall ${duration}s ease-in ${delay}s forwards`,
          transform: `rotate(${rotation}deg)`,
        }}
      />
    )
  })

  return (
    <>
      <style>{`
        @keyframes confetti-fall {
          0% { transform: translateY(0) rotate(0deg); opacity: 1; }
          100% { transform: translateY(100vh) rotate(720deg); opacity: 0; }
        }
      `}</style>
      <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
        {particles}
      </div>
    </>
  )
}

// --- Star Rating Component ---

function StarRating({ value, onChange }: { value: number; onChange: (val: number) => void }) {
  const [hovered, setHovered] = useState(0)

  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          className="p-0.5 transition-transform hover:scale-110"
          onMouseEnter={() => setHovered(star)}
          onMouseLeave={() => setHovered(0)}
          onClick={() => onChange(star)}
        >
          <Star
            className={`h-8 w-8 transition-colors ${
              star <= (hovered || value)
                ? 'fill-amber-400 text-amber-400'
                : 'fill-none text-muted-foreground/30'
            }`}
          />
        </button>
      ))}
      {value > 0 && (
        <span className="ml-2 text-sm font-medium text-muted-foreground">
          {value}/5
        </span>
      )}
    </div>
  )
}

// --- Grading Scale Card ---

function GradeScaleCard() {
  return (
    <Card className="border-border/50">
      <CardContent className="p-4 sm:p-6">
        <div className="flex items-center gap-2 mb-4">
          <Info className="h-5 w-5 text-primary" />
          <h3 className="text-sm font-semibold text-foreground">International Grading Scale</h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1">
          {GRADE_SCALE.map((item) => (
            <div key={item.grade} className="flex items-center justify-between py-1 text-sm">
              <div className="flex items-center gap-2">
                <Badge className={`${getGradeBgColor(item.grade)} text-xs font-bold px-2 py-0`}>
                  {item.grade}
                </Badge>
                <span className="text-muted-foreground">{item.range}</span>
              </div>
              <span className={`text-xs font-medium ${
                item.grade.startsWith('A') ? 'text-emerald-600' :
                item.grade.startsWith('B') ? 'text-blue-600' :
                item.grade.startsWith('C') ? 'text-amber-600' :
                item.grade.startsWith('D') ? 'text-orange-600' :
                'text-red-600'
              }`}>
                {item.label}
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

// --- Main Component ---

export function QuizPlayer() {
  const { selectedQuizId, selectedCourseId, navigate, currentUser } = useAppStore()
  
  // Phase
  const [phase, setPhase] = useState<QuizPhase>('start')
  
  // Quiz & Attempt
  const [quiz, setQuiz] = useState<QuizData | null>(null)
  const [attempt, setAttempt] = useState<AttemptData | null>(null)
  const [previousAttempts, setPreviousAttempts] = useState<PreviousAttempt[]>([])
  const [loading, setLoading] = useState(true)
  const [starting, setStarting] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  
  // Quiz Taking
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [flaggedQuestions, setFlaggedQuestions] = useState<Set<string>>(new Set())
  const [timeRemaining, setTimeRemaining] = useState(0) // in seconds
  const [startTime] = useState(Date.now())
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  
  // Results
  const [result, setResult] = useState<{
    earnedPoints: number
    totalPoints: number
    scorePercentage: number
    passed: boolean
    passingScore: number
    letterGrade?: string
  } | null>(null)
  const [quizWithAnswers, setQuizWithAnswers] = useState<QuizData | null>(null)
  
  // Submit confirmation dialog
  const [showSubmitDialog, setShowSubmitDialog] = useState(false)
  const [showTimeUpDialog, setShowTimeUpDialog] = useState(false)
  
  // Feedback form state
  const [feedbackRating, setFeedbackRating] = useState(0)
  const [feedbackText, setFeedbackText] = useState('')
  const [submittingFeedback, setSubmittingFeedback] = useState(false)
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false)
  
  // Certificate generation state
  const [generatingCertificate, setGeneratingCertificate] = useState(false)
  const [generatedCertificateId, setGeneratedCertificateId] = useState<string | null>(null)
  
  // --- Fetch quiz data ---
  useEffect(() => {
    if (selectedQuizId) {
      fetchQuiz()
      fetchPreviousAttempts()
    }
  }, [selectedQuizId])
  
  const fetchQuiz = async () => {
    try {
      const res = await fetch(`/api/quizzes?quizId=${selectedQuizId}`)
      if (res.ok) {
        const data = await res.json()
        setQuiz(data)
        setTimeRemaining(data.timeLimit * 60) // Convert minutes to seconds
      }
    } catch (error) {
      console.error('Error fetching quiz:', error)
    } finally {
      setLoading(false)
    }
  }
  
  const fetchPreviousAttempts = async () => {
    if (!currentUser || !selectedQuizId) return
    try {
      const res = await fetch(`/api/quizzes/attempt?userId=${currentUser.id}&quizId=${selectedQuizId}`)
      if (res.ok) {
        const data = await res.json()
        // Only show completed attempts
        setPreviousAttempts(data.filter((a: PreviousAttempt) => a.completedAt !== null))
      }
    } catch {
      // No previous attempts
    }
  }
  
  // --- Find enrollment ID ---
  const getEnrollmentId = useCallback(async (): Promise<string | null> => {
    if (!currentUser || !selectedCourseId) return null
    try {
      const res = await fetch(`/api/enroll?userId=${currentUser.id}`)
      if (res.ok) {
        const enrollments = await res.json()
        const enrollment = enrollments.find((e: { courseId: string; id: string }) => e.courseId === selectedCourseId)
        return enrollment?.id || null
      }
    } catch {
      // Not enrolled
    }
    return null
  }, [currentUser, selectedCourseId])
  
  // --- Start Quiz ---
  const handleStartQuiz = async () => {
    if (!currentUser) {
      toast.error('Please sign in to take quizzes')
      return
    }
    
    const enrollmentId = await getEnrollmentId()
    if (!enrollmentId) {
      toast.error('You must be enrolled in this course to take quizzes')
      return
    }
    
    setStarting(true)
    try {
      const res = await fetch('/api/quizzes/attempt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'start',
          quizId: selectedQuizId,
          userId: currentUser.id,
          enrollmentId,
        }),
      })
      
      if (res.ok) {
        const data = await res.json()
        setAttempt(data.attempt)
        // Update quiz with the questions from the attempt response (no correct answers)
        if (data.quiz) {
          setQuiz(prev => prev ? { ...prev, questions: data.quiz.questions } : prev)
          setTimeRemaining(data.quiz.timeLimit * 60)
        }
        setPhase('taking')
        setCurrentQuestionIndex(0)
        setAnswers({})
        setFlaggedQuestions(new Set())
      } else {
        const data = await res.json()
        toast.error(data.error || 'Failed to start quiz')
      }
    } catch {
      toast.error('Failed to start quiz')
    } finally {
      setStarting(false)
    }
  }
  
  // --- Timer ---
  useEffect(() => {
    if (phase !== 'taking') return
    
    timerRef.current = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          // Time's up!
          if (timerRef.current) clearInterval(timerRef.current)
          setShowTimeUpDialog(true)
          return 0
        }
        return prev - 1
      })
    }, 1000)
    
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [phase])
  
  // Auto-submit on time up
  useEffect(() => {
    if (timeRemaining === 0 && phase === 'taking' && !showTimeUpDialog) return
    if (timeRemaining === 0 && phase === 'taking' && showTimeUpDialog) {
      handleSubmitQuiz(true)
    }
  }, [timeRemaining, showTimeUpDialog])
  
  // --- Submit Quiz ---
  const handleSubmitQuiz = async (isAutoSubmit = false) => {
    if (!attempt) return
    
    setSubmitting(true)
    if (timerRef.current) clearInterval(timerRef.current)
    
    const timeSpent = Math.round((Date.now() - startTime) / 1000)
    
    try {
      const res = await fetch('/api/quizzes/attempt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'submit',
          attemptId: attempt.id,
          answers,
          timeSpent,
        }),
      })
      
      if (res.ok) {
        const data = await res.json()
        setResult(data.result)
        
        // Show grade update toast for auto-submit
        if (isAutoSubmit) {
          toast.success('Your grade has been updated')
        }
        
        // For practice quizzes, fetch the quiz with correct answers for review
        if (quiz?.type === 'practice') {
          try {
            const quizRes = await fetch(`/api/quizzes?quizId=${selectedQuizId}&role=instructor`)
            if (quizRes.ok) {
              const quizData = await quizRes.json()
              setQuizWithAnswers(quizData)
            }
          } catch {
            // Fallback: use existing quiz data
          }
        }
        
        // Determine which phase to go to
        const isFinal = quiz?.type === 'final'
        const didPass = data.result.passed
        
        if (isFinal && didPass) {
          // Go to feedback phase first
          setPhase('feedback')
        } else {
          setPhase('results')
        }
        setShowSubmitDialog(false)
        setShowTimeUpDialog(false)
        
        // Refresh previous attempts
        fetchPreviousAttempts()
      } else {
        const data = await res.json()
        toast.error(data.error || 'Failed to submit quiz')
      }
    } catch {
      toast.error('Failed to submit quiz')
    } finally {
      setSubmitting(false)
    }
  }
  
  // --- Submit Feedback ---
  const handleSubmitFeedback = async () => {
    if (!currentUser || !selectedCourseId) return
    
    const enrollmentId = await getEnrollmentId()
    if (!enrollmentId) return
    
    if (feedbackRating === 0) {
      toast.error('Please select a rating')
      return
    }
    
    setSubmittingFeedback(true)
    try {
      const res = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: currentUser.id,
          courseId: selectedCourseId,
          enrollmentId,
          rating: feedbackRating,
          feedback: feedbackText || 'No additional feedback provided.',
        }),
      })
      
      if (res.ok) {
        toast.success('Thank you for your feedback!')
        setFeedbackSubmitted(true)
      } else {
        toast.error('Failed to submit feedback')
      }
    } catch {
      toast.error('Failed to submit feedback')
    } finally {
      setSubmittingFeedback(false)
    }
  }
  
  // --- Generate Certificate ---
  const handleGenerateCertificate = async () => {
    if (!currentUser || !selectedCourseId) return
    
    const enrollmentId = await getEnrollmentId()
    if (!enrollmentId) return
    
    setGeneratingCertificate(true)
    try {
      const res = await fetch('/api/certificates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: currentUser.id,
          courseId: selectedCourseId,
          enrollmentId,
        }),
      })
      
      if (res.ok) {
        const data = await res.json()
        setGeneratedCertificateId(data.id)
        toast.success('Certificate generated successfully!')
      } else {
        const data = await res.json()
        if (data.certificate) {
          // Certificate already exists
          setGeneratedCertificateId(data.certificate.id)
          toast.success('Your certificate is ready!')
        } else {
          toast.error(data.error || 'Failed to generate certificate')
        }
      }
    } catch {
      toast.error('Failed to generate certificate')
    } finally {
      setGeneratingCertificate(false)
    }
  }
  
  // --- Navigation ---
  const goToQuestion = (index: number) => {
    if (index >= 0 && quiz && index < quiz.questions.length) {
      setCurrentQuestionIndex(index)
    }
  }
  
  const handleAnswerSelect = (questionId: string, answer: string) => {
    setAnswers(prev => ({ ...prev, [questionId]: answer }))
  }
  
  const toggleFlag = (questionId: string) => {
    setFlaggedQuestions(prev => {
      const next = new Set(prev)
      if (next.has(questionId)) {
        next.delete(questionId)
      } else {
        next.add(questionId)
      }
      return next
    })
  }
  
  // --- Format time ---
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }
  
  // --- Get option letter ---
  const getOptionLetter = (index: number) => String.fromCharCode(65 + index) // A, B, C, D...
  
  // --- Loading ---
  if (loading) {
    return (
      <div className="min-h-[calc(100vh-64px)] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }
  
  if (!quiz) {
    return (
      <div className="min-h-[calc(100vh-64px)] flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-4">Quiz not found</h2>
          <Button onClick={() => navigate('course-detail', { courseId: selectedCourseId })}>
            Back to Course
          </Button>
        </div>
      </div>
    )
  }
  
  // ==================== START SCREEN ====================
  if (phase === 'start') {
    const typeColors: Record<string, string> = {
      practice: 'bg-emerald-100 text-emerald-800',
      graded: 'bg-amber-100 text-amber-800',
      final: 'bg-red-100 text-red-800',
    }
    const typeLabels: Record<string, string> = {
      practice: 'Practice Quiz',
      graded: 'Graded Quiz',
      final: 'Final Exam',
    }
    
    const completedAttempts = previousAttempts.length
    const bestScore = completedAttempts > 0
      ? Math.max(...previousAttempts.map(a => a.score))
      : null
    const attemptsRemaining = quiz.maxAttempts - completedAttempts
    
    return (
      <div className="min-h-[calc(100vh-64px)] bg-gradient-to-b from-amber-50/50 to-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 max-w-2xl">
          {/* Back button */}
          <Button
            variant="ghost"
            size="sm"
            className="mb-6 text-muted-foreground"
            onClick={() => navigate('course-detail', { courseId: selectedCourseId })}
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to Course
          </Button>
          
          {/* Quiz Card */}
          <Card className="border-border/50 shadow-lg">
            <CardContent className="p-6 sm:p-8">
              {/* Type badge */}
              <Badge className={`${typeColors[quiz.type] || typeColors.practice} mb-4`}>
                {typeLabels[quiz.type] || quiz.type}
              </Badge>
              
              <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-3">
                {quiz.title}
              </h1>
              
              {quiz.description && (
                <p className="text-muted-foreground mb-6 leading-relaxed">
                  {quiz.description}
                </p>
              )}
              
              {/* Quiz Info Grid */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="flex items-center gap-2.5 p-3 bg-accent/50 rounded-xl">
                  <GraduationCap className="h-5 w-5 text-primary shrink-0" />
                  <div>
                    <p className="text-xs text-muted-foreground">Questions</p>
                    <p className="font-semibold text-foreground">{quiz.questions.length}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2.5 p-3 bg-accent/50 rounded-xl">
                  <Clock className="h-5 w-5 text-primary shrink-0" />
                  <div>
                    <p className="text-xs text-muted-foreground">Time Limit</p>
                    <p className="font-semibold text-foreground">{quiz.timeLimit} min</p>
                  </div>
                </div>
                <div className="flex items-center gap-2.5 p-3 bg-accent/50 rounded-xl">
                  <Trophy className="h-5 w-5 text-primary shrink-0" />
                  <div>
                    <p className="text-xs text-muted-foreground">Passing Score</p>
                    <p className="font-semibold text-foreground">{quiz.passingScore}%</p>
                  </div>
                </div>
                <div className="flex items-center gap-2.5 p-3 bg-accent/50 rounded-xl">
                  <RotateCcw className="h-5 w-5 text-primary shrink-0" />
                  <div>
                    <p className="text-xs text-muted-foreground">Max Attempts</p>
                    <p className="font-semibold text-foreground">{quiz.maxAttempts}</p>
                  </div>
                </div>
              </div>
              
              {/* Final exam warning */}
              {quiz.type === 'final' && (
                <Alert className="mb-6 border-red-200 bg-red-50">
                  <AlertCircle className="h-4 w-4 text-red-600" />
                  <AlertDescription className="text-red-800">
                    This is a <strong>Final Exam</strong>. Your score will count toward your final grade 
                    and certificate eligibility. Make sure you are well prepared before starting.
                  </AlertDescription>
                </Alert>
              )}
              
              {/* Previous attempts */}
              {completedAttempts > 0 && (
                <div className="mb-6">
                  <h3 className="text-sm font-semibold text-foreground mb-3">Previous Attempts</h3>
                  <div className="space-y-2">
                    {previousAttempts.map((att, idx) => (
                      <div key={att.id} className="flex items-center justify-between p-3 bg-accent/30 rounded-lg">
                        <div className="flex items-center gap-2">
                          {att.passed ? (
                            <CheckCircle className="h-4 w-4 text-emerald-600" />
                          ) : (
                            <XCircle className="h-4 w-4 text-red-500" />
                          )}
                          <span className="text-sm text-foreground">Attempt {idx + 1}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className={`text-sm font-semibold ${att.passed ? 'text-emerald-600' : 'text-red-500'}`}>
                            {Math.round(att.score)}%
                          </span>
                          <Badge variant="outline" className={`text-xs ${att.passed ? 'border-emerald-300 text-emerald-700' : 'border-red-300 text-red-600'}`}>
                            {att.passed ? 'Passed' : 'Failed'}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                  {bestScore !== null && (
                    <p className="text-xs text-muted-foreground mt-2">
                      Best score: <span className="font-semibold text-primary">{Math.round(bestScore)}%</span>
                    </p>
                  )}
                </div>
              )}
              
              <Separator className="my-6" />
              
              {/* Start button */}
              {attemptsRemaining <= 0 ? (
                <div className="text-center">
                  <Alert className="border-amber-200 bg-amber-50 mb-4">
                    <AlertCircle className="h-4 w-4 text-amber-600" />
                    <AlertDescription className="text-amber-800">
                      You have used all {quiz.maxAttempts} allowed attempts for this quiz.
                    </AlertDescription>
                  </Alert>
                  <Button
                    variant="outline"
                    onClick={() => navigate('course-detail', { courseId: selectedCourseId })}
                  >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Course
                  </Button>
                </div>
              ) : (
                <div className="flex flex-col sm:flex-row gap-3">
                  <Button
                    className="flex-1 bg-primary hover:bg-primary/90"
                    onClick={handleStartQuiz}
                    disabled={starting || !currentUser}
                    size="lg"
                  >
                    {starting ? (
                      <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                    ) : (
                      <GraduationCap className="h-5 w-5 mr-2" />
                    )}
                    {completedAttempts > 0 ? 'Retake Quiz' : 'Start Quiz'}
                  </Button>
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={() => navigate('course-detail', { courseId: selectedCourseId })}
                  >
                    Cancel
                  </Button>
                </div>
              )}
              
              {!currentUser && (
                <p className="text-xs text-muted-foreground text-center mt-3">
                  Please sign in to take this quiz
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }
  
  // ==================== TAKING SCREEN ====================
  if (phase === 'taking' && quiz) {
    const currentQuestion = quiz.questions[currentQuestionIndex]
    const totalQuestions = quiz.questions.length
    const answeredCount = Object.keys(answers).length
    const progressPercentage = (answeredCount / totalQuestions) * 100
    const isLowTime = timeRemaining < 300 // Less than 5 minutes
    const isCriticalTime = timeRemaining < 60 // Less than 1 minute
    
    // Parse options JSON
    let parsedOptions: string[] = []
    try {
      parsedOptions = JSON.parse(currentQuestion.options)
    } catch {
      parsedOptions = []
    }
    
    const isTrueFalse = currentQuestion.type === 'true_false'
    const currentAnswer = answers[currentQuestion.id]
    
    return (
      <div className="min-h-[calc(100vh-64px)] bg-white flex flex-col">
        {/* Top Progress Bar & Timer */}
        <div className="sticky top-0 z-20 bg-white border-b border-border/50 shadow-sm">
          {/* Progress bar */}
          <div className="h-1.5 bg-secondary">
            <div
              className="h-full bg-primary transition-all duration-300"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
          
          <div className="px-4 sm:px-6 lg:px-8 py-3 flex items-center gap-4">
            {/* Back to course */}
            <Button
              variant="ghost"
              size="sm"
              className="text-muted-foreground hidden sm:flex"
              onClick={() => {
                if (timerRef.current) clearInterval(timerRef.current)
                navigate('course-detail', { courseId: selectedCourseId })
              }}
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
              Exit
            </Button>
            
            {/* Question navigator */}
            <div className="flex items-center gap-2 text-sm">
              <span className="font-medium text-foreground">
                Question {currentQuestionIndex + 1}
              </span>
              <span className="text-muted-foreground">of {totalQuestions}</span>
            </div>
            
            <div className="flex-1" />
            
            {/* Timer */}
            <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-mono font-semibold ${
              isCriticalTime
                ? 'bg-red-100 text-red-700 animate-pulse'
                : isLowTime
                ? 'bg-amber-100 text-amber-700'
                : 'bg-accent/50 text-foreground'
            }`}>
              <Clock className="h-4 w-4" />
              {formatTime(timeRemaining)}
            </div>
            
            {/* Submit */}
            <Button
              size="sm"
              className="bg-primary hover:bg-primary/90 hidden sm:flex"
              onClick={() => setShowSubmitDialog(true)}
            >
              <Send className="h-4 w-4 mr-1" />
              Submit
            </Button>
          </div>
        </div>
        
        {/* Main Content */}
        <div className="flex-1 flex flex-col lg:flex-row">
          {/* Question Area */}
          <div className="flex-1 max-w-3xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
            {/* Question */}
            <div className="mb-8">
              <div className="flex items-start gap-3 mb-4">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary text-sm font-bold shrink-0 mt-0.5">
                  {currentQuestionIndex + 1}
                </div>
                <div className="flex-1">
                  <h2 className="text-lg sm:text-xl font-semibold text-foreground leading-relaxed">
                    {currentQuestion.text}
                  </h2>
                  <p className="text-xs text-muted-foreground mt-1">
                    {currentQuestion.points} point{currentQuestion.points !== 1 ? 's' : ''}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className={`h-8 w-8 shrink-0 ${flaggedQuestions.has(currentQuestion.id) ? 'text-amber-500' : 'text-muted-foreground'}`}
                  onClick={() => toggleFlag(currentQuestion.id)}
                >
                  <Flag className="h-4 w-4" fill={flaggedQuestions.has(currentQuestion.id) ? 'currentColor' : 'none'} />
                </Button>
              </div>
            </div>
            
            {/* Answer Options */}
            {isTrueFalse ? (
              <div className="grid grid-cols-2 gap-4 mb-8">
                <button
                  onClick={() => handleAnswerSelect(currentQuestion.id, 'True')}
                  className={`p-5 rounded-xl border-2 transition-all text-center font-semibold text-lg ${
                    currentAnswer === 'True'
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-border/50 hover:border-primary/30 hover:bg-accent/50 text-foreground'
                  }`}
                >
                  <CheckCircle className={`h-6 w-6 mx-auto mb-2 ${currentAnswer === 'True' ? 'text-primary' : 'text-emerald-500'}`} />
                  True
                </button>
                <button
                  onClick={() => handleAnswerSelect(currentQuestion.id, 'False')}
                  className={`p-5 rounded-xl border-2 transition-all text-center font-semibold text-lg ${
                    currentAnswer === 'False'
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-border/50 hover:border-primary/30 hover:bg-accent/50 text-foreground'
                  }`}
                >
                  <XCircle className={`h-6 w-6 mx-auto mb-2 ${currentAnswer === 'False' ? 'text-primary' : 'text-red-400'}`} />
                  False
                </button>
              </div>
            ) : (
              <div className="space-y-3 mb-8">
                {parsedOptions.map((option, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleAnswerSelect(currentQuestion.id, option)}
                    className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-all text-left ${
                      currentAnswer === option
                        ? 'border-primary bg-primary/10'
                        : 'border-border/50 hover:border-primary/30 hover:bg-accent/50'
                    }`}
                  >
                    <div className={`flex h-8 w-8 items-center justify-center rounded-lg text-sm font-bold shrink-0 ${
                      currentAnswer === option
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-accent text-muted-foreground'
                    }`}>
                      {getOptionLetter(idx)}
                    </div>
                    <span className={`text-sm sm:text-base ${
                      currentAnswer === option ? 'font-medium text-primary' : 'text-foreground'
                    }`}>
                      {option}
                    </span>
                  </button>
                ))}
              </div>
            )}
            
            {/* Navigation */}
            <div className="flex items-center justify-between gap-3">
              <Button
                variant="outline"
                onClick={() => goToQuestion(currentQuestionIndex - 1)}
                disabled={currentQuestionIndex === 0}
              >
                <ArrowLeft className="h-4 w-4 mr-1" />
                Previous
              </Button>
              
              {/* Mobile submit */}
              <Button
                className="bg-primary hover:bg-primary/90 sm:hidden"
                size="sm"
                onClick={() => setShowSubmitDialog(true)}
              >
                <Send className="h-4 w-4 mr-1" />
                Submit
              </Button>
              
              <Button
                variant={currentQuestionIndex === totalQuestions - 1 ? 'default' : 'outline'}
                onClick={() => {
                  if (currentQuestionIndex === totalQuestions - 1) {
                    setShowSubmitDialog(true)
                  } else {
                    goToQuestion(currentQuestionIndex + 1)
                  }
                }}
              >
                {currentQuestionIndex === totalQuestions - 1 ? (
                  <>
                    <Send className="h-4 w-4 mr-1" />
                    Finish
                  </>
                ) : (
                  <>
                    Next
                    <ArrowRight className="h-4 w-4 ml-1" />
                  </>
                )}
              </Button>
            </div>
          </div>
          
          {/* Question Map Sidebar - Desktop only */}
          <div className="hidden lg:block w-64 border-l border-border/50 bg-accent/20 p-4">
            <h3 className="text-sm font-semibold text-foreground mb-3">Question Map</h3>
            <div className="grid grid-cols-5 gap-2 mb-4">
              {quiz.questions.map((q, idx) => {
                const isAnswered = answers[q.id] !== undefined
                const isCurrent = idx === currentQuestionIndex
                const isFlagged = flaggedQuestions.has(q.id)
                return (
                  <button
                    key={q.id}
                    onClick={() => goToQuestion(idx)}
                    className={`relative h-8 w-8 rounded-lg text-xs font-medium transition-all ${
                      isCurrent
                        ? 'bg-primary text-primary-foreground ring-2 ring-primary ring-offset-1'
                        : isAnswered
                        ? 'bg-emerald-100 text-emerald-700'
                        : 'bg-white text-muted-foreground border border-border/50 hover:bg-accent/50'
                    }`}
                    title={`Question ${idx + 1}${isFlagged ? ' (Flagged)' : ''}`}
                  >
                    {idx + 1}
                    {isFlagged && (
                      <Flag className="absolute -top-1 -right-1 h-2.5 w-2.5 text-amber-500" fill="currentColor" />
                    )}
                  </button>
                )
              })}
            </div>
            
            <Separator className="my-4" />
            
            <div className="space-y-2 text-xs">
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded bg-emerald-100 border border-emerald-200" />
                <span className="text-muted-foreground">Answered ({answeredCount})</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded bg-white border border-border/50" />
                <span className="text-muted-foreground">Unanswered ({totalQuestions - answeredCount})</span>
              </div>
              <div className="flex items-center gap-2">
                <Flag className="h-3 w-3 text-amber-500" fill="currentColor" />
                <span className="text-muted-foreground">Flagged ({flaggedQuestions.size})</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Submit Confirmation Dialog */}
        <Dialog open={showSubmitDialog} onOpenChange={setShowSubmitDialog}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Submit Quiz?</DialogTitle>
              <DialogDescription>
                Are you sure you want to submit your quiz? You won&apos;t be able to change your answers after submission.
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Answered:</span>
                  <span className="font-medium text-emerald-600">{answeredCount} of {totalQuestions}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Unanswered:</span>
                  <span className={`font-medium ${totalQuestions - answeredCount > 0 ? 'text-red-500' : 'text-foreground'}`}>
                    {totalQuestions - answeredCount}
                  </span>
                </div>
                {flaggedQuestions.size > 0 && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Flagged for review:</span>
                    <span className="font-medium text-amber-600">{flaggedQuestions.size}</span>
                  </div>
                )}
              </div>
              {totalQuestions - answeredCount > 0 && (
                <Alert className="mt-4 border-amber-200 bg-amber-50">
                  <AlertCircle className="h-4 w-4 text-amber-600" />
                  <AlertDescription className="text-amber-800">
                    You have {totalQuestions - answeredCount} unanswered question{totalQuestions - answeredCount !== 1 ? 's' : ''}. 
                    Unanswered questions will be marked as incorrect.
                  </AlertDescription>
                </Alert>
              )}
            </div>
            <DialogFooter className="flex-col sm:flex-row gap-2">
              <Button variant="outline" onClick={() => setShowSubmitDialog(false)}>
                Continue Quiz
              </Button>
              <Button
                className="bg-primary hover:bg-primary/90"
                onClick={() => handleSubmitQuiz(false)}
                disabled={submitting}
              >
                {submitting ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Send className="h-4 w-4 mr-2" />
                )}
                Submit Quiz
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        
        {/* Time Up Dialog */}
        <Dialog open={showTimeUpDialog} onOpenChange={setShowTimeUpDialog}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="text-red-600">Time&apos;s Up!</DialogTitle>
              <DialogDescription>
                The time limit for this quiz has expired. Your answers will be automatically submitted.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                className="bg-primary hover:bg-primary/90"
                onClick={() => handleSubmitQuiz(true)}
                disabled={submitting}
              >
                {submitting ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <CheckCircle className="h-4 w-4 mr-2" />
                )}
                View Results
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    )
  }
  
  // ==================== FEEDBACK SCREEN (Final Exam Passed) ====================
  if (phase === 'feedback' && result) {
    const scoreDisplay = Math.round(result.scorePercentage)
    const letterGrade = result.letterGrade || calculateLetterGrade(result.scorePercentage)
    
    return (
      <div className="min-h-[calc(100vh-64px)] bg-gradient-to-b from-amber-50/50 to-white">
        <CelebrationOverlay />
        
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 max-w-2xl">
          {/* Success Header */}
          <Card className="border-2 border-emerald-200 shadow-lg mb-6">
            <CardContent className="p-6 sm:p-8 text-center">
              {/* Score Circle */}
              <div className="mx-auto w-28 h-28 rounded-full flex items-center justify-center mb-4 bg-emerald-100">
                <div className="text-center">
                  <p className="text-2xl font-bold text-emerald-700">{scoreDisplay}%</p>
                  <p className="text-xs text-muted-foreground">Score</p>
                </div>
              </div>
              
              <div className="flex items-center justify-center gap-2 mb-2">
                <CheckCircle className="h-6 w-6 text-emerald-600" />
                <h2 className="text-2xl font-bold text-emerald-700">Final Exam Passed!</h2>
              </div>
              
              {/* Letter Grade Badge */}
              <div className="flex items-center justify-center gap-3 mb-3">
                <span className="text-sm text-muted-foreground">Grade:</span>
                <Badge className={`${getGradeBgColor(letterGrade)} text-lg font-bold px-4 py-1`}>
                  {letterGrade}
                </Badge>
                <Badge variant="outline" className="text-xs">
                  {getGradeLabel(letterGrade)}
                </Badge>
              </div>
              
              <p className="text-sm text-muted-foreground">
                Congratulations! You have successfully passed the final exam.
              </p>
            </CardContent>
          </Card>
          
          {/* Feedback Form */}
          {!feedbackSubmitted ? (
            <Card className="border-border/50 shadow-lg mb-6">
              <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <MessageSquare className="h-5 w-5 text-primary" />
                  <h3 className="text-lg font-semibold text-foreground">Share Your Experience</h3>
                </div>
                <p className="text-sm text-muted-foreground mb-6">
                  How was your experience with this course? Your feedback helps us improve.
                </p>
                
                {/* Star Rating */}
                <div className="mb-6">
                  <Label className="text-sm font-medium text-foreground mb-2 block">
                    Rating <span className="text-red-500">*</span>
                  </Label>
                  <StarRating value={feedbackRating} onChange={setFeedbackRating} />
                </div>
                
                {/* Feedback Text */}
                <div className="mb-6">
                  <Label htmlFor="feedback-text" className="text-sm font-medium text-foreground mb-2 block">
                    How was your experience with this course?
                  </Label>
                  <Textarea
                    id="feedback-text"
                    placeholder="Tell us about your learning experience..."
                    value={feedbackText}
                    onChange={(e) => setFeedbackText(e.target.value)}
                    rows={4}
                    className="resize-none"
                  />
                </div>
                
                {/* Actions */}
                <div className="flex flex-col sm:flex-row gap-3">
                  <Button
                    className="flex-1 bg-primary hover:bg-primary/90"
                    onClick={handleSubmitFeedback}
                    disabled={submittingFeedback || feedbackRating === 0}
                  >
                    {submittingFeedback ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Send className="h-4 w-4 mr-2" />
                    )}
                    Submit Feedback
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={() => setFeedbackSubmitted(true)}
                  >
                    Skip
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="border-emerald-200 bg-emerald-50/50 mb-6">
              <CardContent className="p-6 text-center">
                <CheckCircle className="h-8 w-8 text-emerald-600 mx-auto mb-2" />
                <p className="text-sm font-medium text-emerald-700">
                  {feedbackRating > 0 ? 'Thank you for your feedback!' : 'Feedback skipped'}
                </p>
              </CardContent>
            </Card>
          )}
          
          {/* Certificate Generation */}
          <Card className="border-amber-200 bg-amber-50/30 shadow-lg">
            <CardContent className="p-6 text-center">
              <Award className="h-12 w-12 text-amber-600 mx-auto mb-3" />
              <h3 className="text-lg font-semibold text-foreground mb-2">Generate Your Certificate</h3>
              <p className="text-sm text-muted-foreground mb-6">
                You&apos;ve earned a certificate of completion! Generate it now to download and share.
              </p>
              
              {!generatedCertificateId ? (
                <Button
                  className="bg-primary hover:bg-primary/90"
                  size="lg"
                  onClick={handleGenerateCertificate}
                  disabled={generatingCertificate}
                >
                  {generatingCertificate ? (
                    <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                  ) : (
                    <Award className="h-5 w-5 mr-2" />
                  )}
                  Generate Certificate
                </Button>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-center justify-center gap-2 text-emerald-600">
                    <CheckCircle className="h-5 w-5" />
                    <span className="font-medium">Certificate Ready!</span>
                  </div>
                  <Button
                    className="bg-primary hover:bg-primary/90"
                    onClick={() => navigate('certificate', { certificateId: generatedCertificateId })}
                  >
                    <Award className="h-4 w-4 mr-2" />
                    View Certificate
                  </Button>
                </div>
              )}
              
              <div className="mt-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate('course-detail', { courseId: selectedCourseId })}
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Course
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }
  
  // ==================== RESULTS SCREEN ====================
  if (phase === 'results' && result) {
    const isPractice = quiz.type === 'practice'
    const scoreDisplay = Math.round(result.scorePercentage)
    const passed = result.passed
    const attemptsUsed = previousAttempts.length + 1
    const canRetake = attemptsUsed < quiz.maxAttempts
    const letterGrade = result.letterGrade || calculateLetterGrade(result.scorePercentage)
    
    return (
      <div className="min-h-[calc(100vh-64px)] bg-gradient-to-b from-amber-50/50 to-white">
        {passed && <CelebrationOverlay />}
        
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 max-w-3xl">
          {/* Back button */}
          <Button
            variant="ghost"
            size="sm"
            className="mb-6 text-muted-foreground"
            onClick={() => navigate('course-detail', { courseId: selectedCourseId })}
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to Course
          </Button>
          
          {/* Results Card */}
          <Card className={`border-2 ${passed ? 'border-emerald-200' : 'border-red-200'} shadow-lg mb-6`}>
            <CardContent className="p-6 sm:p-8 text-center">
              {/* Score Circle */}
              <div className={`mx-auto w-32 h-32 rounded-full flex items-center justify-center mb-6 ${
                passed
                  ? 'bg-emerald-100'
                  : 'bg-red-100'
              }`}>
                <div className="text-center">
                  <p className={`text-3xl font-bold ${passed ? 'text-emerald-700' : 'text-red-600'}`}>
                    {scoreDisplay}%
                  </p>
                  <p className="text-xs text-muted-foreground">Score</p>
                </div>
              </div>
              
              {/* Letter Grade Badge */}
              <div className="flex items-center justify-center gap-3 mb-4">
                <Badge className={`${getGradeBgColor(letterGrade)} text-2xl font-bold px-6 py-2`}>
                  {letterGrade}
                </Badge>
                <Badge variant="outline" className="text-sm">
                  {getGradeLabel(letterGrade)}
                </Badge>
              </div>
              
              {/* Pass/Fail */}
              {passed ? (
                <div className="mb-4">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <CheckCircle className="h-6 w-6 text-emerald-600" />
                    <h2 className="text-2xl font-bold text-emerald-700">Passed!</h2>
                  </div>
                  <p className="text-muted-foreground">
                    Congratulations! You scored above the {result.passingScore}% passing threshold.
                  </p>
                </div>
              ) : (
                <div className="mb-4">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <XCircle className="h-6 w-6 text-red-500" />
                    <h2 className="text-2xl font-bold text-red-600">Not Passed</h2>
                  </div>
                  <p className="text-muted-foreground">
                    You need {result.passingScore}% to pass. {canRetake ? 'You can try again!' : 'No more attempts remaining.'}
                  </p>
                </div>
              )}
              
              {/* Score Details */}
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="p-3 bg-accent/50 rounded-xl">
                  <p className="text-xs text-muted-foreground">Earned</p>
                  <p className="text-lg font-bold text-foreground">{result.earnedPoints}</p>
                </div>
                <div className="p-3 bg-accent/50 rounded-xl">
                  <p className="text-xs text-muted-foreground">Total</p>
                  <p className="text-lg font-bold text-foreground">{result.totalPoints}</p>
                </div>
                <div className="p-3 bg-accent/50 rounded-xl">
                  <p className="text-xs text-muted-foreground">Passing</p>
                  <p className="text-lg font-bold text-foreground">{result.passingScore}%</p>
                </div>
              </div>
              
              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                {canRetake && (
                  <Button
                    variant="outline"
                    onClick={() => {
                      setPhase('start')
                      setResult(null)
                      setQuizWithAnswers(null)
                      setFeedbackSubmitted(false)
                      setFeedbackRating(0)
                      setFeedbackText('')
                      setGeneratedCertificateId(null)
                      fetchPreviousAttempts()
                    }}
                  >
                    <RotateCcw className="h-4 w-4 mr-2" />
                    Retake Quiz
                  </Button>
                )}
                <Button
                  className="bg-primary hover:bg-primary/90"
                  onClick={() => navigate('course-detail', { courseId: selectedCourseId })}
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Course
                </Button>
              </div>
            </CardContent>
          </Card>
          
          {/* Grade Scale Info Card */}
          <div className="mb-6">
            <GradeScaleCard />
          </div>
          
          {/* Practice Quiz - Show Answers Review */}
          {isPractice && quizWithAnswers && (
            <Card className="border-border/50 shadow-lg">
              <CardContent className="p-6">
                <h3 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
                  <GraduationCap className="h-5 w-5 text-primary" />
                  Answer Review
                </h3>
                <div className="space-y-6">
                  {quizWithAnswers.questions.map((q, idx) => {
                    const userAnswer = answers[q.id]
                    const isCorrect = userAnswer && q.correctAnswer && 
                      String(userAnswer).trim().toLowerCase() === String(q.correctAnswer).trim().toLowerCase()
                    
                    let qParsedOptions: string[] = []
                    try {
                      qParsedOptions = JSON.parse(q.options)
                    } catch {
                      // ignore
                    }
                    
                    return (
                      <div key={q.id} className="border border-border/50 rounded-xl p-4">
                        <div className="flex items-start gap-3 mb-3">
                          <div className={`flex h-6 w-6 items-center justify-center rounded-full shrink-0 mt-0.5 ${
                            isCorrect ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-600'
                          }`}>
                            {isCorrect ? (
                              <CheckCircle className="h-4 w-4" />
                            ) : (
                              <XCircle className="h-4 w-4" />
                            )}
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-medium text-foreground">
                              {idx + 1}. {q.text}
                            </p>
                          </div>
                        </div>
                        
                        <div className="ml-9 space-y-1.5">
                          {qParsedOptions.map((opt, optIdx) => {
                            const isThisCorrect = q.correctAnswer && opt === q.correctAnswer
                            const isThisUserAnswer = userAnswer === opt
                            return (
                              <div
                                key={optIdx}
                                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm ${
                                  isThisCorrect
                                    ? 'bg-emerald-50 text-emerald-800 font-medium'
                                    : isThisUserAnswer && !isThisCorrect
                                    ? 'bg-red-50 text-red-700 line-through'
                                    : 'text-muted-foreground'
                                }`}
                              >
                                <span className="text-xs font-mono">{getOptionLetter(optIdx)}</span>
                                {opt}
                                {isThisCorrect && <CheckCircle className="h-3.5 w-3.5 ml-auto text-emerald-600" />}
                                {isThisUserAnswer && !isThisCorrect && <XCircle className="h-3.5 w-3.5 ml-auto text-red-500" />}
                              </div>
                            )
                          })}
                        </div>
                        
                        {!userAnswer && (
                          <p className="ml-9 mt-2 text-xs text-red-500">You did not answer this question.</p>
                        )}
                        
                        {q.explanation && (
                          <div className="ml-9 mt-3 p-3 bg-amber-50 rounded-lg border border-amber-100">
                            <p className="text-xs font-semibold text-amber-800 mb-1">Explanation</p>
                            <p className="text-xs text-amber-700 leading-relaxed">{q.explanation}</p>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          )}
          
          {/* Graded/Final Quiz - No answer details */}
          {!isPractice && (
            <Card className="border-border/50">
              <CardContent className="p-6 text-center">
                <GraduationCap className="h-8 w-8 text-muted-foreground/30 mx-auto mb-3" />
                <p className="text-sm text-muted-foreground">
                  Detailed answers are not shown for {quiz.type === 'final' ? 'final exams' : 'graded quizzes'}.
                  Review the course material if you&apos;d like to improve your score.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    )
  }
  
  // Fallback
  return null
}
