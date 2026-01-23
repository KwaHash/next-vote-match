import { IPolitician } from './politician'

export interface ICandidate extends Omit<IPolitician, 'id' | 'created_at'> {
  id: number
  district: string
  new_comer: string
  politician_id: number
  tickets: number
  member: boolean
  proportional: boolean
  created_at: string
}