-- ============================================================
-- seijiselect プラットフォーム 初期スキーマ（4アプリ共有 / 1つのSupabaseプロジェクト）
--   国民 next-vote-match / 政治家 candidate-vote-match / 支援者 assistant-vote-match / 運営 admin-vote-match
-- 設計元: 各repoの docs/実装仕様書_*.md、docs/データ構造_公開質問ボード_共通仕様.md
-- 注意: RLSは「starter」。本番公開前に必ずレビュー（特に寄付・要配慮個人情報・選挙運動）。
-- ============================================================

create extension if not exists pgcrypto;

-- ───────── アプリ内ロール（admin / auditor / legal_reviewer / candidate / provider）─────────
create table if not exists user_roles (
  user_id uuid references auth.users on delete cascade,
  role text not null check (role in ('citizen','candidate','provider','admin','auditor','legal_reviewer')),
  primary key (user_id, role)
);
alter table user_roles enable row level security;
create policy "own roles readable" on user_roles for select using (user_id = auth.uid());

create or replace function public.has_role(r text) returns boolean
  language sql security definer stable set search_path = public as $$
  select exists (select 1 from user_roles where user_id = auth.uid() and role = r);
$$;
create or replace function public.is_staff() returns boolean
  language sql security definer stable set search_path = public as $$
  select public.has_role('admin') or public.has_role('auditor') or public.has_role('legal_reviewer');
$$;
create or replace function public.is_admin() returns boolean
  language sql security definer stable set search_path = public as $$
  select public.has_role('admin') or public.has_role('legal_reviewer');
$$;

-- ───────── 共有リファレンス（選挙・候補者・政策）─────────
create table if not exists elections (
  id text primary key,
  name text not null, type_label text, region text,
  postal_prefixes text[] default '{}', election_date date,
  official_url text, is_published boolean default false,
  created_at timestamptz default now()
);

-- 政治家アカウント（candidate-vote-match。auth.users と1:1）
create table if not exists candidates (
  id uuid primary key references auth.users on delete cascade,
  name text, party text, region text, title text, biography text, achievements text,
  sns_links jsonb default '{}', profile_image text,
  main_policies text[] default '{}', support_needs text[] default '{}',
  nationality text, updated_at timestamptz default now()
);

-- 選挙×候補者ロスター（運営adminが取込・審査・公開。候補者本人未登録でも掲載可）
create table if not exists election_candidates (
  id bigint generated always as identity primary key,
  election_id text references elections on delete cascade,
  candidate_id uuid references candidates,
  name text, party text, age text, status text, themes text[] default '{}',
  finance text, transparency text, achievement text, source text,
  exec_grade text, transparency_grade text, profile text, source_status text,
  is_published boolean default false
);

create table if not exists policies (
  id bigint generated always as identity primary key,
  candidate_id uuid references candidates on delete cascade,
  election_id text references elections, theme_key text,
  title text, issue text, solution text, target_region text, current_data text, cause text,
  budget text, steps text, stakeholders text, expected_impact text, risks text, public_explanation text,
  status text, is_published boolean default false, updated_at timestamptz default now()
);

-- 観点別比較文（取込時に1回だけ生成→保存。国民側はAPIなしで表示）
create table if not exists comparison_perspectives (
  id bigint generated always as identity primary key,
  election_id text references elections on delete cascade,
  perspective_id text, candidate_summaries jsonb, differences text, questions text[] default '{}'
);

-- 国と地域の課題／政策提言（国民側 kpi。運営adminが登録・段階更新・公開）
create table if not exists issues (
  id bigint generated always as identity primary key,
  scope text not null, theme_key text, title text not null, proposal text,
  funnel_stage int default 0 check (funnel_stage between 0 and 4),
  donation_goal int default 0, youtube_id text, is_published boolean default false,
  created_at timestamptz default now()
);

-- ───────── 国民の参加データ（未ログインでも作成可・個人特定情報を持たせない）─────────
create table if not exists diagnoses (
  id bigint generated always as identity primary key, weights jsonb, created_at timestamptz default now()
);
create table if not exists policy_votes (
  id bigint generated always as identity primary key,
  policy_id bigint, stance text, priority text, support_action text[] default '{}', created_at timestamptz default now()
);

