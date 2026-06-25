/**
 * AIチャット よくある質問（FAQ）定義
 *
 * 目的: 同じ質問が何万回も飛んでも AI API は初回のみ呼ぶ。
 *       2回目以降は DB（ai_response_cache）のキャッシュを返す。
 *
 * 追加方法: ここに質問を足す → 初回アクセス時に自動キャッシュ。
 */

export interface FaqQuestion {
  id: string       // DB cache key。変更禁止（変えるとキャッシュ無効化）
  prompt: string   // AIに送る質問文（そのままキャッシュキーになる）
  label: string    // ボタンに表示する短いラベル
}

export interface FaqCategory {
  id: string
  name: string
  emoji: string
  questions: FaqQuestion[]
}

export const AI_FAQ_CATEGORIES: FaqCategory[] = [
  {
    id: 'vote-howto',
    name: '投票の仕方',
    emoji: '🗳️',
    questions: [
      {
        id: 'faq-vote-day',
        label: '当日の流れ',
        prompt: '選挙当日の投票所での流れを、初めて投票する人にも分かるよう step by step で教えてください。',
      },
      {
        id: 'faq-vote-early',
        label: '期日前投票',
        prompt: '期日前投票はいつ・どこで・どのような手続きでできますか？仕事で当日行けない場合の対策も教えてください。',
      },
      {
        id: 'faq-vote-absent',
        label: '旅行・出張中は？',
        prompt: '選挙期間中に旅行や出張で自分の選挙区に居ない場合でも投票できますか？不在者投票の方法を教えてください。',
      },
      {
        id: 'faq-vote-age',
        label: '投票年齢・資格',
        prompt: '日本で選挙権が得られる年齢や条件を教えてください。また、18歳が選挙権を持つようになった経緯も教えてください。',
      },
    ],
  },
  {
    id: 'election-system',
    name: '選挙制度',
    emoji: '🏛️',
    questions: [
      {
        id: 'faq-house-diff',
        label: '衆議院と参議院の違い',
        prompt: '衆議院と参議院の違い（任期・選出方法・役割・権限）を分かりやすく教えてください。',
      },
      {
        id: 'faq-single-prop',
        label: '小選挙区と比例代表',
        prompt: '衆議院選挙の小選挙区制と比例代表制の違い、両方に投票する意味を教えてください。',
      },
      {
        id: 'faq-election-types',
        label: '選挙の種類一覧',
        prompt: '日本にはどんな種類の選挙があり、それぞれ何年おきに行われますか？一覧で教えてください。',
      },
      {
        id: 'faq-dissolution',
        label: '衆議院解散とは',
        prompt: '衆議院の解散はどのような場合に行われますか？総理大臣が解散できる仕組みと過去の例を教えてください。',
      },
    ],
  },
  {
    id: 'how-to-choose',
    name: '候補者の選び方',
    emoji: '🔍',
    questions: [
      {
        id: 'faq-choose-criteria',
        label: '選ぶ基準は？',
        prompt: '候補者や政党を選ぶとき、どのような基準で判断すると良いですか？政策・人物・実績の見方を教えてください。',
      },
      {
        id: 'faq-manifesto',
        label: 'マニフェストの見方',
        prompt: '政党や候補者のマニフェスト（政策公約）はどこで確認でき、どのように読み解けばよいですか？',
      },
      {
        id: 'faq-party-compare',
        label: '主要政党の比較',
        prompt: '日本の主要政党（自民・立民・維新・公明・国民民主・共産・れいわ・社民）の政策の違いを経済・社会保障・安全保障の3軸で中立的に比較してください。',
      },
    ],
  },
  {
    id: 'participation',
    name: '政治参加',
    emoji: '🙋',
    questions: [
      {
        id: 'faq-turnout',
        label: '投票率が低い理由',
        prompt: '日本の選挙投票率が低い主な原因と、世界の高投票率国と比べた違いを教えてください。',
      },
      {
        id: 'faq-young-voice',
        label: '若者の意見を届けるには',
        prompt: '若者が選挙以外で政治に声を届ける方法（請願・パブリックコメント・SNS等）を教えてください。',
      },
      {
        id: 'faq-fake-news',
        label: '政治のフェイクニュース対策',
        prompt: '選挙に関するフェイクニュースや誤情報を見分けるためのポイントと、信頼できる情報源を教えてください。',
      },
    ],
  },
]

/** 全FAQ質問をフラットに取得するユーティリティ */
export function getAllFaqQuestions(): FaqQuestion[] {
  return AI_FAQ_CATEGORIES.flatMap(cat => cat.questions)
}
