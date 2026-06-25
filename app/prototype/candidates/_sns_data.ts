/**
 * 【プロトタイプ】候補者 SNS 分析データ
 * 架空のモックデータ。本番は candidates_sns テーブル + YouTube / X API で自動取得。
 */

export type SnsFrequency = 'high' | 'medium' | 'low' | 'none'

export interface PlatformData {
  name: 'X' | 'YouTube' | 'Facebook' | 'Instagram' | 'TikTok' | 'LINE'
  icon: string
  handle: string | null      // null = 未登録
  followers: number | null   // null = 非公開
  postsPerWeek: number | null
  frequency: SnsFrequency
  engagementRate: number | null // %
  topTopics: string[]
  url: string | null
}

export interface MockPost {
  platform: 'X' | 'YouTube' | 'Instagram' | 'Facebook'
  date: string
  content: string
  likes: number
  reposts?: number
  views?: number
}

export interface CandidateSnsData {
  candidateId: number
  bio: string
  career: string[]
  /** question.id (1〜10) → 回答オプション index (0 or 1). -1 = 回答なし */
  stances: Record<number, 0 | 1 | -1>
  platforms: PlatformData[]
  snsStrategy: string
  recentPosts: MockPost[]
}

const SNS_DATA: CandidateSnsData[] = [
  // ──────────────────────────────────────────────────────────────
  // 1: 田中 一郎（自民党・衆議院・東京1区・現職）
  // ──────────────────────────────────────────────────────────────
  {
    candidateId: 1,
    bio: '早稲田大学政経学部卒。民間企業でIT営業を10年経験後、42歳で初当選。現在3期目。デジタル行政推進議員連盟副会長。東京1区（千代田・港・新宿の一部）。政治資金の透明化と行政DXを重点政策とする。',
    career: ['早稲田大学政経学部卒業（1998年）', 'ITソリューション企業営業部長（10年）', '東京都議会議員（1期・2012〜2016年）', '衆議院議員 初当選（2016年）', '現在3期目・内閣府政務官（2022〜2023年）'],
    stances: { 1: 1, 2: 1, 3: 0, 4: 0, 5: 0, 6: 1, 7: -1, 8: 1, 9: 1, 10: 0 },
    platforms: [
      { name: 'X', icon: '𝕏', handle: '@ichiro_tanaka_jp', followers: 24800, postsPerWeek: 14, frequency: 'high', engagementRate: 2.1, topTopics: ['デジタル行政', '防災', 'AI活用', '東京選挙区'], url: 'https://x.com' },
      { name: 'YouTube', icon: '▶', handle: '田中一郎チャンネル', followers: 8200, postsPerWeek: 1, frequency: 'medium', engagementRate: 3.4, topTopics: ['国会報告', '政策解説', '地元活動'], url: 'https://youtube.com' },
      { name: 'Facebook', icon: 'f', handle: '田中一郎（公式）', followers: 15300, postsPerWeek: 3, frequency: 'medium', engagementRate: 1.2, topTopics: ['地元活動報告', '行事参加', '家族'], url: 'https://facebook.com' },
      { name: 'Instagram', icon: '◉', handle: '@ichiro_tanaka_official', followers: 5400, postsPerWeek: 2, frequency: 'low', engagementRate: 4.8, topTopics: ['地元のお祭り', '視察', '日常'], url: 'https://instagram.com' },
      { name: 'TikTok', icon: '♪', handle: null, followers: null, postsPerWeek: null, frequency: 'none', engagementRate: null, topTopics: [], url: null },
      { name: 'LINE', icon: '●', handle: '田中一郎公式LINE', followers: 6200, postsPerWeek: 1, frequency: 'medium', engagementRate: null, topTopics: ['活動お知らせ', 'イベント告知'], url: null },
    ],
    snsStrategy: 'X（旧Twitter）を主戦場に政策論争・ニュース反応を発信。YouTubeでは週1本の国会報告動画を継続。Facebookは50代以上の地元支持者向けに活動報告を丁寧に投稿。Instagramはまだ力が入っておらず、TikTokは未登録。',
    recentPosts: [
      { platform: 'X', date: '2026-06-23', content: 'デジタル庁の行政手続きオンライン化率が72%に達しました。目標の90%まであと一歩。来年度予算で残りの手続きの自動化を強く推進します。#デジタル行政 #行政DX', likes: 342, reposts: 89 },
      { platform: 'X', date: '2026-06-20', content: '東京1区で防災訓練に参加。住民の皆さんと避難ルートを確認しました。首都直下地震への備えは今すぐ始めてほしい。備蓄・避難袋の準備を！', likes: 218, reposts: 64 },
      { platform: 'YouTube', date: '2026-06-18', content: '【国会報告 #48】AI行政活用と情報セキュリティのバランスをどう取るか。海外事例も紹介しながら15分で解説します。', likes: 412, views: 8900 },
    ],
  },

  // ──────────────────────────────────────────────────────────────
  // 2: 鈴木 美咲（中道改革・衆議院・東京2区・新人）
  // ──────────────────────────────────────────────────────────────
  {
    candidateId: 2,
    bio: '東京大学経済学部卒後、外資系コンサル勤務。33歳、独身。子育て支援と政治資金透明化を訴え初出馬。SNSフォロワーは党内最多。「普通の若者が政治を変える」がキャッチコピー。',
    career: ['東京大学経済学部卒業（2015年）', '外資系コンサルティングファーム勤務（6年）', '育児NPO理事（副業・2020年〜）', '中道改革 東京2区公認候補（2026年）'],
    stances: { 1: 0, 2: 0, 3: 0, 4: 1, 5: 1, 6: 0, 7: 0, 8: 0, 9: 0, 10: 0 },
    platforms: [
      { name: 'X', icon: '𝕏', handle: '@misaki_suzuki_2026', followers: 68400, postsPerWeek: 21, frequency: 'high', engagementRate: 5.7, topTopics: ['子育て', '政治資金', '若者', '女性活躍'], url: 'https://x.com' },
      { name: 'YouTube', icon: '▶', handle: '鈴木美咲チャンネル', followers: 21000, postsPerWeek: 2, frequency: 'medium', engagementRate: 6.2, topTopics: ['政策解説', '候補者対談', 'Vlog'], url: 'https://youtube.com' },
      { name: 'Instagram', icon: '◉', handle: '@misaki_suzuki_official', followers: 42000, postsPerWeek: 5, frequency: 'high', engagementRate: 8.3, topTopics: ['保育園視察', '子育て', '日常vlog', 'ファッション'], url: 'https://instagram.com' },
      { name: 'TikTok', icon: '♪', handle: '@misaki_seiji', followers: 104000, postsPerWeek: 7, frequency: 'high', engagementRate: 12.4, topTopics: ['1分政治解説', '選挙豆知識', '国会の裏側'], url: 'https://tiktok.com' },
      { name: 'Facebook', icon: 'f', handle: null, followers: null, postsPerWeek: null, frequency: 'none', engagementRate: null, topTopics: [], url: null },
      { name: 'LINE', icon: '●', handle: '鈴木美咲公式LINE', followers: 11200, postsPerWeek: 2, frequency: 'medium', engagementRate: null, topTopics: ['選挙日程', 'イベント'], url: null },
    ],
    snsStrategy: 'デジタルネイティブ世代。TikTokが主力で「1分でわかる政治解説」シリーズが若者層に刺さっている。Instagramはリアルな視察Vlogで人間性を発信。Xは政策論争より「共感できるつぶやき」を重視。Facebookは完全に捨てている。',
    recentPosts: [
      { platform: 'X', date: '2026-06-24', content: '待機児童ゼロを本気で実現するには「お金だけ」じゃない。保育士の給与を小学校教員並みに上げること。それが一番の近道。今日もNPO現場で確信した。', likes: 2840, reposts: 734 },
      { platform: 'Instagram', date: '2026-06-22', content: '渋谷区の認可外保育所を視察。スタッフの皆さんが本当に献身的で頭が下がります。でも給与水準は…国が変えないといけない。#子育て #保育 #鈴木美咲', likes: 5600, views: 28000 },
      { platform: 'X', date: '2026-06-19', content: '政治資金の収支報告書、リアルタイム公開義務化の法案を提出します。議員1人ひとりのお金の流れを、誰でもスマホで確認できる社会に。', likes: 4120, reposts: 1230 },
    ],
  },

  // ──────────────────────────────────────────────────────────────
  // 3: 井上 拓海（国民民主・衆議院・大阪5区・元職）
  // ──────────────────────────────────────────────────────────────
  {
    candidateId: 3,
    bio: '阪大工学部卒後、エネルギー系メーカーで働きながら政治の道へ。一度落選し民間でキャリアを積み直し、エネルギー政策の専門家として返り咲きを目指す。AI・デジタルを活用した産業政策が専門。',
    career: ['大阪大学工学部卒業（2004年）', 'エネルギー機器メーカー（7年）', '国民民主党 衆議院議員（1期・2017〜2021年）', '落選後 エネルギーコンサルタント起業（2021〜）', '2026年 大阪5区から返り咲き挑戦'],
    stances: { 1: 0, 2: 0, 3: 0, 4: -1, 5: 0, 6: 0, 7: 0, 8: -1, 9: 0, 10: 0 },
    platforms: [
      { name: 'X', icon: '𝕏', handle: '@takumi_inoue_ndp', followers: 31200, postsPerWeek: 10, frequency: 'high', engagementRate: 3.8, topTopics: ['エネルギー', 'AI産業', '大阪', '政策論争'], url: 'https://x.com' },
      { name: 'YouTube', icon: '▶', handle: '井上拓海の政策チャンネル', followers: 12400, postsPerWeek: 1, frequency: 'medium', engagementRate: 4.1, topTopics: ['エネルギー政策', '産業DX', '国会質疑'], url: 'https://youtube.com' },
      { name: 'Facebook', icon: 'f', handle: '井上拓海（公式）', followers: 8900, postsPerWeek: 3, frequency: 'medium', engagementRate: 1.8, topTopics: ['大阪5区活動', '地元企業訪問'], url: 'https://facebook.com' },
      { name: 'Instagram', icon: '◉', handle: '@takumi_inoue_official', followers: 3800, postsPerWeek: 1, frequency: 'low', engagementRate: 3.2, topTopics: ['視察', '工場見学', '大阪'], url: 'https://instagram.com' },
      { name: 'TikTok', icon: '♪', handle: null, followers: null, postsPerWeek: null, frequency: 'none', engagementRate: null, topTopics: [], url: null },
      { name: 'LINE', icon: '●', handle: null, followers: null, postsPerWeek: null, frequency: 'none', engagementRate: null, topTopics: [], url: null },
    ],
    snsStrategy: 'エネルギー・AI産業という専門分野に絞ってXで発信。政策論争に強く、専門家や経済界からのリツイートが多い。YouTubeは国会質疑の解説動画が主体。コンサルタント経験を活かした数字を使った発信が特徴。',
    recentPosts: [
      { platform: 'X', date: '2026-06-23', content: '蓄電池の国産製造ラインが2026年に稼働開始する企業が大阪で3社。エネルギー自給率向上の第一歩。補助金の枠組みを拡大して国内産業を守る政策を訴え続けます。', likes: 678, reposts: 201 },
      { platform: 'YouTube', date: '2026-06-15', content: '【解説】なぜ日本のAI産業は米中に遅れているのか。5つの構造的原因と、国民民主党が提案する処方箋を20分で解説。', likes: 891, views: 22400 },
      { platform: 'X', date: '2026-06-10', content: '落選中の4年間、エネルギーコンサルとして現場で働いてわかったこと。政治家が「数字」を読めないことが一番の問題。私は現場の数字で政治を変える。', likes: 1240, reposts: 389 },
    ],
  },

  // ──────────────────────────────────────────────────────────────
  // 4: 佐藤 健太（国民民主・参議院・比例代表・現職）
  // ──────────────────────────────────────────────────────────────
  {
    candidateId: 4,
    bio: '京都大学経済学部卒後、財務省官僚として10年勤務。官僚目線で財政問題を語れる数少ない現職議員。参院比例代表で当選し全国区での活動を展開。財政再建と社会保障改革の両立を訴える。',
    career: ['京都大学経済学部卒業（2003年）', '財務省入省（主計局 10年）', '財務省退官・政界転身（2013年）', '参議院議員 初当選（2016年）', '現在2期目・財政金融委員会理事'],
    stances: { 1: 1, 2: 1, 3: 0, 4: -1, 5: 0, 6: 0, 7: 0, 8: -1, 9: 0, 10: 0 },
    platforms: [
      { name: 'X', icon: '𝕏', handle: '@kenta_sato_ndp', followers: 45600, postsPerWeek: 16, frequency: 'high', engagementRate: 4.2, topTopics: ['財政', 'エネルギー', '参院質疑', '社会保障'], url: 'https://x.com' },
      { name: 'YouTube', icon: '▶', handle: '佐藤健太の財政解説チャンネル', followers: 28900, postsPerWeek: 2, frequency: 'medium', engagementRate: 5.8, topTopics: ['財政赤字解説', '社会保障', '国債'], url: 'https://youtube.com' },
      { name: 'Facebook', icon: 'f', handle: '佐藤健太（公式）', followers: 19200, postsPerWeek: 4, frequency: 'medium', engagementRate: 2.1, topTopics: ['全国視察', '政策勉強会', '講演報告'], url: 'https://facebook.com' },
      { name: 'Instagram', icon: '◉', handle: '@kenta_sato_official', followers: 7800, postsPerWeek: 2, frequency: 'low', engagementRate: 3.9, topTopics: ['全国行脚', 'グルメ', '地域'], url: 'https://instagram.com' },
      { name: 'TikTok', icon: '♪', handle: '@kenta_seiji', followers: 18400, postsPerWeek: 3, frequency: 'medium', engagementRate: 7.2, topTopics: ['財政わかりやすく', '元官僚の本音'], url: 'https://tiktok.com' },
      { name: 'LINE', icon: '●', handle: '佐藤健太公式LINE', followers: 14800, postsPerWeek: 2, frequency: 'medium', engagementRate: null, topTopics: ['政策ニュース', '講演スケジュール'], url: null },
    ],
    snsStrategy: '比例代表のため全国区の認知度向上が最優先。Xで財政・社会保障の専門的な解説を毎日投稿し、専門家から「わかりやすい」と評価を受ける。TikTokにも進出し元官僚の視点から財政を解説するシリーズが若者に受けている。',
    recentPosts: [
      { platform: 'X', date: '2026-06-24', content: '「消費税ゼロ」を公約にする党が増えているが、財源は誰も説明しない。医療・年金の削減か国債増発か。財務省にいた立場から言う：ここを誤魔化す政治が日本を破綻させる。', likes: 3240, reposts: 1180 },
      { platform: 'YouTube', date: '2026-06-21', content: '【元財務省が解説】日本の国債残高1,000兆円の本当の意味。財政破綻は起きるのか？起きないとしたら何が問題か。20分の完全解説。', likes: 2140, views: 48600 },
      { platform: 'X', date: '2026-06-17', content: '蓄電池投資に1兆円の補助金を出す法案を提出しました。エネルギー自給率を10年で倍増させる。国民民主党の目玉政策です。', likes: 1890, reposts: 642 },
    ],
  },

  // ──────────────────────────────────────────────────────────────
  // 5: 高橋 由美（みらい・参議院・神奈川・新人）
  // ──────────────────────────────────────────────────────────────
  {
    candidateId: 5,
    bio: 'NGO職員として発展途上国での人権支援に10年従事後、帰国して政界に転身。「人権」と「子育て」を軸に活動。みらい党の女性候補として神奈川選挙区から出馬。30代の共感を集める。',
    career: ['上智大学法学部卒業（2007年）', '国際NGO スタッフ（アフリカ・東南アジア 10年）', '帰国後 NPO代表（2018〜）', 'みらい党 神奈川県参議院候補（2026年）'],
    stances: { 1: 0, 2: 0, 3: 1, 4: 1, 5: 1, 6: 0, 7: 0, 8: 0, 9: 0, 10: 0 },
    platforms: [
      { name: 'X', icon: '𝕏', handle: '@yumi_takahashi_mirai', followers: 22100, postsPerWeek: 12, frequency: 'high', engagementRate: 6.4, topTopics: ['人権', '子育て', 'SDGs', 'フェミニズム'], url: 'https://x.com' },
      { name: 'Instagram', icon: '◉', handle: '@yumi_takahashi_official', followers: 38400, postsPerWeek: 6, frequency: 'high', engagementRate: 9.7, topTopics: ['海外活動', '人権', '子育て政策', 'daily'], url: 'https://instagram.com' },
      { name: 'YouTube', icon: '▶', handle: '高橋由美チャンネル', followers: 6800, postsPerWeek: 1, frequency: 'low', engagementRate: 4.3, topTopics: ['NGO活動報告', '人権政策解説'], url: 'https://youtube.com' },
      { name: 'TikTok', icon: '♪', handle: '@yumi_mirai', followers: 54200, postsPerWeek: 5, frequency: 'high', engagementRate: 10.8, topTopics: ['人権をやさしく', '子育て', '選挙の話'], url: 'https://tiktok.com' },
      { name: 'Facebook', icon: 'f', handle: null, followers: null, postsPerWeek: null, frequency: 'none', engagementRate: null, topTopics: [], url: null },
      { name: 'LINE', icon: '●', handle: null, followers: null, postsPerWeek: null, frequency: 'none', engagementRate: null, topTopics: [], url: null },
    ],
    snsStrategy: 'Instagramが最強プラットフォーム。NGO時代の海外写真と国内政策活動を交互に投稿し「行動する政治家」のイメージを発信。TikTokも高評価で「人権ってなに？」シリーズが若い女性に支持されている。Facebookは完全にスキップ。',
    recentPosts: [
      { platform: 'Instagram', date: '2026-06-24', content: '神奈川・横浜のシングルマザー支援施設を訪問。お子さんを持ちながら夜中まで働くお母さんたちと話して涙が出そうになった。この国は「子育ては自己責任」と言いすぎている。#みらい #子育て #神奈川', likes: 6840, views: 42000 },
      { platform: 'X', date: '2026-06-22', content: '日本のジェンダーギャップ指数は世界118位。G7最下位。この数字を恥と感じない政治家が多すぎる。私は変えるために出馬した。', likes: 4280, reposts: 1640 },
      { platform: 'X', date: '2026-06-18', content: 'アフリカで10年活動してわかったこと：問題を解決するのは「お金」じゃなく「制度」。日本の子育て支援も同じ。バラマキより制度を変えることに予算を使ってほしい。', likes: 2140, reposts: 720 },
    ],
  },

  // ──────────────────────────────────────────────────────────────
  // 6: 渡辺 隆（無所属・北海道知事・現職）
  // ──────────────────────────────────────────────────────────────
  {
    candidateId: 6,
    bio: '北海道生まれ北海道育ち。農業経営者から道議を経て知事に。無所属での当選。観光と防災を二本柱に「北海道から日本を変える」を合言葉に2期目の実績を積む。全国屈指の透明化スコア。',
    career: ['北海道大学農学部卒業（1990年）', '農業法人経営（15年）', '北海道議会議員（2期・2005〜2013年）', '北海道知事 初当選（2014年）', '現在3期目（2022年〜）'],
    stances: { 1: -1, 2: -1, 3: -1, 4: 0, 5: -1, 6: 0, 7: -1, 8: -1, 9: 0, 10: 0 },
    platforms: [
      { name: 'X', icon: '𝕏', handle: '@watanabe_hokkaido', followers: 89200, postsPerWeek: 8, frequency: 'high', engagementRate: 3.2, topTopics: ['北海道情報', '観光', '農業', '防災'], url: 'https://x.com' },
      { name: 'YouTube', icon: '▶', handle: '北海道知事チャンネル', followers: 42000, postsPerWeek: 2, frequency: 'medium', engagementRate: 3.8, topTopics: ['知事定例会見', '北海道観光PR', '農業視察'], url: 'https://youtube.com' },
      { name: 'Facebook', icon: 'f', handle: '渡辺 隆 北海道知事', followers: 62000, postsPerWeek: 5, frequency: 'high', engagementRate: 2.4, topTopics: ['政策報告', '観光PR', 'イベント'], url: 'https://facebook.com' },
      { name: 'Instagram', icon: '◉', handle: '@watanabe_hokkaido', followers: 28400, postsPerWeek: 4, frequency: 'medium', engagementRate: 5.1, topTopics: ['北海道の絶景', '食', '農業', 'アウトドア'], url: 'https://instagram.com' },
      { name: 'TikTok', icon: '♪', handle: '@hokkaido_chiji', followers: 31000, postsPerWeek: 2, frequency: 'medium', engagementRate: 8.6, topTopics: ['北海道グルメ', '観光スポット', 'サプライズ訪問'], url: 'https://tiktok.com' },
      { name: 'LINE', icon: '●', handle: '北海道公式LINE', followers: 180000, postsPerWeek: 3, frequency: 'high', engagementRate: null, topTopics: ['緊急情報', '観光情報', '行政お知らせ'], url: null },
    ],
    snsStrategy: '知事という立場を活かし北海道の魅力PR を全プラットフォームで展開。LINEは公式チャンネルとして緊急情報・観光情報を18万人に配信。TikTokでは「北海道グルメ」系のコンテンツが観光促進に直結。政治色を薄め、地域のファンを作る戦略。',
    recentPosts: [
      { platform: 'X', date: '2026-06-24', content: '【北海道防災情報】台風3号が週末に接近の見込み。既に各市町村の避難計画を確認済み。道民の皆さんは早めの備えを。詳細は北海道防災ポータルで→ #北海道 #防災', likes: 4820, reposts: 2340 },
      { platform: 'Instagram', date: '2026-06-21', content: '富良野のラベンダーが見頃です🌿今年は例年より1週間早い開花。北海道の夏を満喫しに来てください！ #北海道 #富良野 #ラベンダー #観光', likes: 12400, views: 88000 },
      { platform: 'YouTube', date: '2026-06-10', content: '【知事会見】北海道の農業DX推進計画を発表。スマート農業の導入補助金を2倍に拡大。農家の高齢化問題に本気で取り組みます。', likes: 890, views: 18900 },
    ],
  },

  // ──────────────────────────────────────────────────────────────
  // 7: 伊藤 さやか（日本維新・大阪府知事・新人）
  // ──────────────────────────────────────────────────────────────
  {
    candidateId: 7,
    bio: '大阪市内で税理士事務所を経営しながら、行政のムダを行政コスト分析の観点から批判してきた。38歳、二児の母。日本維新の会から大阪府知事選に出馬。「行政DXで府民の時間を返す」がスローガン。',
    career: ['関西大学商学部卒業（2011年）', '大手会計事務所勤務（5年）', '税理士事務所独立（2016年〜）', '大阪府行政改革審議委員（2022〜2024年）', '日本維新の会 大阪府知事候補（2026年）'],
    stances: { 1: 0, 2: 1, 3: 0, 4: -1, 5: -1, 6: 0, 7: 0, 8: 0, 9: 0, 10: 0 },
    platforms: [
      { name: 'X', icon: '𝕏', handle: '@sayaka_ito_ishin', followers: 34800, postsPerWeek: 18, frequency: 'high', engagementRate: 7.3, topTopics: ['行政DX', '大阪改革', '財政見直し', '税金'], url: 'https://x.com' },
      { name: 'TikTok', icon: '♪', handle: '@sayaka_osaka', followers: 76000, postsPerWeek: 6, frequency: 'high', engagementRate: 14.2, topTopics: ['税金の使い方', '行政コスト暴露', '大阪'], url: 'https://tiktok.com' },
      { name: 'Instagram', icon: '◉', handle: '@sayaka_ito_official', followers: 24600, postsPerWeek: 4, frequency: 'medium', engagementRate: 7.8, topTopics: ['子育て', 'ビジネス', '大阪の街'], url: 'https://instagram.com' },
      { name: 'YouTube', icon: '▶', handle: '伊藤さやかチャンネル', followers: 14200, postsPerWeek: 1, frequency: 'medium', engagementRate: 5.9, topTopics: ['税金解説', '行政改革', '大阪政策'], url: 'https://youtube.com' },
      { name: 'Facebook', icon: 'f', handle: null, followers: null, postsPerWeek: null, frequency: 'none', engagementRate: null, topTopics: [], url: null },
      { name: 'LINE', icon: '●', handle: '伊藤さやか公式LINE', followers: 8400, postsPerWeek: 2, frequency: 'medium', engagementRate: null, topTopics: ['政策お知らせ', '街頭演説スケジュール'], url: null },
    ],
    snsStrategy: 'TikTokが最強武器。「税金の使い方を専門家が解説」という切り口でバズを連発。税理士の専門知識を活かした数字の見せ方が「信頼感」と「驚き」を生んでいる。Xは政策論争に積極参加。Facebookは未開設（ターゲット層でないと判断）。',
    recentPosts: [
      { platform: 'X', date: '2026-06-24', content: '大阪府の某部局、紙の稟議書を電子化するためだけに1億円の予算要求。電子化して節約するはずなのに…。これが続く限り行政コストは絶対に下がらない。#行政DX #大阪', likes: 5680, reposts: 2140 },
      { platform: 'X', date: '2026-06-20', content: 'AI行政窓口を大阪府全庁舎に導入すれば、試算では年間200億円のコスト削減ができます。財源はここにある。増税より先に行政のムダを切る。', likes: 3240, reposts: 1090 },
      { platform: 'YouTube', date: '2026-06-15', content: '【税理士が暴く】大阪府の「見えない補助金」問題。表に出てこない不透明な支出を1億円単位で10件発見した話。', likes: 1840, views: 38400 },
    ],
  },

  // ──────────────────────────────────────────────────────────────
  // 8: 山本 大輔（自民党・愛知県議・名古屋市北区・現職）
  // ──────────────────────────────────────────────────────────────
  {
    candidateId: 8,
    bio: '名古屋市生まれ。大手自動車メーカーで交通安全システムの開発に携わった後、政治の道へ。交通事故撲滅と地域防災を2本柱に活動。地元の自治会・PTA活動を通じた地道な活動が基盤。',
    career: ['名古屋大学工学部卒業（2001年）', '大手自動車メーカー（交通安全システム開発・12年）', '名古屋市北区自治連合会 役員（2013〜）', '愛知県議会議員 初当選（2015年）', '現在3期目・交通安全対策特別委員会委員長'],
    stances: { 1: 1, 2: 1, 3: -1, 4: 0, 5: 0, 6: 1, 7: 1, 8: 1, 9: 1, 10: 1 },
    platforms: [
      { name: 'X', icon: '𝕏', handle: '@daisuke_yamamoto_aichi', followers: 8200, postsPerWeek: 5, frequency: 'medium', engagementRate: 2.8, topTopics: ['交通安全', '防災', '地元活動', '愛知県政'], url: 'https://x.com' },
      { name: 'Facebook', icon: 'f', handle: '山本大輔 愛知県議', followers: 11400, postsPerWeek: 6, frequency: 'high', engagementRate: 3.4, topTopics: ['地元行事', '清掃活動', '自治会', '県政報告'], url: 'https://facebook.com' },
      { name: 'Instagram', icon: '◉', handle: null, followers: null, postsPerWeek: null, frequency: 'none', engagementRate: null, topTopics: [], url: null },
      { name: 'YouTube', icon: '▶', handle: null, followers: null, postsPerWeek: null, frequency: 'none', engagementRate: null, topTopics: [], url: null },
      { name: 'TikTok', icon: '♪', handle: null, followers: null, postsPerWeek: null, frequency: 'none', engagementRate: null, topTopics: [], url: null },
      { name: 'LINE', icon: '●', handle: '山本大輔公式LINE', followers: 2100, postsPerWeek: 1, frequency: 'low', engagementRate: null, topTopics: ['地元お知らせ', '県政報告'], url: null },
    ],
    snsStrategy: 'SNSより地域活動が主体。FacebookはPTA・自治会向けの地元活動報告がメイン。Xは他の政治家との意見交換に使っているが、フォロワー増は優先していない。InstagramやTikTokは未登録（年齢層が違うと判断）。',
    recentPosts: [
      { platform: 'X', date: '2026-06-23', content: '名古屋市北区の通学路点検を実施。地元小学校の保護者・先生方と一緒に危険箇所を確認。県・市・警察に改善要望を提出します。#交通安全 #名古屋', likes: 156, reposts: 42 },
      { platform: 'Facebook', date: '2026-06-21', content: '北区夏祭りの準備をお手伝いしました！今年も地域の皆さんと盛大に盛り上がりましょう。7月20日（土）は北区民まつり！出展者も募集中です。', likes: 284, reposts: 12 },
      { platform: 'X', date: '2026-06-15', content: '愛知県の交通事故死者数が今年も前年比8%減。10年連続減少中です。地道な取り組みが実を結んでいる。でもまだゼロではない。もっと頑張ります。', likes: 340, reposts: 88 },
    ],
  },

  // ──────────────────────────────────────────────────────────────
  // 9: 中村 香織（れいわ新選組・福岡県議・新人）
  // ──────────────────────────────────────────────────────────────
  {
    candidateId: 9,
    bio: '精神科クリニックのソーシャルワーカーとして12年間、貧困・虐待・DV被害者の支援を続けてきた。「現場で見てきた人権の崩壊を止めたい」とれいわ新選組から出馬。福岡市東区選挙区。',
    career: ['九州大学文学部卒業（2007年）', '精神科クリニック MSW（12年）', '福岡市DV支援ネットワーク代表（2019〜）', 'れいわ新選組 福岡県議候補（2026年）'],
    stances: { 1: 0, 2: 0, 3: 1, 4: 1, 5: 1, 6: 0, 7: 0, 8: 0, 9: 0, 10: 0 },
    platforms: [
      { name: 'X', icon: '𝕏', handle: '@kaori_nakamura_reiwa', followers: 18400, postsPerWeek: 16, frequency: 'high', engagementRate: 8.9, topTopics: ['人権', '精神医療', 'DV支援', '貧困'], url: 'https://x.com' },
      { name: 'Instagram', icon: '◉', handle: '@kaori_nakamura_official', followers: 21800, postsPerWeek: 4, frequency: 'medium', engagementRate: 10.4, topTopics: ['支援活動', '人権', 'れいわ', '福岡'], url: 'https://instagram.com' },
      { name: 'YouTube', icon: '▶', handle: '中村香織チャンネル', followers: 4200, postsPerWeek: 1, frequency: 'low', engagementRate: 5.2, topTopics: ['支援の現場', 'れいわ政策解説'], url: 'https://youtube.com' },
      { name: 'Facebook', icon: 'f', handle: null, followers: null, postsPerWeek: null, frequency: 'none', engagementRate: null, topTopics: [], url: null },
      { name: 'TikTok', icon: '♪', handle: null, followers: null, postsPerWeek: null, frequency: 'none', engagementRate: null, topTopics: [], url: null },
      { name: 'LINE', icon: '●', handle: null, followers: null, postsPerWeek: null, frequency: 'none', engagementRate: null, topTopics: [], url: null },
    ],
    snsStrategy: 'Xでの発信が中心で、ソーシャルワーカーとして体験した現場の「生の声」を投稿。フォロワーは少ないがエンゲージメントが非常に高く、共感型の拡散が多い。Instagramでは活動写真を通じて人間性を伝える。TikTokは未登録。',
    recentPosts: [
      { platform: 'X', date: '2026-06-24', content: '今日支援した方、DVで家から逃げて今日やっと安全な場所に。「助けを求めていいんですか」と涙ながらに言われた。助けを求めることは権利です。それが届く政治にしたい。', likes: 3840, reposts: 1890 },
      { platform: 'X', date: '2026-06-21', content: '「精神疾患は自己責任」という言葉を何度聞いたか。クリニックで12年働いて言い切れる：これは社会の失敗です。制度を変えれば救える命がある。', likes: 2460, reposts: 1020 },
      { platform: 'Instagram', date: '2026-06-18', content: '福岡市東区で街頭演説をしました。「子育てと介護で毎日いっぱいいっぱい」という方と長い時間お話できました。生活の苦しさを政策に変えます。#れいわ #福岡 #中村香織', likes: 1840, views: 9800 },
    ],
  },

  // ──────────────────────────────────────────────────────────────
  // 10: 木村 彩（中道改革・東京都議・世田谷区・新人）
  // ──────────────────────────────────────────────────────────────
  {
    candidateId: 10,
    bio: 'スタートアップでCTO補佐を務めるエンジニア出身。都議選では「デジタルで政治を透明化する」をメインテーマに掲げ、自作のWebサイトで政治活動を公開。政治資金の即時公開を訴える。',
    career: ['慶應大学SFC卒業（2016年）', 'スタートアップCTO補佐（5年）', '政治DX推進NPO設立（2022年〜）', '中道改革 東京都議 世田谷区候補（2026年）'],
    stances: { 1: 0, 2: -1, 3: 0, 4: -1, 5: 1, 6: 0, 7: 0, 8: 0, 9: 0, 10: 0 },
    platforms: [
      { name: 'X', icon: '𝕏', handle: '@aya_kimura_seiji', followers: 29800, postsPerWeek: 20, frequency: 'high', engagementRate: 6.8, topTopics: ['政治DX', '透明化', 'IT政策', '世田谷'], url: 'https://x.com' },
      { name: 'TikTok', icon: '♪', handle: '@aya_kimura_tokyo', followers: 48000, postsPerWeek: 5, frequency: 'high', engagementRate: 11.2, topTopics: ['政治をもっと透明に', 'エンジニアが見た政治', 'DX解説'], url: 'https://tiktok.com' },
      { name: 'Instagram', icon: '◉', handle: '@aya_kimura_official', followers: 18400, postsPerWeek: 3, frequency: 'medium', engagementRate: 8.1, topTopics: ['ITイベント', '世田谷', 'スタートアップ'], url: 'https://instagram.com' },
      { name: 'YouTube', icon: '▶', handle: '木村彩チャンネル', followers: 8900, postsPerWeek: 1, frequency: 'medium', engagementRate: 5.4, topTopics: ['政治資金解説', 'AI行政', '都政ニュース'], url: 'https://youtube.com' },
      { name: 'Facebook', icon: 'f', handle: null, followers: null, postsPerWeek: null, frequency: 'none', engagementRate: null, topTopics: [], url: null },
      { name: 'LINE', icon: '●', handle: null, followers: null, postsPerWeek: null, frequency: 'none', engagementRate: null, topTopics: [], url: null },
    ],
    snsStrategy: 'エンジニア出身らしくデジタル第一の戦略。TikTokでは「エンジニアが見た政治の非効率」シリーズがIT業界に刺さっている。Xでは政治DX系のオピニオンリーダーとの対話を重視。GitHubで政策提案書を公開するなど独自の発信も。',
    recentPosts: [
      { platform: 'X', date: '2026-06-24', content: '東京都の行政システム、調べたら2024年製と1989年製が同じインフラで動いていた。セキュリティとコストの爆弾。DXは技術じゃなくて「決断」の問題。#東京都 #IT #行政DX', likes: 4120, reposts: 1640 },
      { platform: 'X', date: '2026-06-20', content: '政治資金のリアルタイム公開システムを自分で作りました。Supabase + Vercelで1週間。なぜ国が何十億もかけてできないのかが逆にわかった。', likes: 6840, reposts: 2890 },
      { platform: 'YouTube', date: '2026-06-12', content: '【解説】なぜ日本の行政DXは失敗するのか。技術の問題じゃない。「誰も決断しない」文化の問題を10分で解説。', likes: 1240, views: 32400 },
    ],
  },

  // ──────────────────────────────────────────────────────────────
  // 11: 小林 誠（参政党・熱海市長・現職）
  // ──────────────────────────────────────────────────────────────
  {
    candidateId: 11,
    bio: '熱海生まれ熱海育ち。地元旅館を家族で経営しながら市議を経て市長に。土砂災害を乗り越え、観光と防災を両立する復興モデルを全国に発信。温泉観光地の強靭化に尽力する。',
    career: ['立命館大学経営学部卒業（2000年）', '熱海の旅館 経営（家業継承）', '熱海市議会議員（2期・2009〜2017年）', '熱海市長 初当選（2018年）', '現在2期目（2022年〜）'],
    stances: { 1: -1, 2: 1, 3: -1, 4: 0, 5: 0, 6: 1, 7: 1, 8: 1, 9: -1, 10: 1 },
    platforms: [
      { name: 'X', icon: '𝕏', handle: '@makoto_kobayashi_atami', followers: 42000, postsPerWeek: 10, frequency: 'high', engagementRate: 4.8, topTopics: ['熱海観光', '防災', '復興', '温泉'], url: 'https://x.com' },
      { name: 'Instagram', icon: '◉', handle: '@atami_mayor_official', followers: 58400, postsPerWeek: 7, frequency: 'high', engagementRate: 9.4, topTopics: ['熱海の絶景', '温泉', '復興', 'グルメ'], url: 'https://instagram.com' },
      { name: 'YouTube', icon: '▶', handle: '熱海市長チャンネル', followers: 18400, postsPerWeek: 2, frequency: 'medium', engagementRate: 4.6, topTopics: ['市長会見', '熱海観光PR', '復興報告'], url: 'https://youtube.com' },
      { name: 'TikTok', icon: '♪', handle: '@atami_mayor', followers: 84000, postsPerWeek: 4, frequency: 'high', engagementRate: 13.8, topTopics: ['熱海グルメ', '温泉巡り', 'サプライズ旅館訪問'], url: 'https://tiktok.com' },
      { name: 'Facebook', icon: 'f', handle: '小林誠 熱海市長', followers: 22000, postsPerWeek: 4, frequency: 'medium', engagementRate: 3.2, topTopics: ['市政報告', '観光PR', '復興状況'], url: 'https://facebook.com' },
      { name: 'LINE', icon: '●', handle: '熱海市公式LINE', followers: 24000, postsPerWeek: 2, frequency: 'medium', engagementRate: null, topTopics: ['緊急情報', '観光イベント', '市政お知らせ'], url: null },
    ],
    snsStrategy: 'TikTokで熱海観光の認知度を圧倒的に上げた戦略が成功。土砂災害後の復興ドキュメントシリーズがバズり、熱海ファンを全国に増やした。Instagramは絶景・グルメ写真で観光客を誘致。観光政策と完全に連動したSNS戦略。',
    recentPosts: [
      { platform: 'X', date: '2026-06-23', content: '熱海土砂災害から5年。復興した商店街に昨日8,000人が来場。地元の皆さんが流した涙は絶対に無駄にしない。これからも「災害に強い観光地」を全国のモデルにします。', likes: 6840, reposts: 2890 },
      { platform: 'Instagram', date: '2026-06-22', content: '梅雨の晴れ間、熱海海岸から相模湾を望む夕焼けです🌅 今日は観光客で賑わいました。6月も来てください！ #熱海 #温泉 #観光 #絶景', likes: 14800, views: 102000 },
      { platform: 'YouTube', date: '2026-06-08', content: '【熱海市長会見】高齢者の熱中症ゼロ作戦2026を発表。全旅館・ホテルと連携した涼み所ネットワーク構築で今夏に実証実験開始。', likes: 1240, views: 24800 },
    ],
  },

  // ──────────────────────────────────────────────────────────────
  // 12: 加藤 真理（無所属・軽井沢町長・新人）
  // ──────────────────────────────────────────────────────────────
  {
    candidateId: 12,
    bio: '軽井沢出身の環境コンサルタント。東京でのキャリアを捨て地元に戻り、「観光公害」と「エネルギー自立」を解決するため無所属で出馬。地元の観光業者・農家からの草の根支援が基盤。',
    career: ['信州大学農学部卒業（2008年）', '東京環境コンサル会社勤務（8年）', '軽井沢にIターン移住（2016年）', '軽井沢町観光振興委員（2020〜）', '無所属 軽井沢町長候補（2026年）'],
    stances: { 1: -1, 2: -1, 3: -1, 4: -1, 5: 1, 6: -1, 7: 0, 8: 0, 9: 0, 10: 0 },
    platforms: [
      { name: 'X', icon: '𝕏', handle: '@mari_kato_karuizawa', followers: 8400, postsPerWeek: 7, frequency: 'medium', engagementRate: 5.2, topTopics: ['軽井沢', 'エネルギー', '観光政策', '移住'], url: 'https://x.com' },
      { name: 'Instagram', icon: '◉', handle: '@mari_kato_official', followers: 22000, postsPerWeek: 5, frequency: 'high', engagementRate: 11.8, topTopics: ['軽井沢の四季', 'カフェ', '農産物', 'アウトドア'], url: 'https://instagram.com' },
      { name: 'YouTube', icon: '▶', handle: '加藤真理チャンネル', followers: 3200, postsPerWeek: 1, frequency: 'low', engagementRate: 3.8, topTopics: ['軽井沢移住案内', '環境政策'], url: 'https://youtube.com' },
      { name: 'Facebook', icon: 'f', handle: null, followers: null, postsPerWeek: null, frequency: 'none', engagementRate: null, topTopics: [], url: null },
      { name: 'TikTok', icon: '♪', handle: null, followers: null, postsPerWeek: null, frequency: 'none', engagementRate: null, topTopics: [], url: null },
      { name: 'LINE', icon: '●', handle: null, followers: null, postsPerWeek: null, frequency: 'none', engagementRate: null, topTopics: [], url: null },
    ],
    snsStrategy: 'Instagramが核心。軽井沢の美しい四季の写真を通じて「ここに住みたい」という感情を作り出し、移住者・関係人口の増加に直結させている。Xは政策提言の場として活用。TikTokは未検討。',
    recentPosts: [
      { platform: 'X', date: '2026-06-22', content: '軽井沢の観光客数は増えているのに、地元農家の収入は増えていない。産地直売ルートを観光と直結させる「軽井沢ファームto観光客」プロジェクトを提案します。#軽井沢', likes: 420, reposts: 108 },
      { platform: 'Instagram', date: '2026-06-21', content: '梅雨の軽井沢。霧の白糸の滝は朝7時が最高です☁️ この景色を次の世代に残すために、環境保護と観光の両立を政策に。 #軽井沢 #白糸の滝 #長野 #移住', likes: 4820, views: 32000 },
      { platform: 'X', date: '2026-06-15', content: '軽井沢は夏の電力消費が4倍になる。別荘のソーラーパネル義務化と蓄電池シェアリングで、エネルギー自立した観光地を目指します。', likes: 284, reposts: 76 },
    ],
  },

  // ──────────────────────────────────────────────────────────────
  // 13: 吉田 翔（社民党・渋谷区議・現職）
  // ──────────────────────────────────────────────────────────────
  {
    candidateId: 13,
    bio: '労働組合の専従スタッフから区議に転身。渋谷という特殊な都市環境で、外国人・性的少数者・フリーランスなど多様な人々の権利を守る活動を続ける。情報公開請求を武器にした「チェック型政治家」。',
    career: ['早稲田大学社会学部卒業（2006年）', '労働組合専従スタッフ（8年）', '渋谷区議会議員 初当選（2015年）', '現在3期目・多様性社会推進特別委員会委員長'],
    stances: { 1: 0, 2: 0, 3: 1, 4: 1, 5: 1, 6: 0, 7: 0, 8: 0, 9: 0, 10: 0 },
    platforms: [
      { name: 'X', icon: '𝕏', handle: '@sho_yoshida_shibuya', followers: 24800, postsPerWeek: 20, frequency: 'high', engagementRate: 7.8, topTopics: ['人権', 'LGBTq+', '情報公開', '渋谷区政'], url: 'https://x.com' },
      { name: 'YouTube', icon: '▶', handle: '吉田翔チャンネル', followers: 7800, postsPerWeek: 1, frequency: 'medium', engagementRate: 5.6, topTopics: ['区議会ライブ', '情報公開請求の使い方', '社民党政策'], url: 'https://youtube.com' },
      { name: 'Instagram', icon: '◉', handle: '@sho_yoshida_official', followers: 12000, postsPerWeek: 3, frequency: 'medium', engagementRate: 8.4, topTopics: ['渋谷の多様性', 'プライドパレード', '街頭活動'], url: 'https://instagram.com' },
      { name: 'Facebook', icon: 'f', handle: null, followers: null, postsPerWeek: null, frequency: 'none', engagementRate: null, topTopics: [], url: null },
      { name: 'TikTok', icon: '♪', handle: null, followers: null, postsPerWeek: null, frequency: 'none', engagementRate: null, topTopics: [], url: null },
      { name: 'LINE', icon: '●', handle: '吉田翔 渋谷区議LINE', followers: 3400, postsPerWeek: 1, frequency: 'low', engagementRate: null, topTopics: ['区政お知らせ', '講演会情報'], url: null },
    ],
    snsStrategy: 'Xが主戦場。情報公開請求で入手した文書のスレッド解説がバズりやすく、「調査型区議」としての認知を確立。YouTubeでは区議会のライブ配信を続け「何を話しているか見える政治」を実践。',
    recentPosts: [
      { platform: 'X', date: '2026-06-24', content: '【情報公開スレッド】渋谷区が民間委託した某施設、契約内容を公開請求したら単価が相場の2.3倍。なぜこの単価になったか区に質問状を送りました。回答次第で議会質疑にかけます。🧵1/6', likes: 4840, reposts: 2140 },
      { platform: 'X', date: '2026-06-21', content: '東京レインボープライド2026、今年も渋谷から世界へ。すべての人が自分らしく生きられる社会のために、法整備を急ぎます。#プライド #渋谷 #LGBTq', likes: 3240, reposts: 1290 },
      { platform: 'YouTube', date: '2026-06-10', content: '【区議会ライブ】渋谷区の外国人住民支援予算について質疑しました。50分。字幕付き。', likes: 680, views: 8400 },
    ],
  },

  // ──────────────────────────────────────────────────────────────
  // 14: 松本 直子（日本保守党・世田谷区議・新人）
  // ──────────────────────────────────────────────────────────────
  {
    candidateId: 14,
    bio: '世田谷区で2児を育てる専業主婦。マンション管理組合の活動を通じて行政の非効率さに怒りを覚え政治の世界へ。「普通の母親の感覚を区政に」を掲げる。防災・子育て・地域の安全がテーマ。',
    career: ['中央大学法学部卒業（2005年）', '会社員（5年）', '結婚・専業主婦（子育て中）', '世田谷区マンション管理組合 理事長（2020〜）', '日本保守党 世田谷区議候補（2026年）'],
    stances: { 1: -1, 2: 1, 3: -1, 4: 0, 5: 0, 6: 1, 7: 1, 8: 1, 9: -1, 10: 1 },
    platforms: [
      { name: 'X', icon: '𝕏', handle: '@naoko_matsumoto_setagaya', followers: 16800, postsPerWeek: 12, frequency: 'high', engagementRate: 9.2, topTopics: ['子育て', '防災', '世田谷', '主婦の目線'], url: 'https://x.com' },
      { name: 'Instagram', icon: '◉', handle: '@naoko_matsumoto_official', followers: 28400, postsPerWeek: 5, frequency: 'high', engagementRate: 12.4, topTopics: ['子育て', 'マンション防災', '世田谷の日常', '料理'], url: 'https://instagram.com' },
      { name: 'YouTube', icon: '▶', handle: null, followers: null, postsPerWeek: null, frequency: 'none', engagementRate: null, topTopics: [], url: null },
      { name: 'TikTok', icon: '♪', handle: '@naoko_mama_politics', followers: 38000, postsPerWeek: 4, frequency: 'medium', engagementRate: 15.6, topTopics: ['ママの政治入門', '防災の準備', '子育て政策'], url: 'https://tiktok.com' },
      { name: 'Facebook', icon: 'f', handle: null, followers: null, postsPerWeek: null, frequency: 'none', engagementRate: null, topTopics: [], url: null },
      { name: 'LINE', icon: '●', handle: null, followers: null, postsPerWeek: null, frequency: 'none', engagementRate: null, topTopics: [], url: null },
    ],
    snsStrategy: 'TikTokのエンゲージメント率が15%超と候補者の中で最高水準。「ママが政治を語る」という切り口が子育て層に刺さっている。Instagramも「普通の主婦が政治家を目指す」ストーリーを日常的に発信。Xは保守層のオピニオンリーダーとの対話に使用。',
    recentPosts: [
      { platform: 'X', date: '2026-06-24', content: '世田谷区のハザードマップ、先週やっと確認した。うちのマンションの地下駐車場、浸水リスク「高」だった。管理組合で避難計画を作るべきと気づかせてくれた行政、それはそれで評価します。', likes: 2840, reposts: 980 },
      { platform: 'Instagram', date: '2026-06-22', content: '今日も世田谷区内を回りました！「普通のお母さんが区議になってほしい」と声をかけてもらって、本当に嬉しかった。子育て・防災・安全を必ず区政に届けます💪 #世田谷 #子育て #防災', likes: 7840, views: 48000 },
      { platform: 'X', date: '2026-06-18', content: '区議会の傍聴に行きました。お金の使い方を決める場所なのに、傍聴者は私を含めて3人。もっと多くの人に見てほしい。月1回でも区議会に行こうと思えるような発信を続けます。', likes: 1640, reposts: 520 },
    ],
  },
]

export function getSnsData(candidateId: number): CandidateSnsData | null {
  return SNS_DATA.find((d) => d.candidateId === candidateId) ?? null
}

export const FREQ_LABEL: Record<SnsFrequency, string> = {
  high: '高（週5回以上）',
  medium: '中（週2〜4回）',
  low: '低（週1回以下）',
  none: '未登録',
}

export const FREQ_COLOR: Record<SnsFrequency, string> = {
  high: 'bg-emerald-100 text-emerald-700',
  medium: 'bg-amber-100 text-amber-700',
  low: 'bg-gray-100 text-gray-500',
  none: 'bg-gray-50 text-gray-400',
}
