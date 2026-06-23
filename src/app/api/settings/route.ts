import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const key = searchParams.get('key')

    if (key) {
      // Fetch a specific setting by key
      const setting = await db.siteSetting.findUnique({
        where: { key },
      })

      if (!setting) {
        return NextResponse.json({ error: 'Setting not found' }, { status: 404 })
      }

      return NextResponse.json(setting)
    }

    // Fetch all settings
    const settings = await db.siteSetting.findMany({
      orderBy: { key: 'asc' },
    })

    return NextResponse.json(settings)
  } catch (error) {
    console.error('Error fetching settings:', error)
    return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { key, value } = body

    if (!key || value === undefined) {
      return NextResponse.json(
        { error: 'key and value are required' },
        { status: 400 }
      )
    }

    // Upsert the setting
    const setting = await db.siteSetting.upsert({
      where: { key },
      update: { value },
      create: { key, value },
    })

    return NextResponse.json(setting)
  } catch (error) {
    console.error('Error upserting setting:', error)
    return NextResponse.json({ error: 'Failed to upsert setting' }, { status: 500 })
  }
}
