import { useGameStore } from '../store/gameStore'
import { clueHasContent } from '../model/board'
import { useImageUrl } from '../db/images'
import type { Clue } from '../model/types'

function Preview({ clue }: { clue: Clue }) {
  const url = useImageUrl(clue.question.imageId)
  const text = clue.question.text?.trim()
  if (!url && !text) return <span className="ed-empty">Empty</span>
  return (
    <span className="ed-preview">
      {url && <img src={url} alt="" />}
      {text && <span className="ed-text">{text}</span>}
    </span>
  )
}

interface Props {
  selected: [number, number] | null
  onSelect: (s: [number, number]) => void
}

export function BoardEditor({ selected, onSelect }: Props) {
  const game = useGameStore((s) => s.game)!
  const { setCategoryTitle, setRowValue } = useGameStore()
  const cols = game.categories.length

  return (
    <div className="ed-board" style={{ gridTemplateColumns: `auto repeat(${cols}, minmax(0, 1fr))` }}>
      <span aria-hidden="true" />
      {game.categories.map((c, ci) => (
        <input
          key={c.id}
          className="ed-cat"
          aria-label={`Category ${ci + 1} title`}
          placeholder="Category"
          value={c.title}
          onChange={(e) => setCategoryTitle(ci, e.target.value)}
        />
      ))}
      {game.rowValues.flatMap((v, ri) => [
        <label key={`g${ri}`} className="ed-gutter">
          <span>Row {ri + 1}</span>
          <input
            type="number"
            min={0}
            step={100}
            aria-label={`Row ${ri + 1} value`}
            value={v}
            onChange={(e) => setRowValue(ri, Number(e.target.value))}
          />
        </label>,
        ...game.categories.map((c, ci) => {
          const clue = c.clues[ri]
          const sel = selected?.[0] === ci && selected[1] === ri
          const filled = clueHasContent(clue)
          return (
            <button
              key={clue.id}
              className={`ed-cell${sel ? ' selected' : ''}${filled ? ' filled' : ''}`}
              aria-label={`Edit ${c.title} ${v}`}
              aria-pressed={sel}
              onClick={() => onSelect([ci, ri])}
            >
              <span className="ed-value">{v}</span>
              {clue.dailyDouble && <span className="ed-dd" title="Daily Double">★ DD</span>}
              {filled && <span className="ed-check" aria-hidden="true">✓</span>}
              <Preview clue={clue} />
            </button>
          )
        }),
      ])}
    </div>
  )
}
