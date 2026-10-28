export interface Content {
  text?: string
  imageId?: string
  imageAlt?: string
}

export interface Clue {
  id: string
  question: Content
  answer: Content
  dailyDouble?: boolean
}

export interface Category {
  id: string
  title: string
  clues: Clue[]
}

export interface Game {
  id: string
  title: string
  version: 1
  categories: Category[]
  rowValues: number[]
  updatedAt: number
}

export const MIN_SIZE = 1
export const MAX_SIZE = 10
