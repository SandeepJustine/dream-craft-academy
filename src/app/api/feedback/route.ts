import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const courseId = searchParams.get('courseId')
    const enrollmentId = searchParams.get('enrollmentId')

    if (!courseId && !enrollmentId) {
      return NextResponse.json(
        { error: 'courseId or enrollmentId query parameter is required' },
        { status: 400 }
      )
    }

    const where: Record<string, unknown> = {}
    if (enrollmentId) {
      where.enrollmentId = enrollmentId
    } else if (courseId) {
      where.courseId = courseId
    }

    const feedbacks = await db.courseFeedback.findMany({
      where,
      include: {
        user: {
          select: { id: true, name: true, email: true, avatar: true, role: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(feedbacks)
  } catch (error) {
    console.error('Error fetching feedback:', error)
    return NextResponse.json({ error: 'Failed to fetch feedback' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, courseId, enrollmentId, rating, feedback } = body

    if (!userId || !courseId || !enrollmentId || rating === undefined || !feedback) {
      return NextResponse.json(
        { error: 'userId, courseId, enrollmentId, rating, and feedback are required' },
        { status: 400 }
      )
    }

    // Validate rating range
    const ratingNum = Number(rating)
    if (isNaN(ratingNum) || ratingNum < 1 || ratingNum > 5) {
      return NextResponse.json(
        { error: 'Rating must be between 1 and 5' },
        { status: 400 }
      )
    }

    // Verify enrollment exists
    const enrollment = await db.enrollment.findUnique({
      where: { id: enrollmentId },
    })
    if (!enrollment) {
      return NextResponse.json({ error: 'Enrollment not found' }, { status: 404 })
    }

    // Upsert feedback based on enrollmentId (one feedback per enrollment)
    const upsertedFeedback = await db.courseFeedback.upsert({
      where: { enrollmentId },
      update: {
        rating: ratingNum,
        feedback,
      },
      create: {
        userId,
        courseId,
        enrollmentId,
        rating: ratingNum,
        feedback,
      },
      include: {
        user: {
          select: { id: true, name: true, email: true, avatar: true, role: true },
        },
      },
    })

    // Update the course's average rating based on all feedbacks
    const allFeedbacks = await db.courseFeedback.findMany({
      where: { courseId },
      select: { rating: true },
    })

    const avgRating =
      allFeedbacks.length > 0
        ? allFeedbacks.reduce((sum, f) => sum + f.rating, 0) / allFeedbacks.length
        : 0

    await db.course.update({
      where: { id: courseId },
      data: { rating: Math.round(avgRating * 100) / 100 },
    })

    return NextResponse.json(upsertedFeedback)
  } catch (error) {
    console.error('Error submitting feedback:', error)
    return NextResponse.json({ error: 'Failed to submit feedback' }, { status: 500 })
  }
}
