import { withDatabase } from '@/lib/db'
import { createHash } from 'crypto'
import { NextResponse } from 'next/server'
import OpenAI from 'openai'

/**
 * AI チャット API
 *
 * コスト削減策:
 *   1. 最初のメッセージ（単発質問）は DB キャッシュを確認 → キャッシュヒット時は AI 呼び出しゼロ
 *   2. システムプロンプトで回答を300字以内に制限（トークン削減）
 *   3. 複数ターンの会話は AI を呼ぶが、それ以外はほぼキャッシュで賄われる想定
 */

const SYSTEM_PROMPT = `あなたは日本の政治・選挙について分かりやすく解説するAIアシスタントです。以下を守ってください。
- 政治的に完全中立な立場で回答する（特定の政党・政治家を推薦・批判しない）
- 具体的で分かりやすい日本語で答える
- 事実に基づいた情報のみ提供し、不確かな内容は「確認が必要です」と答える
- 回答は原則300字以内（詳細な質問は例外）
- 話題が政治・選挙と無関係な場合は「政治・選挙に関する質問にお答えしています」と伝える`

// ==================== キャッシュ操作 ====================

async function getCachedResponse(hash: string): Promise<string | null> {
  try {
    return await withDatabase(async (db) => {
      const [rows] = await db.query(
        'SELECT response_text FROM ai_response_cache WHERE question_hash = ? LIMIT 1',
        [hash]
      ) as [Array<{ response_text: string }>, unknown]

      if (rows.length > 0) {
        // ヒット数をカウント（非同期・失敗しても問題なし）
        db.query(
          'UPDATE ai_response_cache SET hit_count = hit_count + 1 WHERE question_hash = ?',
          [hash]
        ).catch(() => {})
        return rows[0].response_text
      }
      return null
    })
  } catch {
    // DB に接続できなくてもアプリは止まらない
    return null
  }
}

async function setCachedResponse(hash: string, questionText: string, responseText: string): Promise<void> {
  try {
    await withDatabase(async (db) => {
      await db.query(
        `INSERT INTO ai_response_cache (question_hash, question_text, response_text)
         VALUES (?, ?, ?)
         ON DUPLICATE KEY UPDATE
           response_text = VALUES(response_text),
           hit_count = hit_count + 1,
           updated_at = CURRENT_TIMESTAMP`,
        [hash, questionText.slice(0, 500), responseText]
      )
    })
  } catch {
    // キャッシュ保存失敗は無視（次回以降はキャッシュなしで AI 呼び出し）
  }
}

// ==================== ストリーミングヘルパー ====================

/** テキストを NDJSON ストリームとして返す（キャッシュ返却 / エラー時に使用） */
function textToStream(text: string): Response {
  const encoder = new TextEncoder()
  const readable = new ReadableStream({
    start(controller) {
      const payload = { content: [{ type: 'text' as const, text }] }
      controller.enqueue(encoder.encode(JSON.stringify(payload) + '\n'))
      controller.close()
    },
  })
  return new Response(readable, {
    headers: { 'Content-Type': 'application/x-ndjson', 'Cache-Control': 'no-cache' },
  })
}

// ==================== メインハンドラー ====================

export async function POST(request: Request) {
  try {
    const body = await request.json() as { messages: Array<{ role: string; content: string }> }
    const { messages } = body

    if (!messages?.length) {
      return NextResponse.json({ error: 'messages is required' }, { status: 400 })
    }

    // system プロンプトを先頭に挿入
    const messagesWithSystem: OpenAI.ChatCompletionMessageParam[] = [
      { role: 'system', content: SYSTEM_PROMPT },
      ...messages
        .filter(m => m.role === 'user' || m.role === 'assistant' || m.role === 'system')
        .map(m => ({
          role: m.role as 'user' | 'assistant' | 'system',
          content: m.content,
        })),
    ]

    // ── キャッシュチェック（単発質問のみ対象）──
    // ユーザーが最初に送ったメッセージだけ（会話が1往復以内）はキャッシュ可能。
    // 複数ターンの会話はコンテキスト依存なのでキャッシュしない。
    const userMessages = messages.filter(m => m.role === 'user')
    const isSingleQuestion = userMessages.length === 1

    let questionHash = ''
    if (isSingleQuestion) {
      const normalized = userMessages[0].content.toLowerCase().trim().replace(/\s+/g, ' ')
      questionHash = createHash('sha256').update(normalized).digest('hex').slice(0, 32)

      const cached = await getCachedResponse(questionHash)
      if (cached) {
        return textToStream(cached)
      }
    }

    // ── AI 呼び出し（ストリーミング） ──
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

    if (isSingleQuestion) {
      // 単発質問: 全文を受け取ってからキャッシュ → ストリームで返す
      const completion = await openai.chat.completions.create({
        model: 'gpt-4o',
        messages: messagesWithSystem,
        stream: false,
        max_tokens: 600, // 約300字相当。コスト上限
      })

      const responseText = completion.choices[0]?.message?.content ?? ''

      // キャッシュ保存（次回以降は AI 不要）
      if (questionHash && responseText) {
        await setCachedResponse(questionHash, userMessages[0].content, responseText)
      }

      return textToStream(responseText)
    }

    // 複数ターンの会話: ストリーミング
    const stream = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: messagesWithSystem,
      stream: true,
      max_tokens: 800,
    })

    const encoder = new TextEncoder()
    let content = ''

    const readable = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of stream) {
            const delta = chunk.choices[0]?.delta
            if (delta?.content) {
              content += delta.content
            }
            const payload = { content: content ? [{ type: 'text' as const, text: content }] : [] }
            if (payload.content.length) {
              controller.enqueue(encoder.encode(JSON.stringify(payload) + '\n'))
            }
          }
        } catch (err) {
          console.error('Chat stream error:', err instanceof Error ? err.message : 'unknown')
        } finally {
          controller.close()
        }
      },
    })

    return new Response(readable, {
      headers: { 'Content-Type': 'application/x-ndjson', 'Cache-Control': 'no-cache' },
    })
  } catch (err) {
    console.error('Chat API error:', err instanceof Error ? err.message : 'unknown')
    return NextResponse.json(
      { error: 'チャットリクエストに失敗しました。しばらく経ってからお試しください。' },
      { status: 500 }
    )
  }
}
