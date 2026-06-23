import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { notifyEnrollment } from '@/lib/notifications'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, userId, courseId } = body

    // Instructor-initiated enroll student
    if (action === 'enroll-student') {
      const { instructorId } = body
      if (!userId || !courseId || !instructorId) {
        return NextResponse.json({ error: 'userId, courseId, and instructorId are required' }, { status: 400 })
      }

      // Verify the instructor owns the course
      const instructor = await db.user.findUnique({ where: { id: instructorId } })
      if (!instructor || (instructor.role !== 'instructor' && instructor.role !== 'admin')) {
        return NextResponse.json({ error: 'Only instructors can enroll students' }, { status: 403 })
      }

      const course = await db.course.findUnique({ where: { id: courseId } })
      if (!course) {
        return NextResponse.json({ error: 'Course not found' }, { status: 404 })
      }
      if (instructor.role === 'instructor' && course.instructor !== (instructor.name || 'Unknown Instructor')) {
        return NextResponse.json({ error: 'You can only enroll students in your own courses' }, { status: 403 })
      }

      // Verify the user exists and is a student
      const student = await db.user.findUnique({ where: { id: userId } })
      if (!student) {
        return NextResponse.json({ error: 'Student not found' }, { status: 404 })
      }

      const existing = await db.enrollment.findUnique({
        where: { userId_courseId: { userId, courseId } },
      })

      if (existing) {
        // If enrollment exists but is suspended, reactivate it
        if (existing.status === 'suspended') {
          const reactivated = await db.enrollment.update({
            where: { id: existing.id },
            data: { status: 'active' },
          })
          return NextResponse.json({ enrollment: reactivated, message: 'Student re-enrolled successfully' })
        }
        return NextResponse.json({ error: 'Student is already enrolled in this course', enrollment: existing }, { status: 400 })
      }

      // Create enrollment
      const enrollment = await db.enrollment.create({
        data: {
          userId,
          courseId,
          progress: 0,
          status: 'active',
        },
      })

      // Create lesson progress entries for all lessons in the course
      const courseWithLessons = await db.course.findUnique({
        where: { id: courseId },
        include: {
          modules: {
            include: {
              lessons: true,
            },
          },
        },
      })

      if (courseWithLessons) {
        const allLessons = courseWithLessons.modules.flatMap((m) => m.lessons)
        for (const lesson of allLessons) {
          await db.lessonProgress.upsert({
            where: { userId_lessonId: { userId, lessonId: lesson.id } },
            update: {},
            create: {
              userId,
              lessonId: lesson.id,
              enrollmentId: enrollment.id,
              completed: false,
            },
          })
        }
      }

      // Update course enrolled count
      await db.course.update({
        where: { id: courseId },
        data: { enrolled: { increment: 1 } },
      })

      // Send enrollment notification email
      try {
        await notifyEnrollment(
          userId,
          courseId,
          course.title,
          student.name || 'Student',
          student.email
        )
      } catch (notifError) {
        console.error('Failed to send enrollment notification:', notifError)
      }

      return NextResponse.json({ enrollment, message: 'Student enrolled successfully' }, { status: 201 })
    }

    // Instructor-initiated unenroll student
    if (action === 'unenroll-student') {
      const { enrollmentId, instructorId } = body
      if (!enrollmentId || !instructorId) {
        return NextResponse.json({ error: 'enrollmentId and instructorId are required' }, { status: 400 })
      }

      // Verify the instructor
      const instructor = await db.user.findUnique({ where: { id: instructorId } })
      if (!instructor || (instructor.role !== 'instructor' && instructor.role !== 'admin')) {
        return NextResponse.json({ error: 'Only instructors can unenroll students' }, { status: 403 })
      }

      // Get the enrollment and verify it belongs to instructor's course
      const enrollment = await db.enrollment.findUnique({
        where: { id: enrollmentId },
        include: { course: true },
      })

      if (!enrollment) {
        return NextResponse.json({ error: 'Enrollment not found' }, { status: 404 })
      }

      if (instructor.role === 'instructor' && enrollment.course.instructor !== (instructor.name || 'Unknown Instructor')) {
        return NextResponse.json({ error: 'You can only unenroll students from your own courses' }, { status: 403 })
      }

      // Set status to suspended instead of deleting
      const updated = await db.enrollment.update({
        where: { id: enrollmentId },
        data: { status: 'suspended' },
      })

      return NextResponse.json({ enrollment: updated, message: 'Student unenrolled successfully' })
    }

    // Default: student self-enrollment
    if (!userId || !courseId) {
      return NextResponse.json({ error: 'userId and courseId are required' }, { status: 400 })
    }

    const existing = await db.enrollment.findUnique({
      where: { userId_courseId: { userId, courseId } },
    })

    if (existing) {
      return NextResponse.json({ error: 'Already enrolled', enrollment: existing }, { status: 400 })
    }

    // Create enrollment
    const enrollment = await db.enrollment.create({
      data: {
        userId,
        courseId,
        progress: 0,
        status: 'active',
      },
    })

    // Create lesson progress entries for all lessons in the course
    const course = await db.course.findUnique({
      where: { id: courseId },
      include: {
        modules: {
          include: {
            lessons: true,
          },
        },
      },
    })

    if (course) {
      const allLessons = course.modules.flatMap((m) => m.lessons)
      for (const lesson of allLessons) {
        await db.lessonProgress.upsert({
          where: { userId_lessonId: { userId, lessonId: lesson.id } },
          update: {},
          create: {
            userId,
            lessonId: lesson.id,
            enrollmentId: enrollment.id,
            completed: false,
          },
        })
      }
    }

    // Update course enrolled count
    await db.course.update({
      where: { id: courseId },
      data: { enrolled: { increment: 1 } },
    })

    // Send enrollment notification email for self-enrollment
    try {
      const student = await db.user.findUnique({ where: { id: userId } })
      if (student && course) {
        await notifyEnrollment(
          userId,
          courseId,
          course.title,
          student.name || 'Student',
          student.email
        )
      }
    } catch (notifError) {
      console.error('Failed to send enrollment notification:', notifError)
    }

    return NextResponse.json(enrollment)
  } catch (error) {
    console.error('Error enrolling:', error)
    return NextResponse.json({ error: 'Failed to enroll' }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const userId = searchParams.get('userId')
    const enrollmentId = searchParams.get('enrollmentId')

    if (enrollmentId) {
      // Get a specific enrollment with full details
      const enrollment = await db.enrollment.findUnique({
        where: { id: enrollmentId },
        include: {
          course: {
            include: {
              modules: {
                include: {
                  lessons: {
                    orderBy: { order: 'asc' },
                  },
                  quizzes: {
                    include: {
                      _count: { select: { questions: true } },
                    },
                  },
                  assignments: true,
                },
                orderBy: { order: 'asc' },
              },
            },
          },
          lessonProgress: true,
          quizAttempts: {
            include: {
              quiz: {
                select: { id: true, title: true, type: true, passingScore: true },
              },
            },
            orderBy: { startedAt: 'desc' },
          },
          submissions: {
            include: {
              assignment: {
                select: { id: true, title: true, maxScore: true },
              },
            },
            orderBy: { submittedAt: 'desc' },
          },
          certificate: true,
        },
      })

      if (!enrollment) {
        return NextResponse.json({ error: 'Enrollment not found' }, { status: 404 })
      }

      const totalLessons = enrollment.course.modules.reduce(
        (sum, m) => sum + m.lessons.length,
        0
      )
      const completedLessons = enrollment.lessonProgress.filter(
        (lp) => lp.completed
      ).length
      const progress = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0

      // Calculate quiz score summary
      const bestQuizAttempts = new Map<string, typeof enrollment.quizAttempts[0]>()
      for (const attempt of enrollment.quizAttempts) {
        if (attempt.completedAt) {
          const existing = bestQuizAttempts.get(attempt.quizId)
          if (!existing || attempt.score > existing.score) {
            bestQuizAttempts.set(attempt.quizId, attempt)
          }
        }
      }
      const quizScores = Array.from(bestQuizAttempts.values())
      const avgQuizScore = quizScores.length > 0
        ? Math.round((quizScores.reduce((sum, a) => sum + a.score, 0) / quizScores.length) * 100) / 100
        : 0

      return NextResponse.json({
        id: enrollment.id,
        userId: enrollment.userId,
        courseId: enrollment.courseId,
        progress,
        overallGrade: enrollment.overallGrade,
        status: enrollment.status,
        enrolledAt: enrollment.enrolledAt,
        completedAt: enrollment.completedAt,
        lastAccessedAt: enrollment.lastAccessedAt,
        course: {
          id: enrollment.course.id,
          title: enrollment.course.title,
          description: enrollment.course.description,
          category: enrollment.course.category,
          level: enrollment.course.level,
          duration: enrollment.course.duration,
          image: enrollment.course.image,
          instructor: enrollment.course.instructor,
          modulesCount: enrollment.course.modules.length,
          lessonsCount: totalLessons,
          modules: enrollment.course.modules,
        },
        completedLessons,
        totalLessons,
        nextLesson: findNextLesson(enrollment.course.modules, enrollment.lessonProgress),
        quizAttempts: enrollment.quizAttempts,
        quizSummary: {
          totalQuizzes: enrollment.course.modules.reduce((sum, m) => sum + m.quizzes.length, 0),
          passedQuizzes: new Set(enrollment.quizAttempts.filter((a) => a.passed).map((a) => a.quizId)).size,
          averageScore: avgQuizScore,
          bestAttempts: quizScores,
        },
        submissions: enrollment.submissions,
        assignmentSummary: {
          totalAssignments: enrollment.course.modules.reduce((sum, m) => sum + m.assignments.length, 0),
          submittedAssignments: enrollment.submissions.filter((s) => s.status === 'submitted' || s.status === 'graded').length,
          gradedAssignments: enrollment.submissions.filter((s) => s.status === 'graded').length,
          averageScore: enrollment.submissions.filter((s) => s.score !== null).length > 0
            ? Math.round((enrollment.submissions.filter((s) => s.score !== null).reduce((sum, s) => sum + (s.score || 0), 0) / enrollment.submissions.filter((s) => s.score !== null).length) * 100) / 100
            : 0,
        },
        certificate: enrollment.certificate,
      })
    }

    if (!userId) {
      return NextResponse.json({ error: 'userId or enrollmentId is required' }, { status: 400 })
    }

    const enrollments = await db.enrollment.findMany({
      where: { userId },
      include: {
        course: {
          include: {
            modules: {
              include: {
                lessons: true,
                quizzes: { select: { id: true } },
                assignments: { select: { id: true } },
              },
              orderBy: { order: 'asc' },
            },
          },
        },
        lessonProgress: true,
        quizAttempts: {
          where: { completedAt: { not: null } },
          orderBy: { startedAt: 'desc' },
        },
        submissions: {
          where: { score: { not: null } },
        },
        certificate: true,
      },
      orderBy: { enrolledAt: 'desc' },
    })

    const formatted = enrollments.map((enrollment) => {
      const totalLessons = enrollment.course.modules.reduce(
        (sum, m) => sum + m.lessons.length,
        0
      )
      const completedLessons = enrollment.lessonProgress.filter(
        (lp) => lp.completed
      ).length
      const progress = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0

      // Quiz scores summary
      const bestQuizAttempts = new Map<string, number>()
      for (const attempt of enrollment.quizAttempts) {
        const existing = bestQuizAttempts.get(attempt.quizId)
        if (existing === undefined || attempt.score > existing) {
          bestQuizAttempts.set(attempt.quizId, attempt.score)
        }
      }
      const avgQuizScore = bestQuizAttempts.size > 0
        ? Math.round((Array.from(bestQuizAttempts.values()).reduce((sum, s) => sum + s, 0) / bestQuizAttempts.size) * 100) / 100
        : 0

      // Assignment scores summary
      const avgAssignmentScore = enrollment.submissions.length > 0
        ? Math.round((enrollment.submissions.reduce((sum, s) => sum + (s.score || 0), 0) / enrollment.submissions.length) * 100) / 100
        : 0

      const totalQuizzes = enrollment.course.modules.reduce((sum, m) => sum + m.quizzes.length, 0)
      const totalAssignments = enrollment.course.modules.reduce((sum, m) => sum + m.assignments.length, 0)
      const passedQuizIds = new Set(enrollment.quizAttempts.filter((a) => a.passed).map((a) => a.quizId))

      return {
        id: enrollment.id,
        courseId: enrollment.courseId,
        progress,
        overallGrade: enrollment.overallGrade,
        status: enrollment.status,
        enrolledAt: enrollment.enrolledAt,
        completedAt: enrollment.completedAt,
        lastAccessedAt: enrollment.lastAccessedAt,
        course: {
          id: enrollment.course.id,
          title: enrollment.course.title,
          description: enrollment.course.description,
          category: enrollment.course.category,
          level: enrollment.course.level,
          duration: enrollment.course.duration,
          image: enrollment.course.image,
          instructor: enrollment.course.instructor,
          modulesCount: enrollment.course.modules.length,
          lessonsCount: totalLessons,
        },
        completedLessons,
        totalLessons,
        nextLesson: findNextLesson(enrollment.course.modules, enrollment.lessonProgress),
        quizSummary: {
          totalQuizzes,
          passedQuizzes: passedQuizIds.size,
          averageScore: avgQuizScore,
        },
        assignmentSummary: {
          totalAssignments,
          submittedAssignments: enrollment.submissions.length,
          averageScore: avgAssignmentScore,
        },
        certificate: enrollment.certificate,
      }
    })

    return NextResponse.json(formatted)
  } catch (error) {
    console.error('Error fetching enrollments:', error)
    return NextResponse.json({ error: 'Failed to fetch enrollments' }, { status: 500 })
  }
}

function findNextLesson(
  modules: { lessons: { id: string; order: number }[] }[],
  progress: { lessonId: string; completed: boolean }[]
) {
  const completedIds = new Set(progress.filter((p) => p.completed).map((p) => p.lessonId))

  for (const mod of modules) {
    const sortedLessons = [...mod.lessons].sort((a, b) => a.order - b.order)
    for (const lesson of sortedLessons) {
      if (!completedIds.has(lesson.id)) {
        return lesson.id
      }
    }
  }
  return null
}
