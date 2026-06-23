import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const courseId = searchParams.get('courseId')
    const status = searchParams.get('status')

    const where: Record<string, unknown> = {}

    if (courseId) {
      where.courseId = courseId
    }

    if (status) {
      where.status = status
    }

    // If "upcoming" status is requested, filter by scheduledAt > now
    if (status === 'upcoming') {
      where.scheduledAt = { gte: new Date() }
      where.status = 'upcoming'
    }

    const liveClasses = await db.liveClass.findMany({
      where,
      include: {
        course: {
          select: {
            id: true,
            title: true,
            category: true,
            instructor: true,
            image: true,
          },
        },
      },
      orderBy: { scheduledAt: status === 'upcoming' ? 'asc' : 'desc' },
    })

    return NextResponse.json(liveClasses)
  } catch (error) {
    console.error('Error fetching live classes:', error)
    return NextResponse.json({ error: 'Failed to fetch live classes' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action } = body

    if (action === 'create' || !action) {
      // Schedule a new live class
      const { courseId, title, description, instructor, scheduledAt, duration, meetingUrl } = body

      if (!courseId || !title || !scheduledAt || !instructor) {
        return NextResponse.json(
          { error: 'courseId, title, instructor, and scheduledAt are required' },
          { status: 400 }
        )
      }

      // Verify course exists
      const course = await db.course.findUnique({
        where: { id: courseId },
      })

      if (!course) {
        return NextResponse.json({ error: 'Course not found' }, { status: 404 })
      }

      const liveClass = await db.liveClass.create({
        data: {
          courseId,
          title,
          description: description || null,
          instructor,
          scheduledAt: new Date(scheduledAt),
          duration: duration || 60,
          meetingUrl: meetingUrl || null,
          status: 'upcoming',
        },
        include: {
          course: {
            select: {
              id: true,
              title: true,
              category: true,
              instructor: true,
              image: true,
            },
          },
        },
      })

      return NextResponse.json(liveClass, { status: 201 })
    }

    if (action === 'update') {
      const { id, title, description, scheduledAt, duration, meetingUrl, status } = body

      if (!id) {
        return NextResponse.json({ error: 'id is required' }, { status: 400 })
      }

      const updateData: Record<string, unknown> = {}
      if (title !== undefined) updateData.title = title
      if (description !== undefined) updateData.description = description
      if (scheduledAt !== undefined) updateData.scheduledAt = new Date(scheduledAt)
      if (duration !== undefined) updateData.duration = duration
      if (meetingUrl !== undefined) updateData.meetingUrl = meetingUrl
      if (status !== undefined) updateData.status = status

      const liveClass = await db.liveClass.update({
        where: { id },
        data: updateData,
        include: {
          course: {
            select: {
              id: true,
              title: true,
              category: true,
              instructor: true,
              image: true,
            },
          },
        },
      })

      return NextResponse.json(liveClass)
    }

    if (action === 'delete') {
      const { id } = body
      if (!id) {
        return NextResponse.json({ error: 'id is required' }, { status: 400 })
      }
      await db.liveClass.delete({ where: { id } })
      return NextResponse.json({ success: true })
    }

    return NextResponse.json(
      { error: 'Invalid action. Use "create", "update", or "delete"' },
      { status: 400 }
    )
  } catch (error) {
    console.error('Error with live class action:', error)
    return NextResponse.json({ error: 'Failed to process live class action' }, { status: 500 })
  }
}
