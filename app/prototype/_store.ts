'use client'

/**
 * 【プロトタイプ 保存処理の集約モジュール】国民向け seijiselect.jp
 *
 * 国民向けプロトの各画面は、ブラウザ保存を全てこの2関数経由で行います。
 * 本番化（Supabase化）のときは、**このファイルの中身だけを差し替えれば**全画面が本番DBに繋がります。
 * 呼び出し側（各画面）のコードは変更不要です。
 *
 * ── 現在: ブラウザの localStorage に保存 ──
 *
 * ── key → Supabase テーブル 対応表 ──
 *   proto_citizen_match_v1  → 診断結果（diagnoses / 無名ユーザーはCookie等。一致率算出に使用）
 *   proto_donations_v1      → donations（寄付。本番は本人確認・決済を経て採番）
 *   proto_election_v1       → elections / election_candidates（●●選挙のCSV取込結果）
 *
 * ── 本番化の手順（作業者向け）──
 * 1. Supabase クライアントを用意（@supabase/supabase-js）。
 * 2. 下の loadJSON / saveJSON を、key に対応するテーブルへの select / upsert に書き換える。
 *    （診断結果・寄付は未ログインでも使えるよう、匿名キーやCookieと併用を検討）
 * 3. 呼び出し側は触らない。
 *
 * ※ ●●選挙のCSV取込は、本番では「管理画面で CSV → DB（election_candidates）に取込」に置き換える。
 */

export const STORE_KEYS = {
  citizenMatch: 'proto_citizen_match_v1',
  donations: 'proto_donations_v1',
  election: 'proto_election_v1',
  recurringSupport: 'proto_recurring_support_v1', // → subscriptions（定期支援の登録）
  publicQuestions: 'proto_public_questions_v1', // → public_questions / public_question_votes（公開質問ボード）
} as const

/** 読み込み。データが無い/壊れている場合は fallback を返す。 */
export function loadJSON<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback
  try {
    const raw = window.localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : fallback
  } catch {
    return fallback
  }
}

/** 保存。 */
export function saveJSON<T>(key: string, value: T): void {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(key, JSON.stringify(value))
  } catch {
    /* ignore */
  }
}
