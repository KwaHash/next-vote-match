# seijiselect.jp — 国民向けプラットフォーム プロダクト仕様書

**バージョン**: 1.0  
**作成日**: 2026-06-25  
**作成者**: h-yokomori  
**対象リリース**: 2026年7月末（1ヶ月スプリント）  
**リポジトリ**: `next-vote-match`（Next.js 14 App Router）

---

## 1. プロダクト概要

### 1.1 ミッション

> 「投票したいけど誰に入れればいいかわからない」を解消し、  
> 政策で候補者を選ぶ文化を日本に根付かせる。

### 1.2 サービス概要

| 項目 | 内容 |
|---|---|
| サービス名 | seijiselect.jp |
| ターゲット | 日本の有権者（18歳以上）|
| 主な機能 | 政策マッチング診断 / 候補者検索 / AIチャット / SNS分析 |
| 収益モデル | フリーミアム（無料 + 月額プレミアム） |
| 対象選挙 | **Phase 1**: 国政（衆議院・参議院）のみ |

### 1.3 プロトタイプとの違い

現在 `app/prototype/` 以下に動く仕様書（プロトタイプ）が存在する。  
本仕様書は **本番実装**のための要件定義であり、DBはSupabase、認証はSupabase Authに切り替える。

---

## 2. ターゲットユーザー（ペルソナ）

### ペルソナA: 「初めて選挙に行く大学生」田村 さくら（21歳）
- 選挙に行きたいが誰に投票すべきかわからない
- SNSで情報収集するがフェイクニュースが心配
- **求めること**: 中立な情報・短時間で結論が出る診断・スマホ完結

### ペルソナB: 「子育て中の共働き主婦」山田 あゆみ（38歳）
- 時間がなく長文を読む余裕がない
- 子育て・教育・物価高に強い関心
- **求めること**: 自分に関係する政策を素早く把握・候補者の実績確認

### ペルソナC: 「政治に不満だが行動していないサラリーマン」橋本 健（45歳）
- 「誰がやっても同じ」と感じている
- 特定のテーマ（景気・安全保障）には強い意見がある
- **求めること**: 自分の意見に近い候補者の発見・比較機能

---

## 3. 機能要件（MoSCoW）

### ■ Must（1ヶ月以内に必須）

| ID | 機能 | 概要 |
|---|---|---|
| M-01 | 政策マッチング診断 | 郵便番号入力 → 選挙区自動判定 → 選挙種別選択 → 10問 → 一致率表示 |
| M-02 | 候補者一覧 | 選挙区・政党・現職/新人でフィルタ。一致率順表示 |
| M-03 | 候補者詳細 | プロフィール・政策スタンス・SNS分析の3タブ |
| M-04 | SNS分析表示 | X/YouTube/Facebook/Instagram/TikTok のフォロワー・頻度・エンゲージ・最新投稿 |
| M-05 | AIチャット | FAQ（キャッシュ）+ 自由入力。政治・選挙専門。コスト削減キャッシュ機能つき |
| M-06 | メール認証ログイン | Supabase Auth（Magic Link）。未ログインでも診断は可能 |
| M-07 | 診断結果の保存 | ログイン時はDB保存。未ログイン時はlocalStorage |
| M-08 | モバイルファースト | iPhone SE（375px）〜で完全表示。タップ操作最適化 |
| M-09 | 情報の中立性表示 | 政治的中立の宣言・データソース明示 |

### ■ Should（余裕があれば1ヶ月内）

| ID | 機能 | 概要 |
|---|---|---|
| S-01 | 候補者比較 | 2〜3人を横並び比較。政策スタンス・SNS指標の差分 |
| S-02 | 都道府県KPI | 都道府県別の政策課題ダッシュボード |
| S-03 | ランキング | 透明化スコア順・診断一致率順の候補者ランキング |
| S-04 | 政策ページ | 政策テーマ別の課題・解決策・クラウドファンディング |
| S-05 | 通知設定 | 選挙日程のメールリマインダー登録 |

### ■ Could（Phase 2 以降）

| ID | 機能 | 概要 |
|---|---|---|
| C-01 | Stripe 課金 | プレミアム月額プランの決済 |
| C-02 | YouTube API 連携 | 候補者の最新動画を自動取得・表示 |
| C-03 | X API 連携 | 最新ツイート自動取得（月額$100〜） |
| C-04 | データレポート販売 | 都道府県・政策別レポートのPDF販売 |
| C-05 | プッシュ通知 | PWA + Web Push |
| C-06 | 首長選挙対応 | 都道府県知事・政令市長の候補者データ |

