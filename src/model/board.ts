import { type Category, type Clue, type Content, type Game, MAX_SIZE, MIN_SIZE } from './types'

export const uid = () => crypto.randomUUID()

const clamp = (n: number) => Math.min(MAX_SIZE, Math.max(MIN_SIZE, Math.round(n)))

export const newClue = (): Clue => ({ id: uid(), question: {}, answer: {} })

const newCategory = (n: number, rows: number): Category => ({
  id: uid(),
  title: `Category ${n}`,
  clues: Array.from({ length: rows }, newClue),
})

export function createGame(rows: number, cols: number, title = 'Untitled game'): Game {
  rows = clamp(rows)
  cols = clamp(cols)
  return {
    id: uid(),
    title,
    version: 1,
    categories: Array.from({ length: cols }, (_, i) => newCategory(i + 1, rows)),
    rowValues: Array.from({ length: rows }, (_, i) => (i + 1) * 100),
    updatedAt: Date.now(),
  }
}

export const hasContent = (c: Content) => !!(c.text?.trim() || c.imageId)
export const clueHasContent = (c: Clue) => hasContent(c.question) || hasContent(c.answer)

/** Number of populated clues that would be lost by resizing to rows × cols. */
export function countDroppedClues(game: Game, rows: number, cols: number): number {
  rows = clamp(rows)
  cols = clamp(cols)
  let n = 0
  game.categories.forEach((cat, ci) =>
    cat.clues.forEach((clue, ri) => {
      if ((ci >= cols || ri >= rows) && clueHasContent(clue)) n++
    }),
  )
  return n
}

/** Grow keeps everything and appends blanks; shrink truncates from the end. */
export function resizeBoard(game: Game, rows: number, cols: number): Game {
  rows = clamp(rows)
  cols = clamp(cols)
  const rowValues = Array.from({ length: rows }, (_, i) => game.rowValues[i] ?? (i + 1) * 100)
  const categories = Array.from({ length: cols }, (_, ci) => {
    const cat = game.categories[ci] ?? newCategory(ci + 1, rows)
    return {
      ...cat,
      clues: Array.from({ length: rows }, (_, ri) => cat.clues[ri] ?? newClue()),
    }
  })
  return { ...game, categories, rowValues, updatedAt: Date.now() }
}

/** Image IDs referenced anywhere in the game (for orphan cleanup / export). */
export function imageIds(game: Game): Set<string> {
  const ids = new Set<string>()
  for (const cat of game.categories)
    for (const clue of cat.clues) {
      if (clue.question.imageId) ids.add(clue.question.imageId)
      if (clue.answer.imageId) ids.add(clue.answer.imageId)
    }
  return ids
}
