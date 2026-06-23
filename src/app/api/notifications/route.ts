import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json({ error: 'userId is required' }, { status: 400 })
    }

    const notifications = await db.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 50,
    })

    const unreadCount = notifications.filter((n) => !n.isRead).length

    return NextResponse.json({ notifications, unreadCount })
  } catch (error) {
    console.error('Error fetching notifications:', error)
    return NextResponse.json({ error: 'Failed to fetch notifications' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, userId, notificationId } = body

    if (action === 'mark-read') {
      if (!notificationId) {
        return NextResponse.json({ error: 'notificationId is required' }, { status: 400 })
      }

      const notification = await db.notification.update({
        where: { id: notificationId },
        data: { isRead: true },
      })

      return NextResponse.json(notification)
    }

    if (action === 'mark-all-read') {
      if (!userId) {
        return NextResponse.json({ error: 'userId is required' }, { status: 400 })
      }

      const result = await db.notification.updateMany({
        where: { userId, isRead: false },
        data: { isRead: true },
      })

      return NextResponse.json({ updated: result.count })
    }

    return NextResponse.json({ error: 'Invalid action. Use "mark-read" or "mark-all-read"' }, { status: 400 })
  } catch (error) {
    console.error('Error updating notification:', error)
    return NextResponse.json({ error: 'Failed to update notification' }, { status: 500 })
  }
}
