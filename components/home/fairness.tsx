

import { Card, CardContent } from '@/components/ui/card'
import { FAIRNESS_ITEMS } from '@/constants/about'
import { FiShield } from 'react-icons/fi'
import { HiOutlineSparkles } from 'react-icons/hi2'

const Fairness = () => {
  return (
    <section className='relative py-16 sm:py-24 bg-white overflow-hidden'>
      <div className='absolute inset-0'
        style={{
          backgroundImage: `
            linear-gradient(45deg, rgba(245, 158, 11, 0.07) 3px, transparent 3px),
            linear-gradient(-45deg, rgba(245, 158, 11, 0.07) 3px, transparent 3px)
          `,
          backgroundSize: '40px 40px'
        }}
      />
      <div className='container relative z-10 w-full mx-auto px-6 sm:px-10 lg:px-24'>
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
  )
}

export default Fairness