---

## 4. 主要画面仕様

### 4.1 トップページ（`/`）

```
ヘッダー: ロゴ + ナビ（診断・候補者・AIチャット・ログイン）
ヒーロー:
  キャッチコピー「あなたに近い政治家を見つけよう」
  CTAボタン「診断を始める（60秒）」
  副CTA「候補者を検索」

コンテンツ:
  - 使い方 3ステップ（診断 → 候補者発見 → 比較）
  - 対応選挙の案内
  - 「なぜ政策で選ぶのか」説明（信頼性）
  - 最新の診断件数カウンター

フッター: 運営者情報 / プライバシーポリシー / 利用規約 / お問い合わせ
```

### 4.2 政策マッチング診断（`/match`）

```
Step 0: 郵便番号入力
  - 7桁入力 → zipcloud API → 市区町村を表示
  - 選挙種別選択（衆議院・参議院など6種）
  - 「次へ」ボタン

Step 1〜10: 設問（各1問）
  - カテゴリラベル（例: 消費税と物価高）
  - 質問文（平易な日本語）
  - 2択ボタン（どちらの主張に近いか）
  - 「この問いをスキップ」リンク
  - プログレスバー

Step 11: 結果画面
  - 上位3候補者のカード（一致率 + 名前 + 政党 + 注力テーマ）
  - 「候補者一覧を見る」ボタン
  - 「もう一度診断する」ボタン
  - ログイン促進バナー（「結果を保存して次回も活用」）
```

**重要設計事項:**
- 郵便番号は zipcloud.ibsnet.co.jp API で市区町村に変換後、`area_mapping` テーブルで選挙区を引く
- スキップ設問は一致率計算から除外
- ログイン済みユーザーは結果を `match_results` テーブルに保存

### 4.3 候補者一覧（`/candidates`）

```
絞り込みバー:
  - フリーワード検索（名前・政党・地域）
  - 選挙種別（プルダウン）
  - 政党（プルダウン）
  - 現職/新人/元職（チップ）

候補者カード（各）:
  - 顔写真（or テーマ絵文字）+ 氏名 + 政党 + 選挙種別バッジ
  - 地域・選挙区
  - 注力テーマ（タグ）
  - 透明化スコアバー
  - 診断済み: 「あなたとの一致率 XX%」バッジ
  - タップで詳細ページへ

ソート:
  - 診断済み: 一致率降順（デフォルト）
  - 未診断: 透明化スコア降順

ページング: 無限スクロール or 「もっと見る」ボタン（10件単位）
```

### 4.4 候補者詳細（`/candidates/[id]`）

**タブ1: プロフィール**
```
- プロフィール文（bio）
- 経歴リスト（ステップ形式）
- 注力政策テーマ + 公約（課題 → 解決策）
- 「他の候補者と比較」ボタン
- 「政策を見て応援」ボタン
```

**タブ2: 政策スタンス**
```
- 10設問すべてを表示
- 候補者の回答選択肢を青ハイライト
- ログイン済み: あなたの回答も表示（比較表示）
- 未回答設問は「未回答」グレー表示
```

**タブ3: SNS分析**
```
サマリー:
  - 利用SNS数 / 総フォロワー / 平均エンゲージメント率

SNS戦略説明文（この候補者のSNS活用方針）

プラットフォーム別カード（X / YouTube / Facebook / Instagram / TikTok / LINE）:
  - フォロワー数
  - 投稿頻度バッジ（高・中・低・未登録）
  - エンゲージメント率
  - 発信トピックタグ
  - 投稿ペース（週 N 回）

フォロワー数比較バーグラフ

最近の投稿サンプル（3件）:
  - プラットフォームアイコン + 日付
  - 投稿本文
  - いいね・RT・再生数
```

### 4.5 AIチャット（`/ai-chat`）

```
上部: FAQ セクション
  - カテゴリタブ（投票の仕方 / 選挙制度 / 選び方 / 参加方法）
  - 質問ボタン → 下のエリアに回答表示
  - 「同じ質問はキャッシュ返却（AI呼び出しなし）」の説明

下部: 自由入力チャット
  - 複数ターン対応
  - システムプロンプト: 政治的中立 / 300字以内 / 政治外はお断り
  - 送信ショートカット: Ctrl+Enter / モバイルは送信ボタン

注意書き:
  - 「AIの回答は参考情報です。正確な情報は各候補者・選挙管理委員会でご確認ください。」
```

