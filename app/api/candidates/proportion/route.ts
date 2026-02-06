import { withDatabase } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const proportional = searchParams.get('proportional')
    const party = searchParams.get('party')
    const filterByParty = party && party !== '全て政党'

    const politicians = await withDatabase(async (db) => {
      const query = filterByParty
        ? 'SELECT * FROM representatives2026 WHERE proportional = ? AND party = ? ORDER BY `rank` ASC'
        : 'SELECT * FROM representatives2026 WHERE proportional = ? ORDER BY `rank` ASC'
      const params = filterByParty ? [proportional, party] : [proportional]
      const [rows] = await db.query(query, params)
      return rows
    })

    return NextResponse.json({ politicians })
  } catch (error) {
    console.error('Error fetching politicians:', error)
    return NextResponse.json(
      { error: 'サーバーエラーが発生しました。' }, { status: 500 }
    )
  }
}
