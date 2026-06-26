import Link from 'next/link'

const PROTOTYPES = [
  {
    href: '/prototype/prefecture-kpi',
    title: '都道府県別 課題・KPI',
    status: '作業中',
    description:
      '都道府県ごとの政治課題・目標KPIを可視化。有権者が「自分の地域の課題」を知れるSEOコンテンツ。政策ランキング・候補者への導線になる。',
    notes: ['47都道府県セレクタ + 課題リスト + KPI（現状→目標・達成状況）', '関連政策テーマへのリンク。本番: 政府統計API（e-Stat）に自動接続'],
  },
  {
    href: '/prototype/premium',
    title: '候補者プレミアムプラン（マネタイズ①②）',
    status: '作業中',
    description:
      '候補者向け有料プロフィール強化プラン（フリー / スタンダード¥2,980 / プレミアム¥9,800）と、政策クラウドファンディング手数料体系（3〜5%）のプロトタイプ。',
    notes: ['プラン比較表 + モック申込フロー', 'クラファン手数料体系（寄付成立分のみ課金）。本番: Stripe + subscriptions テーブル'],
  },
  {
    href: '/prototype/data-report',
    title: 'データレポート販売（マネタイズ③）',
    status: '作業中',
    description:
      '政策関心・賛否・寄付傾向データを研究機関・メディア・自治体向けにレポート販売。地域別・政策別・有権者属性別の6種類を掲載。法人向けAPI提供も想定。',
    notes: ['レポート一覧（カテゴリ絞り込み）+ モック購入フロー', '本番: Stripe + S3署名付きURL でダウンロード提供'],
  },
  {
    href: '/prototype/ranking',
    title: '地域×政策ランキング',
    status: '作業中',
    description:
      '全国・都道府県・市区町村別に「どの政策への関心が高いか」を可視化。今週のトレンドや都道府県別1位マップも表示。SEO・SNS拡散コンテンツ。',
    notes: ['全国/都道府県/市区町村タブで切替', '政策関心ランキング + 今週のトレンド（本番: policy_votes 地域別集計）'],
  },
  {
    href: '/prototype/notify',
    title: '選挙前通知設定',
    status: '作業中',
    description:
      '投票日が近づいたらメール / LINE / プッシュ通知でリマインドする設定画面。「忘れて投票に行けなかった」を防ぐリテンション機能。',
    notes: ['通知チャネル（メール/LINE/プッシュ）・対象選挙・タイミング・地域を設定', 'LINE友だち追加 / ブラウザ通知許可フロー（本番: notifications テーブル + 配信API）'],
  },
  {
    href: '/prototype/vision',
    title: '日本のあるべき姿（国家ビジョン）',
    status: '作業中',
    description:
      '政策・候補者を選ぶ前に「どんな日本をめざすか」を示す国家ビジョン（6本柱）。超党派で評価できる軸として提示し、政策テーマ・KPIに接続。',
    notes: ['6本柱（命を守る/稼げる/次世代/透明/自由と責任/世界信頼）', '各柱から関連政策へ遷移。KPI・他国比較へも導線'],
  },
  {
    href: '/prototype/kpi',
    title: '日本の未来KPI',
    status: '作業中',
    description:
      'ビジョンを分野別KPI（現状→目標）に落とし込み、政策と紐づける。候補者が目標を掲げているかを見る軸。',
    notes: ['10分野のKPI（目標方向・年限）', '各KPIから関連政策へ。本番は政府統計に接続'],
  },
  {
    href: '/prototype/compare-countries',
    title: '世界と比べる日本',
    status: '作業中',
    description:
      '分野別に各国（日本/台湾/星/愛沙尼亜/米/北欧）を比較。海外礼賛でなく「真似るべき／日本独自に進めるべき」を見極める。',
    notes: ['◎○△× の分野別比較表', '日本が参考にできる制度。本番は候補者がどの国モデルに近いかも'],
  },
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
    href: '/prototype/election',
    title: '●●選挙 候補者一覧（CSV取込＋比較）',
    status: '作業中',
    description:
      '個別選挙（例: 杉並区長選挙）の候補者をCSVで取り込み、3つの軸で比較する画面。軸1 政策の重点（あなたの関心との一致）/ 軸2 実行力・現実性（財源・実績）/ 軸3 透明性・信頼。',
    notes: [
      'CSV貼り付け/ファイル選択/サンプル投入で候補者を反映',
      '3軸の比較表＋診断との関心一致。本番は管理画面でCSV→DB取込',
    ],
  },
  {
    href: '/prototype/recurring',
    title: '月額で応援する（定期支援）',
    status: '作業中',
    description:
      '有権者が政策を「毎月の定期支援（サブスク）」で応援できる画面。金額・配分を選んで登録、一覧・解約も。受け取りはプラットフォーム集約（決済代行）方式。',
    notes: [
      '月額プラン（500/1000/3000/10000）＋配分、お支払い情報（プロトはカード非対応）',
      '支援ID発行・一覧・解約。本番は決済代行のクレカ定期課金＋本人確認',
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