---

## 5. データモデル（Supabase）

### 5.1 テーブル設計

```sql
-- ユーザープロフィール（auth.users の拡張）
CREATE TABLE public.user_profiles (
  id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  zipcode     VARCHAR(7),
  prefecture  TEXT,
  city        TEXT,
  created_at  TIMESTAMPTZ DEFAULT now(),
  updated_at  TIMESTAMPTZ DEFAULT now()
);

-- 選挙
CREATE TABLE public.elections (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title       TEXT NOT NULL,                    -- 例: 第50回衆議院議員総選挙
  type        TEXT NOT NULL,                    -- shugiin / sangiin / chiji / kengi / shucho / shigi
  election_date DATE,
  announcement_date DATE,
  status      TEXT DEFAULT 'upcoming',          -- upcoming / active / closed
  created_at  TIMESTAMPTZ DEFAULT now()
);

-- 候補者マスタ（人）
CREATE TABLE public.candidates (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT NOT NULL,
  party       TEXT,
  region      TEXT,
  district    TEXT,
  status      TEXT,                             -- 現職 / 新人 / 元職
  bio         TEXT,
  photo_url   TEXT,
  transparency_score INT DEFAULT 0,
  data_source TEXT DEFAULT 'official',          -- official / self
  career      JSONB DEFAULT '[]',
  theme_ids   TEXT[] DEFAULT '{}',
  created_at  TIMESTAMPTZ DEFAULT now(),
  updated_at  TIMESTAMPTZ DEFAULT now()
);

-- 出馬（候補者 × 選挙）
CREATE TABLE public.candidacies (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  candidate_id UUID REFERENCES public.candidates(id) ON DELETE CASCADE,
  election_id  UUID REFERENCES public.elections(id) ON DELETE CASCADE,
  district     TEXT,
  party        TEXT,                            -- 出馬時の政党（本人の party と異なる場合あり）
  is_winner    BOOLEAN,
  vote_count   INT,
  UNIQUE(candidate_id, election_id)
);

-- 候補者の政策スタンス（10問の回答）
CREATE TABLE public.candidate_stances (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  candidate_id UUID REFERENCES public.candidates(id) ON DELETE CASCADE,
  question_id  INT NOT NULL,                    -- 1〜10
  option_index INT NOT NULL,                    -- 0 or 1（-1 = 未回答）
  UNIQUE(candidate_id, question_id)
);

-- 候補者 SNS プロフィール
CREATE TABLE public.candidate_sns (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  candidate_id    UUID REFERENCES public.candidates(id) ON DELETE CASCADE,
  platform        TEXT NOT NULL,                -- X / YouTube / Facebook / Instagram / TikTok / LINE
  handle          TEXT,
  url             TEXT,
  followers       INT,
  posts_per_week  DECIMAL(4,1),
  frequency       TEXT DEFAULT 'none',          -- high / medium / low / none
  engagement_rate DECIMAL(5,2),
  top_topics      TEXT[] DEFAULT '{}',
  sns_strategy    TEXT,
  updated_at      TIMESTAMPTZ DEFAULT now(),
  UNIQUE(candidate_id, platform)
);

-- 候補者の最近の投稿サンプル
CREATE TABLE public.candidate_posts (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  candidate_id UUID REFERENCES public.candidates(id) ON DELETE CASCADE,
  platform     TEXT NOT NULL,
  posted_at    DATE,
  content      TEXT NOT NULL,
  likes        INT DEFAULT 0,
  reposts      INT,
  views        INT,
  created_at   TIMESTAMPTZ DEFAULT now()
);

-- 郵便番号 → 選挙区マッピング（衆議院用）
CREATE TABLE public.area_mapping (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  prefecture  TEXT NOT NULL,
  city        TEXT NOT NULL,
  district    TEXT NOT NULL,                    -- 例: 東京10区
  election_type TEXT NOT NULL DEFAULT 'shugiin'
);
CREATE INDEX idx_area_mapping_city ON public.area_mapping(prefecture, city);

-- 診断結果
CREATE TABLE public.match_results (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  session_id   TEXT,                            -- 未ログイン識別子
  zipcode      VARCHAR(7),
  prefecture   TEXT,
  city         TEXT,
  district     TEXT,
  election_type TEXT,
  answers      JSONB NOT NULL,                  -- {question_id: option_index}
  created_at   TIMESTAMPTZ DEFAULT now()
);

-- AI回答キャッシュ（コスト削減の核心）
CREATE TABLE public.ai_response_cache (
  question_hash VARCHAR(64) PRIMARY KEY,
  question_text TEXT NOT NULL,
  response_text TEXT NOT NULL,
  hit_count     INT DEFAULT 1,
  created_at    TIMESTAMPTZ DEFAULT now(),
  updated_at    TIMESTAMPTZ DEFAULT now()
);

-- 応援投票（ログイン不要）
CREATE TABLE public.support_votes (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  candidate_id UUID REFERENCES public.candidates(id) ON DELETE CASCADE,
  session_id   TEXT NOT NULL,
  created_at   TIMESTAMPTZ DEFAULT now(),
  UNIQUE(candidate_id, session_id)
);

-- メール通知登録（選挙リマインダー）
CREATE TABLE public.notification_subscriptions (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email      TEXT NOT NULL,
  election_id UUID REFERENCES public.elections(id) ON DELETE CASCADE,
  subscribed_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(email, election_id)
);
```

