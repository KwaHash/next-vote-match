'use client'

/**
 * 【プロトタイプ】seijiselect.jp 選挙AI相談室 / AI比較プロンプトメーカー
 *
 * 目的: 有権者が「選挙→重視テーマ→候補者情報」を選び、ご自身のChatGPT/Claudeに貼り付けて使える
 *       中立的な比較プロンプトを生成。さらにテーマ別の質問案を公開質問ボードへ投稿できる。
 *
 * 重要: 公開ページで毎回AI APIを呼ばない（プロンプトを生成してコピーする方式）。特定候補は推奨しない。
 *
 * 注意: 動く仕様書。候補者・選挙はサンプル。投稿は localStorage（本番は Supabase + 運営確認）。
 */

import { ONGOING_ELECTIONS, POLICY_THEMES } from '../_data'
import { THEMES, ADD_OPTIONS, QUESTION_BANK, themeName, type PublicQuestion } from '../_questions'
import { STORE_KEYS, loadJSON, saveJSON } from '../_store'
import { SEED_QUESTIONS } from '../_questions'
import Link from 'next/link'
import { useState } from 'react'

const polName = (id: string) => POLICY_THEMES.find((t) => t.id === id)?.name ?? id

export default function AiConsultPage() {
  const [electionId, setElectionId] = useState(ONGOING_ELECTIONS[0]?.id ?? '')
  const [themes, setThemes] = useState<string[]>([])
  const [addOpts, setAddOpts] = useState<string[]>([])
  const [mode, setMode] = useState<'registered' | 'paste'>('registered')
  const [pasted, setPasted] = useState('')
  const [copied, setCopied] = useState<string | null>(null)
  const [posting, setPosting] = useState<{ themeKey: string; title: string; body: string } | null>(null)
  const [nickname, setNickname] = useState('')
  const [postedMsg, setPostedMsg] = useState(false)

  const election = ONGOING_ELECTIONS.find((e) => e.id === electionId) ?? null
  const toggle = (arr: string[], set: (v: string[]) => void, v: string) => set(arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v])

  const candidateInfo = () => {
    if (mode === 'paste') return pasted.trim() || '（候補者情報の貼り付けがありません）'
    if (!election) return '（候補者情報なし）'
    return election.cands.map((c, i) => `${i + 1}. ${c.name}（${c.party}・${c.status}・${c.age}歳）\n  重点政策：${c.themes.map(polName).join('、')}\n  財源：${c.finance} / 透明性：${c.transparency} / 実績：${c.achievement || '不明'}`).join('\n')
  }

  const themeLine = () => {
    const t = themes.map(themeName)
    const a = addOpts
    return [...t, ...a].join('、') || '（未選択）'
  }

  const buildPrompt = () => {
    const e = election
    return `あなたは中立的な選挙比較アシスタントです。
私は候補者を選ぶために、政策・実績・財源・透明性を整理したいです。

# 選挙情報
選挙名：${e?.name ?? ''}
地域：${e?.region ?? ''}
投票日：${e?.date ?? ''}

# 私が重視するテーマ
${themeLine()}

# 比較してほしい観点
1. 候補者ごとの重点政策
2. 私の重視テーマとの近さ
3. 公約の具体性
4. 財源や実行手順の明確さ
5. 現職がいる場合は4年間の実績
6. 新人候補の場合は実行力・経験
7. 透明性・説明責任
8. 候補者に追加で確認すべき質問

# 候補者情報
${candidateInfo()}

# 出力してほしい形式
1. 候補者ごとの特徴
2. 候補者ごとの強み
3. 候補者ごとの確認したい点
4. 私の重視テーマとの関係
5. 公約の具体性・財源・実行可能性
6. 候補者に聞くべき質問
7. 最終判断のために確認すべき資料

# 注意
特定候補への投票を呼びかけないでください。
不明な情報は推測せず「不明」と書いてください。
候補者をランキング化せず、中立的に比較してください。
最終判断は、候補者の公式情報・選挙公報・選挙管理委員会等の情報も確認する前提で整理してください。`
  }

  const copy = async (key: string, text: string) => {
    setCopied(key)
    try { await navigator.clipboard.writeText(text) } catch {
      try { const ta = document.createElement('textarea'); ta.value = text; ta.style.position = 'fixed'; ta.style.opacity = '0'; document.body.appendChild(ta); ta.select(); document.execCommand('copy'); document.body.removeChild(ta) } catch { /* ignore */ }
    }
    setTimeout(() => setCopied((c) => (c === key ? null : c)), 2500)
  }

  const shareText = () => `候補者を選ぶ前に、自分の判断軸を整理してみました。\n私は「${themes.map(themeName).join('・') || '政策'}」を重視しています。\n候補者に聞きたい質問も公開質問ボードに投稿できます。\n#選挙AI相談室 #公開質問ボード`
  const share = (kind: string) => {
    const url = typeof window !== 'undefined' ? window.location.origin + '/prototype/questions' : 'https://seijiselect.jp/'
    const text = shareText()
    if (kind === 'copy') { copy('share', `${text}\n${url}`); return }
    const map: Record<string, string> = { x: `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`, line: `https://social-plugins.line.me/lineit/share?url=${encodeURIComponent(url)}`, fb: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}` }
    if (typeof window !== 'undefined') window.open(map[kind], '_blank', 'noopener,noreferrer')
  }

  const submitQuestion = () => {
    if (!posting || !election) return
    const list = loadJSON<PublicQuestion[]>(STORE_KEYS.publicQuestions, SEED_QUESTIONS)
    const q: PublicQuestion = {
      id: `q-${Date.now()}`, electionId: election.id, electionName: election.name,
      title: posting.title.trim() || posting.body.trim().slice(0, 30), body: posting.body.trim(),
      themeKey: posting.themeKey, nickname: nickname.trim() || '匿名', voteCount: 0, status: '運営確認中',
      createdAt: new Date().toISOString().slice(0, 10),
    }
    saveJSON(STORE_KEYS.publicQuestions, [q, ...list])
    setPosting(null); setNickname(''); setPostedMsg(true); setTimeout(() => setPostedMsg(false), 4000)
  }

  const chip = (active: boolean) => `rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${active ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`
  const card = 'rounded-2xl border border-gray-200 bg-white p-5'

  return (
    <div className='mx-auto w-full max-w-2xl px-4 py-8'>
      <div className='mb-5'>
        <div className='mb-2 inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-600'><span className='h-1.5 w-1.5 rounded-full bg-blue-500' />プロトタイプ / seijiselect.jp</div>
        <h1 className='text-2xl font-bold leading-snug text-gray-900'>誰に投票するかを決める前に、<br />自分の判断軸で候補者を整理しよう。</h1>
        <p className='mt-2 text-sm leading-relaxed text-gray-500'>子育て・防災・財政・行政改革・福祉など、あなたが重視するテーマに沿って候補者を比較するAIプロンプトを作成できます。候補者に聞きたい質問は公開質問ボードへ投稿できます。</p>
      </div>

      {postedMsg && <div className='mb-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800'>✓ 質問を投稿しました。<strong>運営確認後に公開</strong>されます。<Link href='/prototype/questions' className='ml-1 underline'>公開質問ボードを見る</Link></div>}

      {/* Step 1: 選挙を選ぶ */}
      <div className={`${card} mb-4`}>
        <p className='mb-2 text-xs font-bold text-blue-600'>STEP 1 ・ 選挙を選ぶ</p>
        <select value={electionId} onChange={(e) => setElectionId(e.target.value)} className='w-full rounded-lg border border-gray-300 px-3 py-2 text-sm'>
          {ONGOING_ELECTIONS.map((e) => <option key={e.id} value={e.id}>{e.name}</option>)}
        </select>
        {election && (
          <div className='mt-3 text-xs text-gray-500'>
            <p>{election.region} ・ 投票日 {election.date} ・ 候補者 {election.cands.length}名</p>
            <div className='mt-2 flex flex-wrap gap-2'>
              <a href='https://www.city.suginami.tokyo.jp/' target='_blank' rel='noopener noreferrer' className='rounded-lg border border-gray-300 px-3 py-1.5 font-medium text-gray-700 hover:bg-gray-50'>🔗 公式情報</a>
              <Link href='/prototype/questions' className='rounded-lg border border-blue-300 px-3 py-1.5 font-medium text-blue-700 hover:bg-blue-50'>💬 公開質問ボード</Link>
              <Link href={`/prototype/elections`} className='rounded-lg border border-gray-300 px-3 py-1.5 font-medium text-gray-700 hover:bg-gray-50'>候補者を比べる</Link>
            </div>
          </div>
        )}
        <p className='mt-2 text-[11px] text-gray-400'>※ 初期は運営が有効化した選挙のみ表示（プロトはサンプル）。</p>
      </div>

      {/* Step 2: 重視テーマ */}
      <div className={`${card} mb-4`}>
        <p className='mb-2 text-xs font-bold text-blue-600'>STEP 2 ・ 重視するテーマを選ぶ</p>
        <div className='flex flex-wrap gap-2'>{THEMES.map((t) => <button key={t.key} onClick={() => toggle(themes, setThemes, t.key)} className={chip(themes.includes(t.key))}>{t.name}</button>)}</div>
        <p className='mb-2 mt-3 text-[11px] font-medium text-gray-500'>追加で重視したい点（任意）</p>
        <div className='flex flex-wrap gap-2'>{ADD_OPTIONS.map((o) => <button key={o} onClick={() => toggle(addOpts, setAddOpts, o)} className={chip(addOpts.includes(o))}>{o}</button>)}</div>
      </div>

      {/* Step 3: 候補者情報 */}
      <div className={`${card} mb-4`}>
        <p className='mb-2 text-xs font-bold text-blue-600'>STEP 3 ・ 候補者情報</p>
        <div className='mb-3 flex flex-wrap gap-2'>
          <button onClick={() => setMode('registered')} className={chip(mode === 'registered')}>登録済み候補者を使う</button>
          <button onClick={() => setMode('paste')} className={chip(mode === 'paste')}>文章を貼り付ける</button>
          <button disabled className='cursor-not-allowed rounded-full bg-gray-50 px-3 py-1.5 text-xs font-medium text-gray-300'>写真・スクショ読み取り（第2段階）</button>
        </div>
        {mode === 'registered'
          ? <p className='rounded-lg bg-gray-50 p-3 text-xs text-gray-500'>この選挙の登録候補者（{election?.cands.length ?? 0}名）の公開情報を自動でプロンプトに反映します。</p>
          : <textarea value={pasted} onChange={(e) => setPasted(e.target.value)} placeholder='候補者の選挙公報・公式サイト・SNS投稿・公約文などを貼り付け…' className='h-28 w-full rounded-lg border border-gray-300 p-2 text-xs' />}
      </div>

      {/* Step 4: プロンプト生成 */}
      <div className={`${card} mb-4`}>
        <p className='mb-2 text-xs font-bold text-blue-600'>STEP 4 ・ AI比較プロンプトを作る</p>
        <button onClick={() => copy('prompt', buildPrompt())} className='w-full rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white hover:bg-blue-700'>{copied === 'prompt' ? '✓ コピーしました' : '🤖 AI比較プロンプトをコピー'}</button>
        <p className='mt-2 text-[11px] text-gray-400'>※ このページは生成AIを毎回呼びません。コピーしてご自身のChatGPT / Claude に貼り付けてください。</p>
        <textarea readOnly value={buildPrompt()} onFocus={(e) => e.currentTarget.select()} className='mt-2 h-40 w-full rounded-lg border border-gray-200 bg-gray-50 p-2 text-[11px] leading-relaxed text-gray-600' />
      </div>

      {/* Step 5: 質問案 → 公開質問ボードへ */}
      <div className={`${card} mb-4`}>
        <p className='mb-1 text-xs font-bold text-blue-600'>STEP 5 ・ 候補者に聞きたい質問を投稿する</p>
        {themes.length === 0 && <p className='text-xs text-gray-400'>STEP 2 で重視テーマを選ぶと、テーマ別の質問案が表示されます。</p>}
        {themes.map((tk) => (
          <div key={tk} className='mt-3'>
            <p className='mb-1 text-xs font-bold text-gray-700'>{themeName(tk)}</p>
            <div className='space-y-1.5'>
              {(QUESTION_BANK[tk] ?? []).map((q) => (
                <div key={q} className='flex items-start gap-2 rounded-lg border border-gray-100 bg-gray-50/70 p-2.5'>
                  <p className='min-w-0 flex-1 text-xs text-gray-700'>{q}</p>
                  <div className='flex shrink-0 gap-1'>
                    <button onClick={() => copy(`q-${q}`, q)} className='rounded border border-gray-300 px-2 py-1 text-[10px] text-gray-600 hover:bg-white'>{copied === `q-${q}` ? '✓' : 'コピー'}</button>
                    <button onClick={() => { setPosting({ themeKey: tk, title: q, body: q }); setPostedMsg(false) }} className='rounded bg-blue-600 px-2 py-1 text-[10px] font-semibold text-white hover:bg-blue-700'>編集して投稿</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* SNSシェア */}
      <div className={`${card} mb-4`}>
        <p className='mb-2 text-xs font-bold text-blue-600'>SNSでシェア</p>
        <p className='mb-2 whitespace-pre-wrap rounded-lg bg-gray-50 p-2 text-[11px] text-gray-600'>{shareText()}</p>
        <div className='flex flex-wrap gap-2'>
          <button onClick={() => share('x')} className='rounded-lg border border-gray-300 px-3 py-1.5 text-[11px] font-semibold text-gray-700 hover:bg-gray-50'>𝕏 / Twitter</button>
          <button onClick={() => share('line')} className='rounded-lg border border-gray-300 px-3 py-1.5 text-[11px] font-semibold text-emerald-700 hover:bg-emerald-50'>LINE</button>
          <button onClick={() => share('fb')} className='rounded-lg border border-gray-300 px-3 py-1.5 text-[11px] font-semibold text-blue-700 hover:bg-blue-50'>Facebook</button>
          <button onClick={() => share('copy')} className='rounded-lg border border-gray-300 px-3 py-1.5 text-[11px] font-semibold text-gray-700 hover:bg-gray-50'>{copied === 'share' ? '✓ コピー済' : 'コピー'}</button>
        </div>
      </div>

      {/* 投稿前確認モーダル */}
      {posting && (
        <div className='fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-4 sm:items-center'>
          <div className='max-h-[90vh] w-full max-w-md overflow-y-auto rounded-2xl bg-white p-5'>
            <h2 className='text-base font-bold text-gray-900'>公開質問ボードに投稿（確認）</h2>
            <p className='mt-1 text-xs text-gray-400'>{election?.name} ・ カテゴリ：{themeName(posting.themeKey)}</p>
            <label className='mt-3 block text-xs font-medium text-gray-600'>質問タイトル</label>
            <input value={posting.title} onChange={(e) => setPosting({ ...posting, title: e.target.value })} className='mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm' />
            <label className='mt-3 block text-xs font-medium text-gray-600'>質問本文</label>
            <textarea value={posting.body} onChange={(e) => setPosting({ ...posting, body: e.target.value })} className='mt-1 h-24 w-full rounded-lg border border-gray-300 p-2 text-sm' />
            <label className='mt-3 block text-xs font-medium text-gray-600'>ニックネーム（任意）</label>
            <input value={nickname} onChange={(e) => setNickname(e.target.value)} placeholder='匿名' className='mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm' />
            <p className='mt-3 rounded-lg bg-amber-50 p-3 text-[11px] leading-relaxed text-amber-800'>この質問は、候補者に政策や考え方を確認するためのものです。誹謗中傷、根拠のない断定、個人情報、特定候補への投票依頼・落選運動に見える内容は公開されない場合があります。<strong>運営確認後に公開</strong>されます。</p>
            <div className='mt-4 flex gap-2'>
              <button onClick={() => setPosting(null)} className='flex-1 rounded-xl border border-gray-300 px-4 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50'>キャンセル</button>
              <button onClick={submitQuestion} className='flex-1 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700'>投稿する</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
