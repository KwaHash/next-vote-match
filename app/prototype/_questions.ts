/**
 * 【プロトタイプ】選挙AI相談室 / 公開質問ボード 共有データ
 *
 * - 重視テーマ・追加オプション・テーマ別の質問案バンク
 * - 公開質問ボードの型・ステータス・シード（候補者回答の比較サンプル含む）
 *
 * 注意: 本番は public_questions / public_question_votes / candidate_question_answers テーブル。
 *       質問の公開・統合・上位選定・送付は運営admin側で行う（即時公開しない）。
 */

export interface Theme { key: string; name: string }
export const THEMES: Theme[] = [
  { key: 'kosodate', name: '子育て・教育' },
  { key: 'bosai', name: '防災・安全' },
  { key: 'zaisei', name: '財政・税金' },
  { key: 'dx', name: '行政改革・DX' },
  { key: 'fukushi', name: '福祉・高齢者' },
  { key: 'machi', name: 'まちづくり・交通' },
  { key: 'clean', name: '透明性・政治姿勢' },
]
export const themeName = (key: string) => THEMES.find((t) => t.key === key)?.name ?? key

export const ADD_OPTIONS = [
  '現職4年間の実績を重視したい',
  '新人候補の実行力を見たい',
  '財源の具体性を重視したい',
  '候補者の説明責任を見たい',
  '公式情報・選挙公報をもとに比較したい',
]

// テーマ別 候補者への質問案
export const QUESTION_BANK: Record<string, string[]> = {
  kosodate: [
    '保育・教育予算を今後4年間でどう増やしますか？',
    '子育て支援の財源はどこから確保しますか？',
    '最初の1年で実行する子育て政策は何ですか？',
    '学校・給食・通学安全で最優先に改善することは何ですか？',
    '既存の子育て政策と、今回の公約は何が違いますか？',
  ],
  bosai: [
    '首都直下地震への備えとして、最初の1年で何を実行しますか？',
    '避難所環境、高齢者避難、要支援者支援をどう改善しますか？',
    '災害時の死者を減らすために、区長・市長として何を優先しますか？',
    '防災対策の財源はどこから確保しますか？',
    '水害・地震・停電への備えをどのKPIで測りますか？',
  ],
  zaisei: [
    '自治体の財政状況をどのように評価していますか？',
    '今後4年間で、どの支出を増やし、どの支出を見直しますか？',
    '新しい政策の財源はどこから確保しますか？',
    '住民負担が増える可能性はありますか？',
    '税金の使い道をどのように透明化しますか？',
  ],
  dx: [
    '行政改革・DXで、何を削減し、何を改善しますか？',
    '区役所・市役所手続きのどこをデジタル化しますか？',
    'AIやデータ活用を自治体運営にどう取り入れますか？',
    '住民サービス向上と職員負担軽減をどう両立しますか？',
    '行政改革の成果をどのKPIで測りますか？',
  ],
  fukushi: [
    '高齢者の孤独・介護・移動支援をどう改善しますか？',
    '介護人材不足にどう対応しますか？',
    '障害者や生活困窮者への支援をどう強化しますか？',
    '福祉政策の財源はどこから確保しますか？',
    '地域コミュニティを維持するために何をしますか？',
  ],
  machi: [
    'まちづくり・交通で最初の1年に実行することは何ですか？',
    '公共交通・移動の不便をどう解消しますか？',
    '中心市街地・商店街の活性化策は何ですか？',
    '老朽インフラの更新と財源をどう確保しますか？',
    'まちづくりの成果をどのKPIで測りますか？',
  ],
  clean: [
    '政治資金・活動費をどこまで公開しますか？',
    '意思決定の透明性をどう高めますか？',
    '利害関係（関連団体・献金者）をどう開示しますか？',
    '住民への説明責任をどのように果たしますか？',
    '公約の進捗をどのように公開・報告しますか？',
  ],
}

export type QStatus = '運営確認中' | '公開中' | '上位質問入り' | '候補者へ送付済み' | '回答受付中' | '回答公開中' | '非公開'
export const Q_STATUS_COLOR: Record<QStatus, string> = {
  運営確認中: 'bg-amber-50 text-amber-700',
  公開中: 'bg-emerald-50 text-emerald-700',
  上位質問入り: 'bg-blue-100 text-blue-700',
  候補者へ送付済み: 'bg-violet-50 text-violet-700',
  回答受付中: 'bg-indigo-50 text-indigo-700',
  回答公開中: 'bg-slate-800 text-white',
  非公開: 'bg-gray-200 text-gray-500',
}

export interface CandidateAnswer { candidate: string; status: '回答済み' | '未回答' | '回答辞退' | '対象外'; answer?: string }
export interface PublicQuestion {
  id: string
  electionId: string
  electionName: string
  title: string
  body: string
  category: string // テーマ名
  nickname?: string
  voteCount: number
  status: QStatus
  answers?: CandidateAnswer[]
  createdAt: string
}

// シード（公開質問ボードの初期表示。回答比較のサンプル含む）
export const SEED_QUESTIONS: PublicQuestion[] = [
  {
    id: 'q-seed-1', electionId: 'suginami-chiji', electionName: '杉並区長選挙', category: '財政・税金',
    title: '杉並区の財政をどう評価し、どう改善しますか？', body: '今後4年間で、どの支出を増やし、どの支出を見直すか具体的に教えてください。',
    nickname: '区民A', voteCount: 142, status: '回答公開中', createdAt: '2026-06-20',
    answers: [
      { candidate: '区民 一郎', status: '回答済み', answer: '扶助費の伸びを抑えつつ、防災・子育てへ重点配分します。' },
      { candidate: '杉並 花子', status: '回答済み', answer: '保育・教育を最優先に、事業の優先順位を見直します。' },
      { candidate: '高円寺 健', status: '回答済み', answer: '入札・契約の全面公開で年間10億円規模の削減を目指します。' },
      { candidate: '阿佐ヶ谷 みどり', status: '未回答' },
    ],
  },
  {
    id: 'q-seed-2', electionId: 'suginami-chiji', electionName: '杉並区長選挙', category: '防災・安全',
    title: '災害時の死者を減らすため、最初の1年で何を優先しますか？', body: '避難所環境・高齢者避難・要支援者支援の優先順位を教えてください。',
    nickname: '防災ママ', voteCount: 98, status: '候補者へ送付済み', createdAt: '2026-06-21',
    answers: [
      { candidate: '区民 一郎', status: '回答済み', answer: '全避難所への電源・備蓄整備を1年で着手します。' },
      { candidate: '杉並 花子', status: '回答済み', answer: '要支援者の個別避難計画づくりを優先します。' },
      { candidate: '高円寺 健', status: '未回答' },
      { candidate: '阿佐ヶ谷 みどり', status: '回答済み', answer: '地域の共助・子ども食堂ネットワークを防災にも活かします。' },
    ],
  },
  {
    id: 'q-seed-3', electionId: 'suginami-chiji', electionName: '杉並区長選挙', category: '子育て・教育',
    title: '最初の1年で実行する子育て政策は何ですか？', body: '財源とあわせて、最優先の施策を教えてください。',
    nickname: '匿名', voteCount: 76, status: '公開中', createdAt: '2026-06-23',
  },
  {
    id: 'q-seed-4', electionId: 'suginami-chiji', electionName: '杉並区長選挙', category: '行政改革・DX',
    title: '区役所手続きのどこを最初にデジタル化しますか？', body: '住民の待ち時間短縮につながる施策を具体的に。',
    nickname: 'DX好き', voteCount: 41, status: '運営確認中', createdAt: '2026-06-25',
  },
]
