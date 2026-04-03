import { Card, CardContent } from '@/components/ui/card'
import { FEATURES } from '@/constants/about'

const Features = () => {
  return (
    <section className='py-20 bg-gray-100'>
      <div className='container'>
        <div className='max-w-4xl mx-auto'>
          <div className='flex items-center justify-center gap-4 mb-4'>
            <span className='flex-1 max-w-12 h-px bg-indigo-300' aria-hidden />
            <span className='text-xs md:text-sm font-semibold uppercase tracking-[0.2em] text-indigo-500'>推し活×政治の意義</span>
            <span className='flex-1 max-w-12 h-px bg-indigo-300' aria-hidden />
          </div>
          <h2 className='text-3xl md:text-4xl font-black text-gray-900 mb-12 leading-tight text-center'>推し活×政治の意義</h2>

          <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
            {FEATURES.map(({ icon: Icon, title, description }, i) => (
              <Card key={i} className='shadow-lg rounded-sm'>
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
  )
}

export default Features