import { useRef, useState } from 'react'
import { addImage, useImageUrl } from '../db/images'
import type { Content } from '../model/types'

interface Props {
  value: Content
  onChange: (c: Content) => void
}

export function ImagePicker({ value, onChange }: Props) {
  const url = useImageUrl(value.imageId)
  const input = useRef<HTMLInputElement>(null)
  const [error, setError] = useState('')
  const [over, setOver] = useState(false)

  async function take(file?: File | null) {
    if (!file) return
    try {
      setError('')
      const imageId = await addImage(file)
      onChange({ ...value, imageId })
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not add image')
    }
  }

  return (
    <div
      className={`image-picker${over ? ' over' : ''}`}
      tabIndex={0}
      onDragOver={(e) => {
        e.preventDefault()
        setOver(true)
      }}
      onDragLeave={() => setOver(false)}
      onDrop={(e) => {
        e.preventDefault()
        setOver(false)
        take(e.dataTransfer.files[0])
      }}
      onPaste={(e) => take(Array.from(e.clipboardData.files)[0])}
    >
      {value.imageId ? (
        <>
          {url && <img src={url} alt={value.imageAlt ?? ''} />}
          <input
            placeholder="Alt text (describe the image)"
            value={value.imageAlt ?? ''}
            onChange={(e) => onChange({ ...value, imageAlt: e.target.value })}
          />
          <button type="button" onClick={() => onChange({ ...value, imageId: undefined, imageAlt: undefined })}>
            Remove image
          </button>
        </>
      ) : (
        <button type="button" onClick={() => input.current?.click()}>
          Add image — or drop / paste here
        </button>
      )}
      <input
        ref={input}
        type="file"
        accept="image/png,image/jpeg,image/webp,image/gif"
        hidden
        data-testid="image-input"
        onChange={(e) => {
          take(e.target.files?.[0])
          e.target.value = ''
        }}
      />
      {error && <p role="alert" className="error">{error}</p>}
    </div>
  )
}
