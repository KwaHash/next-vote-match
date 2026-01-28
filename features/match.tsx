'use client'

import { PoliticianCard } from '@/components/card/politician-card'
import LoadingIndicator from '@/components/loading-indicator'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Progress } from '@/components/ui/progress'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { getPrefecturesAndDistrictsByKeyword, IDistrict, IPrefecture, prefectures } from '@/constants/areas'
import { questions } from '@/constants/match'
import { parties } from '@/constants/parties'
import { selectedDistrictDescription } from '@/lib/utils'
import { IPolitician } from '@/types/politician'
import axios from 'axios'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { FaSearch } from 'react-icons/fa'
import { FaArrowLeft, FaArrowRight, FaChevronRight } from 'react-icons/fa6'
import { HiMiniUserGroup } from 'react-icons/hi2'
import { PiMapPinAreaFill } from 'react-icons/pi'

const MatchPage = () => {
  const [selectPrefectures, setSelectPrefectures] = useState<IPrefecture[]>([])
  const [filterPrefecture, setFilterPrefecture] = useState<string>('北海道')
  const [selectDistricts, setSelectDistricts] = useState<IDistrict[]>([])
  const [filterDistrict, setFilterDistrict] = useState<string>('北海道1区')
  const [filterParty, setFilterParty] = useState('全国')
  const [searchQuery, setSearchQuery] = useState('')
  const [currentStep, setCurrentStep] = useState(0)
  const [answers, setAnswers] = useState<Record<number, string>>({})
  const [showResults, setShowResults] = useState(false)
  const [filteredPoliticians, setFilteredPoliticians] = useState<IPolitician[]>([])
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: 'smooth' })
      setSelectPrefectures(prefectures)
      setSelectDistricts(prefectures[0].districts)
      setIsLoading(false)
    }, 100)
  }, [])

  const handlePrefectureChange = (value: string) => {
    setFilterPrefecture(value)
    const pref = prefectures.find(p => p.value === value)
    setFilterDistrict(pref?.districts[0].label || `${value}1区`)
    setSelectDistricts(pref?.districts || [])
  }

  const progress = ((currentStep + 1) / questions.length) * 100

  const handleSearch = async () => {
    const trimmed = searchQuery.trim()
    const isZipcode = /^\d{7}$|^\d{3}-\d{4}$/.test(trimmed.replace(/\s/g, ''))
    let keyword = ''
    let somePrefectures = prefectures
    let someDistricts = prefectures.find(p => p.value === filterPrefecture)?.districts
    setError(null)
    setIsLoading(true)
    if (!trimmed || !isZipcode) {
      keyword = trimmed.replace(/\s/g, '')
    } else {
      await fetch(`https://zipcloud.ibsnet.co.jp/api/search?zipcode=${encodeURIComponent(trimmed.replace('-', ''))}`)
      .then((response) => response.json()).then((data) => {
        if (data.status === 200 && data.results?.[0]) {
          const { address2 } = data.results[0]
          keyword = address2
        }
      })
      .catch((error) => {
        console.error('Error:', error)
      })
    }
    const prefecturesAndDistricts = getPrefecturesAndDistrictsByKeyword(keyword)
    if (prefecturesAndDistricts.length > 0) {
      const { prefecture, districts } = prefecturesAndDistricts[0]
      somePrefectures = [prefecture]
      someDistricts = districts
      setFilterPrefecture(prefecture.value)
      setFilterDistrict(districts[0].label)
    } else {
      if (trimmed)  setError('該当する地域が見つかりませんでした')
    }
    setSelectPrefectures(somePrefectures)
    setSelectDistricts(someDistricts || [])
    setIsLoading(false)
  }

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
      } catch {
        // Handle error silently
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
            質問 {currentStep + 1} / {questions.length + 1}
          </span>
          <span>{Math.round(progress)}%</span>
        </div>
        <Progress value={progress} className='h-2' />
      </div>

      {/* Question Card */}
      { currentStep === 0 ? (
        <Card className='shadow-lg rounded-sm'>
          <CardHeader>
            <Badge className='w-fit mb-2 hover:bg-primary'>選挙区と政党支持</Badge>
            <CardTitle className='text-xl'>選挙区と支持政党を教えてください</CardTitle>
          </CardHeader>
          <CardContent>
          <div className='w-full '>
            <div className='w-full bg-background/50 backdrop-blur-sm mb-4'>
              <form onSubmit={(e) => { e.preventDefault(); handleSearch() }} className='flex flex-col sm:flex-row gap-2 md:gap-3'>
                <div className='flex-1 relative flex'>
                  <div className='relative flex-1'>
                    <FaSearch className='absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground' />
                    <Input
                      placeholder='地名や郵便番号で検索...'
                      className='pl-10 rounded-none'
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                </div>
                <Button
                  variant='default'
                  size='sm'
                  className='rounded-none px-4 flex-shrink-0 h-10 bg-secondary hover:bg-secondary/80 transition-all duration-500'
                  type='submit'
                >
                  <FaSearch className='h-4 w-4 mr-1' />
                  <span>検索</span>
                </Button>
              </form>
            </div>
            {error ? (
              <p className='w-full mb-4 bg-red-50 border-l-4 border-red-400 p-4 text-sm text-red-700'>{error}</p>
            ) : (
              <div className='w-full bg-background/50 backdrop-blur-sm'>
                <div className='flex flex-col sm:flex-row flex-wrap gap-4 justify-between'>
                  <div className='flex items-center gap-2'>
                    <Label className='font-normal w-12'>地域</Label>
                    <Select value={filterPrefecture} onValueChange={handlePrefectureChange}>
                      <SelectTrigger className='flex-1 sm:w-[230px] rounded-none flex items-center'>
                        <PiMapPinAreaFill className='h-5 w-5 mr-3 text-muted-foreground' />
                        <SelectValue placeholder='地域' />
                      </SelectTrigger>
                      <SelectContent>
                        {selectPrefectures.map((prefecture) => (
                          <SelectItem key={prefecture.id} value={prefecture.value}>
                            {prefecture.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className='flex items-center gap-2'>
                    <Label className='font-normal w-12'>選挙区</Label>
                    <Select value={filterDistrict} onValueChange={setFilterDistrict}>
                      <SelectTrigger className='flex-1 sm:w-[230px] rounded-none flex items-center'>
                        <PiMapPinAreaFill className='h-5 w-5 mr-3 text-muted-foreground' />
                        <SelectValue placeholder='選挙区' />
                      </SelectTrigger>
                      <SelectContent>
                        {selectDistricts.map((district) => (
                          <SelectItem key={district.label} value={district.label}>
                            {district.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className='flex items-center gap-2'>
                    <Label className='font-normal w-12'>政党</Label>
                    <Select value={filterParty} onValueChange={setFilterParty}>
                      <SelectTrigger className='flex-1 sm:w-[230px] rounded-none flex items-center'>
                        <HiMiniUserGroup className='h-5 w-5 mr-3 text-muted-foreground' />
                        <SelectValue placeholder='政党' />
                      </SelectTrigger>
                      <SelectContent>
                        {parties.map((party) => (
                          <SelectItem key={party.id} value={party.value}>
                            {party.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className='mt-6 w-full mb-4 bg-green-50 border-l-4 border-green-400 p-4 text-sm text-green-700'>
                  <div className='flex items-center gap-2 mb-3'>
                    <FaChevronRight className='h-4 w-4 text-green-600 dark:text-green-400' />
                    <h3 className='text-base font-bold text-foreground'>{filterDistrict}</h3>
                  </div>
                  <p className='text-sm text-gray-700 leading-6'>
                    {selectedDistrictDescription(filterDistrict) ?? ''}
                  </p>
                </div>
              </div>
            )}
          </div>
          </CardContent>
        </Card>
      ) : (
        <Card className='shadow-lg rounded-sm'>
          <CardHeader>
            <Badge className='w-fit mb-2 hover:bg-primary'>
              {questions[currentStep].category}
            </Badge>
            <CardTitle className='text-xl'>
              {questions[currentStep].question}
            </CardTitle>
          </CardHeader>
          <CardContent className='space-y-4'>
            <RadioGroup
              value={answers[currentStep] || ''}
              onValueChange={handleAnswer}
              className='flex flex-wrap justify-between'
            >
              {questions[currentStep].options.map(option => (
                <div key={option.value}
                  className='flex w-full sm:w-[49.5%] items-start space-x-2 px-3 py-4 rounded-none border hover:bg-muted/50 cursor-pointer transition-colors'
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
      )}

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
          disabled={currentStep > 0 && !answers[currentStep]}
        >
          {currentStep === questions.length - 1 ? '結果を見る' : '次へ'}
          <FaArrowRight className='h-4 w-4 ml-1' />
        </Button>
      </div>
    </div>
  )
}

export default MatchPage