### 5.2 Row Level Security（全テーブル必須）

```sql
-- user_profiles: 本人のみ読み書き
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "user_profiles_self" ON public.user_profiles
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- candidates: 全員が読める、書き込みは service_role のみ
ALTER TABLE public.candidates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "candidates_public_read" ON public.candidates
  FOR SELECT USING (true);

-- candidate_stances: 全員が読める
ALTER TABLE public.candidate_stances ENABLE ROW LEVEL SECURITY;
CREATE POLICY "stances_public_read" ON public.candidate_stances
  FOR SELECT USING (true);

-- candidate_sns: 全員が読める
ALTER TABLE public.candidate_sns ENABLE ROW LEVEL SECURITY;
CREATE POLICY "sns_public_read" ON public.candidate_sns
  FOR SELECT USING (true);

-- candidate_posts: 全員が読める
ALTER TABLE public.candidate_posts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "posts_public_read" ON public.candidate_posts
  FOR SELECT USING (true);

-- match_results: 本人のみ読める。書き込みはanon可（未ログイン診断）
ALTER TABLE public.match_results ENABLE ROW LEVEL SECURITY;
CREATE POLICY "match_read_own" ON public.match_results
  FOR SELECT USING (auth.uid() = user_id OR user_id IS NULL);
CREATE POLICY "match_insert_any" ON public.match_results
  FOR INSERT WITH CHECK (true);

-- ai_response_cache: 読みはanon可、書きは service_role
ALTER TABLE public.ai_response_cache ENABLE ROW LEVEL SECURITY;
CREATE POLICY "cache_public_read" ON public.ai_response_cache
  FOR SELECT USING (true);

-- support_votes: 誰でも投票・集計閲覧
ALTER TABLE public.support_votes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "support_public" ON public.support_votes USING (true) WITH CHECK (true);

-- ⚠️ 全テーブルにRLSを有効化すること。RLSなしのリリースは禁止。
-- ⚠️ service_role キーはサーバー側のみ（ブラウザに露出禁止）。
```

---

## 6. API設計

### 6.1 エンドポイント一覧

| Method | Path | 説明 | 認証 |
|---|---|---|---|
| GET | `/api/elections` | 選挙一覧（active優先） | 不要 |
| GET | `/api/elections/[id]/candidates` | 選挙の候補者一覧 | 不要 |
| GET | `/api/candidates` | 候補者一覧（絞り込み・スコア） | 不要 |
| GET | `/api/candidates/[id]` | 候補者詳細 | 不要 |
| GET | `/api/candidates/[id]/sns` | SNSプロフィール + 最近の投稿 | 不要 |
| GET | `/api/zipcode/[zip]` | 郵便番号 → 選挙区 | 不要 |
| POST | `/api/match` | 診断結果を保存 | 任意 |
| GET | `/api/match/[sessionId]` | 診断結果を取得 | 任意 |
| POST | `/api/chat` | AIチャット（キャッシュ対応） | 不要 |
| POST | `/api/support` | 応援投票 | 不要 |
| GET | `/api/notifications/subscribe` | メール通知登録 | 不要 |

### 6.2 主要APIの詳細

#### `GET /api/candidates`

```
クエリパラメータ:
  election_id  UUID     選挙ID
  district     string   選挙区（部分一致）
  party        string   政党名
  status       string   現職/新人/元職
  q            string   フリーワード（名前・地域）
  match_answers string  JSON: {question_id: option_index}
  limit        int      デフォルト10、最大50
  offset       int      ページング

レスポンス:
  {
    candidates: [
      {
        id, name, party, region, district, status,
        theme_ids, transparency_score, data_source,
        photo_url, bio,
        match_score: number | null,   // matchAnswers指定時のみ
        match_count: number,
        total_count: number
      }
    ],
    total: number
  }
```

