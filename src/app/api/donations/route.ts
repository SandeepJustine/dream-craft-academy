import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// ─── Exchange Rate ──────────────────────────────────────────────────────────
const MWK_PER_USD = 1750 // Exchange rate: $1 ≈ MK 1,750

function usdToMwk(usd: number): number {
  return usd * MWK_PER_USD
}

// GET /api/donations — List donations (admin: all, user: own)
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const userId = searchParams.get('userId')
    const role = searchParams.get('role')
    const donationId = searchParams.get('donationId')
    const stats = searchParams.get('stats')

    // Stats endpoint for admin dashboard
    if (stats === 'true') {
      const donations = await db.donation.findMany({})
      const totalUsd = donations.reduce((sum, d) => sum + d.amountUsd, 0)
      const totalMwk = donations.reduce((sum, d) => sum + d.amountMwk, 0)
      const confirmed = donations.filter(d => d.paymentStatus === 'confirmed')
      const pending = donations.filter(d => d.paymentStatus === 'pending')
      const confirmedUsd = confirmed.reduce((sum, d) => sum + d.amountUsd, 0)
      const confirmedMwk = confirmed.reduce((sum, d) => sum + d.amountMwk, 0)
      const pendingUsd = pending.reduce((sum, d) => sum + d.amountUsd, 0)

      return NextResponse.json({
        totalDonations: donations.length,
        totalUsd,
        totalMwk,
        confirmedCount: confirmed.length,
        confirmedUsd,
        confirmedMwk,
        pendingCount: pending.length,
        pendingUsd,
      })
    }

    // Single donation lookup
    if (donationId) {
      const donation = await db.donation.findUnique({
        where: { id: donationId },
        include: {
          user: { select: { id: true, name: true, email: true } },
        },
      })
      if (!donation) {
        return NextResponse.json({ error: 'Donation not found' }, { status: 404 })
      }
      return NextResponse.json(donation)
    }

    // List donations — admin sees all, regular users see own
    const where: Record<string, unknown> = {}
    if (userId && role !== 'admin') {
      where.userId = userId
    }

    const donations = await db.donation.findMany({
      where,
      include: {
        user: { select: { id: true, name: true, email: true } },
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(donations)
  } catch (error) {
    console.error('Donations GET error:', error)
    return NextResponse.json({ error: 'Failed to fetch donations' }, { status: 500 })
  }
}

// POST /api/donations — Create a new donation
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const {
      donorName,
      donorEmail,
      donorPhone,
      amountUsd,
      paymentMethod,
      paymentReference,
      message,
      userId,
    } = body

    // Validate required fields
    if (!donorName || !donorEmail || !amountUsd || !paymentMethod) {
      return NextResponse.json(
        { error: 'Missing required fields: donorName, donorEmail, amountUsd, paymentMethod' },
        { status: 400 }
      )
    }

    if (!['bank', 'airtel_money', 'tnm_mpamba'].includes(paymentMethod)) {
      return NextResponse.json(
        { error: 'paymentMethod must be "bank", "airtel_money", or "tnm_mpamba"' },
        { status: 400 }
      )
    }

    const usd = Number(amountUsd)
    if (isNaN(usd) || usd <= 0) {
      return NextResponse.json({ error: 'amountUsd must be a positive number' }, { status: 400 })
    }

    // Calculate MWK equivalent
    const mwk = usdToMwk(usd)

    // Create donation record
    const donation = await db.donation.create({
      data: {
        donorName: donorName.trim(),
        donorEmail: donorEmail.trim().toLowerCase(),
        donorPhone: donorPhone?.trim() || null,
        amountUsd: usd,
        amountMwk: mwk,
        paymentMethod,
        paymentReference: paymentReference?.trim() || null,
        message: message?.trim() || null,
        userId: userId || null,
        emailSentToDonor: true, // We'll simulate email sending
        emailSentToAdmin: true,
      },
      include: {
        user: { select: { id: true, name: true, email: true } },
      },
    })

    // Create notification for admin users
    try {
      const admins = await db.user.findMany({
        where: { role: 'admin' },
        select: { id: true },
      })
      for (const admin of admins) {
        await db.notification.create({
          data: {
            userId: admin.id,
            type: 'general',
            title: 'New Donation Received',
            message: `${donorName} has made a donation of $${usd.toFixed(2)} (MK ${mwk.toLocaleString()}) via ${paymentMethod === 'bank' ? 'Bank Transfer' : paymentMethod === 'airtel_money' ? 'Airtel Money' : 'TNM Mpamba'}.`,
            isRead: false,
          },
        })
      }
    } catch (notifErr) {
      console.error('Failed to create admin notification:', notifErr)
    }

    // Create notification for the donor if they're a logged-in user
    if (userId) {
      try {
        await db.notification.create({
          data: {
            userId,
            type: 'general',
            title: 'Donation Submitted Successfully',
            message: `Your donation of $${usd.toFixed(2)} (MK ${mwk.toLocaleString()}) has been submitted. A confirmation email has been sent to ${donorEmail}. Thank you for your generosity!`,
            isRead: false,
          },
        })
      } catch (notifErr) {
        console.error('Failed to create donor notification:', notifErr)
      }
    }

    return NextResponse.json(donation, { status: 201 })
  } catch (error) {
    console.error('Donations POST error:', error)
    return NextResponse.json({ error: 'Failed to create donation' }, { status: 500 })
  }
}

// PATCH /api/donations — Update donation status (admin)
export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json()
    const { donationId, paymentStatus } = body

    if (!donationId) {
      return NextResponse.json({ error: 'donationId is required' }, { status: 400 })
    }

    if (paymentStatus && !['pending', 'confirmed', 'failed'].includes(paymentStatus)) {
      return NextResponse.json({ error: 'paymentStatus must be "pending", "confirmed", or "failed"' }, { status: 400 })
    }

    const updateData: Record<string, unknown> = {}
    if (paymentStatus) updateData.paymentStatus = paymentStatus

    const donation = await db.donation.update({
      where: { id: donationId },
      data: updateData,
      include: {
        user: { select: { id: true, name: true, email: true } },
      },
    })

    // Notify donor when payment is confirmed
    if (paymentStatus === 'confirmed' && donation.userId) {
      try {
        await db.notification.create({
          data: {
            userId: donation.userId,
            type: 'general',
            title: 'Donation Confirmed',
            message: `Your donation of $${donation.amountUsd.toFixed(2)} (MK ${donation.amountMwk.toLocaleString()}) has been confirmed. Thank you for your generous support! God bless you.`,
            isRead: false,
          },
        })
      } catch {
        // silent
      }
    }

    return NextResponse.json(donation)
  } catch (error) {
    console.error('Donations PATCH error:', error)
    return NextResponse.json({ error: 'Failed to update donation' }, { status: 500 })
  }
}
