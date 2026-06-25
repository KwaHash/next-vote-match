'use client'

/**
 * AI チャット画面
 *
 * ── コスト削減の仕組み ──
 *   FAQ セクション（上部）: 定型質問 → /api/chat が DB キャッシュを確認。
 *   キャッシュヒット時は AI 呼び出し0件。何万人が同じ質問をしても初回分のコストのみ。
 *
 *   自由入力チャット（下部）: 複数ターン対応。FA Q外の質問用。
 *
 * ── レイアウト ──
 *   [FAQ カテゴリ + 質問一覧 + 回答表示]
 *   ─── 仕切り ───
 *   [@assistant-ui/react の Thread（自由入力）]
 */

import { Thread } from '@/components/thread'
import { AI_FAQ_CATEGORIES, type FaqQuestion } from '@/constants/ai-faq'
import { VoteRuntimeProvider } from '@/providers/vote-runtime-provider'
import { useState } from 'react'

// ── FAQ セクション（@assistant-ui 非依存。直接 fetch） ──────

function FaqSection() {
  const [activeCatId, setActiveCatId] = useState(AI_FAQ_CATEGORIES[0].id)
  const [activeQuestion, setActiveQuestion] = useState<FaqQuestion | null>(null)
  const [answer, setAnswer] = useState<string>('')
  const [isLoading, setIsLoading] = useState(false)

  const activeCat = AI_FAQ_CATEGORIES.find((c) => c.id === activeCatId) ?? AI_FAQ_CATEGORIES[0]

  const fetchAnswer = async (q: FaqQuestion) => {
    if (activeQuestion?.id === q.id && answer) return  // 既に表示済み
    setActiveQuestion(q)
    setAnswer('')
    setIsLoading(true)

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [{ role: 'user', content: q.prompt }],
        }),
      })

      if (!res.ok) throw new Error('API error')

      const reader = res.body?.getReader()
      if (!reader) throw new Error('No body')

      const decoder = new TextDecoder()
      let buf = ''
      let fullText = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        buf += decoder.decode(value, { stream: true })
        const lines = buf.split('\n')
        buf = lines.pop() ?? ''
        for (const line of lines) {
          const t = line.trim()
          if (!t) continue
          try {
            const payload = JSON.parse(t) as { content?: Array<{ type: string; text: string }> }
            const text = payload.content?.find((c) => c.type === 'text')?.text ?? ''
            if (text) { fullText = text; setAnswer(text) }
          } catch {}
        }
      }
      if (buf.trim()) {
        try {
          const payload = JSON.parse(buf.trim()) as { content?: Array<{ type: string; text: string }> }
          const text = payload.content?.find((c) => c.type === 'text')?.text ?? ''
          if (text) setAnswer(text)
        } catch {}
      }
    } catch {
      setAnswer('回答の取得に失敗しました。しばらく経ってからお試しください。')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <section className='w-full border-b border-border'>
      {/* ヘッダー */}
      <div className='px-4 md:px-6 pt-4 pb-2 flex items-center justify-between'>
        <div>
          <h2 className='text-sm font-bold text-foreground'>よくある質問</h2>
          <p className='text-[11px] text-muted-foreground'>
            ✨ 同じ質問は即返答（AIコスト削減キャッシュ）
          </p>
        </div>
      </div>

      {/* カテゴリタブ */}
      <div className='flex gap-1 px-4 md:px-6 overflow-x-auto pb-1'>
        {AI_FAQ_CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setActiveCatId(cat.id)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
              activeCatId === cat.id
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:bg-muted hover:text-foreground border border-border'
            }`}
          >
            <span>{cat.emoji}</span>
            <span>{cat.name}</span>
          </button>
        ))}
      </div>

      {/* 質問 + 回答エリア */}
      <div className='flex flex-col md:flex-row gap-0 md:gap-4 px-4 md:px-6 py-3'>
        {/* 質問リスト */}
        <div className='flex flex-row flex-wrap md:flex-col gap-1.5 md:w-56 shrink-0'>
          {activeCat.questions.map((q) => (
            <button
              key={q.id}
              onClick={() => fetchAnswer(q)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs text-left transition-colors border ${
                activeQuestion?.id === q.id
                  ? 'bg-primary/10 border-primary/30 text-foreground font-semibold'
                  : 'border-border text-muted-foreground hover:border-primary/30 hover:bg-muted'
              }`}
            >
              <span className='text-primary shrink-0'>›</span>
              <span>{q.label}</span>
            </button>
          ))}
        </div>

        {/* 回答表示 */}
        <div className='flex-1 min-h-[80px] rounded-lg border border-border bg-muted/30 p-3 text-sm'>
          {isLoading ? (
            <div className='flex items-center gap-2 text-muted-foreground'>
              <span className='inline-block w-3 h-3 border-2 border-primary/30 border-t-primary rounded-full animate-spin' />
              <span className='text-xs'>回答を取得中...</span>
            </div>
          ) : answer ? (
            <div className='space-y-1'>
              <p className='text-[11px] font-semibold text-muted-foreground mb-1'>
                Q. {activeQuestion?.label}
              </p>
              <p className='leading-relaxed whitespace-pre-wrap text-foreground'>{answer}</p>
            </div>
          ) : (
            <p className='text-muted-foreground text-xs'>← 質問をクリックすると回答が表示されます</p>
          )}
        </div>
      </div>
    </section>
  )
}

// ── メインコンポーネント ─────────────────────────────────

const AIChatPage = () => {
  return (
    <VoteRuntimeProvider>
      <div className='relative flex flex-col w-full h-[calc(100dvh_-_88px)] overflow-hidden'>
        {/* グリッド背景 */}
        <div
          className='absolute inset-0 opacity-[0.04] pointer-events-none'
          style={{
            backgroundImage:
              'linear-gradient(to right, #1f2937 1px, transparent 1px), linear-gradient(to bottom, #1f2937 1px, transparent 1px)',
            backgroundSize: '35px 35px',
          }}
        />

        {/* FAQ セクション（上部） */}
        <FaqSection />

        {/* 仕切り */}
        <div className='px-4 md:px-6 py-1.5 shrink-0'>
          <p className='text-[11px] text-muted-foreground font-medium'>
            💬 上記以外の質問・詳細はこちらへ
          </p>
        </div>

        {/* 自由入力チャット（下部・残りの高さを使う） */}
        <div className='flex-1 overflow-hidden'>
          <Thread />
        </div>
      </div>
    </VoteRuntimeProvider>
  )
}

export default AIChatPage
