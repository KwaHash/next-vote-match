'use client'

/**
 * 【プロトタイプ】seijiselect.jp 選挙で選ぶ（〒検索）— 絞り込み版
 *
 * 構成（ChatGPT再設計指示に基づく）:
 *   〒検索 → ① 自治体ページ軽量版（導線）→ ② 選挙特設ページ（詳細比較）
 *   ② の中身: 選挙ヘッダー / 候補者カード（3スコア＋比較に追加）/ 公約比較表（7軸）/
 *             地域課題5分野（出所のあるもののみ）/ 政策ステータス4段階 / 現職4年レビュー（条件付き）/
 *             AIプロンプトコピー3種（その都度APIを呼ばない）
 *
 * 実装しない: SNS分析・感情分析 / 候補者ランキング・推し / 経歴点数化 / 政策14段階ファネル /
 *             1800自治体KPI / AI自動比較API / 支持率・人気ランキング
 *
 * 注意: 動く仕様書（プロト）。データはサンプル。本番は運営adminが取込・審査した選挙/候補者/地域課題を表示。
 */

import { ONGOING_ELECTIONS, POLICY_THEMES, type ElectionCand, type OngoingElection } from '../_data'
import { STORE_KEYS, loadJSON } from '../_store'
import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'

const themeName = (id: string) => POLICY_THEMES.find((t) => t.id === id)?.name ?? id

// ───── 3スコア（政策の近さ=後述 / 実行力 / 透明性）─────
const execScore = (c: ElectionCand): string => {
  const pts = (c.status === '現職' ? 2 : 0) + (c.finance === '明確' ? 2 : c.finance === '一部' ? 1 : 0) + (c.achievement ? 1 : 0)
  return pts >= 4 ? 'A' : pts >= 2 ? 'B' : 'C'
}
const transScore = (c: ElectionCand): string => (c.transparency === '高' ? 'A' : c.transparency === '中' ? 'B' : c.transparency === '低' ? 'C' : '未確認')
const gradeColor = (g: string) => (g === 'A' ? 'text-emerald-600' : g === 'B' ? 'text-blue-600' : g === 'C' ? 'text-amber-600' : 'text-gray-400')
const sourceOf = (c: ElectionCand) => c.source ?? '公開情報'

// ───── 地域課題 5分野（初期はこの5つのみ）─────
const AREA_FIELDS: { key: string; name: string; themes: string[] }[] = [
  { key: 'kosodate', name: '子育て・教育', themes: ['kosodate'] },
  { key: 'bosai', name: '防災・安全', themes: ['bosai', 'kotsu'] },
  { key: 'zaisei', name: '財政・税金', themes: ['chiho-zaisei', 'nyusatsu'] },
  { key: 'dx', name: '行政改革・DX', themes: ['ai-gyosei', 'nyusatsu'] },
  { key: 'fukushi', name: '福祉・高齢者', themes: ['jinken', 'nettyusho'] },
]
const STAGES = ['課題整理中', '公約・政策化', '実行・働きかけ中', '成果確認中']

// ───── 候補者ごとの補足（重点公約・具体性・期限/KPI）。本番は運営取込データ ─────
const CAND_EXTRA: Record<string, { pledge: string; specificity: '高' | '中' | '低'; deadline: string }> = {
  '区民 一郎': { pledge: '防災予算を増額し、全避難所に蓄電池・備蓄を整備', specificity: '高', deadline: '3年以内・避難所100%' },
  '杉並 花子': { pledge: '待機児童ゼロと学童の質向上。保育士給与を区独自に上乗せ', specificity: '中', deadline: '2年以内・待機児童ゼロ' },
  '高円寺 健': { pledge: '入札・契約を全面公開し、行財政改革で財源を捻出', specificity: '高', deadline: '4年で10億円削減' },
  '阿佐ヶ谷 みどり': { pledge: '子ども食堂と生活困窮者支援を区内全域へ', specificity: '低', deadline: '（期限の記載なし）' },
  '伊藤 さやか': { pledge: '行政手続きの大半をオンライン化し、二重行政を解消', specificity: '中', deadline: '4年で手続き90%デジタル化' },
  '森本 太一': { pledge: '観光振興と万博後の跡地活用で経済再生', specificity: '中', deadline: '跡地計画を2年で策定' },
  '大阪 直子': { pledge: '子育て支援の所得制限撤廃と教育無償化の拡大', specificity: '高', deadline: '初年度に所得制限撤廃' },
}
const ex = (c: ElectionCand) => CAND_EXTRA[c.name] ?? { pledge: '（公約情報は未登録）', specificity: '低' as const, deadline: '—' }

