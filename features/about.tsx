import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { FAIRNESS_ITEMS, FEATURES, HOW_IT_WORKS_STEPS } from '@/constants/about'
import { FiHeart, FiShield } from 'react-icons/fi'
import { HiOutlineSparkles } from 'react-icons/hi2'

import Link from 'next/link'

const AboutPage = () => {
  return (
    <div className='min-h-screen bg-gradient-to-b from-background to-muted/20'>
      {/* Hero */}
      <section className='py-20 bg-gradient-to-br from-primary/10 to-accent/10'>
        <div className='container'>
          <div className='max-w-3xl mx-auto text-center space-y-6'>
            <h1 className='text-4xl md:text-5xl font-bold'>わたしの政治とは</h1>
            <p className='text-xl text-muted-foreground'>推し活×政治で、新しい政治参加のカタチを創る</p>
          </div>
        </div>
      </section>

      {/* Vision */}
      <section className='py-20'>
        <div className='container'>
          <div className='max-w-4xl mx-auto space-y-12'>
            <div className='text-center space-y-4'>
              <h2 className='text-3xl font-bold'>私たちのビジョン</h2>
              <p className='text-lg text-muted-foreground'>「推し」という新しい視点で、政治をもっと身近に、もっと楽しく</p>
            </div>

            <Card className='shadow-lg rounded-sm'>
              <CardContent className='p-8 space-y-6'>
                <p className='text-lg leading-relaxed'>
                  政治は難しい、遠い存在だと感じていませんか？<br />
                  「わたしの政治」は、あなたの価値観に合った政治家を「推し」として応援する、新しい政治参加のプラットフォームです。
                </p>
                <p className='text-lg leading-relaxed'>
                  好きなアイドルやアーティストを応援するように、あなたの理想を実現してくれる政治家を見つけて、応援し、一緒に未来を創っていく。
                  それが「わたしの政治」の目指す世界です。
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className='py-20 bg-muted/30'>
        <div className='container'>
          <div className='max-w-4xl mx-auto space-y-12'>
            <h2 className='text-3xl font-bold text-center'>推し活×政治の意義</h2>

            <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
              {FEATURES.map(({ icon: Icon, title, description }, i) => (
                <Card key={i}
                  className='shadow-lg rounded-sm'
                >
                  <CardContent className='p-6 space-y-4'>
                    <div className='w-12 h-12 rounded-full bg-[#3c83f6]/10 flex items-center justify-center'>
                      <Icon className='h-6 w-6 stroke-[#3c83f6]' />
                    </div>
                    <h3 className='text-xl font-bold'>{title}</h3>
                    <p className='text-muted-foreground'>{description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className='py-20'>
        <div className='container'>
          <div className='max-w-4xl mx-auto space-y-12'>
            <h2 className='text-3xl font-bold text-center'>仕組み</h2>

            <div className='space-y-8'>
              {HOW_IT_WORKS_STEPS.map(({ number, title, description, bgColor }) => (
                <div key={number} className='flex items-start space-x-6'>
                  <div className={`flex-shrink-0 w-12 h-12 rounded-full ${bgColor} text-white flex items-center justify-center font-bold text-xl`}>
                    {number}
                  </div>
                  <div className='flex-1 space-y-2'>
                    <h3 className='text-xl font-bold'>{title}</h3>
                    <p className='text-muted-foreground'>{description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Fairness */}
      <section className='py-20 bg-muted/30'>
        <div className='container'>
          <div className='max-w-4xl mx-auto space-y-8'>
            <div className='text-center space-y-4'>
              <FiShield className='h-12 w-12 text-primary mx-auto' />
              <h2 className='text-3xl font-bold'>公平性・中立性</h2>
            </div>

            <Card className='shadow-lg rounded-sm'>
              <CardContent className='p-8 space-y-4'>
                <p className='text-lg leading-relaxed'>
                  「わたしの政治」は、特定の政党や政治家を支持するものではありません。
                  すべての政治家に平等な機会を提供し、国民の皆様が自由に推しを選べる環境を整えています。
                </p>
                <ul className='space-y-3 text-muted-foreground'>
                  {FAIRNESS_ITEMS.map((item, i) => (
                    <li key={i} className='flex items-start'>
                      <HiOutlineSparkles className='h-5 w-5 mr-3 text-primary flex-shrink-0 mt-0.5' />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className='py-20'>
        <div className='container'>
          <div className='max-w-3xl mx-auto text-center space-y-6'>
            <h2 className='text-3xl font-bold'>さあ、あなたの推しを見つけよう</h2>
            <p className='text-lg text-muted-foreground'>
              診断は無料。3分であなたにぴったりの政治家が見つかります。
            </p>
            <Button size='lg' className='text-lg h-14 px-8 shadow-lg rounded-none' asChild>
              <Link href='/match' className='flex items-center justify-center'>
                <FiHeart className='h-7 w-7 mr-2' />
                <span>診断を始める</span>
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}

export default AboutPage