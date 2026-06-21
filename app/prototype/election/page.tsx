'use client'

/**
 * 【プロトタイプ】seijiselect.jp ●●選挙 候補者一覧（CSV取込＋比較）
 *
 * 目的: 個別選挙（例: 杉並区長選挙）の候補者を CSV でアップロードして一覧化し、3軸で比較する。
 *   軸1 政策の重点（あなたの関心との一致）/ 軸2 実行力・現実性（財源・実績）/ 軸3 透明性・信頼
 *
 * 注意: 動く仕様書（プロトタイプ）。取込結果は localStorage（proto_election_v1）。
 *   本番は CSV→DB取込（管理画面）＋ elections/candidacies テーブル。
 */

import { POLICY_THEMES } from '../_data'
import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'

const STORAGE_KEY = 'proto_election_v1'
const MATCH_RESULT_KEY = 'proto_citizen_match_v1'

interface Cand {
  name: string
  party: string
  age: string
  status: string
  policies: string[] // 重点政策（テーマ名）
  finance: string // 明確/一部/不明
  transparency: string // 高/中/低
  achievement: string
}

const SAMPLE_CSV = `氏名,所属,年齢,立場,重点政策,財源,透明性,実績
区民 一郎,無所属,58,現職,防災・災害死ゼロ/子育て・教育,明確,高,区議3期・防災予算化
杉並 花子,中道改革,46,新人,子育て・教育/AI行政改革,一部,中,NPO代表・待機児童ゼロ運動
高円寺 健,無所属,51,新人,入札透明化/地方財政改革,明確,高,公認会計士・行財政改革を提言
阿佐ヶ谷 みどり,れいわ新選,39,新人,人権外交/子育て・教育,不明,中,市民活動家・子ども食堂運営`

function parseCSV(text: string): Cand[] {
  const lines = text.split(/\r?\n/).map((l) => l.trim()).filter(Boolean)
  if (!lines.length) return []
  // 先頭行が「氏名」で始まればヘッダーとして飛ばす
  const rows = lines[0].startsWith('氏名') ? lines.slice(1) : lines
  return rows.map((line) => {
    const c = line.split(',').map((s) => s.trim())
    return {
      name: c[0] ?? '', party: c[1] ?? '', age: c[2] ?? '', status: c[3] ?? '',
      policies: (c[4] ?? '').split(/[\/、]/).map((s) => s.trim()).filter(Boolean),
      finance: c[5] ?? '', transparency: c[6] ?? '', achievement: c[7] ?? '',
    }
  }).filter((c) => c.name)
}

const financeRating = (f: string) => (f.includes('明確') ? '◎' : f.includes('一部') ? '○' : '△')
const transRating = (t: string) => (t.includes('高') ? '◎' : t.includes('中') ? '○' : '△')
const ratingColor = (r: string) => (r === '◎' ? 'text-emerald-600 font-bold' : r === '○' ? 'text-blue-600' : 'text-amber-600')
const themeId = (name: string) => POLICY_THEMES.find((t) => t.name === name)?.id

