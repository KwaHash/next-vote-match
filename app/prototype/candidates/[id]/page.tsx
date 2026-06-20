'use client'

/**
 * 【プロトタイプ】seijiselect.jp 候補者 個別詳細ページ
 *
 * 目的: 候補者1人分のプロフィール・政策スタンス・公約・実績・政治資金透明化・SNSをまとめて表示。
 *       診断を受けていれば「あなたとの一致率」も表示。
 *
 * 注意: 動く仕様書（プロトタイプ）。公約・実績・SNS はサンプル（本番は candidates / candidacies 等から）。
 */

import { ELECTION_TYPES, POLICY_THEMES, SAMPLE_CANDIDATES } from '../../_data'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { useEffect, useMemo, useState } from 'react'

const MATCH_RESULT_KEY = 'proto_citizen_match_v1'
const theme = (id: string) => POLICY_THEMES.find((t) => t.id === id)
const typeLabel = (v: string) => ELECTION_TYPES.find((e) => e.value === v)?.label ?? v

export default function CandidateDetailPage() {
  const params = useParams()
  const id = Number(params?.id ?? 0)
  const c = useMemo(() => SAMPLE_CANDIDATES.find((x) => x.id === id), [id])
  const [weights, setWeights] = useState<Record<string, number> | null>(null)

  useEffect(() => {
    try {
      const raw = localStorage.getItem(MATCH_RESULT_KEY)
      if (raw) setWeights(JSON.parse(raw).weights ?? null)
    } catch {
      /* ignore */
    }
  }, [])

  if (!c) {
    return (
      <div className='mx-auto w-full max-w-2xl px-4 py-16 text-center'>
        <p className='text-gray-500'>候補者が見つかりませんでした。</p>
        <Link href='/prototype/candidates' className='mt-3 inline-block text-sm font-medium text-blue-600'>← 候補者一覧へ</Link>
      </div>
    )
  }

  const matchPct = (() => {
    if (!weights) return null
    const max = 3 * c.themes.length
    if (!max) return null
    const score = c.themes.reduce((s, t) => s + (weights[t] ?? 0), 0)
    return Math.round((score / max) * 100)
  })()

  return (
    <div className='mx-auto w-full max-w-2xl px-4 py-8 pb-16'>
      <Link href='/prototype/candidates' className='mb-4 inline-block text-xs text-gray-400 hover:text-gray-600'>← 候補者一覧</Link>

      {/* ヘッダー */}
      <div className='rounded-2xl border border-gray-200 bg-white p-6'>
        <div className='flex items-start gap-4'>
          <div className='flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-gray-50 text-3xl'>{theme(c.themes[0])?.emoji ?? '👤'}</div>
          <div className='min-w-0 flex-1'>
            <div className='flex flex-wrap items-center gap-2'>
              <h1 className='text-xl font-bold text-gray-900'>{c.name}</h1>
              <span className='text-sm text-gray-500'>{c.party}</span>
            </div>
            <div className='mt-1 flex flex-wrap gap-1.5'>
              <span className='rounded-full bg-indigo-100 px-2 py-0.5 text-[11px] font-semibold text-indigo-700'>{typeLabel(c.electionType)}</span>
              <span className='rounded-full bg-gray-100 px-2 py-0.5 text-[11px] text-gray-500'>{c.status}</span>
              <span className='rounded-full bg-gray-100 px-2 py-0.5 text-[11px] text-gray-500'>📍 {c.region}{c.district !== c.region ? ` ${c.district}` : ''}</span>
            </div>
          </div>
          {matchPct !== null && (
            <div className='shrink-0 text-center'>
              <div className='text-2xl font-bold text-blue-600'>{matchPct}%</div>
              <div className='text-[10px] text-gray-400'>一致率</div>
            </div>
          )}
        </div>
        {matchPct === null && (
          <div className='mt-3 rounded-lg bg-blue-50 p-2.5 text-xs text-blue-700'>
            <Link href='/prototype/match' className='font-semibold underline'>政策マッチング診断</Link>を受けると、この候補者との一致率が分かります。
          </div>
        )}
      </div>

      {/* 政策スタンス */}
      <div className='mt-4 rounded-xl border border-gray-200 bg-white p-5'>
        <h2 className='mb-2 text-sm font-bold text-gray-900'>注力する政策</h2>
        <div className='flex flex-wrap gap-1.5'>
          {c.themes.map((t) => (
            <span key={t} className='rounded-full bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-600'>{theme(t)?.emoji} {theme(t)?.name}</span>
          ))}
        </div>
      </div>

      {/* 公約（テーマの解決案から） */}
      <div className='mt-4 rounded-xl border border-gray-200 bg-white p-5'>
        <h2 className='mb-2 text-sm font-bold text-gray-900'>公約</h2>
        <ul className='space-y-2'>
          {c.themes.map((t) => (
            <li key={t} className='text-sm text-gray-700'>
              <span className='font-medium'>{theme(t)?.name}：</span>{theme(t)?.solution}
            </li>
          ))}
        </ul>
      </div>

      {/* 実績（サンプル） */}
      <div className='mt-4 rounded-xl border border-gray-200 bg-white p-5'>
        <h2 className='mb-2 text-sm font-bold text-gray-900'>実績</h2>
        <ul className='space-y-1.5 text-sm text-gray-700'>
          <li>・{theme(c.themes[0])?.name}に関する議会質問・提言（2025年）</li>
          <li>・地域の課題に関する行政要望を提出</li>
          {c.status === '現職' && <li>・関連予算の確保に貢献</li>}
        </ul>
      </div>

      {/* 政治資金透明化 */}
      <div className='mt-4 rounded-xl border border-gray-200 bg-white p-5'>
        <h2 className='mb-2 text-sm font-bold text-gray-900'>政治資金の透明化</h2>
        <div className='mb-1 flex items-center justify-between text-sm'>
          <span className='text-gray-600'>透明化スコア</span>
          <span className='font-bold text-emerald-600'>{c.transparency} / 100</span>
        </div>
        <div className='h-2 w-full overflow-hidden rounded-full bg-gray-100'>
          <div className='h-full rounded-full bg-emerald-400' style={{ width: `${c.transparency}%` }} />
        </div>
        <p className='mt-2 text-xs text-gray-400'>
          収支の公開度を示すスコア。{c.source === 'self' ? '本人が情報を入力・公開しています。' : '公式情報から取り込んでいます。'}
        </p>
      </div>

      {/* SNS（サンプル） */}
      <div className='mt-4 rounded-xl border border-gray-200 bg-white p-5'>
        <h2 className='mb-2 text-sm font-bold text-gray-900'>SNS・公式サイト</h2>
        <div className='flex flex-wrap gap-2 text-xs'>
          {['X', 'YouTube', 'Instagram', '公式サイト'].map((s) => (
            <span key={s} className='rounded-full border border-gray-200 px-3 py-1 text-gray-500'>{s}</span>
          ))}
        </div>
        <p className='mt-2 text-[11px] text-gray-400'>※ サンプル表示。本番は候補者本人が登録したリンクを表示。</p>
      </div>

      <div className='mt-5 flex gap-3'>
        <Link href='/prototype/compare' className='flex-1 rounded-xl border border-gray-300 px-4 py-3 text-center text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50'>
          他の候補者と比較
        </Link>
        <Link href='/prototype/policies' className='flex-1 rounded-xl bg-blue-600 px-4 py-3 text-center text-sm font-semibold text-white transition-colors hover:bg-blue-700'>
          政策を見て寄付
        </Link>
      </div>
    </div>
  )
}
