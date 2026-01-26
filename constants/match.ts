import { prefectures } from '@/constants/areas'
import { parties } from '@/constants/parties'

export const questions = [
  {
    id: 0,
    category: '都道府県',
    question: 'あなたの住んでいる都道府県は？',
    options: prefectures.map((prefecture) => ({
      value: prefecture.value,
      label: prefecture.label
    }))
  },
  {
    id: 1,
    category: '選挙区',
    question: 'あなたが投票される選挙区は？',
    options: prefectures.flatMap((prefecture) =>
      Array.from({ length: prefecture.districts }, (_, idx) => ({
        value: `${prefecture.value}${idx + 1}区`,
        label: `${prefecture.label}${idx + 1}区`
      }))
    )
  },
  {
    id: 2,
    category: '政党',
    question: 'あなたが支持する政党は？',
    options: parties.map((party) => ({
      value: party.value,
      label: party.label
    }))
  },
  {
    id: 3,
    category: '環境',
    question: '気候変動対策について、あなたの考えに近いのは？',
    options: [
      { value: '経済成長を優先しつつ、段階的に対策を進める', label: '経済成長を優先しつつ、段階的に対策を進める' },
      { value: '経済と環境のバランスを取りながら対策する', label: '経済と環境のバランスを取りながら対策する' },
      { value: '環境保護を最優先し、大胆な政策を実行する', label: '環境保護を最優先し、大胆な政策を実行する' }
    ]
  },
  {
    id: 4,
    category: '経済',
    question: '経済政策について、あなたの考えに近いのは？',
    options: [
      { value: '大企業を支援し、経済全体の成長を目指す', label: '大企業を支援し、経済全体の成長を目指す' },
      { value: '中小企業と大企業のバランスを重視する', label: '中小企業と大企業のバランスを重視する' },
      { value: '中小企業や地域経済を優先的に支援する', label: '中小企業や地域経済を優先的に支援する' }
    ]
  },
  {
    id: 5,
    category: '教育',
    question: '教育政策について、あなたの考えに近いのは？',
    options: [
      { value: '競争を重視し、優秀な人材を育成する', label: '競争を重視し、優秀な人材を育成する' },
      { value: '基礎学力と個性の両方を伸ばす', label: '基礎学力と個性の両方を伸ばす' },
      { value: 'すべての子どもに平等な教育機会を提供する', label: 'すべての子どもに平等な教育機会を提供する' }
    ]
  },
  {
    id: 6,
    category: '福祉',
    question: '社会保障について、あなたの考えに近いのは？',
    options: [
      { value: '自己責任を基本とし、最低限の保障を提供', label: '自己責任を基本とし、最低限の保障を提供' },
      { value: '必要な人に必要な支援を提供する', label: '必要な人に必要な支援を提供する' },
      { value: '手厚い社会保障で誰もが安心できる社会を', label: '手厚い社会保障で誰もが安心できる社会を' }
    ]
  },
  {
    id: 7,
    category: 'テクノロジー',
    question: 'デジタル化・DXについて、あなたの考えに近いのは？',
    options: [
      { value: '慎重に進め、セキュリティを最優先する', label: '慎重に進め、セキュリティを最優先する' },
      { value: '利便性とセキュリティのバランスを取る', label: '利便性とセキュリティのバランスを取る' },
      { value: '積極的に推進し、社会全体を変革する', label: '積極的に推進し、社会全体を変革する' }
    ]
  }
]