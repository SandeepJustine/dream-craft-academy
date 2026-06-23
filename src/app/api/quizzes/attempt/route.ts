import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

/**
 * Calculate letter grade using the international grading system
 */
function calculateLetterGrade(percentage: number): string {
  if (percentage >= 97) return 'A+'
  if (percentage >= 93) return 'A'
  if (percentage >= 90) return 'A-'
  if (percentage >= 87) return 'B+'
  if (percentage >= 83) return 'B'
  if (percentage >= 80) return 'B-'
  if (percentage >= 77) return 'C+'
  if (percentage >= 73) return 'C'
  if (percentage >= 70) return 'C-'
  if (percentage >= 67) return 'D+'
  if (percentage >= 63) return 'D'
  if (percentage >= 60) return 'D-'
  return 'F'
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action } = body

    if (action === 'start') {
      // Start a new quiz attempt
      const { quizId, userId, enrollmentId } = body

      if (!quizId || !userId || !enrollmentId) {
        return NextResponse.json(
          { error: 'quizId, userId, and enrollmentId are required' },
          { status: 400 }
        )
      }

      // Check if quiz exists
      const quiz = await db.quiz.findUnique({
        where: { id: quizId },
        include: {
          questions: { orderBy: { order: 'asc' } },
          attempts: {
            where: { userId, enrollmentId },
            orderBy: { startedAt: 'desc' },
          },
        },
      })

      if (!quiz) {
        return NextResponse.json({ error: 'Quiz not found' }, { status: 404 })
      }

      // Check max attempts
      const completedAttempts = quiz.attempts.filter((a) => a.completedAt !== null)
      if (completedAttempts.length >= quiz.maxAttempts) {
        return NextResponse.json(
          { error: 'Maximum attempts reached for this quiz', attempts: completedAttempts.length },
          { status: 400 }
        )
      }

      // Check if there's an in-progress attempt
      const inProgress = quiz.attempts.find((a) => a.completedAt === null)
      if (inProgress) {
        // Return the existing attempt
        const questionsWithoutAnswers = quiz.questions.map((q) => {
          const { correctAnswer, explanation, ...rest } = q
          return rest
        })
        return NextResponse.json({
          attempt: inProgress,
          quiz: {
            id: quiz.id,
            title: quiz.title,
            type: quiz.type,
            timeLimit: quiz.timeLimit,
            passingScore: quiz.passingScore,
            questions: questionsWithoutAnswers,
          },
        })
      }

      // Create new attempt
      const maxScore = quiz.questions.reduce((sum, q) => sum + q.points, 0)

      const attempt = await db.quizAttempt.create({
        data: {
          userId,
          quizId,
          enrollmentId,
          maxScore,
          answers: '{}',
          score: 0,
          passed: false,
        },
      })

      // Return quiz without correct answers
      const questionsWithoutAnswers = quiz.questions.map((q) => {
        const { correctAnswer, explanation, ...rest } = q
        return rest
      })

      return NextResponse.json({
        attempt,
        quiz: {
          id: quiz.id,
          title: quiz.title,
          type: quiz.type,
          timeLimit: quiz.timeLimit,
          passingScore: quiz.passingScore,
          questions: questionsWithoutAnswers,
        },
      }, { status: 201 })
    }

    if (action === 'submit') {
      // Submit quiz answers
      const { attemptId, answers, timeSpent } = body

      if (!attemptId || !answers) {
        return NextResponse.json(
          { error: 'attemptId and answers are required' },
          { status: 400 }
        )
      }

      // Get the attempt
      const attempt = await db.quizAttempt.findUnique({
        where: { id: attemptId },
        include: {
          quiz: {
            include: {
              questions: { orderBy: { order: 'asc' } },
              module: {
                select: { id: true, courseId: true },
              },
            },
          },
        },
      })

      if (!attempt) {
        return NextResponse.json({ error: 'Quiz attempt not found' }, { status: 404 })
      }

      if (attempt.completedAt) {
        return NextResponse.json(
          { error: 'This attempt has already been submitted' },
          { status: 400 }
        )
      }

      // Calculate score
      const parsedAnswers = typeof answers === 'string' ? JSON.parse(answers) : answers
      let earnedPoints = 0
      let totalPoints = 0

      for (const question of attempt.quiz.questions) {
        totalPoints += question.points
        const userAnswer = parsedAnswers[question.id]
        if (userAnswer !== undefined && userAnswer !== null) {
          if (String(userAnswer).trim().toLowerCase() === String(question.correctAnswer).trim().toLowerCase()) {
            earnedPoints += question.points
          }
        }
      }

      const scorePercentage = totalPoints > 0 ? (earnedPoints / totalPoints) * 100 : 0
      const passed = scorePercentage >= attempt.quiz.passingScore
      const letterGrade = calculateLetterGrade(scorePercentage)

      // Update the attempt
      const updatedAttempt = await db.quizAttempt.update({
        where: { id: attemptId },
        data: {
          score: scorePercentage,
          maxScore: totalPoints,
          answers: typeof answers === 'string' ? answers : JSON.stringify(answers),
          passed,
          letterGrade,
          timeSpent: timeSpent || 0,
          completedAt: new Date(),
        },
      })

      // Update enrollment's overallGrade and letterGrade
      try {
        const enrollmentId = attempt.enrollmentId
        const allAttempts = await db.quizAttempt.findMany({
          where: { enrollmentId, completedAt: { not: null } },
        })
        const quizScores = allAttempts.map((a) => a.score)
        const avgQuizScore = quizScores.length > 0
          ? quizScores.reduce((sum, s) => sum + s, 0) / quizScores.length
          : 0

        // Get assignment submissions
        const submissions = await db.assignmentSubmission.findMany({
          where: { enrollmentId, score: { not: null } },
        })
        const assignmentScores = submissions
          .map((s) => s.score)
          .filter((s): s is number => s !== null)
        const avgAssignmentScore = assignmentScores.length > 0
          ? assignmentScores.reduce((sum, s) => sum + s, 0) / assignmentScores.length
          : 0

        // Weighted: 60% quizzes, 40% assignments (or 100% quizzes if no assignments)
        let overallGrade: number
        if (assignmentScores.length > 0) {
          overallGrade = Math.round((avgQuizScore * 0.6 + avgAssignmentScore * 0.4) * 100) / 100
        } else {
          overallGrade = Math.round(avgQuizScore * 100) / 100
        }

        const enrollmentLetterGrade = calculateLetterGrade(overallGrade)

        await db.enrollment.update({
          where: { id: enrollmentId },
          data: {
            overallGrade,
            letterGrade: enrollmentLetterGrade,
          },
        })
      } catch (enrollError) {
        console.error('Error updating enrollment grade:', enrollError)
        // Don't fail the submission if enrollment update fails
      }

      // Auto-generate certificate if this is a final quiz and the student passed
      if (passed && attempt.quiz.type === 'final') {
        try {
          await checkAndGenerateCertificate(
            attempt.userId,
            attempt.enrollmentId,
            attempt.quiz.module.courseId
          )
        } catch (certError) {
          console.error('Error checking certificate generation:', certError)
          // Don't fail the submission if certificate check fails
        }
      }

      return NextResponse.json({
        attempt: updatedAttempt,
        result: {
          earnedPoints,
          totalPoints,
          scorePercentage: Math.round(scorePercentage * 100) / 100,
          letterGrade,
          passed,
          passingScore: attempt.quiz.passingScore,
        },
      })
    }

    return NextResponse.json(
      { error: 'Invalid action. Use "start" or "submit"' },
      { status: 400 }
    )
  } catch (error) {
    console.error('Error with quiz attempt:', error)
    return NextResponse.json({ error: 'Failed to process quiz attempt' }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const quizId = searchParams.get('quizId')
    const userId = searchParams.get('userId')
    const enrollmentId = searchParams.get('enrollmentId')

    if (!userId) {
      return NextResponse.json(
        { error: 'userId is required' },
        { status: 400 }
      )
    }

    const where: Record<string, unknown> = { userId }
    if (quizId) where.quizId = quizId
    if (enrollmentId) where.enrollmentId = enrollmentId

    const attempts = await db.quizAttempt.findMany({
      where,
      include: {
        quiz: {
          select: {
            id: true,
            title: true,
            type: true,
            timeLimit: true,
            passingScore: true,
            module: { select: { title: true, courseId: true } },
          },
        },
      },
      orderBy: { startedAt: 'desc' },
    })

    return NextResponse.json(attempts)
  } catch (error) {
    console.error('Error fetching quiz attempts:', error)
    return NextResponse.json({ error: 'Failed to fetch quiz attempts' }, { status: 500 })
  }
}

