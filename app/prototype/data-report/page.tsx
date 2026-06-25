'use client'

/**
 * 【プロトタイプ】seijiselect.jp データレポート販売
 *
 * マネタイズ③: 政策関心・賛否・寄付傾向データを研究機関・メディア・自治体向けに販売
 * 注意: 動く仕様書。決済・ダウンロードは行わない。
 *   本番: Stripe + report_orders テーブル + S3 署名付きURL
 */

import { useState } from 'react'

type Category = 'all' | 'region' | 'policy' | 'voter' | 'election'

const CATEGORIES: { value: Category; label: string }[] = [
  { value: 'all',      label: 'すべて' },
  { value: 'region',   label: '地域別' },
  { value: 'policy',   label: '政策別' },
  { value: 'voter',    label: '有権者属性' },
  { value: 'election', label: '選挙分析' },
]

interface Report {
  id: string
  category: Category
  title: string
  desc: string
  price: number
  pages: number
  format: string
  audience: string
  sample: string[]
  isNew?: boolean
  isPop?: boolean
}

const REPORTS: Report[] = [
  {
    id: 'r1', category: 'region',
    title: '都道府県別 政策関心度レポート 2026年版',
    desc: '全47都道府県の有権者が最も関心を持つ政策テーマをランキング形式で集計。地方議員・首長候補の選挙戦略立案に活用できます。',
    price: 49800, pages: 84, format: 'PDF + Excel', audience: '地方自治体・政党・選挙コンサル',
    sample: ['都道府県別 政策関心Top5ランキング', '前年比トレンド比較', '年齢層×地域クロス集計'],
    isPop: true,
  },
  {
    id: 'r2', category: 'policy',
    title: '政策テーマ別 賛否動向レポート',
    desc: '10政策テーマの賛成・反対・中立の比率と、年齢・性別・居住地域との相関を分析。政策立案・広報戦略の根拠データとして活用できます。',
    price: 39800, pages: 62, format: 'PDF + Excel', audience: '政策立案者・NPO・シンクタンク',
    sample: ['政策テーマ別 賛否比率（月次）', '属性クロス分析', '地域別ヒートマップ'],
  },
  {
    id: 'r3', category: 'voter',
    title: '有権者タイプ分析レポート（動物キャラ診断結果）',
    desc: '政策マッチング診断の結果から、有権者を10タイプに分類し、各タイプの行動特性・政策優先度・SNS利用傾向を分析。',
    price: 29800, pages: 48, format: 'PDF', audience: 'メディア・選挙コンサル・学術研究',
    sample: ['10タイプの分布と特性', '政党支持との相関', 'タイプ別SNS拡散行動分析'],
    isNew: true,
  },
  {
    id: 'r4', category: 'election',
    title: '選挙前後 関心政策シフトレポート',
    desc: '選挙公示前・選挙期間中・選挙後の政策関心度の変化を時系列で分析。どのニュースが関心を動かしたかの要因も考察します。',
    price: 59800, pages: 96, format: 'PDF + Tableau公開リンク', audience: 'メディア・政党・学術研究',
    sample: ['政策関心の時系列推移グラフ', '関心シフト要因分析', '候補者言及との相関'],
    isPop: true,
  },
  {
    id: 'r5', category: 'region',
    title: '市区町村別 課題優先度レポート（東京23区・政令市版）',
    desc: '東京23区＋全政令市の有権者が優先する政策課題をランキング化。区議・市議選の候補者向け地域密着型レポート。',
    price: 34800, pages: 56, format: 'PDF + Excel', audience: '地方議員候補・地域政党・行政',
    sample: ['区・市別 課題Top3', '年齢層分布との相関', '周辺自治体との比較'],
    isNew: true,
  },
  {
    id: 'r6', category: 'policy',
    title: '政策クラウドファンディング 寄付傾向レポート',
    desc: '政策別・地域別の寄付額・支援者数・達成率の集計データ。クラファンを検討する候補者・政策立案者向けのベンチマーク資料。',
    price: 24800, pages: 38, format: 'PDF + Excel', audience: '候補者・NPO・クラファン担当者',
    sample: ['政策別 平均寄付額・達成率', '支援者の属性分布', '成功・失敗事例の比較分析'],
  },
]

