'use client'

/**
 * 【プロトタイプ】seijiselect.jp 地域×政策ランキング
 *
 * 目的: 全国・地域別に「どの政策への関心・支持が高いか」を可視化。
 *       SEO・SNS拡散コンテンツ（例:「東京都民が最も関心を持つ政策トップ10」）。
 * 注意: 動く仕様書。集計はサンプル値（本番: policy_votes / policy_funds を地域別に集計）。
 */

import { POLICY_THEMES } from '../_data'
import Link from 'next/link'
import { useState } from 'react'

type Tab = 'national' | 'prefecture' | 'municipality'

const TABS: { value: Tab; label: string }[] = [
  { value: 'national',     label: '全国' },
  { value: 'prefecture',   label: '都道府県' },
  { value: 'municipality', label: '市区町村' },
]

const PREFECTURES = ['東京都', '大阪府', '神奈川県', '愛知県', '埼玉県', '千葉県', '北海道', '福岡県', '京都府', '兵庫県']
const MUNICIPALITIES = ['渋谷区', '世田谷区', '杉並区', '新宿区', '港区', '大阪市', '名古屋市', '横浜市', '札幌市', '福岡市']

// サンプル集計（本番: policy_votes × regions の集計）
// 地域ごとに政策テーマの人気順をわずかにずらしたサンプル
const NATIONAL_RANKING = ['kosodate', 'bosai', 'nyusatsu', 'ai-gyosei', 'energy', 'chiho-zaisei', 'nettyusho', 'kotsu', 'kanko', 'jinken']

const PREF_RANKINGS: Record<string, string[]> = {
  '東京都':   ['ai-gyosei', 'kosodate', 'nyusatsu', 'bosai', 'energy', 'chiho-zaisei', 'jinken', 'kotsu', 'nettyusho', 'kanko'],
  '大阪府':   ['nyusatsu', 'ai-gyosei', 'kosodate', 'chiho-zaisei', 'bosai', 'energy', 'kotsu', 'jinken', 'nettyusho', 'kanko'],
  '神奈川県': ['kosodate', 'bosai', 'ai-gyosei', 'energy', 'nyusatsu', 'kotsu', 'chiho-zaisei', 'jinken', 'nettyusho', 'kanko'],
  '愛知県':   ['energy', 'bosai', 'kosodate', 'kotsu', 'ai-gyosei', 'nyusatsu', 'chiho-zaisei', 'kanko', 'nettyusho', 'jinken'],
  '埼玉県':   ['kosodate', 'kotsu', 'bosai', 'ai-gyosei', 'energy', 'nyusatsu', 'chiho-zaisei', 'nettyusho', 'kanko', 'jinken'],
  '千葉県':   ['kosodate', 'bosai', 'kotsu', 'ai-gyosei', 'nyusatsu', 'energy', 'nettyusho', 'chiho-zaisei', 'kanko', 'jinken'],
  '北海道':   ['bosai', 'kanko', 'energy', 'kosodate', 'chiho-zaisei', 'ai-gyosei', 'kotsu', 'nettyusho', 'nyusatsu', 'jinken'],
  '福岡県':   ['kosodate', 'bosai', 'kanko', 'ai-gyosei', 'energy', 'nyusatsu', 'chiho-zaisei', 'kotsu', 'jinken', 'nettyusho'],
  '京都府':   ['jinken', 'kanko', 'kosodate', 'bosai', 'nyusatsu', 'ai-gyosei', 'energy', 'chiho-zaisei', 'kotsu', 'nettyusho'],
  '兵庫県':   ['kosodate', 'bosai', 'energy', 'kanko', 'nyusatsu', 'chiho-zaisei', 'ai-gyosei', 'kotsu', 'nettyusho', 'jinken'],
}

