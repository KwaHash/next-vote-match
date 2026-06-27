'use client'

/**
 * 【プロトタイプ】seijiselect.jp 選挙別 候補者比較ページ（中立・低コスト設計）
 *
 * 目的: 有権者が「自分の価値観・関心・生活課題」に照らして候補者を比較できる中立的な参考ページ。
 *   - 「誰に投票すべきか」を一方的に示さない（中立表現・根拠表示・データ出所表示）。
 *   - 視点別の比較は **その都度AIを呼ばない**（ルールベース＋「自分のAIで深掘り」プロンプトのコピー）。
 *
 * 注意: 動く仕様書（プロトタイプ）。データはサンプル。本番は運営adminが取込・審査した選挙/候補者を表示。
 */

import { ONGOING_ELECTIONS, POLICY_THEMES, type ElectionCand, type OngoingElection } from '../_data'
import { STORE_KEYS, loadJSON } from '../_store'
import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'

const themeName = (id: string) => POLICY_THEMES.find((t) => t.id === id)?.name ?? id

// データ出どころ（サンプル）
const SOURCE: Record<string, string> = {
  '区民 一郎': '公式情報・運営確認済み', '杉並 花子': '本人入力', '高円寺 健': '公式サイト・選挙公報', '阿佐ヶ谷 みどり': '公開情報（一部未確認）',
  '伊藤 さやか': '本人入力', '森本 太一': '公式情報', '大阪 直子': '選挙公報',
}
const sourceOf = (c: ElectionCand) => c.source ?? SOURCE[c.name] ?? '公開情報'

// 実行力・透明性スコア（A/B/C・未確認）
const execScore = (c: ElectionCand): string => {
  const pts = (c.status === '現職' ? 2 : 0) + (c.finance === '明確' ? 2 : c.finance === '一部' ? 1 : 0) + (c.achievement ? 1 : 0)
  return pts >= 4 ? 'A' : pts >= 2 ? 'B' : 'C'
}
const transScore = (c: ElectionCand): string => (c.transparency === '高' ? 'A' : c.transparency === '中' ? 'B' : c.transparency === '低' ? 'C' : '未確認')
const gradeColor = (g: string) => (g === 'A' ? 'text-emerald-600' : g === 'B' ? 'text-blue-600' : g === 'C' ? 'text-amber-600' : 'text-gray-400')

// 争点マップの軸
const ISSUES: { name: string; primary: string[]; related: string[] }[] = [
  { name: '子育て・教育', primary: ['kosodate'], related: ['nettyusho'] },
  { name: '防災・安全', primary: ['bosai'], related: ['kotsu', 'nettyusho'] },
  { name: '財政・税金', primary: ['chiho-zaisei'], related: ['nyusatsu'] },
  { name: '行政改革・DX', primary: ['ai-gyosei'], related: ['nyusatsu'] },
  { name: '福祉・人権', primary: ['jinken'], related: ['nettyusho', 'kosodate'] },
  { name: '地域経済', primary: ['kanko'], related: ['chiho-zaisei'] },
]
const issueRating = (iss: { primary: string[]; related: string[] }, c: ElectionCand) =>
  c.themes.some((t) => iss.primary.includes(t)) ? '◎' : c.themes.some((t) => iss.related.includes(t)) ? '○' : '△'

