import { prefectures } from '@/constants/areas'
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const selectedDistrictDescription = (district: string) => {
  for (const prefecture of prefectures) {
    if (Array.isArray(prefecture.districts)) {
      const districtObj = prefecture.districts.find(d => d.label === district)
      if (districtObj) {
        return districtObj.value
      }
    }
  }
  return undefined
}