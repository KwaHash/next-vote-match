'use client'

import { AI_FAQ_CATEGORIES } from '@/constants/ai-faq'
import {
  AssistantRuntimeProvider,
  Suggestions,
  useAui,
  useLocalRuntime,
  type ChatModelAdapter,
  type ChatModelRunResult,
} from '@assistant-ui/react'
import type { ReactNode } from 'react'

function toApiMessage(message: { role: string; content: unknown }) {
  const content = message.content
  return {
    role: message.role,
    content:
      typeof content === 'string'
        ? content
        : Array.isArray(content)
        ? content.map((part: { text?: string }) => part.text ?? '').join('\n')
        : '',
  }
}

const VoteRuntimeModelAdapter: ChatModelAdapter = {
  async *run({ messages, abortSignal }) {
    const res = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages: messages.map(toApiMessage) }),
      signal: abortSignal,
    })

    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      throw new Error(err.error ?? `チャットリクエストに失敗しました (${res.status})`)
    }

    const reader = res.body?.getReader()
    if (!reader) throw new Error('No response body')

    const decoder = new TextDecoder()
    let buffer = ''

    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      buffer += decoder.decode(value, { stream: true })
      const lines = buffer.split('\n')
      buffer = lines.pop() ?? ''
      for (const line of lines) {
        const trimmed = line.trim()
        if (!trimmed) continue
        try {
          const payload = JSON.parse(trimmed) as { content: ChatModelRunResult['content'] }
          if (payload.content) yield { content: payload.content } as ChatModelRunResult
        } catch {
          // malformed line を無視
        }
      }
    }
    if (buffer.trim()) {
      try {
        const payload = JSON.parse(buffer.trim()) as { content: ChatModelRunResult['content'] }
        if (payload.content) yield { content: payload.content } as ChatModelRunResult
      } catch {}
    }
  },
}

/**
 * サジェスト一覧を AI_FAQ_CATEGORIES から生成。
 * 各カテゴリの最初の質問のみ表示（表示枠が狭いため）。
 * 詳細なFAQ一覧は /ai-chat ページの FaqPanel コンポーネントで表示。
 */
const QUICK_SUGGESTIONS = AI_FAQ_CATEGORIES.flatMap((cat) =>
  cat.questions.slice(0, 2).map((q) => ({
    title: cat.name,
    label: `${cat.emoji} ${q.label}`,
    prompt: q.prompt,
  }))
)

export function VoteRuntimeProvider({ children }: Readonly<{ children: ReactNode }>) {
  const runtime = useLocalRuntime(VoteRuntimeModelAdapter)

  const aui = useAui({
    suggestions: Suggestions(QUICK_SUGGESTIONS),
  })

  return (
    <AssistantRuntimeProvider aui={aui} runtime={runtime}>
      {children}
    </AssistantRuntimeProvider>
  )
}
