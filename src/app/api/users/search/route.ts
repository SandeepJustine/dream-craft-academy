import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const query = searchParams.get('q')
    const role = searchParams.get('role') || 'student'
    const instructorId = searchParams.get('instructorId')

    if (!query || query.length < 2) {
      return NextResponse.json({ error: 'Search query must be at least 2 characters' }, { status: 400 })
    }

    // Verify the requester is an instructor
    if (instructorId) {
      const instructor = await db.user.findUnique({ where: { id: instructorId } })
      if (!instructor || (instructor.role !== 'instructor' && instructor.role !== 'admin')) {
        return NextResponse.json({ error: 'Only instructors can search for students' }, { status: 403 })
      }
    }

    const users = await db.user.findMany({
      where: {
        role,
        OR: [
          { name: { contains: query } },
          { email: { contains: query } },
        ],
      },
      select: {
        id: true,
        name: true,
        email: true,
        avatar: true,
        country: true,
        role: true,
        createdAt: true,
      },
      take: 20,
      orderBy: { name: 'asc' },
    })

    return NextResponse.json(users)
  } catch (error) {
    console.error('Error searching users:', error)
    return NextResponse.json({ error: 'Failed to search users' }, { status: 500 })
  }
}
