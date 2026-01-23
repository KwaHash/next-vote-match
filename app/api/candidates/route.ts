import { withDatabase } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const district = searchParams.get('district')

    const politicians = await withDatabase(async (db) => {
      let query = `
        SELECT r.*, 
          p.name, 
          p.party, 
          p.avatar, 
          p.birth_year, 
          p.gender, 
          p.website, 
          p.facebook, 
          p.twitter, 
          p.youtube, 
          p.line, 
          p.instagram, 
          p.tiktok, 
          p.linkedin
        FROM politicians p
        INNER JOIN represent51 r ON p.id = r.politician_id
      `
      const params: string[] = []
      
      if (district) {
        query += ' WHERE r.district = ?'
        params.push(district)
      }
      
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
