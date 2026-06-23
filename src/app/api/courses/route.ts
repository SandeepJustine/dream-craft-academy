import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, userId } = body

    // Verify user exists and get role
    if (!userId) {
      return NextResponse.json({ error: 'userId is required' }, { status: 400 })
    }

    const user = await db.user.findUnique({ where: { id: userId } })
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    if (user.role !== 'admin' && user.role !== 'instructor') {
      return NextResponse.json({ error: 'Only admins and instructors can manage courses' }, { status: 403 })
    }

    if (action === 'create') {
      const { title, description, category, level, duration, image, videoUrl, featured, certificateEnabled, passingScore, instructorName } = body

      if (!title || !description || !category || !duration) {
        return NextResponse.json(
          { error: 'title, description, category, and duration are required' },
          { status: 400 }
        )
      }

      // Use the provided instructorName or fall back to the user's name
      const instructor = instructorName || user.name || 'Unknown Instructor'

      const course = await db.course.create({
        data: {
          title,
          description,
          category,
          level: level || 'Beginner',
          duration,
          instructor,
          image: image || null,
          videoUrl: videoUrl || null,
          featured: featured ?? false,
          certificateEnabled: certificateEnabled ?? true,
          passingScore: passingScore ?? 70,
        },
      })

      return NextResponse.json({ course, message: 'Course created successfully' }, { status: 201 })
    }

    if (action === 'update') {
      const { id, title, description, category, level, duration, image, videoUrl, featured, certificateEnabled, passingScore, instructorName } = body

      if (!id) {
        return NextResponse.json({ error: 'Course id is required for update' }, { status: 400 })
      }

      const existingCourse = await db.course.findUnique({ where: { id } })
      if (!existingCourse) {
        return NextResponse.json({ error: 'Course not found' }, { status: 404 })
      }

      // Instructors can only update their own courses
      if (user.role === 'instructor' && existingCourse.instructor !== (user.name || 'Unknown Instructor')) {
        return NextResponse.json({ error: 'You can only update your own courses' }, { status: 403 })
      }

      const updateData: Record<string, unknown> = {}
      if (title !== undefined) updateData.title = title
      if (description !== undefined) updateData.description = description
      if (category !== undefined) updateData.category = category
      if (level !== undefined) updateData.level = level
      if (duration !== undefined) updateData.duration = duration
      if (image !== undefined) updateData.image = image
      if (videoUrl !== undefined) updateData.videoUrl = videoUrl
      if (featured !== undefined) updateData.featured = featured
      if (certificateEnabled !== undefined) updateData.certificateEnabled = certificateEnabled
      if (passingScore !== undefined) updateData.passingScore = passingScore
      if (instructorName !== undefined) updateData.instructor = instructorName

      const updatedCourse = await db.course.update({
        where: { id },
        data: updateData,
      })

      return NextResponse.json({ course: updatedCourse, message: 'Course updated successfully' })
    }

    if (action === 'delete') {
      const { id } = body

      if (!id) {
        return NextResponse.json({ error: 'Course id is required for delete' }, { status: 400 })
      }

      const existingCourse = await db.course.findUnique({ where: { id } })
      if (!existingCourse) {
        return NextResponse.json({ error: 'Course not found' }, { status: 404 })
      }

      // Admin can delete any course; instructors can only delete their own
      if (user.role === 'instructor' && existingCourse.instructor !== (user.name || 'Unknown Instructor')) {
        return NextResponse.json({ error: 'You can only delete your own courses' }, { status: 403 })
      }

      await db.course.delete({ where: { id } })

      return NextResponse.json({ message: 'Course deleted successfully' })
    }

    return NextResponse.json({ error: 'Invalid action. Use "create", "update", or "delete"' }, { status: 400 })
  } catch (error) {
    console.error('Error managing courses:', error)
    return NextResponse.json({ error: 'Failed to manage courses' }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const category = searchParams.get('category')
    const level = searchParams.get('level')
    const search = searchParams.get('search')

    const where: Record<string, unknown> = {}

    if (category && category !== 'All') {
      where.category = category
    }
    if (level && level !== 'All') {
      where.level = level
    }
    if (search) {
      where.OR = [
        { title: { contains: search } },
        { description: { contains: search } },
        { instructor: { contains: search } },
      ]
    }

    const courses = await db.course.findMany({
      where,
      include: {
        modules: {
          include: {
            _count: { select: { lessons: true } },
          },
        },
        _count: { select: { enrollments: true } },
      },
      orderBy: [
        { featured: 'desc' },
        { rating: 'desc' },
      ],
    })

    const formatted = courses.map((course) => ({
      id: course.id,
      title: course.title,
      description: course.description,
      category: course.category,
      level: course.level,
      duration: course.duration,
      image: course.image,
      instructor: course.instructor,
      featured: course.featured,
      rating: course.rating,
      enrolled: course._count.enrollments,
      modulesCount: course.modules.length,
      lessonsCount: course.modules.reduce((sum, m) => sum + m._count.lessons, 0),
    }))

    return NextResponse.json(formatted)
  } catch (error) {
    console.error('Error fetching courses:', error)
    return NextResponse.json({ error: 'Failed to fetch courses' }, { status: 500 })
  }
}
