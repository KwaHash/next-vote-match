'use client'

/**
 * 【プロトタイプ】seijiselect.jp 日本の未来KPI
 *
 * 目的: 国家ビジョンを言葉で終わらせず、分野別KPI（現状→目標）に落とし、政策と紐づける。
 *
 * 注意: 動く仕様書（プロトタイプ）。現状値は本番で最新統計に接続（プロトは「集計中」）。本番は national_kpis テーブル。
 */

import { NATIONAL_KPIS, POLICY_THEMES } from '../_data'
import Link from 'next/link'

const themeEmoji = (id: string) => POLICY_THEMES.find((t) => t.id === id)?.emoji ?? '•'
const themeName = (id: string) => POLICY_THEMES.find((t) => t.id === id)?.name ?? id

export default function KpiPage() {
  return (
    <div className='mx-auto w-full max-w-3xl px-4 py-8'>
      <div className='mb-6'>
        <div className='mb-2 inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-600'>
          <span className='h-1.5 w-1.5 rounded-full bg-blue-500' />
          プロトタイプ / seijiselect.jp
        </div>
        <h1 className='text-2xl font-bold text-gray-900'>日本の未来KPI</h1>
        <p className='mt-2 text-sm leading-relaxed text-gray-500'>
          「あるべき姿」を数字の目標に落とし込みます。各KPIは政策と紐づき、候補者が目標を掲げているかを見られます。
        </p>
      </div>

      <div className='space-y-2.5'>
        {NATIONAL_KPIS.map((k) => (
          <div key={k.id} className='rounded-xl border border-gray-200 bg-white p-4'>
            <div className='flex items-center gap-3'>
              <span className='shrink-0 rounded-md bg-gray-100 px-2 py-0.5 text-[11px] font-bold text-gray-500'>{k.category}</span>
              <span className='min-w-0 flex-1 text-sm font-semibold text-gray-900'>{k.name}</span>
            </div>
            <div className='mt-2 flex items-center gap-2 text-sm'>
              <span className='rounded-lg bg-gray-50 px-2.5 py-1 text-xs text-gray-500'>現状: {k.current}</span>
              <span className='text-gray-300'>→</span>
              <span className='rounded-lg bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700'>目標: {k.target}</span>
            </div>
            <Link href={`/prototype/policies/${k.themeId}`} className='mt-2 inline-flex items-center gap-1 text-xs font-medium text-blue-600 hover:text-blue-700'>
              {themeEmoji(k.themeId)} {themeName(k.themeId)} の政策を見る →
            </Link>
          </div>
        ))}
      </div>

      <p className='mt-5 text-center text-xs text-gray-400'>
        ※ プロトでは現状値は「集計中」。本番は政府統計・自治体データに接続して自動更新。
      </p>

      <div className='mt-5 flex flex-col gap-3 sm:flex-row'>
        <Link href='/prototype/vision' className='flex-1 rounded-xl border border-gray-300 px-4 py-3 text-center text-sm font-semibold text-gray-700 hover:bg-gray-50'>← 日本のあるべき姿</Link>
        <Link href='/prototype/candidates' className='flex-1 rounded-xl bg-blue-600 px-4 py-3 text-center text-sm font-semibold text-white hover:bg-blue-700'>候補者を見る</Link>
      </div>
    </div>
  )
}
