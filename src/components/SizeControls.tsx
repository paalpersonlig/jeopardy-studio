import { useGameStore } from '../store/gameStore'
import { countDroppedClues } from '../model/board'
import { Stepper } from './Stepper'

export function SizeControls() {
  const game = useGameStore((s) => s.game)!
  const resize = useGameStore((s) => s.resize)
  const rows = game.rowValues.length
  const cols = game.categories.length

  function change(r: number, c: number) {
    if (r === rows && c === cols) return
    const dropped = countDroppedClues(game, r, c)
    if (dropped && !confirm(`Shrinking will delete ${dropped} filled clue(s). Continue?`)) return
    resize(r, c)
  }

  return (
    <div className="size-controls">
      <Stepper label="Columns" value={cols} onChange={(n) => change(rows, n)} />
      <Stepper label="Rows" value={rows} onChange={(n) => change(n, cols)} />
    </div>
  )
}
