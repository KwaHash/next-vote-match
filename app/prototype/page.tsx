import Link from 'next/link'

const PROTOTYPES = [
  {
    href: '/prototype/match',
    title: '政策マッチング診断',
    status: '作業中',
    description:
      '有権者が大事にしたい政策を選び、「あなたの選び方タイプ（動物キャラ）」と近い政策テーマを知る診断。政党名より先にタイプを出す（対立を避ける構想方針）。未ログインで使える。',
    notes: [
      '10テーマの重要度に答える（30秒・登録不要）',
      '結果は動物キャラのタイプ＋近い政策テーマ（％）＋シェア導線',
      '計算はクライアント側ルールベース（LLM不使用＝コスト方針）',
    ],
  },
  {
    href: '/prototype/candidates',
    title: '候補者一覧・検索',
    status: '作業中',
    description:
      '選挙種別（衆/参/知事/県議/首長/市議）・地域・政党・現職新人で候補者を絞り込み、政策診断との一致率・透明化スコアで比較する画面。',
    notes: [
      '全選挙種別を level（国/都道府県/市区町村）で構造化',
      '診断結果と連動して「あなたとの一致率」を表示・一致率順に並べ替え',
      'データ出どころ（公式取込/本人入力済み）を可視化。本番は politicians×elections×candidacies',
    ],
  },
  {
    href: '/prototype/policies',
    title: '政策一覧・政策別寄付',
    status: '作業中',
    description:
      '「政党」ではなく「課題」から政策を見て、支援状況を確認し、政策単位で寄付・応援できる画面。詳細ページで課題・解決案・賛同候補・地域配分を見て寄付できる。',
    notes: [
      '課題から政策を一覧（診断済みなら関心テーマを上位表示）',
      '政策詳細で課題/解決案/支援状況/賛同候補/地域配分を表示',
      '政策別に寄付（今回だけ/月額・配分指定）→ Donation ID 発行（本番は本人確認・決済）',
    ],
  },
  {
    href: '/prototype/dashboard',
    title: '透明化ダッシュボード',
    status: '作業中',
    description:
      '集まった寄付が、何に・どこで・どんな成果に使われたかを公開する画面（ログイン不要）。「寄付して終わり」でなく使い道が見えることが最大の差別化点。',
    notes: [
      '総額/支援者数/支出済み/未使用残高、支出分類、地域別配分を可視化',
      '政策別の支援状況・成果一覧（Impact ID）・月次レポート',
      '本番は寄付ID(DON)→支出ID(EXP)→成果ID(IMP)を紐づけ自動集計',
    ],
  },
  {
    href: '/prototype/report',
    title: 'あなたの寄付レポート',
    status: '作業中',
    description:
      '自分の寄付が、どの政策に・どう配分され・どう使われ・どんな成果になったかを Donation ID 単位で確認する画面。',
    notes: [
      '政策別寄付ページでの寄付（DON-ID）ごとに使途・残高を表示',
      '地域配分・使途・成果を表示（本番は donations→allocations→expenses→impacts）',
    ],
  },
  {
    href: '/prototype/compare',
    title: '候補者比較',
    status: '作業中',
    description:
      '候補者を最大3名まで選び、政党・選挙種別・地域・一致率・透明化・注力政策を並べて比較する画面。候補者一覧の各候補から個別詳細ページにも遷移できる。',
    notes: [
      '候補者を追加して比較表を表示',
      '候補者一覧 → 個別詳細ページ（公約/実績/政治資金透明化/SNS）も実装',
    ],
  },
]

export default function PrototypeIndexPage() {
  return (
    <div className='mx-auto w-full max-w-3xl px-4 py-10'>
      <div className='mb-8'>
        <div className='mb-3 inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-600'>
          <span className='h-1.5 w-1.5 rounded-full bg-blue-500' />
          プロトタイプ一覧 / 国民向け seijiselect.jp
        </div>
        <h1 className='text-2xl font-bold text-gray-900'>実装前プロトタイプ</h1>
        <p className='mt-2 text-sm leading-relaxed text-gray-500'>
          国民向け seijiselect.jp の「動く仕様書」です。UIとデータフローの確認用で、データはブラウザ内（localStorage）に保存されます。
          開発者はコードを参考に本番品質で実装し直してください。
        </p>
      </div>

      <div className='space-y-4'>
        {PROTOTYPES.map((proto) => (
          <Link key={proto.href} href={proto.href} className='block rounded-xl border border-gray-200 bg-white p-5 transition-shadow hover:shadow-md'>
            <div className='mb-3 flex flex-wrap items-center gap-2'>
              <h2 className='text-base font-bold text-gray-900'>{proto.title}</h2>
              <span className='rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-700'>国民向け</span>
              <span className='rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-medium text-amber-700'>{proto.status}</span>
            </div>
            <p className='mb-3 text-sm leading-relaxed text-gray-600'>{proto.description}</p>
            <ul className='space-y-1'>
              {proto.notes.map((note) => (
                <li key={note} className='flex items-start gap-2 text-xs text-gray-500'>
                  <span className='mt-0.5 text-gray-300'>•</span>
                  {note}
                </li>
              ))}
            </ul>
            <div className='mt-4 text-xs font-medium text-blue-600'>画面を見る →</div>
          </Link>
        ))}
      </div>

      <div className='mt-10 rounded-xl border border-gray-100 bg-gray-50 px-4 py-4 text-xs leading-relaxed text-gray-500'>
        <p className='mb-1 font-semibold text-gray-700'>開発者向けメモ</p>
        <p>
          プロトタイプ画面は <code className='rounded bg-gray-100 px-1 font-mono'>app/prototype/</code> 配下に集約。
          政治家向けは別リポジトリ <code className='rounded bg-gray-100 px-1 font-mono'>candidate-vote-match</code> にあります。
          本番は診断を <code className='rounded bg-gray-100 px-1 font-mono'>/match</code> に統合する想定。
        </p>
      </div>
    </div>
  )
}
