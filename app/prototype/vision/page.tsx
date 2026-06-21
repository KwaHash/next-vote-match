'use client'

/**
 * 【プロトタイプ】seijiselect.jp 日本のあるべき姿（国家ビジョン）
 *
 * 目的: 政策や候補者を並べる前に「このサイトは日本をどうしたいか」を示す。
 *       超党派で評価できる国家ビジョン（6本柱）として提示し、政策テーマ・KPIに接続。
 *
 * 注意: 動く仕様書（プロトタイプ）。本番は visions テーブル。
 */

import { POLICY_THEMES, VISIONS } from '../_data'
import Link from 'next/link'

const themeName = (id: string) => POLICY_THEMES.find((t) => t.id === id)?.name ?? id

export default function VisionPage() {
  return (
    <div className='mx-auto w-full max-w-3xl px-4 py-8'>
      <div className='mb-6'>
        <div className='mb-2 inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-600'>
          <span className='h-1.5 w-1.5 rounded-full bg-blue-500' />
          プロトタイプ / seijiselect.jp
        </div>
        <h1 className='text-2xl font-bold text-gray-900'>日本のあるべき姿</h1>
        <p className='mt-2 text-sm leading-relaxed text-gray-500'>
          政策や候補者を選ぶ前に、私たちはどんな日本をめざすのか。
          特定の政党の主張ではなく、<strong className='text-blue-700'>超党派で評価できる国家ビジョン</strong>として6つの柱を掲げます。
        </p>
      </div>

      <div className='space-y-4'>
        {VISIONS.map((v) => (
          <div key={v.id} className='rounded-2xl border border-gray-200 bg-white p-5'>
            <div className='flex items-start gap-4'>
              <div className='flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-blue-50 text-2xl'>{v.emoji}</div>
              <div className='min-w-0 flex-1'>
                <p className='text-xs font-bold text-blue-600'>VISION {v.no}</p>
                <h2 className='text-lg font-bold text-gray-900'>{v.title}</h2>
                <p className='mt-0.5 text-sm text-gray-500'>{v.desc}</p>
                <div className='mt-3 flex flex-wrap gap-1.5'>
                  {v.themeIds.map((id) => (
                    <Link key={id} href={`/prototype/policies/${id}`} className='rounded-full bg-blue-50 px-2.5 py-1 text-[11px] font-medium text-blue-600 hover:bg-blue-100'>
                      {themeName(id)}
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className='mt-6 flex flex-col gap-3 sm:flex-row'>
        <Link href='/prototype/kpi' className='flex-1 rounded-xl bg-blue-600 px-4 py-3 text-center text-sm font-semibold text-white hover:bg-blue-700'>
          ビジョンを数字で見る（KPI）
        </Link>
        <Link href='/prototype/compare-countries' className='flex-1 rounded-xl border border-gray-300 px-4 py-3 text-center text-sm font-semibold text-gray-700 hover:bg-gray-50'>
          世界と比べる
        </Link>
      </div>
      <p className='mt-4 text-center text-xs text-gray-400'>
        ※ 自由責任党の綱領としてではなく、超党派の国家ビジョンとして提示しています。
      </p>
    </div>
  )
}
