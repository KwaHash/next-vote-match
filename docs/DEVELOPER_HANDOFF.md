# seijiselect.jp — 開発者向け実装指示書

**宛先**: フロントエンド / フルスタック開発担当者  
**作成日**: 2026-06-25  
**依頼元**: h-yokomori（h-yokomori@yd-co.jp）  
**期限**: 2026年7月末（4週間スプリント）  
**プロダクト仕様書**: `CITIZEN_PROD_SPEC.md`（本書と同じフォルダ）

---

## はじめに

本プロジェクトは「**seijiselect.jp**」という国民向け政治・選挙情報プラットフォームの  
本番実装です。  

すでに **動くプロトタイプ**（`app/prototype/` 以下）が存在します。  
本番実装では、プロトタイプのUI・ロジックをほぼそのまま流用し、  
**データ層をlocalStorageからSupabaseに切り替える**ことが主な作業です。

新機能の開発よりも「既存プロトのSupabase化」が中心になるため、  
**プロトタイプのコードを必ず読んでから** 実装を始めてください。

---

## 1. プロジェクト概要

| 項目 | 内容 |
|---|---|
| リポジトリ名 | `next-vote-match` |
| フレームワーク | Next.js 14（App Router, `'use client'` / Server Components 混在） |
| 言語 | TypeScript（strict mode ON） |
| スタイル | Tailwind CSS |
| パッケージマネージャ | npm |
| デプロイ先 | Vercel |
| DB | Supabase（PostgreSQL） |
| 認証 | Supabase Auth（Magic Link） |

---

## 2. リポジトリ構成

```
next-vote-match/
├── app/
│   ├── prototype/          ← 動く仕様書。実装の参考にする
│   │   ├── _data.ts        ← サンプルデータ・型定義（本番はDB取得に差し替え）
│   │   ├── _store.ts       ← localStorage保存の集約（本番はSupabaseに差し替え）
│   │   ├── candidates/
│   │   │   ├── page.tsx    ← 候補者一覧（完成済みUI）
│   │   │   ├── [id]/
│   │   │   │   └── page.tsx ← 候補者詳細（プロフィール/政策スタンス/SNS分析タブ）
│   │   │   └── _sns_data.ts ← SNSモックデータ（本番はDBから）
│   │   ├── match/page.tsx  ← 政策マッチング診断（完成済みUI）
│   │   └── ...
│   ├── api/
│   │   ├── chat/route.ts   ← AIチャット（Supabaseキャッシュ実装済み）
│   │   └── politicians/route.ts ← 候補者API（MySQL版。Supabaseに移行）
│   └── (root)/             ← 本番トップページ（未実装）
├── constants/
│   ├── match.ts            ← 10設問のデータ
│   └── ai-faq.ts           ← FAQカテゴリ・質問一覧
├── lib/
│   └── db.ts               ← MySQL接続（廃止してSupabaseに移行）
└── providers/
    └── vote-runtime-provider.tsx ← AIチャットのSuggestions
```

---

## 3. 環境構築手順

### 3.1 前提

- Node.js 20 以上
- npm 10 以上
- Supabase アカウント（無料プランで開始可）
- OpenAI API キー
- Upstash Redis アカウント（無料プランで開始可）

### 3.2 ローカル環境

```bash
# リポジトリのクローン
git clone <リポジトリURL>
cd next-vote-match

# 依存関係インストール
npm install

# Supabase CLI（必要な場合）
npm install -g supabase

# 環境変数ファイルを作成（次セクション参照）
cp .env.example .env.local

# 開発サーバー起動
npm run dev
# → http://localhost:3000
```

### 3.3 環境変数

`.env.local` に以下を設定する。

```bash
# ── Supabase ──
NEXT_PUBLIC_SUPABASE_URL=https://XXXXXXXXXX.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOi...  # anon key（ブラウザ露出OK）
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOi...       # ⚠️ サーバーサイドのみ。絶対に公開しない

# ── OpenAI ──
OPENAI_API_KEY=sk-...

# ── Upstash Redis（レート制限） ──
UPSTASH_REDIS_REST_URL=https://...
UPSTASH_REDIS_REST_TOKEN=...

# ── Resend（メール通知） ──
RESEND_API_KEY=re_...
RESEND_FROM_EMAIL=noreply@seijiselect.jp

# ── アプリ設定 ──
NEXT_PUBLIC_APP_URL=http://localhost:3000  # 本番は https://seijiselect.jp
```

