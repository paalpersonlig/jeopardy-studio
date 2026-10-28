import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { deleteGame, listGames, saveGame } from '../db/db'
import { createGame, uid } from '../model/board'
import { importGame } from '../io/importZip'
import { GridPreview } from '../components/GridPreview'
import { Stepper } from '../components/Stepper'
import type { Game } from '../model/types'

export function Library() {
  const [games, setGames] = useState<Game[]>([])
  const [rows, setRows] = useState(5)
  const [cols, setCols] = useState(6)
  const [error, setError] = useState('')
  const nav = useNavigate()
  const file = useRef<HTMLInputElement>(null)
  const refresh = () => listGames().then(setGames)
  useEffect(() => { refresh() }, [])

  async function create() {
    const g = createGame(rows, cols)
    await saveGame(g)
    nav(`/edit/${g.id}`)
  }

  async function onImport(f?: File) {
    if (!f) return
    try {
      const g = await importGame(f)
      await saveGame(g)
      nav(`/edit/${g.id}`)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Import failed')
    }
  }

  return (
    <main className="library">
      <header className="hero">
        <h1>Jeopardy<span> Studio</span></h1>
        <p>Build your own board. Pick a size, fill the clues, then play.</p>
      </header>

      <section className="panel new">
        <h2>New game</h2>
        <div className="new-body">
          <div className="steppers">
            <Stepper label="Columns" value={cols} onChange={setCols} />
            <Stepper label="Rows" value={rows} onChange={setRows} />
            <p className="size-note">{cols} categories × {rows} clues = {cols * rows} squares</p>
          </div>
          <GridPreview rows={rows} cols={cols} />
        </div>
        <div className="actions">
          <button className="primary" onClick={create}>Create game</button>
          <button onClick={() => file.current?.click()}>Import…</button>
        </div>
        <input ref={file} type="file" accept=".zip" hidden onChange={(e) => onImport(e.target.files?.[0])} />
        {error && <p role="alert" className="error">{error}</p>}
      </section>

      <section className="panel">
        <h2>My games</h2>
        {games.length === 0 && <p className="empty">No games yet — create your first one above.</p>}
        <ul className="games">
          {games.map((g) => (
            <li key={g.id}>
              <div>
                <strong>{g.title}</strong>
                <small>{g.categories.length} × {g.rowValues.length}</small>
              </div>
              <div className="game-actions">
                <Link to={`/edit/${g.id}`}>Edit</Link>
                <Link to={`/play/${g.id}`}>Play</Link>
                <button onClick={async () => { await saveGame({ ...g, id: uid(), title: `${g.title} (copy)`, updatedAt: Date.now() }); refresh() }}>Duplicate</button>
                <button onClick={async () => { if (confirm(`Delete "${g.title}"?`)) { await deleteGame(g.id); refresh() } }}>Delete</button>
              </div>
            </li>
          ))}
        </ul>
      </section>
    </main>
  )
}
