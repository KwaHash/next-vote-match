'use client'

/**
 * 【プロトタイプ】seijiselect.jp 政策一覧（課題から見る）
 * 賛否投票 + 全体集計表示つき
 */

import { POLICY_THEMES, SAMPLE_CANDIDATES } from '../_data'
import { loadJSON, saveJSON } from '../_store'
import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'

const MATCH_RESULT_KEY = 'proto_citizen_match_v1'
const VOTE_KEY = 'proto_policy_votes_v1'
const yen = (n: number) => `¥${n.toLocaleString('ja-JP')}`
const endorsers = (themeId: string) => SAMPLE_CANDIDATES.filter((c) => c.themes.includes(themeId)).length

type Vote = '賛成' | '反対' | 'どちらとも言えない'
type VoteMap = Record<string, Vote>

// サンプル全体集計（本番: policy_votes テーブルの集計値）
const SAMPLE_AGG: Record<string, { agree: number; neutral: number; oppose: number }> = {
  bosai:        { agree: 3420, neutral: 312, oppose:  89 },
  nettyusho:    { agree: 2180, neutral: 445, oppose: 120 },
  kotsu:        { agree: 1890, neutral: 520, oppose: 210 },
  kosodate:     { agree: 4560, neutral: 380, oppose: 145 },
  nyusatsu:     { agree: 3120, neutral: 290, oppose: 180 },
  'ai-gyosei':  { agree: 2340, neutral: 680, oppose: 310 },
  jinken:       { agree: 1650, neutral: 590, oppose: 380 },
  energy:       { agree: 2890, neutral: 510, oppose: 220 },
  'chiho-zaisei': { agree: 1980, neutral: 620, oppose: 250 },
  kanko:        { agree: 2150, neutral: 490, oppose: 160 },
}

const VOTE_OPTIONS: { value: Vote; label: string; activeClass: string; barClass: string }[] = [
  { value: '賛成',           label: '賛成',           activeClass: 'bg-blue-600 text-white border-blue-600',  barClass: 'bg-blue-500'  },
  { value: 'どちらとも言えない', label: 'どちらとも\n言えない', activeClass: 'bg-gray-500 text-white border-gray-500',  barClass: 'bg-gray-300'  },
  { value: '反対',           label: '反対',           activeClass: 'bg-rose-500 text-white border-rose-500',  barClass: 'bg-rose-400'  },
]

