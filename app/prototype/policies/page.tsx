'use client'

/**
 * 【プロトタイプ】seijiselect.jp 政策一覧（課題から見る）
 *
 * 目的: 有権者が「政党」ではなく「課題」から政策を見て、支援状況を確認し、寄付・応援できる。
 *       診断を受けていれば関心テーマを上位に表示。
 *
 * 注意: 動く仕様書（プロトタイプ）。支援状況はサンプル値（本番は policy_funds / donations 集計）。
 */

import { POLICY_THEMES, SAMPLE_CANDIDATES } from '../_data'
import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'

const MATCH_RESULT_KEY = 'proto_citizen_match_v1'
const yen = (n: number) => `¥${n.toLocaleString('ja-JP')}`
const endorsers = (themeId: string) => SAMPLE_CANDIDATES.filter((c) => c.themes.includes(themeId)).length

export default function PoliciesListPage() {
  const [weights, setWeights] = useState<Record<string, number> | null>(null)

  useEffect(() => {
    try {
      const raw = localStorage.getItem(MATCH_RESULT_KEY)
      if (raw) setWeights(JSON.parse(raw).weights ?? null)
    } catch {
      /* ignore */
    }
  }, [])

  // 診断済みなら関心の高い順
  const themes = useMemo(() => {
    if (!weights) return POLICY_THEMES
    return [...POLICY_THEMES].sort((a, b) => (weights[b.id] ?? 0) - (weights[a.id] ?? 0))
  }, [weights])

  return (
    <div className='mx-auto w-full max-w-3xl px-4 py-8'>
      <div className='mb-5'>
        <div className='mb-2 inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-600'>
          <span className='h-1.5 w-1.5 rounded-full bg-blue-500' />
          プロトタイプ / seijiselect.jp
        </div>
        <h1 className='text-2xl font-bold text-gray-900'>政策一覧（課題から見る）</h1>
        <p className='mt-1 text-sm text-gray-500'>
          政党ではなく「課題」から政策を見て、支援状況を確認し、応援・寄付できます。
        </p>
      </div>

      {weights && (
        <div className='mb-5 rounded-xl border border-blue-200 bg-blue-50 p-3 text-sm text-blue-800'>
          ✓ 診断結果から、あなたの関心が高い政策を上に表示しています。
        </div>
      )}

      <div className='grid gap-4 sm:grid-cols-2'>
        {themes.map((t) => {
          const pct = Math.min(100, Math.round((t.raised / t.budget) * 100))
          const isInterest = (weights?.[t.id] ?? 0) >= 2
          return (
            <Link
              key={t.id}
              href={`/prototype/policies/${t.id}`}
              className='flex flex-col rounded-xl border border-gray-200 bg-white p-5 transition-shadow hover:shadow-md'
            >
              <div className='mb-2 flex items-start justify-between'>
                <span className='text-3xl'>{t.emoji}</span>
                {isInterest && (
                  <span className='rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-semibold text-blue-700'>あなたの関心</span>
                )}
              </div>
              <h2 className='text-base font-bold text-gray-900'>{t.name}</h2>
              <p className='mt-0.5 text-xs text-gray-500'>{t.summary}</p>

              {/* 支援状況 */}
              <div className='mt-3'>
                <div className='mb-1 flex items-center justify-between text-xs'>
                  <span className='font-semibold text-gray-800'>{yen(t.raised)}</span>
                  <span className='text-gray-400'>目標 {yen(t.budget)}</span>
                </div>
                <div className='h-1.5 w-full overflow-hidden rounded-full bg-gray-100'>
                  <div className='h-full rounded-full bg-blue-500' style={{ width: `${pct}%` }} />
                </div>
                <div className='mt-1.5 flex items-center justify-between text-[11px] text-gray-400'>
                  <span>支援者 {t.supporters}名</span>
                  <span>賛同候補 {endorsers(t.id)}名</span>
                </div>
              </div>

              <span className='mt-3 text-xs font-medium text-blue-600'>詳しく見る・寄付する →</span>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
