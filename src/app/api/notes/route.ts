import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const userId = searchParams.get('userId')
    const lessonId = searchParams.get('lessonId')

    if (!userId || !lessonId) {
      return NextResponse.json(
        { error: 'userId and lessonId are required' },
        { status: 400 }
      )
    }

    const note = await db.note.findUnique({
      where: {
        userId_lessonId: { userId, lessonId },
      },
    })

    return NextResponse.json(note || { userId, lessonId, content: '' })
  } catch (error) {
    console.error('Error fetching notes:', error)
    return NextResponse.json({ error: 'Failed to fetch notes' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, lessonId, content } = body

    if (!userId || !lessonId) {
      return NextResponse.json(
        { error: 'userId and lessonId are required' },
        { status: 400 }
      )
    }

    // Upsert note
    const note = await db.note.upsert({
      where: {
        userId_lessonId: { userId, lessonId },
      },
      update: {
        content: content || '',
      },
      create: {
        userId,
        lessonId,
        content: content || '',
      },
    })

    return NextResponse.json(note)
  } catch (error) {
    console.error('Error saving notes:', error)
    return NextResponse.json({ error: 'Failed to save notes' }, { status: 500 })
  }
}
