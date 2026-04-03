import CTA from '@/components/home/cta'
import Fairness from '@/components/home/fairness'
import FAQ from '@/components/home/faq'
import Features from '@/components/home/features'
import Hero from '@/components/home/hero'
import HowItWorks from '@/components/home/how-it-works'
import Vision from '@/components/home/vision'

const AboutPage = () => {
  return (
    <div className='w-full grow bg-white'>
      <Hero />
      <Vision />
      <Features />
      <HowItWorks />
      <Fairness />
      <FAQ />
      <CTA />
    </div>
  )
}

export default AboutPage