# 実装仕様書（国民向け seijiselect.jp / MVP・8月実装目標）

完成済みプロトタイプ（`prototype` ブランチ）を流用して本実装するための仕様書です。
**初期リリースは機能を絞り込んだ MVP**。寄付決済・実AI(LLM)・スクレイピングはスコープ外。

- 対象リポジトリ: 本リポジトリ `next-vote-match`（= seijiselect.jp / 国民・未ログイン中心）
- ベース: ブランチ `prototype` / タグ `proto-v1`
- 関連: 画面ごとの仕様=`PROTOTYPE_LOG.md`、全体構想=`BACKLOG.md`（candidate-vote-match）
- **実装目標: 2026年8月**

---

## 1. コンセプト・MVP方針
- **「あなたに近い政策と候補者が、30秒でわかる。」** トップは30秒診断中心。
- 政治に詳しくない人でもわかる／30秒で始められる／**登録なしで使える範囲を広く**。
- **いきなり寄付・課金・データ販売を前面に出さない**。
- **中立性・根拠表示・データ出所表示**を強く意識（候補者を公平に表示）。
- **AIはその都度呼ばない**（事前生成 or ルールベース or「ユーザー自身のAIに渡すプロンプトのコピー」）。何万人が使ってもAPI費用・遅延が出ない設計。

## 2. 進め方（重要：作り直さない）
1. 画面は完成済みプロトを流用（作り直さない）。
2. バックエンドは作らず **Supabase**、公開は **Vercel**。
3. 未ログイン中心（診断・比較・閲覧は登録不要）。
4. 保存処理は **`app/prototype/_store.ts` の loadJSON/saveJSON に集約済み**。中身を Supabase に差し替えるだけで全画面が繋がる。

## 3. 画面構成（MVP・5メニュー）
グローバルナビは5つ（プロト一覧 `/prototype` が再編済み）。

| # | メニュー | 画面 / ルート | 統合・備考 |
|---|---|---|---|
| 1 | **診断する** | 30秒 政策マッチング診断 `/prototype/match` | 最重要・登録不要。価値観タイプ表示・結果シェア・LLM不使用（ルールベース） |
| 2 | **地域の課題** | あなたの地域の課題 `/prototype/kpi` | 都道府県課題＋全国KPIを統合。本番は e-Stat 等に接続 |
| 3 | **候補者を探す** | 選挙で選ぶ（〒）`/prototype/elections`、候補者一覧・検索 `/prototype/candidates` | 個別選挙を統合。出どころ（公式/本人/未確認）を明示。**候補者比較は「選挙で選ぶ」の選挙内比較に統合** |
| 4 | **政策を知る・応援する** | `/prototype/policies` | 旧：政策一覧・政策別寄付。知る／賛同候補／フォロー中心。**寄付は第2段階（法務確認後）** |
| 5 | **透明化レポート** | `/prototype/dashboard` | 初期は寄付より「政策の進捗・活動報告・成果」を中心に |

右上: 投票日リマインダー（中立通知・準備中）／ログイン。サブ: 日本のあるべき姿（ビジョン・縮小）。

### 後回し（初期は非表示・コードは残置）
月額で応援する `/recurring`（決済・法令後）／ あなたの寄付レポート `/report`（寄付開始後マイページ）／ 世界と比べる日本 `/compare-countries`（将来SEO記事）／ ●●選挙CSV取込 `/election`（取込・管理は運営adminへ移管）。
- 候補者プレミアムプラン・データレポート販売は国民向けトップに出さない（前者は candidate 側、後者は法人向けフッター）。

## 4. 「選挙で選ぶ」の要件（中立・低コスト）
`/prototype/elections`:
- 〒検索 → 実施中の選挙を表示 → 選択 → その選挙の候補者を比較。
- **中立表現**:「あなたの関心に近い順」（"おすすめ"表現は使わない）。各所に「特定候補への投票を推奨しない」注意文。
- **3スコア**: 政策一致度（%・診断との近さ・全員100%にしない）／実行力（A/B/C）／透明性（A/B/C）＋**データ出所**。
- **争点マップ**: 6争点 × 候補者 ◎○△。
- **視点を変えて候補者を比べる（10観点）**: 子育て/高齢者/若者/防災/財源/行政DX/透明性/実行力/人権/地域経済。各観点で「見るポイント／候補者ごとの強み・確認点／聞きたい質問」。
- **低コスト**: 視点別比較は事前定義（ルールベース）。さらに深掘りは**「比較プロンプトをコピー」→ユーザー自身のAIへ**（プラットフォーム側APIゼロ）。
- 本番の高度化: 候補者データ更新時に観点別比較文を**一度だけ事前生成→保存→表示はAPI不要**（方式A）。

