/**
 * 【プロトタイプ共通データ】国民向け seijiselect.jp
 * 政策テーマ・地域階層・選挙種別・サンプル候補者。
 * 本番では DB の policies / regions / elections / candidacies テーブルへ。
 */

export type RegionLevel = 'national' | 'prefecture' | 'municipality'

export const REGION_LEVELS: { value: RegionLevel; label: string }[] = [
  { value: 'national', label: '国会・国政' },
  { value: 'prefecture', label: '都道府県' },
  { value: 'municipality', label: '市区町村' },
]

export interface PolicyTheme {
  id: string
  name: string
  emoji: string
  animal: string // 診断結果の「あなたのタイプ」動物キャラ（構想の方針）
  summary: string
  question: string // 診断での問いかけ
  challenge: string // 現状課題
  solution: string // 解決案
  budget: number // 必要予算（円）
  raised: number // 集まった支援額（円）
  supporters: number // 支援者数
  // 政策別の初期配分（%）: 市区町村 / 都道府県 / 国会（全体構想 6章より）
  allocation: { municipality: number; prefecture: number; national: number }
}

export const POLICY_THEMES: PolicyTheme[] = [
  { id: 'bosai', name: '防災・災害死ゼロ', emoji: '🛟', animal: 'ビーバー', summary: '災害で命を落とさない社会へ', question: '防災・災害対策に力を入れてほしい', challenge: '避難所の電源・通信・トイレが不足している', solution: '蓄電池・通信・簡易トイレを優先配備し、災害死ゼロをめざす', budget: 5000000, raised: 2300000, supporters: 412, allocation: { municipality: 40, prefecture: 35, national: 25 } },
  { id: 'nettyusho', name: '高齢者熱中症対策', emoji: '🌡️', animal: 'コアラ', summary: '高齢者を熱中症から守る', question: '高齢者の熱中症・健康対策を進めてほしい', challenge: '独居高齢者の熱中症搬送が年々増加している', solution: '見守り・冷房費補助・涼み所の整備を進める', budget: 3000000, raised: 980000, supporters: 230, allocation: { municipality: 50, prefecture: 30, national: 20 } },
  { id: 'kotsu', name: '交通事故削減', emoji: '🚸', animal: 'カメ', summary: '交通事故ゼロをめざす', question: '交通事故を減らす取り組みを強めてほしい', challenge: '通学路・生活道路での事故が後を絶たない', solution: '危険箇所の改良とゾーン30の拡大', budget: 2500000, raised: 1100000, supporters: 180, allocation: { municipality: 45, prefecture: 35, national: 20 } },
  { id: 'kosodate', name: '子育て・教育', emoji: '🎒', animal: 'ペンギン', summary: '子育て・教育を社会で支える', question: '子育て・教育支援を拡充してほしい', challenge: '教育費の負担と待機児童が課題', solution: '給食無償化・保育の受け皿拡大', budget: 8000000, raised: 4600000, supporters: 905, allocation: { municipality: 40, prefecture: 30, national: 30 } },
  { id: 'nyusatsu', name: '入札透明化', emoji: '🔍', animal: 'タカ', summary: '税金の使い道を透明に', question: '政治とお金・入札の透明化を進めてほしい', challenge: '入札の不透明さ・談合リスクへの不信', solution: '入札データの公開と第三者チェックの仕組み', budget: 2000000, raised: 1450000, supporters: 333, allocation: { municipality: 45, prefecture: 35, national: 20 } },
  { id: 'ai-gyosei', name: 'AI行政改革', emoji: '🤖', animal: 'フクロウ', summary: 'AIで行政を効率化', question: 'AIやデジタルで行政を効率化してほしい', challenge: '行政手続きが煩雑で時間とコストがかかる', solution: 'AI窓口・申請のデジタル化で待ち時間を削減', budget: 4000000, raised: 1200000, supporters: 210, allocation: { municipality: 30, prefecture: 30, national: 40 } },
  { id: 'jinken', name: '人権外交', emoji: '🕊️', animal: 'ハト', summary: '人権を大切にする外交', question: '人権を重視した外交を進めてほしい', challenge: '国際的な人権課題への発信が弱い', solution: '人権を重視した外交方針の確立と発信', budget: 3500000, raised: 620000, supporters: 150, allocation: { municipality: 5, prefecture: 10, national: 85 } },
  { id: 'energy', name: 'エネルギー・蓄電池', emoji: '🔋', animal: 'リス', summary: 'エネルギーの安定と脱炭素', question: 'エネルギー・蓄電池に投資してほしい', challenge: '電力の安定供給と電気代高騰', solution: '蓄電池・再エネの地域導入を支援', budget: 6000000, raised: 2800000, supporters: 388, allocation: { municipality: 20, prefecture: 30, national: 50 } },
  { id: 'chiho-zaisei', name: '地方財政改革', emoji: '🏛️', animal: 'アリ', summary: '地方の財政を立て直す', question: '地方財政の改革を進めてほしい', challenge: '地方財政のひっ迫で住民サービスが縮小', solution: '歳出の見直しと自主財源の確保', budget: 4500000, raised: 1000000, supporters: 175, allocation: { municipality: 30, prefecture: 30, national: 40 } },
  { id: 'kanko', name: '観光・温泉振興', emoji: '♨️', animal: 'イルカ', summary: '観光・温泉で地域を元気に', question: '観光・温泉で地域を元気にしてほしい', challenge: '観光客の減少と地域経済の停滞', solution: '温泉・体験観光の魅力発信と受け入れ整備', budget: 3000000, raised: 1700000, supporters: 264, allocation: { municipality: 35, prefecture: 35, national: 30 } },
]

