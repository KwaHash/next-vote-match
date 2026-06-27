'use client'

/**
 * 【プロトタイプ】seijiselect.jp 選挙で選ぶ（〒→実施中の選挙→候補者比較・マッチング）
 *
 * 目的: 郵便番号で「いま自分の地域で行われている選挙」を表示し、その選挙の候補者を
 *       診断との一致率＋3軸（政策の重点／実行力・現実性／透明性・信頼）で比較して選べる。
 *
 * 注意: 動く仕様書（プロトタイプ）。実施中選挙・候補者はサンプル（_data.ts）。〒判定は先頭一致の簡易版。
 *   本番は 〒→地域API＋elections/candidacies テーブル、候補者ロスターは運営adminが取込。
 */

import { ONGOING_ELECTIONS, POLICY_THEMES, type ElectionCand, type OngoingElection } from '../_data'
import { STORE_KEYS, loadJSON } from '../_store'
import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'

const themeName = (id: string) => POLICY_THEMES.find((t) => t.id === id)?.name ?? id
const finRating = (f: string) => (f.includes('明確') ? '◎' : f.includes('一部') ? '○' : '△')
const transRating = (t: string) => (t.includes('高') ? '◎' : t.includes('中') ? '○' : '△')
const ratingColor = (r: string) => (r === '◎' ? 'text-emerald-600 font-bold' : r === '○' ? 'text-blue-600' : 'text-amber-600')

