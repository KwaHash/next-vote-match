'use client'

import { ProportionCandidateCard } from '@/components/card/proportion-candidate-card'
import LoadingIndicator from '@/components/loading-indicator'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { blocks } from '@/constants/areas'
import { parties } from '@/constants/parties'
import { selectedProportionalDescription } from '@/lib/utils'
import { IPolitician } from '@/types/politician'
import axios from 'axios'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { FaHeart } from 'react-icons/fa'
import { FaChevronRight } from 'react-icons/fa6'
import { HiMiniUserGroup } from 'react-icons/hi2'
import { PiMapPinAreaFill } from 'react-icons/pi'

const ProportionCandidatesPage = () => {
  const [filterProportional, setFilterProportional] = useState<string>('北海道')
  const [filterParty, setFilterParty] = useState('全国')
  const [allPoliticians, setAllPoliticians] = useState<IPolitician[]>([])
  const [filteredPoliticians, setFilteredPoliticians] = useState<IPolitician[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchPoliticians = async () => {
      setIsLoading(true)
      try {
        const { data: { politicians } } = await axios.get('/api/candidates/proportion', {
          params: { proportional: filterProportional }
        })
        setAllPoliticians(politicians)
        setFilteredPoliticians(politicians)
      } catch (err) {
        if (axios.isAxiosError(err)) {
          const error = err.response?.data?.error
        }
      }
      setIsLoading(false)
    }
    fetchPoliticians()
  }, [filterProportional])

  useEffect(() => {
    if (filterParty !== '全国') {
      const filteredPoliticians = allPoliticians.filter((politician) => politician.party?.includes(filterParty))
      setFilteredPoliticians(filteredPoliticians)
    } else {
      setFilteredPoliticians(allPoliticians)
    }
     // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterParty])

  if (isLoading) {
    return <LoadingIndicator />
  }

  return (
    <div className='min-h-screen bg-gradient-to-b from-background to-muted/20'>
      {/* Hero */}
      <section className='py-20 bg-gradient-to-br from-primary/10 to-accent/10'>
        <div className='container'>
          <div className='max-w-3xl mx-auto text-center space-y-4'>
            <h1 className='text-4xl md:text-5xl font-bold'>第51回衆議院議員選挙(比例代表)</h1>
            <p className='text-xl text-muted-foreground'>公示日: 	2026年01月27日、 投票日: 2026年02月08日</p>
          </div>
        </div>
      </section>

      {/* Search & Filter */}
      <section className='w-full max-w-6xl mx-auto px-4 md:px-8 py-8 bg-background/50 backdrop-blur-sm border-b'>
        <div className='flex flex-col sm:flex-row flex-wrap gap-4 justify-between'>
          <div className='flex items-center gap-2'>
            <Label className='font-normal w-12'>地域</Label>
            <Select value={filterProportional} onValueChange={setFilterProportional}>
              <SelectTrigger className='flex-1 sm:w-[300px] rounded-none flex items-center'>
                <PiMapPinAreaFill className='h-5 w-5 mr-3 text-muted-foreground' />
                <SelectValue placeholder='地域' />
              </SelectTrigger>
              <SelectContent>
                {blocks.map((block) => (
                  <SelectItem key={block.id} value={block.value}>
                    {block.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className='flex items-center gap-2'>
            <Label className='font-normal w-12'>政党</Label>
            <Select value={filterParty} onValueChange={setFilterParty}>
              <SelectTrigger className='flex-1 sm:w-[300px] rounded-none flex items-center'>
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
          <div className='flex items-center gap-2'>
            <FaChevronRight className='h-4 w-4 text-teal-600 dark:text-teal-400' />
            <h3 className='text-base font-bold text-foreground'>
              比例代表 {filterProportional}
              <span className='ml-2 text-sm leading-6'>{selectedProportionalDescription(filterProportional)}</span>
            </h3>
          </div>
        </div>
      </section>

      {/* Candidates List */}
      <section className='w-full max-w-6xl mx-auto px-4 md:px-8 py-12'>
        <div className='flex justify-between items-center mb-6'>
          <div className='text-sm'>
            現在、立候補されている候補者は{filteredPoliticians.length}名いらっしゃいます。
          </div>
        </div>

        <div className='rounded-md border'>
          <Table className='w-full'>
            <TableHeader>
              <TableRow className='bg-gray-600 hover:bg-gray-600'>
                <TableHead className='border border-gray-500 text-white text-center font-normal h-12 w-[40px] p-0.5'>結果</TableHead>
                <TableHead className='border border-gray-500 text-white text-center font-normal h-12 w-[40px] p-0.5'>名簿順位</TableHead>
                <TableHead className='border border-gray-500 text-white text-center font-normal h-12 w-[150px] p-1'>写真</TableHead>
                <TableHead className='border border-gray-500 text-white text-center font-normal h-12 w-[150px] p-1'>候補者</TableHead>
                <TableHead className='border border-gray-500 text-white text-center font-normal h-12 w-[150px] p-1'>政党</TableHead>
                <TableHead className='border border-gray-500 text-white text-center font-normal h-12 w-[100px] p-0.5'>獲得票</TableHead>
                <TableHead className='border border-gray-500 text-white text-center font-normal h-12 w-[50px] p-0.5'>前元新</TableHead>
                <TableHead className='border border-gray-500 text-white text-center font-normal h-12 w-[50px] p-0.5'>当選数</TableHead>
                <TableHead className='border border-gray-500 text-white text-center font-normal h-12 w-[100px] p-1'>小選挙区</TableHead>
                <TableHead className='border border-gray-500 text-white text-center font-normal h-12 p-1'>サイト</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPoliticians.map((politician) => (
                <ProportionCandidateCard key={politician.id} {...politician} />
              ))}
            </TableBody>
          </Table>
        </div>
      </section>

      {/* CTA */}
      <section className='py-20 bg-gradient-to-br from-primary/10 to-accent/10'>
        <div className='container'>
          <div className='max-w-3xl mx-auto text-center space-y-6'>
            <h2 className='text-3xl font-bold'>あなたにぴったりの推しを見つけよう</h2>
            <p className='text-lg text-muted-foreground'>
              診断であなたの価値観に合った政治家をマッチング
            </p>
            <Button size='lg' className='text-base h-14 px-8 rounded-none bg-primary hover:bg-primary/90 transition-all duration-500' asChild>
              <Link href='/match'>
                <FaHeart className='h-5 w-5 mr-1' />
                <span>診断を始める</span>
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}

export default ProportionCandidatesPage
