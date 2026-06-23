import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const range = searchParams.get('range') || '30d'

    // Calculate date range
    const now = new Date()
    let startDate = new Date()
    switch (range) {
      case '7d':
        startDate.setDate(now.getDate() - 7)
        break
      case '30d':
        startDate.setDate(now.getDate() - 30)
        break
      case '90d':
        startDate.setDate(now.getDate() - 90)
        break
      case '12m':
        startDate.setMonth(now.getMonth() - 12)
        break
      default:
        startDate.setDate(now.getDate() - 30)
    }

    // Total page views in range
    const totalPageViews = await db.pageView.count({
      where: { createdAt: { gte: startDate } },
    })

    // Unique visitors in range
    const uniqueVisitorsResult = await db.pageView.findMany({
      where: { createdAt: { gte: startDate } },
      select: { visitorId: true },
      distinct: ['visitorId'],
    })
    const uniqueVisitors = uniqueVisitorsResult.length

    // Page views by day (for chart)
    const pageViewsInRange = await db.pageView.findMany({
      where: { createdAt: { gte: startDate } },
      select: { createdAt: true },
      orderBy: { createdAt: 'asc' },
    })

    // Group by day
    const viewsByDay: Record<string, number> = {}
    pageViewsInRange.forEach((pv) => {
      const day = new Date(pv.createdAt).toISOString().slice(0, 10)
      viewsByDay[day] = (viewsByDay[day] || 0) + 1
    })

    // Unique visitors by day
    const visitorsByDayData = await db.pageView.findMany({
      where: { createdAt: { gte: startDate } },
      select: { visitorId: true, createdAt: true },
      orderBy: { createdAt: 'asc' },
    })

    const visitorsByDayMap: Record<string, Set<string>> = {}
    visitorsByDayData.forEach((pv) => {
      const day = new Date(pv.createdAt).toISOString().slice(0, 10)
      if (!visitorsByDayMap[day]) visitorsByDayMap[day] = new Set()
      visitorsByDayMap[day].add(pv.visitorId)
    })

    const visitorsByDay: Record<string, number> = {}
    Object.entries(visitorsByDayMap).forEach(([day, visitors]) => {
      visitorsByDay[day] = visitors.size
    })

    // Fill in missing days in the range
    const allDays: string[] = []
    const current = new Date(startDate)
    while (current <= now) {
      allDays.push(current.toISOString().slice(0, 10))
      current.setDate(current.getDate() + 1)
    }

    const dailyViews = allDays.map((day) => ({
      date: day,
      views: viewsByDay[day] || 0,
      visitors: visitorsByDay[day] || 0,
    }))

    // Top pages
    const topPagesData = await db.pageView.groupBy({
      by: ['page'],
      _count: { page: true },
      where: { createdAt: { gte: startDate } },
      orderBy: { _count: { page: 'desc' } },
      take: 10,
    })

    const topPages = topPagesData.map((tp) => ({
      page: tp.page,
      views: tp._count.page,
    }))

    // Unique visitors per page
    const topPagesWithVisitors = await Promise.all(
      topPages.map(async (tp) => {
        const uniqueVisitorsForPage = await db.pageView.findMany({
          where: { page: tp.page, createdAt: { gte: startDate } },
          select: { visitorId: true },
          distinct: ['visitorId'],
        })
        return { ...tp, uniqueVisitors: uniqueVisitorsForPage.length }
      })
    )

    // Referrer sources
    const referrerData = await db.pageView.groupBy({
      by: ['referrer'],
      _count: { referrer: true },
      where: { createdAt: { gte: startDate }, referrer: { not: null } },
      orderBy: { _count: { referrer: 'desc' } },
      take: 10,
    })

    const referrers = referrerData.map((r) => ({
      referrer: r.referrer || 'Direct',
      count: r._count.referrer,
    }))

    // Today's stats
    const todayStart = new Date()
    todayStart.setHours(0, 0, 0, 0)

    const [todayViews, todayVisitorsResult] = await Promise.all([
      db.pageView.count({ where: { createdAt: { gte: todayStart } } }),
      db.pageView.findMany({
        where: { createdAt: { gte: todayStart } },
        select: { visitorId: true },
        distinct: ['visitorId'],
      }),
    ])

    // Yesterday's stats for comparison
    const yesterdayStart = new Date()
    yesterdayStart.setDate(yesterdayStart.getDate() - 1)
    yesterdayStart.setHours(0, 0, 0, 0)
    const yesterdayEnd = new Date()
    yesterdayEnd.setHours(0, 0, 0, 0)

    const [yesterdayViews, yesterdayVisitorsResult] = await Promise.all([
      db.pageView.count({ where: { createdAt: { gte: yesterdayStart, lt: yesterdayEnd } } }),
      db.pageView.findMany({
        where: { createdAt: { gte: yesterdayStart, lt: yesterdayEnd } },
        select: { visitorId: true },
        distinct: ['visitorId'],
      }),
    ])

    // Average views per visitor
    const avgViewsPerVisitor = uniqueVisitors > 0 ? (totalPageViews / uniqueVisitors).toFixed(1) : '0'

    // Bounce rate (visitors with only 1 page view)
    const allVisitorViewCounts = await db.pageView.groupBy({
      by: ['visitorId'],
      _count: { visitorId: true },
      where: { createdAt: { gte: startDate } },
    })
    const singlePageVisitors = allVisitorViewCounts.filter((v) => v._count.visitorId === 1).length
    const bounceRate = uniqueVisitors > 0 ? Math.round((singlePageVisitors / uniqueVisitors) * 100) : 0

    return NextResponse.json({
      totalPageViews,
      uniqueVisitors,
      avgViewsPerVisitor,
      bounceRate,
      todayViews,
      todayVisitors: todayVisitorsResult.length,
      yesterdayViews,
      yesterdayVisitors: yesterdayVisitorsResult.length,
      dailyViews,
      topPages: topPagesWithVisitors,
      referrers,
    })
  } catch (error) {
    console.error('Error fetching visitor analytics:', error)
    return NextResponse.json({ error: 'Failed to fetch visitor analytics' }, { status: 500 })
  }
}
