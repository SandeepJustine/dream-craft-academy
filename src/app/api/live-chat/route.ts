import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// Helper: generate a unique session ID string
function generateSessionId(): string {
  return `lc_${Date.now()}_${Math.random().toString(36).substring(2, 10)}`
}

// ============================================================
// GET — Fetch live chat sessions, messages, session, or unread count
// ============================================================
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const action = searchParams.get('action')

    if (!action) {
      return NextResponse.json(
        { error: 'action query parameter is required' },
        { status: 400 }
      )
    }

    switch (action) {
      // ----------------------------------------------------------
      // sessions — list all active/closed sessions for admin dashboard
      // ----------------------------------------------------------
      case 'sessions': {
        const sessions = await db.liveChatSession.findMany({
          where: {
            status: { in: ['active', 'closed'] },
          },
          include: {
            assignedTo: {
              select: { id: true, name: true, email: true, avatar: true, role: true },
            },
            messages: {
              orderBy: { createdAt: 'desc' },
              take: 1,
            },
            _count: {
              select: { messages: true },
            },
          },
          orderBy: { updatedAt: 'desc' },
        })

        // Shape the response to include message count and last message explicitly
        const result = sessions.map((session) => ({
          id: session.id,
          visitorName: session.visitorName,
          visitorEmail: session.visitorEmail,
          sessionId: session.sessionId,
          status: session.status,
          assignedToId: session.assignedToId,
          assignedTo: session.assignedTo,
          createdAt: session.createdAt,
          updatedAt: session.updatedAt,
          messageCount: session._count.messages,
          lastMessage: session.messages[0] ?? null,
        }))

        return NextResponse.json(result)
      }

      // ----------------------------------------------------------
      // messages — get messages for a session by sessionId param
      // ----------------------------------------------------------
      case 'messages': {
        const sessionIdParam = searchParams.get('sessionId')

        if (!sessionIdParam) {
          return NextResponse.json(
            { error: 'sessionId query parameter is required for messages action' },
            { status: 400 }
          )
        }

        // Look up the session by the visitor-facing sessionId field
        const session = await db.liveChatSession.findUnique({
          where: { sessionId: sessionIdParam },
        })

        if (!session) {
          return NextResponse.json(
            { error: 'Session not found' },
            { status: 404 }
          )
        }

        const messages = await db.liveChatMessage.findMany({
          where: { sessionId: session.id },
          include: {
            sender: {
              select: { id: true, name: true, email: true, avatar: true, role: true },
            },
          },
          orderBy: { createdAt: 'asc' },
        })

        return NextResponse.json(messages)
      }

      // ----------------------------------------------------------
      // session — get a specific session by sessionId param
      // ----------------------------------------------------------
      case 'session': {
        const sessionIdParam = searchParams.get('sessionId')

        if (!sessionIdParam) {
          return NextResponse.json(
            { error: 'sessionId query parameter is required for session action' },
            { status: 400 }
          )
        }

        const session = await db.liveChatSession.findUnique({
          where: { sessionId: sessionIdParam },
          include: {
            assignedTo: {
              select: { id: true, name: true, email: true, avatar: true, role: true },
            },
            messages: {
              include: {
                sender: {
                  select: { id: true, name: true, email: true, avatar: true, role: true },
                },
              },
              orderBy: { createdAt: 'asc' },
            },
          },
        })

        if (!session) {
          return NextResponse.json(
            { error: 'Session not found' },
            { status: 404 }
          )
        }

        return NextResponse.json(session)
      }

      // ----------------------------------------------------------
      // unread-count — count of sessions with unread visitor messages
      // ----------------------------------------------------------
      case 'unread-count': {
        // Find sessions that have at least one unread visitor message
        const unreadSessions = await db.liveChatSession.findMany({
          where: {
            status: 'active',
            messages: {
              some: {
                senderType: 'visitor',
                isRead: false,
              },
            },
          },
          select: { id: true },
        })

        return NextResponse.json({ count: unreadSessions.length })
      }

      default:
        return NextResponse.json(
          { error: `Unknown action: ${action}. Valid actions: sessions, messages, session, unread-count` },
          { status: 400 }
        )
    }
  } catch (error) {
    console.error('Error in live-chat GET:', error)
    return NextResponse.json(
      { error: 'Failed to process live chat request' },
      { status: 500 }
    )
  }
}

