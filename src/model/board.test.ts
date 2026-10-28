import { describe, expect, it } from 'vitest'
import { countDroppedClues, createGame, imageIds, resizeBoard } from './board'
import { gameSchema } from './schema'

describe('board', () => {
  it('creates a valid rows × cols game', () => {
    const g = createGame(5, 6)
    expect(g.categories).toHaveLength(6)
    expect(g.categories[0].clues).toHaveLength(5)
    expect(g.rowValues).toEqual([100, 200, 300, 400, 500])
    expect(gameSchema.safeParse(g).success).toBe(true)
  })

  it('clamps size to limits', () => {
    const g = createGame(99, 0)
    expect(g.categories).toHaveLength(1)
    expect(g.rowValues).toHaveLength(10)
  })

  it('preserves content when growing', () => {
    const g = createGame(2, 2)
    g.categories[1].clues[1].question.text = 'keep me'
    const r = resizeBoard(g, 4, 3)
    expect(r.categories).toHaveLength(3)
    expect(r.rowValues).toHaveLength(4)
    expect(r.categories[1].clues[1].question.text).toBe('keep me')
    expect(gameSchema.safeParse(r).success).toBe(true)
  })

  it('truncates when shrinking and counts dropped clues', () => {
    const g = createGame(3, 3)
    g.categories[2].clues[0].question.text = 'x'
    g.categories[0].clues[2].answer.imageId = 'img'
    g.categories[0].clues[0].question.text = 'stay'
    expect(countDroppedClues(g, 2, 2)).toBe(2)
    const r = resizeBoard(g, 2, 2)
    expect(r.categories).toHaveLength(2)
    expect(r.categories[0].clues[0].question.text).toBe('stay')
    expect(gameSchema.safeParse(r).success).toBe(true)
  })

  it('collects image ids', () => {
    const g = createGame(2, 2)
    g.categories[0].clues[0].question.imageId = 'a'
    g.categories[1].clues[1].answer.imageId = 'b'
    expect([...imageIds(g)].sort()).toEqual(['a', 'b'])
  })
})