#### `GET /api/candidates/[id]/sns`

```
レスポンス:
  {
    sns_strategy: string,
    platforms: [
      {
        platform, handle, followers, posts_per_week,
        frequency, engagement_rate, top_topics, url
      }
    ],
    recent_posts: [
      { platform, posted_at, content, likes, reposts, views }
    ]
  }
```

#### `GET /api/zipcode/[zip]`

```
処理フロー:
  1. zipcloud.ibsnet.co.jp/api/search?zipcode=[zip] を呼ぶ
  2. 都道府県・市区町村を取得
  3. area_mapping テーブルで衆議院選挙区を引く

レスポンス:
  {
    prefecture: string,
    city: string,
    district: string | null,   // 例: "東京10区"（マッピングなし時はnull）
    address: string            // 都道府県 + 市区町村
  }
```

#### `POST /api/chat`

```
リクエスト:
  { messages: [{ role: "user" | "assistant", content: string }] }

処理フロー:
  1. ユーザーメッセージが1件のみ → SHA-256ハッシュ → DBキャッシュ確認
  2. キャッシュヒット → hit_count++ → キャッシュ返却（AI呼び出しなし）
  3. キャッシュミス or 複数ターン → OpenAI GPT-4o 呼び出し
  4. 単発質問 → レスポンス全文受領後キャッシュ保存 → 返却
  5. 複数ターン → ストリーミング返却（キャッシュなし）

レスポンス: NDJSON ストリーム
  各行: { content: [{ type: "text", text: string }] }

コスト上限:
  - 単発: max_tokens=600（約300字）
  - 複数ターン: max_tokens=800
```

---

## 7. セキュリティ要件

### 7.1 認証・認可

| 要件 | 実装方法 |
|---|---|
| パスワードレス認証 | Supabase Auth Magic Link（メールアドレスのみ） |
| セッション管理 | Supabase SSR + Next.js Middleware でトークン自動更新 |
| 未ログイン診断 | `session_id` をCookieで発行。診断結果はローカル保存 |
| API保護 | RLSが主防衛。サーバーサイドAPIはanon keyを使用 |
| 管理操作 | service_role keyは必ずサーバー側のみ |

### 7.2 レート制限

```
AIチャット: Upstash Redis で IP単位 20回/時
候補者API: 100回/分
全API: Vercel Edge Middleware でグローバル制限
```

### 7.3 入力バリデーション

- 郵便番号: `^\d{7}$` のみ受け付け（ハイフンは除去してから検証）
- チャット入力: 最大500文字。HTMLエスケープ必須
- 診断回答: option_index は 0 or 1 or -1 のみ

### 7.4 個人情報

- メールアドレスはSupabase Auth管理のみ（アプリ側DBに保存しない）
- 郵便番号は診断結果に保存するが、氏名と紐付けない
- プライバシーポリシーページ必須（公開前に弁護士確認）

---

## 8. 非機能要件

| 項目 | 要件 |
|---|---|
| パフォーマンス | LCP 2.5秒以内（Vercel Edge Cache活用） |
| 可用性 | 99.5%以上（Vercel + Supabase で担保） |
| スマホ対応 | iPhone SE（375px）〜 PC（1440px）すべてで動作確認 |
| アクセシビリティ | WCAG 2.1 AA 準拠（コントラスト比・フォントサイズ） |
| SEO | 候補者詳細ページは SSR or ISR で OGP 設定 |
| エラー処理 | API失敗時は必ずフォールバックUIを表示（空白NG） |
| ブラウザ対応 | Chrome / Safari / Firefox 最新版。IE11 不要 |

---

## 9. 技術スタック

| カテゴリ | 技術 | 用途 |
|---|---|---|
| フレームワーク | Next.js 14（App Router） | フロントエンド + API Routes |
| 言語 | TypeScript（strict mode） | 全ファイル |
| スタイル | Tailwind CSS | UI全般 |
| DB | Supabase (PostgreSQL) | 本番DB |
| 認証 | Supabase Auth（Magic Link） | ユーザー認証 |
| AIチャット | OpenAI GPT-4o | チャット回答生成 |
| キャッシュ | Supabase DB（ai_response_cache） | AI回答キャッシュ |
| レート制限 | Upstash Redis | API保護 |
| ホスティング | Vercel | デプロイ・CDN |
| メール | Resend | 通知メール配信 |
| 郵便番号API | zipcloud.ibsnet.co.jp | 住所→選挙区変換 |
| 決済（Phase 2） | Stripe | プレミアムプラン課金 |

