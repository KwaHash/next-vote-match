'use client'

/**
 * 【プロトタイプ】seijiselect.jp 国と地域の課題（政策提言ファネル）
 *
 * 目的: 「国の課題」と「地域の課題（最小単位は都道府県）」を並べ、各課題に対する政策提言が
 *   いまどの段階か（政策案作成→関係者へ周知→議員への提案→検討中→その他）を可視化し、
 *   応援・寄付しやすくする。関連YouTubeの埋め込み、SNSシェアにも対応。
 *
 * データ登録は運営admin側（本番）。市区町村は数が膨大なため、地域は都道府県単位に絞る。
 *
 * 注意: 動く仕様書。データはサンプル。寄付は実決済せず記録のみ（法務確認後に提供）。
 */

import Link from 'next/link'
import { useState } from 'react'

const yen = (n: number) => `¥${n.toLocaleString('ja-JP')}`

// 政策提言ファネル（今どの段階か）
const FUNNEL = ['政策案作成', '関係者へ周知', '議員への提案', '検討中', 'その他'] as const

interface Proposal { id: string; title: string; summary: string; stage: number; raised: number; goal: number; supporters: number; youtubeId?: string; youtubeTitle?: string }
interface Issue { id: string; scope: string; category: string; title: string; status: string; data: string; proposal: Proposal }

// 地域は都道府県単位（市区町村は含めない）。データのある都道府県のみ課題を表示。
const PREFS = ['東京都', '大阪府', '北海道', '神奈川県', '愛知県', '福岡県', '京都府', '沖縄県']

const ISSUES: Issue[] = [
  // ── 国の課題 ──
  {
    id: 'n-kosodate', scope: 'national', category: '少子化・子育て', title: '出生数の減少と子育て負担の重さ',
    status: '出生数の減少が続き、子育て世帯の経済的・時間的負担が大きい。', data: '出生数・合計特殊出生率（人口動態統計）',
    proposal: { id: 'p-n-kosodate', title: '子育て世帯への継続支援パッケージ', summary: '保育・教育・住宅・現金給付を一体で。地域の実情に合わせて配分。', stage: 2, raised: 1240000, goal: 3000000, supporters: 312, youtubeId: 'SAMPLE_KOSODATE', youtubeTitle: '子育て政策のポイント解説（サンプル）' },
  },
  {
    id: 'n-bosai', scope: 'national', category: '防災・安全', title: '災害死をどう減らすか',
    status: '首都直下・南海トラフ地震のリスク。避難所の環境や高齢者避難が課題。', data: '想定死者数・避難所充足率（防災白書）',
    proposal: { id: 'p-n-bosai', title: '避難所環境の底上げと要支援者避難の仕組み化', summary: '全避難所に電源・備蓄、要支援者の個別避難計画を標準化。', stage: 1, raised: 680000, goal: 2500000, supporters: 198 },
  },
  {
    id: 'n-zaisei', scope: 'national', category: '社会保障・財政', title: '社会保障と将来世代の負担',
    status: '高齢化で社会保障費が増加。将来世代への負担の偏りが懸念。', data: '社会保障給付費・国債残高（財務省）',
    proposal: { id: 'p-n-zaisei', title: '世代間で公平な負担と給付の見直し', summary: '現役・将来世代の負担を均す制度改革の論点整理から。', stage: 0, raised: 120000, goal: 2000000, supporters: 64 },
  },
  {
    id: 'n-energy', scope: 'national', category: 'エネルギー', title: '電気代の高さとエネルギー安全保障',
    status: '電気代の負担増。安定供給と脱炭素の両立が課題。', data: '電気料金・自給率（資源エネルギー庁）',
    proposal: { id: 'p-n-energy', title: '電気代の負担軽減と分散型電源の推進', summary: '蓄電・再エネ・既存電源の最適化で家計と産業の負担を軽減。', stage: 3, raised: 2050000, goal: 3000000, supporters: 540, youtubeId: 'SAMPLE_ENERGY', youtubeTitle: 'エネルギー政策の論点（サンプル）' },
  },
  {
    id: 'n-dx', scope: 'national', category: '行政DX', title: '行政手続きの煩雑さ',
    status: '紙・対面の手続きが多く、時間とコストがかかる。', data: 'オンライン化率（デジタル庁）',
    proposal: { id: 'p-n-dx', title: '手続きのデジタル完結と二重行政の解消', summary: '頻度の高い手続きから順にオンライン完結へ。', stage: 2, raised: 540000, goal: 1500000, supporters: 151 },
  },

  // ── 東京都 ──
  {
    id: 't-jutaku', scope: '東京都', category: '住宅・通勤', title: '住宅費の高さと通勤混雑',
    status: '家賃・住宅価格が高く、通勤の混雑も続く。', data: '家賃指数・混雑率（都・国交省）',
    proposal: { id: 'p-t-jutaku', title: '住宅費負担の軽減と職住近接の促進', summary: '空き家活用・テレワーク拠点・沿線開発で負担と混雑を緩和。', stage: 1, raised: 320000, goal: 1500000, supporters: 88 },
  },
  {
    id: 't-kosodate', scope: '東京都', category: '子育て', title: '保育・学童の不足',
    status: '地域により保育・学童の空き待ちが残る。', data: '待機児童数・学童利用率（都公表）',
    proposal: { id: 'p-t-kosodate', title: '保育・学童の整備と人材確保', summary: '保育士・支援員の処遇改善と施設整備を同時に。', stage: 2, raised: 760000, goal: 2000000, supporters: 205, youtubeId: 'SAMPLE_T_KOSODATE', youtubeTitle: '東京の子育て課題（サンプル）' },
  },

  // ── 大阪府 ──
  {
    id: 'o-banpaku', scope: '大阪府', category: '都市・経済', title: '万博後の跡地・施設の活用',
    status: '大型イベント後の施設・跡地の活用方針が課題。', data: '跡地活用計画（府公表）',
    proposal: { id: 'p-o-banpaku', title: '跡地の長期活用とにぎわい維持', summary: '産業・観光・住宅の複合活用で持続的な価値を。', stage: 0, raised: 90000, goal: 1500000, supporters: 41 },
  },
  {
    id: 'o-chusho', scope: '大阪府', category: '地域経済', title: '中小企業・商店街の活力',
    status: '中小企業・商店街の後継者不足や空き店舗が課題。', data: '事業所数・空き店舗率（府・商工会）',
    proposal: { id: 'p-o-chusho', title: '事業承継と創業の後押し', summary: '承継支援・空き店舗活用・販路開拓をパッケージで。', stage: 3, raised: 410000, goal: 1200000, supporters: 117 },
  },

  // ── 北海道 ──
  {
    id: 'h-jinko', scope: '北海道', category: '人口・交通', title: '人口減少と地域交通の維持',
    status: '広域で人口が減り、地域交通の維持が難しい。', data: '人口推計・路線維持状況（道公表）',
    proposal: { id: 'p-h-jinko', title: '地域交通の再設計と関係人口の拡大', summary: 'デマンド交通・移住支援・観光連携で地域を維持。', stage: 1, raised: 230000, goal: 1500000, supporters: 73 },
  },
]

