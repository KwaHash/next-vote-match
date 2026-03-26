'use client'

import InputField from '@/components/input/input-field'
import RequiredLabel from '@/components/label/required-label'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { prefectures } from '@/constants/areas'
import { cn } from '@/lib/utils'
import { yupResolver } from '@hookform/resolvers/yup'
import axios from 'axios'
import { useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { FiMail, FiPhone, FiUser } from 'react-icons/fi'
import { HiOutlineBuildingOffice2 } from 'react-icons/hi2'
import { MdOutlineDescription } from 'react-icons/md'
import * as yup from 'yup'

interface ISupportResourceForm {
  provider_type: string
  provider_name: string
  contact_email: string
  contact_phone?: string
  prefecture: string
  municipality?: string
  content: string
  price_type: string
  availability: string
  coverage_area?: string[]
}

const providerTypes = [
  { value: '個人', label: '個人' },
  { value: '法人', label: '法人' },
  { value: '団体', label: '団体' },
  { value: '自治体', label: '自治体' },
]

const priceTypes = [
  { value: '無料', label: '無料' },
  { value: '有料', label: '有料' },
  { value: '要相談', label: '要相談' },
]

const availabilityTypes = [
  { value: '常時', label: '常時' },
  { value: '選挙期間のみ', label: '選挙期間のみ' },
]

const schema = yup.object().shape({
  provider_type: yup.string().required('提供者タイプは必須です'),
  provider_name: yup.string().required('提供者名は必須です'),
  contact_email: yup.string().required('メールアドレスは必須です').email('メールアドレスを正しく入力してください'),
  contact_phone: yup.string().optional(),
  prefecture: yup.string().required('都道府県は必須です'),
  municipality: yup.string().optional(),
  content: yup.string().required('支援内容は必須です'),
  price_type: yup.string().required('価格タイプは必須です'),
  availability: yup.string().required('提供時期は必須です'),
  coverage_area: yup.array().of(yup.string().required()).optional(),
})

export default function SupportResourceRegisterPage() {
  const [error, setError] = useState<string>('')
  const [success, setSuccess] = useState<string>('')

  const { control, handleSubmit, reset, formState: { errors } } = useForm<ISupportResourceForm>({
    resolver: yupResolver(schema),
    defaultValues: {
      provider_type: '個人',
      prefecture: '北海道',
      price_type: '無料',
      availability: '常時',
      coverage_area: ['北海道'],
    },
  })

  const onSubmit = async (data: ISupportResourceForm) => {
    setError('')
    setSuccess('')

    try {
      const { data: { resource_id } } = await axios.post('/api/resources/register', data)
      if (resource_id) {
        setSuccess('支援リソースが正常に登録されました。')
        reset()
      }
    } catch (err) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.error || '登録に失敗しました。')
      }
    }
  }

  return (
    <div className='w-full max-w-5xl mx-auto px-4 md:px-8 py-8 md:py-16 min-h-full'>
      <h2 className='text-2xl text-gray-900 text-center mb-8 font-bold'>支援リソース登録</h2>

      <form onSubmit={handleSubmit(onSubmit)} className='flex flex-col gap-6'>
        <section className='bg-white w-full rounded-lg shadow-sm overflow-hidden border border-gray-200/80'>
          <div className='bg-green-500 px-6 py-3 border-b border-green-500/80'>
            <h3 className='text-lg font-medium text-white flex items-center gap-2'>
              <HiOutlineBuildingOffice2 className='text-xl shrink-0' />
              <span>提供者情報</span>
            </h3>
          </div>
          <div className='px-6 md:px-8 py-8 flex flex-col gap-6'>
            <div className='flex flex-col md:flex-row gap-6 md:gap-3'>
              <div className='flex flex-col gap-2 md:w-1/2'>
                <div className='flex gap-1 items-center'>
                  <FiUser className='text-lg' />
                  <Label htmlFor='provider_type' className='py-1'>提供者タイプ</Label>
                  <RequiredLabel />
                </div>
                <Controller
                  name='provider_type'
                  control={control}
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger className='rounded-none'>
                        <SelectValue placeholder='選択してください' />
                      </SelectTrigger>
                      <SelectContent>
                        {providerTypes.map(({ value, label }) => (
                          <SelectItem key={value} value={value}>{label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.provider_type && (
                  <p className='text-xs text-m-red'>{errors.provider_type.message}</p>
                )}
              </div>

              <div className='flex flex-col gap-2 md:w-1/2'>
                <div className='flex gap-1 items-center'>
                  <FiUser className='text-lg' />
                  <Label htmlFor='provider_name' className='py-1'>提供者名</Label>
                  <RequiredLabel />
                </div>
                <InputField id='provider_name' control={control} className='w-full' placeholder='例: 山田太郎 / 株式会社〇〇' />
                {errors.provider_name && (
                  <p className='text-xs text-m-red'>{errors.provider_name.message}</p>
                )}
              </div>
            </div>
            <div className='flex flex-col md:flex-row gap-6 md:gap-3'>
              <div className='flex flex-col gap-2 md:w-1/2'>
                <div className='flex gap-1 items-center'>
                  <FiMail className='text-lg' />
                  <Label htmlFor='contact_email' className='py-1'>メールアドレス</Label>
                  <RequiredLabel />
                </div>
                <InputField id='contact_email' control={control} className='w-full' placeholder='例: example@email.com' />
                {errors.contact_email && (
                  <p className='text-xs text-m-red'>{errors.contact_email.message}</p>
                )}
              </div>

              <div className='flex flex-col gap-2 md:w-1/2'>
                <div className='flex gap-1 items-center'>
                  <FiPhone className='text-lg' />
                  <Label htmlFor='contact_phone' className='py-1'>電話番号</Label>
                </div>
                <InputField id='contact_phone' control={control} className='w-full' placeholder='例: 090-1234-5678' />
              </div>
            </div>
            <div className='flex flex-col md:flex-row gap-6 md:gap-3'>
              <div className='flex flex-col gap-2 md:w-1/2'>
                <div className='flex gap-1 items-center'>
                  <Label htmlFor='prefecture' className='py-1'>都道府県</Label>
                  <RequiredLabel />
                </div>
                <Controller
                  name='prefecture'
                  control={control}
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger className='rounded-none'>
                        <SelectValue placeholder='選択してください' />
                      </SelectTrigger>
                      <SelectContent>
                        {prefectures.map(({ id, label }) => (
                          <SelectItem key={id} value={label}>{label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.prefecture && (
                  <p className='text-xs text-m-red'>{errors.prefecture.message}</p>
                )}
              </div>

              <div className='flex flex-col gap-2 md:w-1/2'>
                <div className='flex gap-1 items-center'>
                  <Label htmlFor='municipality' className='py-1'>市区町村</Label>
                </div>
                <InputField id='municipality' control={control} className='w-full' placeholder='例: 千代田区' />
              </div>
            </div>
          </div>
        </section>

        <section className='bg-white w-full rounded-lg shadow-sm overflow-hidden border border-gray-200/80'>
          <div className='bg-green-500 px-6 py-3 border-b border-green-500/80'>
            <h3 className='text-lg font-medium text-white flex items-center gap-2'>
              <MdOutlineDescription className='text-xl shrink-0' />
              <span>リソース内容</span>
            </h3>
          </div>
          <div className='px-6 md:px-8 py-8 flex flex-col gap-6'>
            <div className='flex flex-col gap-2'>
              <div className='flex gap-1 items-center'>
                <Label htmlFor='content' className='py-1'>支援内容</Label>
                <RequiredLabel />
              </div>
              <Controller
                name='content'
                control={control}
                defaultValue=''
                render={({ field }) => (
                  <Textarea
                    {...field}
                    id='content'
                    className='rounded-none min-h-[200px] leading-6'
                    placeholder={`提供できる支援リソースの内容を自由に記述してください。\n例:      − 選挙ポスターのデザイン制作（A3サイズ）\n            − 印刷手配も可能\n            − 過去に地方選挙で5名の候補者を支援した実績あり\n`}
                  />
                )}
              />
              {errors.content && (
                <p className='text-xs text-m-red'>{errors.content.message}</p>
              )}
            </div>

            <div className='flex flex-col md:flex-row gap-6 md:gap-3'>
              <div className='flex flex-col gap-2 md:w-1/2'>
                <div className='flex gap-1 items-center'>
                  <Label htmlFor='price_type' className='py-1'>価格タイプ</Label>
                  <RequiredLabel />
                </div>
                <Controller
                  name='price_type'
                  control={control}
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger className='rounded-none'>
                        <SelectValue placeholder='選択してください' />
                      </SelectTrigger>
                      <SelectContent>
                        {priceTypes.map(({ value, label }) => (
                          <SelectItem key={value} value={value}>{label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.price_type && (
                  <p className='text-xs text-m-red'>{errors.price_type.message}</p>
                )}
              </div>

              <div className='flex flex-col gap-2 md:w-1/2'>
                <div className='flex gap-1 items-center'>
                  <Label htmlFor='availability' className='py-1'>提供時期</Label>
                  <RequiredLabel />
                </div>
                <Controller
                  name='availability'
                  control={control}
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger className='rounded-none'>
                        <SelectValue placeholder='選択してください' />
                      </SelectTrigger>
                      <SelectContent>
                        {availabilityTypes.map(({ value, label }) => (
                          <SelectItem key={value} value={value}>{label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.availability && (
                  <p className='text-xs text-m-red'>{errors.availability.message}</p>
                )}
              </div>
            </div>

            <div className='flex flex-col gap-2'>
              <div className='flex gap-1 items-center'>
                <Label>対応エリア</Label>
              </div>
              <Controller
                name='coverage_area'
                control={control}
                defaultValue={[]}
                render={({ field }) => (
                  <div className='flex flex-wrap gap-2'>
                    <Button
                      type='button'
                      variant='outline'
                      size='sm'
                      className={cn(
                        'rounded-none px-3 py-1 h-auto min-h-0 font-normal transition-colors',
                        field.value?.includes('全国')
                          ? 'bg-m-blue text-white border-m-blue hover:bg-m-blue hover:text-white'
                          : 'bg-white hover:bg-white text-gray-700 hover:text-gray-700 border-gray-300 hover:border-m-blue'
                      )}
                      onClick={() => {
                        if (field.value?.includes('全国')) {
                          field.onChange([])
                        } else {
                          field.onChange(['全国'])
                        }
                      }}
                    >
                      全国
                    </Button>
                    {prefectures.map(({ id, label }) => (
                      <Button
                        type='button'
                        key={id}
                        variant='outline'
                        size='sm'
                        className={cn(
                          'rounded-none px-3 py-1 h-auto min-h-0 font-normal transition-colors',
                          field.value?.includes(label)
                            ? 'bg-m-blue text-white border-m-blue hover:bg-m-blue hover:text-white'
                            : 'bg-white hover:bg-white text-gray-700 hover:text-gray-700 border-gray-300 hover:border-m-blue'
                        )}
                        onClick={() => {
                          const current = field.value?.filter(v => v !== '全国') || []
                          if (current.includes(label)) {
                            field.onChange(current.filter(v => v !== label))
                          } else {
                            field.onChange([...current, label])
                          }
                        }}
                      >
                        {label}
                      </Button>
                    ))}
                  </div>
                )}
              />
            </div>
          </div>
        </section>

        {error && (
          <p className='w-full bg-red-50 border-l-4 border-red-400 p-4 text-sm text-red-700'>
            {error}
          </p>
        )}

        {success && (
          <p className='w-full bg-green-50 border-l-4 border-green-400 p-4 text-sm text-green-700'>
            {success}
          </p>
        )}

        <div className='flex items-start'>
          <Button
            type='submit'
            variant='default'
            className='w-full max-w-64 mt-4 mx-auto h-auto py-3 text-base rounded-full bg-m-blue hover:bg-m-hover-blue transform transition-all duration-300'
          >
            登録する
          </Button>
        </div>
      </form>
    </div>
  )
}
