import JSZip from 'jszip'
import { db } from '../db/db'
import { gameSchema } from '../model/schema'
import { uid } from '../model/board'
import type { Game } from '../model/types'

const MIME: Record<string, string> = { png: 'image/png', jpg: 'image/jpeg', webp: 'image/webp', gif: 'image/gif' }

/** Import a bundle, assigning fresh ids so it never overwrites an existing game or image. */
export async function importGame(file: Blob): Promise<Game> {
  const zip = await JSZip.loadAsync(file)
  const json = await zip.file('game.json')?.async('string')
  if (!json) throw new Error('Not a Jeopardy bundle: game.json missing')
  const parsed = gameSchema.safeParse(JSON.parse(json))
  if (!parsed.success) throw new Error('Invalid game file')
  const game: Game = parsed.data

  const idMap = new Map<string, string>()
  for (const entry of zip.file(/^images\//)) {
    const [oldId, e] = entry.name.replace('images/', '').split('.')
    const mime = MIME[e]
    if (!mime) continue
    const blob = new Blob([await entry.async('arraybuffer')], { type: mime })
    const bitmap = await createImageBitmap(blob).catch(() => null)
    const id = uid()
    idMap.set(oldId, id)
    await db.images.put({ id, blob, mime, width: bitmap?.width ?? 0, height: bitmap?.height ?? 0 })
    bitmap?.close()
  }
  const remap = (c: Game['categories'][0]['clues'][0]['question']) =>
    c.imageId ? { ...c, imageId: idMap.get(c.imageId) } : c
  return {
    ...game,
    id: uid(),
    updatedAt: Date.now(),
    categories: game.categories.map((cat) => ({
      ...cat,
      id: uid(),
      clues: cat.clues.map((cl) => ({ ...cl, id: uid(), question: remap(cl.question), answer: remap(cl.answer) })),
    })),
  }
}