export default function IssuesPage() {
  const [scope, setScope] = useState<'national' | 'pref'>('national')
  const [pref, setPref] = useState('東京都')
  const [donations, setDonations] = useState<Record<string, { raised: number; supporters: number }>>({})
  const [playing, setPlaying] = useState<Set<string>>(new Set())
  const [copied, setCopied] = useState<string | null>(null)
  const [thanks, setThanks] = useState<string | null>(null)

  const list = scope === 'national' ? ISSUES.filter((i) => i.scope === 'national') : ISSUES.filter((i) => i.scope === pref)
  const cur = (p: Proposal) => donations[p.id] ?? { raised: p.raised, supporters: p.supporters }
  const give = (p: Proposal) => { setDonations((d) => { const c = d[p.id] ?? { raised: p.raised, supporters: p.supporters }; return { ...d, [p.id]: { raised: c.raised + 1000, supporters: c.supporters + 1 } } }); setThanks(p.id); setTimeout(() => setThanks((t) => (t === p.id ? null : t)), 2500) }

  const share = (kind: string, issue: Issue) => {
    const url = typeof window !== 'undefined' ? window.location.href : 'https://seijiselect.jp/'
    const text = `${issue.title}｜${issue.proposal.title} #seijiselect`
    if (kind === 'copy') { navigator.clipboard?.writeText(`${text}\n${url}`).then(() => { setCopied(issue.id); setTimeout(() => setCopied((c) => (c === issue.id ? null : c)), 2000) }).catch(() => { /* ignore */ }); return }
    const map: Record<string, string> = {
      x: `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`,
      line: `https://social-plugins.line.me/lineit/share?url=${encodeURIComponent(url)}`,
      fb: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
    }
    if (typeof window !== 'undefined') window.open(map[kind], '_blank', 'noopener,noreferrer')
  }

  const card = 'rounded-2xl border border-gray-200 bg-white p-5'

  return (
    <div className='mx-auto w-full max-w-3xl px-4 py-8'>
      <div className='mb-5'>
        <div className='mb-2 inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-600'>
          <span className='h-1.5 w-1.5 rounded-full bg-blue-500' />
          プロトタイプ / seijiselect.jp
        </div>
        <h1 className='text-2xl font-bold text-gray-900'>国と地域の課題</h1>
        <p className='mt-1 text-sm leading-relaxed text-gray-500'>
          国の課題と、あなたの地域（都道府県）の課題。各課題への<strong className='text-gray-700'>政策提言が今どの段階か</strong>を見て、応援・寄付できます。
        </p>
      </div>

      {/* スコープ切替 */}
      <div className='mb-3 flex flex-wrap items-center gap-2'>
        <button onClick={() => setScope('national')} className={`rounded-lg px-4 py-2 text-sm font-semibold ${scope === 'national' ? 'bg-slate-900 text-white' : 'border border-gray-300 text-gray-600 hover:bg-gray-50'}`}>🗾 国の課題</button>
        <button onClick={() => setScope('pref')} className={`rounded-lg px-4 py-2 text-sm font-semibold ${scope === 'pref' ? 'bg-slate-900 text-white' : 'border border-gray-300 text-gray-600 hover:bg-gray-50'}`}>📍 地域の課題</button>
        {scope === 'pref' && (
          <select value={pref} onChange={(e) => setPref(e.target.value)} className='rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-700 focus:border-blue-400 focus:outline-none'>
            {PREFS.map((p) => <option key={p} value={p}>{p}</option>)}
          </select>
        )}
      </div>
      {scope === 'pref' && <p className='mb-4 text-[11px] text-gray-400'>※ 地域の最小単位は<strong>都道府県</strong>です（市区町村は数が膨大なため対象外）。</p>}

      {/* ファネル凡例 */}
      <div className='mb-5 flex flex-wrap items-center gap-1.5 rounded-xl bg-gray-50 px-3 py-2 text-[11px] text-gray-500'>
        <span className='font-semibold text-gray-600'>政策提言の段階：</span>
        {FUNNEL.map((s, i) => <span key={s}>{s}{i < FUNNEL.length - 1 && <span className='px-1 text-gray-300'>→</span>}</span>)}
      </div>

      {list.length === 0 && (
        <div className={`${card} text-center text-sm text-gray-400`}>この都道府県の課題は準備中です（運営adminの登録待ち）。</div>
      )}

      <div className='space-y-4'>
        {list.map((issue) => {
          const p = issue.proposal; const c = cur(p); const pct = Math.min(100, Math.round((c.raised / p.goal) * 100))
          return (
            <div key={issue.id} className={card}>
              {/* 課題ヘッダー */}
              <div className='flex items-center gap-2'>
                <span className='rounded-md bg-gray-100 px-2 py-0.5 text-[11px] font-bold text-gray-500'>{issue.category}</span>
                <span className='rounded-md bg-blue-50 px-2 py-0.5 text-[10px] font-medium text-blue-600'>{issue.scope === 'national' ? '国の課題' : issue.scope}</span>
              </div>
              <h2 className='mt-1.5 text-lg font-bold text-gray-900'>{issue.title}</h2>
              <p className='mt-1 text-sm text-gray-600'>{issue.status}</p>
              <p className='mt-1 text-[11px] text-gray-400'>関連データ：{issue.data}</p>

              {/* 政策提言 + ファネル */}
              <div className='mt-4 rounded-xl border border-gray-100 bg-gray-50/70 p-4'>
                <p className='text-xs font-bold text-gray-500'>政策提言</p>
                <p className='text-sm font-bold text-gray-900'>{p.title}</p>
                <p className='mt-0.5 text-xs text-gray-600'>{p.summary}</p>

                <div className='mt-3 flex items-center gap-0.5'>
                  {FUNNEL.map((s, i) => (
                    <div key={s} className='flex flex-1 items-center'>
                      <div className={`flex-1 rounded-full py-1 text-center text-[9px] font-medium ${i <= p.stage ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-400'}`}>{s}</div>
                      {i < FUNNEL.length - 1 && <span className={`px-0.5 text-[9px] ${i < p.stage ? 'text-blue-600' : 'text-gray-300'}`}>›</span>}
                    </div>
                  ))}
                </div>
                <p className='mt-1 text-[10px] text-gray-400'>現在の段階：<strong className='text-blue-700'>{FUNNEL[p.stage]}</strong></p>

                {/* 関連YouTube（クリックで読み込み） */}
                {p.youtubeId && (
                  <div className='mt-3'>
                    {playing.has(p.id) ? (
                      <iframe className='aspect-video w-full rounded-lg' src={`https://www.youtube-nocookie.com/embed/${p.youtubeId}`} title={p.youtubeTitle ?? 'related video'} loading='lazy' allow='accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture' allowFullScreen />
                    ) : (
                      <button onClick={() => setPlaying((s) => new Set(s).add(p.id))} className='flex w-full items-center gap-3 rounded-lg bg-gradient-to-r from-rose-500 to-red-600 px-4 py-3 text-left text-white hover:opacity-95'>
                        <span className='text-xl'>▶</span>
                        <span className='min-w-0 flex-1 text-xs font-semibold'>{p.youtubeTitle}<span className='ml-1 font-normal text-white/70'>（YouTube）</span></span>
                      </button>
                    )}
                  </div>
                )}

                {/* 寄付（応援） */}
                <div className='mt-4'>
                  <div className='flex items-end justify-between text-xs'>
                    <span className='font-bold text-gray-900'>{yen(c.raised)}<span className='ml-1 font-normal text-gray-400'>/ 目標 {yen(p.goal)}</span></span>
                    <span className='text-gray-400'>{c.supporters}人が応援</span>
                  </div>
                  <div className='mt-1 h-2 w-full overflow-hidden rounded-full bg-gray-200'><div className='h-full rounded-full bg-emerald-500' style={{ width: `${pct}%` }} /></div>
                  <button onClick={() => give(p)} className='mt-2 w-full rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700'>
                    {thanks === p.id ? '✓ 応援ありがとうございます（プロト・実決済なし）' : '💚 この政策提言を寄付で後押しする'}
                  </button>
                  <p className='mt-1 text-[10px] text-gray-400'>※ プロトのため実際の決済は行いません。寄付・献金は政治資金規正法・公職選挙法等の確認後に提供します。</p>
                </div>
              </div>

              {/* SNSシェア */}
              <div className='mt-3 flex flex-wrap items-center gap-2'>
                <span className='text-[11px] text-gray-400'>シェア：</span>
                <button onClick={() => share('x', issue)} className='rounded-lg border border-gray-300 px-3 py-1.5 text-[11px] font-semibold text-gray-700 hover:bg-gray-50'>𝕏 / Twitter</button>
                <button onClick={() => share('line', issue)} className='rounded-lg border border-gray-300 px-3 py-1.5 text-[11px] font-semibold text-emerald-700 hover:bg-emerald-50'>LINE</button>
                <button onClick={() => share('fb', issue)} className='rounded-lg border border-gray-300 px-3 py-1.5 text-[11px] font-semibold text-blue-700 hover:bg-blue-50'>Facebook</button>
                <button onClick={() => share('copy', issue)} className='rounded-lg border border-gray-300 px-3 py-1.5 text-[11px] font-semibold text-gray-700 hover:bg-gray-50'>{copied === issue.id ? '✓ コピー済' : 'リンクをコピー'}</button>
              </div>
            </div>
          )
        })}
      </div>

      <p className='mt-6 text-center text-[11px] text-gray-400'>
        ※ 課題・政策提言・段階・関連動画は<strong>運営admin側で登録・更新</strong>します（本番）。現状値・データは政府統計・自治体データに接続して更新。
      </p>

      <div className='mt-5 flex flex-col gap-3 sm:flex-row'>
        <Link href='/prototype/elections' className='flex-1 rounded-xl bg-blue-600 px-4 py-3 text-center text-sm font-semibold text-white hover:bg-blue-700'>🗳️ 選挙で選ぶ（〒検索）</Link>
        <Link href='/prototype/policies' className='flex-1 rounded-xl border border-gray-300 px-4 py-3 text-center text-sm font-semibold text-gray-700 hover:bg-gray-50'>政策を知る・応援する</Link>
      </div>
    </div>
  )
}
