'use client'

/**
 * 【プロトタイプ】seijiselect.jp 月額で応援する（定期支援の登録・寄付者視点）
 *
 * 目的: 有権者が、政策や候補者を「毎月の定期支援（サブスク）」で応援できる。
 *       登録・金額・配分を選び、定期支援を開始／一覧／解約する。
 *
 * 注意: 動く仕様書（プロトタイプ）。決済はせず登録のみ（proto_recurring_support_v1）。
 *   本番は決済代行のクレカ定期課金＋本人確認・政治資金規正法対応。受け取りはプラットフォーム集約方式。
 */

import { POLICY_THEMES } from '../_data'
import { STORE_KEYS, loadJSON, saveJSON } from '../_store'
import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'

const yen = (n: number) => `¥${n.toLocaleString('ja-JP')}`
const TIERS = [500, 1000, 3000, 10000]

interface Sub {
  id: string
  themeId: string
  amount: number
  allocMode: 'auto' | 'region'
  region: string
  startedAt: string
}

export default function RecurringPage() {
  const [themeId, setThemeId] = useState(POLICY_THEMES[0].id)
  const [amount, setAmount] = useState<number>(1000)
  const [allocMode, setAllocMode] = useState<'auto' | 'region'>('auto')
  const [region, setRegion] = useState('')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [subs, setSubs] = useState<Sub[]>([])
  const [doneId, setDoneId] = useState<string | null>(null)

  useEffect(() => {
    const d = loadJSON<{ subs?: Sub[] } | null>(STORE_KEYS.recurringSupport, null)
    if (d?.subs) setSubs(d.subs)
  }, [])

  const persist = (next: Sub[]) => { setSubs(next); saveJSON(STORE_KEYS.recurringSupport, { subs: next }) }
  const theme = useMemo(() => POLICY_THEMES.find((t) => t.id === themeId) ?? POLICY_THEMES[0], [themeId])

  const subscribe = () => {
    const seq = String(Math.floor(Date.now() / 1000) % 1000000).padStart(6, '0')
    const id = `SUP-2026-${seq}`
    const next = [{ id, themeId, amount, allocMode, region, startedAt: new Date().toISOString().slice(0, 10) }, ...subs]
    persist(next)
    setDoneId(id)
  }
  const cancel = (id: string) => persist(subs.filter((s) => s.id !== id))

  const inputCls = 'w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-400'
  const labelCls = 'mb-1 block text-xs font-medium text-gray-600'

  return (
    <div className='mx-auto w-full max-w-xl px-4 py-8 pb-12'>
      <div className='mb-5'>
        <div className='mb-2 inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-600'>
          <span className='h-1.5 w-1.5 rounded-full bg-blue-500' />
          プロトタイプ / seijiselect.jp
        </div>
        <h1 className='text-2xl font-bold text-gray-900'>月額で応援する</h1>
        <p className='mt-1 text-sm text-gray-500'>毎月の定期支援で、政策を継続的に応援できます。いつでも解約できます。</p>
      </div>

      {doneId ? (
        <div className='rounded-2xl border border-emerald-200 bg-emerald-50 p-6 text-center'>
          <div className='text-3xl'>🙏</div>
          <p className='mt-2 text-sm font-semibold text-emerald-800'>定期支援を開始しました（プロト）</p>
          <p className='mt-1 text-xs text-emerald-700'>支援ID: <span className='font-mono'>{doneId}</span></p>
          <p className='mt-1 text-sm text-gray-700'>{theme.emoji} {theme.name} に毎月 {yen(amount)}</p>
          <p className='mt-2 text-xs text-gray-500'>毎月末に課金され、使い道と成果は「寄付レポート」「透明化ダッシュボード」で確認できます。</p>
          <button onClick={() => setDoneId(null)} className='mt-3 text-xs text-gray-400 hover:text-gray-600'>続けて設定する</button>
        </div>
      ) : (
        <div className='space-y-4'>
          {/* 支援先 */}
          <div className='rounded-xl border border-gray-200 bg-white p-5'>
            <label className={labelCls}>応援する政策</label>
            <select className={inputCls} value={themeId} onChange={(e) => setThemeId(e.target.value)}>
              {POLICY_THEMES.map((t) => <option key={t.id} value={t.id}>{t.emoji} {t.name}</option>)}
            </select>
          </div>

          {/* 金額 */}
          <div className='rounded-xl border border-gray-200 bg-white p-5'>
            <label className={labelCls}>毎月の金額</label>
            <div className='mb-2 grid grid-cols-4 gap-2'>
              {TIERS.map((t) => (
                <button key={t} onClick={() => setAmount(t)} className={`rounded-lg border px-2 py-2 text-sm font-semibold ${amount === t ? 'border-blue-400 bg-blue-50 text-blue-700' : 'border-gray-200 text-gray-600 hover:bg-gray-50'}`}>{yen(t)}</button>
              ))}
            </div>
            <input type='number' min={100} className={inputCls} value={amount} onChange={(e) => setAmount(Number(e.target.value) || 0)} />
            <div className='mt-3'>
              <label className={labelCls}>配分</label>
              <div className='flex gap-2'>
                {([['auto', 'おまかせ'], ['region', '地域を指定']] as const).map(([v, l]) => (
                  <button key={v} onClick={() => setAllocMode(v)} className={`flex-1 rounded-lg border px-3 py-2 text-xs font-medium ${allocMode === v ? 'border-blue-400 bg-blue-50 text-blue-700' : 'border-gray-200 text-gray-600 hover:bg-gray-50'}`}>{l}</button>
                ))}
              </div>
              {allocMode === 'region' && <input className={`${inputCls} mt-2`} placeholder='例: 東京都 / 渋谷区' value={region} onChange={(e) => setRegion(e.target.value)} />}
            </div>
          </div>

          {/* お支払い情報（プロト） */}
          <div className='rounded-xl border border-gray-200 bg-white p-5'>
            <label className={labelCls}>お名前</label>
            <input className={`${inputCls} mb-2`} placeholder='例: 山田 花子' value={name} onChange={(e) => setName(e.target.value)} />
            <label className={labelCls}>メールアドレス</label>
            <input className={inputCls} type='email' placeholder='you@example.com' value={email} onChange={(e) => setEmail(e.target.value)} />
            <p className='mt-2 text-[11px] text-gray-400'>※ プロトはカード情報を扱いません。本番は決済代行のクレカ登録・本人確認に進みます。</p>
          </div>

          <button onClick={subscribe} className='w-full rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white hover:bg-blue-700'>
            毎月 {yen(amount)} で応援する
          </button>
          <p className='text-center text-[11px] text-gray-400'>いつでも解約できます。実際の決済は行われません（プロト）。</p>
        </div>
      )}

      {/* あなたの定期支援 */}
      {subs.length > 0 && (
        <div className='mt-6 rounded-xl border border-gray-200 bg-white p-5'>
          <h2 className='mb-3 text-sm font-bold text-gray-900'>あなたの定期支援（{subs.length}件）</h2>
          <div className='space-y-2'>
            {subs.map((s) => {
              const t = POLICY_THEMES.find((x) => x.id === s.themeId)
              return (
                <div key={s.id} className='flex items-center gap-3 rounded-lg border border-gray-100 px-3 py-2.5'>
                  <span className='text-lg'>{t?.emoji}</span>
                  <div className='min-w-0 flex-1'>
                    <p className='text-sm font-medium text-gray-800'>{t?.name} <span className='text-gray-500'>{yen(s.amount)}/月</span></p>
                    <p className='font-mono text-[11px] text-gray-400'>{s.id} ・ 開始 {s.startedAt} ・ 毎月末課金</p>
                  </div>
                  <button onClick={() => cancel(s.id)} className='shrink-0 rounded-lg border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-500 hover:bg-gray-50'>解約</button>
                </div>
              )
            })}
          </div>
          <Link href='/prototype/report' className='mt-3 inline-block text-xs font-medium text-blue-600'>寄付レポートで使い道を見る →</Link>
        </div>
      )}
    </div>
  )
}