## 5. 実装順序（Phase）
- **Phase 1（プロトで完了）**: トップ再設計・メニュー5整理・不要機能の非表示・改名・選挙別比較の中立化。
- **Phase 2**: 30秒診断・診断結果（価値観タイプ）・シェア導線。
- **Phase 3**: 地域課題ページ・政策ランキング。
- **Phase 4**: 候補者一覧・候補者詳細（ひとことで言うと/強み/確認したい点/地域課題紐づけ）・選挙別比較。
- **Phase 5**: 透明化レポート・投票日リマインダー（中立通知）。
- **Phase 6**: ログイン後マイページ（政策フォロー・候補者フォロー）。
- **Phase 7**: 寄付・月額応援・寄付レポート（**法務確認後**）。

## 6. Supabase テーブル（MVP優先）
```sql
-- 表示データ（admin/CSVで投入。未ログインでも読める = read 公開、書き込みは admin）
create table policies (
  id text primary key, name text, emoji text, summary text,
  challenge text, solution text, budget int, raised int, supporters int,
  alloc_muni int, alloc_pref int, alloc_natl int
);
create table elections (
  id text primary key, name text, type_label text, region text,
  postal_prefixes text[], election_date date, is_published boolean default false
);
create table election_candidates (
  id bigint generated always as identity primary key, election_id text references elections,
  name text, party text, age text, status text, themes text[],
  finance text, transparency text, achievement text, source text,
  exec_grade text, transparency_grade text, profile text, source_status text
);
-- 観点別比較文（方式A：取込時に一度だけ生成し保存。表示はこれを読むだけ＝APIゼロ）
create table comparison_perspectives (
  id bigint generated always as identity primary key, election_id text references elections,
  perspective_id text, candidate_summaries jsonb, differences text, questions text[]
);
-- 参加データ（未ログインでも作成可。個人特定情報は持たせない）
create table diagnoses ( id bigint generated always as identity primary key, weights jsonb, created_at timestamptz default now() );
create table policy_votes ( id bigint generated always as identity primary key, policy_id text, stance text, priority text, support_action text[], created_at timestamptz default now() );
```
- RLS: `policies`/`elections`/`election_candidates`/`comparison_perspectives` は**読み取り公開・書き込みは admin のみ**。`diagnoses`/`policy_votes` は**作成可**（個人情報なし）。
- ※ **選挙・候補者ロスターは運営adminがCSV取込→審査→公開**したものを表示（国民側は表示のみ）。

## 7. AI機能の低コスト原則
- 国民向けの診断・比較は**リアルタイムでLLMを呼ばない**。
- 観点別比較は ①事前生成（admin取込時に1回）→保存→表示 ②ルールベース ③ユーザーのAIに渡すプロンプトのコピー、のいずれか/組み合わせ。
- 「生成AIをその都度呼び出していません」と画面に明記。

## 8. 中立性・法令（必須表示）
- 候補者情報付近: 「候補者情報は、公式情報・本人入力情報・公開情報をもとに掲載しています。情報の正確性・最新性は各候補者または選挙管理委員会等の公式情報もご確認ください。」
- 比較表示: 「政策診断の回答と候補者の公開情報をもとにした参考比較です。特定候補者への投票を推奨するものではありません。」
- 投票日リマインダー: 「投票日・期日前投票・投票所確認等の中立的な情報提供が目的です。特定候補者への投票依頼や選挙運動を目的とするものではありません。」
  - ※ **有権者による電子メールでの選挙運動は禁止**。リマインダーは中立的な情報通知に限定（メール文面に投票依頼を含めない）。
- 寄付・応援付近: 「献金・寄付・政治活動への支援には政治資金規正法・公職選挙法等の確認が必要です。実際の寄付・決済機能は本人確認・法務確認後に提供します。」

## 9. 完了条件（MVP）
- [ ] トップの入口が「30秒診断」中心
- [ ] メニューが5つ程度に整理されている
- [ ] 国民向けトップから候補者課金・データ販売・月額寄付が外れている
- [ ] 政策診断が登録不要で使える／診断結果から候補者一覧・選挙別比較に遷移できる
- [ ] 地域課題ページがある
- [ ] 候補者一覧・候補者詳細・選挙別比較（3スコア・争点マップ・10視点）がある
- [ ] 政策ランキングがある
- [ ] 透明化レポートがある
- [ ] 投票日リマインダーが中立的な通知として実装されている
- [ ] 観点別比較をクリックしても毎回AI APIを呼ばない／比較プロンプトをコピーできる
- [ ] データ出所・法令注意文が必要箇所に表示されている／スマホで見やすい

## 10. 期間・前提
- **2026年8月の実装目標**。プロト流用・Supabase・AIはその都度呼ばない設計・寄付は記録/後回し、を前提にすれば約1ヶ月規模。
- フェーズ後半（別予算）: 寄付決済/法令対応・実AI(LLM)による事前生成の高度化・政府統計接続・他サイト/admin統合。