**⚠️ 絶対に守ること:**
- `SUPABASE_SERVICE_ROLE_KEY` は `NEXT_PUBLIC_` をつけない
- `.env.local` を Git にコミットしない（`.gitignore` に追加）
- Vercel の Environment Variables に本番値を設定する

---

## 4. Supabase 初期設定

### 4.1 DBスキーマ作成

Supabase Dashboard の **SQL Editor** で `CITIZEN_PROD_SPEC.md` の「5.1 テーブル設計」の SQL を実行する。  
**必ずRLSの設定SQL（5.2節）も続けて実行すること。**

### 4.2 Supabase クライアント設定

```bash
npm install @supabase/supabase-js @supabase/ssr
```

`lib/supabase/client.ts`（ブラウザ用）:
```typescript
import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
```

`lib/supabase/server.ts`（サーバー用）:
```typescript
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function createServerSupabaseClient() {
  const cookieStore = await cookies()
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: (items) => items.forEach(({ name, value, options }) =>
          cookieStore.set(name, value, options)
        ),
      },
    }
  )
}
```

`middleware.ts`（トークン自動更新）:
```typescript
import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  const response = NextResponse.next({ request })
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: (items) => items.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options)
        ),
      },
    }
  )
  await supabase.auth.getUser()
  return response
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
```

### 4.3 初期データ投入

`scripts/seed.ts` を作成し、プロトタイプの `_data.ts` にある `SAMPLE_CANDIDATES` 14名と  
`_sns_data.ts` の SNSデータを Supabase に INSERT する。

```bash
# 実行方法
npx ts-node scripts/seed.ts
```

**INSERT 順序（外部キー制約あり）:**
1. `candidates` テーブルに14名を INSERT
2. `candidate_sns` に各候補者の SNS データを INSERT（候補者IDを使う）
3. `candidate_stances` に各候補者の政策スタンス（10設問）を INSERT
4. `candidate_posts` に最近の投稿サンプルを INSERT
5. `elections` に選挙データを INSERT
6. `candidacies` で候補者と選挙を紐付け

---

## 5. 週次タスクチェックリスト

### ■ Week 1（Day 1〜7）: 基盤構築

**Day 1: 環境確認 + Supabase設定**
- [ ] リポジトリを fork or clone してローカルで `npm run dev` が動くことを確認
- [ ] Supabase プロジェクト作成（名前: `seijiselect`）
- [ ] `.env.local` に全環境変数を設定
- [ ] `npm run dev` でプロトタイプが表示されることを確認（`/prototype`）

**Day 2: DB設計実装**
- [ ] Supabase SQL Editor でテーブルスキーマ全件実行
- [ ] RLS ポリシー全件実行
- [ ] Supabase Dashboard で全テーブルの RLS が ON になっていることを確認
- [ ] `lib/supabase/client.ts` と `lib/supabase/server.ts` を作成

**Day 3: 初期データ投入**
- [ ] `scripts/seed.ts` を実装（候補者14名 + SNS + スタンス + 投稿）
- [ ] シードスクリプト実行
- [ ] Supabase Table Editor で候補者14名が入っていることを確認

**Day 4: 認証実装**
- [ ] Supabase Dashboard でメール設定（Magic Link テンプレート）
- [ ] `app/(auth)/login/page.tsx` を作成（メールアドレス入力 → Magic Link 送信）
- [ ] `app/(auth)/callback/route.ts` を作成（Magic Link のコールバック処理）
- [ ] `middleware.ts` で認証状態の取得とセッション更新
- [ ] ナビゲーションにログイン状態を反映

**Day 5: `_store.ts` の Supabase 切り替え**
- [ ] `lib/supabase/store.ts` を新規作成
- [ ] `loadJSON('proto_citizen_match_v1')` → Supabase `match_results` テーブルに切り替え
- [ ] 未ログインの場合は localStorage フォールバック継続
- [ ] `saveJSON` → Supabase upsert に切り替え

