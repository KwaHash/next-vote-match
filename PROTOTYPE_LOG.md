# プロトタイプ開発ログ（国民向け / next-vote-match = seijiselect.jp）

横森（プロトタイプ担当）が `prototype` ブランチで作成した、国民向けサイトのプロトタイプ履歴です。
政治家向けは別リポジトリ `candidate-vote-match` にあります。

## 運用ルール（開発者向け）
- ブランチ: プロトタイプは `prototype` ブランチ（`main` は触りません）。
- 置き場所: `app/prototype/` 配下。本番ルートとは分離。
- データ: DBを使わず `localStorage` で動かします（本番はDB）。
- このサイトは未ログイン中心（認証ガードなし）。プロトタイプもそのまま閲覧可。
- 位置づけ: 「動く仕様書」。本番は本品質で実装し直してください。

## 変更履歴
| 日付 | 画面 / 変更 | 場所 | 状態 |
|---|---|---|---|
| 2026-06-20 | 政策マッチング診断 | `app/prototype/match/page.tsx` | 作業中 |
| 2026-06-20 | 候補者一覧・検索（全選挙種別・診断連動） | `app/prototype/candidates/page.tsx` | 作業中 |
| 2026-06-20 | 政策一覧（課題から見る）・政策別寄付 | `app/prototype/policies/page.tsx`, `app/prototype/policies/[id]/page.tsx` | 作業中 |
| 2026-06-20 | 透明化ダッシュボード（国民向けMVP高優先 完了） | `app/prototype/dashboard/page.tsx` | 作業中 |
| 2026-06-20 | プロトタイプ共通データ（政策に課題/解決案/支援状況を追加） | `app/prototype/_data.ts` | 作業中 |

## 政策一覧・政策別寄付（`/prototype/policies`, `/prototype/policies/[id]`）
課題から政策を一覧（診断済みなら関心テーマを上位表示）。詳細で課題・解決案・支援状況・地域配分・賛同候補を表示し、
政策単位で寄付（今回だけ/月額・おまかせ/地域指定）。寄付確定で Donation ID（DON-2026-xxxxxx）を発行。
**本番:** 本人確認・寄付上限・政治資金規正法チェック・決済・収支報告は実装版で（BACKLOG 8章）。寄付は policy_funds/donations へ。

## 詳細

### 政策マッチング診断（`/prototype/match` → 本番は `/match` に統合想定）
有権者が10テーマの重要度に答え、「選び方タイプ（動物キャラ）」＋近い政策テーマを表示。
**政党名より先にタイプを出す**（構想の方針：対立を避ける）。LLM不使用のクライアント側ルールベース。
結果は `localStorage`（`proto_citizen_match_v1`）に保存し、候補者一覧の一致率算出に使う。

### 候補者一覧・検索（`/prototype/candidates`）
全6選挙種別（衆/参/知事/県議/首長/市議）を `level`（国/都道府県/市区町村）で構造化し、
種別・政党・現職新人・フリーワードで絞り込み。診断結果と連動して「あなたとの一致率」を表示・並べ替え。
データ出どころ（公式取込/本人入力済み）も可視化。

**本番実装で作り直す箇所（開発者向けメモ）:**
- データモデル: `politicians`（人）× `elections`（選挙: 種別・階層・地域）× `candidacies`（出馬）の3テーブル。
- データ更新は3層ハイブリッド: ①公式スクレイピング取込（土台）②政治家本人の入力（candidate.seijiselect.jp）③本人確認。
- カバレッジは 国政 → 都道府県 → 市区町村 の段階展開。
- 一致率・診断は本番の `/match` と政策データ（policy_positions）に接続。

## 中優先機能（2026-06-20 追加）
- あなたの寄付レポート `/prototype/report`: 政策別寄付ページでの寄付（DON-ID）を localStorage から表示。使途・残高・地域配分・成果。
- 候補者 個別詳細 `/prototype/candidates/[id]`: 公約/実績/政治資金透明化/SNS/一致率。候補者一覧のカードから遷移。
- 候補者比較 `/prototype/compare`: 最大3名を並べて政党/種別/地域/一致率/透明化/政策を比較。
- 政策別寄付ページ: 寄付確定時に proto_donations_v1 へ記録（寄付レポート連動）。

## 国家ビジョン軸（2026-06-20 追加）
- 日本のあるべき姿 `/prototype/vision`: 国家ビジョン6本柱→政策テーマ・KPI・他国比較へ接続。
- 日本の未来KPI `/prototype/kpi`: 10分野のKPI（現状→目標）と政策の紐づけ。本番は政府統計に接続。
- 世界と比べる日本 `/prototype/compare-countries`: 分野別の各国比較（◎○△×）＋日本が参考にできる制度。
- 政策投票: 政策詳細 `/prototype/policies/[id]` に賛否・優先度・支援意思の投票＋「懸念の可視化」を追加（policy_votes）。

## ●●選挙 候補者一覧（CSV取込＋比較）（2026-06-20）
- `/prototype/election`: 個別選挙（既定: 杉並区長選挙）の候補者をCSVで取込（貼付/ファイル/サンプル）→ localStorage 保存 → 3軸で比較。
  - 軸1 政策の重点（診断との関心一致）/ 軸2 実行力・現実性（財源◎○△＋実績）/ 軸3 透明性・信頼（情報公開姿勢）
  - CSV列: 氏名,所属,年齢,立場,重点政策(/区切り),財源(明確/一部/不明),透明性(高/中/低),実績
  - 本番: 管理画面でCSV→DB取込（elections / candidacies）。重点政策はテーマ名を政策一覧と揃えると一致が出る。

## 本番化の下準備（2026-06-20）
- `app/prototype/_store.ts` を追加し、全画面の保存（診断結果/寄付/選挙CSV）を loadJSON/saveJSON に集約。
- 本番（Supabase）化は **_store.ts の中身だけ差し替え**れば全画面が繋がる（呼び出し側は変更不要）。
- key→テーブル対応: proto_citizen_match_v1→診断, proto_donations_v1→donations, proto_election_v1→election_candidates。