export default function PoliciesListPage() {
  const [weights, setWeights] = useState<Record<string, number> | null>(null)
  const [votes, setVotes] = useState<VoteMap>({})

  useEffect(() => {
    const d = loadJSON<{ weights?: Record<string, number> } | null>(MATCH_RESULT_KEY, null)
    if (d) setWeights(d.weights ?? null)
    setVotes(loadJSON<VoteMap>(VOTE_KEY, {}))
  }, [])

  const themes = useMemo(() => {
    if (!weights) return POLICY_THEMES
    return [...POLICY_THEMES].sort((a, b) => (weights[b.id] ?? 0) - (weights[a.id] ?? 0))
  }, [weights])

  const handleVote = (themeId: string, vote: Vote) => {
    setVotes((prev) => {
      const next = { ...prev }
      if (next[themeId] === vote) delete next[themeId]
      else next[themeId] = vote
      saveJSON(VOTE_KEY, next)
      return next
    })
  }

  const votedCount = Object.keys(votes).length

  return (
    <div className='mx-auto w-full max-w-3xl px-4 py-8'>
      <div className='mb-5'>
        <div className='mb-2 inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-600'>
          <span className='h-1.5 w-1.5 rounded-full bg-blue-500' />
          プロトタイプ / seijiselect.jp
        </div>
        <h1 className='text-2xl font-bold text-gray-900'>政策一覧（課題から見る）</h1>
        <p className='mt-1 text-sm text-gray-500'>
          政党ではなく「課題」から政策を見て、賛否を表明し、支援状況を確認できます。
        </p>
      </div>

      {weights && (
        <div className='mb-4 rounded-xl border border-blue-200 bg-blue-50 p-3 text-sm text-blue-800'>
          ✓ 診断結果から、あなたの関心が高い政策を上に表示しています。
        </div>
      )}

      {votedCount > 0 && (
        <div className='mb-4 rounded-xl border border-gray-200 bg-gray-50 p-3 text-xs text-gray-600'>
          {votedCount} 件の政策に賛否を表明しました。同じボタンをもう一度押すと取り消せます。
        </div>
      )}

      <div className='grid gap-4 sm:grid-cols-2'>
        {themes.map((t) => {
          const pct = Math.min(100, Math.round((t.raised / t.budget) * 100))
          const isInterest = (weights?.[t.id] ?? 0) >= 2
          const myVote = votes[t.id] ?? null

          // 全体集計（自分の投票を加算してリアルタイム反映）
          const base = SAMPLE_AGG[t.id] ?? { agree: 0, neutral: 0, oppose: 0 }
          const agg = {
            agree:   base.agree   + (myVote === '賛成'           ? 1 : 0),
            neutral: base.neutral + (myVote === 'どちらとも言えない' ? 1 : 0),
            oppose:  base.oppose  + (myVote === '反対'           ? 1 : 0),
          }
          const total = agg.agree + agg.neutral + agg.oppose
          const agreePct   = total ? Math.round((agg.agree   / total) * 100) : 0
          const neutralPct = total ? Math.round((agg.neutral / total) * 100) : 0
          const opposePct  = total ? 100 - agreePct - neutralPct             : 0

          return (
            <div key={t.id} className='flex flex-col rounded-xl border border-gray-200 bg-white p-5 transition-shadow hover:shadow-md'>
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

              {/* 全体の賛否集計 */}
              <div className='mt-3 border-t border-gray-100 pt-3'>
                <div className='mb-1.5 flex items-center justify-between'>
                  <p className='text-[11px] font-medium text-gray-500'>みんなの賛否（{total.toLocaleString()}票）</p>
                  {myVote && <span className='text-[10px] text-blue-600'>あなた: {myVote}</span>}
                </div>
                {/* 積み上げバー */}
                <div className='flex h-2 w-full overflow-hidden rounded-full'>
                  <div className='bg-blue-500 transition-all' style={{ width: `${agreePct}%` }} />
                  <div className='bg-gray-300 transition-all' style={{ width: `${neutralPct}%` }} />
                  <div className='bg-rose-400 transition-all' style={{ width: `${opposePct}%` }} />
                </div>
                <div className='mt-1 flex justify-between text-[10px] text-gray-400'>
                  <span className='text-blue-600 font-medium'>賛成 {agreePct}%</span>
                  <span>どちらとも {neutralPct}%</span>
                  <span className='text-rose-500'>反対 {opposePct}%</span>
                </div>
              </div>

              {/* 賛否投票ボタン */}
              <div className='mt-3 border-t border-gray-100 pt-3'>
                <p className='mb-2 text-[11px] font-medium text-gray-500'>あなたの賛否を表明する</p>
                <div className='flex gap-1.5'>
                  {VOTE_OPTIONS.map((opt) => {
                    const active = myVote === opt.value
                    return (
                      <button
                        key={opt.value}
                        type='button'
                        onClick={() => handleVote(t.id, opt.value)}
                        className={`flex-1 whitespace-pre-line rounded-lg border py-1.5 text-[11px] font-semibold leading-tight transition-colors ${
                          active ? opt.activeClass : 'border-gray-200 bg-white text-gray-500 hover:border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        {opt.label}
                      </button>
                    )
                  })}
                </div>
              </div>

              <Link href={`/prototype/policies/${t.id}`} className='mt-3 text-xs font-medium text-blue-600'>
                詳しく見る・寄付する →
              </Link>
            </div>
          )
        })}
      </div>
    </div>
  )
}
