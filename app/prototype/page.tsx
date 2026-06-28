import Link from 'next/link'

// ── 国民向け MVP メニュー（再設計指示に基づく絞り込み）──
interface Item { name: string; href: string; note?: string }
interface Menu { n: number; icon: string; title: string; lead: string; items: Item[] }

const MENU: Menu[] = [
  {
    n: 1, icon: '🧭', title: '診断する', lead: 'あなたに近い政策と候補者が、30秒で。', items: [
      { name: '30秒 政策マッチング診断', href: '/prototype/match', note: '登録不要・最重要。価値観タイプで表示・結果はシェア可' },
    ],
  },
  {
    n: 2, icon: '📍', title: '地域の課題', lead: 'あなたの地域の課題を知る。', items: [
      { name: 'あなたの地域の課題（KPI）', href: '/prototype/kpi', note: '都道府県課題＋全国KPIを統合（旧：日本の未来KPI）。本番はe-Stat等に接続' },
    ],
  },
  {
    n: 3, icon: '🗳️', title: '候補者を探す', lead: '候補者を一覧から探す。', items: [
      { name: '候補者一覧・検索', href: '/prototype/candidates', note: '個別選挙の候補者一覧を統合。出どころ（公式/本人/未確認）を明示' },
    ],
  },
  {
    n: 4, icon: '📊', title: '政策を知る・応援する', lead: '課題から政策へ。寄付は前面に出さない。', items: [
      { name: '政策を知る・応援する', href: '/prototype/policies', note: '旧：政策一覧・政策別寄付。知る／賛同候補／フォロー中心。寄付は第2段階（法務確認後）' },
    ],
  },
  {
    n: 5, icon: '🔍', title: '透明化レポート', lead: '政策・候補者の成果と使途。', items: [
      { name: '透明化・成果レポート', href: '/prototype/dashboard', note: '初期は寄付より「政策の進捗・活動報告・成果」を中心に' },
    ],
  },
]

const SUB: Item[] = [
  { name: '日本のあるべき姿（ビジョン）', href: '/prototype/vision', note: 'トップ下部に縮小' },
]

const DEFERRED: Item[] = [
  { name: '月額で応援する', href: '/prototype/recurring', note: '後回し：献金・決済・法令対応が必要なため第2段階' },
  { name: 'あなたの寄付レポート', href: '/prototype/report', note: '後回し：寄付開始後にログイン後マイページで' },
  { name: '世界と比べる日本', href: '/prototype/compare-countries', note: '後回し：将来SEO記事・特集として' },
  { name: '候補者比較（旧・任意3名）', href: '/prototype/compare', note: '削除：「選挙で選ぶ」の選挙内比較に統合' },
  { name: '●●選挙 候補者CSV（取込デモ）', href: '/prototype/election', note: '取込・管理は運営admin側へ。国民側は表示のみ' },
]

