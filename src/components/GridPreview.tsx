import { MAX_SIZE, MIN_SIZE } from '../model/types'

const clamp = (n: number) => Math.min(MAX_SIZE, Math.max(MIN_SIZE, Math.round(n) || MIN_SIZE))

/** Miniature board: one header cell per column, then rows × columns clue tiles. */
export function GridPreview({ rows, cols }: { rows: number; cols: number }) {
  const r = clamp(rows)
  const c = clamp(cols)
  return (
    <div
      className="grid-preview"
      role="img"
      aria-label={`Board preview: ${c} columns by ${r} rows`}
      style={{ gridTemplateColumns: `repeat(${c}, 1fr)` }}
    >
      {Array.from({ length: c }, (_, i) => <span key={`h${i}`} className="gp-head" />)}
      {Array.from({ length: r * c }, (_, i) => <span key={i} className="gp-cell" />)}
    </div>
  )
}
