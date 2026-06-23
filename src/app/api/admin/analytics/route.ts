import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  try {
    // Get comprehensive analytics data
    const [
      totalUsers,
      totalStudents,
      totalInstructors,
      totalCourses,
      totalEnrollments,
      totalCertificates,
      totalQuizAttempts,
      totalLessons,
      totalAssignments,
      recentEnrollments,
      coursesWithStats,
      gradeDistribution,
      enrollmentTrend,
    ] = await Promise.all([
      db.user.count(),
      db.user.count({ where: { role: 'student' } }),
      db.user.count({ where: { role: 'instructor' } }),
      db.course.count(),
      db.enrollment.count(),
      db.certificate.count(),
      db.quizAttempt.count(),
      db.lesson.count(),
      db.assignment.count(),
      // Recent enrollments (last 30 days)
      db.enrollment.findMany({
        take: 10,
        orderBy: { enrolledAt: 'desc' },
        select: {
          id: true,
          progress: true,
          overallGrade: true,
          letterGrade: true,
          status: true,
          enrolledAt: true,
          user: { select: { id: true, name: true, email: true, avatar: true } },
          course: { select: { id: true, title: true, category: true } },
        },
      }),
      // Courses with enrollment counts
      db.course.findMany({
        select: {
          id: true,
          title: true,
          category: true,
          enrolled: true,
          rating: true,
          featured: true,
          _count: {
            select: { enrollments: true, modules: true },
          },
        },
        orderBy: { enrolled: 'desc' },
      }),
      // Grade distribution
      db.enrollment.groupBy({
        by: ['letterGrade'],
        _count: { letterGrade: true },
        where: { letterGrade: { not: null } },
      }),
      // Enrollment trend (users created in last 6 months)
      db.user.findMany({
        where: {
          role: 'student',
          createdAt: {
            gte: new Date(new Date().setMonth(new Date().getMonth() - 6)),
          },
        },
        select: { createdAt: true },
        orderBy: { createdAt: 'asc' },
      }),
    ])

    // Calculate average grade across all enrollments
    const gradeAggregation = await db.enrollment.aggregate({
      _avg: { overallGrade: true },
      where: { overallGrade: { gt: 0 } },
    })

    // Active students (enrolled in at least one course with activity in last 30 days)
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
    const activeStudents = await db.enrollment.count({
      where: { lastAccessedAt: { gte: thirtyDaysAgo } },
    })

    // Completion rate
    const completedEnrollments = await db.enrollment.count({
      where: { status: 'completed' },
    })
    const completionRate = totalEnrollments > 0 
      ? Math.round((completedEnrollments / totalEnrollments) * 100) 
      : 0

    // Format enrollment trend by month
    const trendByMonth: Record<string, number> = {}
    enrollmentTrend.forEach((user) => {
      const month = new Date(user.createdAt).toISOString().slice(0, 7)
      trendByMonth[month] = (trendByMonth[month] || 0) + 1
    })

    return NextResponse.json({
      overview: {
        totalUsers,
        totalStudents,
        totalInstructors,
        totalCourses,
        totalEnrollments,
        totalCertificates,
        totalQuizAttempts,
        totalLessons,
        totalAssignments,
        averageGrade: Math.round(gradeAggregation._avg.overallGrade || 0),
        activeStudents,
        completionRate,
      },
      recentEnrollments,
      coursesWithStats,
      gradeDistribution: gradeDistribution.map((g) => ({
        grade: g.letterGrade,
        count: g._count.letterGrade,
      })),
      enrollmentTrend: Object.entries(trendByMonth).map(([month, count]) => ({
        month,
        count,
      })),
    })
  } catch (error) {
    console.error('Error fetching analytics:', error)
    return NextResponse.json({ error: 'Failed to fetch analytics' }, { status: 500 })
  }
}
