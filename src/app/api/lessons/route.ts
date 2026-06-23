import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const moduleId = searchParams.get('moduleId')
    const lessonId = searchParams.get('lessonId')

    if (lessonId) {
      const lesson = await db.lesson.findUnique({
        where: { id: lessonId },
      })
      if (!lesson) {
        return NextResponse.json({ error: 'Lesson not found' }, { status: 404 })
      }
      return NextResponse.json(lesson)
    }

    if (moduleId) {
      const lessons = await db.lesson.findMany({
        where: { moduleId },
        orderBy: { order: 'asc' },
      })
      return NextResponse.json(lessons)
    }

    return NextResponse.json(
      { error: 'moduleId or lessonId query parameter is required' },
      { status: 400 }
    )
  } catch (error) {
    console.error('Error fetching lessons:', error)
    return NextResponse.json({ error: 'Failed to fetch lessons' }, { status: 500 })
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
      return NextResponse.json({ error: 'Only admins and instructors can manage lessons' }, { status: 403 })
    }

    if (action === 'create') {
      const { moduleId, title, content, videoUrl, audioUrl, codeSnippet, pdfUrl, presentationUrl, embedCode, externalUrl, resourceUrl, duration } = body

      if (!moduleId || !title) {
        return NextResponse.json({ error: 'moduleId and title are required' }, { status: 400 })
      }

      // Verify module exists and instructor owns the course
      const moduleData = await db.module.findUnique({
        where: { id: moduleId },
        include: { course: { select: { id: true, instructor: true } } },
      })
      if (!moduleData) {
        return NextResponse.json({ error: 'Module not found' }, { status: 404 })
      }

      if (user.role === 'instructor' && moduleData.course.instructor !== (user.name || 'Unknown Instructor')) {
        return NextResponse.json({ error: 'You can only manage your own courses' }, { status: 403 })
      }

      // Get next order number
      const existingLessons = await db.lesson.findMany({
        where: { moduleId },
        orderBy: { order: 'desc' },
        take: 1,
      })
      const nextOrder = existingLessons.length > 0 ? existingLessons[0].order + 1 : 0

      // Determine lesson type based on content
      let lessonType = 'text'
      if (videoUrl) lessonType = 'video'
      else if (audioUrl) lessonType = 'audio'
      else if (codeSnippet) lessonType = 'code'
      else if (presentationUrl) lessonType = 'presentation'
      else if (embedCode) lessonType = 'embed'
      else if (externalUrl) lessonType = 'external'
      else if (resourceUrl) lessonType = 'resource'

      const lesson = await db.lesson.create({
        data: {
          moduleId,
          title,
          content: content || '',
          type: lessonType,
          videoUrl: videoUrl || null,
          audioUrl: audioUrl || null,
          codeSnippet: codeSnippet || null,
          pdfUrl: pdfUrl || null,
          presentationUrl: presentationUrl || null,
          embedCode: embedCode || null,
          externalUrl: externalUrl || null,
          resourceUrl: resourceUrl || null,
          duration: duration || '10 min',
          order: nextOrder,
        },
      })

      return NextResponse.json(lesson, { status: 201 })
    }

    if (action === 'update') {
      const { lessonId, title, content, videoUrl, audioUrl, codeSnippet, pdfUrl, presentationUrl, embedCode, externalUrl, resourceUrl, duration, order } = body

      if (!lessonId) {
        return NextResponse.json({ error: 'lessonId is required' }, { status: 400 })
      }

      const updateData: Record<string, unknown> = {}
      if (title !== undefined) updateData.title = title
      if (content !== undefined) updateData.content = content
      if (videoUrl !== undefined) updateData.videoUrl = videoUrl
      if (audioUrl !== undefined) updateData.audioUrl = audioUrl
      if (codeSnippet !== undefined) updateData.codeSnippet = codeSnippet
      if (pdfUrl !== undefined) updateData.pdfUrl = pdfUrl
      if (presentationUrl !== undefined) updateData.presentationUrl = presentationUrl
      if (embedCode !== undefined) updateData.embedCode = embedCode
      if (externalUrl !== undefined) updateData.externalUrl = externalUrl
      if (resourceUrl !== undefined) updateData.resourceUrl = resourceUrl
      if (duration !== undefined) updateData.duration = duration
      if (order !== undefined) updateData.order = order

      // Determine lesson type based on content
      if (videoUrl !== undefined || audioUrl !== undefined || codeSnippet !== undefined || presentationUrl !== undefined || embedCode !== undefined) {
        if (videoUrl) updateData.type = 'video'
        else if (audioUrl) updateData.type = 'audio'
        else if (codeSnippet) updateData.type = 'code'
        else if (presentationUrl) updateData.type = 'presentation'
        else if (embedCode) updateData.type = 'embed'
        else updateData.type = 'text'
      }

      const lesson = await db.lesson.update({
        where: { id: lessonId },
        data: updateData,
      })

      return NextResponse.json(lesson)
    }

    if (action === 'delete') {
      const { lessonId } = body

      if (!lessonId) {
        return NextResponse.json({ error: 'lessonId is required' }, { status: 400 })
      }

      await db.lesson.delete({ where: { id: lessonId } })
      return NextResponse.json({ success: true })
    }

    return NextResponse.json(
      { error: 'Invalid action. Use "create", "update", or "delete"' },
      { status: 400 }
    )
  } catch (error) {
    console.error('Error managing lessons:', error)
    return NextResponse.json({ error: 'Failed to manage lessons' }, { status: 500 })
  }
}
