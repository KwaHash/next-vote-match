import { withDatabase } from '@/lib/db'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const politicians = await withDatabase(async (db) => {
      const [rows] = await db.query('SELECT * FROM politicians')
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