const CITY_RANKINGS: Record<string, string[]> = {
  '渋谷区':   ['ai-gyosei', 'jinken', 'nyusatsu', 'kosodate', 'bosai', 'energy', 'kotsu', 'chiho-zaisei', 'kanko', 'nettyusho'],
  '世田谷区': ['kosodate', 'bosai', 'ai-gyosei', 'kotsu', 'nyusatsu', 'energy', 'jinken', 'chiho-zaisei', 'nettyusho', 'kanko'],
  '杉並区':   ['kosodate', 'nyusatsu', 'bosai', 'ai-gyosei', 'kotsu', 'energy', 'jinken', 'chiho-zaisei', 'kanko', 'nettyusho'],
  '新宿区':   ['ai-gyosei', 'nyusatsu', 'jinken', 'kosodate', 'bosai', 'energy', 'kotsu', 'kanko', 'chiho-zaisei', 'nettyusho'],
  '港区':     ['ai-gyosei', 'nyusatsu', 'energy', 'jinken', 'kosodate', 'bosai', 'kanko', 'kotsu', 'chiho-zaisei', 'nettyusho'],
  '大阪市':   ['nyusatsu', 'ai-gyosei', 'kosodate', 'chiho-zaisei', 'bosai', 'energy', 'kotsu', 'kanko', 'jinken', 'nettyusho'],
  '名古屋市': ['energy', 'kotsu', 'bosai', 'kosodate', 'ai-gyosei', 'nyusatsu', 'chiho-zaisei', 'kanko', 'nettyusho', 'jinken'],
  '横浜市':   ['kosodate', 'bosai', 'ai-gyosei', 'energy', 'kotsu', 'nyusatsu', 'chiho-zaisei', 'nettyusho', 'kanko', 'jinken'],
  '札幌市':   ['bosai', 'kanko', 'energy', 'kosodate', 'chiho-zaisei', 'ai-gyosei', 'nettyusho', 'kotsu', 'nyusatsu', 'jinken'],
  '福岡市':   ['kosodate', 'kanko', 'bosai', 'ai-gyosei', 'energy', 'nyusatsu', 'chiho-zaisei', 'kotsu', 'jinken', 'nettyusho'],
}

// サンプル投票数（全国）
const VOTE_COUNTS: Record<string, number> = {
  kosodate: 5085, bosai: 3821, nyusatsu: 3590, 'ai-gyosei': 3330,
  energy: 3620, 'chiho-zaisei': 2850, nettyusho: 2745, kotsu: 2620, kanko: 2800, jinken: 2620,
}

const theme = (id: string) => POLICY_THEMES.find((t) => t.id === id)

const MEDAL = ['🥇', '🥈', '🥉']

