'use client'

/**
 * 【プロトタイプ】seijiselect.jp 候補者比較
 *
 * 目的: 複数の候補者を並べて、政党・選挙種別・地域・一致率・透明化・注力政策を比較する。
 *
 * 注意: 動く仕様書（プロトタイプ）。一致率は診断結果（proto_citizen_match_v1）から算出。
 */

import { ELECTION_TYPES, POLICY_THEMES, SAMPLE_CANDIDATES, type PrototypeCandidate } from '../_data'
import { loadJSON } from '../_store'
import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'

const MATCH_RESULT_KEY = 'proto_citizen_match_v1'
const themeName = (id: string) => POLICY_THEMES.find((t) => t.id === id)?.name ?? id
const typeLabel = (v: string) => ELECTION_TYPES.find((e) => e.value === v)?.label ?? v

export default function ComparePage() {
  const [selected, setSelected] = useState<number[]>([])
  const [weights, setWeights] = useState<Record<string, number> | null>(null)

  useEffect(() => {
    const d = loadJSON<{ weights?: Record<string, number> } | null>(MATCH_RESULT_KEY, null)
    if (d) setWeights(d.weights ?? null)
  }, [])

  const matchPct = (c: PrototypeCandidate): number | null => {
    if (!weights) return null
    const max = 3 * c.themes.length
    if (!max) return null
    const score = c.themes.reduce((s, t) => s + (weights[t] ?? 0), 0)
    return Math.round((score / max) * 100)
  }

  const chosen = useMemo(
    () => selected.map((id) => SAMPLE_CANDIDATES.find((c) => c.id === id)!).filter(Boolean),
    [selected]
  )

  const add = (id: number) => {
    if (id && !selected.includes(id) && selected.length < 3) setSelected([...selected, id])
  }
  const remove = (id: number) => setSelected(selected.filter((x) => x !== id))

  const available = SAMPLE_CANDIDATES.filter((c) => !selected.includes(c.id))

  const rows: { label: string; render: (c: PrototypeCandidate) => React.ReactNode }[] = [
    { label: '政党', render: (c) => c.party },
    { label: '選挙種別', render: (c) => typeLabel(c.electionType) },
    { label: '地域', render: (c) => c.region },
    { label: '立場', render: (c) => c.status },
    { label: '一致率', render: (c) => { const p = matchPct(c); return p === null ? <span className='text-gray-400'>診断で表示</span> : <span className='font-bold text-blue-600'>{p}%</span> } },
    { label: '透明化', render: (c) => `${c.transparency}/100` },
    { label: '注力政策', render: (c) => <span className='text-xs'>{c.themes.map(themeName).join('、')}</span> },
  ]

  return (
    <div className='mx-auto w-full max-w-3xl px-4 py-8 pb-16'>
      <div className='mb-5'>
        <div className='mb-2 inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-600'>
          <span className='h-1.5 w-1.5 rounded-full bg-blue-500' />
          プロトタイプ / seijiselect.jp
        </div>
        <h1 className='text-2xl font-bold text-gray-900'>候補者比較</h1>
        <p className='mt-1 text-sm text-gray-500'>候補者を最大3名まで選んで、政策・透明化・一致率を並べて比較できます。</p>
      </div>

      {/* 追加 */}
      <div className='mb-5 flex flex-wrap items-center gap-2'>
        <select
          className='rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-blue-400 focus:outline-none'
          value=''
          onChange={(e) => add(Number(e.target.value))}
          disabled={selected.length >= 3}
        >
          <option value=''>＋ 候補者を追加{selected.length >= 3 ? '（上限3名）' : ''}</option>
          {available.map((c) => (
            <option key={c.id} value={c.id}>{c.name}（{c.party}）</option>
          ))}
        </select>
        {chosen.map((c) => (
          <span key={c.id} className='inline-flex items-center gap-1 rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-700'>
            {c.name}
            <button onClick={() => remove(c.id)} className='text-blue-400 hover:text-blue-700' aria-label='外す'>✕</button>
          </span>
        ))}
      </div>

      {chosen.length === 0 ? (
        <p className='rounded-xl border border-dashed border-gray-300 py-12 text-center text-sm text-gray-400'>
          上のメニューから候補者を選ぶと、ここに比較表が表示されます。
        </p>
      ) : (
        <div className='overflow-x-auto rounded-xl border border-gray-200 bg-white'>
          <table className='w-full text-sm'>
            <thead>
              <tr className='border-b border-gray-100'>
                <th className='p-3 text-left text-xs font-medium text-gray-400'>項目</th>
                {chosen.map((c) => (
                  <th key={c.id} className='p-3 text-left'>
                    <Link href={`/prototype/candidates/${c.id}`} className='font-bold text-gray-900 hover:text-blue-600'>{c.name}</Link>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.label} className='border-b border-gray-50 last:border-0'>
                  <td className='p-3 text-xs font-medium text-gray-500'>{r.label}</td>
                  {chosen.map((c) => (
                    <td key={c.id} className='p-3 text-gray-700'>{r.render(c)}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Link href='/prototype/candidates' className='mt-5 inline-block text-sm font-medium text-blue-600'>← 候補者一覧へ</Link>
    </div>
  )
}
