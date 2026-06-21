'use client'

/**
 * 【プロトタイプ】seijiselect.jp あなたの寄付レポート
 *
 * 目的: 自分が寄付したお金が、どの政策に・どう配分され・どう使われ・どんな成果になったかを確認する。
 *       Donation ID 単位で使途・残高・成果を表示。
 *
 * 注意: 動く仕様書（プロトタイプ）。政策別寄付ページでの寄付を localStorage（proto_donations_v1）から表示。
 *   使用状況・成果はサンプル。本番は donations→allocations→expenses→impacts を紐づけて表示。
 */

import { STORE_KEYS, loadJSON } from '../_store'
import Link from 'next/link'
import { useEffect, useState } from 'react'

const yen = (n: number) => `¥${n.toLocaleString('ja-JP')}`
const SPENT_RATIO = 0.58

interface Donation {
  id: string
  themeId: string
  themeName: string
  emoji: string
  amount: number
  donateType: 'once' | 'monthly'
  allocMode: 'auto' | 'region'
  region: string
  allocation: { municipality: number; prefecture: number; national: number }
  date: string
}

// 寄付がまだ無いとき用のサンプル
const SAMPLE: Donation[] = [
  { id: 'DON-2026-000001', themeId: 'bosai', themeName: '防災・災害死ゼロ', emoji: '🛟', amount: 10000, donateType: 'once', allocMode: 'auto', region: '', allocation: { municipality: 40, prefecture: 35, national: 25 }, date: '2026-05-12' },
]

export default function DonationReportPage() {
  const [donations, setDonations] = useState<Donation[]>([])
  const [isSample, setIsSample] = useState(false)

  useEffect(() => {
    const arr = loadJSON<Donation[]>(STORE_KEYS.donations, [])
    if (arr.length > 0) {
      setDonations(arr)
    } else {
      setDonations(SAMPLE)
      setIsSample(true)
    }
  }, [])

  return (
    <div className='mx-auto w-full max-w-2xl px-4 py-8 pb-16'>
      <div className='mb-5'>
        <div className='mb-2 inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-600'>
          <span className='h-1.5 w-1.5 rounded-full bg-blue-500' />
          プロトタイプ / seijiselect.jp
        </div>
        <h1 className='text-2xl font-bold text-gray-900'>あなたの寄付レポート</h1>
        <p className='mt-1 text-sm text-gray-500'>
          あなたの寄付が、どの政策に・どう配分され・どう使われたかを確認できます。
        </p>
      </div>

      {isSample && (
        <div className='mb-5 rounded-xl border border-gray-200 bg-gray-50 p-3 text-sm text-gray-600'>
          まだ寄付がありません。下はサンプルです。
          <Link href='/prototype/policies' className='ml-1 font-semibold text-blue-600 underline'>政策一覧から寄付</Link>
          すると、ここに表示されます。
        </div>
      )}

      <div className='space-y-4'>
        {donations.map((d) => {
          const spent = Math.round(d.amount * SPENT_RATIO)
          const remain = d.amount - spent
          const usePct = Math.round((spent / d.amount) * 100)
          return (
            <div key={d.id} className='rounded-2xl border border-gray-200 bg-white p-5'>
              <div className='mb-3 flex items-start justify-between'>
                <div className='flex items-center gap-2'>
                  <span className='text-2xl'>{d.emoji}</span>
                  <div>
                    <p className='text-sm font-bold text-gray-900'>{d.themeName}</p>
                    <p className='font-mono text-[11px] text-gray-400'>{d.id}</p>
                  </div>
                </div>
                <div className='text-right'>
                  <p className='text-base font-bold text-gray-900'>{yen(d.amount)}</p>
                  <p className='text-[11px] text-gray-400'>{d.donateType === 'monthly' ? '月額' : '今回'} · {d.date}</p>
                </div>
              </div>

              {/* 使用状況 */}
              <div className='mb-3'>
                <div className='mb-1 flex items-center justify-between text-xs text-gray-500'>
                  <span>使用済み {yen(spent)}</span>
                  <span>未使用残高 {yen(remain)}</span>
                </div>
                <div className='flex h-2 w-full overflow-hidden rounded-full bg-gray-100'>
                  <div className='h-full bg-blue-500' style={{ width: `${usePct}%` }} />
                </div>
              </div>

              {/* 地域配分 */}
              <div className='mb-3 rounded-lg bg-gray-50 p-3 text-xs text-gray-600'>
                <p className='mb-1 font-medium text-gray-700'>地域配分{d.allocMode === 'region' && d.region ? `（指定: ${d.region}）` : '（おまかせ）'}</p>
                <div className='flex justify-between'>
                  <span>市区町村 {yen(Math.round(d.amount * d.allocation.municipality / 100))}</span>
                  <span>都道府県 {yen(Math.round(d.amount * d.allocation.prefecture / 100))}</span>
                  <span>国会 {yen(Math.round(d.amount * d.allocation.national / 100))}</span>
                </div>
              </div>

              {/* 使途・成果（サンプル） */}
              <div className='text-xs text-gray-600'>
                <p className='mb-1 font-medium text-gray-700'>使途・成果</p>
                <ul className='space-y-0.5 text-gray-500'>
                  <li>・政策調査費に充当</li>
                  <li>・議会質問・提言書の作成に反映</li>
                </ul>
                <Link href='/prototype/dashboard' className='mt-2 inline-block font-medium text-blue-600'>透明化ダッシュボードで全体を見る →</Link>
              </div>
            </div>
          )
        })}
      </div>

      <p className='mt-5 text-center text-xs text-gray-400'>
        ※ 使用状況・成果はサンプル。本番は 寄付ID(DON)→配分(Allocation)→支出(EXP)→成果(IMP) を紐づけて表示。
      </p>
    </div>
  )
}