interface AreaIssue { field: string; status: string; data: string; stage: number; source: string; updated: string }
interface IncumbentReview { name: string; hasEvidence: boolean; items?: { pledge: string; result: string; source: string }[] }
interface ElectionExtra { officialUrl: string; issues: AreaIssue[]; policyStatuses: { name: string; stage: number }[]; incumbent?: IncumbentReview }

// ───── 選挙ごとの補足（地域課題・政策ステータス・現職レビュー）。出所がない課題は含めない＝表示しない ─────
const ELECTION_EXTRA: Record<string, ElectionExtra> = {
  'suginami-chiji': {
    officialUrl: 'https://www.city.suginami.tokyo.jp/',
    issues: [
      { field: 'kosodate', status: '保育需要が増え、学童に空き待ちが残る', data: '待機児童数・学童利用率（区公表）', stage: 1, source: '杉並区 子育て支援課 公表資料', updated: '2026-06-10' },
      { field: 'bosai', status: '木造住宅密集地域が一部に残る', data: '想定避難者数（区地域防災計画）', stage: 2, source: '杉並区 地域防災計画', updated: '2026-05-20' },
      { field: 'zaisei', status: '扶助費の増加で財政が硬直化', data: '経常収支比率（決算カード）', stage: 0, source: '総務省 決算カード', updated: '2026-04-01' },
      { field: 'fukushi', status: '高齢化が進み、見守り体制が課題', data: '高齢化率（住民基本台帳）', stage: 0, source: '杉並区 住民基本台帳', updated: '2026-06-01' },
      // 行政改革・DX は出所データ未登録のため表示しない（仕様：データ出所がない課題は非表示）
    ],
    policyStatuses: [
      { name: '全避難所への蓄電池・備蓄整備', stage: 2 },
      { name: '保育士給与の区独自上乗せ', stage: 1 },
      { name: '入札・契約の全面公開', stage: 0 },
    ],
    incumbent: {
      name: '区民 一郎', hasEvidence: true,
      items: [
        { pledge: '防災予算の増額', result: '前期で約1.4倍に増額（公約は2倍）', source: '区予算書・区議会議事録' },
        { pledge: '子育て世代包括支援センター設置', result: '2拠点を設置（公約は全区展開）', source: '区公表資料' },
        { pledge: '区窓口の待ち時間短縮', result: '一部窓口で予約制を導入、効果は検証中', source: '区公表資料' },
      ],
    },
  },
  'osaka-chiji': {
    officialUrl: 'https://www.pref.osaka.lg.jp/',
    issues: [
      { field: 'kosodate', status: '子育て世帯の負担感が高い', data: '保育・教育関連の府公表指標', stage: 1, source: '大阪府 福祉部 公表資料', updated: '2026-06-15' },
      { field: 'zaisei', status: '将来の財政負担への懸念', data: '経常収支比率（決算カード）', stage: 0, source: '総務省 決算カード', updated: '2026-04-01' },
      { field: 'dx', status: '行政手続きのデジタル化が途上', data: 'オンライン化率（府戦略）', stage: 1, source: '大阪府 スマートシティ戦略', updated: '2026-05-30' },
      // 防災・安全 / 福祉・高齢者 は出所データ未登録のため表示しない
    ],
    policyStatuses: [
      { name: '行政手続きのオンライン化', stage: 2 },
      { name: '万博跡地の活用計画', stage: 0 },
    ],
    incumbent: { name: '森本 太一', hasEvidence: false }, // 前回公約と根拠資料が揃わない → レビューは非表示/注記
  },
}

