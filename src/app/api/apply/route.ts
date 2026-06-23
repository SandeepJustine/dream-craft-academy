import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { firstName, lastName, email, phone, country, testimony, courseInterest } = body

    if (!firstName || !lastName || !email) {
      return NextResponse.json(
        { error: 'First name, last name, and email are required' },
        { status: 400 }
      )
    }

    const application = await db.application.create({
      data: {
        firstName,
        lastName,
        email,
        phone: phone || null,
        country: country || null,
        testimony: testimony || null,
        courseInterest: courseInterest || null,
        status: 'pending',
      },
    })

    // Also create/update a user account
    const user = await db.user.upsert({
      where: { email },
      update: { name: `${firstName} ${lastName}` },
      create: {
        email,
        name: `${firstName} ${lastName}`,
        role: 'student',
      },
    })

    // Update application with userId
    await db.application.update({
      where: { id: application.id },
      data: { userId: user.id },
    })

    return NextResponse.json({ application, user })
  } catch (error) {
    console.error('Error submitting application:', error)
    return NextResponse.json({ error: 'Failed to submit application' }, { status: 500 })
  }
}