-- ───────── 公開質問ボード（正準スキーマ・docs/データ構造_公開質問ボード_共通仕様.md）─────────
create table if not exists public_questions (
  id uuid primary key default gen_random_uuid(),
  election_id text not null references elections,
  theme_key text not null, title text not null, body text, nickname text, anonymous_key text,
  vote_count int not null default 0,
  status text not null default '運営確認中'
    check (status in ('運営確認中','公開中','上位質問入り','候補者へ送付済み','回答受付中','回答公開中','非公開')),
  merged_into_question_id uuid references public_questions(id),
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table if not exists public_question_votes (
  id uuid primary key default gen_random_uuid(),
  question_id uuid not null references public_questions(id) on delete cascade,
  user_id uuid references auth.users, anonymous_key text, ip_hash text,
  created_at timestamptz not null default now()
);
create unique index if not exists uq_vote_user on public_question_votes(question_id, user_id) where user_id is not null;
create unique index if not exists uq_vote_anon on public_question_votes(question_id, anonymous_key) where anonymous_key is not null;

create table if not exists candidate_question_answers (
  id uuid primary key default gen_random_uuid(),
  election_id text not null references elections,
  question_id uuid not null references public_questions(id) on delete cascade,
  candidate_id uuid not null references candidates,
  answer_text text, source_url text, attachment_url text,
  status text not null default '未回答'
    check (status in ('未回答','下書き','提出済み（運営確認中）','回答済み（公開）','回答辞退','対象外')),
  answered_at date, reviewed_by_admin boolean not null default false, updated_at timestamptz not null default now(),
  unique (question_id, candidate_id)
);

-- ───────── 政治家：政策応援ページ・献金・CRM・タスク・AI下書き ─────────
create table if not exists policy_support_pages (
  id bigint generated always as identity primary key,
  candidate_id uuid references candidates on delete cascade, policy_id bigint references policies,
  title text, purpose text, target_amount int, current_amount int default 0, supporter_count int default 0,
  use_of_funds text, progress text, status text, is_published boolean default false
);
create table if not exists donations (
  id bigint generated always as identity primary key,
  page_id bigint references policy_support_pages, candidate_id uuid references candidates,
  amount int, date date, purpose text, name text, address text, occupation text, contact text,
  nationality text, disclosure_status text, receipt_file text, memo text, created_at timestamptz default now()
);
create table if not exists crm_contacts (
  id bigint generated always as identity primary key,
  candidate_id uuid references candidates on delete cascade,
  name text, organization text, email text, phone text, sns text,
  support_types text[] default '{}', interested_policies text[] default '{}',
  contact_history jsonb default '[]', next_action text, next_contact_date date, status text, memo text
);
create table if not exists tasks (
  id bigint generated always as identity primary key,
  candidate_id uuid references candidates on delete cascade,
  type text, title text, description text, due_date date, priority text, status text,
  related_supporter_id bigint, related_policy_id bigint
);
create table if not exists ai_generated_content (
  id bigint generated always as identity primary key,
  candidate_id uuid references candidates on delete cascade,
  type text, source_id bigint, prompt text, content text, status text default 'draft', created_at timestamptz default now()
);

-- ───────── 支援者（assist：マッチング）─────────
create table if not exists support_providers (
  id uuid primary key references auth.users on delete cascade,
  name text, kind text, contact_name text, email text, phone text, area text, scope text, web text,
  support_types text[] default '{}', skills text[] default '{}',
  visibility text default '政治家にのみ公開', nationality text,
  verified_id boolean default false, verified_org boolean default false, verified_admin boolean default false,
  updated_at timestamptz default now()
);
create table if not exists support_requests (
  id bigint generated always as identity primary key,
  candidate_id uuid references candidates, title text, region text, support_type text,
  online_ok boolean, required_skills text[] default '{}', theme_key text, deadline date,
  compliance_class text, status text, is_published boolean default false
);
create table if not exists support_applications (
  id bigint generated always as identity primary key,
  request_id bigint references support_requests on delete cascade, provider_id uuid references support_providers,
  message text, status text default '応募中', created_at timestamptz default now()
);
create table if not exists support_badges (
  id bigint generated always as identity primary key,
  provider_id uuid references support_providers on delete cascade, badge_key text, label text, granted_at timestamptz default now()
);

-- ───────── 運営adminの運営OS（統合キュー・ルール・監査）─────────
create table if not exists review_queue (
  id bigint generated always as identity primary key,
  type text, title text, sub text, amount int,
  nationality text, kyc_done boolean, donation_ytd int, duplicate_signals text[] default '{}',
  receipt boolean, related_party boolean, pii boolean,
  sla_hours_left int, status text, assigned_to uuid, updated_at timestamptz default now()
);
create table if not exists rules (
  id text primary key, name text, description text, severity text, enabled boolean default true
);
create table if not exists rule_changes (
  id bigint generated always as identity primary key, rule_id text references rules, change text, actor uuid, at timestamptz default now()
);
create table if not exists audit_logs (
  id bigint generated always as identity primary key, actor uuid, action text, target text, at timestamptz default now()
);

-- ============================================================
-- RLS（starter）: 公開リファレンスは公開read／個人データは本人／運営系は staff・admin
-- ============================================================
do $$ declare t text; begin
  foreach t in array array[
    'elections','candidates','election_candidates','policies','comparison_perspectives','issues',
    'diagnoses','policy_votes','public_questions','public_question_votes','candidate_question_answers',
    'policy_support_pages','donations','crm_contacts','tasks','ai_generated_content',
    'support_providers','support_requests','support_applications','support_badges',
    'review_queue','rules','rule_changes','audit_logs'
  ] loop execute format('alter table %I enable row level security;', t); end loop; end $$;

-- 公開リファレンス: 公開分は誰でも閲覧、書き込みは admin
create policy "elections public read" on elections for select using (is_published or is_admin());
create policy "elections admin write" on elections for all using (is_admin()) with check (is_admin());
create policy "ec public read" on election_candidates for select using (is_published or is_admin());
create policy "ec admin write" on election_candidates for all using (is_admin()) with check (is_admin());
create policy "cmp public read" on comparison_perspectives for select using (true);
create policy "cmp admin write" on comparison_perspectives for all using (is_admin()) with check (is_admin());
create policy "issues public read" on issues for select using (is_published or is_admin());
create policy "issues admin write" on issues for all using (is_admin()) with check (is_admin());

-- 候補者プロフィール: 公開read、本人のみ編集
create policy "candidates public read" on candidates for select using (true);
create policy "candidates self write" on candidates for all using (id = auth.uid()) with check (id = auth.uid());
-- 政策: 公開分read、本人編集、運営も
create policy "policies read" on policies for select using (is_published or candidate_id = auth.uid() or is_staff());
create policy "policies self write" on policies for all using (candidate_id = auth.uid() or is_admin()) with check (candidate_id = auth.uid() or is_admin());

-- 国民参加: 誰でも作成可
create policy "diagnoses insert" on diagnoses for insert with check (true);
create policy "policy_votes insert" on policy_votes for insert with check (true);

-- 公開質問: 公開statusはread、投稿は誰でも（status既定=運営確認中）、編集は admin
create policy "pq public read" on public_questions for select
  using (status in ('公開中','上位質問入り','候補者へ送付済み','回答受付中','回答公開中') or is_staff());
create policy "pq insert" on public_questions for insert with check (status = '運営確認中');
create policy "pq admin write" on public_questions for update using (is_admin()) with check (is_admin());
create policy "pqv insert" on public_question_votes for insert with check (true);
create policy "pqv read" on public_question_votes for select using (is_staff());

-- 回答: 公開statusはread、本人編集（運営承認の手前まで）、admin承認
create policy "cqa public read" on candidate_question_answers for select
  using (status in ('回答済み（公開）','回答辞退','対象外') or candidate_id = auth.uid() or is_staff());
create policy "cqa self write" on candidate_question_answers for all
  using (candidate_id = auth.uid() or is_admin()) with check (candidate_id = auth.uid() or is_admin());

-- 政治家の個人データ: 本人のみ（＋運営staffはread）
create policy "psp owner" on policy_support_pages for all using (candidate_id = auth.uid() or is_staff()) with check (candidate_id = auth.uid() or is_admin());
create policy "donations owner" on donations for all using (candidate_id = auth.uid() or is_staff()) with check (candidate_id = auth.uid() or is_admin());
create policy "crm owner" on crm_contacts for all using (candidate_id = auth.uid()) with check (candidate_id = auth.uid());
create policy "tasks owner" on tasks for all using (candidate_id = auth.uid()) with check (candidate_id = auth.uid());
create policy "ai owner" on ai_generated_content for all using (candidate_id = auth.uid()) with check (candidate_id = auth.uid());

-- 支援者: 公開範囲に応じてread（簡易: 一般公開 or 本人 or staff）、本人編集
create policy "provider read" on support_providers for select using (visibility = '一般公開' or id = auth.uid() or is_staff());
create policy "provider self write" on support_providers for all using (id = auth.uid()) with check (id = auth.uid());
create policy "req public read" on support_requests for select using (is_published or candidate_id = auth.uid() or is_staff());
create policy "req owner write" on support_requests for all using (candidate_id = auth.uid() or is_admin()) with check (candidate_id = auth.uid() or is_admin());
create policy "app read" on support_applications for select using (provider_id = auth.uid() or is_staff());
create policy "app insert" on support_applications for insert with check (provider_id = auth.uid());
create policy "badge read" on support_badges for select using (true);

-- 運営OS: staff read / admin write、監査ログは staff read・全員 insert（操作記録）
create policy "rq staff" on review_queue for select using (is_staff());
create policy "rq admin write" on review_queue for all using (is_admin()) with check (is_admin());
create policy "rules read" on rules for select using (is_staff());
create policy "rules admin write" on rules for all using (is_admin()) with check (is_admin());
create policy "rulechg read" on rule_changes for select using (is_staff());
create policy "rulechg insert" on rule_changes for insert with check (is_admin());
create policy "audit read" on audit_logs for select using (is_staff());
create policy "audit insert" on audit_logs for insert with check (auth.uid() is not null);

-- updated_at は各アプリで設定（トリガは本番チューニング時に追加）
