import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { notifyCompletion } from '@/lib/notifications'

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

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const userId = searchParams.get('userId')
    const certificateId = searchParams.get('certificateId')

    if (certificateId) {
      // Get a specific certificate
      const certificate = await db.certificate.findUnique({
        where: { id: certificateId },
        include: {
          user: {
            select: { id: true, name: true, email: true },
          },
          enrollment: {
            select: {
              course: {
                select: { id: true, title: true, category: true, level: true, duration: true, instructor: true },
              },
            },
          },
        },
      })

      if (!certificate) {
        return NextResponse.json({ error: 'Certificate not found' }, { status: 404 })
      }

      // Flatten the course info from enrollment
      const { enrollment, ...certData } = certificate
      return NextResponse.json({
        ...certData,
        course: enrollment?.course || null,
      })
    }

    if (userId) {
      // Get all certificates for a user
      const certificates = await db.certificate.findMany({
        where: { userId },
        include: {
          enrollment: {
            select: {
              course: {
                select: {
                  id: true,
                  title: true,
                  category: true,
                  level: true,
                  duration: true,
                  instructor: true,
                  image: true,
                },
              },
            },
          },
        },
        orderBy: { issuedAt: 'desc' },
      })

      // Flatten course info from enrollment
      const formatted = certificates.map((cert) => {
        const { enrollment, ...certData } = cert
        return {
          ...certData,
          course: enrollment?.course || null,
        }
      })

      return NextResponse.json(formatted)
    }

    return NextResponse.json(
      { error: 'userId or certificateId query parameter is required' },
      { status: 400 }
    )
  } catch (error) {
    console.error('Error fetching certificates:', error)
    return NextResponse.json({ error: 'Failed to fetch certificates' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, courseId, enrollmentId } = body

    if (!userId || !courseId || !enrollmentId) {
      return NextResponse.json(
        { error: 'userId, courseId, and enrollmentId are required' },
        { status: 400 }
      )
    }

    // Check if certificate already exists for this enrollment
    const existingCert = await db.certificate.findUnique({
      where: { enrollmentId },
    })

    if (existingCert) {
      return NextResponse.json(
        { error: 'Certificate already exists for this enrollment', certificate: existingCert },
        { status: 409 }
      )
    }

    // Verify enrollment exists
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

    if (!enrollment) {
      return NextResponse.json({ error: 'Enrollment not found' }, { status: 404 })
    }

    // Calculate final grade
    const quizScores = enrollment.quizAttempts
      .filter((a) => a.completedAt)
      .map((a) => a.score)
    const avgQuizScore = quizScores.length > 0
      ? quizScores.reduce((sum, s) => sum + s, 0) / quizScores.length
      : 0

    // Get assignment submissions with scores
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

    // Calculate letter grade
    const letterGrade = calculateLetterGrade(finalGrade)

    // Generate unique certificate number
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
      include: {
        user: {
          select: { id: true, name: true, email: true },
        },
        enrollment: {
          select: {
            course: {
              select: { id: true, title: true, category: true, level: true, duration: true, instructor: true },
            },
          },
        },
      },
    })

    // Flatten course info
    const { enrollment: certEnrollment, ...certData } = certificate

    // Update enrollment
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

    // Send completion notification email
    try {
      const student = await db.user.findUnique({ where: { id: userId } })
      const courseForNotif = await db.course.findUnique({ where: { id: courseId } })
      if (student && courseForNotif) {
        await notifyCompletion(
          userId,
          courseId,
          courseForNotif.title,
          student.name || 'Student',
          student.email,
          letterGrade
        )
      }
    } catch (notifError) {
      console.error('Failed to send completion notification:', notifError)
    }

    return NextResponse.json({
      ...certData,
      course: certEnrollment?.course || null,
    }, { status: 201 })
  } catch (error) {
    console.error('Error generating certificate:', error)
    return NextResponse.json({ error: 'Failed to generate certificate' }, { status: 500 })
  }
}
