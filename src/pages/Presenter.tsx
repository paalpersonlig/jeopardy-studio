import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { getGame } from '../db/db'
import { useImageUrl } from '../db/images'
import type { Content, Game } from '../model/types'

type Team = { id: number; name: string; score: number }
type Open = { ci: number; ri: number; revealed: boolean; wager?: number }

function Show({ c }: { c: Content }) {
  const url = useImageUrl(c.imageId)
  return (
    <div className="show">
      {url && <img src={url} alt={c.imageAlt ?? ''} />}
      {c.text && <p>{c.text}</p>}
    </div>
  )
}

export function Presenter() {
  const { id } = useParams()
  const [game, setGame] = useState<Game | null>(null)
  const [used, setUsed] = useState<Set<string>>(new Set())
  const [open, setOpen] = useState<Open | null>(null)
  const [teams, setTeams] = useState<Team[]>([
    { id: 1, name: 'Team 1', score: 0 },
    { id: 2, name: 'Team 2', score: 0 },
  ])

  useEffect(() => { getGame(id!).then((g) => setGame(g ?? null)) }, [id])
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement).tagName === 'INPUT') return
      if (e.key === 'Escape') close()
      if (e.key === ' ' && open) { e.preventDefault(); setOpen({ ...open, revealed: true }) }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  })

  if (!game) return <main>Loading…</main>
  const clueAt = (o: Open) => game.categories[o.ci].clues[o.ri]

  function close() {
    if (open) setUsed(new Set(used).add(clueAt(open).id))
    setOpen(null)
  }
  const adjust = (tid: number, sign: 1 | -1) => {
    if (!open) return
    const amount = open.wager ?? game.rowValues[open.ri]
    setTeams(teams.map((t) => (t.id === tid ? { ...t, score: t.score + sign * amount } : t)))
  }

  return (
    <main className="presenter">
      <header className="toolbar">
        <Link to={`/edit/${game.id}`}>← Editor</Link>
        <strong>{game.title}</strong>
        <button onClick={() => { if (confirm('Reset board and scores?')) { setUsed(new Set()); setTeams(teams.map((t) => ({ ...t, score: 0 }))) } }}>Reset</button>
      </header>

      {open ? (
        <section className="clue-view">
          {clueAt(open).dailyDouble && open.wager === undefined ? (
            <div>
              <h2>Daily Double!</h2>
              <label>Wager <input type="number" min={0} defaultValue={game.rowValues[open.ri]}
                onKeyDown={(e) => { if (e.key === 'Enter') setOpen({ ...open, wager: +(e.target as HTMLInputElement).value }) }} /></label>
              <p>Press Enter to confirm.</p>
            </div>
          ) : (
            <>
              <Show c={clueAt(open).question} />
              {open.revealed ? <div className="answer"><Show c={clueAt(open).answer} /></div>
                : <button onClick={() => setOpen({ ...open, revealed: true })}>Reveal answer (space)</button>}
              <div className="award">
                {teams.map((t) => (
                  <span key={t.id}>{t.name}
                    <button onClick={() => adjust(t.id, 1)}>+</button>
                    <button onClick={() => adjust(t.id, -1)}>−</button></span>
                ))}
              </div>
            </>
          )}
          <button onClick={close}>Back to board (Esc)</button>
        </section>
      ) : (
        <div className="board play" style={{ gridTemplateColumns: `repeat(${game.categories.length}, minmax(0, 1fr))` }}>
          {game.categories.map((c) => <div key={c.id} className="cat">{c.title}</div>)}
          {game.rowValues.flatMap((v, ri) => game.categories.map((c, ci) => {
            const done = used.has(c.clues[ri].id)
            return (
              <button key={c.clues[ri].id} className="cell" disabled={done}
                onClick={() => setOpen({ ci, ri, revealed: false })}>{done ? '' : v}</button>
            )
          }))}
        </div>
      )}

      <footer className="scores">
        {teams.map((t) => (
          <div key={t.id}>
            <input aria-label="Team name" value={t.name}
              onChange={(e) => setTeams(teams.map((x) => (x.id === t.id ? { ...x, name: e.target.value } : x)))} />
            <span className="score">{t.score}</span>
          </div>
        ))}
        <button onClick={() => setTeams([...teams, { id: Date.now(), name: `Team ${teams.length + 1}`, score: 0 }])}>+ Team</button>
      </footer>
    </main>
  )
}