/**
 * Check if all lessons are completed and all quizzes passed for a course enrollment.
 * If so, auto-generate a certificate.
 */
async function checkAndGenerateCertificate(
  userId: string,
  enrollmentId: string,
  courseId: string
) {
  // Check if certificate already exists
  const existingCert = await db.certificate.findUnique({
    where: { enrollmentId },
  })
  if (existingCert) return

  // Get enrollment with all related data
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

  if (!enrollment) return

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
    .filter((a) => a.completedAt)
    .map((a) => a.score)
  const avgQuizScore = quizScores.length > 0
    ? quizScores.reduce((sum, s) => sum + s, 0) / quizScores.length
    : 0

  // Get assignment submissions
  const submissions = await db.assignmentSubmission.findMany({
    where: { enrollmentId, score: { not: null } },
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

  const letterGrade = calculateLetterGrade(finalGrade)

  // Generate certificate number
  const year = new Date().getFullYear()
  const random = Math.random().toString(36).substring(2, 8).toUpperCase()
  const certificateNumber = `DCI-${year}-${random}`

  // Create certificate
  const certificate = await db.certificate.create({
    data: {
      userId,
      courseId,
      enrollmentId,
      certificateNumber,
      finalGrade,
      letterGrade,
    },
  })

  // Update enrollment status to completed
  await db.enrollment.update({
    where: { id: enrollmentId },
    data: {
      status: 'completed',
      completedAt: new Date(),
      progress: 100,
      overallGrade: finalGrade,
      letterGrade,
    },
  })

  console.log(`Certificate auto-generated: ${certificateNumber} for enrollment ${enrollmentId}`)
  return certificate
}
