# Supabase セットアップ手順（seijiselect・4アプリ共有）

新しい Supabase プロジェクト1つを、国民/政治家/支援者/運営の4アプリで共有します。
**DBの中身（テーブル・RLS・ルール・サンプル）は用意済み**：`supabase/migrations/`。

- `0001_init.sql` … 全テーブル＋RLS＋ロール（admin/auditor/legal_reviewer）
- `0002_seed_reference.sql` … ルール7件＋選挙/候補者/課題のサンプル（不要なら削除可）

---

## 役割分担（自動化の境界）
| 作業 | 誰が |
|---|---|
| Supabase プロジェクト作成（要ログイン・課金判断） | **横森さん**（Claudeはアカウントにアクセス不可） |
| `supabase login`（ブラウザ認証・1回） | **横森さん** |
| `supabase link`（DBパスワード入力） | **横森さん**（パスワードはチャットに貼らない） |
| **マイグレーション適用（DB構築）** | **Claude が実行**（`supabase db push`） |
| 開発者の招待・Google OAuth 設定 | 横森さん＋開発者 |

---

## A. プロジェクト作成（横森さん）
1. https://supabase.com/dashboard →「New project」
2. Organization: 例 `seijiselect` / Project: 例 `seijiselect` / **Region: `Northeast Asia (Tokyo)`** / DBパスワードを保管
3. 作成後、URL の `https://<project-ref>.supabase.co` の **project-ref** を控える

## B. DB構築（2通り。どちらか）

### 方式1：SQL Editor に貼る（最も簡単・推奨）
1. ダッシュボード →「SQL Editor」→「New query」
2. `supabase/migrations/0001_init.sql` の中身を全部貼って **Run**
3. 続けて `0002_seed_reference.sql` も貼って Run（サンプル不要ならスキップ）

### 方式2：CLI で Claude が自動適用
1. 横森さんがこの端末で1回だけ：
   ```bash
   npx supabase login          # ブラウザで認証
   npx supabase link --project-ref <project-ref>   # DBパスワードを入力
   ```
2. あとは **Claude が** `npx supabase db push` を実行 → 全マイグレーションが適用されます。

## C. 開発者を招待（Administrator）
- Organization settings → Team → Invite → `kwahash8899@gmail.com` → Role **Administrator**

## D. 認証（Google ログイン：candidate / assist / admin）
1. Google Cloud Console で OAuth 2.0 クライアントを作成（Client ID / Secret）
   - 認可リダイレクトURI に `https://<project-ref>.supabase.co/auth/v1/callback`
2. Supabase → Authentication → Providers → **Google** を有効化し Client ID/Secret を設定
3. 各アプリの「ログイン入口」で `supabase.auth.signInWithOAuth({ provider: 'google' })`
   - **国民 seijiselect は未ログイン中心**：ログインはフォロー/通知等の入口に限定
4. ※ Client ID/Secret は横森さんのGoogleアカウントで作成（サービスのブランドとして表示）。開発者と一緒に設定するのがスムーズ。

## E. アプリ接続（開発者作業）
- 各アプリの `app/prototype/_store.ts`（assist は集約後）の loadJSON/saveJSON を Supabase の select/upsert に差し替え。
- 環境変数：`NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY`（Vercel に設定）。

---

## 注意
- このマイグレーションの **RLS は starter** です。本番公開前に、特に**寄付・要配慮個人情報（思想信条・支援内容）・選挙運動**まわりを弁護士／開発者とレビューしてください。
- 旧「推し活プラットフォーム」は無関係な別プロジェクトです。**復元・流用しない**でください（バックアップDLのみ）。
