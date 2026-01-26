'use client'

import { PoliticianCard } from '@/components/card/politician-card'
import LoadingIndicator from '@/components/loading-indicator'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Progress } from '@/components/ui/progress'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Table, TableBody, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { questions } from '@/constants/match'
import { IPolitician } from '@/types/politician'
import axios from 'axios'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { FaArrowLeft, FaArrowRight } from 'react-icons/fa6'

const MatchPage = () => {
  const [currentStep, setCurrentStep] = useState(0)
  const [answers, setAnswers] = useState<Record<number, string>>({})
  const [showResults, setShowResults] = useState(false)
  const [filteredPoliticians, setFilteredPoliticians] = useState<IPolitician[]>([])
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [])

  const progress = ((currentStep + 1) / questions.length) * 100

  const handleAnswer = (value: string) => {
    setAnswers({ ...answers, [currentStep]: value })
  }

  const handleNext = async () => {
    if (currentStep < questions.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      setIsLoading(true)
      setShowResults(true)

      try {
        const { data: { politicians } } = await axios.get('/api/politicians')
        setFilteredPoliticians(politicians.slice(0, 5))
      } catch (err) {
        if (axios.isAxiosError(err)) {
          const error = err.response?.data?.error
        }
      }

      setIsLoading(false)
    }
  }

  const handleBack = () => {
    setCurrentStep(Math.max(0, currentStep - 1))
  }

  if (isLoading) {
    return <LoadingIndicator />
  }

  if (showResults) {
    return (
      <div className='min-h-screen bg-gradient-to-b from-background to-muted/20'>
        {/* Results Header */}
        <section className='py-20 bg-gradient-to-br from-primary/10 to-accent/10'>
          <div className='container'>
            <div className='max-w-3xl mx-auto text-center space-y-4'>
              <h1 className='text-4xl md:text-5xl font-bold'>診断完了！</h1>
              <p className='text-xl text-muted-foreground'>あなたにぴったりの推し政治家が見つかりました</p>
            </div>
          </div>
        </section>

        {/* Matched Politicians */}
        <section className='w-full max-w-6xl mx-auto px-4 md:px-8 pt-12'>
          <div className='rounded-md border'>
            <Table className='w-full'>
              <TableHeader>
                <TableRow className='bg-gray-600 hover:bg-gray-600'>
                  <TableHead className='border border-gray-500 text-white text-center font-normal h-12 w-[150px] p-1'>写真</TableHead>
                  <TableHead className='border border-gray-500 text-white text-center font-normal h-12 w-[200px] p-1'>名前</TableHead>
                  <TableHead className='border border-gray-500 text-white text-center font-normal h-12 w-[150px] p-1'>政党</TableHead>
                  <TableHead className='border border-gray-500 text-white text-center font-normal h-12 w-[50px] p-1'>年齢</TableHead>
                  <TableHead className='border border-gray-500 text-white text-center font-normal h-12 w-[50px] p-1'>性別</TableHead>
                  <TableHead className='border border-gray-500 text-white text-center font-normal h-12 p-1'>サイト</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPoliticians.map((politician) => (
                  <PoliticianCard key={politician.id} {...politician} />
                ))}
              </TableBody>
            </Table>
          </div>
        </section>
        {/* Actions */}
        <div className='flex flex-col items-center sm:flex-row gap-4 px-4 justify-center pt-12 pb-20'>
          <Button className='w-[250px] h-auto px-10 py-4 rounded-none bg-secondary text-secondary-foreground hover:bg-secondary/80 text-base' asChild>
            <Link href='/politicians'>すべての政治家を見る</Link>
          </Button>
          <Button className='w-[250px] h-auto px-10 py-4 rounded-none text-base'
            onClick={() => {
              setShowResults(false)
              setCurrentStep(0)
              setAnswers({})
            }}
          >
            もう一度診断する
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className='w-full max-w-6xl mx-auto px-4 md:px-8 py-12 min-h-screen bg-gradient-to-b from-background to-muted/20 space-y-8'>
      {/* Progress */}
      <div className='space-y-2'>
        <div className='flex justify-between text-sm text-muted-foreground'>
          <span>
            質問 {currentStep + 1} / {questions.length}
          </span>
          <span>{Math.round(progress)}%</span>
        </div>
        <Progress value={progress} className='h-2' />
      </div>

      {/* Question Card */}
      <Card className='shadow-lg rounded-sm'>
        <CardHeader>
          <Badge className='w-fit mb-2 hover:bg-primary'>
            {questions[currentStep].category}
          </Badge>
          <CardTitle className='text-2xl'>
            {questions[currentStep].question}
          </CardTitle>
        </CardHeader>
        <CardContent className='space-y-4'>
          <RadioGroup
            value={answers[currentStep] || ''}
            onValueChange={handleAnswer}
            className='flex flex-wrap justify-between'
          >
            {questions[currentStep].options
              .filter(option => currentStep !== 1 || option.value.includes(answers[0]))
              .map(option => (
                <div
                  key={option.value}
                  className='flex w-full sm:w-[49%] items-start space-x-2 p-4 rounded-none border hover:bg-muted/50 cursor-pointer transition-colors'
                  onClick={() => handleAnswer(option.value)}
                >
                  <RadioGroupItem value={option.value} id={option.value} className='w-4 h-4 mt-1' />
                  <Label
                    htmlFor={option.value}
                    className='flex-1 cursor-pointer leading-relaxed'
                  >
                    {option.label}
                  </Label>
                </div>
            ))}
          </RadioGroup>
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className='flex justify-between'>
        <Button
          className='shadow-lg rounded-none bg-secondary text-secondary-foreground hover:bg-secondary/80'
          onClick={handleBack}
          disabled={currentStep === 0}
        >
          <FaArrowLeft className='h-4 w-4 mr-1' />
          戻る
        </Button>
        <Button
          className='shadow-lg rounded-none'
          onClick={handleNext}
          disabled={!answers[currentStep]}
        >
          {currentStep === questions.length - 1 ? '結果を見る' : '次へ'}
          <FaArrowRight className='h-4 w-4 ml-1' />
        </Button>
      </div>
    </div>
  )
}

export default MatchPage
