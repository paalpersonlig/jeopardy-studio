import Dexie, { type Table } from 'dexie'
import type { Game } from '../model/types'
import { imageIds } from '../model/board'

export interface ImageAsset {
  id: string
  blob: Blob
  mime: string
  width: number
  height: number
}

class StudioDB extends Dexie {
  games!: Table<Game, string>
  images!: Table<ImageAsset, string>
  constructor() {
    super('jeopardy-studio')
    this.version(1).stores({ games: 'id, updatedAt', images: 'id' })
  }
}

export const db = new StudioDB()

export const listGames = () => db.games.orderBy('updatedAt').reverse().toArray()
export const getGame = (id: string) => db.games.get(id)

export async function saveGame(game: Game) {
  await db.games.put(game)
}

export async function deleteGame(id: string) {
  await db.games.delete(id)
  await removeOrphanImages()
}

/** Delete image blobs no longer referenced by any game. */
export async function removeOrphanImages() {
  const used = new Set<string>()
  await db.games.each((g) => imageIds(g).forEach((i) => used.add(i)))
  const all = await db.images.toCollection().primaryKeys()
  const orphans = all.filter((id) => !used.has(id))
  if (orphans.length) await db.images.bulkDelete(orphans)
}