**Day 6: 郵便番号 API**
- [ ] `app/api/zipcode/[zip]/route.ts` を実装
- [ ] zipcloud API 呼び出し（サーバーサイドで呼ぶ）
- [ ] `area_mapping` テーブルに主要郵便番号データを INSERT（最低: 東京 / 大阪 / 名古屋 / 北海道）
- [ ] `curl http://localhost:3000/api/zipcode/1000001` でテスト

**Day 7: トップページ**
- [ ] `app/page.tsx` にトップページを実装（仕様書 4.1 参照）
- [ ] ヘッダーナビ（診断・候補者・AIチャット・ログイン）
- [ ] 「診断を始める」ボタン → `/match` へ
- [ ] モバイル表示確認（Chrome DevTools で iPhone SE）

---

### ■ Week 2（Day 8〜14）: コア機能

**Day 8〜9: 政策マッチング診断の本番化**
- [ ] `app/match/page.tsx` を作成（プロトタイプ `app/prototype/match/page.tsx` を移植）
- [ ] `app/api/zipcode/[zip]` API を診断ページに接続
- [ ] 診断完了 → `match_results` テーブルに保存（ログイン時はuser_id付き）
- [ ] 診断結果ページで上位3候補者を `/api/candidates` から取得して表示

**Day 10〜11: 候補者一覧の本番化**
- [ ] `app/api/candidates/route.ts` を Supabase 対応に書き換え（`lib/db.ts` の廃止）
- [ ] `app/candidates/page.tsx` を作成（`app/prototype/candidates/page.tsx` を移植）
- [ ] Supabase から候補者データを取得して表示
- [ ] 絞り込み（選挙種別・政党・現職/新人）が動くことを確認

**Day 12〜13: 候補者詳細の本番化**
- [ ] `app/api/candidates/[id]/route.ts` を作成
- [ ] `app/api/candidates/[id]/sns/route.ts` を作成
- [ ] `app/candidates/[id]/page.tsx` を作成（プロトタイプの詳細ページを移植）
- [ ] プロフィールタブ: Supabase から bio・career を取得
- [ ] 政策スタンスタブ: `candidate_stances` テーブルから取得して10問表示
- [ ] SNSタブ: `candidate_sns` + `candidate_posts` から取得して表示

**Day 14: SNS タブ完成確認**
- [ ] フォロワー数比較バーが正しく表示される
- [ ] 最近の投稿サンプル3件が表示される
- [ ] 未登録プラットフォームは「未登録」グレー表示
- [ ] モバイルでタブ切り替えが快適に動く

---

### ■ Week 3（Day 15〜21）: 付加機能

**Day 15〜16: AIチャットの本番化**
- [ ] `app/api/chat/route.ts` の `withDatabase()` を Supabase に差し替え
  - `ai_response_cache` テーブルへの SELECT / INSERT を Supabase で実装
- [ ] `app/ai-chat/page.tsx` を作成（プロトタイプのAIチャットを移植）
- [ ] FAQ セクションのキャッシュが動くことを確認（同じ質問を2回 → 2回目はDB返却）
- [ ] AIチャットの免責文章を画面に表示

**Day 17: レート制限**
- [ ] `npm install @upstash/ratelimit @upstash/redis`
- [ ] `app/api/chat/route.ts` に Upstash レート制限を追加（IP単位 20回/時）
- [ ] テスト: 21回連続でチャットを送ると `429 Too Many Requests` が返ることを確認

**Day 18: 応援投票**
- [ ] `app/api/support/route.ts` を作成（POST: `support_votes` に INSERT）
- [ ] 候補者詳細ページに「応援する ♥」ボタンを追加
- [ ] 同一セッションは重複投票不可（`session_id` でユニーク制約）
- [ ] 応援数をリアルタイムで表示（Supabase Realtime 使用推奨）

**Day 19〜20: 候補者比較**
- [ ] `app/compare/page.tsx` を作成（プロトタイプの compare を移植）
- [ ] 候補者2人の政策スタンスを横並び比較
- [ ] 候補者詳細ページから「比較に追加」ボタン
- [ ] SNS フォロワー数比較チャートを表示

