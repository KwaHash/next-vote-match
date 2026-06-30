# 開発者への連絡（Supabase 準備完了・招待のお願い）

> そのままメール/チャットで送れます（宛先: KwaHash 様）。

---

### Supabase の準備ができました（招待・Googleログイン・接続のお願い）

お世話になっております。seijiselect プラットフォームの **Supabase プロジェクトを作成し、DBスキーマまで構築済み**です。下記をお願いできますでしょうか。

**■ Supabase プロジェクト（4アプリ共有・1プロジェクト）**
- URL: `https://tzvvysdxlwsaqvoefoii.supabase.co`
- project-ref: `tzvvysdxlwsaqvoefoii`
- Region: AWS ap-northeast-1（東京）
- 公開キー（anon/publishable・ブラウザ用）: `sb_publishable_oKF6B7rm2UXQhFlizK31yQ_fhtTV0XP`
- service_role キー（秘密）は別途、安全な経路でお渡しします。

**■ DB構築済み（マイグレーションは repo に同梱）**
- `next-vote-match/supabase/migrations/0001_init.sql`（全テーブル＋RLS＋ロール）/ `0002_seed_reference.sql`（ルール7件＋選挙/候補者/課題サンプル）
- 適用済み・動作確認済み（公開リファレンスは匿名read可、内部データ=rules等はstaff限定でRLS有効）。
- 公開質問ボードは3アプリ共通の正準スキーマ（`docs/データ構造_公開質問ボード_共通仕様.md`）。
- セットアップ全体は `docs/SUPABASE_SETUP.md` 参照。
- 接続用の環境変数テンプレ: 各repo `.env.example`（URL/anonキー入り）。

**■ お願い1：Supabase 組織への参加（Administrator）**
- こちらから `kwahash8899@gmail.com` 宛に **Administrator** ロールで招待をお送りします。承諾をお願いします。
- DB・認証（Googleログイン）・各種設定は Administrator で可能です（課金・組織管理のみ当方Owner）。

**■ お願い2：Googleログインの実装**
- 対象は **政治家(candidate)・支援者(assist)・運営(admin)** の3サイト。
- **国民(seijiselect)は「未ログイン中心」**の設計を維持したいので、Googleログインは**ログイン後機能（フォロー・通知・マイページ等）の入口に限定**でお願いします。
- Google Cloud の OAuth クライアント（Client ID/Secret）は、当方のGoogleアカウントで用意すべき作業があればご指示ください。一緒に設定させてください（リダイレクトURI: `https://tzvvysdxlwsaqvoefoii.supabase.co/auth/v1/callback`）。

**■ お願い3：アプリ接続**
- 各アプリの保存処理（`app/prototype/_store.ts`、assist は集約後）の loadJSON/saveJSON を Supabase の select/upsert に差し替え。
- 環境変数（`.env.example` 参照）を Vercel に設定し、`prototype` ブランチからデプロイ。
- ※ アプリ内ロール（admin/auditor/legal_reviewer/candidate/provider）は `user_roles` テーブルで管理。RLSは starter のため、公開前に寄付・要配慮個人情報・選挙運動まわりを一緒にレビューさせてください。

**■ お願い4：admin リポジトリの作成（再依頼）**
- 運営サイト `admin-vote-match` だけ GitHub 未作成です。owner `KwaHash` 配下に作成＋当方へ push 権限をいただければ、完成プロトと仕様書を `prototype` ブランチへ push します（詳細は admin リポジトリの `docs/リポジトリ作成依頼.md`）。

お手数ですが、よろしくお願いいたします。
