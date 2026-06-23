import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { notifyNewMessage } from '@/lib/notifications'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const courseId = searchParams.get('courseId')
    const userId = searchParams.get('userId')
    const otherUserId = searchParams.get('otherUserId')
    const instructorId = searchParams.get('instructorId')

    // Support both old API (courseId+userId+instructorId) and new API (userId+otherUserId)
    const effectiveOtherId = otherUserId || instructorId

    if (!userId || !effectiveOtherId) {
      return NextResponse.json(
        { error: 'userId and otherUserId (or instructorId) query parameters are required' },
        { status: 400 }
      )
    }

    const whereClause: Record<string, unknown> = {
      OR: [
        { senderId: userId, receiverId: effectiveOtherId },
        { senderId: effectiveOtherId, receiverId: userId },
      ],
    }

    // If courseId is provided, filter by course
    if (courseId) {
      whereClause.courseId = courseId
    }

    const messages = await db.chatMessage.findMany({
      where: whereClause,
      include: {
        sender: {
          select: { id: true, name: true, email: true, avatar: true, role: true },
        },
        receiver: {
          select: { id: true, name: true, email: true, avatar: true, role: true },
        },
      },
      orderBy: { createdAt: 'asc' },
    })

    // Mark unread messages as read
    await db.chatMessage.updateMany({
      where: {
        ...(courseId ? { courseId } : {}),
        senderId: effectiveOtherId,
        receiverId: userId,
        isRead: false,
      },
      data: { isRead: true },
    })

    return NextResponse.json(messages)
  } catch (error) {
    console.error('Error fetching chat messages:', error)
    return NextResponse.json({ error: 'Failed to fetch chat messages' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { senderId, receiverId, content, courseId } = body

    if (!senderId || !receiverId || !content) {
      return NextResponse.json(
        { error: 'senderId, receiverId, and content are required' },
        { status: 400 }
      )
    }

    // Verify sender exists
    const sender = await db.user.findUnique({ where: { id: senderId } })
    if (!sender) {
      return NextResponse.json({ error: 'Sender not found' }, { status: 404 })
    }

    // Verify receiver exists
    const receiver = await db.user.findUnique({ where: { id: receiverId } })
    if (!receiver) {
      return NextResponse.json({ error: 'Receiver not found' }, { status: 404 })
    }

    // For admin-instructor messaging without courseId, find or create a general course
    let effectiveCourseId = courseId
    if (!effectiveCourseId) {
      // Find the first course or create a placeholder
      let generalCourse = await db.course.findFirst()
      if (!generalCourse) {
        // Create a general/admin course for messaging
        generalCourse = await db.course.create({
          data: {
            title: 'Admin Communication',
            description: 'General communication channel',
            category: 'Management',
            level: 'Beginner',
            instructor: 'Admin',
            duration: 'N/A',
          },
        })
      }
      effectiveCourseId = generalCourse.id
    }

    const message = await db.chatMessage.create({
      data: {
        courseId: effectiveCourseId,
        senderId,
        receiverId,
        content,
      },
      include: {
        sender: {
          select: { id: true, name: true, email: true, avatar: true, role: true },
        },
        receiver: {
          select: { id: true, name: true, email: true, avatar: true, role: true },
        },
      },
    })

    // Send notification email
    if (sender.role === 'instructor' || sender.role === 'admin') {
      if (receiver.role === 'student') {
        try {
          const course = await db.course.findUnique({ where: { id: effectiveCourseId } })
          if (course) {
            await notifyNewMessage(
              receiverId,
              effectiveCourseId,
              course.title,
              receiver.name || 'Student',
              receiver.email,
              sender.name || 'Instructor'
            )
          }
        } catch (notifError) {
          console.error('Failed to send message notification:', notifError)
        }
      }
    }

    return NextResponse.json(message, { status: 201 })
  } catch (error) {
    console.error('Error sending chat message:', error)
    return NextResponse.json({ error: 'Failed to send chat message' }, { status: 500 })
  }
}
