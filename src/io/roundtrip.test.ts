import 'fake-indexeddb/auto'
import { expect, it } from 'vitest'
import { createGame } from '../model/board'
import { exportGame } from './exportZip'
import { importGame } from './importZip'

it('export → import round-trips content with fresh ids', async () => {
  const g = createGame(3, 2, 'Trip')
  g.categories[1].clues[2].question.text = 'hello'
  const back = await importGame(await exportGame(g))
  expect(back.id).not.toBe(g.id)
  expect(back.title).toBe('Trip')
  expect(back.categories[1].clues[2].question.text).toBe('hello')
  expect(back.rowValues).toEqual(g.rowValues)
})
