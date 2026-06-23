import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// ============================================================
// GET /api/newsletter?action=list|subscribers|stats
// ============================================================
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const action = searchParams.get('action')

    if (!action) {
      return NextResponse.json(
        { error: 'action query parameter is required (list, subscribers, stats)' },
        { status: 400 }
      )
    }

    // ---- List all newsletters with createdBy user info & recipient count ----
    if (action === 'list') {
      const newsletters = await db.newsletter.findMany({
        include: {
          createdBy: {
            select: { id: true, name: true, email: true, avatar: true },
          },
          _count: { select: { recipients: true } },
        },
        orderBy: { createdAt: 'desc' },
      })

      const formatted = newsletters.map((nl) => ({
        id: nl.id,
        subject: nl.subject,
        content: nl.content,
        status: nl.status,
        scheduledAt: nl.scheduledAt,
        sentAt: nl.sentAt,
        createdById: nl.createdById,
        recipientCount: nl.recipientCount,
        actualRecipientCount: nl._count.recipients,
        createdAt: nl.createdAt,
        updatedAt: nl.updatedAt,
        createdBy: nl.createdBy,
      }))

      return NextResponse.json({ newsletters: formatted })
    }

    // ---- List all newsletter subscribers ----
    if (action === 'subscribers') {
      const subscribers = await db.newsletterSubscriber.findMany({
        orderBy: { subscribedAt: 'desc' },
      })

      return NextResponse.json({ subscribers })
    }

    // ---- Newsletter stats ----
    if (action === 'stats') {
      const [subscriberCount, activeSubscriberCount, totalSent, draftCount, scheduledCount] =
        await Promise.all([
          db.newsletterSubscriber.count(),
          db.newsletterSubscriber.count({ where: { isActive: true } }),
          db.newsletter.count({ where: { status: 'sent' } }),
          db.newsletter.count({ where: { status: 'draft' } }),
          db.newsletter.count({ where: { status: 'scheduled' } }),
        ])

      // Total recipients across all sent newsletters
      const totalRecipientsResult = await db.newsletterRecipient.aggregate({
        _count: { id: true },
      })

      return NextResponse.json({
        stats: {
          subscriberCount,
          activeSubscriberCount,
          inactiveSubscriberCount: subscriberCount - activeSubscriberCount,
          totalNewslettersSent: totalSent,
          draftCount,
          scheduledCount,
          totalRecipients: totalRecipientsResult._count.id,
        },
      })
    }

    return NextResponse.json(
      { error: 'Invalid action. Use "list", "subscribers", or "stats"' },
      { status: 400 }
    )
  } catch (error) {
    console.error('Error in newsletter GET:', error)
    return NextResponse.json({ error: 'Failed to process newsletter request' }, { status: 500 })
  }
}