**Day 21: メール通知登録**
- [ ] `app/api/notifications/subscribe/route.ts` を作成
- [ ] `notification_subscriptions` テーブルに INSERT
- [ ] 登録完了メール（Resend API）
- [ ] 選挙ページ・トップページに「選挙日リマインダーを受け取る」フォーム

---

### ■ Week 4（Day 22〜28）: QA・リリース

**Day 22〜23: スマホ実機テスト**
- [ ] iPhone Safari で全ページを確認（横スクロール・文字切れ・ボタン押しやすさ）
- [ ] Android Chrome で確認
- [ ] AIチャットのキーボードが出た時にUIが崩れないか確認

**Day 24: パフォーマンス**
- [ ] `npm run build` が成功することを確認
- [ ] Lighthouse（Chrome DevTools）でスコア確認
  - Performance ≥ 80（Vercel Edge Cache + 画像最適化）
  - Accessibility ≥ 90
- [ ] 候補者一覧は ISR（`revalidate: 3600`）でキャッシュ
- [ ] 候補者詳細も ISR（`revalidate: 3600`）

**Day 25: セキュリティ最終確認**
- [ ] Supabase Dashboard で全テーブルの RLS が ON
- [ ] `NEXT_PUBLIC_` のつかない秘密鍵がブラウザのソースに含まれていないか確認
- [ ] AIチャットのシステムプロンプトがレスポンスに含まれていないか確認
- [ ] OWASP Top 10 の XSS / CSRF / SQL インジェクション確認
- [ ] `tsc --noEmit` でTypeScriptエラーがないことを確認

**Day 26: 法的ページ追加**
- [ ] `app/privacy/page.tsx`: プライバシーポリシー（依頼元から文章を受領）
- [ ] `app/terms/page.tsx`: 利用規約（依頼元から文章を受領）
- [ ] フッターからリンク

**Day 27: ステージングテスト**
- [ ] Vercel にステージング環境（`preview` ブランチ）をデプロイ
- [ ] 依頼元（h-yokomori@yd-co.jp）に確認依頼
- [ ] 指摘事項を修正

**Day 28: 本番リリース**
- [ ] `main` ブランチに merge
- [ ] Vercel 本番デプロイ確認
- [ ] `seijiselect.jp` ドメインの DNS 設定確認
- [ ] 本番環境で Magic Link メールが届くことを確認
- [ ] 本番環境で候補者一覧・詳細が表示されることを確認
- [ ] 本番環境で AI チャットが動くことを確認

---

## 6. 各機能の実装詳細

### 6.1 郵便番号 → 選挙区変換

