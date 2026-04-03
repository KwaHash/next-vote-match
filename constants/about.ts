

import { type IconType } from 'react-icons'
import { FiHeart, FiTarget } from 'react-icons/fi'
import { HiOutlineTrendingUp } from 'react-icons/hi'
import { LuUsersRound } from 'react-icons/lu'

interface IFeatureItem {
  icon: IconType
  title: string
  description: string
}

interface IHowItWorksStep {
  number: number
  title: string
  description: string
  bgColor: string
}

export const FEATURES: IFeatureItem[] = [
  {
    icon: FiHeart,
    title: '感情的なつながり',
    description: '政策だけでなく、政治家の人柄やストーリーを知ることで、より深い共感と応援の気持ちが生まれます。',
  },
  {
    icon: FiTarget,
    title: '価値観マッチング',
    description: '診断を通じて、あなたの価値観に本当に合った政治家を見つけることができます。',
  },
  {
    icon: LuUsersRound,
    title: 'コミュニティ形成',
    description: '同じ推しを持つ仲間と出会い、一緒に応援することで、政治参加がもっと楽しくなります。',
  },
  {
    icon: HiOutlineTrendingUp,
    title: '直接支援',
    description: 'クラウドファンディングを通じて、推し政治家のプロジェクトを直接支援できます。',
  },
]

export const HOW_IT_WORKS_STEPS: IHowItWorksStep[] = [
  {
    number: 1,
    title: '診断',
    description: '価値観診断で、あなたの考えや理想を明確にします。環境、経済、教育など、様々なテーマについての質問に答えるだけ。',
    bgColor: 'bg-primary',
  },
  {
    number: 2,
    title: '推し発見',
    description: '診断結果をもとに、あなたにぴったりの政治家をマッチング。相性スコアやプロフィールを見て、推しを見つけましょう。',
    bgColor: 'bg-secondary',
  },
  {
    number: 3,
    title: '応援',
    description: '推しボタンを押して応援、総選挙に投票、クラウドファンディングで支援。様々な方法で推し政治家をサポートできます。',
    bgColor: 'bg-accent',
  },
]

export const FAIRNESS_ITEMS: string[] = [
  '政治家の登録は審査制で、本人確認を徹底',
  'マッチングアルゴリズムは透明性を重視',
  'ランキングは推し数と活動実績で公平に算出',
]

export const HOMEFAQS = [
	{
		question: '「わたしの政治」は何ができるサービスですか？',
		answer: '価値観診断（クイズ）で、あなたの考えや優先したいテーマを整理し、その結果に基づいて相性の近い政治家・候補者を見つけやすくするプラットフォームです。政策だけでなく、人柄やストーリーにも触れられる設計で、「推し」として応援しやすい政治参加を目指しています。'
	},
	{
		question: '診断の流れはどうなっていますか？',
		answer: '大きく3ステップです。(1) 環境・経済・教育など、さまざまなテーマの質問に答えて価値観を明確にする「診断」、(2) 結果をもとに相性やプロフィールを見ながら「推し」を見つける「推し発見」、(3) 推しボタンでの応援、選挙での投票、クラウドファンディングなどでサポートする「応援」です。'
	},
	{
		question: '特定の政党や候補を推しているのではないですか？',
		answer: 'いいえ。サイト上の「公平性・中立性」の方針どおり、特定政党・政治家の代弁ではなく、利用者が自由に推しを選べることを重視しています。政治家の登録は審査制で本人確認を行い、マッチングには透明性を意識したアルゴリズム、ランキングは推し数と活動実績に基づくなど、公平性のための取り組みを謳っています。'
	},
	{
		question: '政治家・候補者はどうやって掲載されますか？',
		answer: 'わたしの政治では、政治家・候補者の掲載は審査制の登録とし、本人確認を徹底する、という方針がプロダクト文面で示されています。目的は、なりすましや虚偽プロフィールによる利用者の誤解を防ぎ、本人性と掲載情報の信頼性を確保することです。'
	},
	{
		question: 'AIチャットは何に使えますか？',
		answer: 'サービス内の使い方の案内、用語の説明、関心テーマを整理するための質問の仕方など、情報を補助する用途を想定しています。'
	}
]