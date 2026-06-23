import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const moduleId = searchParams.get('moduleId')
    const courseId = searchParams.get('courseId')

    if (moduleId) {
      // Get assignments by module
      const assignments = await db.assignment.findMany({
        where: { moduleId },
        include: {
          module: {
            select: { id: true, title: true, courseId: true },
          },
          _count: { select: { submissions: true } },
        },
        orderBy: { order: 'asc' },
      })

      return NextResponse.json(assignments)
    }

    if (courseId) {
      // Get assignments by course (through modules)
      const assignments = await db.assignment.findMany({
        where: {
          module: { courseId },
        },
        include: {
          module: {
            select: { id: true, title: true, courseId: true },
          },
          _count: { select: { submissions: true } },
        },
        orderBy: [{ module: { order: 'asc' } }, { order: 'asc' }],
      })

      return NextResponse.json(assignments)
    }

    return NextResponse.json(
      { error: 'moduleId or courseId query parameter is required' },
      { status: 400 }
    )
  } catch (error) {
    console.error('Error fetching assignments:', error)
    return NextResponse.json({ error: 'Failed to fetch assignments' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, assignmentId, enrollmentId, content, fileUrl } = body

    if (!userId || !assignmentId || !enrollmentId) {
      return NextResponse.json(
        { error: 'userId, assignmentId, and enrollmentId are required' },
        { status: 400 }
      )
    }

    // Verify assignment exists
    const assignment = await db.assignment.findUnique({
      where: { id: assignmentId },
    })

    if (!assignment) {
      return NextResponse.json({ error: 'Assignment not found' }, { status: 404 })
    }

    // Upsert submission (one per user per assignment)
    const submission = await db.assignmentSubmission.upsert({
      where: {
        userId_assignmentId: { userId, assignmentId },
      },
      update: {
        content: content || '',
        fileUrl: fileUrl || null,
        status: 'submitted',
        submittedAt: new Date(),
        enrollmentId,
      },
      create: {
        userId,
        assignmentId,
        enrollmentId,
        content: content || '',
        fileUrl: fileUrl || null,
        status: 'submitted',
      },
    })

    return NextResponse.json(submission, { status: 201 })
  } catch (error) {
    console.error('Error submitting assignment:', error)
    return NextResponse.json({ error: 'Failed to submit assignment' }, { status: 500 })
  }
}
