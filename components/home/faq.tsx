


import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { HOMEFAQS } from '@/constants/about'

const FAQ = () => {
  return (
    <section className='relative py-16 sm:py-24 bg-gradient-to-br from-white via-blue-50 to-white overflow-hidden'>
      <div className='absolute inset-0 opacity-[0.04]'
        style={{
          backgroundImage: 'linear-gradient(to right, #1f2937 1px, transparent 1px), linear-gradient(to bottom, #1f2937 1px, transparent 1px)',
          backgroundSize: '40px 40px'
        }}
      />
      <div className='relative z-10 w-full mx-auto px-6 sm:px-10 lg:px-24'>
        <div className='mb-8 sm:mb-16'>
          <div className='flex items-center gap-3 mb-4'>
            <span className='w-16 h-px bg-indigo-500' aria-hidden />
            <span className='text-sm font-bold uppercase text-indigo-500'>よくあるご質問</span>
          </div>
          <h2 className='text-3xl md:text-4xl font-black text-gray-900 mb-4 leading-tight'>よくあるご質問</h2>
        </div>

        <div className='max-w-6xl mx-auto'>
          <Accordion type='single' collapsible className='rounded-lg border border-gray-200 bg-white px-8 shadow-md'>
            {HOMEFAQS.map((faq, index) => (
              <AccordionItem key={index} value={`item-${index}`}>
                <AccordionTrigger className='py-7 hover:no-underline'>{faq.question}</AccordionTrigger>
                <AccordionContent className='leading-relaxed'>{faq.answer}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  )
}

export default FAQ