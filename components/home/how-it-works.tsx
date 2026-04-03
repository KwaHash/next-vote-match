
import { HOW_IT_WORKS_STEPS } from '@/constants/about'

const HowItWorks = () => {
  return (
    <section className='relative py-16 sm:py-24 bg-gradient-to-br from-white via-blue-50 to-white overflow-hidden'>
      <div className='absolute inset-0 opacity-[0.04]'
        style={{
          backgroundImage: `
            linear-gradient(to right, #1f2937 1px, transparent 1px),
            linear-gradient(to bottom, #1f2937 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px'
        }}
      />
      <div className='container relative z-10 w-full mx-auto px-6 sm:px-10 lg:px-24'>
        <div className='max-w-4xl mx-auto'>
          <div className='flex items-center justify-center gap-4 mb-4'>
            <span className='flex-1 max-w-12 h-px bg-indigo-300' aria-hidden />
            <span className='text-xs md:text-sm font-semibold uppercase tracking-[0.2em] text-indigo-500'>仕組み</span>
            <span className='flex-1 max-w-12 h-px bg-indigo-300' aria-hidden />
          </div>
          <h2 className='text-3xl md:text-4xl font-black text-gray-900 mb-12 leading-tight text-center'>仕組み</h2>

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
  )
}

export default HowItWorks