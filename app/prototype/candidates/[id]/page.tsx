'use client'

/**
 * 【プロトタイプ】候補者詳細ページ
 * ルート: /prototype/candidates/[id]
 *
 * タブ構成:
 *   プロフィール: bio・経歴・注力テーマ・公約
 *   政策スタンス: 10設問への候補者回答
 *   SNS分析: 各プラットフォームのフォロワー・頻度・エンゲージメント・クロス比較・最近の投稿
 */

import { ELECTION_TYPES, POLICY_THEMES, SAMPLE_CANDIDATES } from '../../_data'
import { loadJSON } from '../../_store'
import { FREQ_COLOR, FREQ_LABEL, getSnsData, type PlatformData } from '../_sns_data'
import { questions } from '@/constants/match'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { useEffect, useMemo, useState } from 'react'

// ── ヘルパー ─────────────────────────────────────────────────

const MATCH_RESULT_KEY = 'proto_citizen_match_v1'
const themeById = (id: string) => POLICY_THEMES.find((t) => t.id === id)
const typeLabel = (v: string) => ELECTION_TYPES.find((e) => e.value === v)?.label ?? v

function fmtFollowers(n: number | null): string {
  if (n === null) return '非公開'
  if (n >= 10000) return `${(n / 10000).toFixed(1)}万`
  if (n >= 1000) return `${(n / 1000).toFixed(1)}千`
  return String(n)
}

function scoreColor(t: number): string {
  if (t >= 80) return 'text-emerald-600'
  if (t >= 60) return 'text-amber-600'
  return 'text-rose-500'
}

const PLATFORM_BG: Record<string, string> = {
  X: 'bg-gray-900 text-white',
  YouTube: 'bg-red-600 text-white',
  Facebook: 'bg-blue-600 text-white',
  Instagram: 'bg-pink-500 text-white',
  TikTok: 'bg-black text-white',
  LINE: 'bg-green-500 text-white',
}

// ── SNSプラットフォームカード ─────────────────────────────────

