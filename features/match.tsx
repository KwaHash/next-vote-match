'use client'

/**
 * 政策マッチング診断
 *
 * 変更点（2026-06-25）:
 *   - Step 0: 〒入力で選挙区を自動判定。選挙種別セレクタを追加。
 *   - handleNext: district / party / answers を API に渡すよう修正。
 *   - 結果画面: マッチスコアを prominently 表示。カード型UIに刷新。
 */

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
import { getPrefecturesAndDistrictsByKeyword, IDistrict, IPrefecture, prefectures } from '@/constants/areas'
import { questions } from '@/constants/match'
import { parties } from '@/constants/parties'
import { selectedDistrictDescription } from '@/lib/utils'
import { IPolitician } from '@/types/politician'
import axios from 'axios'
import { useEffect, useState } from 'react'
import { FaSearch } from 'react-icons/fa'
import { FaArrowLeft, FaArrowRight, FaChevronRight } from 'react-icons/fa6'
import { HiMiniUserGroup } from 'react-icons/hi2'
import { PiMapPinAreaFill } from 'react-icons/pi'

// 選挙種別定義
const ELECTION_TYPES = [
  { value: 'shugiin', label: '衆議院議員選挙', note: '小選挙区・比例代表' },
  { value: 'sangiin', label: '参議院議員選挙', note: '選挙区・比例代表' },
  { value: 'chiji',   label: '都道府県知事選挙', note: '都道府県単位' },
  { value: 'kengi',   label: '都道府県議会議員選挙', note: '都道府県内選挙区' },
  { value: 'shucho',  label: '市区町村長選挙', note: '市区町村単位' },
  { value: 'shigi',   label: '市区町村議会議員選挙', note: '市区町村内' },
]

// マッチスコアに応じた色
function scoreColor(score: number | null) {
  if (score === null) return { text: 'text-muted-foreground', bg: 'bg-muted', bar: 'bg-gray-400' }
  if (score >= 70) return { text: 'text-emerald-600', bg: 'bg-emerald-50', bar: 'bg-emerald-500' }
  if (score >= 50) return { text: 'text-amber-600', bg: 'bg-amber-50', bar: 'bg-amber-400' }
  return { text: 'text-rose-600', bg: 'bg-rose-50', bar: 'bg-rose-400' }
}

function scoreLabel(score: number | null) {
  if (score === null) return '—'
  if (score >= 80) return '非常に近い'
  if (score >= 60) return 'やや近い'
  if (score >= 40) return '中程度'
  return 'やや遠い'
}

// ── 結果カード ──────────────────────────────────────────

type PoliticianWithScore = IPolitician & { matchScore: number | null; matchCount?: number; totalCount?: number }

function MatchResultCard({ p }: { p: PoliticianWithScore }) {
  const { text, bg, bar } = scoreColor(p.matchScore)
  const age = p.birth_date
    ? new Date().getFullYear() - new Date(p.birth_date).getFullYear()
    : null

  return (
    <div className='rounded-xl border border-border bg-card p-4 flex flex-col sm:flex-row gap-4'>
      {/* スコア */}
      <div className={`shrink-0 flex flex-col items-center justify-center w-full sm:w-24 rounded-lg ${bg} px-3 py-3 text-center`}>
        <span className={`text-3xl font-black ${text}`}>
          {p.matchScore !== null ? `${p.matchScore}%` : '—'}
        </span>
        <span className={`text-[11px] font-medium mt-0.5 ${text}`}>
          {scoreLabel(p.matchScore)}
        </span>
        {p.totalCount != null && p.totalCount > 0 && (
          <span className='text-[10px] text-muted-foreground mt-1'>
            {p.matchCount}/{p.totalCount}問一致
          </span>
        )}
      </div>

      {/* 候補者情報 */}
      <div className='flex-1 min-w-0'>
        <div className='flex flex-wrap items-center gap-2 mb-1.5'>
          <span className='text-base font-bold text-foreground'>{p.kanji_name}</span>
          {p.party && (
            <span className='text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground border border-border'>
              {p.party}
            </span>
          )}
          {p.shin && (
            <span className={`text-xs px-2 py-0.5 rounded-full border ${
              p.shin === '現職' ? 'bg-blue-50 border-blue-200 text-blue-700'
              : p.shin === '新人' ? 'bg-green-50 border-green-200 text-green-700'
              : 'bg-gray-50 border-gray-200 text-gray-600'
            }`}>
              {p.shin}
            </span>
          )}
        </div>

        <div className='flex flex-wrap gap-3 text-xs text-muted-foreground mb-2'>
          {p.district && <span>📍 {p.district}</span>}
          {age && <span>🎂 {age}歳</span>}
          {p.shu_count != null && p.shu_count > 0 && <span>衆議院 {p.shu_count}期</span>}
          {p.san_count != null && p.san_count > 0 && <span>参議院 {p.san_count}期</span>}
        </div>

        {/* マッチバー */}
        {p.matchScore !== null && (
          <div className='flex items-center gap-2'>
            <div className='flex-1 h-1.5 rounded-full bg-muted overflow-hidden'>
              <div className={`h-full rounded-full ${bar}`} style={{ width: `${p.matchScore}%` }} />
            </div>
            <span className={`text-[11px] font-semibold tabular-nums w-8 text-right ${text}`}>
              {p.matchScore}%
            </span>
          </div>
        )}

        {/* Webサイト */}
        {p.website && (
          <a
            href={p.website}
            target='_blank'
            rel='noopener noreferrer'
            className='mt-2 inline-block text-xs text-primary hover:underline'
          >
            公式サイト →
          </a>
        )}
      </div>
    </div>
  )
}

