'use client'

/**
 * 【プロトタイプ】seijiselect.jp 都道府県別 課題・KPI
 *
 * 目的: 各都道府県固有の課題と目標指標を可視化し、国民が「自分の地域の政治課題」を把握できる。
 *       関連政策テーマ・候補者との導線になる。SEO：「〇〇県 政治 課題」検索の受け皿。
 * 注意: 動く仕様書。数値はサンプル（本番: 政府統計API / e-Stat に接続）。
 */

import { POLICY_THEMES } from '../_data'
import Link from 'next/link'
import { useState } from 'react'

const theme = (id: string) => POLICY_THEMES.find((t) => t.id === id)

type KpiStatus = 'good' | 'warn' | 'bad'
interface Kpi { label: string; current: string; target: string; trend: '↑良' | '↓良' | '→'; status: KpiStatus }
interface Challenge { title: string; desc: string; themeId: string }
interface PrefData {
  name: string; emoji: string; region: string
  population: string; birthRate: string; agingRate: string; gdp: string
  highlight: string
  challenges: Challenge[]
  kpis: Kpi[]
}

const PREFS: Record<string, PrefData> = {
  '東京都': {
    name: '東京都', emoji: '🗼', region: '関東', population: '1,404万人', birthRate: '0.99', agingRate: '23.1%', gdp: '109兆円',
    highlight: '出生率0.99は全国最低水準。住宅コスト高騰と孤独・孤立が深刻。',
    challenges: [
      { title: '超低出生率', desc: '出生率0.99は全国最低。住宅コスト・保育不足が主因。', themeId: 'kosodate' },
      { title: '行政DX遅れ', desc: '窓口手続きのデジタル化率は全国平均以下の地区が多い。', themeId: 'ai-gyosei' },
      { title: '政治資金不透明', desc: '全国最多の政治団体が集中。収支公開の即時性が課題。', themeId: 'nyusatsu' },
      { title: '孤独・孤立問題', desc: '単身世帯率が高く、高齢者・若者の孤立が増加。', themeId: 'nettyusho' },
    ],
    kpis: [
      { label: '合計特殊出生率', current: '0.99', target: '1.30以上', trend: '↑良', status: 'bad' },
      { label: '待機児童数', current: '2,680人', target: 'ゼロ', trend: '↓良', status: 'warn' },
      { label: '行政手続DX化率', current: '68%', target: '90%以上', trend: '↑良', status: 'warn' },
      { label: '政治資金月次公開率', current: '12%', target: '100%', trend: '↑良', status: 'bad' },
    ],
  },
  '大阪府': {
    name: '大阪府', emoji: '🏯', region: '近畿', population: '882万人', birthRate: '1.22', agingRate: '28.2%', gdp: '39兆円',
    highlight: '財政再建中。IR・万博後の経済持続が最大の課題。',
    challenges: [
      { title: '財政再建', desc: '府・市の財政健全化途上。歳出削減と自主財源の確保が急務。', themeId: 'chiho-zaisei' },
      { title: '入札透明化', desc: '建設・インフラ工事の競争入札の透明性向上が求められている。', themeId: 'nyusatsu' },
      { title: '高齢化と医療費', desc: '高齢化率28%超。介護・医療費の膨張が財政を圧迫。', themeId: 'nettyusho' },
      { title: 'AI行政活用', desc: '万博・IRを機にスマートシティ化を推進中。', themeId: 'ai-gyosei' },
    ],
    kpis: [
      { label: '府財政健全化率', current: '改善中', target: '黒字安定', trend: '↑良', status: 'warn' },
      { label: '高齢化率', current: '28.2%', target: '増加抑制', trend: '→', status: 'warn' },
      { label: '入札電子化率', current: '74%', target: '100%', trend: '↑良', status: 'warn' },
      { label: '行政窓口デジタル化', current: '55%', target: '90%以上', trend: '↑良', status: 'bad' },
    ],
  },
  '北海道': {
    name: '北海道', emoji: '🦌', region: '北海道', population: '516万人', birthRate: '1.06', agingRate: '32.9%', gdp: '19兆円',
    highlight: '高齢化率33%・人口流出が深刻。観光と再エネで経済再生を狙う。',
    challenges: [
      { title: '急速な人口減少', desc: '年間3万人超が流出。特に若年層の道外転出が止まらない。', themeId: 'chiho-zaisei' },
      { title: '大規模自然災害リスク', desc: '地震・津波・豪雪に備えるインフラ整備が不十分。', themeId: 'bosai' },
      { title: '再エネポテンシャル', desc: '風力・地熱で全国最大の再エネ適地。蓄電池整備が急務。', themeId: 'energy' },
      { title: '観光産業の高度化', desc: 'インバウンド回復後、消費単価と滞在期間の引き上げが課題。', themeId: 'kanko' },
    ],
    kpis: [
      { label: '人口増減率', current: '▲0.6%/年', target: 'ゼロ以上', trend: '↑良', status: 'bad' },
      { label: '再エネ導入率', current: '31%', target: '50%以上', trend: '↑良', status: 'warn' },
      { label: '防災インフラ整備率', current: '62%', target: '90%以上', trend: '↑良', status: 'warn' },
      { label: '観光消費額（道内）', current: '1.2兆円', target: '1.8兆円', trend: '↑良', status: 'warn' },
    ],
  },
  '秋田県': {
    name: '秋田県', emoji: '🌾', region: '東北', population: '92万人', birthRate: '0.97', agingRate: '38.8%', gdp: '3.4兆円',
    highlight: '高齢化率・人口減少率ともに全国ワースト水準。',
    challenges: [
      { title: '超高齢化・限界集落', desc: '高齢化率39%、集落維持が困難な地域が急増。', themeId: 'nettyusho' },
      { title: '若者流出', desc: '進学・就職を機に県外へ。Uターン促進策が緊急課題。', themeId: 'chiho-zaisei' },
      { title: '農業後継者不足', desc: '農家の平均年齢が70歳超。スマート農業への転換が急務。', themeId: 'ai-gyosei' },
      { title: '豪雪・災害対策', desc: '豪雪による孤立集落・死亡事故が毎年発生。', themeId: 'bosai' },
    ],
    kpis: [
      { label: '高齢化率', current: '38.8%', target: '増加抑制', trend: '→', status: 'bad' },
      { label: '合計特殊出生率', current: '0.97', target: '1.5以上', trend: '↑良', status: 'bad' },
      { label: 'Uターン率', current: '18%', target: '35%以上', trend: '↑良', status: 'bad' },
      { label: '農業スマート化率', current: '8%', target: '30%以上', trend: '↑良', status: 'bad' },
    ],
  },
  '愛知県': {
    name: '愛知県', emoji: '🏭', region: '中部', population: '754万人', birthRate: '1.42', agingRate: '24.1%', gdp: '42兆円',
    highlight: '製造業GDP全国1位。自動車産業のEV転換が県経済の最大リスク。',
    challenges: [
      { title: 'EV転換リスク', desc: '自動車産業依存度が高く、EV化による雇用・サプライヤー影響が深刻。', themeId: 'energy' },
      { title: '交通渋滞・インフラ', desc: '名古屋圏の慢性的渋滞と老朽化インフラ更新が急務。', themeId: 'kotsu' },
      { title: '外国人労働者支援', desc: '外国人比率が全国上位。多言語対応・生活支援が不十分。', themeId: 'jinken' },
      { title: '防災（南海トラフ）', desc: '南海トラフ地震の被害想定が最大規模。沿岸部の対策急務。', themeId: 'bosai' },
    ],
    kpis: [
      { label: '製造業雇用維持率', current: '98%', target: '維持', trend: '→', status: 'warn' },
      { label: '交通事故死者数', current: '192人/年', target: '100人以下', trend: '↓良', status: 'warn' },
      { label: '防災避難施設整備率', current: '71%', target: '90%以上', trend: '↑良', status: 'warn' },
      { label: '外国人向け多言語窓口', current: '38市町村', target: '全54市町村', trend: '↑良', status: 'warn' },
    ],
  },
  '沖縄県': {
    name: '沖縄県', emoji: '🌺', region: '九州・沖縄', population: '147万人', birthRate: '1.60', agingRate: '22.7%', gdp: '4.5兆円',
    highlight: '出生率全国1位だが、子どもの貧困率・基地負担が全国最大の課題。',
    challenges: [
      { title: '子どもの貧困', desc: '子どもの貧困率29.3%（全国平均の約2倍）。教育格差が深刻。', themeId: 'kosodate' },
      { title: '基地負担と人権', desc: '米軍基地が県土の約70%。騒音・事故・人権問題が継続。', themeId: 'jinken' },
      { title: '観光依存・産業多様化', desc: '観光業への依存が高く、コロナ禍で脆弱性が顕在化。', themeId: 'kanko' },
      { title: '防災（台風・豪雨）', desc: '台風常襲地帯。老朽化インフラの耐風化が急務。', themeId: 'bosai' },
    ],
    kpis: [
      { label: '子どもの貧困率', current: '29.3%', target: '15%以下', trend: '↓良', status: 'bad' },
      { label: '合計特殊出生率', current: '1.60', target: '維持・向上', trend: '↑良', status: 'good' },
      { label: '観光消費額', current: '0.7兆円', target: '1.5兆円', trend: '↑良', status: 'warn' },
      { label: '台風対応避難完了率', current: '82%', target: '100%', trend: '↑良', status: 'warn' },
    ],
  },
  '福岡県': {
    name: '福岡県', emoji: '🍜', region: '九州・沖縄', population: '513万人', birthRate: '1.26', agingRate: '26.5%', gdp: '19兆円',
    highlight: '九州の経済中心地。スタートアップ育成・アジアとの交流が強み。',
    challenges: [
      { title: '子育て環境整備', desc: '福岡市に人口集中する一方、保育所不足・待機児童が課題。', themeId: 'kosodate' },
      { title: 'エネルギー転換', desc: '九州電力の再エネ比率は高まるが、蓄電・安定供給が課題。', themeId: 'energy' },
      { title: '観光・国際化', desc: 'アジアからの玄関口。観光インフラ整備と多文化共生が急務。', themeId: 'kanko' },
      { title: '財政効率化', desc: '中小自治体の財政ひっ迫。DXで行政コスト削減が求められる。', themeId: 'chiho-zaisei' },
    ],
    kpis: [
      { label: '待機児童数（福岡市）', current: '450人', target: 'ゼロ', trend: '↓良', status: 'warn' },
      { label: '再エネ比率', current: '42%', target: '60%以上', trend: '↑良', status: 'warn' },
      { label: '外国人観光客数', current: '280万人', target: '500万人', trend: '↑良', status: 'warn' },
      { label: '行政コスト削減率', current: '5%', target: '20%', trend: '↑良', status: 'bad' },
    ],
  },
  '京都府': {
    name: '京都府', emoji: '⛩️', region: '近畿', population: '253万人', birthRate: '1.09', agingRate: '30.1%', gdp: '9.8兆円',
    highlight: '文化観光と先端産業（ニデック・村田製作所等）が並存。観光公害が深刻。',
    challenges: [
      { title: 'オーバーツーリズム', desc: '観光客集中による住民生活への支障・文化財損傷が深刻化。', themeId: 'kanko' },
      { title: '文化財保護', desc: '世界遺産・文化財の維持管理費が増大。財源確保が急務。', themeId: 'nyusatsu' },
      { title: '人権・多様性', desc: '部落差別問題が残存。外国人・LGBTへの包摂的施策が必要。', themeId: 'jinken' },
      { title: '少子化', desc: '出生率1.09と低水準。学生が多いが定住・子育てしにくい環境。', themeId: 'kosodate' },
    ],
    kpis: [
      { label: '観光客マナー違反件数', current: '月3,400件', target: '月1,000件以下', trend: '↓良', status: 'bad' },
      { label: '文化財保全予算充足率', current: '61%', target: '100%', trend: '↑良', status: 'warn' },
      { label: '合計特殊出生率', current: '1.09', target: '1.40以上', trend: '↑良', status: 'bad' },
      { label: '人権相談解決率', current: '74%', target: '90%以上', trend: '↑良', status: 'warn' },
    ],
  },
}

