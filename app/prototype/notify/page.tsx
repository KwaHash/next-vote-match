'use client'

/**
 * 【プロトタイプ】seijiselect.jp 選挙前通知設定
 *
 * 目的: 投票日が近づいたらメール / LINE でリマインドを受け取る設定。
 * 注意: 動く仕様書。実際の送信は行わない。設定は localStorage に保存。
 *   本番: notifications テーブル + SendGrid / LINE Messaging API
 */

import { loadJSON, saveJSON } from '../_store'
import Link from 'next/link'
import { useEffect, useState } from 'react'

const NOTIFY_KEY = 'proto_notify_v1'

const ELECTION_TYPES = [
  { value: 'shugiin',  label: '衆議院議員選挙' },
  { value: 'sangiin',  label: '参議院議員選挙' },
  { value: 'chiji',    label: '都道府県知事選' },
  { value: 'kengi',    label: '都道府県議会選' },
  { value: 'shucho',   label: '市区町村長選' },
  { value: 'shigi',    label: '市区町村議会選' },
]

const TIMINGS = [
  { value: 14, label: '14日前' },
  { value: 7,  label: '7日前' },
  { value: 3,  label: '3日前' },
  { value: 1,  label: '前日' },
  { value: 0,  label: '当日朝' },
]

const CHANNELS = [
  { value: 'email', label: 'メール',  icon: '✉️' },
  { value: 'line',  label: 'LINE',    icon: '💬' },
  { value: 'push',  label: 'プッシュ通知', icon: '🔔' },
]

interface NotifySettings {
  channel: string
  email: string
  electionTypes: string[]
  timings: number[]
  region: string
  savedAt: string | null
}

const DEFAULT: NotifySettings = {
  channel: 'email',
  email: '',
  electionTypes: ['shugiin', 'sangiin'],
  timings: [7, 1],
  region: '',
  savedAt: null,
}