// ── メインコンポーネント ─────────────────────────────────

const MatchPage = () => {
  const [selectPrefectures, setSelectPrefectures] = useState<IPrefecture[]>([])
  const [filterPrefecture, setFilterPrefecture] = useState<string>('北海道')
  const [selectDistricts, setSelectDistricts] = useState<IDistrict[]>([])
  const [filterDistrict, setFilterDistrict] = useState<string>('北海道1区')
  const [filterParty, setFilterParty] = useState('全て政党')
  const [filterElectionType, setFilterElectionType] = useState('shugiin')
  const [searchQuery, setSearchQuery] = useState('')
  const [districtDetected, setDistrictDetected] = useState(false)  // 〒で自動判定できたか
  const [currentStep, setCurrentStep] = useState(0)
  const [answers, setAnswers] = useState<Record<number, string>>({})
  const [showResults, setShowResults] = useState(false)
  const [filteredPoliticians, setFilteredPoliticians] = useState<PoliticianWithScore[]>([])
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
    setDistrictDetected(false)
  }

  const progress = ((currentStep + 1) / questions.length) * 100

  const handleSearch = async () => {
    const trimmed = searchQuery.trim()
    const isZipcode = /^\d{7}$|^\d{3}-\d{4}$/.test(trimmed.replace(/\s/g, ''))
    setError(null)
    setIsLoading(true)
    setDistrictDetected(false)

    let keyword = ''
    let somePrefectures = prefectures
    let someDistricts = prefectures.find(p => p.value === filterPrefecture)?.districts

    if (!trimmed || !isZipcode) {
      keyword = trimmed.replace(/\s/g, '')
    } else {
      try {
        const res = await fetch(
          `https://zipcloud.ibsnet.co.jp/api/search?zipcode=${encodeURIComponent(trimmed.replace('-', ''))}`
        )
        const data = await res.json()
        if (data.status === 200 && data.results?.[0]) {
          keyword = data.results[0].address2  // 市区町村名
        }
      } catch (err) {
        console.error('Zipcode lookup failed:', err instanceof Error ? err.message : 'unknown')
      }
    }

    const matched = getPrefecturesAndDistrictsByKeyword(keyword)
    if (matched.length > 0) {
      const { prefecture, districts } = matched[0]
      somePrefectures = [prefecture]
      someDistricts = districts
      setFilterPrefecture(prefecture.value)
      setFilterDistrict(districts[0].label)
      setDistrictDetected(isZipcode && !!keyword)
    } else {
      if (trimmed) setError('該当する地域が見つかりませんでした。都道府県から手動で選んでください。')
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
      // 最後の質問 → 結果取得
      setIsLoading(true)
      setShowResults(true)
      try {
        const params = new URLSearchParams({ district: filterDistrict })
        if (filterParty && filterParty !== '全て政党') params.set('party', filterParty)
        if (Object.keys(answers).length > 0) params.set('answers', JSON.stringify(answers))

        const { data } = await axios.get<{ politicians: PoliticianWithScore[] }>(
          `/api/politicians?${params.toString()}`
        )
        setFilteredPoliticians(data.politicians)
      } catch {
        // 取得失敗してもクラッシュしない
      }
      setIsLoading(false)
    }
  }

  const handleBack = () => {
    setCurrentStep(Math.max(0, currentStep - 1))
  }

  if (isLoading) return <LoadingIndicator />

  // ── 結果画面 ──
  if (showResults) {
    const hasScores = filteredPoliticians.some(p => p.matchScore !== null)

    return (
      <div className='min-h-screen bg-gradient-to-b from-background to-muted/20'>
        <section className='py-16 bg-gradient-to-br from-primary/10 to-accent/10'>
          <div className='container'>
            <div className='max-w-3xl mx-auto text-center space-y-3'>
              <h1 className='text-3xl md:text-4xl font-bold'>診断完了！</h1>
              <p className='text-lg text-muted-foreground'>
                {filterDistrict} の候補者との政策一致度です
              </p>
              {hasScores && (
                <div className='flex justify-center gap-4 text-sm mt-2'>
                  <span className='flex items-center gap-1 text-emerald-600'>
                    <span className='w-3 h-3 rounded-full bg-emerald-500 inline-block' />
                    70%以上: 非常に近い
                  </span>
                  <span className='flex items-center gap-1 text-amber-600'>
                    <span className='w-3 h-3 rounded-full bg-amber-400 inline-block' />
                    50〜69%: やや近い
                  </span>
                  <span className='flex items-center gap-1 text-rose-600'>
                    <span className='w-3 h-3 rounded-full bg-rose-400 inline-block' />
                    50%未満: やや遠い
                  </span>
                </div>
              )}
            </div>
          </div>
        </section>

        <section className='w-full max-w-3xl mx-auto px-4 md:px-8 pt-8'>
          {filteredPoliticians.length === 0 ? (
            <div className='rounded-xl border border-border bg-card p-8 text-center text-muted-foreground'>
              <p className='text-base font-medium'>該当する候補者が見つかりませんでした。</p>
              <p className='text-sm mt-1'>選挙区・政党フィルタを変えてお試しください。</p>
            </div>
          ) : (
            <div className='space-y-3'>
              {filteredPoliticians.map((p, i) => (
                <div key={p.id ?? i} className='flex gap-2'>
                  <span className='shrink-0 text-sm font-bold text-muted-foreground w-5 pt-4 text-right'>
                    {i + 1}
                  </span>
                  <div className='flex-1'>
                    <MatchResultCard p={p} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        <div className='flex flex-col items-center sm:flex-row gap-4 px-4 justify-center pt-10 pb-20'>
          <Button
            variant='outline'
            className='w-[220px] h-auto px-8 py-3 rounded-none text-base'
            onClick={() => {
              setShowResults(false)
              setCurrentStep(0)
              setAnswers({})
              setFilteredPoliticians([])
            }}
          >
            もう一度診断する
          </Button>
        </div>
      </div>
    )
  }

  // ── 診断ステップ画面 ──
  return (
    <div className='w-full max-w-3xl mx-auto px-4 md:px-8 py-10 min-h-screen bg-gradient-to-b from-background to-muted/20 space-y-6'>
      {/* プログレス */}
      <div className='space-y-1.5'>
        <div className='flex justify-between text-sm text-muted-foreground'>
          <span>質問 {currentStep + 1} / {questions.length + 1}</span>
          <span>{Math.round(progress)}%</span>
        </div>
        <Progress value={progress} className='h-2' />
      </div>

      {/* ステップ 0: 地域・選挙種別選択 */}
      {currentStep === 0 ? (
        <Card className='shadow-lg rounded-sm'>
          <CardHeader>
            <Badge className='w-fit mb-2 hover:bg-primary'>STEP 1 / あなたの地域と選挙</Badge>
            <CardTitle className='text-xl'>郵便番号で選挙区を確認しましょう</CardTitle>
          </CardHeader>
          <CardContent className='space-y-5'>

            {/* 〒 検索 */}
            <div>
              <Label className='text-sm font-semibold mb-1.5 block'>郵便番号または地名</Label>
              <form onSubmit={(e) => { e.preventDefault(); handleSearch() }}
                className='flex flex-col sm:flex-row gap-2'>
                <div className='relative flex-1'>
                  <FaSearch className='absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground' />
                  <Input
                    placeholder='例: 1600000 または「渋谷区」'
                    className='pl-10 rounded-none'
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <Button type='submit' size='sm'
                  className='rounded-none px-4 h-10 bg-secondary hover:bg-secondary/80'>
                  <FaSearch className='h-4 w-4 mr-1' />検索
                </Button>
              </form>
              {districtDetected && (
                <p className='mt-1.5 text-xs text-emerald-600'>
                  ✓ 郵便番号から選挙区を自動判定しました
                </p>
              )}
            </div>

            {error ? (
              <p className='bg-red-50 border-l-4 border-red-400 p-3 text-sm text-red-700 rounded'>{error}</p>
            ) : (
              <div className='space-y-4'>
                {/* 地域・選挙区・政党 */}
                <div className='flex flex-col sm:flex-row flex-wrap gap-3'>
                  <div className='flex items-center gap-2'>
                    <Label className='font-normal w-14 text-sm shrink-0'>都道府県</Label>
                    <Select value={filterPrefecture} onValueChange={handlePrefectureChange}>
                      <SelectTrigger className='flex-1 sm:w-[200px] rounded-none'>
                        <PiMapPinAreaFill className='h-5 w-5 mr-2 text-muted-foreground' />
                        <SelectValue placeholder='都道府県' />
                      </SelectTrigger>
                      <SelectContent>
                        {selectPrefectures.map((p) => (
                          <SelectItem key={p.id} value={p.value}>{p.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className='flex items-center gap-2'>
                    <Label className='font-normal w-14 text-sm shrink-0'>選挙区</Label>
                    <Select value={filterDistrict} onValueChange={setFilterDistrict}>
                      <SelectTrigger className='flex-1 sm:w-[200px] rounded-none'>
                        <PiMapPinAreaFill className='h-5 w-5 mr-2 text-muted-foreground' />
                        <SelectValue placeholder='選挙区' />
                      </SelectTrigger>
                      <SelectContent>
                        {selectDistricts.map((d) => (
                          <SelectItem key={d.label} value={d.label}>{d.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className='flex items-center gap-2'>
                    <Label className='font-normal w-14 text-sm shrink-0'>政党</Label>
                    <Select value={filterParty} onValueChange={setFilterParty}>
                      <SelectTrigger className='flex-1 sm:w-[200px] rounded-none'>
                        <HiMiniUserGroup className='h-5 w-5 mr-2 text-muted-foreground' />
                        <SelectValue placeholder='政党' />
                      </SelectTrigger>
                      <SelectContent>
                        {parties.map((p) => (
                          <SelectItem key={p.id} value={p.value}>{p.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* 選挙種別 */}
                <div>
                  <Label className='text-sm font-semibold mb-1.5 block'>対象の選挙</Label>
                  <div className='flex flex-wrap gap-2'>
                    {ELECTION_TYPES.map((et) => (
                      <button
                        key={et.value}
                        onClick={() => setFilterElectionType(et.value)}
                        className={`flex flex-col items-start px-3 py-2 rounded-lg border text-left text-xs transition-colors ${
                          filterElectionType === et.value
                            ? 'border-primary bg-primary/10 text-foreground font-semibold'
                            : 'border-border text-muted-foreground hover:border-primary/40 hover:bg-muted'
                        }`}
                      >
                        <span className='font-medium'>{et.label}</span>
                        <span className='text-[10px] opacity-60'>{et.note}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* 選挙区確認 */}
                <div className='bg-green-50 border-l-4 border-green-400 p-3 rounded text-sm'>
                  <div className='flex items-center gap-2 mb-1'>
                    <FaChevronRight className='h-3 w-3 text-green-600' />
                    <span className='font-bold text-foreground'>{filterDistrict}</span>
                    <span className='text-xs text-muted-foreground'>
                      / {ELECTION_TYPES.find(e => e.value === filterElectionType)?.label}
                    </span>
                  </div>
                  <p className='text-xs text-gray-600 leading-relaxed'>
                    {selectedDistrictDescription(filterDistrict) ?? ''}
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      ) : (
        /* ステップ 1〜9: 政策質問 */
        <Card className='shadow-lg rounded-sm'>
          <CardHeader>
            <Badge className='w-fit mb-2 hover:bg-primary'>{questions[currentStep].category}</Badge>
            <CardTitle className='text-xl'>{questions[currentStep].question}</CardTitle>
          </CardHeader>
          <CardContent className='space-y-3'>
            <RadioGroup
              value={answers[currentStep] || ''}
              onValueChange={handleAnswer}
              className='flex flex-wrap justify-between'
            >
              {questions[currentStep].options.map(option => (
                <div
                  key={option.value}
                  className='flex w-full sm:w-[49.5%] items-start space-x-2 px-3 py-4 rounded-none border hover:bg-muted/50 cursor-pointer transition-colors'
                  onClick={() => handleAnswer(option.value)}
                >
                  <RadioGroupItem value={option.value} id={option.value} className='w-4 h-4 mt-1' />
                  <Label htmlFor={option.value} className='flex-1 cursor-pointer leading-relaxed text-sm'>
                    {option.label}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </CardContent>
        </Card>
      )}

      {/* ナビゲーション */}
      <div className='flex justify-between'>
        <Button
          className='shadow-lg rounded-none bg-secondary text-secondary-foreground hover:bg-secondary/80'
          onClick={handleBack}
          disabled={currentStep === 0}
        >
          <FaArrowLeft className='h-4 w-4 mr-1' />戻る
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