// 未収録都道府県用デフォルト
const DEFAULT_DATA = (name: string): PrefData => ({
  name, emoji: '🏛️', region: '—', population: 'データ準備中', birthRate: '—', agingRate: '—', gdp: '—',
  highlight: '詳細データは準備中です（本番: 政府統計APIから自動取得）。',
  challenges: [
    { title: '少子高齢化', desc: '全国共通課題。地域固有データは本番で追加予定。', themeId: 'kosodate' },
    { title: '地方財政', desc: '歳出削減と自主財源確保。', themeId: 'chiho-zaisei' },
    { title: '防災', desc: '地域リスクに応じた防災整備。', themeId: 'bosai' },
  ],
  kpis: [
    { label: '出生率', current: '準備中', target: '全国平均以上', trend: '↑良', status: 'warn' },
    { label: '高齢化率', current: '準備中', target: '抑制', trend: '→', status: 'warn' },
  ],
})

const ALL_PREFS = [
  '北海道', '青森県', '岩手県', '宮城県', '秋田県', '山形県', '福島県',
  '茨城県', '栃木県', '群馬県', '埼玉県', '千葉県', '東京都', '神奈川県',
  '新潟県', '富山県', '石川県', '福井県', '山梨県', '長野県', '岐阜県',
  '静岡県', '愛知県', '三重県', '滋賀県', '京都府', '大阪府', '兵庫県',
  '奈良県', '和歌山県', '鳥取県', '島根県', '岡山県', '広島県', '山口県',
  '徳島県', '香川県', '愛媛県', '高知県', '福岡県', '佐賀県', '長崎県',
  '熊本県', '大分県', '宮崎県', '鹿児島県', '沖縄県',
]

