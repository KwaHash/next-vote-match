'use client'

/**
 * 【プロトタイプ】seijiselect.jp 透明化ダッシュボード（未ログイン公開）
 *
 * 目的: 寄付がどう使われたかを公開する。総額・支出・残高・支出分類・地域別配分・成果を可視化。
 *       「寄付して終わり」でなく使い道が見えることが、本プラットフォーム最大の差別化点。
 *
 * 注意: 動く仕様書（プロトタイプ）。
 *   政策ファンド総額・支援者数・地域別配分は POLICY_THEMES から集計。
 *   支出分類・成果（Impact）・月次は本番では expenses / impacts / monthly_reports から。
 */

import { POLICY_THEMES } from '../_data'
import Link from 'next/link'
import { useMemo } from 'react'

const yen = (n: number) => `¥${n.toLocaleString('ja-JP')}`
const SPENT_RATIO = 0.58 // プロト: 集まった額のうち支出済みの割合

const EXPENSE_BREAKDOWN: { label: string; ratio: number; color: string }[] = [
  { label: '政策調査・分析', ratio: 0.22, color: '#2563eb' },
  { label: '広報・動画制作', ratio: 0.2, color: '#3b82f6' },
  { label: '議会質問・提言書', ratio: 0.18, color: '#60a5fa' },
  { label: '地域説明会', ratio: 0.13, color: '#93c5fd' },
  { label: '専門家ヒアリング', ratio: 0.12, color: '#1d4ed8' },
  { label: '運営費', ratio: 0.15, color: '#bfdbfe' },
]

const IMPACTS = [
  { id: 'IMP-2026-000001', theme: '防災・災害死ゼロ', emoji: '🛟', title: '都議会で避難所への蓄電池配備の予算化を提言', date: '2026-05' },
  { id: 'IMP-2026-000002', theme: '入札透明化', emoji: '🔍', title: '自治体入札データの公開を要望し、3市で実現', date: '2026-04' },
  { id: 'IMP-2026-000003', theme: '子育て・教育', emoji: '🎒', title: '学校給食無償化の条例案を会派から提出', date: '2026-06' },
  { id: 'IMP-2026-000004', theme: '高齢者熱中症対策', emoji: '🌡️', title: '高齢者向け「涼み所マップ」を作成・公開', date: '2026-05' },
  { id: 'IMP-2026-000005', theme: 'エネルギー・蓄電池', emoji: '🔋', title: '公共施設への蓄電池導入を行政に提言', date: '2026-03' },
]

const MONTHLY = [
  { month: '2026-03', raised: 2800000, spent: 1500000 },
  { month: '2026-04', raised: 3600000, spent: 2100000 },
  { month: '2026-05', raised: 4200000, spent: 2600000 },
  { month: '2026-06', raised: 3150000, spent: 1900000 },
]

