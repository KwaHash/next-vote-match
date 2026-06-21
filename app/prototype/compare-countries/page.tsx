'use client'

/**
 * 【プロトタイプ】seijiselect.jp 世界と比べる日本
 *
 * 目的: 海外礼賛ではなく「日本がどこを真似るべきか／どこは日本独自に進めるべきか」を見せる。
 *
 * 注意: 動く仕様書（プロトタイプ）。評価はサンプル。本番は country_comparisons テーブル。
 */

import { COMPARE_COUNTRIES, COUNTRY_COMPARISON } from '../_data'
import Link from 'next/link'

const ratingColor = (r: string) =>
  r === '◎' ? 'text-emerald-600 font-bold' : r === '○' ? 'text-blue-600' : r === '△' ? 'text-amber-600' : 'text-rose-500'

export default function CompareCountriesPage() {
  return (
    <div className='mx-auto w-full max-w-3xl px-4 py-8'>
      <div className='mb-6'>
        <div className='mb-2 inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-600'>
          <span className='h-1.5 w-1.5 rounded-full bg-blue-500' />
          プロトタイプ / seijiselect.jp
        </div>
        <h1 className='text-2xl font-bold text-gray-900'>世界と比べる日本</h1>
        <p className='mt-2 text-sm leading-relaxed text-gray-500'>
          分野ごとに各国を比較します。目的は海外礼賛ではなく、<strong className='text-blue-700'>日本がどこを真似るべきか・どこは独自に進めるべきか</strong>を見極めることです。
        </p>
      </div>

      {/* 比較表 */}
      <div className='overflow-x-auto rounded-xl border border-gray-200 bg-white'>
        <table className='w-full text-sm'>
          <thead>
            <tr className='border-b border-gray-100'>
              <th className='whitespace-nowrap p-3 text-left text-xs font-medium text-gray-400'>テーマ</th>
              {COMPARE_COUNTRIES.map((c) => (
                <th key={c} className={`whitespace-nowrap p-3 text-center text-xs font-medium ${c === '日本' ? 'text-blue-700' : 'text-gray-400'}`}>{c}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {COUNTRY_COMPARISON.map((row) => (
              <tr key={row.theme} className='border-b border-gray-50 last:border-0'>
                <td className='whitespace-nowrap p-3 text-xs font-semibold text-gray-700'>{row.theme}</td>
                {COMPARE_COUNTRIES.map((c) => (
                  <td key={c} className={`p-3 text-center text-base ${ratingColor(row.ratings[c])} ${c === '日本' ? 'bg-blue-50/50' : ''}`}>{row.ratings[c]}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className='mt-2 text-center text-[11px] text-gray-400'>◎ 先進 / ○ 良好 / △ 課題 / × 遅れ</p>

      {/* 日本が真似るべき */}
      <div className='mt-6'>
        <h2 className='mb-3 text-sm font-bold text-gray-900'>日本が参考にできる制度</h2>
        <div className='space-y-2'>
          {COUNTRY_COMPARISON.map((row) => (
            <div key={row.theme} className='flex items-start gap-3 rounded-lg border border-gray-100 bg-white p-3'>
              <span className='shrink-0 rounded-md bg-gray-100 px-2 py-0.5 text-[11px] font-bold text-gray-500'>{row.theme}</span>
              <p className='text-sm text-gray-700'>{row.learn}</p>
            </div>
          ))}
        </div>
      </div>

      <div className='mt-4 rounded-xl bg-blue-50 p-4 text-xs text-blue-800'>
        💡 本番では、候補者の政策が「どの国モデルに近いか」（例: 行政DXはエストニア型、市民参加は台湾型）も表示します。
      </div>

      <Link href='/prototype/vision' className='mt-5 inline-block text-sm font-medium text-blue-600'>← 日本のあるべき姿へ</Link>
    </div>
  )
}
