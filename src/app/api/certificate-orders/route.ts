import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// ─── Pricing & Eligibility Constants ────────────────────────────────────────
const CERTIFICATE_PRICE_USD = 25
const DIPLOMA_PRICE_USD = 40
const CERTIFICATE_COURSE_REQUIREMENT = 7
const DIPLOMA_COURSE_REQUIREMENT = 12

// GET /api/certificate-orders — List orders (admin: all, student: own)
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const userId = searchParams.get('userId')
    const orderId = searchParams.get('orderId')
    const role = searchParams.get('role')
    const checkEligibility = searchParams.get('checkEligibility')

    // Eligibility check endpoint
    if (checkEligibility && userId) {
      const enrollments = await db.enrollment.findMany({
        where: { userId, status: 'completed' },
        select: { id: true },
      })
      const completedCourses = enrollments.length

      const existingOrders = await db.certificateOrder.findMany({
        where: { userId, orderStatus: { not: 'cancelled' } },
        select: { orderType: true },
      })

      return NextResponse.json({
        completedCourses,
        canOrderCertificate: completedCourses >= CERTIFICATE_COURSE_REQUIREMENT,
        canOrderDiploma: completedCourses >= DIPLOMA_COURSE_REQUIREMENT,
        certificatePrice: CERTIFICATE_PRICE_USD,
        diplomaPrice: DIPLOMA_PRICE_USD,
        existingOrders: {
          certificate: existingOrders.filter(o => o.orderType === 'certificate').length,
          diploma: existingOrders.filter(o => o.orderType === 'diploma').length,
        },
      })
    }

    // Single order lookup
    if (orderId) {
      const order = await db.certificateOrder.findUnique({
        where: { id: orderId },
        include: {
          user: { select: { id: true, name: true, email: true, phone: true } },
          certificate: {
            include: {
              course: { select: { id: true, title: true, category: true, level: true, instructor: true } },
            },
          },
        },
      })
      if (!order) {
        return NextResponse.json({ error: 'Order not found' }, { status: 404 })
      }
      return NextResponse.json(order)
    }

    // List orders
    const where: Record<string, unknown> = {}
    if (userId && role !== 'admin') {
      where.userId = userId
    }

    const orders = await db.certificateOrder.findMany({
      where,
      include: {
        user: { select: { id: true, name: true, email: true, phone: true } },
        certificate: {
          include: {
            course: { select: { id: true, title: true, category: true, level: true, instructor: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(orders)
  } catch (error) {
    console.error('Certificate orders GET error:', error)
    return NextResponse.json({ error: 'Failed to fetch certificate orders' }, { status: 500 })
  }
}

// POST /api/certificate-orders — Create a new order
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const {
      userId,
      certificateId,
      orderType,
      amount,
      paymentMethod,
      paymentReference,
      recipientName,
      recipientPhone,
      recipientEmail,
      shippingAddress,
      city,
      country,
      notes,
    } = body

    if (!userId || !orderType || !paymentMethod || !recipientName) {
      return NextResponse.json(
        { error: 'Missing required fields: userId, orderType, paymentMethod, recipientName' },
        { status: 400 }
      )
    }

    if (!['certificate', 'diploma'].includes(orderType)) {
      return NextResponse.json({ error: 'orderType must be "certificate" or "diploma"' }, { status: 400 })
    }

    if (!['bank', 'airtel_money', 'tnm_mpamba'].includes(paymentMethod)) {
      return NextResponse.json(
        { error: 'paymentMethod must be "bank", "airtel_money", or "tnm_mpamba"' },
        { status: 400 }
      )
    }

    // Verify eligibility based on completed courses
    const completedEnrollments = await db.enrollment.findMany({
      where: { userId, status: 'completed' },
      select: { id: true },
    })
    const completedCount = completedEnrollments.length

    if (orderType === 'certificate' && completedCount < CERTIFICATE_COURSE_REQUIREMENT) {
      return NextResponse.json(
        { error: `You need to complete at least ${CERTIFICATE_COURSE_REQUIREMENT} courses to order a certificate. You have completed ${completedCount}.` },
        { status: 403 }
      )
    }

    if (orderType === 'diploma' && completedCount < DIPLOMA_COURSE_REQUIREMENT) {
      return NextResponse.json(
        { error: `You need to complete at least ${DIPLOMA_COURSE_REQUIREMENT} courses to order a diploma. You have completed ${completedCount}.` },
        { status: 403 }
      )
    }

    // Validate amount matches pricing
    const expectedAmount = orderType === 'certificate' ? CERTIFICATE_PRICE_USD : DIPLOMA_PRICE_USD
    const finalAmount = amount || expectedAmount

    const order = await db.certificateOrder.create({
      data: {
        userId,
        certificateId: certificateId || null,
        orderType,
        quantity: 1,
        amount: finalAmount,
        currency: 'USD',
        paymentMethod,
        paymentReference: paymentReference || null,
        recipientName,
        recipientPhone: recipientPhone || null,
        recipientEmail: recipientEmail || null,
        shippingAddress: shippingAddress || 'Digital Delivery',
        city: city || null,
        country: country || 'Malawi',
        notes: notes || null,
      },
      include: {
        user: { select: { id: true, name: true, email: true } },
        certificate: {
          include: {
            course: { select: { id: true, title: true } },
          },
        },
      },
    })

    return NextResponse.json(order, { status: 201 })
  } catch (error) {
    console.error('Certificate orders POST error:', error)
    return NextResponse.json({ error: 'Failed to create certificate order' }, { status: 500 })
  }
}

// PATCH /api/certificate-orders — Update order (admin: status updates)
export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json()
    const { orderId, paymentStatus, orderStatus, adminNotes, paymentReference } = body

    if (!orderId) {
      return NextResponse.json({ error: 'orderId is required' }, { status: 400 })
    }

    const updateData: Record<string, unknown> = {}
    if (paymentStatus) updateData.paymentStatus = paymentStatus
    if (orderStatus) updateData.orderStatus = orderStatus
    if (adminNotes !== undefined) updateData.adminNotes = adminNotes
    if (paymentReference !== undefined) updateData.paymentReference = paymentReference

    const order = await db.certificateOrder.update({
      where: { id: orderId },
      data: updateData,
      include: {
        user: { select: { id: true, name: true, email: true, phone: true } },
        certificate: {
          include: {
            course: { select: { id: true, title: true } },
          },
        },
      },
    })

    return NextResponse.json(order)
  } catch (error) {
    console.error('Certificate orders PATCH error:', error)
    return NextResponse.json({ error: 'Failed to update certificate order' }, { status: 500 })
  }
}

// DELETE /api/certificate-orders — Cancel an order
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const orderId = searchParams.get('orderId')

    if (!orderId) {
      return NextResponse.json({ error: 'orderId is required' }, { status: 400 })
    }

    const order = await db.certificateOrder.update({
      where: { id: orderId },
      data: { orderStatus: 'cancelled' },
    })

    return NextResponse.json(order)
  } catch (error) {
    console.error('Certificate orders DELETE error:', error)
    return NextResponse.json({ error: 'Failed to cancel certificate order' }, { status: 500 })
  }
}
