/**
 * 【プロトタイプ】選挙AI相談室 / 公開質問ボード データ
 *
 * 共通スキーマ（型・テーマ・ステータス）は _qboard.ts（3アプリ同一）から取得。
 * ここには「テーマ別質問案バンク」と「シード（回答比較サンプル）」を置く。
 *
 * 注意: 本番は public_questions / public_question_votes / candidate_question_answers テーブル。
 *       質問の公開・統合・上位選定・送付は運営admin側で行う（即時公開しない）。
 */

import { THEMES, themeName, type PublicQuestion } from './_qboard'

// 共通スキーマの再エクスポート（既存の import 互換）
export { THEMES, themeName, Q_STATUS_COLOR, type PublicQuestion, type CandidateAnswer, type QuestionStatus, type AnswerStatus } from './_qboard'
export type Theme = (typeof THEMES)[number]

export const ADD_OPTIONS = [
  '現職4年間の実績を重視したい',
  '新人候補の実行力を見たい',
  '財源の具体性を重視したい',
  '候補者の説明責任を見たい',
  '公式情報・選挙公報をもとに比較したい',
]

// テーマ別 候補者への質問案（キーは THEMES.key）
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

// シード（公開質問ボードの初期表示。回答比較のサンプル含む）
// 正準スキーマ: themeKey / candidateId+candidateName / status は AnswerStatus（回答済み（公開）等）
export const SEED_QUESTIONS: PublicQuestion[] = [
  {
    id: 'q-seed-1', electionId: 'suginami-chiji', electionName: '杉並区長選挙', themeKey: 'zaisei',
    title: '杉並区の財政をどう評価し、どう改善しますか？', body: '今後4年間で、どの支出を増やし、どの支出を見直すか具体的に教えてください。',
    nickname: '区民A', voteCount: 142, status: '回答公開中', createdAt: '2026-06-20',
    answers: [
      { candidateId: '区民 一郎', candidateName: '区民 一郎', status: '回答済み（公開）', answerText: '扶助費の伸びを抑えつつ、防災・子育てへ重点配分します。' },
      { candidateId: '杉並 花子', candidateName: '杉並 花子', status: '回答済み（公開）', answerText: '保育・教育を最優先に、事業の優先順位を見直します。' },
      { candidateId: '高円寺 健', candidateName: '高円寺 健', status: '回答済み（公開）', answerText: '入札・契約の全面公開で年間10億円規模の削減を目指します。' },
      { candidateId: '阿佐ヶ谷 みどり', candidateName: '阿佐ヶ谷 みどり', status: '未回答' },
    ],
  },
  {
    id: 'q-seed-2', electionId: 'suginami-chiji', electionName: '杉並区長選挙', themeKey: 'bosai',
    title: '災害時の死者を減らすため、最初の1年で何を優先しますか？', body: '避難所環境・高齢者避難・要支援者支援の優先順位を教えてください。',
    nickname: '防災ママ', voteCount: 98, status: '候補者へ送付済み', createdAt: '2026-06-21',
    answers: [
      { candidateId: '区民 一郎', candidateName: '区民 一郎', status: '回答済み（公開）', answerText: '全避難所への電源・備蓄整備を1年で着手します。' },
      { candidateId: '杉並 花子', candidateName: '杉並 花子', status: '回答済み（公開）', answerText: '要支援者の個別避難計画づくりを優先します。' },
      { candidateId: '高円寺 健', candidateName: '高円寺 健', status: '未回答' },
      { candidateId: '阿佐ヶ谷 みどり', candidateName: '阿佐ヶ谷 みどり', status: '回答済み（公開）', answerText: '地域の共助・子ども食堂ネットワークを防災にも活かします。' },
    ],
  },
  {
    id: 'q-seed-3', electionId: 'suginami-chiji', electionName: '杉並区長選挙', themeKey: 'kosodate',
    title: '最初の1年で実行する子育て政策は何ですか？', body: '財源とあわせて、最優先の施策を教えてください。',
    nickname: '匿名', voteCount: 76, status: '公開中', createdAt: '2026-06-23',
  },
  {
    id: 'q-seed-4', electionId: 'suginami-chiji', electionName: '杉並区長選挙', themeKey: 'dx',
    title: '区役所手続きのどこを最初にデジタル化しますか？', body: '住民の待ち時間短縮につながる施策を具体的に。',
    nickname: 'DX好き', voteCount: 41, status: '運営確認中', createdAt: '2026-06-25',
  },
  {
    id: 'q-seed-5', electionId: 'osaka-chiji', electionName: '大阪府知事選挙', themeKey: 'dx',
    title: '二重行政の解消と行政DXを具体的にどう進めますか？', body: '最初の1年で着手することを教えてください。',
    nickname: '府民B', voteCount: 120, status: '回答公開中', createdAt: '2026-06-22',
    answers: [
      { candidateId: '伊藤 さやか', candidateName: '伊藤 さやか', status: '回答済み（公開）', answerText: '手続きの9割オンライン化を工程化します。' },
      { candidateId: '森本 太一', candidateName: '森本 太一', status: '回答済み（公開）', answerText: '広域連携で重複事業を整理します。' },
      { candidateId: '大阪 直子', candidateName: '大阪 直子', status: '未回答' },
    ],
  },
  {
    id: 'q-seed-6', electionId: 'osaka-chiji', electionName: '大阪府知事選挙', themeKey: 'kosodate',
    title: '子育て支援の所得制限撤廃の財源はどこから確保しますか？', body: '',
    nickname: '匿名', voteCount: 64, status: '候補者へ送付済み', createdAt: '2026-06-24',
    answers: [
      { candidateId: '伊藤 さやか', candidateName: '伊藤 さやか', status: '未回答' },
      { candidateId: '森本 太一', candidateName: '森本 太一', status: '回答済み（公開）', answerText: '歳出の優先順位見直しで対応します。' },
      { candidateId: '大阪 直子', candidateName: '大阪 直子', status: '回答済み（公開）', answerText: '既存事業の再編と国制度の活用で確保します。' },
    ],
  },
]
