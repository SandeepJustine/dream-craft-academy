import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const courseId = searchParams.get('courseId')

    if (!courseId) {
      return NextResponse.json(
        { error: 'courseId query parameter is required' },
        { status: 400 }
      )
    }

    const forum = await db.forum.findUnique({
      where: { courseId },
      include: {
        posts: {
          where: { parentId: null },
          include: {
            user: {
              select: { id: true, name: true, email: true, avatar: true, role: true },
            },
            replies: {
              include: {
                user: {
                  select: { id: true, name: true, email: true, avatar: true, role: true },
                },
              },
              orderBy: { createdAt: 'asc' },
            },
          },
          orderBy: [
            { isPinned: 'desc' },
            { createdAt: 'desc' },
          ],
        },
      },
    })

    if (!forum) {
      return NextResponse.json({ error: 'Forum not found for this course' }, { status: 404 })
    }

    return NextResponse.json(forum)
  } catch (error) {
    console.error('Error fetching forum:', error)
    return NextResponse.json({ error: 'Failed to fetch forum' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action } = body

    if (action === 'create') {
      // Create a forum for a course (admin/instructor only)
      const { courseId, title, description, userId } = body

      if (!courseId || !title || !userId) {
        return NextResponse.json(
          { error: 'courseId, title, and userId are required' },
          { status: 400 }
        )
      }

      // Verify user is admin or instructor
      const user = await db.user.findUnique({ where: { id: userId } })
      if (!user || (user.role !== 'admin' && user.role !== 'instructor')) {
        return NextResponse.json(
          { error: 'Only admins or instructors can create forums' },
          { status: 403 }
        )
      }

      // Check if forum already exists for this course
      const existingForum = await db.forum.findUnique({ where: { courseId } })
      if (existingForum) {
        return NextResponse.json(
          { error: 'Forum already exists for this course', forum: existingForum },
          { status: 409 }
        )
      }

      const forum = await db.forum.create({
        data: {
          courseId,
          title,
          description: description || null,
        },
      })

      return NextResponse.json(forum, { status: 201 })
    }

    if (action === 'post') {
      // Create a new forum post (any enrolled user)
      const { forumId, userId, title, content, parentId } = body

      if (!forumId || !userId || !content) {
        return NextResponse.json(
          { error: 'forumId, userId, and content are required' },
          { status: 400 }
        )
      }

      // Verify forum exists
      const forum = await db.forum.findUnique({
        where: { id: forumId },
        include: { course: { include: { enrollments: true } } },
      })
      if (!forum) {
        return NextResponse.json({ error: 'Forum not found' }, { status: 404 })
      }

      // Check if user is enrolled or is admin/instructor
      const user = await db.user.findUnique({ where: { id: userId } })
      if (!user) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 })
      }

      const isAdminOrInstructor = user.role === 'admin' || user.role === 'instructor'
      const isEnrolled = forum.course.enrollments.some((e) => e.userId === userId)

      if (!isAdminOrInstructor && !isEnrolled) {
        return NextResponse.json(
          { error: 'Only enrolled users can post in this forum' },
          { status: 403 }
        )
      }

      // If parentId provided, verify parent post exists
      if (parentId) {
        const parentPost = await db.forumPost.findUnique({ where: { id: parentId } })
        if (!parentPost || parentPost.forumId !== forumId) {
          return NextResponse.json(
            { error: 'Parent post not found in this forum' },
            { status: 404 }
          )
        }
      }

      const post = await db.forumPost.create({
        data: {
          forumId,
          userId,
          title: title || null,
          content,
          parentId: parentId || null,
        },
        include: {
          user: {
            select: { id: true, name: true, email: true, avatar: true, role: true },
          },
        },
      })

      return NextResponse.json(post, { status: 201 })
    }

    if (action === 'moderate') {
      // Toggle isModerated on a post (admin/instructor only)
      const { postId, userId } = body

      if (!postId || !userId) {
        return NextResponse.json(
          { error: 'postId and userId are required' },
          { status: 400 }
        )
      }

      // Verify user is admin or instructor
      const user = await db.user.findUnique({ where: { id: userId } })
      if (!user || (user.role !== 'admin' && user.role !== 'instructor')) {
        return NextResponse.json(
          { error: 'Only admins or instructors can moderate posts' },
          { status: 403 }
        )
      }

      const existingPost = await db.forumPost.findUnique({ where: { id: postId } })
      if (!existingPost) {
        return NextResponse.json({ error: 'Post not found' }, { status: 404 })
      }

      const updatedPost = await db.forumPost.update({
        where: { id: postId },
        data: { isModerated: !existingPost.isModerated },
        include: {
          user: {
            select: { id: true, name: true, email: true, avatar: true, role: true },
          },
        },
      })

      return NextResponse.json(updatedPost)
    }

    if (action === 'pin') {
      // Toggle isPinned on a post (admin/instructor only)
      const { postId, userId } = body

      if (!postId || !userId) {
        return NextResponse.json(
          { error: 'postId and userId are required' },
          { status: 400 }
        )
      }

      // Verify user is admin or instructor
      const user = await db.user.findUnique({ where: { id: userId } })
      if (!user || (user.role !== 'admin' && user.role !== 'instructor')) {
        return NextResponse.json(
          { error: 'Only admins or instructors can pin posts' },
          { status: 403 }
        )
      }

      const existingPost = await db.forumPost.findUnique({ where: { id: postId } })
      if (!existingPost) {
        return NextResponse.json({ error: 'Post not found' }, { status: 404 })
      }

      const updatedPost = await db.forumPost.update({
        where: { id: postId },
        data: { isPinned: !existingPost.isPinned },
        include: {
          user: {
            select: { id: true, name: true, email: true, avatar: true, role: true },
          },
        },
      })

      return NextResponse.json(updatedPost)
    }

    return NextResponse.json(
      { error: 'Invalid action. Use "create", "post", "moderate", or "pin"' },
      { status: 400 }
    )
  } catch (error) {
    console.error('Error with forum operation:', error)
    return NextResponse.json({ error: 'Failed to process forum operation' }, { status: 500 })
  }
}
