'use client'

/**
 * 【プロトタイプ】seijiselect.jp 政策詳細＋政策別寄付
 *
 * 目的: 課題・解決案・支援状況・賛同候補を見て、その政策に寄付・応援できる。
 *       寄付には Donation ID を発行する想定（トレーサビリティの起点）。
 *
 * 注意: 動く仕様書（プロトタイプ）。実際の寄付・本人確認・決済は本番で実装（BACKLOG 8章）。
 *   未ログインでも寄付ページまで閲覧可。寄付確定時に本人確認へ進む想定。
 */

import { POLICY_THEMES, SAMPLE_CANDIDATES } from '../../_data'
import { STORE_KEYS, loadJSON, saveJSON } from '../../_store'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { useMemo, useState } from 'react'

const yen = (n: number) => `¥${n.toLocaleString('ja-JP')}`

type DonateType = 'once' | 'monthly'
type AllocMode = 'auto' | 'region'

const ONCE_PRESETS = [1000, 3000, 5000, 10000]
const MONTHLY_PRESETS = [500, 1000, 3000, 10000]

// 政策投票（賛否・優先度・支援意思）
const STANCE_OPTS = ['賛成', 'どちらかといえば賛成', '中立', 'どちらかといえば反対', '反対']
const PRIORITY_OPTS = ['今すぐ進めるべき', '1〜3年以内', '中長期でよい', '優先度は低い']
const SUPPORT_OPTS = ['寄付したい', 'SNSで広めたい', '勉強会に参加したい', '意見だけ送りたい']
// 集計サンプル（本番は policy_votes 集計）
const SAMPLE_RESULT = { agree: 68, neutral: 20, disagree: 12 }
const SAMPLE_CONCERNS = ['財源が不明', '実施主体が不明', '地方自治体の負担が大きい']
// 応援する方法（支援導線。お金以外も含め、表明すると assist マイページに反映される想定）
const SUPPORT_METHODS = ['寄付する', 'SNSで広める', '勉強会に参加する', '友人に紹介する', '会場を貸せる', '動画編集を手伝える', 'チラシ配布を手伝える']

