import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const courseId = searchParams.get('courseId')
    const moduleId = searchParams.get('moduleId')

    if (moduleId) {
      const moduleData = await db.module.findUnique({
        where: { id: moduleId },
        include: {
          lessons: { orderBy: { order: 'asc' } },
          quizzes: { orderBy: { order: 'asc' } },
          assignments: { orderBy: { order: 'asc' } },
          _count: { select: { lessons: true, quizzes: true, assignments: true } },
        },
      })
      if (!moduleData) {
        return NextResponse.json({ error: 'Module not found' }, { status: 404 })
      }
      return NextResponse.json(moduleData)
    }

    if (courseId) {
      const modules = await db.module.findMany({
        where: { courseId },
        include: {
          lessons: {
            orderBy: { order: 'asc' },
            select: {
              id: true,
              title: true,
              type: true,
              duration: true,
              order: true,
              videoUrl: true,
              audioUrl: true,
              codeSnippet: true,
              pdfUrl: true,
              presentationUrl: true,
              embedCode: true,
              externalUrl: true,
              resourceUrl: true,
              content: true,
            },
          },
          quizzes: {
            orderBy: { order: 'asc' },
            include: {
              _count: { select: { questions: true, attempts: true } },
            },
          },
          assignments: {
            orderBy: { order: 'asc' },
          },
          _count: { select: { lessons: true, quizzes: true, assignments: true } },
        },
        orderBy: { order: 'asc' },
      })
      return NextResponse.json(modules)
    }

    return NextResponse.json(
      { error: 'courseId or moduleId query parameter is required' },
      { status: 400 }
    )
  } catch (error) {
    console.error('Error fetching modules:', error)
    return NextResponse.json({ error: 'Failed to fetch modules' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, userId } = body

    if (!userId) {
      return NextResponse.json({ error: 'userId is required' }, { status: 400 })
    }

    const user = await db.user.findUnique({ where: { id: userId } })
    if (!user || (user.role !== 'admin' && user.role !== 'instructor')) {
      return NextResponse.json({ error: 'Only admins and instructors can manage modules' }, { status: 403 })
    }

    if (action === 'create') {
      const { courseId, title, description } = body

      if (!courseId || !title) {
        return NextResponse.json({ error: 'courseId and title are required' }, { status: 400 })
      }

      // Verify course exists and instructor owns it
      const course = await db.course.findUnique({ where: { id: courseId } })
      if (!course) {
        return NextResponse.json({ error: 'Course not found' }, { status: 404 })
      }

      if (user.role === 'instructor' && course.instructor !== (user.name || 'Unknown Instructor')) {
        return NextResponse.json({ error: 'You can only manage your own courses' }, { status: 403 })
      }

      // Get next order number
      const existingModules = await db.module.findMany({
        where: { courseId },
        orderBy: { order: 'desc' },
        take: 1,
      })
      const nextOrder = existingModules.length > 0 ? existingModules[0].order + 1 : 0

      const moduleData = await db.module.create({
        data: {
          courseId,
          title,
          description: description || null,
          order: nextOrder,
        },
        include: {
          _count: { select: { lessons: true, quizzes: true, assignments: true } },
        },
      })

      return NextResponse.json(moduleData, { status: 201 })
    }

    if (action === 'update') {
      const { moduleId, title, description, order } = body

      if (!moduleId) {
        return NextResponse.json({ error: 'moduleId is required' }, { status: 400 })
      }

      const updateData: Record<string, unknown> = {}
      if (title !== undefined) updateData.title = title
      if (description !== undefined) updateData.description = description
      if (order !== undefined) updateData.order = order

      const moduleData = await db.module.update({
        where: { id: moduleId },
        data: updateData,
        include: {
          _count: { select: { lessons: true, quizzes: true, assignments: true } },
        },
      })

      return NextResponse.json(moduleData)
    }

    if (action === 'delete') {
      const { moduleId } = body

      if (!moduleId) {
        return NextResponse.json({ error: 'moduleId is required' }, { status: 400 })
      }

      await db.module.delete({ where: { id: moduleId } })
      return NextResponse.json({ success: true })
    }

    return NextResponse.json(
      { error: 'Invalid action. Use "create", "update", or "delete"' },
      { status: 400 }
    )
  } catch (error) {
    console.error('Error managing modules:', error)
    return NextResponse.json({ error: 'Failed to manage modules' }, { status: 500 })
  }
}