// ───── AIプロンプト（公開ページではAPIを呼ばず、コピーしてユーザー自身のAIへ）─────
const interestThemes = (w: Record<string, number> | null) =>
  w ? Object.entries(w).filter(([, v]) => v >= 2).map(([id]) => themeName(id)).join('、') || '（特に強い関心テーマなし）' : '（診断未受診）'

function promptDeepDive(e: OngoingElection, w: Record<string, number> | null): string {
  const cands = e.cands.map((c, i) => `${i + 1}. ${c.name}（${c.party}・${c.status}）\n重点公約：${ex(c).pledge}\n財源：${c.finance} / 期限・KPI：${ex(c).deadline} / 透明性：${c.transparency}`).join('\n\n')
  return `あなたは中立的な選挙情報アシスタントです。特定候補を一方的に推奨せず、有権者が判断しやすいよう比較してください。\n\n# 選挙\n${e.name}（${e.region}・投票日 ${e.date}）\n\n# 私の関心\n${interestThemes(w)}\n\n# 候補者\n${cands}\n\n# お願い\n各候補の「強み」「確認したい点」「争点になりそうな違い」を中立的に整理し、最後に有権者が追加で確認すべき質問を挙げてください。不明な点は推測せず「不明」と書いてください。`
}
function promptQuestions(e: OngoingElection): string {
  return `${e.name} の候補者に直接聞くと判断材料になる質問を、中立的に作ってください。\n観点：①重点公約の財源 ②いつまでに何を実現するか（期限・KPI） ③これまでの実績 ④情報公開の方針 ⑤地域課題（子育て・防災・財政・行政DX・福祉）への対応。\n各観点で1〜2問、合計8問程度。特定候補に有利・不利にならない聞き方にしてください。`
}
function promptAreaIssues(e: OngoingElection, xt?: ElectionExtra): string {
  const fields = (xt?.issues ?? []).map((is) => AREA_FIELDS.find((f) => f.key === is.field)?.name).filter(Boolean).join('、')
  return `${e.region} の地域課題（${fields || '子育て・防災・財政・行政DX・福祉'}）を、有権者向けに分かりやすく整理してください。\n各分野について「現状」「関連しそうなデータ」「候補者に確認したいこと」を中立的にまとめ、出所が不明な情報は『要確認』と明記してください。断定や特定候補への誘導は避けてください。`
}