// 選挙種別（全種別を level=地域階層に紐づける。本番は elections テーブル）
export const ELECTION_TYPES: { value: string; label: string; level: RegionLevel }[] = [
  { value: 'shugiin', label: '衆議院議員', level: 'national' },
  { value: 'sangiin', label: '参議院議員', level: 'national' },
  { value: 'chiji', label: '都道府県知事', level: 'prefecture' },
  { value: 'kengi', label: '都道府県議会議員', level: 'prefecture' },
  { value: 'shucho', label: '市区町村長', level: 'municipality' },
  { value: 'shigi', label: '市区町村議会議員', level: 'municipality' },
]

export type CandidateStatus = '現職' | '新人' | '元職'
export type DataSource = 'official' | 'self' // 公式取込 / 本人入力済み

// サンプル候補者（架空の氏名・実在政党。本番は politicians × candidacies × elections）
export interface PrototypeCandidate {
  id: number
  name: string
  party: string
  electionType: string
  region: string
  district: string
  status: CandidateStatus
  themes: string[]
  transparency: number
  source: DataSource
}

export const SAMPLE_CANDIDATES: PrototypeCandidate[] = [
  { id: 1, name: '田中 一郎', party: '自民党', electionType: 'shugiin', region: '東京都', district: '東京1区', status: '現職', themes: ['bosai', 'ai-gyosei'], transparency: 72, source: 'official' },
  { id: 2, name: '鈴木 美咲', party: '中道改革', electionType: 'shugiin', region: '東京都', district: '東京2区', status: '新人', themes: ['kosodate', 'nyusatsu'], transparency: 60, source: 'self' },
  { id: 3, name: '井上 拓海', party: '国民民主党', electionType: 'shugiin', region: '大阪府', district: '大阪5区', status: '元職', themes: ['ai-gyosei', 'energy'], transparency: 67, source: 'official' },
  { id: 4, name: '佐藤 健太', party: '国民民主党', electionType: 'sangiin', region: '比例', district: '比例代表', status: '現職', themes: ['energy', 'chiho-zaisei'], transparency: 85, source: 'self' },
  { id: 5, name: '高橋 由美', party: 'みらい', electionType: 'sangiin', region: '神奈川県', district: '神奈川県選挙区', status: '新人', themes: ['kosodate', 'jinken'], transparency: 55, source: 'official' },
  { id: 6, name: '渡辺 隆', party: '無所属', electionType: 'chiji', region: '北海道', district: '北海道', status: '現職', themes: ['bosai', 'kanko'], transparency: 90, source: 'self' },
  { id: 7, name: '伊藤 さやか', party: '日本維新', electionType: 'chiji', region: '大阪府', district: '大阪府', status: '新人', themes: ['ai-gyosei', 'chiho-zaisei'], transparency: 68, source: 'official' },
  { id: 8, name: '山本 大輔', party: '自民党', electionType: 'kengi', region: '愛知県', district: '名古屋市北区', status: '現職', themes: ['kotsu', 'bosai'], transparency: 64, source: 'official' },
  { id: 9, name: '中村 香織', party: 'れいわ新選', electionType: 'kengi', region: '福岡県', district: '福岡市東区', status: '新人', themes: ['jinken', 'kosodate'], transparency: 58, source: 'self' },
  { id: 10, name: '木村 彩', party: '中道改革', electionType: 'kengi', region: '東京都', district: '世田谷区', status: '新人', themes: ['nyusatsu', 'ai-gyosei'], transparency: 59, source: 'self' },
  { id: 11, name: '小林 誠', party: '参政党', electionType: 'shucho', region: '静岡県', district: '熱海市', status: '現職', themes: ['kanko', 'nettyusho'], transparency: 76, source: 'self' },
  { id: 12, name: '加藤 真理', party: '無所属', electionType: 'shucho', region: '長野県', district: '軽井沢町', status: '新人', themes: ['kanko', 'energy'], transparency: 62, source: 'official' },
  { id: 13, name: '吉田 翔', party: '社民党', electionType: 'shigi', region: '東京都', district: '渋谷区', status: '現職', themes: ['kosodate', 'jinken'], transparency: 70, source: 'official' },
  { id: 14, name: '松本 直子', party: '日本保守党', electionType: 'shigi', region: '東京都', district: '世田谷区', status: '新人', themes: ['bosai', 'nettyusho'], transparency: 53, source: 'self' },
]

