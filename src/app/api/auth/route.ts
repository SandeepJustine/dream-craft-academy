import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { randomUUID } from 'crypto'

// Simple hash function for demo purposes (not production-grade)
function simpleHash(password: string): string {
  const reversed = password.split('').reverse().join('')
  return Buffer.from(reversed + '::dreamcraft-salt').toString('base64')
}

function verifyPassword(password: string, hashed: string): boolean {
  return simpleHash(password) === hashed
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action } = body

    if (action === 'register') {
      const { email, name, password } = body

      if (!email || !name || !password) {
        return NextResponse.json(
          { error: 'Email, name, and password are required' },
          { status: 400 }
        )
      }

      // Check if user already exists
      const existing = await db.user.findUnique({ where: { email } })
      if (existing) {
        return NextResponse.json(
          { error: 'An account with this email already exists' },
          { status: 409 }
        )
      }

      const hashedPassword = simpleHash(password)

      const user = await db.user.create({
        data: {
          email,
          name,
          password: hashedPassword,
          role: 'student',
        },
      })

      // Return user without password
      const { password: _, ...userWithoutPassword } = user
      return NextResponse.json({ user: userWithoutPassword, message: 'Registration successful' }, { status: 201 })
    }

    if (action === 'update') {
      const { userId, name, bio, phone, country, avatar } = body

      if (!userId) {
        return NextResponse.json(
          { error: 'userId is required' },
          { status: 400 }
        )
      }

      const updateData: Record<string, string> = {}
      if (name !== undefined) updateData.name = name
      if (bio !== undefined) updateData.bio = bio
      if (phone !== undefined) updateData.phone = phone
      if (country !== undefined) updateData.country = country
      if (avatar !== undefined) updateData.avatar = avatar

      if (Object.keys(updateData).length === 0) {
        return NextResponse.json(
          { error: 'At least one field to update is required' },
          { status: 400 }
        )
      }

      const user = await db.user.update({
        where: { id: userId },
        data: updateData,
      })

      const { password: _, ...userWithoutPassword } = user
      return NextResponse.json({ user: userWithoutPassword, message: 'Profile updated successfully' })
    }

    if (action === 'login') {
      const { email, password } = body

      if (!email || !password) {
        return NextResponse.json(
          { error: 'Email and password are required' },
          { status: 400 }
        )
      }

      const user = await db.user.findUnique({ where: { email } })

      if (!user || !user.password) {
        return NextResponse.json(
          { error: 'Invalid email or password' },
          { status: 401 }
        )
      }

      if (!verifyPassword(password, user.password)) {
        return NextResponse.json(
          { error: 'Invalid email or password' },
          { status: 401 }
        )
      }

      // Return user without password
      const { password: _, ...userWithoutPassword } = user
      return NextResponse.json({ user: userWithoutPassword, message: 'Login successful' })
    }

    if (action === 'forgot-password') {
      const { email } = body

      if (!email) {
        return NextResponse.json(
          { error: 'Email is required' },
          { status: 400 }
        )
      }

      // Check if user exists
      const user = await db.user.findUnique({ where: { email } })
      if (!user) {
        // For security, don't reveal whether user exists, but for demo we return a message
        return NextResponse.json(
          { message: 'If an account with that email exists, a reset token has been generated.' },
          { status: 200 }
        )
      }

      // Generate token and set 30 min expiry
      const token = randomUUID()
      const expiresAt = new Date(Date.now() + 30 * 60 * 1000)

      await db.passwordReset.create({
        data: {
          email,
          token,
          expiresAt,
        },
      })

      // In production, this would send an email. For demo, return the token.
      return NextResponse.json({
        message: 'Reset token generated successfully.',
        token,
        email,
      }, { status: 200 })
    }

    if (action === 'reset-password') {
      const { token, newPassword, confirmPassword } = body

      if (!token || !newPassword || !confirmPassword) {
        return NextResponse.json(
          { error: 'Token, new password, and confirm password are required' },
          { status: 400 }
        )
      }

      if (newPassword !== confirmPassword) {
        return NextResponse.json(
          { error: 'Passwords do not match' },
          { status: 400 }
        )
      }

      if (newPassword.length < 6) {
        return NextResponse.json(
          { error: 'Password must be at least 6 characters' },
          { status: 400 }
        )
      }

      // Find the reset token
      const resetToken = await db.passwordReset.findUnique({
        where: { token },
      })

      if (!resetToken) {
        return NextResponse.json(
          { error: 'Invalid reset token' },
          { status: 400 }
        )
      }

      // Check if token has expired
      if (new Date() > resetToken.expiresAt) {
        return NextResponse.json(
          { error: 'Reset token has expired. Please request a new one.' },
          { status: 400 }
        )
      }

      // Check if token has been used
      if (resetToken.used) {
        return NextResponse.json(
          { error: 'Reset token has already been used.' },
          { status: 400 }
        )
      }

      // Find user by email
      const user = await db.user.findUnique({
        where: { email: resetToken.email },
      })

      if (!user) {
        return NextResponse.json(
          { error: 'User not found' },
          { status: 404 }
        )
      }

      // Update user password
      const hashedPassword = simpleHash(newPassword)
      await db.user.update({
        where: { id: user.id },
        data: { password: hashedPassword },
      })

      // Mark token as used
      await db.passwordReset.update({
        where: { id: resetToken.id },
        data: { used: true },
      })

      return NextResponse.json({ message: 'Password reset successfully' }, { status: 200 })
    }

    if (action === 'change-password') {
      const { userId, currentPassword, newPassword } = body

      if (!userId || !currentPassword || !newPassword) {
        return NextResponse.json(
          { error: 'User ID, current password, and new password are required' },
          { status: 400 }
        )
      }

      if (newPassword.length < 6) {
        return NextResponse.json(
          { error: 'New password must be at least 6 characters' },
          { status: 400 }
        )
      }

      // Find user
      const user = await db.user.findUnique({
        where: { id: userId },
      })

      if (!user || !user.password) {
        return NextResponse.json(
          { error: 'User not found' },
          { status: 404 }
        )
      }

      // Verify current password
      if (!verifyPassword(currentPassword, user.password)) {
        return NextResponse.json(
          { error: 'Current password is incorrect' },
          { status: 401 }
        )
      }

      // Update password
      const hashedPassword = simpleHash(newPassword)
      await db.user.update({
        where: { id: userId },
        data: { password: hashedPassword },
      })

      return NextResponse.json({ message: 'Password changed successfully' }, { status: 200 })
    }

    // Default: legacy behavior - upsert by email only (no password)
    const { email } = body
    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 })
    }

    const user = await db.user.upsert({
      where: { email },
      update: {},
      create: {
        email,
        name: email.split('@')[0],
        role: 'student',
      },
    })

    const { password: _, ...userWithoutPassword } = user
    return NextResponse.json(userWithoutPassword)
  } catch (error) {
    console.error('Error with auth:', error)
    return NextResponse.json({ error: 'Authentication failed' }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const userId = searchParams.get('userId')
    const email = searchParams.get('email')

    if (userId) {
      const user = await db.user.findUnique({
        where: { id: userId },
        include: {
          enrollments: {
            select: { id: true, courseId: true, status: true, progress: true },
          },
          _count: {
            select: { certificates: true },
          },
        },
      })

      if (!user) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 })
      }

      const { password: _, ...userWithoutPassword } = user
      return NextResponse.json(userWithoutPassword)
    }

    if (email) {
      const user = await db.user.findUnique({
        where: { email },
      })

      if (!user) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 })
      }

      const { password: _, ...userWithoutPassword } = user
      return NextResponse.json(userWithoutPassword)
    }

    return NextResponse.json(
      { error: 'userId or email query parameter is required' },
      { status: 400 }
    )
  } catch (error) {
    console.error('Error fetching user:', error)
    return NextResponse.json({ error: 'Failed to fetch user' }, { status: 500 })
  }
}
