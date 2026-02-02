export interface IPolitician {
  id: number
  kanji_name: string
  hiragana_name?: string
  party?: string
  district?: string
  proportional?: string
  shu_count?: number
  san_count?: number
  birth_date?: string
  avatar?: string
  title?: string
  biography?: string
  origin?: string
  shin?: string
  questions_answers?: JSON
  created_at?: Date | string
}