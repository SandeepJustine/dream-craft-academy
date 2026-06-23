import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const instructorName = searchParams.get('instructor')
    const instructorId = searchParams.get('instructorId')
    const includeGraded = searchParams.get('includeGraded') === 'true'

    if (!instructorName && !instructorId) {
      return NextResponse.json({ error: 'instructor or instructorId is required' }, { status: 400 })
    }

    // Find courses by instructor name (from Course.instructor field)
    const where: Record<string, unknown> = {}
    if (instructorName) {
      where.instructor = instructorName
    }

    const courses = await db.course.findMany({
      where,
      include: {
        modules: {
          select: {
            id: true,
            title: true,
            _count: { select: { lessons: true, quizzes: true, assignments: true } },
          },
          orderBy: { order: 'asc' },
        },
        enrollments: {
          select: {
            id: true,
            progress: true,
            overallGrade: true,
            letterGrade: true,
            status: true,
            enrolledAt: true,
            completedAt: true,
            lastAccessedAt: true,
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                avatar: true,
                country: true,
              },
            },
            certificate: {
              select: { id: true, certificateNumber: true, finalGrade: true, letterGrade: true },
            },
            _count: {
              select: { lessonProgress: true, quizAttempts: true },
            },
          },
          orderBy: { lastAccessedAt: 'desc' },
        },
        liveClasses: {
          select: { id: true, title: true, scheduledAt: true, status: true },
          orderBy: { scheduledAt: 'desc' },
          take: 5,
        },
        feedbacks: {
          select: { id: true, rating: true, feedback: true, createdAt: true, user: { select: { name: true, avatar: true } } },
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
        _count: {
          select: { modules: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    // Calculate summary stats
    const totalStudents = courses.reduce((sum, c) => sum + c.enrollments.length, 0)
    const activeStudents = courses.reduce(
      (sum, c) => sum + c.enrollments.filter((e) => e.status === 'active').length,
      0
    )
    const completedStudents = courses.reduce(
      (sum, c) => sum + c.enrollments.filter((e) => e.status === 'completed').length,
      0
    )
    const avgGrade = courses.length > 0
      ? Math.round(
          courses
            .flatMap((c) => c.enrollments)
            .filter((e) => e.overallGrade > 0)
            .reduce((sum, e, _, arr) => {
              if (_.length === 0) return 0
              return sum + e.overallGrade / arr.length
            }, 0)
        )
      : 0

    // Get pending assignment submissions for this instructor's courses
    const pendingSubmissions = await db.assignmentSubmission.findMany({
      where: { status: 'submitted', score: null },
      include: {
        assignment: {
          select: {
            id: true,
            title: true,
            maxScore: true,
            module: {
              select: {
                course: { select: { id: true, title: true, instructor: true } },
              },
            },
          },
        },
        user: { select: { id: true, name: true, email: true, avatar: true } },
      },
      orderBy: { submittedAt: 'desc' },
      take: 50,
    })

    // Filter pending submissions for this instructor's courses
    const instructorPending = instructorName
      ? pendingSubmissions.filter((s) => s.assignment.module.course.instructor === instructorName)
      : pendingSubmissions

    // Get graded submissions if requested
    let gradedSubmissions: typeof instructorPending = []
    if (includeGraded) {
      const allGraded = await db.assignmentSubmission.findMany({
        where: { status: 'graded', score: { not: null } },
        include: {
          assignment: {
            select: {
              id: true,
              title: true,
              maxScore: true,
              module: {
                select: {
                  course: { select: { id: true, title: true, instructor: true } },
                },
              },
            },
          },
          user: { select: { id: true, name: true, email: true, avatar: true } },
        },
        orderBy: { gradedAt: 'desc' },
        take: 50,
      })

      gradedSubmissions = instructorName
        ? allGraded.filter((s) => s.assignment.module.course.instructor === instructorName)
        : allGraded
    }

    return NextResponse.json({
      courses,
      summary: {
        totalCourses: courses.length,
        totalStudents,
        activeStudents,
        completedStudents,
        avgGrade,
        pendingSubmissions: instructorPending.length,
      },
      pendingSubmissions: instructorPending,
      gradedSubmissions,
    })
  } catch (error) {
    console.error('Error fetching instructor data:', error)
    return NextResponse.json({ error: 'Failed to fetch instructor data' }, { status: 500 })
  }
}