const STATUS_COLOR: Record<KpiStatus, string> = {
  good: 'text-emerald-600 bg-emerald-50 border-emerald-200',
  warn: 'text-amber-700 bg-amber-50 border-amber-200',
  bad:  'text-rose-600 bg-rose-50 border-rose-200',
}
const STATUS_LABEL: Record<KpiStatus, string> = { good: '達成中', warn: '要改善', bad: '深刻' }

export default function PrefectureKpiPage() {
  const [selected, setSelected] = useState('東京都')
  const [search, setSearch] = useState('')

  const data = PREFS[selected] ?? DEFAULT_DATA(selected)
  const filtered = ALL_PREFS.filter((p) => p.includes(search))

  return (
    <div className='mx-auto w-full max-w-4xl px-4 py-8'>
      <div className='mb-5'>
        <div className='mb-2 inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-600'>
          <span className='h-1.5 w-1.5 rounded-full bg-blue-500' />
          プロトタイプ / seijiselect.jp
        </div>
        <h1 className='text-2xl font-bold text-gray-900'>都道府県別 課題・KPI</h1>
        <p className='mt-1 text-sm text-gray-500'>
          あなたの地域の政治課題と目標指標を確認できます。
        </p>
      </div>

      <div className='flex flex-col gap-5 lg:flex-row'>
        {/* 左：都道府県リスト */}
        <div className='w-full shrink-0 lg:w-44'>
          <input
            type='text'
            placeholder='都道府県を検索'
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className='mb-2 w-full rounded-lg border border-gray-300 px-2.5 py-1.5 text-xs focus:border-blue-400 focus:outline-none'
          />
          <div className='max-h-[480px] overflow-y-auto rounded-xl border border-gray-200 bg-white'>
            {filtered.map((pref) => (
              <button
                key={pref}
                onClick={() => setSelected(pref)}
                className={`w-full border-b border-gray-50 px-3 py-2 text-left text-xs font-medium last:border-0 transition-colors ${
                  selected === pref ? 'bg-blue-600 text-white' : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                {PREFS[pref] ? PREFS[pref].emoji + ' ' : ''}{pref}
              </button>
            ))}
          </div>
        </div>

        {/* 右：詳細 */}
        <div className='flex-1 min-w-0'>
          {/* ヘッダー */}
          <div className='mb-4 rounded-xl border border-gray-200 bg-white p-5'>
            <div className='flex items-center gap-3'>
              <span className='text-4xl'>{data.emoji}</span>
              <div>
                <h2 className='text-xl font-bold text-gray-900'>{data.name}</h2>
                <p className='text-xs text-gray-500'>{data.region}地方</p>
              </div>
            </div>
            <div className='mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4'>
              {[
                { label: '人口', value: data.population },
                { label: '出生率', value: data.birthRate },
                { label: '高齢化率', value: data.agingRate },
                { label: 'GDP', value: data.gdp },
              ].map((item) => (
                <div key={item.label} className='rounded-lg bg-gray-50 px-3 py-2 text-center'>
                  <p className='text-[10px] text-gray-400'>{item.label}</p>
                  <p className='text-sm font-bold text-gray-800'>{item.value}</p>
                </div>
              ))}
            </div>
            <div className='mt-3 rounded-lg border border-blue-100 bg-blue-50 px-3 py-2 text-xs text-blue-800'>
              <span className='font-semibold'>注目点:</span> {data.highlight}
            </div>
          </div>

          {/* 主な課題 */}
          <div className='mb-4 rounded-xl border border-gray-200 bg-white p-5'>
            <h3 className='mb-3 text-sm font-bold text-gray-900'>主な政治課題</h3>
            <div className='space-y-3'>
              {data.challenges.map((c) => {
                const t = theme(c.themeId)
                return (
                  <div key={c.title} className='flex gap-3 rounded-lg bg-gray-50 p-3'>
                    <span className='text-xl shrink-0'>{t?.emoji ?? '📌'}</span>
                    <div className='min-w-0'>
                      <div className='flex flex-wrap items-center gap-1.5'>
                        <span className='text-sm font-semibold text-gray-800'>{c.title}</span>
                        {t && (
                          <Link
                            href={`/prototype/policies`}
                            className='rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-medium text-blue-700 hover:bg-blue-200'
                          >
                            {t.name} →
                          </Link>
                        )}
                      </div>
                      <p className='mt-0.5 text-xs text-gray-500'>{c.desc}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* KPI */}
          <div className='mb-4 rounded-xl border border-gray-200 bg-white p-5'>
            <h3 className='mb-3 text-sm font-bold text-gray-900'>目標KPI</h3>
            <div className='space-y-2'>
              {data.kpis.map((k) => (
                <div key={k.label} className='flex items-center gap-3 rounded-lg border border-gray-100 bg-gray-50 px-4 py-2.5'>
                  <div className='min-w-0 flex-1'>
                    <p className='text-xs font-semibold text-gray-700'>{k.label}</p>
                    <div className='mt-0.5 flex items-center gap-2 text-[11px] text-gray-500'>
                      <span>現状 <strong className='text-gray-800'>{k.current}</strong></span>
                      <span className='text-gray-300'>→</span>
                      <span>目標 <strong className='text-blue-700'>{k.target}</strong></span>
                      <span className='text-gray-400'>{k.trend}</span>
                    </div>
                  </div>
                  <span className={`shrink-0 rounded-full border px-2.5 py-0.5 text-[10px] font-bold ${STATUS_COLOR[k.status]}`}>
                    {STATUS_LABEL[k.status]}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* 導線 */}
          <div className='flex gap-3'>
            <Link href='/prototype/candidates' className='flex-1 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-center text-sm font-semibold text-gray-700 hover:bg-gray-50'>
              この地域の候補者を見る
            </Link>
            <Link href='/prototype/ranking' className='flex-1 rounded-xl bg-blue-600 px-4 py-2.5 text-center text-sm font-semibold text-white hover:bg-blue-700'>
              政策ランキングを見る
            </Link>
          </div>
        </div>
      </div>

      <p className='mt-6 text-center text-xs text-gray-400'>
        ※ 数値はサンプル。本番: 政府統計API（e-Stat）・各都道府県オープンデータに自動接続。
      </p>
    </div>
  )
}