export default function ElectionPage() {
  const [electionName, setElectionName] = useState('杉並区長選挙')
  const [cands, setCands] = useState<Cand[]>([])
  const [csvText, setCsvText] = useState('')
  const [showHelp, setShowHelp] = useState(false)
  const [weights, setWeights] = useState<Record<string, number> | null>(null)

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) { const d = JSON.parse(raw); setElectionName(d.electionName ?? '杉並区長選挙'); setCands(d.cands ?? []) }
      const m = localStorage.getItem(MATCH_RESULT_KEY)
      if (m) setWeights(JSON.parse(m).weights ?? null)
    } catch { /* ignore */ }
  }, [])

  const persist = (name: string, list: Cand[]) => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify({ electionName: name, cands: list })) } catch { /* ignore */ }
  }

  const importCSV = (text: string) => {
    const parsed = parseCSV(text)
    if (parsed.length) { setCands(parsed); persist(electionName, parsed) }
  }
  const onFile = (file?: File) => {
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => { const t = String(reader.result ?? ''); setCsvText(t); importCSV(t) }
    reader.readAsText(file)
  }
  const clearAll = () => { setCands([]); persist(electionName, []) }

  // あなたの関心と一致する重点政策の数
  const interestMatch = (c: Cand): number => {
    if (!weights) return 0
    return c.policies.filter((p) => { const id = themeId(p); return id && (weights[id] ?? 0) >= 2 }).length
  }

  const axisRows: { label: string; sub: string; render: (c: Cand) => React.ReactNode }[] = [
    { label: '所属・立場', sub: '基本情報', render: (c) => <span>{c.party} / {c.status}{c.age ? ` / ${c.age}歳` : ''}</span> },
    {
      label: '軸1 政策の重点', sub: 'あなたの関心との一致',
      render: (c) => (
        <div>
          <div className='flex flex-wrap gap-1'>{c.policies.map((p) => <span key={p} className='rounded-full bg-blue-50 px-2 py-0.5 text-[11px] text-blue-600'>{p}</span>)}</div>
          {weights && <p className='mt-1 text-[11px] text-emerald-600'>あなたの関心と {interestMatch(c)} 個一致</p>}
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
      render: (c) => <span className={ratingColor(transRating(c.transparency))}>透明性 {transRating(c.transparency)} <span className='text-xs font-normal text-gray-400'>({c.transparency || '—'})</span></span>,
    },
  ]

  return (
    <div className='mx-auto w-full max-w-3xl px-4 py-8'>
      <div className='mb-5'>
        <div className='mb-2 inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-600'>
          <span className='h-1.5 w-1.5 rounded-full bg-blue-500' />
          プロトタイプ / seijiselect.jp
        </div>
        <input
          className='w-full border-b border-transparent bg-transparent text-2xl font-bold text-gray-900 hover:border-gray-200 focus:border-blue-400 focus:outline-none'
          value={electionName}
          onChange={(e) => { setElectionName(e.target.value); persist(e.target.value, cands) }}
        />
        <p className='mt-1 text-sm text-gray-500'>候補者をCSVで取り込み、3つの軸で比較できます。</p>
      </div>

      {/* CSV取込 */}
      <div className='mb-5 rounded-xl border border-gray-200 bg-white p-4'>
        <div className='mb-2 flex items-center justify-between'>
          <h2 className='text-sm font-bold text-gray-900'>候補者CSVを取り込む</h2>
          <button onClick={() => setShowHelp((v) => !v)} className='text-xs text-blue-600'>{showHelp ? '閉じる' : '形式を見る'}</button>
        </div>
        {showHelp && (
          <pre className='mb-2 overflow-x-auto rounded-lg bg-gray-50 p-3 text-[11px] text-gray-600'>{`氏名,所属,年齢,立場,重点政策,財源,透明性,実績
例) 区民 一郎,無所属,58,現職,防災・災害死ゼロ/子育て・教育,明確,高,区議3期
・重点政策は「/」区切り（テーマ名は政策一覧と合わせると関心一致が出ます）
・財源: 明確/一部/不明　・透明性: 高/中/低`}</pre>
        )}
        <textarea
          rows={3}
          className='w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-xs focus:border-blue-400 focus:outline-none'
          placeholder='ここにCSVを貼り付け…'
          value={csvText}
          onChange={(e) => setCsvText(e.target.value)}
        />
        <div className='mt-2 flex flex-wrap gap-2'>
          <button onClick={() => importCSV(csvText)} className='rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-700'>取り込む</button>
          <label className='cursor-pointer rounded-lg border border-gray-300 px-4 py-2 text-xs font-medium text-gray-600 hover:bg-gray-50'>
            CSVファイルを選択
            <input type='file' accept='.csv,text/csv' className='hidden' onChange={(e) => onFile(e.target.files?.[0])} />
          </label>
          <button onClick={() => { setCsvText(SAMPLE_CSV); importCSV(SAMPLE_CSV) }} className='rounded-lg border border-gray-300 px-4 py-2 text-xs font-medium text-gray-600 hover:bg-gray-50'>サンプルを投入</button>
          {cands.length > 0 && <button onClick={clearAll} className='rounded-lg px-4 py-2 text-xs font-medium text-rose-500 hover:bg-rose-50'>クリア</button>}
        </div>
      </div>

      {!weights && cands.length > 0 && (
        <div className='mb-4 rounded-xl border border-gray-200 bg-gray-50 p-3 text-sm text-gray-600'>
          <Link href='/prototype/match' className='font-semibold text-blue-600 underline'>政策マッチング診断</Link>を受けると、軸1に「あなたの関心との一致」が表示されます。
        </div>
      )}

      {/* 比較表 */}
      {cands.length === 0 ? (
        <p className='rounded-xl border border-dashed border-gray-300 py-12 text-center text-sm text-gray-400'>
          まだ候補者がありません。「サンプルを投入」または CSV を取り込んでください。
        </p>
      ) : (
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
                  {cands.map((c) => (<td key={c.name} className='p-3 text-gray-700'>{r.render(c)}</td>))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <p className='mt-4 text-center text-xs text-gray-400'>
        ※ プロトはCSVをブラウザ内に保存。本番は管理画面でCSV→DB取込（elections / candidacies）。
      </p>
    </div>
  )
}
