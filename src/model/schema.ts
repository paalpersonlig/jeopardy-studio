import { z } from 'zod'
import { MAX_SIZE, MIN_SIZE } from './types'

const content = z.object({
  text: z.string().optional(),
  imageId: z.string().optional(),
  imageAlt: z.string().optional(),
})

const clue = z.object({
  id: z.string(),
  question: content,
  answer: content,
  dailyDouble: z.boolean().optional(),
})

const category = z.object({
  id: z.string(),
  title: z.string(),
  clues: z.array(clue).min(MIN_SIZE).max(MAX_SIZE),
})

export const gameSchema = z
  .object({
    id: z.string(),
    title: z.string(),
    version: z.literal(1),
    categories: z.array(category).min(MIN_SIZE).max(MAX_SIZE),
    rowValues: z.array(z.number()).min(MIN_SIZE).max(MAX_SIZE),
    updatedAt: z.number(),
  })
  .refine(
    (g) => g.categories.every((c) => c.clues.length === g.rowValues.length),
    'every category must have one clue per row',
  )
