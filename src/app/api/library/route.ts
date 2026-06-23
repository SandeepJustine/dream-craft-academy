import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
// Library resource API route

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const courseId = searchParams.get('courseId')
    const type = searchParams.get('type')

    const where: Record<string, unknown> = {}
    if (courseId) where.courseId = courseId
    if (type) where.type = type

    const resources = await db.libraryResource.findMany({
      where,
      include: {
        course: {
          select: { id: true, title: true, category: true },
        },
        uploader: {
          select: { id: true, name: true, email: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(resources)
  } catch (error) {
    console.error('Error fetching library resources:', error)
    return NextResponse.json({ error: 'Failed to fetch library resources' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action } = body

    if (action === 'create') {
      const { title, description, type, url, coverImage, author, courseId, uploadedBy } = body

      if (!title || !type || !uploadedBy) {
        return NextResponse.json(
          { error: 'title, type, and uploadedBy are required' },
          { status: 400 }
        )
      }

      // Verify uploader exists
      const uploader = await db.user.findUnique({ where: { id: uploadedBy } })
      if (!uploader) {
        return NextResponse.json({ error: 'Uploader user not found' }, { status: 404 })
      }

      // If courseId provided, verify course exists
      if (courseId) {
        const course = await db.course.findUnique({ where: { id: courseId } })
        if (!course) {
          return NextResponse.json({ error: 'Course not found' }, { status: 404 })
        }
      }

      const resource = await db.libraryResource.create({
        data: {
          title,
          description: description || null,
          type,
          url: url || null,
          coverImage: coverImage || null,
          author: author || null,
          courseId: courseId || null,
          uploadedBy,
        },
        include: {
          course: {
            select: { id: true, title: true, category: true },
          },
          uploader: {
            select: { id: true, name: true, email: true },
          },
        },
      })

      return NextResponse.json(resource, { status: 201 })
    }

    if (action === 'update') {
      const { id, title, description, type, url, coverImage, author, courseId } = body

      if (!id) {
        return NextResponse.json(
          { error: 'id is required' },
          { status: 400 }
        )
      }

      const existingResource = await db.libraryResource.findUnique({ where: { id } })
      if (!existingResource) {
        return NextResponse.json({ error: 'Library resource not found' }, { status: 404 })
      }

      const updateData: Record<string, unknown> = {}
      if (title !== undefined) updateData.title = title
      if (description !== undefined) updateData.description = description
      if (type !== undefined) updateData.type = type
      if (url !== undefined) updateData.url = url
      if (coverImage !== undefined) updateData.coverImage = coverImage
      if (author !== undefined) updateData.author = author
      if (courseId !== undefined) updateData.courseId = courseId

      const updatedResource = await db.libraryResource.update({
        where: { id },
        data: updateData,
        include: {
          course: {
            select: { id: true, title: true, category: true },
          },
          uploader: {
            select: { id: true, name: true, email: true },
          },
        },
      })

      return NextResponse.json(updatedResource)
    }

    if (action === 'delete') {
      const { id } = body

      if (!id) {
        return NextResponse.json(
          { error: 'id is required' },
          { status: 400 }
        )
      }

      const existingResource = await db.libraryResource.findUnique({ where: { id } })
      if (!existingResource) {
        return NextResponse.json({ error: 'Library resource not found' }, { status: 404 })
      }

      await db.libraryResource.delete({ where: { id } })

      return NextResponse.json({ message: 'Library resource deleted successfully' })
    }

    return NextResponse.json(
      { error: 'Invalid action. Use "create", "update", or "delete"' },
      { status: 400 }
    )
  } catch (error) {
    console.error('Error with library operation:', error)
    return NextResponse.json({ error: 'Failed to process library operation' }, { status: 500 })
  }
}