export default function RankingPage() {
  const [tab, setTab] = useState<Tab>('national')
  const [region, setRegion] = useState<string>(PREFECTURES[0])

  const regionList = tab === 'prefecture' ? PREFECTURES : MUNICIPALITIES
  const rankingIds =
    tab === 'national'     ? NATIONAL_RANKING :
    tab === 'prefecture'   ? (PREF_RANKINGS[region]  ?? NATIONAL_RANKING) :
                             (CITY_RANKINGS[region]   ?? NATIONAL_RANKING)

  const title =
    tab === 'national' ? '全国' :
    `${region}`

  return (
    <div className='mx-auto w-full max-w-3xl px-4 py-8'>
      <div className='mb-5'>
        <div className='mb-2 inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-600'>
          <span className='h-1.5 w-1.5 rounded-full bg-blue-500' />
          プロトタイプ / seijiselect.jp
        </div>
        <h1 className='text-2xl font-bold text-gray-900'>地域×政策ランキング</h1>
        <p className='mt-1 text-sm text-gray-500'>
          地域ごとに「どの政策への関心が高いか」を比較できます。
        </p>
      </div>

      {/* タブ */}
      <div className='mb-4 flex rounded-xl border border-gray-200 bg-white p-1'>
        {TABS.map((t) => (
          <button
            key={t.value}
            onClick={() => { setTab(t.value); setRegion(t.value === 'prefecture' ? PREFECTURES[0] : MUNICIPALITIES[0]) }}
            className={`flex-1 rounded-lg py-2 text-sm font-semibold transition-colors ${
              tab === t.value ? 'bg-blue-600 text-white' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* 地域選択 */}
      {tab !== 'national' && (
        <div className='mb-5'>
          <div className='flex flex-wrap gap-2'>
            {regionList.map((r) => (
              <button
                key={r}
                onClick={() => setRegion(r)}
                className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
                  region === r
                    ? 'border-blue-500 bg-blue-600 text-white'
                    : 'border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50'
                }`}
              >
                {r}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ランキングカード */}
      <div className='mb-6 overflow-hidden rounded-xl border border-gray-200 bg-white'>
        <div className='border-b border-gray-100 bg-gray-50 px-5 py-3'>
          <h2 className='text-sm font-bold text-gray-900'>
            {title} 政策関心ランキング
          </h2>
          <p className='text-[11px] text-gray-400'>賛成票・支援者数・診断関心度の総合集計（サンプル）</p>
        </div>
        <div className='divide-y divide-gray-50'>
          {rankingIds.map((id, i) => {
            const t = theme(id)
            if (!t) return null
            const votes = tab === 'national' ? VOTE_COUNTS[id] ?? 0 : Math.round((VOTE_COUNTS[id] ?? 0) * (0.05 + Math.random() * 0.1))
            const maxVotes = tab === 'national' ? Math.max(...Object.values(VOTE_COUNTS)) : votes * 1.2
            const barPct = Math.round((votes / maxVotes) * 100)

            return (
              <div key={id} className='flex items-center gap-3 px-5 py-3.5'>
                <div className='w-7 shrink-0 text-center text-lg'>
                  {i < 3 ? MEDAL[i] : <span className='text-sm font-bold text-gray-400'>{i + 1}</span>}
                </div>
                <div className='text-2xl shrink-0'>{t.emoji}</div>
                <div className='min-w-0 flex-1'>
                  <div className='flex items-center justify-between'>
                    <span className='text-sm font-semibold text-gray-900'>{t.name}</span>
                    <span className='text-xs font-bold text-blue-600'>{votes.toLocaleString()}票</span>
                  </div>
                  <div className='mt-1 h-1.5 w-full overflow-hidden rounded-full bg-gray-100'>
                    <div
                      className={`h-full rounded-full transition-all ${i === 0 ? 'bg-amber-400' : i === 1 ? 'bg-gray-400' : i === 2 ? 'bg-orange-300' : 'bg-blue-400'}`}
                      style={{ width: `${barPct}%` }}
                    />
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* 全国比較ミニマップ（都道府県タブ限定） */}
      {tab === 'prefecture' && (
        <div className='mb-6 rounded-xl border border-gray-200 bg-white p-5'>
          <h2 className='mb-3 text-sm font-bold text-gray-900'>都道府県別 1位政策マップ</h2>
          <div className='grid grid-cols-2 gap-2 sm:grid-cols-3'>
            {PREFECTURES.map((pref) => {
              const top = PREF_RANKINGS[pref]?.[0]
              const t = theme(top ?? '')
              return (
                <button
                  key={pref}
                  onClick={() => setRegion(pref)}
                  className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-left text-xs transition-colors ${
                    region === pref ? 'border-blue-400 bg-blue-50' : 'border-gray-100 hover:border-gray-200'
                  }`}
                >
                  <span className='text-base'>{t?.emoji ?? '🏛️'}</span>
                  <div>
                    <p className='font-semibold text-gray-700'>{pref}</p>
                    <p className='text-[10px] text-gray-400'>{t?.name ?? '—'}</p>
                  </div>
                </button>
              )
            })}
          </div>
        </div>
      )}

      {/* 注目トレンド */}
      <div className='rounded-xl border border-gray-200 bg-white p-5'>
        <h2 className='mb-3 text-sm font-bold text-gray-900'>📈 今週の注目トレンド</h2>
        <div className='space-y-2'>
          {[
            { id: 'kosodate', change: '+12%', reason: '給食無償化の議論が活発化' },
            { id: 'nyusatsu', change: '+8%',  reason: '政治資金問題の報道を受け関心上昇' },
            { id: 'energy',   change: '+6%',  reason: '電気代高騰で再エネへの関心増加' },
          ].map((item) => {
            const t = theme(item.id)
            return (
              <div key={item.id} className='flex items-center gap-3 rounded-lg bg-gray-50 px-3 py-2.5'>
                <span className='text-xl'>{t?.emoji}</span>
                <div className='min-w-0 flex-1'>
                  <span className='text-sm font-semibold text-gray-800'>{t?.name}</span>
                  <p className='text-[11px] text-gray-400'>{item.reason}</p>
                </div>
                <span className='shrink-0 text-xs font-bold text-emerald-600'>{item.change}</span>
              </div>
            )
          })}
        </div>
      </div>

      <div className='mt-6 flex gap-3'>
        <Link href='/prototype/policies' className='flex-1 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-center text-sm font-semibold text-gray-700 hover:bg-gray-50'>
          政策一覧・賛否投票
        </Link>
        <Link href='/prototype/match' className='flex-1 rounded-xl bg-blue-600 px-4 py-2.5 text-center text-sm font-semibold text-white hover:bg-blue-700'>
          政策マッチング診断
        </Link>
      </div>

      <p className='mt-4 text-center text-xs text-gray-400'>
        ※ プロトタイプのため集計はサンプル値。本番: policy_votes / supporters の地域別集計。
      </p>
    </div>
  )
}
