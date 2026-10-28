import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { getGame, removeOrphanImages, saveGame } from '../db/db'
import { useGameStore } from '../store/gameStore'
import { BoardEditor } from '../components/BoardEditor'
import { ClueEditor } from '../components/ClueEditor'
import { SizeControls } from '../components/SizeControls'
import { GridPreview } from '../components/GridPreview'
import { exportGame } from '../io/exportZip'

export function Editor() {
  const { id } = useParams()
  const game = useGameStore((s) => s.game)
  const canUndo = useGameStore((s) => s.past.length > 0)
  const canRedo = useGameStore((s) => s.future.length > 0)
  const { load, setTitle, undo, redo } = useGameStore()
  const [sel, setSel] = useState<[number, number] | null>(null)
  const [missing, setMissing] = useState(false)
  const [saved, setSaved] = useState(true)

  useEffect(() => {
    getGame(id!).then((g) => (g ? load(g) : setMissing(true)))
  }, [id, load])

  // Debounced autosave.
  useEffect(() => {
    if (!game || game.id !== id) return
    setSaved(false)
    const t = setTimeout(() => { saveGame(game).then(removeOrphanImages).then(() => setSaved(true)) }, 400)
    return () => clearTimeout(t)
  }, [game, id])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') return setSel(null)
      const tag = (e.target as HTMLElement).tagName
      if (tag === 'INPUT' || tag === 'TEXTAREA') return
      if ((e.metaKey || e.ctrlKey) && e.key === 'z') { e.preventDefault(); e.shiftKey ? redo() : undo() }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [undo, redo])

  if (missing) return <main><p>Game not found.</p><Link to="/">Back</Link></main>
  if (!game || game.id !== id) return <main>Loading…</main>

  async function download() {
    const blob = await exportGame(game!)
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = `${game!.title || 'game'}.jeopardy.zip`
    a.click()
    URL.revokeObjectURL(a.href)
  }

  const rows = game.rowValues.length
  const cols = game.categories.length

  return (
    <main className={`editor${sel ? ' has-drawer' : ''}`}>
      <header className="ed-top">
        <Link to="/" className="ed-back">← Library</Link>
        <input
          className="ed-title"
          aria-label="Game title"
          placeholder="Untitled game"
          value={game.title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <div className="ed-actions">
          <button onClick={undo} disabled={!canUndo} title="Undo (Ctrl/⌘ Z)">↶ Undo</button>
          <button onClick={redo} disabled={!canRedo} title="Redo (Ctrl/⌘ Shift Z)">↷ Redo</button>
          <button onClick={download}>⬇ Export</button>
          <Link to={`/play/${game.id}`} className="ed-play">▶ Play</Link>
        </div>
      </header>

      <section className="ed-bar" aria-label="Board settings">
        <div className="ed-bar-group">
          <span className="ed-bar-title">Board size</span>
          <SizeControls />
          <GridPreview rows={rows} cols={cols} />
        </div>
        <p className="ed-hint">
          Click a square to add its question and answer — text, an image, or both. Edit point values in the left column.
        </p>
        <span className={`ed-saved${saved ? '' : ' saving'}`} role="status">{saved ? '✓ Saved' : 'Saving…'}</span>
      </section>

      <BoardEditor selected={sel} onSelect={setSel} />
      {sel && <ClueEditor ci={sel[0]} ri={sel[1]} onClose={() => setSel(null)} />}
    </main>
  )
}