export default function ElectionsPage() {
  const [postal, setPostal] = useState('')
  const [searched, setSearched] = useState(false)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [weights, setWeights] = useState<Record<string, number> | null>(null)
  const [compare, setCompare] = useState<Set<string>>(new Set())
  const [openCand, setOpenCand] = useState<string | null>(null)
  const [copied, setCopied] = useState<string | null>(null)
  const [shownPrompt, setShownPrompt] = useState<{ key: string; text: string } | null>(null)
  const [reminder, setReminder] = useState(false)

  useEffect(() => {
    const d = loadJSON<{ weights?: Record<string, number> } | null>(STORE_KEYS.citizenMatch, null)
    if (d) setWeights(d.weights ?? null)
  }, [])

  const digits = postal.replace(/[^0-9]/g, '')
  const matched = useMemo(() => {
    if (!digits) return ONGOING_ELECTIONS
    const hit = ONGOING_ELECTIONS.filter((e) => e.postalPrefixes.some((p) => digits.startsWith(p)))
    return hit.length ? hit : ONGOING_ELECTIONS
  }, [digits])
  const exactHit = digits.length >= 2 && ONGOING_ELECTIONS.some((e) => e.postalPrefixes.some((p) => digits.startsWith(p)))
  const election = ONGOING_ELECTIONS.find((e) => e.id === selectedId) ?? null

  const matchData = useMemo(() => {
    if (!election || !weights) return null
    const raws = election.cands.map((c) => c.themes.reduce((s, t) => s + (weights[t] ?? 0), 0))
    return { maxRaw: Math.max(1, ...raws) }
  }, [election, weights])
  const matchPct = (c: ElectionCand): number | null => {
    if (!weights || !matchData) return null
    const raw = c.themes.reduce((s, t) => s + (weights[t] ?? 0), 0)
    return Math.round(55 + (raw / matchData.maxRaw) * 37)
  }

  const quickEval = (c: ElectionCand) => {
    const s: string[] = []; const k: string[] = []
    if (c.finance === '明確') s.push('財源の説明が明確'); else if (c.finance === '不明') k.push('財源が不明（要確認）')
    if (c.status === '現職') s.push('現職としての実績')
    if (c.transparency === '高') s.push('情報公開に積極的'); else if (c.transparency === '低' || c.transparency === '未確認') k.push('情報公開が乏しい（要確認）')
    if (c.achievement) s.push(c.achievement)
    if (ex(c).specificity === '低') k.push('公約の具体性が低め（要確認）')
    return { s, k }
  }

  const toggleCompare = (name: string) => setCompare((prev) => { const n = new Set(prev); n.has(name) ? n.delete(name) : n.add(name); return n })
  // クリップボードAPI→execCommandの順でコピー試行。どちらも不可な環境でも下のテキストエリアから手動コピーできる。
  const copy = async (key: string, text: string) => {
    setShownPrompt({ key, text })
    let ok = false
    try { await navigator.clipboard.writeText(text); ok = true } catch { /* fallthrough */ }
    if (!ok) { try { const ta = document.createElement('textarea'); ta.value = text; ta.style.position = 'fixed'; ta.style.opacity = '0'; document.body.appendChild(ta); ta.focus(); ta.select(); ok = document.execCommand('copy'); document.body.removeChild(ta) } catch { /* ignore */ } }
    if (ok) { setCopied(key); setTimeout(() => setCopied((c) => (c === key ? null : c)), 2500) }
  }

  const card = 'rounded-xl border border-gray-200 bg-white p-4'

  // ═══════════ ② 選挙特設ページ ═══════════
  if (election) {
    const xt = ELECTION_EXTRA[election.id]
    const compareList = election.cands.filter((c) => compare.has(c.name))
    const cmp = compareList.length ? compareList : election.cands
    const specCls = (s: string) => (s === '高' ? 'bg-emerald-50 text-emerald-600' : s === '中' ? 'bg-blue-50 text-blue-600' : 'bg-amber-50 text-amber-700')

    return (
      <div className='mx-auto w-full max-w-3xl px-4 py-8'>
        <button onClick={() => { setSelectedId(null); setOpenCand(null) }} className='mb-4 text-xs text-gray-400 hover:text-gray-600'>← 選挙を選び直す</button>

        {/* 選挙ヘッダー */}
        <div className='mb-3'>
          <span className='rounded-full bg-blue-100 px-2 py-0.5 text-[11px] font-semibold text-blue-700'>{election.typeLabel}</span>
          <h1 className='mt-1 text-2xl font-bold text-gray-900'>{election.name}</h1>
          <p className='mt-0.5 text-sm text-gray-500'>{election.region} ・ 投票日 {election.date} ・ 候補者 {election.cands.length}名</p>
          <div className='mt-2 flex flex-wrap gap-2'>
            {xt?.officialUrl && <a href={xt.officialUrl} target='_blank' rel='noopener noreferrer' className='rounded-lg border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50'>🔗 公式情報（選挙管理委員会）</a>}
            <button onClick={() => setReminder((v) => !v)} className={`rounded-lg px-3 py-1.5 text-xs font-medium ${reminder ? 'bg-blue-600 text-white' : 'border border-blue-300 text-blue-700 hover:bg-blue-50'}`}>{reminder ? '✓ 投票日リマインダー設定済' : '🔔 投票日リマインダー'}</button>
          </div>
          {reminder && <p className='mt-2 rounded-lg bg-blue-50 px-3 py-2 text-[11px] text-blue-700'>投票日（{election.date}）・期日前投票・投票所の中立的なご案内のみを通知します。特定候補への投票依頼や選挙運動は行いません。</p>}
        </div>

        <div className='mb-5 rounded-xl border border-gray-200 bg-gray-50 p-3 text-[11px] leading-relaxed text-gray-500'>
          政策診断の回答と候補者の公開情報・本人入力情報をもとにした<strong className='text-gray-700'>参考比較</strong>です。特定候補者への投票を推奨するものではありません。
        </div>

        {/* 候補者カード */}
        <h2 className='mb-2 text-sm font-bold text-gray-900'>候補者{!weights && <span className='ml-2 text-[11px] font-normal text-gray-400'>（<Link href='/prototype/match' className='underline'>30秒診断</Link>で「政策の近さ」が表示されます）</span>}</h2>
        <div className='mb-6 space-y-2'>
          {[...election.cands].map((c) => ({ c, pct: matchPct(c) })).sort((a, b) => (b.pct ?? -1) - (a.pct ?? -1)).map(({ c, pct }) => {
            const e2 = ex(c); const open = openCand === c.name; const inCmp = compare.has(c.name); const ev = quickEval(c)
            return (
              <div key={c.name} className={card}>
                <div className='flex items-start gap-3'>
                  <div className='min-w-0 flex-1'>
                    <div className='flex flex-wrap items-center gap-2'>
                      <span className='text-base font-bold text-gray-900'>{c.name}</span>
                      <span className='text-xs text-gray-500'>{c.party} · {c.status} · {c.age}歳</span>
                    </div>
                    <p className='mt-1 text-xs text-gray-700'><span className='font-semibold text-gray-500'>重点公約：</span>{e2.pledge}</p>
                    <p className='mt-1 text-[10px] text-gray-400'>データ出所：{sourceOf(c)}</p>
                  </div>
                  <div className='grid shrink-0 grid-cols-3 gap-2 text-center'>
                    <div><div className='text-sm font-bold text-blue-600'>{pct === null ? '—' : `${pct}%`}</div><div className='text-[9px] text-gray-400'>政策の近さ</div></div>
                    <div><div className={`text-sm font-bold ${gradeColor(execScore(c))}`}>{execScore(c)}</div><div className='text-[9px] text-gray-400'>実行力</div></div>
                    <div><div className={`text-sm font-bold ${gradeColor(transScore(c))}`}>{transScore(c)}</div><div className='text-[9px] text-gray-400'>透明性</div></div>
                  </div>
                </div>
                <div className='mt-2 flex items-center gap-2'>
                  <button onClick={() => setOpenCand(open ? null : c.name)} className='rounded-lg border border-gray-300 px-3 py-1 text-[11px] font-semibold text-gray-700 hover:bg-gray-50'>{open ? '閉じる' : '詳細を見る'}</button>
                  <button onClick={() => toggleCompare(c.name)} className={`rounded-lg px-3 py-1 text-[11px] font-semibold ${inCmp ? 'bg-blue-600 text-white' : 'border border-blue-300 text-blue-700 hover:bg-blue-50'}`}>{inCmp ? '✓ 比較中' : '＋ 比較に追加'}</button>
                </div>
                {open && (
                  <div className='mt-3 grid gap-2 border-t border-gray-100 pt-3 text-xs sm:grid-cols-2'>
                    <p><span className='text-emerald-600'>強み：</span>{ev.s.join('、') || '—'}</p>
                    <p><span className='text-amber-600'>確認したい点：</span>{ev.k.join('、') || '—'}</p>
                    <p><span className='text-gray-500'>具体性：</span>{e2.specificity} / <span className='text-gray-500'>期限・KPI：</span>{e2.deadline}</p>
                    <p><span className='text-gray-500'>財源：</span>{c.finance} / <span className='text-gray-500'>関連実績：</span>{c.achievement || '—'}</p>
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* 公約比較表（7軸） */}
        <h2 className='mb-1 text-sm font-bold text-gray-900'>公約比較表</h2>
        <p className='mb-2 text-[11px] text-gray-400'>{compareList.length ? `「比較に追加」した ${compareList.length}名で比較中。` : '候補者カードの「＋比較に追加」で絞り込めます（未選択時は全員を表示）。'}</p>
        <div className='mb-6 overflow-x-auto rounded-xl border border-gray-200 bg-white'>
          <table className='w-full text-sm'>
            <thead><tr className='border-b border-gray-100'>
              <th className='whitespace-nowrap p-3 text-left text-xs font-medium text-gray-400'>比較軸</th>
              {cmp.map((c) => <th key={c.name} className='min-w-[130px] p-3 text-left font-bold text-gray-900'>{c.name}</th>)}
            </tr></thead>
            <tbody>
              {([
                ['重点公約', (c: ElectionCand) => <span className='text-xs'>{ex(c).pledge}</span>],
                ['具体性', (c: ElectionCand) => <span className={`rounded px-1.5 py-0.5 text-[11px] font-semibold ${specCls(ex(c).specificity)}`}>{ex(c).specificity}</span>],
                ['財源', (c: ElectionCand) => <span className='text-xs'>{c.finance}</span>],
                ['期限・KPI', (c: ElectionCand) => <span className='text-xs'>{ex(c).deadline}</span>],
                ['関連実績', (c: ElectionCand) => <span className='text-xs text-gray-600'>{c.achievement || '—'}</span>],
                ['透明性', (c: ElectionCand) => <span className={`font-bold ${gradeColor(transScore(c))}`}>{transScore(c)}</span>],
                ['地域課題対応', (c: ElectionCand) => { const hit = AREA_FIELDS.filter((f) => f.themes.some((t) => c.themes.includes(t))).map((f) => f.name); return <span className='text-[11px] text-gray-600'>{hit.length ? hit.join('・') : '—'}</span> }],
              ] as [string, (c: ElectionCand) => React.ReactNode][]).map(([label, render]) => (
                <tr key={label} className='border-b border-gray-50 align-top last:border-0'>
                  <td className='whitespace-nowrap p-3 text-xs font-semibold text-gray-700'>{label}</td>
                  {cmp.map((c) => <td key={c.name} className='p-3 text-gray-700'>{render(c)}</td>)}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* 地域課題 5分野（出所のあるもののみ） */}
        <h2 className='mb-1 text-sm font-bold text-gray-900'>この地域の課題（5分野）</h2>
        <p className='mb-3 text-[11px] text-gray-400'>子育て・教育／防災・安全／財政・税金／行政改革・DX／福祉・高齢者。<strong>データ出所のある課題のみ</strong>表示します。</p>
        <div className='mb-6 space-y-2'>
          {(xt?.issues ?? []).map((is) => {
            const f = AREA_FIELDS.find((x) => x.key === is.field); if (!f) return null
            const related = election.cands.filter((c) => f.themes.some((t) => c.themes.includes(t)))
            return (
              <div key={is.field} className={card}>
                <div className='flex items-center justify-between'>
                  <p className='text-sm font-bold text-gray-900'>{f.name}</p>
                  <span className='rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-medium text-blue-700'>{STAGES[is.stage]}</span>
                </div>
                <p className='mt-1 text-xs text-gray-700'><span className='text-gray-400'>現状：</span>{is.status}</p>
                <p className='mt-0.5 text-xs text-gray-700'><span className='text-gray-400'>関連データ：</span>{is.data}</p>
                {related.length > 0 && (
                  <p className='mt-0.5 text-[11px] text-gray-600'><span className='text-gray-400'>関連候補者・公約：</span>{related.map((c) => `${c.name}（${ex(c).pledge}）`).join(' / ')}</p>
                )}
                <p className='mt-1 text-[10px] text-gray-400'>データ出所：{is.source} ・ 最終更新：{is.updated}</p>
              </div>
            )
          })}
          {(!xt || xt.issues.length === 0) && <p className='text-sm text-gray-400'>出所付きで登録された地域課題はまだありません。</p>}
        </div>

        {/* 政策ステータス（4段階・運営更新分のみ） */}
        {xt && xt.policyStatuses.length > 0 && (
          <>
            <h2 className='mb-1 text-sm font-bold text-gray-900'>政策の進捗（4段階）</h2>
            <p className='mb-3 text-[11px] text-gray-400'>運営が更新した政策のみ表示。{STAGES.join(' → ')}。</p>
            <div className='mb-6 space-y-3'>
              {xt.policyStatuses.map((p) => (
                <div key={p.name} className={card}>
                  <p className='mb-2 text-sm font-semibold text-gray-900'>{p.name}</p>
                  <div className='flex items-center gap-1'>
                    {STAGES.map((s, i) => (
                      <div key={s} className='flex flex-1 items-center'>
                        <div className={`flex-1 rounded-full py-1 text-center text-[10px] font-medium ${i <= p.stage ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-400'}`}>{s}</div>
                        {i < STAGES.length - 1 && <span className={`px-0.5 text-[10px] ${i < p.stage ? 'text-blue-600' : 'text-gray-300'}`}>›</span>}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* 現職4年レビュー（現職あり＋前回公約・根拠資料がある場合のみ） */}
        {xt?.incumbent && (
          <>
            <h2 className='mb-1 text-sm font-bold text-gray-900'>現職の4年間レビュー</h2>
            {xt.incumbent.hasEvidence && xt.incumbent.items ? (
              <div className='mb-6 overflow-x-auto rounded-xl border border-gray-200 bg-white'>
                <p className='border-b border-gray-100 p-3 text-xs text-gray-500'>{xt.incumbent.name}（現職）の前回公約と、公開情報で確認できた結果です。</p>
                <table className='w-full text-sm'>
                  <thead><tr className='border-b border-gray-100 text-left text-xs text-gray-400'><th className='p-3'>前回公約</th><th className='p-3'>結果（公開情報）</th><th className='p-3'>根拠</th></tr></thead>
                  <tbody>
                    {xt.incumbent.items.map((it) => (
                      <tr key={it.pledge} className='border-b border-gray-50 align-top last:border-0'>
                        <td className='p-3 text-xs font-semibold text-gray-700'>{it.pledge}</td>
                        <td className='p-3 text-xs text-gray-600'>{it.result}</td>
                        <td className='p-3 text-[11px] text-gray-400'>{it.source}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className='mb-6 rounded-xl border border-gray-200 bg-gray-50 p-4 text-xs text-gray-500'>
                {xt.incumbent.name}（現職）の前回公約と達成状況は、<strong className='text-gray-700'>公開情報では確認できません</strong>。確認でき次第、根拠資料とともに掲載します。
              </div>
            )}
          </>
        )}

        {/* AIプロンプトコピー（公開ページでAPIを呼ばない） */}
        <h2 className='mb-1 text-sm font-bold text-gray-900'>AIでさらに深掘りする</h2>
        <p className='mb-3 text-[11px] text-gray-400'>この公開ページは<strong>生成AIをその都度呼び出しません</strong>。下のボタンでプロンプトをコピーし、ご自身のChatGPT/Claudeへ貼り付けて深掘りできます（参考情報）。</p>
        <div className='mb-6 grid gap-2 sm:grid-cols-3'>
          <button onClick={() => copy('deep', promptDeepDive(election, weights))} className='rounded-xl border border-indigo-300 bg-white px-3 py-3 text-xs font-semibold text-indigo-700 hover:bg-indigo-50'>{copied === 'deep' ? '✓ コピーしました' : '🤖 この選挙をAIで深掘りする'}</button>
          <button onClick={() => copy('q', promptQuestions(election))} className='rounded-xl border border-indigo-300 bg-white px-3 py-3 text-xs font-semibold text-indigo-700 hover:bg-indigo-50'>{copied === 'q' ? '✓ コピーしました' : '❓ 候補者に聞く質問をコピー'}</button>
          <button onClick={() => copy('area', promptAreaIssues(election, xt))} className='rounded-xl border border-indigo-300 bg-white px-3 py-3 text-xs font-semibold text-indigo-700 hover:bg-indigo-50'>{copied === 'area' ? '✓ コピーしました' : '🗂️ 地域課題を整理する'}</button>
        </div>
        {shownPrompt && (
          <div className='mb-6'>
            <p className='mb-1 text-[11px] text-gray-400'>{copied ? '✓ コピーしました。' : 'この内容を選択してコピーし、'}ご自身のChatGPT / Claude に貼り付けてください。</p>
            <textarea readOnly value={shownPrompt.text} onFocus={(e) => e.currentTarget.select()} className='h-36 w-full rounded-lg border border-gray-300 p-2 text-[11px] leading-relaxed text-gray-700' />
          </div>
        )}

        <p className='mt-2 rounded-xl border border-gray-200 bg-gray-50 p-3 text-[11px] leading-relaxed text-gray-500'>
          このページは、有権者が候補者の政策・実績・透明性を比較するための参考情報です。特定候補者への投票を推奨するものではありません。
          候補者・地域課題の情報は公式情報・本人入力・公開情報等をもとに掲載し、データ出所と最終更新日を可能な限り明示します。最終判断は各候補者の公式情報・選挙管理委員会等もご確認ください。
        </p>
      </div>
    )
  }

  // ═══════════ 〒検索 → ① 自治体軽量版 + 選挙リンク ═══════════
  const muniName = matched[0]?.region ?? ''
  return (
    <div className='mx-auto w-full max-w-2xl px-4 py-8'>
      <div className='mb-5'>
        <div className='mb-2 inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-600'>
          <span className='h-1.5 w-1.5 rounded-full bg-blue-500' />
          プロトタイプ / seijiselect.jp
        </div>
        <h1 className='text-2xl font-bold text-gray-900'>選挙で選ぶ</h1>
        <p className='mt-1 text-sm text-gray-500'>候補者を、自分の暮らしの目線で比べる。郵便番号で、いまあなたの地域の選挙が見つかります。</p>
      </div>

      <div className='mb-5 rounded-xl border border-gray-200 bg-white p-5'>
        <label className='mb-1 block text-xs font-medium text-gray-600'>郵便番号</label>
        <div className='flex gap-2'>
          <input
            className='w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-400'
            placeholder='例: 166-0001（杉並区）' value={postal} onChange={(e) => setPostal(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') setSearched(true) }} inputMode='numeric'
          />
          <button onClick={() => setSearched(true)} className='shrink-0 rounded-lg bg-blue-600 px-5 py-2 text-sm font-semibold text-white hover:bg-blue-700'>検索</button>
        </div>
        <p className='mt-2 text-[11px] text-gray-400'>例: 166/167/168 → 杉並区、53〜59 → 大阪府。空欄でも全国の実施中選挙を表示します。</p>
      </div>

      {/* ① 自治体ページ軽量版（〒一致時のみ・導線） */}
      {searched && exactHit && (
        <div className='mb-5 rounded-xl border border-blue-200 bg-blue-50/50 p-4'>
          <p className='text-xs font-semibold text-blue-700'>あなたの地域</p>
          <p className='text-lg font-bold text-gray-900'>{muniName}</p>
          <p className='mt-0.5 text-xs text-gray-500'>
            実施中の選挙 {matched.length}件 ・ 登録候補者 {matched.reduce((s, e) => s + e.cands.length, 0)}名
            {ELECTION_EXTRA[matched[0]?.id ?? '']?.issues.length ? ` ・ 地域課題 ${ELECTION_EXTRA[matched[0].id].issues.length}分野` : ''}
          </p>
          <p className='mt-2 text-[11px] text-gray-400'>※ 自治体の詳細KPIは持たず、選挙・候補者・地域課題への軽い導線に絞っています。</p>
        </div>
      )}

      <h2 className='mb-2 text-sm font-bold text-gray-900'>
        {searched && exactHit ? 'あなたの地域で実施中の選挙' : '実施中の選挙'}
        {searched && !exactHit && digits.length >= 2 && <span className='ml-1 text-[11px] font-normal text-gray-400'>（該当地域が見つからないため全国を表示）</span>}
      </h2>
      <div className='space-y-2'>
        {matched.map((e: OngoingElection) => (
          <button key={e.id} onClick={() => { setSelectedId(e.id); setCompare(new Set()); setOpenCand(null) }} className='flex w-full items-center gap-3 rounded-xl border border-gray-200 bg-white p-4 text-left transition-shadow hover:shadow-md'>
            <div className='min-w-0 flex-1'>
              <div className='flex flex-wrap items-center gap-2'>
                <span className='rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-semibold text-blue-700'>{e.typeLabel}</span>
                <span className='text-sm font-bold text-gray-900'>{e.name}</span>
              </div>
              <p className='mt-0.5 text-xs text-gray-400'>{e.region} ・ 投票日 {e.date} ・ 候補者 {e.cands.length}名</p>
            </div>
            <span className='shrink-0 text-xs font-medium text-blue-600'>候補者を比べる →</span>
          </button>
        ))}
      </div>
      <p className='mt-5 text-center text-xs text-gray-400'>※ 実施中選挙はサンプル。本番は運営adminが取り込み・審査した選挙・候補者・地域課題を表示します。</p>
    </div>
  )
}