// ============================================================
// POST /api/newsletter
// Body { action: subscribe|unsubscribe|create|update|delete|send|send-test, ... }
// ============================================================
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action } = body

    if (!action) {
      return NextResponse.json({ error: 'action is required' }, { status: 400 })
    }

    // ---- Subscribe ----
    if (action === 'subscribe') {
      const { email, name } = body

      if (!email) {
        return NextResponse.json({ error: 'email is required' }, { status: 400 })
      }

      const normalizedEmail = email.toLowerCase().trim()

      const existing = await db.newsletterSubscriber.findUnique({
        where: { email: normalizedEmail },
      })

      if (existing) {
        if (existing.isActive) {
          return NextResponse.json(
            { error: 'This email is already subscribed', subscriber: existing },
            { status: 409 }
          )
        }

        // Re-subscribe inactive subscriber
        const reactivated = await db.newsletterSubscriber.update({
          where: { email: normalizedEmail },
          data: {
            isActive: true,
            name: name || existing.name,
            subscribedAt: new Date(),
            unsubscribedAt: null,
          },
        })

        return NextResponse.json({
          message: 'Re-subscribed successfully',
          subscriber: reactivated,
        })
      }

      const subscriber = await db.newsletterSubscriber.create({
        data: {
          email: normalizedEmail,
          name: name || null,
          isActive: true,
        },
      })

      return NextResponse.json(
        { message: 'Subscribed successfully', subscriber },
        { status: 201 }
      )
    }

    // ---- Unsubscribe ----
    if (action === 'unsubscribe') {
      const { email } = body

      if (!email) {
        return NextResponse.json({ error: 'email is required' }, { status: 400 })
      }

      const normalizedEmail = email.toLowerCase().trim()

      const subscriber = await db.newsletterSubscriber.findUnique({
        where: { email: normalizedEmail },
      })

      if (!subscriber) {
        return NextResponse.json({ error: 'Subscriber not found' }, { status: 404 })
      }

      if (!subscriber.isActive) {
        return NextResponse.json({ message: 'Already unsubscribed', subscriber })
      }

      const updated = await db.newsletterSubscriber.update({
        where: { email: normalizedEmail },
        data: {
          isActive: false,
          unsubscribedAt: new Date(),
        },
      })

      return NextResponse.json({ message: 'Unsubscribed successfully', subscriber: updated })
    }

    // ---- Create newsletter ----
    if (action === 'create') {
      const { subject, content, createdById, status, scheduledAt } = body

      if (!subject || !content || !createdById) {
        return NextResponse.json(
          { error: 'subject, content, and createdById are required' },
          { status: 400 }
        )
      }

      // Verify user exists
      const user = await db.user.findUnique({ where: { id: createdById } })
      if (!user) {
        return NextResponse.json({ error: 'Creator user not found' }, { status: 404 })
      }

      const newsletterStatus = status || 'draft'

      // Validate scheduled newsletters have a date
      if (newsletterStatus === 'scheduled' && !scheduledAt) {
        return NextResponse.json(
          { error: 'scheduledAt is required when status is "scheduled"' },
          { status: 400 }
        )
      }

      const newsletter = await db.newsletter.create({
        data: {
          subject,
          content,
          createdById,
          status: newsletterStatus,
          scheduledAt: scheduledAt ? new Date(scheduledAt) : null,
        },
        include: {
          createdBy: {
            select: { id: true, name: true, email: true, avatar: true },
          },
        },
      })

      return NextResponse.json(
        { message: 'Newsletter created successfully', newsletter },
        { status: 201 }
      )
    }

    // ---- Update newsletter ----
    if (action === 'update') {
      const { id, subject, content, status, scheduledAt } = body

      if (!id) {
        return NextResponse.json({ error: 'Newsletter id is required' }, { status: 400 })
      }

      const existing = await db.newsletter.findUnique({ where: { id } })
      if (!existing) {
        return NextResponse.json({ error: 'Newsletter not found' }, { status: 404 })
      }

      // Cannot update already sent newsletters
      if (existing.status === 'sent') {
        return NextResponse.json(
          { error: 'Cannot update a newsletter that has already been sent' },
          { status: 400 }
        )
      }

      const updateData: Record<string, unknown> = {}
      if (subject !== undefined) updateData.subject = subject
      if (content !== undefined) updateData.content = content
      if (status !== undefined) updateData.status = status
      if (scheduledAt !== undefined) updateData.scheduledAt = scheduledAt ? new Date(scheduledAt) : null

      // Validate scheduled status
      const newStatus = (status as string) || existing.status
      const newScheduledAt =
        scheduledAt !== undefined ? (scheduledAt ? new Date(scheduledAt) : null) : existing.scheduledAt

      if (newStatus === 'scheduled' && !newScheduledAt) {
        return NextResponse.json(
          { error: 'scheduledAt is required when status is "scheduled"' },
          { status: 400 }
        )
      }

      const updated = await db.newsletter.update({
        where: { id },
        data: updateData,
        include: {
          createdBy: {
            select: { id: true, name: true, email: true, avatar: true },
          },
        },
      })

      return NextResponse.json({ message: 'Newsletter updated successfully', newsletter: updated })
    }

    // ---- Delete newsletter ----
    if (action === 'delete') {
      const { id } = body

      if (!id) {
        return NextResponse.json({ error: 'Newsletter id is required' }, { status: 400 })
      }

      const existing = await db.newsletter.findUnique({ where: { id } })
      if (!existing) {
        return NextResponse.json({ error: 'Newsletter not found' }, { status: 404 })
      }

      // Cascade delete will handle recipients
      await db.newsletter.delete({ where: { id } })

      return NextResponse.json({ message: 'Newsletter deleted successfully' })
    }

    // ---- Send newsletter ----
    if (action === 'send') {
      const { id } = body

      if (!id) {
        return NextResponse.json({ error: 'Newsletter id is required' }, { status: 400 })
      }

      const existing = await db.newsletter.findUnique({
        where: { id },
        include: { recipients: true },
      })

      if (!existing) {
        return NextResponse.json({ error: 'Newsletter not found' }, { status: 404 })
      }

      if (existing.status === 'sent') {
        return NextResponse.json(
          { error: 'Newsletter has already been sent' },
          { status: 400 }
        )
      }

      // Gather all active subscriber emails
      const activeSubscribers = await db.newsletterSubscriber.findMany({
        where: { isActive: true },
        select: { email: true },
      })

      // Gather all student and instructor emails from User table
      const users = await db.user.findMany({
        where: { role: { in: ['student', 'instructor'] } },
        select: { email: true },
      })

      // Combine and deduplicate emails
      const emailSet = new Set<string>()
      for (const sub of activeSubscribers) {
        emailSet.add(sub.email.toLowerCase().trim())
      }
      for (const user of users) {
        emailSet.add(user.email.toLowerCase().trim())
      }

      const allEmails = Array.from(emailSet)

      if (allEmails.length === 0) {
        return NextResponse.json(
          { error: 'No recipients found to send the newsletter to' },
          { status: 400 }
        )
      }

      const now = new Date()

      // Create NewsletterRecipient records for each email
      const recipientData = allEmails.map((email) => ({
        newsletterId: id,
        email,
        sentAt: now,
      }))

      await db.newsletterRecipient.createMany({
        data: recipientData,
        skipDuplicates: true,
      })

      // Update newsletter status to 'sent'
      const updated = await db.newsletter.update({
        where: { id },
        data: {
          status: 'sent',
          sentAt: now,
          recipientCount: allEmails.length,
        },
        include: {
          createdBy: {
            select: { id: true, name: true, email: true, avatar: true },
          },
        },
      })

      return NextResponse.json({
        message: 'Newsletter sent successfully',
        newsletter: updated,
        recipientCount: allEmails.length,
      })
    }

    // ---- Send test newsletter ----
    if (action === 'send-test') {
      const { id, email } = body

      if (!id || !email) {
        return NextResponse.json(
          { error: 'id and email are required for sending a test' },
          { status: 400 }
        )
      }

      const normalizedEmail = email.toLowerCase().trim()

      const existing = await db.newsletter.findUnique({ where: { id } })
      if (!existing) {
        return NextResponse.json({ error: 'Newsletter not found' }, { status: 404 })
      }

      // Create a single test recipient record
      const now = new Date()
      await db.newsletterRecipient.create({
        data: {
          newsletterId: id,
          email: normalizedEmail,
          sentAt: now,
        },
      })

      return NextResponse.json({
        message: `Test newsletter sent to ${normalizedEmail}`,
        email: normalizedEmail,
      })
    }

    return NextResponse.json(
      {
        error:
          'Invalid action. Use "subscribe", "unsubscribe", "create", "update", "delete", "send", or "send-test"',
      },
      { status: 400 }
    )
  } catch (error) {
    console.error('Error in newsletter POST:', error)
    return NextResponse.json({ error: 'Failed to process newsletter request' }, { status: 500 })
  }
}