// ===== 国家ビジョン軸（追加要望 2026-06-20） =====

// 日本のあるべき姿（6本柱）
export interface Vision {
  id: string
  no: number
  title: string
  emoji: string
  desc: string
  themeIds: string[] // 関連政策テーマ
}

export const VISIONS: Vision[] = [
  { id: 'life', no: 1, title: '命を守る国', emoji: '🛟', desc: '防災・医療・交通事故・熱中症・自殺対策', themeIds: ['bosai', 'nettyusho', 'kotsu'] },
  { id: 'earn', no: 2, title: '稼げる国', emoji: '💹', desc: '産業・AI・エネルギー・観光・地方経済', themeIds: ['ai-gyosei', 'energy', 'kanko', 'chiho-zaisei'] },
  { id: 'next', no: 3, title: '次世代を育てる国', emoji: '🎒', desc: '教育・子育て・若者支援・少子化対策', themeIds: ['kosodate'] },
  { id: 'clean', no: 4, title: '透明で信頼できる国', emoji: '🔍', desc: '政治資金・入札・行政・議会活動の透明化', themeIds: ['nyusatsu', 'ai-gyosei'] },
  { id: 'freedom', no: 5, title: '自由と責任が両立する国', emoji: '⚖️', desc: '個人の挑戦・地域自治・財政規律・社会保障', themeIds: ['chiho-zaisei'] },
  { id: 'world', no: 6, title: '世界から信頼される国', emoji: '🕊️', desc: '人権外交・安全保障・国際競争力', themeIds: ['jinken'] },
]

// 日本の未来KPI
export interface NationalKPI {
  id: string
  category: string
  name: string
  current: string
  target: string
  themeId: string
}

export const NATIONAL_KPIS: NationalKPI[] = [
  { id: 'k1', category: '防災', name: '災害関連死', current: '集計中', target: '10年で半減', themeId: 'bosai' },
  { id: 'k2', category: '交通', name: '交通事故死者数', current: '集計中', target: '10年で半減', themeId: 'kotsu' },
  { id: 'k3', category: '教育', name: '子どもの学力・非認知能力', current: '集計中', target: 'OECD上位', themeId: 'kosodate' },
  { id: 'k4', category: '少子化', name: '合計特殊出生率', current: '集計中', target: '反転', themeId: 'kosodate' },
  { id: 'k5', category: '財政', name: '国・地方債務残高GDP比', current: '集計中', target: '安定化', themeId: 'chiho-zaisei' },
  { id: 'k6', category: '行政', name: '行政手続オンライン完結率', current: '集計中', target: '90%以上', themeId: 'ai-gyosei' },
  { id: 'k7', category: '政治', name: '政治資金公開の即時性', current: '年次中心', target: '月次・リアルタイム化', themeId: 'nyusatsu' },
  { id: 'k8', category: '地方', name: '自治体DX成熟度', current: '集計中', target: '全自治体標準化', themeId: 'ai-gyosei' },
  { id: 'k9', category: '経済', name: '1人あたりGDP', current: '集計中', target: 'G7上位回復', themeId: 'kanko' },
  { id: 'k10', category: 'エネルギー', name: 'エネルギー自給率', current: '集計中', target: '改善', themeId: 'energy' },
]