export default function TransparencyDashboardPage() {
  const totals = useMemo(() => {
    const raised = POLICY_THEMES.reduce((s, t) => s + t.raised, 0)
    const supporters = POLICY_THEMES.reduce((s, t) => s + t.supporters, 0)
    const spent = Math.round(raised * SPENT_RATIO)
    const balance = raised - spent
    // 地域別配分（各政策の集まった額 × 標準配分）
    const region = POLICY_THEMES.reduce(
      (acc, t) => {
        acc.municipality += Math.round(t.raised * (t.allocation.municipality / 100))
        acc.prefecture += Math.round(t.raised * (t.allocation.prefecture / 100))
        acc.national += Math.round(t.raised * (t.allocation.national / 100))
        return acc
      },
      { municipality: 0, prefecture: 0, national: 0 }
    )
    return { raised, supporters, spent, balance, region }
  }, [])

  const regionTotal = totals.region.municipality + totals.region.prefecture + totals.region.national
  const maxMonthly = Math.max(...MONTHLY.map((m) => m.raised))

  const card = 'rounded-xl border border-gray-200 bg-white p-4'

  return (
    <div className='mx-auto w-full max-w-3xl px-4 py-8 pb-16'>
      <div className='mb-5'>
        <div className='mb-2 inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-600'>
          <span className='h-1.5 w-1.5 rounded-full bg-blue-500' />
          プロトタイプ / seijiselect.jp
        </div>
        <h1 className='text-2xl font-bold text-gray-900'>透明化ダッシュボード</h1>
        <p className='mt-1 text-sm text-gray-500'>
          集まった寄付が、何に・どこで・どんな成果に使われたかを公開しています（ログイン不要）。
        </p>
      </div>

      {/* サマリー */}
      <div className='mb-5 grid grid-cols-2 gap-3 sm:grid-cols-4'>
        <div className={card}>
          <p className='text-xs text-gray-500'>政策ファンド総額</p>
          <p className='mt-1 text-base font-bold text-gray-900'>{yen(totals.raised)}</p>
        </div>
        <div className={card}>
          <p className='text-xs text-gray-500'>支援者数</p>
          <p className='mt-1 text-base font-bold text-gray-900'>{totals.supporters.toLocaleString('ja-JP')}名</p>
        </div>
        <div className={card}>
          <p className='text-xs text-gray-500'>支出済み</p>
          <p className='mt-1 text-base font-bold text-rose-600'>{yen(totals.spent)}</p>
        </div>
        <div className={card}>
          <p className='text-xs text-gray-500'>未使用残高</p>
          <p className='mt-1 text-base font-bold text-emerald-600'>{yen(totals.balance)}</p>
        </div>
      </div>

      {/* 支出分類 */}
      <div className={`${card} mb-5`}>
        <h2 className='mb-3 text-sm font-bold text-gray-900'>支出の分類</h2>
        {/* 帯グラフ */}
        <div className='mb-3 flex h-3 w-full overflow-hidden rounded-full'>
          {EXPENSE_BREAKDOWN.map((e) => (
            <div key={e.label} style={{ width: `${e.ratio * 100}%`, backgroundColor: e.color }} />
          ))}
        </div>
        <div className='space-y-1.5'>
          {EXPENSE_BREAKDOWN.map((e) => (
            <div key={e.label} className='flex items-center justify-between text-sm'>
              <span className='flex items-center gap-2 text-gray-700'>
                <span className='inline-block h-2.5 w-2.5 rounded-sm' style={{ backgroundColor: e.color }} />
                {e.label}
              </span>
              <span className='text-gray-500'>{yen(Math.round(totals.spent * e.ratio))}</span>
            </div>
          ))}
        </div>
      </div>

      {/* 地域別支援額 */}
      <div className={`${card} mb-5`}>
        <h2 className='mb-3 text-sm font-bold text-gray-900'>地域別の配分</h2>
        {[
          { label: '市区町村', value: totals.region.municipality, color: '#2563eb' },
          { label: '都道府県', value: totals.region.prefecture, color: '#60a5fa' },
          { label: '国会・国政', value: totals.region.national, color: '#93c5fd' },
        ].map((r) => {
          const pct = regionTotal ? Math.round((r.value / regionTotal) * 100) : 0
          return (
            <div key={r.label} className='mb-2'>
              <div className='mb-1 flex items-center justify-between text-sm'>
                <span className='text-gray-700'>{r.label}</span>
                <span className='text-gray-500'>{yen(r.value)}（{pct}%）</span>
              </div>
              <div className='h-2 w-full overflow-hidden rounded-full bg-gray-100'>
                <div className='h-full rounded-full' style={{ width: `${pct}%`, backgroundColor: r.color }} />
              </div>
            </div>
          )
        })}
      </div>

      {/* 政策別の支援状況 */}
      <div className={`${card} mb-5`}>
        <h2 className='mb-3 text-sm font-bold text-gray-900'>政策別の支援状況</h2>
        <div className='space-y-2.5'>
          {[...POLICY_THEMES].sort((a, b) => b.raised - a.raised).map((t) => {
            const pct = Math.min(100, Math.round((t.raised / t.budget) * 100))
            return (
              <Link key={t.id} href={`/prototype/policies/${t.id}`} className='block'>
                <div className='mb-1 flex items-center justify-between text-sm'>
                  <span className='text-gray-700'>{t.emoji} {t.name}</span>
                  <span className='text-gray-500'>{yen(t.raised)}</span>
                </div>
                <div className='h-1.5 w-full overflow-hidden rounded-full bg-gray-100'>
                  <div className='h-full rounded-full bg-blue-500' style={{ width: `${pct}%` }} />
                </div>
              </Link>
            )
          })}
        </div>
      </div>

      {/* 成果一覧 */}
      <div className={`${card} mb-5`}>
        <h2 className='mb-3 text-sm font-bold text-gray-900'>成果一覧</h2>
        <div className='space-y-2'>
          {IMPACTS.map((im) => (
            <div key={im.id} className='flex items-start gap-3 rounded-lg border border-gray-100 p-3'>
              <span className='text-xl'>{im.emoji}</span>
              <div className='min-w-0 flex-1'>
                <p className='text-sm font-medium text-gray-800'>{im.title}</p>
                <p className='mt-0.5 text-[11px] text-gray-400'>
                  <span className='font-mono'>{im.id}</span> · {im.theme} · {im.date}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 月次レポート */}
      <div className={card}>
        <h2 className='mb-3 text-sm font-bold text-gray-900'>月次レポート</h2>
        <div className='space-y-2'>
          {MONTHLY.map((m) => (
            <div key={m.month}>
              <div className='mb-1 flex items-center justify-between text-xs text-gray-500'>
                <span>{m.month}</span>
                <span>集まった {yen(m.raised)} / 支出 {yen(m.spent)}</span>
              </div>
              <div className='flex h-2 w-full gap-1'>
                <div className='h-full rounded-full bg-blue-400' style={{ width: `${(m.raised / maxMonthly) * 50}%` }} />
                <div className='h-full rounded-full bg-rose-300' style={{ width: `${(m.spent / maxMonthly) * 50}%` }} />
              </div>
            </div>
          ))}
        </div>
        <p className='mt-3 text-center text-[11px] text-gray-400'>
          ※ サンプル値。本番は寄付ID（DON）→支出ID（EXP）→成果ID（IMP）を紐づけて自動集計（BACKLOG 5章）。
        </p>
      </div>
    </div>
  )
}
