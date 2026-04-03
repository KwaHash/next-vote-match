


import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { FiHeart } from 'react-icons/fi'

const CTA = () => {
  return (
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
  )
}

export default CTA