export default function NotifyPage() {
  const [settings, setSettings] = useState<NotifySettings>(DEFAULT)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    const d = loadJSON<NotifySettings | null>(NOTIFY_KEY, null)
    if (d) setSettings(d)
  }, [])

  const update = (patch: Partial<NotifySettings>) =>
    setSettings((prev) => ({ ...prev, ...patch }))

  const toggleArr = <T,>(arr: T[], val: T): T[] =>
    arr.includes(val) ? arr.filter((v) => v !== val) : [...arr, val]

  const handleSave = () => {
    const next = { ...settings, savedAt: new Date().toLocaleString('ja-JP') }
    setSettings(next)
    saveJSON(NOTIFY_KEY, next)
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  return (
    <div className='mx-auto w-full max-w-xl px-4 py-8 pb-28'>
      <div className='mb-6'>
        <div className='mb-2 inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-600'>
          <span className='h-1.5 w-1.5 rounded-full bg-blue-500' />
          プロトタイプ / seijiselect.jp
        </div>
        <h1 className='text-2xl font-bold text-gray-900'>選挙前通知の設定</h1>
        <p className='mt-1 text-sm text-gray-500'>
          投票日が近づいたらお知らせします。大事な一票を忘れません。
        </p>
      </div>

      {/* 通知チャネル */}
      <div className='mb-5 rounded-xl border border-gray-200 bg-white p-5'>
        <h2 className='mb-3 text-sm font-bold text-gray-900'>通知方法</h2>
        <div className='grid grid-cols-3 gap-2'>
          {CHANNELS.map((ch) => (
            <button
              key={ch.value}
              type='button'
              onClick={() => update({ channel: ch.value })}
              className={`rounded-xl border py-3 text-center text-sm font-semibold transition-colors ${
                settings.channel === ch.value
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50'
              }`}
            >
              <div className='text-xl'>{ch.icon}</div>
              <div className='mt-0.5 text-xs'>{ch.label}</div>
            </button>
          ))}
        </div>
      </div>

      {/* メールアドレス（メール選択時） */}
      {settings.channel === 'email' && (
        <div className='mb-5 rounded-xl border border-gray-200 bg-white p-5'>
          <label className='mb-1.5 block text-sm font-bold text-gray-900'>
            メールアドレス
          </label>
          <input
            type='email'
            placeholder='your@email.com'
            value={settings.email}
            onChange={(e) => update({ email: e.target.value })}
            className='w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-400 focus:outline-none'
          />
        </div>
      )}

      {/* LINE（LINE選択時） */}
      {settings.channel === 'line' && (
        <div className='mb-5 rounded-xl border border-green-200 bg-green-50 p-5'>
          <h2 className='mb-2 text-sm font-bold text-gray-900'>LINE で受け取る</h2>
          <p className='mb-3 text-xs text-gray-600'>
            seijiselect の LINE 公式アカウントを友だち追加すると、投票日リマインドが届きます。
          </p>
          <button
            type='button'
            className='w-full rounded-xl bg-[#06C755] py-2.5 text-sm font-bold text-white hover:bg-[#05a847]'
            onClick={() => alert('本番では LINE 友だち追加画面に遷移します（プロトタイプ）')}
          >
            💬 LINE で友だち追加
          </button>
        </div>
      )}

      {/* プッシュ通知（push選択時） */}
      {settings.channel === 'push' && (
        <div className='mb-5 rounded-xl border border-gray-200 bg-white p-5'>
          <h2 className='mb-2 text-sm font-bold text-gray-900'>プッシュ通知</h2>
          <p className='mb-3 text-xs text-gray-600'>
            ブラウザの通知許可を有効にすると、このデバイスに投票日リマインドが届きます。
          </p>
          <button
            type='button'
            className='w-full rounded-xl bg-blue-600 py-2.5 text-sm font-bold text-white hover:bg-blue-700'
            onClick={() => {
              if ('Notification' in window) {
                Notification.requestPermission().then((p) => {
                  if (p === 'granted') alert('通知が許可されました（プロトタイプ）')
                })
              } else {
                alert('このブラウザはプッシュ通知に対応していません')
              }
            }}
          >
            🔔 通知を許可する
          </button>
        </div>
      )}

      {/* 対象選挙 */}
      <div className='mb-5 rounded-xl border border-gray-200 bg-white p-5'>
        <h2 className='mb-3 text-sm font-bold text-gray-900'>通知したい選挙の種類</h2>
        <div className='grid grid-cols-2 gap-2'>
          {ELECTION_TYPES.map((et) => {
            const checked = settings.electionTypes.includes(et.value)
            return (
              <button
                key={et.value}
                type='button'
                onClick={() => update({ electionTypes: toggleArr(settings.electionTypes, et.value) })}
                className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-xs font-medium transition-colors ${
                  checked
                    ? 'border-blue-400 bg-blue-50 text-blue-700'
                    : 'border-gray-200 text-gray-600 hover:border-gray-300'
                }`}
              >
                <span className={`h-3.5 w-3.5 rounded border-2 flex items-center justify-center shrink-0 ${checked ? 'border-blue-500 bg-blue-500' : 'border-gray-300'}`}>
                  {checked && <span className='text-[8px] text-white font-bold leading-none'>✓</span>}
                </span>
                {et.label}
              </button>
            )
          })}
        </div>
      </div>

      {/* 通知タイミング */}
      <div className='mb-5 rounded-xl border border-gray-200 bg-white p-5'>
        <h2 className='mb-3 text-sm font-bold text-gray-900'>通知タイミング（複数選択可）</h2>
        <div className='flex flex-wrap gap-2'>
          {TIMINGS.map((tm) => {
            const checked = settings.timings.includes(tm.value)
            return (
              <button
                key={tm.value}
                type='button'
                onClick={() => update({ timings: toggleArr(settings.timings, tm.value) })}
                className={`rounded-full border px-4 py-1.5 text-xs font-semibold transition-colors ${
                  checked
                    ? 'border-blue-500 bg-blue-600 text-white'
                    : 'border-gray-200 text-gray-600 hover:border-gray-300'
                }`}
              >
                {tm.label}
              </button>
            )
          })}
        </div>
      </div>

      {/* 居住地域 */}
      <div className='mb-8 rounded-xl border border-gray-200 bg-white p-5'>
        <label className='mb-1.5 block text-sm font-bold text-gray-900'>
          お住まいの地域（任意）
        </label>
        <p className='mb-2 text-xs text-gray-500'>地域の選挙情報を優先してお届けします。</p>
        <input
          type='text'
          placeholder='例: 東京都渋谷区'
          value={settings.region}
          onChange={(e) => update({ region: e.target.value })}
          className='w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-400 focus:outline-none'
        />
      </div>

      {/* 保存バー */}
      <div className='fixed inset-x-0 bottom-0 z-20 border-t border-gray-200 bg-white/95 backdrop-blur'>
        <div className='mx-auto flex w-full max-w-xl items-center justify-between gap-4 px-4 py-3'>
          <div className='text-xs text-gray-400'>
            {settings.savedAt ? `保存済み ${settings.savedAt}` : '未保存'}
          </div>
          <button
            onClick={handleSave}
            disabled={settings.channel === 'email' && !settings.email}
            className='rounded-xl bg-blue-600 px-6 py-2.5 text-sm font-bold text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-300'
          >
            {saved ? '✓ 保存しました' : '通知設定を保存'}
          </button>
        </div>
      </div>

      <div className='mt-2 text-center text-xs text-gray-400'>
        ※ プロトタイプのため実際の通知は送信されません。本番: notifications テーブル + 配信 API。
      </div>
    </div>
  )
}
