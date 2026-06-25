'use client'

/**
 * 【プロトタイプ】seijiselect.jp 候補者向けプレミアムプラン
 *
 * マネタイズ①: 候補者の有料プロフィール強化
 * マネタイズ②: 政策クラファン手数料（手数料体系の提示）
 * 注意: 動く仕様書。決済は行わない。
 *   本番: Stripe + candidates / subscriptions テーブル
 */

import { useState } from 'react'

type Plan = 'free' | 'standard' | 'premium'

const PLANS: {
  id: Plan; name: string; price: string; priceNote: string
  color: string; badge?: string
  features: { label: string; included: boolean; note?: string }[]
}[] = [
  {
    id: 'free', name: 'フリー', price: '¥0', priceNote: '無料・ずっと',
    color: 'border-gray-200',
    features: [
      { label: '基本プロフィール（氏名・政党・選挙区）', included: true },
      { label: '注力政策テーマ（3つまで）', included: true },
      { label: '診断との一致率表示', included: true },
      { label: '透明化スコア表示', included: true },
      { label: 'プロフィール写真', included: false },
      { label: '公約・実績の詳細入力', included: false },
      { label: 'SNS・公式サイトリンク', included: false },
      { label: 'クラウドファンディング掲載', included: false },
      { label: '支援者CRMへのアクセス', included: false },
      { label: '検索結果での優先表示', included: false },
    ],
  },
  {
    id: 'standard', name: 'スタンダード', price: '¥2,980', priceNote: '/月（税込）',
    color: 'border-blue-400', badge: 'おすすめ',
    features: [
      { label: '基本プロフィール（氏名・政党・選挙区）', included: true },
      { label: '注力政策テーマ（無制限）', included: true },
      { label: '診断との一致率表示', included: true },
      { label: '透明化スコア表示', included: true },
      { label: 'プロフィール写真', included: true },
      { label: '公約・実績の詳細入力', included: true },
      { label: 'SNS・公式サイトリンク', included: true },
      { label: 'クラウドファンディング掲載（手数料5%）', included: true, note: '寄付成立分のみ' },
      { label: '支援者CRMへのアクセス', included: false },
      { label: '検索結果での優先表示', included: false },
    ],
  },
  {
    id: 'premium', name: 'プレミアム', price: '¥9,800', priceNote: '/月（税込）',
    color: 'border-violet-500',
    features: [
      { label: '基本プロフィール（氏名・政党・選挙区）', included: true },
      { label: '注力政策テーマ（無制限）', included: true },
      { label: '診断との一致率表示', included: true },
      { label: '透明化スコア表示', included: true },
      { label: 'プロフィール写真・動画', included: true },
      { label: '公約・実績の詳細入力', included: true },
      { label: 'SNS・公式サイトリンク', included: true },
      { label: 'クラウドファンディング掲載（手数料3%）', included: true, note: '手数料優遇' },
      { label: '支援者CRM（最大500人）', included: true },
      { label: '検索結果での優先表示', included: true },
    ],
  },
]

const FEE_TABLE = [
  { plan: 'フリー',       rate: '—',   note: 'クラファン不可' },
  { plan: 'スタンダード', rate: '5%',  note: '寄付成立分のみ課金' },
  { plan: 'プレミアム',   rate: '3%',  note: '手数料優遇 + 優先表示' },
]

