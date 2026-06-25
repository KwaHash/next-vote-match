import { withDatabase } from '@/lib/db'
import { questions } from '@/constants/match'
import { NextResponse } from 'next/server'

/**
 * 候補者一覧 API
 *
 * クエリパラメータ:
 *   district  - 選挙区（例: "東京10区"）。candidates.district に対して部分一致で絞り込む
 *   party     - 政党名。"全て政党" の場合はフィルタなし
 *   answers   - ユーザーの回答 JSON（例: {"1":"オプションA","2":"オプションB"}）
 *               key = currentStep（1〜9）, value = 選んだ選択肢テキスト
 *
 * レスポンス:
 *   politicians: IPolitician[] （matchScore 付き、スコア降順）
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const district = searchParams.get('district') ?? ''
    const party    = searchParams.get('party')    ?? ''
    const answersRaw = searchParams.get('answers') ?? '{}'

    let userAnswers: Record<string, string> = {}
    try { userAnswers = JSON.parse(answersRaw) } catch { userAnswers = {} }

    const allPoliticians = await withDatabase(async (db) => {
      const [rows] = await db.query('SELECT * FROM representatives2026')
      return rows as Array<Record<string, unknown>>
    })

    // ── 選挙区フィルタ ──
    // DB の district フィールドは "東京10区" のような文字列。
    // 検索文字列（例 "東京10区"）が district に含まれるか、または逆を確認。
    let filtered = district
      ? allPoliticians.filter((p) => {
          const d = String(p.district ?? '')
          return d.includes(district) || district.includes(d)
        })
      : allPoliticians

    // ── 政党フィルタ ──
    if (party && party !== '全て政党') {
      filtered = filtered.filter((p) => p.party === party)
    }

    // ── マッチスコア計算 ──
    // questions 配列は 0-indexed（questions[0].id = 1, questions[1].id = 2 ...）
    // match.tsx では step=0 が地域選択なので実質 questions[step]（step=1〜9）を表示。
    // userAnswers の key は currentStep（1〜9）。
    const hasAnswers = Object.keys(userAnswers).length > 0

    const withScores = filtered.map((p) => {
      if (!hasAnswers) return { ...p, matchScore: null, matchCount: 0, totalCount: 0 }

      let politicianAnswers: Record<string, string> = {}
      try {
        const raw = p.questions_answers
        politicianAnswers =
          typeof raw === 'string'
            ? JSON.parse(raw)
            : (raw as Record<string, string>) ?? {}
      } catch {
        politicianAnswers = {}
      }

      let matchCount = 0
      let totalCount = 0

      Object.entries(userAnswers).forEach(([stepKey, userAnswer]) => {
        const step = parseInt(stepKey)
        const question = questions[step]        // questions[step] = step 番目の質問
        if (!question) return
        const qid = String(question.id)         // question.id (1〜10)
        const polAnswer = politicianAnswers[qid]
        if (polAnswer !== undefined) {
          totalCount++
          if (userAnswer === polAnswer) matchCount++
        }
      })

      const matchScore = totalCount > 0 ? Math.round((matchCount / totalCount) * 100) : 0
      return { ...p, matchScore, matchCount, totalCount }
    })

    // マッチスコア降順ソート（スコアなし＝後ろへ）
    withScores.sort((a, b) => {
      if (a.matchScore === null && b.matchScore === null) return 0
      if (a.matchScore === null) return 1
      if (b.matchScore === null) return -1
      return (b.matchScore as number) - (a.matchScore as number)
    })

    return NextResponse.json({ politicians: withScores.slice(0, 10) })
  } catch (error) {
    console.error('Error fetching politicians:', error instanceof Error ? error.message : 'unknown')
    return NextResponse.json({ error: 'サーバーエラーが発生しました。' }, { status: 500 })
  }
}
