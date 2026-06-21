'use client'

/**
 * 【プロトタイプ】seijiselect.jp 政策マッチング診断
 *
 * 目的: 有権者が「どの政策を大事にしたいか」を答え、自分の関心テーマと
 *       「選び方タイプ（動物キャラ）」を知る。政党名より先にタイプを出す（構想の方針：対立を避ける）。
 *
 * 注意: 動く仕様書（プロトタイプ）。未ログインで使える。
 *   計算はクライアント側のルールベース（LLMは使わない＝コスト方針）。本番の /match に統合する想定。
 */

import { POLICY_THEMES } from '../_data'
import { saveJSON } from '../_store'
import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'

const MATCH_RESULT_KEY = 'proto_citizen_match_v1'

type Step = 'intro' | 'quiz' | 'result'

const IMPORTANCE = [
  { value: 3, label: 'とても重要' },
  { value: 2, label: 'まあ重要' },
  { value: 0, label: 'そうでもない' },
]

export default function CitizenMatchPage() {
  const [step, setStep] = useState<Step>('intro')
  const [idx, setIdx] = useState(0)
  const [scores, setScores] = useState<Record<string, number>>({})
  const [shareOpen, setShareOpen] = useState(false)
  const [copied, setCopied] = useState(false)

  const total = POLICY_THEMES.length
  const current = POLICY_THEMES[idx]

  const answer = (weight: number) => {
    const next = { ...scores, [current.id]: weight }
    setScores(next)
    if (idx + 1 < total) setIdx(idx + 1)
    else setStep('result')
  }

  const back = () => {
    if (idx > 0) setIdx(idx - 1)
    else setStep('intro')
  }

  const ranked = useMemo(
    () =>
      [...POLICY_THEMES]
        .map((t) => ({ theme: t, weight: scores[t.id] ?? 0 }))
        .sort((a, b) => b.weight - a.weight),
    [scores]
  )
  const top = ranked.filter((r) => r.weight > 0).slice(0, 3)
  const topTheme = top[0]?.theme

  const shareText = topTheme
    ? `私は${topTheme.animal}タイプ｜今回は「${topTheme.name}」で選ぶ派！ 政策マッチング診断 #seijiselect`
    : '政策マッチング診断 #seijiselect'
  const shareUrl = 'https://seijiselect.jp/match'
  const doShare = async () => {
    const navAny = typeof navigator !== 'undefined' ? (navigator as Navigator & { share?: (d: { text: string; url: string }) => Promise<void> }) : null
    if (navAny?.share) {
      try { await navAny.share({ text: shareText, url: shareUrl }); return } catch { /* fallthrough */ }
    }
    setShareOpen(true)
  }
  const copyShare = async () => {
    try { await navigator.clipboard.writeText(`${shareText} ${shareUrl}`); setCopied(true) } catch { /* ignore */ }
  }

  // 結果に到達したら保存（候補者一覧の一致率算出に使う）
  useEffect(() => {
    if (step !== 'result') return
    saveJSON(MATCH_RESULT_KEY, { weights: scores, savedAt: new Date().toISOString() })
  }, [step, scores])

  const restart = () => {
    setScores({})
    setIdx(0)
    setStep('intro')
  }

  if (step === 'intro') {
    return (
      <div className='mx-auto w-full max-w-xl px-4 py-12'>
        <div className='rounded-2xl border border-gray-200 bg-white p-8 text-center'>
          <div className='mb-3 inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-600'>
            <span className='h-1.5 w-1.5 rounded-full bg-blue-500' />
            プロトタイプ / seijiselect.jp
          </div>
          <h1 className='text-2xl font-bold text-gray-900'>政策マッチング診断</h1>
          <p className='mx-auto mt-3 max-w-md text-sm leading-relaxed text-gray-500'>
            あなたが大事にしたい政策を選ぶだけ。30秒で「あなたの選び方タイプ」が分かります。
            <br />
            登録不要・無料で使えます。
          </p>
          <button onClick={() => setStep('quiz')} className='mt-6 w-full rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-blue-700'>
            診断をはじめる（{total}問）
          </button>
          <p className='mt-3 text-xs text-gray-400'>※ 診断は参考情報です。投票判断はご自身で。</p>
        </div>
      </div>
    )
  }

  if (step === 'quiz') {
    const progress = Math.round((idx / total) * 100)
    return (
      <div className='mx-auto w-full max-w-xl px-4 py-10'>
        <div className='mb-6'>
          <div className='mb-2 flex items-center justify-between text-xs text-gray-500'>
            <button onClick={back} className='hover:text-gray-700'>← 戻る</button>
            <span>{idx + 1} / {total}</span>
          </div>
          <div className='h-2 w-full overflow-hidden rounded-full bg-gray-100'>
            <div className='h-full rounded-full bg-blue-500 transition-all duration-300' style={{ width: `${progress}%` }} />
          </div>
        </div>

        <div className='rounded-2xl border border-gray-200 bg-white p-8 text-center'>
          <div className='mb-4 text-5xl'>{current.emoji}</div>
          <p className='mb-1 text-xs font-medium text-blue-600'>{current.name}</p>
          <h2 className='mb-6 text-lg font-bold leading-relaxed text-gray-900'>{current.question}</h2>
          <div className='space-y-2'>
            {IMPORTANCE.map((opt) => (
              <button key={opt.value} onClick={() => answer(opt.value)} className='w-full rounded-xl border border-gray-200 px-4 py-3 text-sm font-medium text-gray-700 transition-colors hover:border-blue-400 hover:bg-blue-50'>
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className='mx-auto w-full max-w-xl px-4 py-10'>
      <div className='mb-6 overflow-hidden rounded-2xl border border-gray-200 bg-white text-center'>
        <div className='bg-gradient-to-b from-blue-50 to-white px-6 pb-6 pt-8'>
          {topTheme ? (
            <>
              <div className='mb-2 text-6xl'>{topTheme.emoji}</div>
              <p className='text-xs font-medium text-blue-600'>あなたの選び方タイプ</p>
              <h1 className='mt-1 text-2xl font-bold text-gray-900'>「{topTheme.animal}」タイプ</h1>
              <p className='mt-2 text-sm text-gray-600'>今回は<strong className='text-blue-700'>「{topTheme.name}」</strong>で選ぶ派</p>
            </>
          ) : (
            <>
              <div className='mb-2 text-6xl'>🤔</div>
              <h1 className='mt-1 text-xl font-bold text-gray-900'>関心テーマが見つかりませんでした</h1>
              <p className='mt-2 text-sm text-gray-500'>もう一度、気になる政策を選んでみてください。</p>
            </>
          )}
        </div>
      </div>

      {top.length > 0 && (
        <div className='mb-6 rounded-2xl border border-gray-200 bg-white p-6'>
          <h2 className='mb-4 text-sm font-bold text-gray-900'>あなたに近い政策テーマ</h2>
          <div className='space-y-3'>
            {top.map((r, i) => {
              const pct = Math.round((r.weight / 3) * 100)
              return (
                <div key={r.theme.id}>
                  <div className='mb-1 flex items-center justify-between text-sm'>
                    <span className='font-medium text-gray-800'>{i + 1}位　{r.theme.emoji} {r.theme.name}</span>
                    <span className='font-bold text-blue-600'>{pct}%</span>
                  </div>
                  <div className='h-2 w-full overflow-hidden rounded-full bg-gray-100'>
                    <div className='h-full rounded-full bg-blue-500' style={{ width: `${pct}%` }} />
                  </div>
                  <p className='mt-0.5 text-xs text-gray-400'>{r.theme.summary}</p>
                </div>
              )
            })}
          </div>
        </div>
      )}

      <div className='rounded-2xl border border-gray-200 bg-white p-6'>
        {topTheme && (
          <div className='mb-4 rounded-xl bg-blue-50 p-4 text-center text-sm text-blue-800'>
            「私は<strong>{topTheme.animal}タイプ</strong>｜今回は&quot;{topTheme.name}&quot;で選ぶ派」
          </div>
        )}
        <div className='grid grid-cols-2 gap-3'>
          <button onClick={doShare} className='rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-blue-700'>結果をシェア</button>
          <Link href='/prototype/candidates' className='rounded-xl border border-gray-300 px-4 py-3 text-center text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50'>
            近い候補者を見る
          </Link>
        </div>

        {/* シェア先（Web Share 非対応時の選択肢） */}
        {shareOpen && (
          <div className='mt-3 grid grid-cols-3 gap-2 rounded-xl border border-gray-200 bg-gray-50 p-3'>
            <a href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`} target='_blank' rel='noopener noreferrer' className='rounded-lg bg-black px-3 py-2 text-center text-xs font-semibold text-white'>X でシェア</a>
            <a href={`https://social-plugins.line.me/lineit/share?url=${encodeURIComponent(shareUrl)}`} target='_blank' rel='noopener noreferrer' className='rounded-lg bg-[#06C755] px-3 py-2 text-center text-xs font-semibold text-white'>LINE</a>
            <button onClick={copyShare} className='rounded-lg border border-gray-300 bg-white px-3 py-2 text-xs font-semibold text-gray-700'>{copied ? 'コピー済' : 'コピー'}</button>
          </div>
        )}
        <button onClick={restart} className='mt-3 w-full text-center text-xs text-gray-400 hover:text-gray-600'>もう一度診断する</button>
        <p className='mt-3 text-center text-xs text-gray-400'>※ 診断は参考情報です。投票判断はご自身で。</p>
      </div>
    </div>
  )
}