export default function PrototypeIndexPage() {
  return (
    <div className='mx-auto w-full max-w-3xl px-4 py-10'>
      <div className='mb-6'>
        <div className='mb-3 inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-600'>
          <span className='h-1.5 w-1.5 rounded-full bg-blue-500' />
          プロトタイプ / 国民向け seijiselect.jp（MVP再設計版）
        </div>
        <h1 className='text-2xl font-bold text-gray-900'>あなたに近い政策と候補者が、30秒でわかる。</h1>
        <p className='mt-2 text-sm leading-relaxed text-gray-500'>
          診断して、地域の課題を知り、候補者を比較できる「政治選び」の入口です。
          初期リリースは下記の<strong className='text-gray-700'>5メニュー</strong>に絞り、いきなり寄付・課金には誘導しません。
        </p>
      </div>

      {/* #0 選挙で選ぶ（最重要・最も目立たせる） */}
      <Link href='/prototype/elections' className='group mb-5 block overflow-hidden rounded-2xl border border-blue-300 bg-gradient-to-br from-blue-600 to-indigo-600 p-6 text-white shadow-md transition-shadow hover:shadow-lg'>
        <div className='flex items-center gap-4'>
          <span className='flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white/15 text-3xl'>🗳️</span>
          <div className='min-w-0 flex-1'>
            <div className='flex items-center gap-2'>
              <span className='rounded-full bg-white/20 px-2 py-0.5 text-[10px] font-bold tracking-wide'>いちばん使われる入口</span>
            </div>
            <h2 className='mt-1 text-xl font-bold leading-tight'>選挙で選ぶ（郵便番号で検索）</h2>
            <p className='mt-1 text-sm text-blue-50'>〒で、いまあなたの地域の選挙と候補者が見つかる。政策の近さ・実行力・透明性で中立的に比べられます。</p>
          </div>
          <span className='hidden shrink-0 text-2xl text-white/70 group-hover:text-white sm:block'>→</span>
        </div>
        <div className='mt-4 flex flex-wrap gap-2 text-[11px] font-medium'>
          <span className='rounded-lg bg-white/15 px-2.5 py-1'>📮 郵便番号で検索</span>
          <span className='rounded-lg bg-white/15 px-2.5 py-1'>👥 候補者カードで比較</span>
          <span className='rounded-lg bg-white/15 px-2.5 py-1'>📋 公約比較表</span>
          <span className='rounded-lg bg-white/15 px-2.5 py-1'>🤖 AIで深掘り（プロンプト）</span>
        </div>
      </Link>

      {/* 中立性・法令の注意 */}
      <div className='mb-6 rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-xs leading-relaxed text-blue-800'>
        <p><span className='font-semibold'>中立性・出どころ:</span>{' '}
        候補者は公平に表示し、情報の出どころ（公式／本人入力／未確認）を明示します。比較は参考情報で、特定候補者への投票を推奨するものではありません。</p>
        <p className='mt-2'><span className='font-semibold'>寄付・選挙運動の注意:</span>{' '}
        寄付・応援の決済機能は本人確認・法務確認（政治資金規正法・公職選挙法等）後に提供します。
        <span className='font-semibold'>外国人・外国法人からの寄付、匿名寄付は禁止</span>です。
        また<span className='font-semibold'>有権者による電子メールでの選挙運動は禁止</span>のため、投票日リマインダーは中立的な情報通知に限定し、投票依頼は含めません。</p>
      </div>

      {/* 5メニュー */}
      <div className='space-y-4'>
        {MENU.map((m) => (
          <div key={m.n} className='rounded-2xl border border-gray-200 bg-white p-5'>
            <div className='mb-3 flex items-center gap-3'>
              <span className='flex h-10 w-10 items-center justify-center rounded-xl bg-gray-50 text-xl'>{m.icon}</span>
              <div>
                <h2 className='text-base font-bold text-gray-900'>{m.n}. {m.title}</h2>
                <p className='text-xs text-gray-500'>{m.lead}</p>
              </div>
            </div>
            <div className='grid gap-2 sm:grid-cols-2'>
              {m.items.map((it) => (
                <Link key={it.href + it.name} href={it.href} className='group flex items-start gap-2 rounded-xl border border-gray-200 p-3 transition-shadow hover:shadow-md'>
                  <span className='mt-1 h-2 w-2 shrink-0 rounded-full bg-blue-400' />
                  <div className='min-w-0 flex-1'>
                    <p className='text-sm font-medium text-gray-900'>{it.name}</p>
                    {it.note && <p className='mt-0.5 text-[11px] leading-relaxed text-gray-400'>{it.note}</p>}
                  </div>
                  <span className='shrink-0 text-xs text-gray-300 group-hover:text-blue-500'>→</span>
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* サブ */}
      <div className='mt-6'>
        <h3 className='mb-2 text-xs font-bold uppercase tracking-wide text-gray-400'>サブ・準備中</h3>
        <div className='flex flex-wrap items-center gap-2'>
          {SUB.map((it) => (
            <Link key={it.href} href={it.href} className='rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs font-medium text-gray-700 hover:bg-gray-50'>{it.name}</Link>
          ))}
          <span className='rounded-lg border border-dashed border-gray-300 px-3 py-2 text-xs text-gray-400'>投票日リマインダー（中立通知・準備中）</span>
        </div>
      </div>

      {/* 後回し（初期非表示） */}
      <div className='mt-8 rounded-xl border border-dashed border-gray-300 bg-gray-50/60 p-4'>
        <h3 className='mb-1 text-xs font-bold text-gray-500'>後回し機能（初期リリースでは非表示）</h3>
        <p className='mb-3 text-[11px] text-gray-400'>寄付・課金は法務確認後の第2段階。データ販売は法人向けフッターへ。（プロトは確認用に残置）</p>
        <div className='flex flex-wrap gap-2'>
          {DEFERRED.map((it) => (
            <Link key={it.href} href={it.href} className='rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-[11px] text-gray-400 hover:text-gray-600' title={it.note}>{it.name}</Link>
          ))}
        </div>
      </div>

      <p className='mt-6 text-center text-[11px] text-gray-400'>最優先の体験：診断 → 地域の課題 → 候補者比較。スマホ最優先・登録なしで使える範囲を広く。</p>
    </div>
  )
}
