import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const role = searchParams.get('role')
    const search = searchParams.get('search')

    const where: Record<string, unknown> = {}
    if (role) where.role = role
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { email: { contains: search } },
      ]
    }

    const users = await db.user.findMany({
      where,
      select: {
        id: true,
        email: true,
        name: true,
        avatar: true,
        role: true,
        bio: true,
        phone: true,
        country: true,
        createdAt: true,
        enrolledAt: true,
        _count: {
          select: {
            enrollments: true,
            certificates: true,
            quizAttempts: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    const [totalStudents, totalInstructors, totalAdmins] = await Promise.all([
      db.user.count({ where: { role: 'student' } }),
      db.user.count({ where: { role: 'instructor' } }),
      db.user.count({ where: { role: 'admin' } }),
    ])

    return NextResponse.json({
      users,
      counts: { students: totalStudents, instructors: totalInstructors, admins: totalAdmins },
    })
  } catch (error) {
    console.error('Error fetching users:', error)
    return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action } = body

    if (action === 'update-role') {
      const { userId, role } = body
      if (!userId || !role) {
        return NextResponse.json({ error: 'userId and role are required' }, { status: 400 })
      }
      if (!['student', 'instructor', 'admin'].includes(role)) {
        return NextResponse.json({ error: 'Invalid role' }, { status: 400 })
      }

      const user = await db.user.update({
        where: { id: userId },
        data: { role },
        select: { id: true, email: true, name: true, role: true },
      })

      return NextResponse.json({ user, message: 'Role updated successfully' })
    }

    if (action === 'delete') {
      const { userId } = body
      if (!userId) {
        return NextResponse.json({ error: 'userId is required' }, { status: 400 })
      }

      await db.user.delete({ where: { id: userId } })
      return NextResponse.json({ message: 'User deleted successfully' })
    }

    if (action === 'create') {
      const { email, name, password, role } = body
      if (!email || !name || !password) {
        return NextResponse.json({ error: 'Email, name, and password are required' }, { status: 400 })
      }

      const existing = await db.user.findUnique({ where: { email } })
      if (existing) {
        return NextResponse.json({ error: 'User with this email already exists' }, { status: 409 })
      }

      const reversed = password.split('').reverse().join('')
      const hashedPassword = Buffer.from(reversed + '::dreamcraft-salt').toString('base64')

      const user = await db.user.create({
        data: {
          email,
          name,
          password: hashedPassword,
          role: role || 'student',
        },
      })

      const { password: _, ...userWithoutPassword } = user
      return NextResponse.json({ user: userWithoutPassword, message: 'User created successfully' }, { status: 201 })
    }

    if (action === 'reset-password') {
      const { userId, newPassword } = body
      if (!userId || !newPassword) {
        return NextResponse.json({ error: 'userId and newPassword are required' }, { status: 400 })
      }

      const user = await db.user.findUnique({ where: { id: userId } })
      if (!user) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 })
      }

      const reversed = newPassword.split('').reverse().join('')
      const hashedPassword = Buffer.from(reversed + '::dreamcraft-salt').toString('base64')

      await db.user.update({
        where: { id: userId },
        data: { password: hashedPassword },
      })

      return NextResponse.json({ message: 'Password reset successfully' })
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  } catch (error) {
    console.error('Error managing users:', error)
    return NextResponse.json({ error: 'Failed to manage users' }, { status: 500 })
  }
}
