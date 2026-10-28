import { useEffect, useState } from 'react'
import { db, type ImageAsset } from './db'
import { uid } from '../model/board'

export const ACCEPTED = ['image/png', 'image/jpeg', 'image/webp', 'image/gif']
const MAX_DIM = 1600

/** Validate, downscale (except GIFs, to keep animation) and store an image. Returns its id. */
export async function addImage(file: File): Promise<string> {
  if (!ACCEPTED.includes(file.type)) throw new Error('Unsupported image type. Use PNG, JPEG, WebP or GIF.')
  const bitmap = await createImageBitmap(file)
  let { width, height } = bitmap
  let blob: Blob = file
  if (file.type !== 'image/gif' && Math.max(width, height) > MAX_DIM) {
    const scale = MAX_DIM / Math.max(width, height)
    width = Math.round(width * scale)
    height = Math.round(height * scale)
    const canvas = document.createElement('canvas')
    canvas.width = width
    canvas.height = height
    canvas.getContext('2d')!.drawImage(bitmap, 0, 0, width, height)
    const out = await new Promise<Blob | null>((r) =>
      canvas.toBlob(r, file.type === 'image/png' ? 'image/png' : 'image/jpeg', 0.85),
    )
    if (out) blob = out
  }
  bitmap.close()
  const asset: ImageAsset = { id: uid(), blob, mime: blob.type, width, height }
  await db.images.put(asset)
  return asset.id
}

export function useImageUrl(imageId?: string) {
  const [url, setUrl] = useState<string>()
  useEffect(() => {
    if (!imageId) return setUrl(undefined)
    let revoked: string | undefined
    let cancelled = false
    db.images.get(imageId).then((a) => {
      if (a && !cancelled) setUrl((revoked = URL.createObjectURL(a.blob)))
    })
    return () => {
      cancelled = true
      if (revoked) URL.revokeObjectURL(revoked)
    }
  }, [imageId])
  return url
}