// ============================================================
// POST — Create/Update live chat sessions and messages
// ============================================================
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action } = body

    if (!action) {
      return NextResponse.json(
        { error: 'action field is required in request body' },
        { status: 400 }
      )
    }

    switch (action) {
      // ----------------------------------------------------------
      // create-session — create a new LiveChatSession
      // ----------------------------------------------------------
      case 'create-session': {
        const { visitorName, visitorEmail, sessionId: sessionIdInput } = body

        // Generate a unique sessionId if not provided
        let sessionId = sessionIdInput as string | undefined
        if (!sessionId) {
          sessionId = generateSessionId()
        } else {
          // Ensure the provided sessionId is unique
          const existing = await db.liveChatSession.findUnique({
            where: { sessionId },
          })
          if (existing) {
            return NextResponse.json(
              { error: 'A session with this sessionId already exists' },
              { status: 409 }
            )
          }
        }

        const session = await db.liveChatSession.create({
          data: {
            visitorName: visitorName || null,
            visitorEmail: visitorEmail || null,
            sessionId,
            status: 'active',
          },
          include: {
            assignedTo: {
              select: { id: true, name: true, email: true, avatar: true, role: true },
            },
          },
        })

        return NextResponse.json(session, { status: 201 })
      }

      // ----------------------------------------------------------
      // send-message — create a new LiveChatMessage
      // ----------------------------------------------------------
      case 'send-message': {
        const { sessionId: sessionIdParam, content, senderType, senderId, senderName } = body

        if (!sessionIdParam || !content) {
          return NextResponse.json(
            { error: 'sessionId and content are required' },
            { status: 400 }
          )
        }

        // Look up the session by the visitor-facing sessionId field
        const session = await db.liveChatSession.findUnique({
          where: { sessionId: sessionIdParam },
        })

        if (!session) {
          return NextResponse.json(
            { error: 'Session not found' },
            { status: 404 }
          )
        }

        if (session.status === 'closed') {
          return NextResponse.json(
            { error: 'Cannot send messages to a closed session' },
            { status: 400 }
          )
        }

        const message = await db.liveChatMessage.create({
          data: {
            sessionId: session.id,
            content,
            senderType: senderType || 'visitor',
            senderId: senderId || null,
            senderName: senderName || null,
          },
          include: {
            sender: {
              select: { id: true, name: true, email: true, avatar: true, role: true },
            },
          },
        })

        // Update session's updatedAt timestamp
        await db.liveChatSession.update({
          where: { id: session.id },
          data: { updatedAt: new Date() },
        })

        return NextResponse.json(message, { status: 201 })
      }

      // ----------------------------------------------------------
      // assign — assign a session to an admin user
      // ----------------------------------------------------------
      case 'assign': {
        const { sessionId: sessionIdParam, assignedToId } = body

        if (!sessionIdParam || !assignedToId) {
          return NextResponse.json(
            { error: 'sessionId and assignedToId are required' },
            { status: 400 }
          )
        }

        // Verify the admin user exists
        const adminUser = await db.user.findUnique({
          where: { id: assignedToId },
        })

        if (!adminUser) {
          return NextResponse.json(
            { error: 'Assigned user not found' },
            { status: 404 }
          )
        }

        // Find and update the session
        const session = await db.liveChatSession.findUnique({
          where: { sessionId: sessionIdParam },
        })

        if (!session) {
          return NextResponse.json(
            { error: 'Session not found' },
            { status: 404 }
          )
        }

        const updatedSession = await db.liveChatSession.update({
          where: { id: session.id },
          data: { assignedToId },
          include: {
            assignedTo: {
              select: { id: true, name: true, email: true, avatar: true, role: true },
            },
            messages: {
              include: {
                sender: {
                  select: { id: true, name: true, email: true, avatar: true, role: true },
                },
              },
              orderBy: { createdAt: 'asc' },
            },
          },
        })

        return NextResponse.json(updatedSession)
      }

      // ----------------------------------------------------------
      // close — close a session
      // ----------------------------------------------------------
      case 'close': {
        const { sessionId: sessionIdParam } = body

        if (!sessionIdParam) {
          return NextResponse.json(
            { error: 'sessionId is required' },
            { status: 400 }
          )
        }

        const session = await db.liveChatSession.findUnique({
          where: { sessionId: sessionIdParam },
        })

        if (!session) {
          return NextResponse.json(
            { error: 'Session not found' },
            { status: 404 }
          )
        }

        if (session.status === 'closed') {
          return NextResponse.json(
            { error: 'Session is already closed' },
            { status: 400 }
          )
        }

        const updatedSession = await db.liveChatSession.update({
          where: { id: session.id },
          data: { status: 'closed' },
          include: {
            assignedTo: {
              select: { id: true, name: true, email: true, avatar: true, role: true },
            },
          },
        })

        return NextResponse.json(updatedSession)
      }

      // ----------------------------------------------------------
      // mark-read — mark all visitor messages in a session as read
      // ----------------------------------------------------------
      case 'mark-read': {
        const { sessionId: sessionIdParam } = body

        if (!sessionIdParam) {
          return NextResponse.json(
            { error: 'sessionId is required' },
            { status: 400 }
          )
        }

        const session = await db.liveChatSession.findUnique({
          where: { sessionId: sessionIdParam },
        })

        if (!session) {
          return NextResponse.json(
            { error: 'Session not found' },
            { status: 404 }
          )
        }

        const result = await db.liveChatMessage.updateMany({
          where: {
            sessionId: session.id,
            senderType: 'visitor',
            isRead: false,
          },
          data: { isRead: true },
        })

        return NextResponse.json({
          success: true,
          markedCount: result.count,
        })
      }

      default:
        return NextResponse.json(
          { error: `Unknown action: ${action}. Valid actions: create-session, send-message, assign, close, mark-read` },
          { status: 400 }
        )
    }
  } catch (error) {
    console.error('Error in live-chat POST:', error)
    return NextResponse.json(
      { error: 'Failed to process live chat request' },
      { status: 500 }
    )
  }
}
