'use client'

import { useState, useEffect } from 'react'
import { useAppStore } from '@/lib/store'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { toast } from 'sonner'
import {
  ArrowLeft,
  CheckCircle,
  AlertCircle,
  FileText,
  Send,
  Loader2,
  Clock,
  GraduationCap,
  Upload,
  MessageSquare,
  Trophy,
  XCircle,
} from 'lucide-react'

// --- Types ---

interface AssignmentData {
  id: string
  title: string
  description: string
  type: string
  maxScore: number
  dueDate: string | null
  order: number
  moduleId: string
  module: {
    id: string
    title: string
    courseId: string
    course: {
      id: string
      title: string
    }
  }
  submissions: SubmissionData[]
  _count: {
    submissions: number
  }
}

interface SubmissionData {
  id: string
  userId: string
  assignmentId: string
  enrollmentId: string
  content: string
  fileUrl: string | null
  score: number | null
  feedback: string | null
  status: string
  submittedAt: string
  gradedAt: string | null
  user: {
    id: string
    name: string | null
    email: string
  }
}

// --- Main Component ---

export function AssignmentPage() {
  const { selectedAssignmentId, selectedCourseId, navigate, currentUser } = useAppStore()
  
  const [assignment, setAssignment] = useState<AssignmentData | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [content, setContent] = useState('')
  const [hasSubmitted, setHasSubmitted] = useState(false)
  
  // --- Fetch assignment data ---
  useEffect(() => {
    if (selectedAssignmentId) {
      fetchAssignment()
    }
  }, [selectedAssignmentId])
  
  const fetchAssignment = async () => {
    try {
      const res = await fetch(`/api/assignments/${selectedAssignmentId}`)
      if (res.ok) {
        const data = await res.json()
        setAssignment(data)
        
        // Check if current user has already submitted
        if (currentUser) {
          const existingSubmission = data.submissions.find(
            (s: SubmissionData) => s.userId === currentUser.id
          )
          if (existingSubmission) {
            setHasSubmitted(true)
            setContent(existingSubmission.content)
          }
        }
      }
    } catch (error) {
      console.error('Error fetching assignment:', error)
    } finally {
      setLoading(false)
    }
  }
  
  // --- Get enrollment ID ---
  const getEnrollmentId = async (): Promise<string | null> => {
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
  }
  
  // --- Submit Assignment ---
  const handleSubmit = async () => {
    if (!currentUser) {
      toast.error('Please sign in to submit assignments')
      return
    }
    
    if (!content.trim()) {
      toast.error('Please write your response before submitting')
      return
    }
    
    const enrollmentId = await getEnrollmentId()
    if (!enrollmentId) {
      toast.error('You must be enrolled in this course to submit assignments')
      return
    }
    
    setSubmitting(true)
    try {
      const res = await fetch('/api/assignments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: currentUser.id,
          assignmentId: selectedAssignmentId,
          enrollmentId,
          content,
        }),
      })
      
      if (res.ok) {
        toast.success('Assignment submitted successfully!')
        setHasSubmitted(true)
        fetchAssignment() // Refresh to show the submission
      } else {
        const data = await res.json()
        toast.error(data.error || 'Failed to submit assignment')
      }
    } catch {
      toast.error('Failed to submit assignment')
    } finally {
      setSubmitting(false)
    }
  }
  
  // --- Format date ---
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }
  
  const isOverdue = assignment?.dueDate ? new Date(assignment.dueDate) < new Date() : false
  
  // --- Loading ---
  if (loading) {
    return (
      <div className="min-h-[calc(100vh-64px)] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }
  
  if (!assignment) {
    return (
      <div className="min-h-[calc(100vh-64px)] flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-4">Assignment not found</h2>
          <Button onClick={() => navigate('course-detail', { courseId: selectedCourseId })}>
            Back to Course
          </Button>
        </div>
      </div>
    )
  }
  
  // Find current user's submission
  const mySubmission = currentUser
    ? assignment.submissions.find((s) => s.userId === currentUser.id)
    : null
  
  // Other submissions (for display)
  const otherSubmissions = currentUser
    ? assignment.submissions.filter((s) => s.userId !== currentUser.id)
    : assignment.submissions
  
  return (
    <div className="min-h-[calc(100vh-64px)] bg-gradient-to-b from-amber-50/50 to-white">
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
        
        {/* Assignment Header Card */}
        <Card className="border-border/50 shadow-lg mb-6">
          <CardContent className="p-6 sm:p-8">
            {/* Type badge */}
            <div className="flex flex-wrap items-center gap-2 mb-4">
              <Badge className="bg-amber-100 text-amber-800">
                {assignment.type === 'written' ? 'Written Assignment' : assignment.type}
              </Badge>
              <Badge variant="outline" className="text-xs">
                <Trophy className="h-3 w-3 mr-1" />
                {assignment.maxScore} points
              </Badge>
              {assignment.dueDate && (
                <Badge
                  variant="outline"
                  className={`text-xs ${isOverdue ? 'border-red-300 text-red-600' : ''}`}
                >
                  <Clock className="h-3 w-3 mr-1" />
                  Due {formatDate(assignment.dueDate)}
                </Badge>
              )}
            </div>
            
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-3">
              {assignment.title}
            </h1>
            
            <p className="text-muted-foreground leading-relaxed mb-4 whitespace-pre-line">
              {assignment.description}
            </p>
            
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <GraduationCap className="h-3.5 w-3.5" />
              <span>{assignment.module.title} · {assignment.module.course.title}</span>
            </div>
          </CardContent>
        </Card>
        
        {/* Overdue Warning */}
        {isOverdue && !mySubmission && (
          <Alert className="mb-6 border-red-200 bg-red-50">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">
              This assignment was due on {formatDate(assignment.dueDate!)}. Late submissions may still be accepted.
            </AlertDescription>
          </Alert>
        )}
        
        {/* My Submission Status */}
        {mySubmission && (
          <Card className={`border-2 mb-6 ${
            mySubmission.status === 'graded' 
              ? 'border-emerald-200' 
              : 'border-amber-200'
          }`}>
            <CardContent className="p-6">
              <div className="flex items-center gap-2 mb-4">
                {mySubmission.status === 'graded' ? (
                  <>
                    <CheckCircle className="h-5 w-5 text-emerald-600" />
                    <h3 className="font-semibold text-emerald-700">Graded</h3>
                  </>
                ) : (
                  <>
                    <Clock className="h-5 w-5 text-amber-600" />
                    <h3 className="font-semibold text-amber-700">Submitted — Awaiting Grade</h3>
                  </>
                )}
              </div>
              
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-4">
                <div className="p-3 bg-accent/50 rounded-xl">
                  <p className="text-xs text-muted-foreground">Status</p>
                  <Badge className={`mt-1 ${
                    mySubmission.status === 'graded'
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-amber-100 text-amber-800'
                  }`}>
                    {mySubmission.status === 'graded' ? 'Graded' : 'Submitted'}
                  </Badge>
                </div>
                <div className="p-3 bg-accent/50 rounded-xl">
                  <p className="text-xs text-muted-foreground">Submitted</p>
                  <p className="text-sm font-medium text-foreground">{formatDate(mySubmission.submittedAt)}</p>
                </div>
                {mySubmission.score !== null && (
                  <div className="p-3 bg-accent/50 rounded-xl">
                    <p className="text-xs text-muted-foreground">Score</p>
                    <p className={`text-sm font-bold ${
                      mySubmission.score >= assignment.maxScore * 0.7
                        ? 'text-emerald-600'
                        : 'text-red-600'
                    }`}>
                      {mySubmission.score}/{assignment.maxScore}
                    </p>
                  </div>
                )}
              </div>
              
              {/* Instructor Feedback */}
              {mySubmission.feedback && (
                <div className="p-4 bg-primary/5 rounded-xl border border-primary/10">
                  <div className="flex items-center gap-2 mb-2">
                    <MessageSquare className="h-4 w-4 text-primary" />
                    <p className="text-sm font-semibold text-primary">Instructor Feedback</p>
                  </div>
                  <p className="text-sm text-foreground/80 leading-relaxed">
                    {mySubmission.feedback}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        )}
        
        {/* Submission Form */}
        <Card className="border-border/50 shadow-lg mb-6">
          <CardContent className="p-6 sm:p-8">
            <h2 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              {hasSubmitted ? 'Update Your Submission' : 'Your Submission'}
            </h2>
            
            {/* Text Area */}
            <div className="mb-4">
              <Label htmlFor="assignment-content" className="mb-2 block text-sm font-medium text-foreground">
                Written Response
              </Label>
              <Textarea
                id="assignment-content"
                placeholder="Write your response here... Take your time to reflect and provide a thoughtful answer."
                className="min-h-[200px] resize-y"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                disabled={!currentUser}
              />
              <p className="text-xs text-muted-foreground mt-1">
                {content.length} characters
              </p>
            </div>
            
            {/* File Upload (Simulated) */}
            <div className="mb-6">
              <Label className="mb-2 block text-sm font-medium text-foreground">
                Attachments (Optional)
              </Label>
              <div className="border-2 border-dashed border-border/50 rounded-xl p-6 text-center hover:border-primary/30 transition-colors">
                <Upload className="h-8 w-8 text-muted-foreground/40 mx-auto mb-2" />
                <p className="text-sm text-muted-foreground mb-2">
                  Drag & drop files here, or click to browse
                </p>
                <Button variant="outline" size="sm" type="button">
                  <Upload className="h-4 w-4 mr-2" />
                  Choose File
                </Button>
                <p className="text-xs text-muted-foreground mt-2">
                  PDF, DOC, DOCX up to 10MB
                </p>
              </div>
            </div>
            
            <Separator className="my-6" />
            
            {/* Submit Button */}
            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                className="flex-1 bg-primary hover:bg-primary/90"
                onClick={handleSubmit}
                disabled={submitting || !currentUser || !content.trim()}
                size="lg"
              >
                {submitting ? (
                  <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                ) : (
                  <Send className="h-5 w-5 mr-2" />
                )}
                {hasSubmitted ? 'Update Submission' : 'Submit Assignment'}
              </Button>
            </div>
            
            {!currentUser && (
              <p className="text-xs text-muted-foreground text-center mt-3">
                Please sign in to submit assignments
              </p>
            )}
          </CardContent>
        </Card>
        
        {/* Previous Submissions History */}
        {mySubmission && (
          <Card className="border-border/50">
            <CardContent className="p-6">
              <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                Submission History
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-accent/30 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className={`flex h-8 w-8 items-center justify-center rounded-full ${
                      mySubmission.status === 'graded'
                        ? 'bg-emerald-100 text-emerald-700'
                        : 'bg-amber-100 text-amber-700'
                    }`}>
                      {mySubmission.status === 'graded' ? (
                        <CheckCircle className="h-4 w-4" />
                      ) : (
                        <Clock className="h-4 w-4" />
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        {mySubmission.status === 'graded' ? 'Graded Submission' : 'Current Submission'}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Submitted on {formatDate(mySubmission.submittedAt)}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    {mySubmission.score !== null ? (
                      <div>
                        <p className={`text-sm font-bold ${
                          mySubmission.score >= assignment.maxScore * 0.7
                            ? 'text-emerald-600'
                            : 'text-red-500'
                        }`}>
                          {mySubmission.score}/{assignment.maxScore}
                        </p>
                      </div>
                    ) : (
                      <Badge variant="outline" className="text-xs">Pending</Badge>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
