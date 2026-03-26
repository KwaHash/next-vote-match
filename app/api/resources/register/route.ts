import { withDatabase } from '@/lib/db'
import type { CreateSupportResourceBody } from '@/types/support-resource'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as CreateSupportResourceBody

    const { provider_type, provider_name,
      contact_email, contact_phone,
      prefecture, municipality,
      content,
      price_type, availability,
      coverage_area } = body

    if (!provider_type || !provider_name || !contact_email || !prefecture || !content || !price_type || !availability) {
      return NextResponse.json({ error: '必須項目が不足しています。' }, { status: 400 })
    }

    const resource_id = await withDatabase(async (db) => {
      const [result] = await db.query(
        `INSERT INTO resources (
          provider_type, provider_name, contact_email, contact_phone,
          prefecture, municipality, content, price_type, availability, coverage_area
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          provider_type,
          provider_name,
          contact_email,
          contact_phone ?? '',
          prefecture,
          municipality ?? '',
          content,
          price_type,
          availability,
          coverage_area?.length ? JSON.stringify(coverage_area) : null,
        ]
      )
      return (result as any).insertId
    })

    return NextResponse.json({ resource_id })
  } catch (error) {
    return NextResponse.json(
      { error: '登録に失敗しました。しばらくしてから再度お試しください。' },
      { status: 500 }
    )
  }
}
