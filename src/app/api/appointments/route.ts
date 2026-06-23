import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// User info to include in responses
const userSelect = {
  id: true,
  name: true,
  email: true,
  avatar: true,
  role: true,
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const userId = searchParams.get('userId')
    const role = searchParams.get('role') // admin | instructor | student
    const status = searchParams.get('status') // pending | confirmed | cancelled | completed

    if (!userId) {
      return NextResponse.json({ error: 'userId is required' }, { status: 400 })
    }

    // Validate status if provided
    const validStatuses = ['pending', 'confirmed', 'cancelled', 'completed']
    if (status && !validStatuses.includes(status)) {
      return NextResponse.json(
        { error: `Invalid status. Must be one of: ${validStatuses.join(', ')}` },
        { status: 400 }
      )
    }

    // Validate role if provided
    const validRoles = ['admin', 'instructor', 'student']
    if (role && !validRoles.includes(role)) {
      return NextResponse.json(
        { error: `Invalid role. Must be one of: ${validRoles.join(', ')}` },
        { status: 400 }
      )
    }

    // Build where clause based on role
    const where: Record<string, unknown> = {}

    if (role === 'admin') {
      // Admin can see all appointments, optionally filtered by status
      if (status) {
        where.status = status
      }
    } else {
      // Instructor or student: fetch appointments where they are requester OR recipient
      where.OR = [
        { requesterId: userId },
        { recipientId: userId },
      ]

      // Apply status filter within the OR conditions
      if (status) {
        where.OR = [
          { requesterId: userId, status },
          { recipientId: userId, status },
        ]
      }
    }

    const appointments = await db.appointment.findMany({
      where,
      include: {
        requester: { select: userSelect },
        recipient: { select: userSelect },
      },
      orderBy: { date: 'desc' },
    })

    return NextResponse.json({ appointments })
  } catch (error) {
    console.error('Error fetching appointments:', error)
    return NextResponse.json({ error: 'Failed to fetch appointments' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action } = body

    if (!action) {
      return NextResponse.json({ error: 'action is required' }, { status: 400 })
    }

    // ── Create Appointment ──────────────────────────────────────────
    if (action === 'create') {
      const {
        title,
        description,
        requesterId,
        recipientId,
        courseId,
        date,
        duration,
        location,
        meetingUrl,
        notes,
      } = body

      // Validate required fields
      if (!title) {
        return NextResponse.json({ error: 'title is required' }, { status: 400 })
      }
      if (!requesterId) {
        return NextResponse.json({ error: 'requesterId is required' }, { status: 400 })
      }
      if (!recipientId) {
        return NextResponse.json({ error: 'recipientId is required' }, { status: 400 })
      }
      if (!date) {
        return NextResponse.json({ error: 'date is required' }, { status: 400 })
      }

      // Verify requester exists
      const requester = await db.user.findUnique({ where: { id: requesterId } })
      if (!requester) {
        return NextResponse.json({ error: 'Requester not found' }, { status: 404 })
      }

      // Verify recipient exists
      const recipient = await db.user.findUnique({ where: { id: recipientId } })
      if (!recipient) {
        return NextResponse.json({ error: 'Recipient not found' }, { status: 404 })
      }

      const appointment = await db.appointment.create({
        data: {
          title,
          description: description || null,
          requesterId,
          recipientId,
          courseId: courseId || null,
          date: new Date(date),
          duration: duration ?? 30,
          location: location || null,
          meetingUrl: meetingUrl || null,
          notes: notes || null,
          status: 'pending',
        },
        include: {
          requester: { select: userSelect },
          recipient: { select: userSelect },
        },
      })

      return NextResponse.json({ appointment }, { status: 201 })
    }

    // ── Update Appointment Status ───────────────────────────────────
    if (action === 'update-status') {
      const { id, status } = body

      if (!id) {
        return NextResponse.json({ error: 'id is required' }, { status: 400 })
      }
      if (!status) {
        return NextResponse.json({ error: 'status is required' }, { status: 400 })
      }

      // Validate status value
      const statusMap: Record<string, string> = {
        confirm: 'confirmed',
        cancel: 'cancelled',
        complete: 'completed',
      }
      const mappedStatus = statusMap[status]
      if (!mappedStatus) {
        return NextResponse.json(
          { error: 'Invalid status action. Use: confirm, cancel, or complete' },
          { status: 400 }
        )
      }

      // Verify appointment exists
      const existing = await db.appointment.findUnique({ where: { id } })
      if (!existing) {
        return NextResponse.json({ error: 'Appointment not found' }, { status: 404 })
      }

      const appointment = await db.appointment.update({
        where: { id },
        data: { status: mappedStatus },
        include: {
          requester: { select: userSelect },
          recipient: { select: userSelect },
        },
      })

      return NextResponse.json({ appointment })
    }

    // ── Delete Appointment ──────────────────────────────────────────
    if (action === 'delete') {
      const { id } = body

      if (!id) {
        return NextResponse.json({ error: 'id is required' }, { status: 400 })
      }

      // Verify appointment exists
      const existing = await db.appointment.findUnique({ where: { id } })
      if (!existing) {
        return NextResponse.json({ error: 'Appointment not found' }, { status: 404 })
      }

      await db.appointment.delete({ where: { id } })

      return NextResponse.json({ message: 'Appointment deleted successfully' })
    }

    // ── Invalid Action ──────────────────────────────────────────────
    return NextResponse.json(
      { error: 'Invalid action. Use: create, update-status, or delete' },
      { status: 400 }
    )
  } catch (error) {
    console.error('Error processing appointment:', error)
    return NextResponse.json({ error: 'Failed to process appointment' }, { status: 500 })
  }
}