```typescript
// app/api/zipcode/[zip]/route.ts
export async function GET(
  _request: Request,
  { params }: { params: { zip: string } }
) {
  const zip = params.zip.replace(/-/g, '')
  if (!/^\d{7}$/.test(zip)) {
    return NextResponse.json({ error: '郵便番号は7桁の数字で入力してください' }, { status: 400 })
  }

  // Step 1: zipcloud で住所を取得
  const res = await fetch(`https://zipcloud.ibsnet.co.jp/api/search?zipcode=${zip}`)
  const data = await res.json()

  if (!data.results?.[0]) {
    return NextResponse.json({ error: '郵便番号が見つかりません' }, { status: 404 })
  }

  const { address1: prefecture, address2: city } = data.results[0]

  // Step 2: area_mapping テーブルで選挙区を引く
  const supabase = createServerSupabaseClient()
  const { data: mapping } = await supabase
    .from('area_mapping')
    .select('district')
    .eq('prefecture', prefecture)
    .ilike('city', `%${city}%`)
    .eq('election_type', 'shugiin')
    .single()

  return NextResponse.json({
    prefecture,
    city,
    district: mapping?.district ?? null,
    address: `${prefecture}${city}`,
  })
}
```

### 6.2 マッチングスコア計算

```typescript
// 候補者APIでのスコア計算ロジック
function calcMatchScore(
  userAnswers: Record<number, 0 | 1>,  // {question_id: option_index}
  candidateStances: { question_id: number; option_index: number }[]
): { score: number; matchCount: number; totalCount: number } {
  let matchCount = 0
  let totalCount = 0

  candidateStances.forEach(({ question_id, option_index }) => {
    const userAnswer = userAnswers[question_id]
    if (userAnswer === undefined || userAnswer === -1) return  // ユーザースキップ
    if (option_index === -1) return  // 候補者未回答
    totalCount++
    if (userAnswer === option_index) matchCount++
  })

  const score = totalCount > 0 ? Math.round((matchCount / totalCount) * 100) : 0
  return { score, matchCount, totalCount }
}
```

### 6.3 AIキャッシュの Supabase 移行

```typescript
// 現在: withDatabase()（MySQL）→ 以下に差し替え
async function getCachedResponse(hash: string): Promise<string | null> {
  const supabase = createServerSupabaseClient()  // service_role が必要な場合は別途
  const { data } = await supabase
    .from('ai_response_cache')
    .select('response_text')
    .eq('question_hash', hash)
    .single()

  if (data) {
    // ヒットカウント更新（non-blocking）
    supabase
      .from('ai_response_cache')
      .update({ hit_count: supabase.raw('hit_count + 1'), updated_at: new Date().toISOString() })
      .eq('question_hash', hash)
      .then(() => {})
    return data.response_text
  }
  return null
}
```

### 6.4 Supabase Realtime（応援数）

```typescript
// 候補者詳細ページでの応援数リアルタイム取得
useEffect(() => {
  const channel = supabase
    .channel('support-votes')
    .on(
      'postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'support_votes', filter: `candidate_id=eq.${candidateId}` },
      () => setSupportCount((c) => c + 1)
    )
    .subscribe()
  return () => { supabase.removeChannel(channel) }
}, [candidateId])
```

---

## 7. よくある実装ミスと注意事項

### ❌ やってはいけないこと

```typescript
// NG: SUPABASE_SERVICE_ROLE_KEY を 'use client' のコンポーネントで使う
// → ブラウザにキーが露出する
'use client'
const supabase = createClient(process.env.SUPABASE_SERVICE_ROLE_KEY)  // ❌

// NG: RLSをOFFにしてデバッグする
// → そのまま本番に出ると全データ漏洩の危険
// → 必ずRLS ONのまま動作確認する

// NG: SQL をそのまま文字列連結
const { data } = await supabase.rpc(`SELECT * FROM candidates WHERE name = '${userInput}'`)  // ❌
// → Supabaseのクライアントライブラリを使えばSQLインジェクション対策は自動

// NG: .env.local を Git にコミットする
// → Vercel のシークレットは Vercel Dashboard で設定
```

### ✅ 必ずやること

```typescript
// OK: サーバーサイドでのみ service_role を使う
// app/api/... の route.ts 内でのみ使用

// OK: Supabase クライアントは用途で使い分ける
// - ブラウザ('use client'): createBrowserClient（anon key）
// - サーバー(Server Component / route.ts): createServerClient（anon key or service_role）

// OK: 型安全にする
type Candidate = Database['public']['Tables']['candidates']['Row']
// Supabase CLI で型生成: npx supabase gen types typescript --project-id XXXX > lib/database.types.ts
```

---

## 8. テスト要件

### 8.1 実装時のセルフテスト（各機能完成後）

| テスト | 確認内容 |
|---|---|
| 郵便番号「1500001」入力 | 「東京都渋谷区」と衆議院選挙区が返る |
| 診断10問完了 | 一致率が0〜100%で表示される。スキップは除外される |
| 候補者一覧 | 「衆議院」でフィルタ → 衆議院候補者のみ表示 |
| 候補者詳細SNSタブ | フォロワー数・エンゲージメント率・投稿サンプルが表示 |
| AIチャット1回目 | OpenAI APIが呼ばれる（API keyログで確認） |
| AIチャット2回目（同じ質問） | キャッシュから返る（`hit_count` が上がる） |
| Magic Linkログイン | メールが届いてクリックするとログイン状態になる |
| ログイン後に診断 | `match_results` テーブルに user_id が入る |
| 応援ボタン | `support_votes` に INSERT される |
| 21回チャット | 21回目に 429 が返る |

### 8.2 デプロイ前チェックリスト

```bash
# TypeScript エラーチェック
npm run build  # ビルドエラーなし

