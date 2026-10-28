import JSZip from 'jszip'
import { db } from '../db/db'
import { imageIds } from '../model/board'
import type { Game } from '../model/types'

const ext = (mime: string) => mime.split('/')[1].replace('jpeg', 'jpg')

export async function exportGame(game: Game): Promise<Blob> {
  const zip = new JSZip()
  zip.file('game.json', JSON.stringify(game, null, 2))
  const folder = zip.folder('images')!
  for (const id of imageIds(game)) {
    const a = await db.images.get(id)
    if (a) folder.file(`${id}.${ext(a.mime)}`, a.blob)
  }
  return zip.generateAsync({ type: 'blob' })
}