// 世界と比べる日本（△○◎×）
export const COMPARE_COUNTRIES = ['日本', '台湾', 'シンガポール', 'エストニア', '米国', '北欧'] as const
export interface CountryRow {
  theme: string
  ratings: Record<string, '◎' | '○' | '△' | '×'>
  learn: string // 日本が真似るべき
}
export const COUNTRY_COMPARISON: CountryRow[] = [
  { theme: '行政DX', ratings: { 日本: '△', 台湾: '○', シンガポール: '◎', エストニア: '◎', 米国: '○', 北欧: '○' }, learn: 'エストニア型の電子政府・一度きり原則' },
  { theme: '政治参加DX', ratings: { 日本: '△', 台湾: '◎', シンガポール: '○', エストニア: '○', 米国: '○', 北欧: '○' }, learn: '台湾型のデジタル民主主義（vTaiwan）' },
  { theme: '防災', ratings: { 日本: '○', 台湾: '○', シンガポール: '△', エストニア: '△', 米国: '○', 北欧: '○' }, learn: '日本の強み。輸出も視野' },
  { theme: '教育', ratings: { 日本: '○', 台湾: '○', シンガポール: '◎', エストニア: '○', 米国: '○', 北欧: '◎' }, learn: '北欧型の非認知能力・探究学習' },
  { theme: '政治資金透明化', ratings: { 日本: '△', 台湾: '○', シンガポール: '○', エストニア: '○', 米国: '△', 北欧: '○' }, learn: '北欧・台湾型のオープンデータ公開' },
  { theme: 'AI行政活用', ratings: { 日本: '△', 台湾: '○', シンガポール: '◎', エストニア: '◎', 米国: '○', 北欧: '○' }, learn: 'シンガポール型のAI行政サービス' },
]

// ===== 実施中の選挙（〒で選ぶ → 候補者比較・マッチング）追加 2026-06-20 =====
export interface ElectionCand {
  name: string
  party: string
  age: string
  status: string // 現職/新人/元職
  themes: string[] // 重点政策テーマ id
  finance: string // 明確/一部/不明
  transparency: string // 高/中/低
  achievement: string
}
export interface OngoingElection {
  id: string
  name: string
  typeLabel: string
  region: string
  postalPrefixes: string[] // 郵便番号の先頭一致（プロト簡易判定）
  date: string
  cands: ElectionCand[]
}

export const ONGOING_ELECTIONS: OngoingElection[] = [
  {
    id: 'suginami-chiji', name: '杉並区長選挙', typeLabel: '市区町村長', region: '東京都杉並区',
    postalPrefixes: ['166', '167', '168'], date: '2026-07-05',
    cands: [
      { name: '区民 一郎', party: '無所属', age: '58', status: '現職', themes: ['bosai', 'kosodate'], finance: '明確', transparency: '高', achievement: '区議3期・防災予算化' },
      { name: '杉並 花子', party: '中道改革', age: '46', status: '新人', themes: ['kosodate', 'ai-gyosei'], finance: '一部', transparency: '中', achievement: 'NPO代表・待機児童ゼロ運動' },
      { name: '高円寺 健', party: '無所属', age: '51', status: '新人', themes: ['nyusatsu', 'chiho-zaisei'], finance: '明確', transparency: '高', achievement: '公認会計士・行財政改革を提言' },
      { name: '阿佐ヶ谷 みどり', party: 'れいわ新選', age: '39', status: '新人', themes: ['jinken', 'kosodate'], finance: '不明', transparency: '中', achievement: '市民活動家・子ども食堂運営' },
    ],
  },
  {
    id: 'osaka-chiji', name: '大阪府知事選挙', typeLabel: '都道府県知事', region: '大阪府',
    postalPrefixes: ['53', '54', '55', '56', '57', '58', '59'], date: '2026-08-02',
    cands: [
      { name: '伊藤 さやか', party: '日本維新', age: '47', status: '新人', themes: ['ai-gyosei', 'chiho-zaisei'], finance: '一部', transparency: '中', achievement: '府議2期' },
      { name: '森本 太一', party: '無所属', age: '55', status: '現職', themes: ['energy', 'kanko'], finance: '明確', transparency: '高', achievement: '前市長・観光振興に実績' },
      { name: '大阪 直子', party: '国民民主党', age: '42', status: '新人', themes: ['kosodate', 'nyusatsu'], finance: '明確', transparency: '高', achievement: '弁護士・行政監視' },
    ],
  },
]
