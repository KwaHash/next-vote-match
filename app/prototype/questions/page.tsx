'use client'

/**
 * 【プロトタイプ】seijiselect.jp 公開質問ボード
 *
 * 有権者が候補者に聞きたい質問を投票で可視化。上位質問は運営が候補者へ送付し、回答済み/未回答を比較表示。
 * 投稿は「選挙AI相談室」から。即時公開ではなく運営確認中→公開。特定候補への投票依頼・落選運動は不可。
 *
 * 注意: 動く仕様書。保存は localStorage（本番は Supabase + 運営確認）。回答比較はサンプル。
 */

import { Q_STATUS_COLOR, SEED_QUESTIONS, type PublicQuestion } from '../_questions'
import { STORE_KEYS, loadJSON, saveJSON } from '../_store'
import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'

export default function QuestionsPage() {
  const [questions, setQuestions] = useState<PublicQuestion[]>([])
  const [voted, setVoted] = useState<Set<string>>(new Set())
  const [open, setOpen] = useState<string | null>(null)
  const [tab, setTab] = useState<'list' | 'compare'>('list')

  useEffect(() => {
    const list = loadJSON<PublicQuestion[]>(STORE_KEYS.publicQuestions, SEED_QUESTIONS)
    setQuestions(list.length ? list : SEED_QUESTIONS)
  }, [])

  const persist = (next: PublicQuestion[]) => { setQuestions(next); saveJSON(STORE_KEYS.publicQuestions, next) }
  const vote = (id: string) => { if (voted.has(id)) return; persist(questions.map((q) => (q.id === id ? { ...q, voteCount: q.voteCount + 1 } : q))); setVoted((s) => new Set(s).add(id)) }

  // 公開側は「運営確認中」を一覧の最後に薄く、公開系を上に
  const visible = useMemo(() => [...questions].sort((a, b) => {
    const pa = a.status === '運営確認中' ? 1 : 0, pb = b.status === '運営確認中' ? 1 : 0
    return pa - pb || b.voteCount - a.voteCount
  }), [questions])

  // 候補者回答比較（回答データのある質問のみ）
  const answered = questions.filter((q) => q.answers && q.answers.length)
  const candCols = useMemo(() => {
    const set = new Set<string>()
    answered.forEach((q) => q.answers!.forEach((a) => set.add(a.candidate)))
    return [...set]
  }, [answered])
  const ansStatus = (q: PublicQuestion, cand: string) => q.answers?.find((a) => a.candidate === cand)?.status
  const ansCls = (s?: string) => s === '回答済み' ? 'text-emerald-600 font-semibold' : s === '未回答' ? 'text-gray-300' : 'text-gray-400'

  const card = 'rounded-xl border border-gray-200 bg-white p-4'

  return (
    <div className='mx-auto w-full max-w-2xl px-4 py-8'>
      <div className='mb-4'>
        <div className='mb-2 inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-600'><span className='h-1.5 w-1.5 rounded-full bg-blue-500' />プロトタイプ / seijiselect.jp</div>
        <h1 className='text-2xl font-bold text-gray-900'>公開質問ボード</h1>
        <p className='mt-1 text-sm text-gray-500'>候補者に聞きたい質問を、有権者みんなで可視化。投票の多い質問は運営が候補者へ送付し、回答済み／未回答を公開します。</p>
      </div>

      <div className='mb-4 flex items-center justify-between'>
        <div className='flex gap-1.5'>
          <button onClick={() => setTab('list')} className={`rounded-lg px-3 py-1.5 text-sm font-semibold ${tab === 'list' ? 'bg-slate-900 text-white' : 'border border-gray-300 text-gray-600 hover:bg-gray-50'}`}>質問一覧</button>
          <button onClick={() => setTab('compare')} className={`rounded-lg px-3 py-1.5 text-sm font-semibold ${tab === 'compare' ? 'bg-slate-900 text-white' : 'border border-gray-300 text-gray-600 hover:bg-gray-50'}`}>候補者回答 比較</button>
        </div>
        <Link href='/prototype/ai-consult' className='rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-700'>＋ 質問を投稿</Link>
      </div>

      {tab === 'list' && (
        <div className='space-y-2'>
          {visible.map((q) => (
            <div key={q.id} className={card}>
              <div className='flex items-start gap-3'>
                <div className='flex shrink-0 flex-col items-center'>
                  <button onClick={() => vote(q.id)} disabled={voted.has(q.id) || q.status === '運営確認中'} className={`flex h-12 w-12 flex-col items-center justify-center rounded-lg border text-center ${voted.has(q.id) ? 'border-blue-200 bg-blue-50 text-blue-600' : 'border-gray-200 text-gray-600 hover:border-blue-300 hover:text-blue-600 disabled:opacity-40'}`}>
                    <span className='text-[10px]'>▲</span>
                    <span className='text-sm font-bold'>{q.voteCount}</span>
                  </button>
                </div>
                <div className='min-w-0 flex-1'>
                  <div className='flex flex-wrap items-center gap-1.5'>
                    <span className='rounded-md bg-gray-100 px-2 py-0.5 text-[10px] font-bold text-gray-500'>{q.category}</span>
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${Q_STATUS_COLOR[q.status]}`}>{q.status}</span>
                    <span className='text-[10px] text-gray-400'>{q.electionName}</span>
                  </div>
                  <p className='mt-1 text-sm font-semibold text-gray-900'>{q.title}</p>
                  {q.body && q.body !== q.title && <p className='mt-0.5 text-xs text-gray-500'>{q.body}</p>}
                  <div className='mt-1 flex items-center gap-3 text-[10px] text-gray-400'>
                    <span>{q.nickname ?? '匿名'}</span><span>{q.createdAt}</span>
                    {q.answers && q.answers.length > 0 && <button onClick={() => setOpen(open === q.id ? null : q.id)} className='font-medium text-blue-600'>回答を見る {open === q.id ? '▲' : '▼'}</button>}
                  </div>
                  {open === q.id && q.answers && (
                    <div className='mt-2 space-y-1.5 border-t border-gray-100 pt-2'>
                      {q.answers.map((a) => (
                        <div key={a.candidate} className='text-xs'>
                          <span className='font-semibold text-gray-700'>{a.candidate}</span>
                          <span className={`ml-2 ${a.status === '回答済み' ? 'text-emerald-600' : 'text-gray-400'}`}>{a.status}</span>
                          {a.answer && <p className='mt-0.5 text-gray-600'>{a.answer}</p>}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
          <p className='mt-3 text-center text-[11px] text-gray-400'>※ 投稿は「運営確認中」を経て公開されます。投票は1人1票（プロトはこのセッション内のみ）。誹謗中傷・投票依頼・落選運動に見える内容は公開されません。</p>
        </div>
      )}

      {tab === 'compare' && (
        <>
          <h2 className='mb-2 text-sm font-bold text-gray-900'>上位質問への候補者回答（比較）</h2>
          {answered.length === 0 ? <p className={`${card} text-sm text-gray-400`}>比較できる回答データはまだありません。</p> : (
            <div className='overflow-x-auto rounded-xl border border-gray-200 bg-white'>
              <table className='w-full text-sm'>
                <thead><tr className='border-b border-gray-100'>
                  <th className='p-3 text-left text-xs font-medium text-gray-400'>質問</th>
                  {candCols.map((c) => <th key={c} className='whitespace-nowrap p-3 text-center text-xs font-medium text-gray-500'>{c}</th>)}
                </tr></thead>
                <tbody>
                  {answered.map((q) => (
                    <tr key={q.id} className='border-b border-gray-50 last:border-0'>
                      <td className='p-3 text-xs font-semibold text-gray-700'>{q.title}</td>
                      {candCols.map((c) => { const s = ansStatus(q, c); return <td key={c} className={`p-3 text-center text-xs ${ansCls(s)}`}>{s ?? '—'}</td> })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          <p className='mt-3 text-center text-[11px] text-gray-400'>※ 全候補者へ同一質問を同条件で送付。未回答は「未回答」と表示。特定候補を推奨するものではありません。</p>
        </>
      )}
    </div>
  )
}