// 視点（10種・ルールベース。APIは使わない）
interface Angle { id: string; title: string; icon: string; themes: string[]; focus: string; questions: string[]; useFinance?: boolean; useTransparency?: boolean; useStatus?: boolean }
const ANGLES: Angle[] = [
  { id: 'kosodate', title: '子育て世代目線', icon: '🎒', themes: ['kosodate', 'nettyusho', 'kotsu'], focus: '保育・教育・給食・通学安全・公園・医療・共働き支援', questions: ['保育・教育に使う財源はどこから確保しますか？', 'いつまでに何を実現しますか？', '既存の子育て施策と何が違いますか？'] },
  { id: 'koure', title: '高齢者・介護目線', icon: '🧓', themes: ['nettyusho', 'bosai'], focus: '医療・介護・孤独対策・移動支援・防災・地域コミュニティ', questions: ['介護・見守りの体制をどう強化しますか？', '高齢者の移動・買い物支援は？', '災害時の高齢者避難は？'] },
  { id: 'wakamono', title: '若者・現役世代目線', icon: '🧑‍💻', themes: ['ai-gyosei', 'kosodate', 'chiho-zaisei'], focus: '家賃・所得・働き方・起業・行政DX・将来負担', questions: ['現役世代の手取り・負担をどう改善しますか？', '行政手続きのデジタル化は？', '将来世代へのツケをどう抑えますか？'] },
  { id: 'bosai', title: '防災・災害死ゼロ目線', icon: '🛟', themes: ['bosai', 'kotsu'], focus: '首都直下地震・避難所・高齢者避難・水害・情報伝達・孤立対策', questions: ['最初の1年で死者を減らすために何をしますか？', '避難所改善の予算はどこから？', '高齢者・障害者の避難支援は？'] },
  { id: 'zaigen', title: '税金・財源目線', icon: '💴', themes: ['chiho-zaisei', 'nyusatsu'], focus: '財源の明確さ・予算の優先順位・費用対効果・行財政改革', useFinance: true, questions: ['新規政策の財源は？', '予算の優先順位は？', '費用対効果をどう検証しますか？'] },
  { id: 'dx', title: '行政改革・AI/DX目線', icon: '🤖', themes: ['ai-gyosei', 'nyusatsu'], focus: '手続き簡素化・AI活用・窓口改革・データ公開・業務効率化', questions: ['どの手続きを最初にデジタル化しますか？', '区民の待ち時間をどう減らしますか？', 'データ公開の範囲は？'] },
  { id: 'clean', title: '透明性・政治資金目線', icon: '🔍', themes: ['nyusatsu'], focus: '政治資金・活動報告・寄付の透明性・利害関係・説明責任', useTransparency: true, questions: ['政治資金をどこまで公開しますか？', '活動報告の頻度は？', '利害関係の開示方針は？'] },
  { id: 'jikko', title: '実行力・経験目線', icon: '💪', themes: [], focus: '実績・現職経験・議会経験・NPO/民間実績・財源設計・調整力', useStatus: true, useFinance: true, questions: ['公約を実現した実績はありますか？', '反対勢力との合意形成は？', '財源と手順は具体的ですか？'] },
  { id: 'jinken', title: '弱者支援・人権目線', icon: '🤲', themes: ['jinken', 'kosodate'], focus: '貧困・子ども食堂・障害者・外国人・女性・ひとり親・生活困窮者支援', questions: ['困窮世帯への支援をどう広げますか？', '障害者・外国人支援の方針は？', 'ひとり親への具体策は？'] },
  { id: 'keizai', title: '地域経済・商店街目線', icon: '🏪', themes: ['kanko', 'chiho-zaisei'], focus: '商店街・中小企業・観光・創業・雇用・空き店舗・地域イベント', questions: ['商店街・中小企業の支援策は？', '空き店舗・創業支援は？', '観光・イベントの活性化は？'] },
]

function evalCand(a: Angle, c: ElectionCand) {
  const strengths: string[] = []; const concerns: string[] = []
  const matched = c.themes.filter((t) => a.themes.includes(t))
  if (matched.length) strengths.push(`${matched.map(themeName).join('・')}を重点に掲げる`)
  else if (a.themes.length) concerns.push('この観点の政策記載は相対的に少なめ')
  if (c.finance === '明確') strengths.push('財源の説明が明確'); else if (c.finance === '不明') concerns.push('財源が不明（要確認）')
  if (c.status === '現職') strengths.push('現職としての実績がある')
  if (c.transparency === '低' || c.transparency === '未確認') concerns.push('情報公開が乏しい（要確認）')
  if (c.achievement) strengths.push(c.achievement)
  const score = matched.length * 2 + (a.useFinance ? (c.finance === '明確' ? 2 : c.finance === '一部' ? 1 : 0) : 0) +
    (a.useTransparency ? (c.transparency === '高' ? 2 : c.transparency === '中' ? 1 : 0) : 0) + (a.useStatus ? (c.status === '現職' ? 2 : 0) : 0)
  return { score, strengths, concerns }
}

const interestThemes = (w: Record<string, number> | null) =>
  w ? Object.entries(w).filter(([, v]) => v >= 2).map(([id]) => themeName(id)).join('、') || '（特に強い関心テーマなし）' : '（診断未受診）'