export default function DataReportPage() {
  const [cat, setCat] = useState<Category>('all')
  const [showModal, setShowModal] = useState(false)
  const [selectedReport, setSelectedReport] = useState<Report | null>(null)
  const [purchased, setPurchased] = useState<string[]>([])

  const filtered = cat === 'all' ? REPORTS : REPORTS.filter((r) => r.category === cat)

  const openModal = (r: Report) => {
    setSelectedReport(r)
    setShowModal(true)
  }

  const buy = () => {
    if (!selectedReport) return
    setPurchased((prev) => [...prev, selectedReport.id])
    setShowModal(false)
    alert(`「${selectedReport.title}」のご購入ありがとうございます。\n（プロトタイプのため実際の決済・ダウンロードは行われません）`)
  }

  return (
    <div className='mx-auto w-full max-w-3xl px-4 py-8'>
      <div className='mb-5'>
        <div className='mb-2 inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-600'>
          <span className='h-1.5 w-1.5 rounded-full bg-emerald-500' />
          プロトタイプ / seijiselect.jp
        </div>
        <h1 className='text-2xl font-bold text-gray-900'>データレポート販売</h1>
        <p className='mt-1 text-sm text-gray-500'>
          研究機関・メディア・自治体・政党向けに、政策関心・賛否・寄付傾向データを販売しています。
        </p>
      </div>

      {/* 対象読者バナー */}
      <div className='mb-5 grid grid-cols-3 gap-3'>
        {[
          { icon: '🏛️', label: '自治体・政党', desc: '政策立案・選挙戦略に' },
          { icon: '📺', label: 'メディア・記者', desc: '有権者動向の取材に' },
          { icon: '🎓', label: '研究機関・大学', desc: '政治参加研究のデータに' },
        ].map((item) => (
          <div key={item.label} className='rounded-xl border border-gray-200 bg-white p-3 text-center'>
            <div className='text-2xl'>{item.icon}</div>
            <p className='mt-1 text-xs font-semibold text-gray-700'>{item.label}</p>
            <p className='text-[10px] text-gray-400'>{item.desc}</p>
          </div>
        ))}
      </div>

      {/* カテゴリタブ */}
      <div className='mb-4 flex flex-wrap gap-2'>
        {CATEGORIES.map((c) => (
          <button
            key={c.value}
            onClick={() => setCat(c.value)}
            className={`rounded-full border px-3 py-1 text-xs font-semibold transition-colors ${
              cat === c.value ? 'border-emerald-500 bg-emerald-600 text-white' : 'border-gray-200 text-gray-600 hover:border-gray-300'
            }`}
          >
            {c.label}
          </button>
        ))}
      </div>

      {/* レポート一覧 */}
      <div className='space-y-4'>
        {filtered.map((r) => (
          <div key={r.id} className='rounded-xl border border-gray-200 bg-white p-5'>
            <div className='mb-2 flex flex-wrap items-start justify-between gap-2'>
              <div className='flex flex-wrap items-center gap-2'>
                <h2 className='text-sm font-bold text-gray-900'>{r.title}</h2>
                {r.isNew && <span className='rounded-full bg-rose-100 px-2 py-0.5 text-[10px] font-bold text-rose-600'>NEW</span>}
                {r.isPop && <span className='rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-700'>人気</span>}
                {purchased.includes(r.id) && <span className='rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-700'>購入済み</span>}
              </div>
              <span className='shrink-0 text-base font-bold text-gray-900'>¥{r.price.toLocaleString()}</span>
            </div>
            <p className='mb-3 text-xs text-gray-600 leading-relaxed'>{r.desc}</p>
            <div className='mb-3 flex flex-wrap gap-3 text-[11px] text-gray-400'>
              <span>📄 {r.pages}ページ</span>
              <span>📁 {r.format}</span>
              <span>👥 {r.audience}</span>
            </div>
            <div className='mb-3 rounded-lg bg-gray-50 p-3'>
              <p className='mb-1.5 text-[11px] font-semibold text-gray-600'>収録コンテンツ（抜粋）</p>
              <ul className='space-y-1'>
                {r.sample.map((s) => (
                  <li key={s} className='flex items-center gap-1.5 text-[11px] text-gray-500'>
                    <span className='text-emerald-500'>✓</span>{s}
                  </li>
                ))}
              </ul>
            </div>
            <div className='flex gap-2'>
              <button
                onClick={() => openModal(r)}
                className={`flex-1 rounded-xl py-2 text-sm font-semibold transition-colors ${
                  purchased.includes(r.id)
                    ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                    : 'bg-emerald-600 text-white hover:bg-emerald-700'
                }`}
              >
                {purchased.includes(r.id) ? 'ダウンロード（プロトタイプ）' : '購入する'}
              </button>
              <button className='rounded-xl border border-gray-300 px-4 py-2 text-xs font-medium text-gray-600 hover:bg-gray-50'>
                サンプルを見る
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* 法人向け一括購入 */}
      <div className='mt-6 rounded-xl border border-emerald-200 bg-emerald-50 p-5'>
        <h2 className='mb-1 text-sm font-bold text-gray-900'>法人・機関向け 一括購入・API提供</h2>
        <p className='mb-3 text-xs text-gray-600'>
          複数レポートのまとめ購入（20%割引）や、リアルタイムAPIでのデータ連携も提供しています。
          研究目的の場合は学術割引（50%）が適用可能です。
        </p>
        <button
          onClick={() => alert('お問い合わせ受付（プロトタイプ）')}
          className='rounded-xl bg-emerald-600 px-6 py-2.5 text-sm font-bold text-white hover:bg-emerald-700'
        >
          法人お問い合わせ
        </button>
      </div>

      <p className='mt-4 text-center text-xs text-gray-400'>
        ※ プロトタイプのため決済・ダウンロードは行いません。本番: Stripe + S3署名付きURL。
      </p>

      {/* 購入モーダル */}
      {showModal && selectedReport && (
        <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4'>
          <div className='w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl'>
            <h3 className='mb-1 text-sm font-bold text-gray-900'>{selectedReport.title}</h3>
            <p className='mb-1 text-xl font-bold text-gray-900'>¥{selectedReport.price.toLocaleString()}</p>
            <p className='mb-4 text-xs text-gray-500'>※ プロトタイプのため実際の決済は行いません。</p>
            <div className='space-y-3'>
              <input type='text'  placeholder='氏名・機関名' className='w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-emerald-400 focus:outline-none' />
              <input type='email' placeholder='メールアドレス（送付先）' className='w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-emerald-400 focus:outline-none' />
              <select className='w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-emerald-400 focus:outline-none'>
                <option>利用目的を選択</option>
                <option>政策立案・選挙戦略</option>
                <option>報道・取材</option>
                <option>学術研究</option>
                <option>その他</option>
              </select>
            </div>
            <button onClick={buy} className='mt-4 w-full rounded-xl bg-emerald-600 py-2.5 text-sm font-bold text-white hover:bg-emerald-700'>
              購入する（プロトタイプ）
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
