import { prefectures } from '@/constants/areas'
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getDistricts(prefecture: string) {
  return prefectures.find((p) => p.value === prefecture)?.districts
}