---

## 10. 1ヶ月実装ロードマップ

### Week 1（Day 1〜7）: 基盤構築

| Day | タスク |
|---|---|
| 1 | リポジトリ確認・Supabase プロジェクト作成・環境変数設定 |
| 2 | DBスキーマ作成（全テーブル）+ RLS設定 |
| 3 | サンプル候補者データのインポート（14名分 + SNSデータ） |
| 4 | Supabase Auth（Magic Link）+ ミドルウェア実装 |
| 5 | `_store.ts` をSupabaseに切り替え（診断結果の保存） |
| 6 | 郵便番号API → 選挙区マッピング実装 |
| 7 | トップページ + ナビゲーション実装。デザイン調整 |

### Week 2（Day 8〜14）: コア機能

| Day | タスク |
|---|---|
| 8〜9 | 政策マッチング診断（`/match`）→ Supabase保存に切り替え |
| 10〜11 | 候補者一覧（`/candidates`）→ Supabase取得・絞り込み |
| 12〜13 | 候補者詳細（`/candidates/[id]`）3タブ完成 |
| 14 | 候補者詳細 SNSタブ → Supabase からリアルデータ表示 |

### Week 3（Day 15〜21）: 付加機能

| Day | タスク |
|---|---|
| 15〜16 | AIチャット（`/ai-chat`）→ Supabaseキャッシュに切り替え |
| 17 | レート制限（Upstash Redis）実装 |
| 18 | 応援投票機能（未ログインでも可） |
| 19〜20 | 候補者比較ページ（2人横並び） |
| 21 | メール通知登録（選挙リマインダー）|

### Week 4（Day 22〜28）: QA・リリース

| Day | タスク |
|---|---|
| 22〜23 | スマホ実機テスト（iPhone / Android）。UIバグ修正 |
| 24 | パフォーマンステスト（Lighthouse スコア 80以上） |
| 25 | セキュリティチェック（RLS再確認 / 環境変数漏れチェック） |
| 26 | プライバシーポリシー・利用規約ページ追加 |
| 27 | ステージング環境でのエンドツーエンドテスト |
| 28 | 本番リリース（Vercel デプロイ） |

---

## 11. 受け入れ基準（リリース前チェックリスト）

### 機能チェック
- [ ] 郵便番号「1000001」で「東京都千代田区」と選挙区が返る
- [ ] 診断10問を完了すると一致率が表示される
- [ ] 候補者一覧が選挙種別・政党で絞り込める
- [ ] 候補者詳細のSNSタブにフォロワー数・投稿サンプルが表示される
- [ ] AIチャットで「投票の仕方は？」と聞くと回答が返る
- [ ] 同じ質問を2回送ると2回目はキャッシュから返る（AIログ増加なし）
- [ ] Magic Linkメールが届いてログインできる

### 品質チェック
- [ ] iPhone SE（375px）で全ページ横スクロールなし
- [ ] Lighthouse スコア Performance ≥ 80、Accessibility ≥ 90
- [ ] console.error なし（本番ビルドで確認）
- [ ] TypeScript エラーなし（`tsc --noEmit`）
- [ ] 全テーブルのRLS有効化を確認（Supabase Dashboard）

### 法務・コンプライアンスチェック
- [ ] プライバシーポリシーを公開済み
- [ ] 利用規約を公開済み
- [ ] AIチャットの免責事項が画面に表示されている
- [ ] 候補者データのソースと免責事項を明記

---

## 12. 将来拡張（Phase 2 以降の計画）

| 機能 | 対象時期 | 概要 |
|---|---|---|
| Stripe 課金 | 2ヶ月後 | プレミアムプラン（月額980円）|
| YouTube API | 2ヶ月後 | 候補者の最新動画を自動取得 |
| X API | 3ヶ月後 | 最新ツイート取得（月額$100〜） |
| 首長選挙対応 | 3〜6ヶ月後 | 都道府県知事・政令市長 |
| PWA + プッシュ通知 | 3ヶ月後 | ホーム追加 + 選挙日リマインダー |
| データレポート販売 | 4ヶ月後 | 政策別レポートPDF（2.5万〜6万円） |
| 市区町村議会対応 | 1年後 | 候補者自己登録モデルで展開 |
