import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { page, visitorId, referrer, userAgent, userId } = body

    if (!page || !visitorId) {
      return NextResponse.json({ error: 'Page and visitorId are required' }, { status: 400 })
    }

    await db.pageView.create({
      data: {
        page,
        visitorId,
        referrer: referrer || null,
        userAgent: userAgent || null,
        userId: userId || null,
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error tracking page view:', error)
    return NextResponse.json({ error: 'Failed to track page view' }, { status: 500 })
  }
}