export default function ElectionsPage() {
  const [postal, setPostal] = useState('')
  const [searched, setSearched] = useState(false)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [weights, setWeights] = useState<Record<string, number> | null>(null)

  useEffect(() => {
    const d = loadJSON<{ weights?: Record<string, number> } | null>(STORE_KEYS.citizenMatch, null)
    if (d) setWeights(d.weights ?? null)
  }, [])

  const digits = postal.replace(/[^0-9]/g, '')
  const matched = useMemo(() => {
    if (!digits) return ONGOING_ELECTIONS
    const hit = ONGOING_ELECTIONS.filter((e) => e.postalPrefixes.some((p) => digits.startsWith(p)))
    return hit.length ? hit : ONGOING_ELECTIONS
  }, [digits])
  const exactHit = digits.length >= 2 && ONGOING_ELECTIONS.some((e) => e.postalPrefixes.some((p) => digits.startsWith(p)))

  const election = ONGOING_ELECTIONS.find((e) => e.id === selectedId) ?? null

  const matchPct = (c: ElectionCand): number | null => {
    if (!weights) return null
    const max = 3 * c.themes.length
    if (!max) return null
    const score = c.themes.reduce((s, t) => s + (weights[t] ?? 0), 0)
    return Math.round((score / max) * 100)
  }

  // ===== 選挙詳細（候補者比較・マッチング）=====
  if (election) {
    const ranked = [...election.cands].map((c) => ({ c, pct: matchPct(c) }))
      .sort((a, b) => (b.pct ?? -1) - (a.pct ?? -1))
    const rows: { label: string; sub: string; render: (c: ElectionCand) => React.ReactNode }[] = [
      { label: '政策一致率', sub: '診断との一致', render: (c) => { const p = matchPct(c); return p === null ? <span className='text-gray-400'>診断で表示</span> : <span className='font-bold text-blue-600'>{p}%</span> } },
      { label: '重点政策', sub: '何を最優先するか', render: (c) => <span className='text-xs'>{c.themes.map(themeName).join('、')}</span> },
      { label: '実行力・現実性', sub: '財源の明確さ', render: (c) => <span className={ratingColor(finRating(c.finance))}>{finRating(c.finance)} <span className='text-[10px] font-normal text-gray-400'>({c.finance})</span></span> },
      { label: '透明性・信頼', sub: '情報公開', render: (c) => <span className={ratingColor(transRating(c.transparency))}>{transRating(c.transparency)} <span className='text-[10px] font-normal text-gray-400'>({c.transparency})</span></span> },
      { label: '立場・実績', sub: '', render: (c) => <span className='text-xs text-gray-600'>{c.status} / {c.achievement}</span> },
    ]
    return (
      <div className='mx-auto w-full max-w-3xl px-4 py-8'>
        <button onClick={() => setSelectedId(null)} className='mb-4 text-xs text-gray-400 hover:text-gray-600'>← 選挙を選び直す</button>
        <div className='mb-4'>
          <span className='rounded-full bg-blue-100 px-2 py-0.5 text-[11px] font-semibold text-blue-700'>{election.typeLabel}</span>
          <h1 className='mt-1 text-2xl font-bold text-gray-900'>{election.name}</h1>
          <p className='mt-0.5 text-sm text-gray-500'>{election.region} ・ 投票日 {election.date} ・ 候補者 {election.cands.length}名</p>
        </div>

        {!weights && (
          <div className='mb-4 rounded-xl border border-blue-200 bg-blue-50 p-3 text-sm text-blue-800'>
            <Link href='/prototype/match' className='font-semibold underline'>30秒 政策マッチング診断</Link>を受けると、各候補者との「一致率」が表示され、おすすめ順に並びます。
          </div>
        )}

        {/* マッチング（おすすめ順） */}
        <h2 className='mb-2 text-sm font-bold text-gray-900'>あなたへのおすすめ順</h2>
        <div className='mb-6 space-y-2'>
          {ranked.map(({ c, pct }, i) => (
            <div key={c.name} className={`rounded-xl border p-4 ${i === 0 && weights ? 'border-blue-300 bg-blue-50/40' : 'border-gray-200 bg-white'}`}>
              <div className='flex items-center gap-3'>
                <div className='min-w-0 flex-1'>
                  <div className='flex flex-wrap items-center gap-2'>
                    {i === 0 && weights && <span className='rounded-full bg-blue-600 px-2 py-0.5 text-[10px] font-semibold text-white'>おすすめ</span>}
                    <span className='text-base font-bold text-gray-900'>{c.name}</span>
                    <span className='text-xs text-gray-500'>{c.party} · {c.status} · {c.age}歳</span>
                  </div>
                  <div className='mt-1 flex flex-wrap gap-1'>
                    {c.themes.map((t) => <span key={t} className='rounded-full bg-blue-50 px-2 py-0.5 text-[11px] text-blue-600'>{themeName(t)}</span>)}
                  </div>
                </div>
                {pct !== null && <div className='shrink-0 text-center'><div className='text-lg font-bold text-blue-600'>{pct}%</div><div className='text-[10px] text-gray-400'>一致率</div></div>}
              </div>
            </div>
          ))}
        </div>

        {/* 比較表 */}
        <h2 className='mb-2 text-sm font-bold text-gray-900'>候補者を比較する</h2>
        <div className='overflow-x-auto rounded-xl border border-gray-200 bg-white'>
          <table className='w-full text-sm'>
            <thead>
              <tr className='border-b border-gray-100'>
                <th className='whitespace-nowrap p-3 text-left text-xs font-medium text-gray-400'>比較軸</th>
                {election.cands.map((c) => (<th key={c.name} className='min-w-[120px] p-3 text-left font-bold text-gray-900'>{c.name}</th>))}
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.label} className='border-b border-gray-50 align-top last:border-0'>
                  <td className='p-3'><p className='whitespace-nowrap text-xs font-semibold text-gray-700'>{r.label}</p>{r.sub && <p className='whitespace-nowrap text-[10px] text-gray-400'>{r.sub}</p>}</td>
                  {election.cands.map((c) => (<td key={c.name} className='p-3 text-gray-700'>{r.render(c)}</td>))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className='mt-4 text-center text-xs text-gray-400'>※ サンプルデータ。候補者情報は公式/本人入力/公開情報をもとに掲載予定（運営adminが取込・審査）。</p>
      </div>
    )
  }

  // ===== 〒検索 → 実施中の選挙一覧 =====
  return (
    <div className='mx-auto w-full max-w-2xl px-4 py-8'>
      <div className='mb-5'>
        <div className='mb-2 inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-600'>
          <span className='h-1.5 w-1.5 rounded-full bg-blue-500' />
          プロトタイプ / seijiselect.jp
        </div>
        <h1 className='text-2xl font-bold text-gray-900'>選挙で選ぶ</h1>
        <p className='mt-1 text-sm text-gray-500'>郵便番号を入れると、いまあなたの地域で行われている選挙が出ます。候補者を比較して選べます。</p>
      </div>

      {/* 〒検索 */}
      <div className='mb-5 rounded-xl border border-gray-200 bg-white p-5'>
        <label className='mb-1 block text-xs font-medium text-gray-600'>郵便番号</label>
        <div className='flex gap-2'>
          <input
            className='w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-400'
            placeholder='例: 166-0001（杉並区）'
            value={postal}
            onChange={(e) => setPostal(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') setSearched(true) }}
            inputMode='numeric'
          />
          <button onClick={() => setSearched(true)} className='shrink-0 rounded-lg bg-blue-600 px-5 py-2 text-sm font-semibold text-white hover:bg-blue-700'>検索</button>
        </div>
        <p className='mt-2 text-[11px] text-gray-400'>例: 166 / 167 / 168 → 杉並区、53〜59 → 大阪府。空欄でも全国の実施中選挙を表示します。</p>
      </div>

      {/* 実施中の選挙 */}
      <h2 className='mb-2 text-sm font-bold text-gray-900'>
        {searched && exactHit ? 'あなたの地域で実施中の選挙' : '実施中の選挙'}
        {searched && !exactHit && digits.length >= 2 && <span className='ml-1 text-[11px] font-normal text-gray-400'>（該当地域が見つからないため全国を表示）</span>}
      </h2>
      <div className='space-y-2'>
        {matched.map((e: OngoingElection) => (
          <button key={e.id} onClick={() => setSelectedId(e.id)} className='flex w-full items-center gap-3 rounded-xl border border-gray-200 bg-white p-4 text-left transition-shadow hover:shadow-md'>
            <div className='min-w-0 flex-1'>
              <div className='flex flex-wrap items-center gap-2'>
                <span className='rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-semibold text-blue-700'>{e.typeLabel}</span>
                <span className='text-sm font-bold text-gray-900'>{e.name}</span>
              </div>
              <p className='mt-0.5 text-xs text-gray-400'>{e.region} ・ 投票日 {e.date} ・ 候補者 {e.cands.length}名</p>
            </div>
            <span className='shrink-0 text-xs font-medium text-blue-600'>候補者を見る →</span>
          </button>
        ))}
      </div>

      <p className='mt-5 text-center text-xs text-gray-400'>※ 実施中選挙はサンプル。本番は運営adminが取り込んだ選挙・候補者を表示します。</p>
    </div>
  )
}
