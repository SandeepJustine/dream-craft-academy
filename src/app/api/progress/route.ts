import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, lessonId, enrollmentId } = body

    if (!userId || !lessonId || !enrollmentId) {
      return NextResponse.json(
        { error: 'userId, lessonId, and enrollmentId are required' },
        { status: 400 }
      )
    }

    const progress = await db.lessonProgress.upsert({
      where: { userId_lessonId: { userId, lessonId } },
      update: { completed: true, completedAt: new Date() },
      create: {
        userId,
        lessonId,
        enrollmentId,
        completed: true,
        completedAt: new Date(),
      },
    })

    // Update enrollment progress and lastAccessedAt
    const enrollment = await db.enrollment.findUnique({
      where: { id: enrollmentId },
      include: {
        course: {
          include: {
            modules: {
              include: {
                lessons: true,
                quizzes: true,
              },
            },
          },
        },
        lessonProgress: true,
        quizAttempts: true,
      },
    })

    if (enrollment) {
      const totalLessons = enrollment.course.modules.reduce(
        (sum, m) => sum + m.lessons.length,
        0
      )
      const completedLessons = enrollment.lessonProgress.filter(
        (lp) => lp.completed
      ).length
      const progressPct = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100 * 100) / 100 : 0

      await db.enrollment.update({
        where: { id: enrollmentId },
        data: {
          progress: progressPct,
          lastAccessedAt: new Date(),
          status: progressPct >= 100 ? 'completed' : 'active',
          completedAt: progressPct >= 100 ? new Date() : undefined,
        },
      })

      // Auto-generate certificate if all lessons complete AND all quizzes passed
      if (progressPct >= 100) {
        try {
          await checkAndGenerateCertificate(enrollment)
        } catch (certError) {
          console.error('Error checking certificate generation:', certError)
          // Don't fail the progress update if certificate check fails
        }
      }
    }

    return NextResponse.json(progress)
  } catch (error) {
    console.error('Error updating progress:', error)
    return NextResponse.json({ error: 'Failed to update progress' }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const userId = searchParams.get('userId')
    const courseId = searchParams.get('courseId')

    if (!userId || !courseId) {
      return NextResponse.json(
        { error: 'userId and courseId are required' },
        { status: 400 }
      )
    }

    const enrollment = await db.enrollment.findUnique({
      where: { userId_courseId: { userId, courseId } },
      include: {
        lessonProgress: true,
      },
    })

    if (!enrollment) {
      return NextResponse.json({ error: 'Not enrolled' }, { status: 404 })
    }

    return NextResponse.json({
      enrollmentId: enrollment.id,
      progress: enrollment.progress,
      status: enrollment.status,
      overallGrade: enrollment.overallGrade,
      lastAccessedAt: enrollment.lastAccessedAt,
      completedLessons: enrollment.lessonProgress
        .filter((lp) => lp.completed)
        .map((lp) => lp.lessonId),
    })
  } catch (error) {
    console.error('Error fetching progress:', error)
    return NextResponse.json({ error: 'Failed to fetch progress' }, { status: 500 })
  }
}

/**
 * Check if all lessons are completed and all quizzes passed for a course enrollment.
 * If so, auto-generate a certificate.
 */
async function checkAndGenerateCertificate(
  enrollment: {
    id: string
    userId: string
    courseId: string
    course: {
      modules: {
        lessons: { id: string }[]
        quizzes: { id: string }[]
      }[]
    }
    lessonProgress: { lessonId: string; completed: boolean }[]
    quizAttempts: { quizId: string; passed: boolean }[]
  }
) {
  // Check if certificate already exists
  const existingCert = await db.certificate.findUnique({
    where: { enrollmentId: enrollment.id },
  })
  if (existingCert) return

  // Check all lessons are completed
  const allLessonIds = enrollment.course.modules.flatMap((m) => m.lessons.map((l) => l.id))
  const completedLessonIds = enrollment.lessonProgress
    .filter((lp) => lp.completed)
    .map((lp) => lp.lessonId)
  const allLessonsComplete = allLessonIds.every((id) => completedLessonIds.includes(id))

  if (!allLessonsComplete) return

  // Check all quizzes are passed (at least one passing attempt per quiz)
  const allQuizIds = enrollment.course.modules.flatMap((m) => m.quizzes.map((q) => q.id))
  if (allQuizIds.length > 0) {
    const passedQuizIds = new Set(
      enrollment.quizAttempts.filter((a) => a.passed).map((a) => a.quizId)
    )
    const allQuizzesPassed = allQuizIds.every((id) => passedQuizIds.has(id))
    if (!allQuizzesPassed) return
  }

  // Calculate final grade
  const quizScores = enrollment.quizAttempts
    .filter((a) => a.passed)
    .map((a) => {
      // Need to re-fetch to get scores
      return a.passed
    })

  // Fetch full attempt data for grade calculation
  const fullEnrollment = await db.enrollment.findUnique({
    where: { id: enrollment.id },
    include: { quizAttempts: true },
  })

  const scores = fullEnrollment?.quizAttempts
    .filter((a) => a.completedAt)
    .map((a) => a.score) || []
  const avgQuizScore = scores.length > 0
    ? scores.reduce((sum, s) => sum + s, 0) / scores.length
    : 0

  // Get assignment submissions
  const submissions = await db.assignmentSubmission.findMany({
    where: { enrollmentId: enrollment.id, score: { not: null } },
  })
  const assignmentScores = submissions
    .map((s) => s.score)
    .filter((s): s is number => s !== null)
  const avgAssignmentScore = assignmentScores.length > 0
    ? assignmentScores.reduce((sum, s) => sum + s, 0) / assignmentScores.length
    : 0

  // Weighted: 60% quizzes, 40% assignments (or 100% quizzes if no assignments)
  let finalGrade: number
  if (assignmentScores.length > 0) {
    finalGrade = Math.round((avgQuizScore * 0.6 + avgAssignmentScore * 0.4) * 100) / 100
  } else {
    finalGrade = Math.round(avgQuizScore * 100) / 100
  }

  // Generate certificate number
  const year = new Date().getFullYear()
  const random = Math.random().toString(36).substring(2, 8).toUpperCase()
  const certificateNumber = `DCI-${year}-${random}`

  // Create certificate
  const certificate = await db.certificate.create({
    data: {
      userId: enrollment.userId,
      courseId: enrollment.courseId,
      enrollmentId: enrollment.id,
      certificateNumber,
      finalGrade,
    },
  })

  // Update enrollment with final grade
  await db.enrollment.update({
    where: { id: enrollment.id },
    data: {
      status: 'completed',
      completedAt: new Date(),
      progress: 100,
      overallGrade: finalGrade,
    },
  })

  console.log(`Certificate auto-generated: ${certificateNumber} for enrollment ${enrollment.id}`)
  return certificate
}