function PlatformCard({ p }: { p: PlatformData }) {
  const inactive = p.frequency === 'none'
  return (
    <div className={`rounded-xl border p-4 transition-shadow ${inactive ? 'border-gray-100 bg-gray-50 opacity-60' : 'border-gray-200 bg-white hover:shadow-md'}`}>
      <div className='flex items-center gap-3 mb-3'>
        <div className={`flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold shrink-0 ${PLATFORM_BG[p.name] ?? 'bg-gray-200 text-gray-600'}`}>
          {p.icon}
        </div>
        <div className='min-w-0 flex-1'>
          <div className='text-sm font-bold text-gray-900'>{p.name}</div>
          {p.handle && <div className='text-[11px] text-gray-400 truncate'>{p.handle}</div>}
        </div>
        <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium ${FREQ_COLOR[p.frequency]}`}>
          {p.frequency === 'none' ? '未登録' : p.frequency === 'high' ? '高頻度' : p.frequency === 'medium' ? '中頻度' : '低頻度'}
        </span>
      </div>

      {inactive ? (
        <p className='text-xs text-gray-400'>このプラットフォームには登録していません</p>
      ) : (
        <>
          <div className='grid grid-cols-2 gap-2 mb-3'>
            <div className='rounded-lg bg-gray-50 p-2 text-center'>
              <div className='text-base font-bold text-gray-900'>{fmtFollowers(p.followers)}</div>
              <div className='text-[10px] text-gray-400'>フォロワー</div>
            </div>
            <div className='rounded-lg bg-gray-50 p-2 text-center'>
              <div className='text-base font-bold text-gray-900'>
                {p.engagementRate !== null ? `${p.engagementRate}%` : '—'}
              </div>
              <div className='text-[10px] text-gray-400'>エンゲージ率</div>
            </div>
          </div>
          {p.topTopics.length > 0 && (
            <div className='flex flex-wrap gap-1'>
              {p.topTopics.map((t) => (
                <span key={t} className='rounded-full bg-blue-50 px-2 py-0.5 text-[10px] text-blue-600'>#{t}</span>
              ))}
            </div>
          )}
          {p.postsPerWeek !== null && (
            <div className='mt-2 text-[11px] text-gray-400'>
              {FREQ_LABEL[p.frequency]} · 週{p.postsPerWeek}回ペース
            </div>
          )}
        </>
      )}
    </div>
  )
}

// ── メインコンポーネント ─────────────────────────────────────

type Tab = 'profile' | 'stance' | 'sns'

export default function CandidateDetailPage() {
  const params = useParams()
  const id = Number(params?.id ?? 0)
  const [tab, setTab] = useState<Tab>('profile')
  const [weights, setWeights] = useState<Record<string, number> | null>(null)

  useEffect(() => {
    const d = loadJSON<{ weights?: Record<string, number> } | null>(MATCH_RESULT_KEY, null)
    if (d) setWeights(d.weights ?? null)
  }, [])

  const candidate = useMemo(
    () => SAMPLE_CANDIDATES.find((c) => c.id === id) ?? null,
    [id]
  )
  const sns = useMemo(() => (candidate ? getSnsData(candidate.id) : null), [candidate])

  if (!candidate) {
    return (
      <div className='flex flex-col items-center justify-center min-h-[40vh] gap-4 px-4'>
        <p className='text-gray-500'>候補者が見つかりませんでした</p>
        <Link href='/prototype/candidates' className='rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700'>
          ← 候補者一覧に戻る
        </Link>
      </div>
    )
  }

  const matchPct = (() => {
    if (!weights) return null
    const max = 3 * candidate.themes.length
    if (!max) return null
    const score = candidate.themes.reduce((s, t) => s + (weights[t] ?? 0), 0)
    return Math.round((score / max) * 100)
  })()

  const activePlatforms = sns?.platforms.filter((p) => p.frequency !== 'none') ?? []
  const inactivePlatforms = sns?.platforms.filter((p) => p.frequency === 'none') ?? []
  const totalFollowers = activePlatforms.reduce((s, p) => s + (p.followers ?? 0), 0)
  const validEngagements = activePlatforms.filter((p) => p.engagementRate !== null)
  const avgEngagement = validEngagements.length > 0
    ? validEngagements.reduce((s, p) => s + (p.engagementRate ?? 0), 0) / validEngagements.length
    : null

  const tabCls = (t: Tab) =>
    `flex-1 py-2.5 text-sm font-medium border-b-2 transition-colors ${
      tab === t
        ? 'border-blue-600 text-blue-600'
        : 'border-transparent text-gray-500 hover:text-gray-800'
    }`

  const firstThemeEmoji = themeById(candidate.themes[0])?.emoji ?? '👤'

  return (
    <div className='mx-auto w-full max-w-3xl px-4 py-6 pb-16'>
      {/* 戻るリンク */}
      <Link href='/prototype/candidates' className='mb-4 inline-flex items-center gap-1 text-sm text-gray-400 hover:text-gray-600'>
        ← 候補者一覧
      </Link>

      {/* ── ヘッダーカード ── */}
      <div className='mb-5 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm'>
        <div className='flex items-start gap-4'>
          <div className='flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-3xl'>
            {firstThemeEmoji}
          </div>
          <div className='flex-1 min-w-0'>
            <div className='flex flex-wrap items-center gap-2 mb-1'>
              <h1 className='text-xl font-bold text-gray-900'>{candidate.name}</h1>
              <span className='rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-600'>
                {candidate.party}
              </span>
              <span className='rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-medium text-blue-700'>
                {typeLabel(candidate.electionType)}
              </span>
              <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                candidate.status === '現職' ? 'bg-emerald-50 text-emerald-700' :
                candidate.status === '新人' ? 'bg-amber-50 text-amber-700' :
                'bg-gray-100 text-gray-600'
              }`}>{candidate.status}</span>
            </div>
            <p className='text-sm text-gray-500 mb-2'>
              📍 {candidate.region}{candidate.district !== candidate.region ? ` · ${candidate.district}` : ''}
            </p>
            <div className='flex flex-wrap gap-1'>
              {candidate.themes.map((t) => {
                const th = themeById(t)
                return th ? (
                  <span key={t} className='rounded-full bg-indigo-50 px-2 py-0.5 text-[11px] font-medium text-indigo-700'>
                    {th.emoji} {th.name}
                  </span>
                ) : null
              })}
            </div>
          </div>
          {/* 透明化スコア + 一致率 */}
          <div className='shrink-0 flex flex-col items-center gap-2'>
            <div className='text-center'>
              <div className={`text-2xl font-bold ${scoreColor(candidate.transparency)}`}>{candidate.transparency}</div>
              <div className='text-[10px] text-gray-400'>透明化</div>
              <div className='mt-1 h-1.5 w-14 overflow-hidden rounded-full bg-gray-100'>
                <div className={`h-full rounded-full ${
                  candidate.transparency >= 80 ? 'bg-emerald-400' :
                  candidate.transparency >= 60 ? 'bg-amber-400' : 'bg-rose-400'
                }`} style={{ width: `${candidate.transparency}%` }} />
              </div>
            </div>
            {matchPct !== null && (
              <div className='text-center'>
                <div className='text-xl font-bold text-blue-600'>{matchPct}%</div>
                <div className='text-[10px] text-gray-400'>一致率</div>
              </div>
            )}
          </div>
        </div>

        {matchPct === null && (
          <div className='mt-3 rounded-lg bg-blue-50 p-2.5 text-xs text-blue-700'>
            <Link href='/prototype/match' className='font-semibold underline'>政策マッチング診断</Link>
            を受けると、この候補者との一致率が分かります。
          </div>
        )}
        <div className='mt-3 text-right'>
          <span className={`text-[11px] rounded-full px-2 py-0.5 ${candidate.source === 'self' ? 'bg-blue-50 text-blue-600' : 'bg-gray-100 text-gray-500'}`}>
            {candidate.source === 'self' ? '本人入力済み' : '公式データ取込'}
          </span>
        </div>
      </div>

      {/* ── タブバー ── */}
      <div className='flex border-b border-gray-200 mb-5'>
        <button className={tabCls('profile')} onClick={() => setTab('profile')}>プロフィール</button>
        <button className={tabCls('stance')} onClick={() => setTab('stance')}>政策スタンス</button>
        <button className={tabCls('sns')} onClick={() => setTab('sns')}>SNS分析</button>
      </div>

      {/* ══════════════════════════════════════════
          プロフィールタブ
      ══════════════════════════════════════════ */}
      {tab === 'profile' && (
        <div className='space-y-4'>
          {sns ? (
            <>
              <div className='rounded-xl border border-gray-200 bg-white p-5'>
                <h2 className='mb-3 text-sm font-bold text-gray-700'>プロフィール</h2>
                <p className='text-sm text-gray-600 leading-relaxed'>{sns.bio}</p>
              </div>
              <div className='rounded-xl border border-gray-200 bg-white p-5'>
                <h2 className='mb-3 text-sm font-bold text-gray-700'>経歴</h2>
                <ol className='space-y-2'>
                  {sns.career.map((c, i) => (
                    <li key={i} className='flex items-start gap-3 text-sm text-gray-600'>
                      <span className='flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-blue-100 text-[10px] font-bold text-blue-700'>{i + 1}</span>
                      {c}
                    </li>
                  ))}
                </ol>
              </div>
            </>
          ) : null}

          <div className='rounded-xl border border-gray-200 bg-white p-5'>
            <h2 className='mb-3 text-sm font-bold text-gray-700'>注力政策テーマ・公約</h2>
            <div className='grid grid-cols-1 sm:grid-cols-2 gap-3'>
              {candidate.themes.map((t) => {
                const th = themeById(t)
                if (!th) return null
                return (
                  <div key={t} className='rounded-lg border border-gray-100 p-3'>
                    <div className='flex items-center gap-2 mb-1'>
                      <span className='text-xl'>{th.emoji}</span>
                      <span className='font-semibold text-sm text-gray-900'>{th.name}</span>
                    </div>
                    <p className='text-xs text-gray-500 mb-1'>{th.challenge}</p>
                    <p className='text-xs font-medium text-blue-700'>→ {th.solution}</p>
                  </div>
                )
              })}
            </div>
          </div>

          <div className='flex gap-3'>
            <Link href='/prototype/compare' className='flex-1 rounded-xl border border-gray-300 px-4 py-3 text-center text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50'>
              他の候補者と比較
            </Link>
            <Link href='/prototype/policies' className='flex-1 rounded-xl bg-blue-600 px-4 py-3 text-center text-sm font-semibold text-white transition-colors hover:bg-blue-700'>
              政策を見て寄付
            </Link>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════
          政策スタンスタブ
      ══════════════════════════════════════════ */}
      {tab === 'stance' && (
        <div className='space-y-3'>
          {sns ? (
            <>
              <div className='rounded-lg bg-amber-50 border border-amber-100 px-4 py-2 text-xs text-amber-700'>
                ※ 候補者が回答した10項目の政策スタンスです。青ハイライトが候補者の選択。
              </div>
              {questions.map((q) => {
                const stanceIdx = sns.stances[q.id]
                const answered = stanceIdx !== undefined && stanceIdx !== -1
                return (
                  <div key={q.id} className='rounded-xl border border-gray-200 bg-white p-4'>
                    <div className='flex items-center gap-2 mb-2'>
                      <span className='rounded-full bg-indigo-50 px-2 py-0.5 text-[10px] font-medium text-indigo-600'>
                        Q{q.id} {q.category}
                      </span>
                      {!answered && (
                        <span className='rounded-full bg-gray-100 px-2 py-0.5 text-[10px] text-gray-400'>未回答</span>
                      )}
                    </div>
                    <p className='text-sm text-gray-700 mb-3 leading-relaxed'>{q.question}</p>
                    <div className='grid grid-cols-1 gap-2'>
                      {q.options.map((opt, idx) => {
                        const isChosen = answered && stanceIdx === idx
                        return (
                          <div
                            key={idx}
                            className={`rounded-lg px-3 py-2 text-sm leading-relaxed ${
                              isChosen
                                ? 'bg-blue-600 text-white font-medium'
                                : 'bg-gray-50 text-gray-500'
                            }`}
                          >
                            {isChosen && <span className='mr-1.5'>✓</span>}
                            {opt.label}
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )
              })}
            </>
          ) : (
            <div className='rounded-xl border border-gray-100 bg-gray-50 p-8 text-center text-sm text-gray-400'>
              政策スタンスデータがありません
            </div>
          )}
        </div>
      )}

      {/* ══════════════════════════════════════════
          SNS分析タブ
      ══════════════════════════════════════════ */}
      {tab === 'sns' && (
        <div className='space-y-5'>
          {sns ? (
            <>
              {/* サマリー数字 */}
              <div className='grid grid-cols-3 gap-3'>
                <div className='rounded-xl border border-gray-200 bg-white p-3 text-center'>
                  <div className='text-xl font-bold text-gray-900'>{activePlatforms.length}</div>
                  <div className='text-[10px] text-gray-400'>利用SNS数</div>
                </div>
                <div className='rounded-xl border border-gray-200 bg-white p-3 text-center'>
                  <div className='text-xl font-bold text-gray-900'>{fmtFollowers(totalFollowers)}</div>
                  <div className='text-[10px] text-gray-400'>総フォロワー</div>
                </div>
                <div className='rounded-xl border border-gray-200 bg-white p-3 text-center'>
                  <div className='text-xl font-bold text-gray-900'>
                    {avgEngagement !== null ? `${avgEngagement.toFixed(1)}%` : '—'}
                  </div>
                  <div className='text-[10px] text-gray-400'>平均エンゲージ</div>
                </div>
              </div>

              {/* SNS戦略まとめ */}
              <div className='rounded-xl border border-blue-100 bg-blue-50 p-4'>
                <h3 className='text-xs font-bold text-blue-700 mb-1'>このSNS戦略の特徴</h3>
                <p className='text-sm text-blue-900 leading-relaxed'>{sns.snsStrategy}</p>
              </div>

              {/* プラットフォーム別カード */}
              <div>
                <h3 className='mb-3 text-xs font-bold uppercase tracking-wider text-gray-400'>プラットフォーム別</h3>
                <div className='grid grid-cols-1 sm:grid-cols-2 gap-3'>
                  {activePlatforms.map((p) => <PlatformCard key={p.name} p={p} />)}
                  {inactivePlatforms.map((p) => <PlatformCard key={p.name} p={p} />)}
                </div>
              </div>

              {/* フォロワー比較バー */}
              {activePlatforms.filter((p) => p.followers !== null).length > 1 && (
                <div className='rounded-xl border border-gray-200 bg-white p-4'>
                  <h3 className='mb-3 text-xs font-bold uppercase tracking-wider text-gray-400'>フォロワー数比較</h3>
                  <div className='space-y-3'>
                    {[...activePlatforms]
                      .filter((p) => p.followers !== null)
                      .sort((a, b) => (b.followers ?? 0) - (a.followers ?? 0))
                      .map((p) => {
                        const maxF = Math.max(...activePlatforms.filter((x) => x.followers !== null).map((x) => x.followers ?? 0))
                        const pct = maxF > 0 ? ((p.followers ?? 0) / maxF) * 100 : 0
                        return (
                          <div key={p.name} className='flex items-center gap-3'>
                            <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[11px] font-bold ${PLATFORM_BG[p.name] ?? 'bg-gray-200 text-gray-600'}`}>
                              {p.icon}
                            </div>
                            <div className='flex-1'>
                              <div className='flex items-center justify-between mb-0.5'>
                                <span className='text-xs text-gray-600'>{p.name}</span>
                                <span className='text-xs font-semibold text-gray-700'>{fmtFollowers(p.followers)}</span>
                              </div>
                              <div className='h-2 w-full rounded-full bg-gray-100'>
                                <div
                                  className='h-full rounded-full bg-blue-400 transition-all duration-500'
                                  style={{ width: `${pct}%` }}
                                />
                              </div>
                            </div>
                          </div>
                        )
                      })}
                  </div>
                </div>
              )}

              {/* 最近の投稿サンプル */}
              {sns.recentPosts.length > 0 && (
                <div>
                  <h3 className='mb-3 text-xs font-bold uppercase tracking-wider text-gray-400'>最近の投稿サンプル</h3>
                  <div className='space-y-3'>
                    {sns.recentPosts.map((post, i) => (
                      <div key={i} className='rounded-xl border border-gray-200 bg-white p-4'>
                        <div className='flex items-center gap-2 mb-2'>
                          <div className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[10px] font-bold ${PLATFORM_BG[post.platform] ?? 'bg-gray-200 text-gray-600'}`}>
                            {post.platform === 'X' ? '𝕏' : post.platform === 'YouTube' ? '▶' : post.platform === 'Facebook' ? 'f' : '◉'}
                          </div>
                          <span className='text-xs font-medium text-gray-700'>{post.platform}</span>
                          <span className='ml-auto text-[10px] text-gray-400'>{post.date}</span>
                        </div>
                        <p className='text-sm text-gray-700 leading-relaxed mb-2 whitespace-pre-line'>{post.content}</p>
                        <div className='flex items-center gap-4 text-[11px] text-gray-400'>
                          <span>♥ {post.likes.toLocaleString()}</span>
                          {post.reposts !== undefined && <span>↺ {post.reposts.toLocaleString()}</span>}
                          {post.views !== undefined && <span>👁 {post.views.toLocaleString()}</span>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className='rounded-xl border border-gray-100 bg-gray-50 p-8 text-center text-sm text-gray-400'>
              SNSデータがありません
            </div>
          )}
        </div>
      )}

      <p className='mt-8 text-center text-xs text-gray-400'>※ サンプルデータ（架空の氏名・モックSNSデータ）。本番は候補者本人が登録した実データを表示します。</p>
    </div>
  )
}