# 型チェック
npx tsc --noEmit  # エラーなし

# 使われていない import などの確認
npm run lint

# Supabase RLS 確認
# Supabase Dashboard → Authentication → Policies で全テーブルを目視確認
```

---

## 9. デプロイ手順

### 9.1 Vercel 設定

1. Vercel にリポジトリを接続（GitHub）
2. Environment Variables に本番環境の値を設定（`.env.local` の内容を全件）
3. `NEXT_PUBLIC_APP_URL` は `https://seijiselect.jp` に変更
4. Deploy

### 9.2 Supabase 本番設定

1. **Authentication → URL Configuration**:
   - Site URL: `https://seijiselect.jp`
   - Redirect URLs: `https://seijiselect.jp/auth/callback`

2. **Authentication → Email Templates**:
   - Magic Link のメール文面を日本語にカスタマイズ
   ```
   件名: seijiselect.jp へのログインリンク
   本文:
   以下のリンクをクリックしてログインしてください。
   このリンクは10分間有効です。
   {{ .ConfirmationURL }}
   ```

3. **Database → Backups**: 自動バックアップが ON になっていることを確認

### 9.3 ドメイン設定

- Vercel の Domains に `seijiselect.jp` を追加
- DNS（お名前.com等）に Vercel の CNAME を設定
- SSL は Vercel が自動発行

---

## 10. 困ったときの連絡先

| 事項 | 連絡先 |
|---|---|
| 仕様の確認 | h-yokomori@yd-co.jp |
| プロトタイプのコード説明 | 上記と同じ |
| 素材（写真・文章）の提供 | 上記と同じ |
| プライバシーポリシー・利用規約の文章 | 上記に依頼 |
| ドメインの DNS 設定権限 | 上記が保有 |
| Supabase プロジェクトのオーナー権限 | 上記から招待を受ける |

---

## 11. 引き継ぎ時に確認すべきこと

実装開始前に依頼元（h-yokomori@yd-co.jp）に以下を確認してください:

- [ ] Supabase プロジェクトへの招待（またはパスワード共有）
- [ ] OpenAI API Key の共有
- [ ] Vercel チームへの招待
- [ ] `seijiselect.jp` ドメインの DNS 操作権限
- [ ] プライバシーポリシー・利用規約の文章（Day 26 に必要）
- [ ] 候補者の顔写真素材（なければプロトタイプの絵文字で代替可）
- [ ] 実際の候補者データ（プロトタイプは架空14名。本番は実データが必要）

---

## 付録: プロトタイプで実装済みの機能一覧

以下は `app/prototype/` 以下で動作するため、UIの参考にしてください。

| プロトタイプURL | 状態 | 本番URL |
|---|---|---|
| `/prototype/match` | 完成（UI） | `/match` |
| `/prototype/candidates` | 完成（UI） | `/candidates` |
| `/prototype/candidates/[id]` | 完成（SNSタブ付き） | `/candidates/[id]` |
| `/prototype/ai-chat` | 完成（キャッシュ実装済み） | `/ai-chat` |
| `/prototype/policies` | 完成（UI） | `/policies` |
| `/prototype/ranking` | 完成（UI） | `/ranking` |
| `/prototype/compare` | 完成（UI） | `/compare` |
| `/prototype/prefecture-kpi` | 完成（UI） | `/prefecture-kpi` |
| `/prototype/premium` | 完成（UI） | `/premium` |
| `/prototype/vision` | 完成（UI） | `/vision` |
| トップページ | 未実装 | `/` |
| ログインページ | 未実装 | `/login` |

**注意:** プロトタイプから本番への移植時は、以下の差し替えが必要です:
- `SAMPLE_CANDIDATES`（`_data.ts`）→ Supabase DB 取得
- `loadJSON` / `saveJSON`（`_store.ts`）→ Supabase CRUD
- `withDatabase()`（`lib/db.ts`）→ Supabase クライアント
- `app/api/politicians/route.ts`（MySQL版）→ Supabase 版に書き直し