export default function PremiumPage() {
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null)
  const [showModal, setShowModal] = useState(false)

  const apply = (plan: Plan) => {
    setSelectedPlan(plan)
    setShowModal(true)
  }

  return (
    <div className='mx-auto w-full max-w-4xl px-4 py-8'>
      <div className='mb-6 text-center'>
        <div className='mb-2 inline-flex items-center gap-2 rounded-full bg-violet-50 px-3 py-1 text-xs font-medium text-violet-600'>
          <span className='h-1.5 w-1.5 rounded-full bg-violet-500' />
          候補者向けサービス / seijiselect.jp
        </div>
        <h1 className='text-2xl font-bold text-gray-900'>候補者プレミアムプラン</h1>
        <p className='mt-2 text-sm text-gray-500'>
          有権者への露出を高め、政策クラウドファンディングで活動資金を集めましょう。
        </p>
      </div>

      {/* プランカード */}
      <div className='mb-8 grid gap-4 sm:grid-cols-3'>
        {PLANS.map((plan) => (
          <div
            key={plan.id}
            className={`relative flex flex-col rounded-2xl border-2 bg-white p-6 ${plan.color}`}
          >
            {plan.badge && (
              <div className='absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-blue-600 px-3 py-0.5 text-[11px] font-bold text-white'>
                {plan.badge}
              </div>
            )}
            <h2 className='text-base font-bold text-gray-900'>{plan.name}</h2>
            <div className='mt-1 flex items-end gap-1'>
              <span className='text-2xl font-bold text-gray-900'>{plan.price}</span>
              <span className='mb-0.5 text-xs text-gray-400'>{plan.priceNote}</span>
            </div>

            <ul className='mt-4 space-y-2 flex-1'>
              {plan.features.map((f) => (
                <li key={f.label} className='flex items-start gap-2 text-xs'>
                  <span className={`mt-0.5 shrink-0 text-sm ${f.included ? 'text-emerald-500' : 'text-gray-300'}`}>
                    {f.included ? '✓' : '✕'}
                  </span>
                  <span className={f.included ? 'text-gray-700' : 'text-gray-300'}>
                    {f.label}
                    {f.note && <span className='ml-1 text-[10px] text-gray-400'>({f.note})</span>}
                  </span>
                </li>
              ))}
            </ul>

            <button
              onClick={() => apply(plan.id)}
              className={`mt-5 w-full rounded-xl py-2.5 text-sm font-bold transition-colors ${
                plan.id === 'free'
                  ? 'border border-gray-300 text-gray-600 hover:bg-gray-50'
                  : plan.id === 'standard'
                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                  : 'bg-violet-600 text-white hover:bg-violet-700'
              }`}
            >
              {plan.id === 'free' ? '現在のプラン' : '申し込む'}
            </button>
          </div>
        ))}
      </div>

      {/* クラファン手数料体系 */}
      <div className='mb-8 rounded-xl border border-gray-200 bg-white p-6'>
        <h2 className='mb-1 text-sm font-bold text-gray-900'>政策クラウドファンディング 手数料体系</h2>
        <p className='mb-4 text-xs text-gray-500'>
          プランに応じた手数料のみで、掲載料・月額は別途。<br />
          手数料は<strong>寄付成立分のみ</strong>発生します（失敗の場合は無料）。
        </p>
        <div className='overflow-x-auto'>
          <table className='w-full text-sm'>
            <thead>
              <tr className='border-b border-gray-100'>
                <th className='pb-2 text-left text-xs font-semibold text-gray-500'>プラン</th>
                <th className='pb-2 text-left text-xs font-semibold text-gray-500'>手数料率</th>
                <th className='pb-2 text-left text-xs font-semibold text-gray-500'>備考</th>
              </tr>
            </thead>
            <tbody className='divide-y divide-gray-50'>
              {FEE_TABLE.map((row) => (
                <tr key={row.plan}>
                  <td className='py-2.5 font-medium text-gray-800'>{row.plan}</td>
                  <td className='py-2.5 font-bold text-blue-700'>{row.rate}</td>
                  <td className='py-2.5 text-xs text-gray-500'>{row.note}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className='mt-3 text-[11px] text-gray-400'>
          ※ 本番: Stripe Connect で寄付受取 → プラットフォーム手数料を自動控除。
        </p>
      </div>

      {/* FAQ */}
      <div className='mb-6 rounded-xl border border-gray-200 bg-white p-6'>
        <h2 className='mb-4 text-sm font-bold text-gray-900'>よくある質問</h2>
        <div className='space-y-4'>
          {[
            { q: '無料プランとの違いは？', a: 'スタンダード以上では写真・公約詳細・SNSリンクが追加され、有権者への訴求力が大幅に向上します。' },
            { q: '途中でプランを変更できますか？', a: 'いつでもアップグレード・ダウングレード可能です。月末で切り替えとなります。' },
            { q: 'クラファンの寄付はいつ受け取れますか？', a: '目標達成後、審査を経て翌月末に振り込み予定です（本番: Stripe Connect で管理）。' },
          ].map((item) => (
            <div key={item.q}>
              <p className='text-sm font-semibold text-gray-800'>Q. {item.q}</p>
              <p className='mt-1 text-sm text-gray-600'>A. {item.a}</p>
            </div>
          ))}
        </div>
      </div>

      <div className='text-center text-xs text-gray-400'>
        ※ プロトタイプのため決済は行いません。本番: Stripe + subscriptions テーブル。
      </div>

      {/* 申込モーダル */}
      {showModal && selectedPlan && selectedPlan !== 'free' && (
        <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4'>
          <div className='w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl'>
            <h3 className='mb-1 text-base font-bold text-gray-900'>
              {PLANS.find((p) => p.id === selectedPlan)?.name}プランに申し込む
            </h3>
            <p className='mb-4 text-xs text-gray-500'>
              ※ プロトタイプです。実際の決済は行われません。
            </p>
            <div className='space-y-3'>
              <input type='text'  placeholder='氏名' className='w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-violet-400 focus:outline-none' />
              <input type='email' placeholder='メールアドレス' className='w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-violet-400 focus:outline-none' />
              <input type='text'  placeholder='所属政党（任意）' className='w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-violet-400 focus:outline-none' />
            </div>
            <button
              onClick={() => { setShowModal(false); alert('申込を受け付けました（プロトタイプ）') }}
              className='mt-4 w-full rounded-xl bg-violet-600 py-2.5 text-sm font-bold text-white hover:bg-violet-700'
            >
              申込を送信（プロトタイプ）
            </button>
            <button onClick={() => setShowModal(false)} className='mt-2 w-full text-center text-xs text-gray-400 hover:text-gray-600'>
              キャンセル
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
