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

export function getAgeFromBirthDate(birthDate: string | undefined): string {
  if (!birthDate) return '—'
  const [y, m, d] = birthDate.split('/').map(Number)
  if (!y || !m || !d || m < 1 || m > 12 || d < 1 || d > 31) return '—'

  const birth = new Date(y, m - 1, d)
  if (Number.isNaN(birth.getTime()) || birth.getFullYear() !== y || birth.getMonth() !== m - 1 || birth.getDate() !== d) {
    return '—'
  }

  const today = new Date()
  let age = today.getFullYear() - birth.getFullYear()
  const monthDiff = today.getMonth() - birth.getMonth()
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age -= 1
  }
  return age >= 0 ? `満${age}歳` : '—'
}
