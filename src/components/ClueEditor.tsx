import { useState } from 'react'
import { useGameStore } from '../store/gameStore'
import { ImagePicker } from './ImagePicker'

interface Props {
  ci: number
  ri: number
  onClose: () => void
}

export function ClueEditor({ ci, ri, onClose }: Props) {
  const game = useGameStore((s) => s.game)!
  const updateClue = useGameStore((s) => s.updateClue)
  const [tab, setTab] = useState<'question' | 'answer'>('question')
  const cat = game.categories[ci]
  const clue = cat?.clues[ri]
  if (!clue) return null
  const content = clue[tab]

  return (
    <aside className="drawer" aria-label="Clue editor">
      <header>
        <div>
          <small>{cat.title || 'Category'}</small>
          <strong>{game.rowValues[ri]}</strong>
        </div>
        <button onClick={onClose} aria-label="Close editor" title="Close (Esc)">×</button>
      </header>
      <div role="tablist" className="drawer-tabs">
        {(['question', 'answer'] as const).map((t) => (
          <button key={t} role="tab" aria-selected={tab === t} onClick={() => setTab(t)}>
            {t}
          </button>
        ))}
      </div>
      <label className="drawer-field">
        <span>{tab === 'question' ? 'Clue text' : 'Answer text'}</span>
        <textarea
          aria-label={`${tab} text`}
          rows={5}
          placeholder={tab === 'question' ? 'What the host reads out…' : 'The correct response…'}
          value={content.text ?? ''}
          onChange={(e) => updateClue(ci, ri, { [tab]: { ...content, text: e.target.value } })}
        />
      </label>
      <div className="drawer-field">
        <span>Image</span>
        <ImagePicker value={content} onChange={(c) => updateClue(ci, ri, { [tab]: c })} />
      </div>
      <label className="drawer-dd">
        <input
          type="checkbox"
          checked={!!clue.dailyDouble}
          onChange={(e) => updateClue(ci, ri, { dailyDouble: e.target.checked })}
        />
        <span>★ Daily Double</span>
      </label>
    </aside>
  )
}
