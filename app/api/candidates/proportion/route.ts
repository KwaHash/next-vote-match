import { withDatabase } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const proportional = searchParams.get('proportional')

    const politicians = await withDatabase(async (db) => {
      const query = 'SELECT * FROM representatives2026 WHERE proportional = ? ORDER BY rank ASC'
      const [rows] = await db.query(query, [proportional])
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