export default function PolicyDetailPage() {
  const params = useParams()
  const id = String(params?.id ?? '')
  const theme = useMemo(() => POLICY_THEMES.find((t) => t.id === id), [id])

  const [donateType, setDonateType] = useState<DonateType>('once')
  const [amount, setAmount] = useState<number>(3000)
  const [allocMode, setAllocMode] = useState<AllocMode>('auto')
  const [region, setRegion] = useState('')
  const [donationId, setDonationId] = useState<string | null>(null)
  const [stance, setStance] = useState('')
  const [priority, setPriority] = useState('')
  const [supportWish, setSupportWish] = useState<string[]>([])
  const [voted, setVoted] = useState(false)
  const [methods, setMethods] = useState<string[]>([])
  const [methodsDone, setMethodsDone] = useState(false)

  if (!theme) {
    return (
      <div className='mx-auto w-full max-w-2xl px-4 py-16 text-center'>
        <p className='text-gray-500'>政策が見つかりませんでした。</p>
        <Link href='/prototype/policies' className='mt-3 inline-block text-sm font-medium text-blue-600'>← 政策一覧へ</Link>
      </div>
    )
  }

  const presets = donateType === 'once' ? ONCE_PRESETS : MONTHLY_PRESETS
  const pct = Math.min(100, Math.round((theme.raised / theme.budget) * 100))
  const endorsers = SAMPLE_CANDIDATES.filter((c) => c.themes.includes(theme.id))

  const donate = () => {
    // プロトタイプ: Donation ID を発行（本番は本人確認→決済→採番）
    const seq = String(Math.floor(Date.now() / 1000) % 1000000).padStart(6, '0')
    const did = `DON-2026-${seq}`
    // 寄付レポート用に記録（本番は donations テーブル）
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const arr = loadJSON<any[]>(STORE_KEYS.donations, [])
    arr.unshift({
      id: did, themeId: theme.id, themeName: theme.name, emoji: theme.emoji,
      amount, donateType, allocMode, region, allocation: theme.allocation,
      date: new Date().toISOString().slice(0, 10),
    })
    saveJSON(STORE_KEYS.donations, arr)
    setDonationId(did)
  }

  const inputCls =
    'w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-400'

  return (
    <div className='mx-auto w-full max-w-2xl px-4 py-8 pb-16'>
      <Link href='/prototype/policies' className='mb-4 inline-block text-xs text-gray-400 hover:text-gray-600'>← 政策一覧</Link>

      {/* ヘッダー */}
      <div className='rounded-2xl border border-gray-200 bg-white p-6'>
        <div className='mb-2 text-4xl'>{theme.emoji}</div>
        <h1 className='text-2xl font-bold text-gray-900'>{theme.name}</h1>
        <p className='mt-1 text-sm text-gray-500'>{theme.summary}</p>

        {/* 支援状況 */}
        <div className='mt-4'>
          <div className='mb-1 flex items-center justify-between text-sm'>
            <span className='font-bold text-gray-900'>{yen(theme.raised)}</span>
            <span className='text-xs text-gray-400'>目標 {yen(theme.budget)}（{pct}%）</span>
          </div>
          <div className='h-2 w-full overflow-hidden rounded-full bg-gray-100'>
            <div className='h-full rounded-full bg-blue-500' style={{ width: `${pct}%` }} />
          </div>
          <p className='mt-1.5 text-xs text-gray-400'>支援者 {theme.supporters}名 · 賛同候補 {endorsers.length}名</p>
        </div>
      </div>

      {/* 課題・解決案 */}
      <div className='mt-4 grid gap-3 sm:grid-cols-2'>
        <div className='rounded-xl border border-gray-200 bg-white p-4'>
          <h2 className='mb-1 text-xs font-bold text-rose-600'>現状の課題</h2>
          <p className='text-sm text-gray-700'>{theme.challenge}</p>
        </div>
        <div className='rounded-xl border border-gray-200 bg-white p-4'>
          <h2 className='mb-1 text-xs font-bold text-emerald-600'>解決案</h2>
          <p className='text-sm text-gray-700'>{theme.solution}</p>
        </div>
      </div>

      {/* 地域配分 */}
      <div className='mt-4 rounded-xl border border-gray-200 bg-white p-4'>
        <h2 className='mb-2 text-xs font-bold text-gray-700'>寄付の標準地域配分</h2>
        <div className='flex h-3 w-full overflow-hidden rounded-full'>
          <div className='bg-blue-600' style={{ width: `${theme.allocation.municipality}%` }} />
          <div className='bg-blue-400' style={{ width: `${theme.allocation.prefecture}%` }} />
          <div className='bg-blue-300' style={{ width: `${theme.allocation.national}%` }} />
        </div>
        <div className='mt-1.5 flex justify-between text-[11px] text-gray-500'>
          <span>市区町村 {theme.allocation.municipality}%</span>
          <span>都道府県 {theme.allocation.prefecture}%</span>
          <span>国会 {theme.allocation.national}%</span>
        </div>
      </div>

      {/* 賛同候補 */}
      {endorsers.length > 0 && (
        <div className='mt-4 rounded-xl border border-gray-200 bg-white p-4'>
          <h2 className='mb-2 text-xs font-bold text-gray-700'>この政策に賛同している候補者</h2>
          <div className='flex flex-wrap gap-2'>
            {endorsers.map((c) => (
              <span key={c.id} className='rounded-full bg-gray-100 px-2.5 py-1 text-xs text-gray-700'>{c.name}（{c.party}）</span>
            ))}
          </div>
        </div>
      )}

      {/* 政策投票 */}
      <div className='mt-6 rounded-2xl border border-gray-200 bg-white p-6'>
        <h2 className='mb-1 text-base font-bold text-gray-900'>この政策に投票する</h2>
        <p className='mb-4 text-xs text-gray-400'>結果は人気投票ではなく、政策を良くするための声として集計します。</p>

        {voted ? (
          <div>
            <div className='mb-3 rounded-xl bg-blue-50 p-4'>
              <p className='mb-2 text-sm font-semibold text-blue-800'>この政策への反応</p>
              {[['賛成', SAMPLE_RESULT.agree, 'bg-emerald-500'], ['中立', SAMPLE_RESULT.neutral, 'bg-gray-400'], ['反対', SAMPLE_RESULT.disagree, 'bg-rose-500']].map(([label, v, color]) => (
                <div key={label as string} className='mb-1.5'>
                  <div className='flex justify-between text-xs text-gray-600'><span>{label}</span><span>{v}%</span></div>
                  <div className='h-1.5 w-full overflow-hidden rounded-full bg-white'><div className={`h-full ${color}`} style={{ width: `${v}%` }} /></div>
                </div>
              ))}
            </div>
            <div className='rounded-xl bg-amber-50 p-4'>
              <p className='mb-1.5 text-sm font-semibold text-amber-800'>多い懸念</p>
              <ol className='list-inside list-decimal space-y-0.5 text-xs text-amber-700'>
                {SAMPLE_CONCERNS.map((c) => (<li key={c}>{c}</li>))}
              </ol>
            </div>
            <p className='mt-3 text-center text-xs text-emerald-600'>投票ありがとうございました（プロト）</p>
            <button onClick={() => setVoted(false)} className='mt-1 w-full text-center text-xs text-gray-400 hover:text-gray-600'>やり直す</button>
          </div>
        ) : (
          <div className='space-y-4'>
            <div>
              <p className='mb-2 text-sm font-medium text-gray-700'>この政策をどう思いますか？</p>
              <div className='flex flex-wrap gap-2'>
                {STANCE_OPTS.map((o) => (
                  <button key={o} onClick={() => setStance(o)} className={`rounded-full px-3 py-1.5 text-xs font-medium ${stance === o ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>{o}</button>
                ))}
              </div>
            </div>
            <div>
              <p className='mb-2 text-sm font-medium text-gray-700'>優先度は？</p>
              <div className='flex flex-wrap gap-2'>
                {PRIORITY_OPTS.map((o) => (
                  <button key={o} onClick={() => setPriority(o)} className={`rounded-full px-3 py-1.5 text-xs font-medium ${priority === o ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>{o}</button>
                ))}
              </div>
            </div>
            <div>
              <p className='mb-2 text-sm font-medium text-gray-700'>支援できますか？（複数可）</p>
              <div className='flex flex-wrap gap-2'>
                {SUPPORT_OPTS.map((o) => (
                  <button key={o} onClick={() => setSupportWish((p) => p.includes(o) ? p.filter((x) => x !== o) : [...p, o])} className={`rounded-full px-3 py-1.5 text-xs font-medium ${supportWish.includes(o) ? 'bg-emerald-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>{o}</button>
                ))}
              </div>
            </div>
            <button onClick={() => setVoted(true)} disabled={!stance} className='w-full rounded-xl bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-300'>
              投票する
            </button>
          </div>
        )}
      </div>

      {/* 応援する方法（支援導線→assist） */}
      <div className='mt-6 rounded-2xl border border-emerald-200 bg-emerald-50/40 p-6'>
        <h2 className='mb-1 text-base font-bold text-gray-900'>この政策を応援する方法</h2>
        <p className='mb-4 text-xs text-gray-500'>お金以外でも応援できます。選んで表明すると、支援マイページ（assist）に反映されます。</p>
        {methodsDone ? (
          <div className='rounded-xl bg-white p-4 text-center'>
            <div className='text-2xl'>🤝</div>
            <p className='mt-1 text-sm font-semibold text-emerald-800'>{methods.length}件の応援を表明しました（プロト）</p>
            <p className='mt-1 text-xs text-gray-500'>support.seijiselect.jp の「今できる支援」に追加されました。</p>
            <a href='https://hiromitsu.tail612ce7.ts.net:8444/prototype/dashboard' target='_blank' rel='noopener noreferrer' className='mt-2 inline-block text-xs font-semibold text-emerald-600 underline'>支援ダッシュボードを見る →</a>
            <button onClick={() => { setMethodsDone(false); setMethods([]) }} className='mt-2 block w-full text-center text-xs text-gray-400 hover:text-gray-600'>やり直す</button>
          </div>
        ) : (
          <>
            <div className='flex flex-wrap gap-2'>
              {SUPPORT_METHODS.map((m) => (
                <button key={m} onClick={() => setMethods((p) => p.includes(m) ? p.filter((x) => x !== m) : [...p, m])} className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${methods.includes(m) ? 'bg-emerald-600 text-white' : 'bg-white text-gray-600 ring-1 ring-gray-200 hover:bg-gray-50'}`}>{m}</button>
              ))}
            </div>
            <button onClick={() => setMethodsDone(true)} disabled={methods.length === 0} className='mt-4 w-full rounded-xl bg-emerald-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-gray-300'>
              応援を表明する
            </button>
          </>
        )}
      </div>

      {/* 寄付 */}
      <div className='mt-6 rounded-2xl border border-blue-200 bg-blue-50/40 p-6'>
        <h2 className='mb-4 text-base font-bold text-gray-900'>この政策に寄付・応援する</h2>

        {donationId ? (
          <div className='rounded-xl border border-emerald-200 bg-emerald-50 p-5 text-center'>
            <div className='text-3xl'>🙏</div>
            <p className='mt-2 text-sm font-semibold text-emerald-800'>ありがとうございます（プロトタイプ）</p>
            <p className='mt-1 text-xs text-emerald-700'>寄付ID: <span className='font-mono'>{donationId}</span></p>
            <p className='mt-2 text-xs text-gray-500'>
              本番では、この後に本人確認・決済へ進み、使途と成果が「寄付レポート」「透明化ダッシュボード」で追跡できます。
            </p>
            <button onClick={() => setDonationId(null)} className='mt-3 text-xs text-gray-400 hover:text-gray-600'>戻る</button>
          </div>
        ) : (
          <>
            {/* 寄付タイプ */}
            <div className='mb-4 flex gap-2'>
              {([['once', '今回だけ'], ['monthly', '月額で応援']] as const).map(([v, l]) => (
                <button
                  key={v}
                  onClick={() => { setDonateType(v); setAmount(v === 'once' ? 3000 : 1000) }}
                  className={`flex-1 rounded-lg border px-3 py-2 text-sm font-semibold transition-colors ${donateType === v ? 'border-blue-400 bg-blue-50 text-blue-700' : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50'}`}
                >
                  {l}
                </button>
              ))}
            </div>

            {/* 金額 */}
            <div className='mb-4'>
              <div className='mb-2 grid grid-cols-4 gap-2'>
                {presets.map((p) => (
                  <button
                    key={p}
                    onClick={() => setAmount(p)}
                    className={`rounded-lg border px-2 py-2 text-sm font-semibold transition-colors ${amount === p ? 'border-blue-400 bg-blue-50 text-blue-700' : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50'}`}
                  >
                    {yen(p)}
                  </button>
                ))}
              </div>
              <input
                type='number'
                min={0}
                className={inputCls}
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value) || 0)}
              />
            </div>

            {/* 配分モード */}
            <div className='mb-4'>
              <div className='mb-2 flex gap-2'>
                {([['auto', 'おまかせ配分'], ['region', '地域を指定']] as const).map(([v, l]) => (
                  <button
                    key={v}
                    onClick={() => setAllocMode(v)}
                    className={`flex-1 rounded-lg border px-3 py-2 text-xs font-medium transition-colors ${allocMode === v ? 'border-blue-400 bg-blue-50 text-blue-700' : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50'}`}
                  >
                    {l}
                  </button>
                ))}
              </div>
              {allocMode === 'region' && (
                <input className={inputCls} placeholder='例: 東京都 / 渋谷区' value={region} onChange={(e) => setRegion(e.target.value)} />
              )}
              {allocMode === 'auto' && (
                <p className='text-xs text-gray-400'>標準配分（市区町村 {theme.allocation.municipality}% / 都道府県 {theme.allocation.prefecture}% / 国会 {theme.allocation.national}%）で配分されます。</p>
              )}
            </div>

            <button
              onClick={donate}
              disabled={amount <= 0}
              className='w-full rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-300'
            >
              {donateType === 'monthly' ? `毎月 ${yen(amount)} で応援する` : `${yen(amount)} を寄付する`}
            </button>
            <p className='mt-2 text-center text-[11px] text-gray-400'>
              ※ プロトタイプです。実際の決済は行われません。本番は本人確認・寄付上限・政治資金規正法の確認を実装。
            </p>
          </>
        )}
      </div>
    </div>
  )
}
