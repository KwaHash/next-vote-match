'use client'

/**
 * 【プロトタイプ】seijiselect.jp ●●選挙 候補者一覧（比較）
 *
 * 目的: 個別選挙の候補者を3軸で比較する。
 *   軸1 政策の重点（あなたの関心との一致）/ 軸2 実行力・現実性（財源・実績）/ 軸3 透明性・信頼
 *
 * 注意: 動く仕様書（プロトタイプ）。候補者データは管理者（admin）が登録・取込します。
 *   本番: 管理画面でCSV→DB取込（elections / candidacies テーブル）。
 */

import { POLICY_THEMES } from '../_data'
import { loadJSON } from '../_store'
import Link from 'next/link'
import { useEffect, useState } from 'react'

const STORAGE_KEY = 'proto_election_v1'
const MATCH_RESULT_KEY = 'proto_citizen_match_v1'

interface Cand {
  name: string
  party: string
  age: string
  status: string
  policies: string[]
  finance: string
  transparency: string
  achievement: string
}

const SAMPLE_CANDS: Cand[] = [
  {
    name: '区民 一郎', party: '無所属', age: '58', status: '現職',
    policies: ['防災・災害死ゼロ', '子育て・教育'],
    finance: '明確', transparency: '高', achievement: '区議3期・防災予算化',
  },
  {
    name: '杉並 花子', party: '中道改革', age: '46', status: '新人',
    policies: ['子育て・教育', 'AI行政改革'],
    finance: '一部', transparency: '中', achievement: 'NPO代表・待機児童ゼロ運動',
  },
  {
    name: '高円寺 健', party: '無所属', age: '51', status: '新人',
    policies: ['入札透明化', '地方財政改革'],
    finance: '明確', transparency: '高', achievement: '公認会計士・行財政改革を提言',
  },
  {
    name: '阿佐ヶ谷 みどり', party: 'れいわ新選', age: '39', status: '新人',
    policies: ['人権外交', '子育て・教育'],
    finance: '不明', transparency: '中', achievement: '市民活動家・子ども食堂運営',
  },
]

const financeRating = (f: string) => (f.includes('明確') ? '◎' : f.includes('一部') ? '○' : '△')
const transRating = (t: string) => (t.includes('高') ? '◎' : t.includes('中') ? '○' : '△')
const ratingColor = (r: string) =>
  r === '◎' ? 'text-emerald-600 font-bold' : r === '○' ? 'text-blue-600' : 'text-amber-600'
const themeId = (name: string) => POLICY_THEMES.find((t) => t.name === name)?.id

export default function ElectionPage() {
  const [electionName, setElectionName] = useState('杉並区長選挙')
  const [cands, setCands] = useState<Cand[]>(SAMPLE_CANDS)
  const [weights, setWeights] = useState<Record<string, number> | null>(null)

  useEffect(() => {
    const d = loadJSON<{ electionName?: string; cands?: Cand[] } | null>(STORAGE_KEY, null)
    if (d) {
      setElectionName(d.electionName ?? '杉並区長選挙')
      setCands(d.cands?.length ? d.cands : SAMPLE_CANDS)
    }
    const m = loadJSON<{ weights?: Record<string, number> } | null>(MATCH_RESULT_KEY, null)
    if (m) setWeights(m.weights ?? null)
  }, [])

  const interestMatch = (c: Cand): number => {
    if (!weights) return 0
    return c.policies.filter((p) => {
      const id = themeId(p)
      return id && (weights[id] ?? 0) >= 2
    }).length
  }

  const axisRows: { label: string; sub: string; render: (c: Cand) => React.ReactNode }[] = [
    {
      label: '所属・立場', sub: '基本情報',
      render: (c) => <span>{c.party} / {c.status}{c.age ? ` / ${c.age}歳` : ''}</span>,
    },
    {
      label: '軸1 政策の重点', sub: 'あなたの関心との一致',
      render: (c) => (
        <div>
          <div className='flex flex-wrap gap-1'>
            {c.policies.map((p) => (
              <span key={p} className='rounded-full bg-blue-50 px-2 py-0.5 text-[11px] text-blue-600'>{p}</span>
            ))}
          </div>
          {weights && (
            <p className='mt-1 text-[11px] text-emerald-600'>あなたの関心と {interestMatch(c)} 個一致</p>
          )}
        </div>
      ),
    },
    {
      label: '軸2 実行力・現実性', sub: '財源の明確さ・実績',
      render: (c) => (
        <div>
          <span className={ratingColor(financeRating(c.finance))}>財源 {financeRating(c.finance)}</span>
          <span className='ml-1 text-xs text-gray-400'>({c.finance || '—'})</span>
          {c.achievement && <p className='mt-0.5 text-[11px] text-gray-500'>{c.achievement}</p>}
        </div>
      ),
    },
    {
      label: '軸3 透明性・信頼', sub: '情報公開の姿勢',
      render: (c) => (
        <span className={ratingColor(transRating(c.transparency))}>
          透明性 {transRating(c.transparency)}{' '}
          <span className='text-xs font-normal text-gray-400'>({c.transparency || '—'})</span>
        </span>
      ),
    },
  ]

  return (
    <div className='mx-auto w-full max-w-3xl px-4 py-8'>
      <div className='mb-5'>
        <div className='mb-2 inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-600'>
          <span className='h-1.5 w-1.5 rounded-full bg-blue-500' />
          プロトタイプ / seijiselect.jp
        </div>
        <h1 className='text-2xl font-bold text-gray-900'>{electionName}</h1>
        <p className='mt-1 text-sm text-gray-500'>候補者を3つの軸で比較できます。</p>
      </div>

      {!weights && (
        <div className='mb-4 rounded-xl border border-gray-200 bg-gray-50 p-3 text-sm text-gray-600'>
          <Link href='/prototype/match' className='font-semibold text-blue-600 underline'>
            政策マッチング診断
          </Link>
          を受けると、軸1に「あなたの関心との一致」が表示されます。
        </div>
      )}

      <div className='overflow-x-auto rounded-xl border border-gray-200 bg-white'>
        <table className='w-full text-sm'>
          <thead>
            <tr className='border-b border-gray-100'>
              <th className='whitespace-nowrap p-3 text-left text-xs font-medium text-gray-400'>比較軸</th>
              {cands.map((c) => (
                <th key={c.name} className='min-w-[140px] p-3 text-left'>
                  <span className='font-bold text-gray-900'>{c.name}</span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {axisRows.map((r) => (
              <tr key={r.label} className='border-b border-gray-50 align-top last:border-0'>
                <td className='p-3'>
                  <p className='whitespace-nowrap text-xs font-semibold text-gray-700'>{r.label}</p>
                  <p className='whitespace-nowrap text-[10px] text-gray-400'>{r.sub}</p>
                </td>
                {cands.map((c) => (
                  <td key={c.name} className='p-3 text-gray-700'>{r.render(c)}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className='mt-4 text-center text-xs text-gray-400'>
        ※ 候補者データは管理者が登録します（本番: elections / candidacies テーブル）。
      </p>
    </div>
  )
}