function buildPrompt(e: OngoingElection, a: Angle, w: Record<string, number> | null): string {
  const cands = e.cands.map((c, i) => `${i + 1}. ${c.name}\n所属：${c.party}\n立場：${c.status}\n年齢：${c.age}歳\n重点政策：${c.themes.map(themeName).join('、')}\n実績：${c.achievement || '不明'}\n財源：${c.finance}\n透明性：${c.transparency}`).join('\n\n')
  return `あなたは中立的な選挙情報の比較アシスタントです。
以下の候補者情報をもとに、特定候補を一方的に推奨せず、有権者が判断しやすいように比較してください。

# 選挙情報
選挙名：${e.name}
地域：${e.region}
投票日：${e.date}

# 私の関心
重視テーマ：${interestThemes(w)}
特に気になる観点：${a.title}

# 候補者情報
${cands}

# 比較してほしい観点
${a.title}で比較してください。

# 出力形式
1. この観点で見るポイント
2. 候補者ごとの強み
3. 候補者ごとの確認したい点
4. 争点になりそうな違い
5. 有権者が追加で確認すべき質問
6. まとめ

# 注意
特定候補への投票を呼びかけず、中立的な比較にしてください。
不明な情報は推測せず「不明」と書いてください。`
}

export default function ElectionsPage() {
  const [postal, setPostal] = useState('')
  const [searched, setSearched] = useState(false)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [weights, setWeights] = useState<Record<string, number> | null>(null)
  const [angle, setAngle] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

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

  // 政策一致度（相対化：全員100%にならないよう 55〜92% に分布）
  const matchData = useMemo(() => {
    if (!election || !weights) return null
    const raws = election.cands.map((c) => c.themes.reduce((s, t) => s + (weights[t] ?? 0), 0))
    const maxRaw = Math.max(1, ...raws)
    return { maxRaw }
  }, [election, weights])
  const matchPct = (c: ElectionCand): number | null => {
    if (!weights || !matchData) return null
    const raw = c.themes.reduce((s, t) => s + (weights[t] ?? 0), 0)
    return Math.round(55 + (raw / matchData.maxRaw) * 37)
  }

  // ===== 選挙詳細 =====
  if (election) {
    const ranked = [...election.cands].map((c) => ({ c, pct: matchPct(c) })).sort((a, b) => (b.pct ?? -1) - (a.pct ?? -1))
    const a = angle ? ANGLES.find((x) => x.id === angle) ?? null : null

    return (
      <div className='mx-auto w-full max-w-3xl px-4 py-8'>
        <button onClick={() => { setSelectedId(null); setAngle(null) }} className='mb-4 text-xs text-gray-400 hover:text-gray-600'>← 選挙を選び直す</button>
        <div className='mb-3'>
          <span className='rounded-full bg-blue-100 px-2 py-0.5 text-[11px] font-semibold text-blue-700'>{election.typeLabel}</span>
          <h1 className='mt-1 text-2xl font-bold text-gray-900'>{election.name}</h1>
          <p className='mt-0.5 text-sm text-gray-500'>{election.region} ・ 投票日 {election.date} ・ 候補者 {election.cands.length}名</p>
          <p className='mt-1 text-xs text-gray-400'>政策・実行力・透明性から、自分の価値観で候補者を比べられます。</p>
        </div>

        <div className='mb-5 rounded-xl border border-gray-200 bg-gray-50 p-3 text-[11px] leading-relaxed text-gray-500'>
          この表示は、政策診断の回答と候補者の公開情報・本人入力情報をもとにした<strong className='text-gray-700'>参考比較</strong>です。特定候補者への投票を推奨するものではありません。
        </div>

        {/* あなたの関心に近い順 */}
        <h2 className='mb-2 text-sm font-bold text-gray-900'>あなたの関心に近い順</h2>
        {!weights && (
          <div className='mb-3 rounded-xl border border-blue-200 bg-blue-50 p-3 text-sm text-blue-800'>
            <Link href='/prototype/match' className='font-semibold underline'>30秒 政策マッチング診断</Link>を受けると、回答に近い順に並び替わります。
          </div>
        )}
        <div className='mb-6 space-y-2'>
          {ranked.map(({ c, pct }) => (
            <div key={c.name} className='rounded-xl border border-gray-200 bg-white p-4'>
              <div className='flex items-start gap-3'>
                <div className='min-w-0 flex-1'>
                  <div className='flex flex-wrap items-center gap-2'>
                    <span className='text-base font-bold text-gray-900'>{c.name}</span>
                    <span className='text-xs text-gray-500'>{c.party} · {c.status} · {c.age}歳</span>
                  </div>
                  <div className='mt-1 flex flex-wrap gap-1'>
                    {c.themes.map((t) => <span key={t} className='rounded-full bg-blue-50 px-2 py-0.5 text-[11px] text-blue-600'>{themeName(t)}</span>)}
                  </div>
                  {c.achievement && <p className='mt-1 text-[11px] text-gray-400'>{c.achievement}</p>}
                  <p className='mt-1 text-[10px] text-gray-400'>出どころ：{sourceOf(c)}</p>
                </div>
                <div className='grid shrink-0 grid-cols-3 gap-2 text-center'>
                  <div><div className='text-sm font-bold text-blue-600'>{pct === null ? '—' : `${pct}%`}</div><div className='text-[9px] text-gray-400'>政策一致</div></div>
                  <div><div className={`text-sm font-bold ${gradeColor(execScore(c))}`}>{execScore(c)}</div><div className='text-[9px] text-gray-400'>実行力</div></div>
                  <div><div className={`text-sm font-bold ${gradeColor(transScore(c))}`}>{transScore(c)}</div><div className='text-[9px] text-gray-400'>透明性</div></div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* 争点マップ */}
        <h2 className='mb-2 text-sm font-bold text-gray-900'>この選挙の争点マップ</h2>
        <div className='mb-6 overflow-x-auto rounded-xl border border-gray-200 bg-white'>
          <table className='w-full text-sm'>
            <thead><tr className='border-b border-gray-100'>
              <th className='whitespace-nowrap p-2.5 text-left text-xs font-medium text-gray-400'>争点</th>
              {election.cands.map((c) => <th key={c.name} className='whitespace-nowrap p-2.5 text-center text-xs font-medium text-gray-500'>{c.name}</th>)}
            </tr></thead>
            <tbody>
              {ISSUES.map((iss) => (
                <tr key={iss.name} className='border-b border-gray-50 last:border-0'>
                  <td className='whitespace-nowrap p-2.5 text-xs font-semibold text-gray-700'>{iss.name}</td>
                  {election.cands.map((c) => { const r = issueRating(iss, c); return <td key={c.name} className={`p-2.5 text-center text-base ${r === '◎' ? 'text-emerald-600 font-bold' : r === '○' ? 'text-blue-600' : 'text-gray-300'}`}>{r}</td> })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className='mb-6 text-[10px] text-gray-400'>◎ 重点として掲げる ／ ○ 関連 ／ △ 言及が少ない（重点政策タグに基づく機械的判定。詳細は各候補の公式情報をご確認ください）</p>

        {/* 視点を変えて候補者を比べる */}
        <h2 className='mb-1 text-sm font-bold text-gray-900'>視点を変えて候補者を比べる</h2>
        <p className='mb-3 text-[11px] text-gray-400'>子育て・防災・財源・実行力など、気になる観点から候補者の違いを整理できます。表示は<strong>事前定義（ルールベース）</strong>のため、何万人が使っても高速・低コストです。</p>
        <div className='mb-3 flex flex-wrap gap-2'>
          {ANGLES.map((x) => (
            <button key={x.id} onClick={() => { setAngle(angle === x.id ? null : x.id); setCopied(false) }} className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${angle === x.id ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>{x.icon} {x.title}</button>
          ))}
        </div>
        {a && (
          <div className='mb-6 rounded-xl border border-indigo-200 bg-indigo-50/50 p-4'>
            <p className='mb-1 text-xs font-bold text-indigo-900'>この観点で見るポイント</p>
            <p className='mb-3 text-xs text-gray-600'>{a.focus}</p>

            <p className='mb-1 text-xs font-bold text-indigo-900'>候補者ごとの見え方</p>
            <div className='mb-3 space-y-2'>
              {[...election.cands].map((c) => ({ c, ...evalCand(a, c) })).sort((x, y) => y.score - x.score).map(({ c, strengths, concerns }) => (
                <div key={c.name} className='rounded-lg bg-white p-3 text-xs'>
                  <p className='font-bold text-gray-900'>{c.name}<span className='ml-1 font-normal text-gray-400'>{c.party}</span></p>
                  {strengths.length > 0 && <p className='mt-0.5 text-gray-700'><span className='text-emerald-600'>強み:</span> {strengths.join('、')}</p>}
                  {concerns.length > 0 && <p className='mt-0.5 text-gray-700'><span className='text-amber-600'>確認したい点:</span> {concerns.join('、')}</p>}
                </div>
              ))}
            </div>

            <p className='mb-1 text-xs font-bold text-indigo-900'>この観点で聞いてみたい質問</p>
            <ul className='mb-3 list-inside list-disc space-y-0.5 text-xs text-gray-600'>{a.questions.map((q) => <li key={q}>{q}</li>)}</ul>

            <button onClick={async () => { try { await navigator.clipboard.writeText(buildPrompt(election, a, weights)); setCopied(true) } catch { /* ignore */ } }} className='w-full rounded-lg border border-indigo-300 bg-white px-4 py-2.5 text-xs font-semibold text-indigo-700 hover:bg-indigo-50'>
              {copied ? 'コピーしました（あなたのChatGPT/Claudeに貼り付けて深掘りできます）' : '🤖 比較プロンプトをコピー（自分のAIで深掘り）'}
            </button>
            <p className='mt-2 text-[10px] text-indigo-400'>※ 観点別の比較は事前定義の自動表示（生成AIをその都度呼び出していません）。さらに詳しく知りたい場合は、上のボタンでプロンプトをコピーしてご自身のAIへ。参考情報です。</p>
          </div>
        )}

        {/* 詳しい比較表 */}
        <h2 className='mb-2 text-sm font-bold text-gray-900'>詳しい比較表</h2>
        <div className='overflow-x-auto rounded-xl border border-gray-200 bg-white'>
          <table className='w-full text-sm'>
            <thead><tr className='border-b border-gray-100'>
              <th className='whitespace-nowrap p-3 text-left text-xs font-medium text-gray-400'>比較軸</th>
              {election.cands.map((c) => <th key={c.name} className='min-w-[120px] p-3 text-left font-bold text-gray-900'>{c.name}</th>)}
            </tr></thead>
            <tbody>
              {([
                ['政策一致度', (c: ElectionCand) => { const p = matchPct(c); return p === null ? <span className='text-gray-400'>診断で表示</span> : <span className='font-bold text-blue-600'>{p}%</span> }],
                ['重点政策', (c: ElectionCand) => <span className='text-xs'>{c.themes.map(themeName).join('、')}</span>],
                ['実行力', (c: ElectionCand) => <span className={`font-bold ${gradeColor(execScore(c))}`}>{execScore(c)}</span>],
                ['財源・現実性', (c: ElectionCand) => <span className='text-xs'>{c.finance}</span>],
                ['透明性', (c: ElectionCand) => <span className={`font-bold ${gradeColor(transScore(c))}`}>{transScore(c)}</span>],
                ['立場・実績', (c: ElectionCand) => <span className='text-xs text-gray-600'>{c.status} / {c.achievement || '—'}</span>],
                ['データ出所', (c: ElectionCand) => <span className='text-[11px] text-gray-500'>{sourceOf(c)}</span>],
              ] as [string, (c: ElectionCand) => React.ReactNode][]).map(([label, render]) => (
                <tr key={label} className='border-b border-gray-50 align-top last:border-0'>
                  <td className='whitespace-nowrap p-3 text-xs font-semibold text-gray-700'>{label}</td>
                  {election.cands.map((c) => <td key={c.name} className='p-3 text-gray-700'>{render(c)}</td>)}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* 注意文 */}
        <p className='mt-6 rounded-xl border border-gray-200 bg-gray-50 p-3 text-[11px] leading-relaxed text-gray-500'>
          このページは、有権者が候補者の政策・実績・透明性を比較するための参考情報です。特定候補者への投票を推奨するものではありません。
          候補者情報は、公式情報・本人入力情報・選挙公報・公開情報等をもとに掲載し、情報の出どころを可能な限り明示します。
          最終的な判断は、各候補者の公式情報・選挙管理委員会等の情報もご確認ください。
        </p>
      </div>
    )
  }

  // ===== 〒検索 → 実施中の選挙 =====
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

      <h2 className='mb-2 text-sm font-bold text-gray-900'>
        {searched && exactHit ? 'あなたの地域で実施中の選挙' : '実施中の選挙'}
        {searched && !exactHit && digits.length >= 2 && <span className='ml-1 text-[11px] font-normal text-gray-400'>（該当地域が見つからないため全国を表示）</span>}
      </h2>
      <div className='space-y-2'>
        {matched.map((e: OngoingElection) => (
          <button key={e.id} onClick={() => setSelectedId(e.id)} className='flex w-full items-center gap-3 rounded-xl border border-gray-200 bg-white p-4 text-left transition-shadow hover:shadow-md'>
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
      <p className='mt-5 text-center text-xs text-gray-400'>※ 実施中選挙はサンプル。本番は運営adminが取り込み・審査した選挙・候補者を表示します。</p>
    </div>
  )
}
