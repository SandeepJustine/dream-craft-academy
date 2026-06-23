import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const assignment = await db.assignment.findUnique({
      where: { id },
      include: {
        module: {
          select: {
            id: true,
            title: true,
            courseId: true,
            course: {
              select: { id: true, title: true },
            },
          },
        },
        submissions: {
          include: {
            user: {
              select: { id: true, name: true, email: true },
            },
          },
          orderBy: { submittedAt: 'desc' },
        },
        _count: { select: { submissions: true } },
      },
    })

    if (!assignment) {
      return NextResponse.json({ error: 'Assignment not found' }, { status: 404 })
    }

    return NextResponse.json(assignment)
  } catch (error) {
    console.error('Error fetching assignment:', error)
    return NextResponse.json({ error: 'Failed to fetch assignment' }, { status: 500 })
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { action, submissionId, score, feedback, graderId } = body

    if (action !== 'grade') {
      return NextResponse.json({ error: 'Invalid action. Use "grade"' }, { status: 400 })
    }

    if (!submissionId || score === undefined || score === null) {
      return NextResponse.json(
        { error: 'submissionId and score are required' },
        { status: 400 }
      )
    }

    const numScore = Number(score)
    if (isNaN(numScore) || numScore < 0 || numScore > 100) {
      return NextResponse.json(
        { error: 'Score must be a number between 0 and 100' },
        { status: 400 }
      )
    }

    // Verify the submission exists and belongs to this assignment
    const submission = await db.assignmentSubmission.findUnique({
      where: { id: submissionId },
    })

    if (!submission) {
      return NextResponse.json({ error: 'Submission not found' }, { status: 404 })
    }

    if (submission.assignmentId !== id) {
      return NextResponse.json(
        { error: 'Submission does not belong to this assignment' },
        { status: 400 }
      )
    }

    // Update the submission with grade and feedback
    const updatedSubmission = await db.assignmentSubmission.update({
      where: { id: submissionId },
      data: {
        score: numScore,
        feedback: feedback || null,
        status: 'graded',
        gradedAt: new Date(),
      },
      include: {
        user: {
          select: { id: true, name: true, email: true, avatar: true },
        },
        assignment: {
          select: {
            id: true,
            title: true,
            maxScore: true,
            module: {
              select: {
                course: {
                  select: { id: true, title: true, instructor: true },
                },
              },
            },
          },
        },
      },
    })

    // Recalculate enrollment overall grade
    const enrollmentId = submission.enrollmentId
    const enrollment = await db.enrollment.findUnique({
      where: { id: enrollmentId },
      include: {
        quizAttempts: { where: { completedAt: { not: null } } },
        submissions: { where: { status: 'graded', score: { not: null } } },
      },
    })

    if (enrollment) {
      const quizAvg =
        enrollment.quizAttempts.length > 0
          ? enrollment.quizAttempts.reduce((sum, q) => sum + q.score, 0) /
            enrollment.quizAttempts.length
          : 0
      const assignAvg =
        enrollment.submissions.length > 0
          ? enrollment.submissions.reduce((sum, a) => sum + (a.score || 0), 0) /
            enrollment.submissions.length
          : 0

      const hasQuizzes = enrollment.quizAttempts.length > 0
      const hasAssignments = enrollment.submissions.length > 0

      let overallGrade = 0
      if (hasQuizzes && hasAssignments) {
        overallGrade = Math.round(quizAvg * 0.6 + assignAvg * 0.4)
      } else if (hasQuizzes) {
        overallGrade = Math.round(quizAvg)
      } else if (hasAssignments) {
        overallGrade = Math.round(assignAvg)
      }

      const calculateLetterGrade = (s: number): string => {
        if (s >= 97) return 'A+'
        if (s >= 93) return 'A'
        if (s >= 90) return 'A-'
        if (s >= 87) return 'B+'
        if (s >= 83) return 'B'
        if (s >= 80) return 'B-'
        if (s >= 77) return 'C+'
        if (s >= 73) return 'C'
        if (s >= 70) return 'C-'
        if (s >= 67) return 'D+'
        if (s >= 63) return 'D'
        if (s >= 60) return 'D-'
        return 'F'
      }

      await db.enrollment.update({
        where: { id: enrollmentId },
        data: {
          overallGrade,
          letterGrade: calculateLetterGrade(overallGrade),
        },
      })
    }

    return NextResponse.json(updatedSubmission)
  } catch (error) {
    console.error('Error grading assignment:', error)
    return NextResponse.json({ error: 'Failed to grade assignment' }, { status: 500 })
  }
}
