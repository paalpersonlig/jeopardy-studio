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
        <section className={`clue-view${open.revealed ? ' revealed' : ''}`}>
          {clueAt(open).dailyDouble && open.wager === undefined ? (
            <div className="wager">
              <h2>★ Daily Double ★</h2>
              <label>Wager <input type="number" min={0} autoFocus defaultValue={game.rowValues[open.ri]}
                onKeyDown={(e) => { if (e.key === 'Enter') setOpen({ ...open, wager: +(e.target as HTMLInputElement).value }) }} /></label>
              <p>Press Enter to confirm.</p>
              <button onClick={close}>Back to board <kbd>Esc</kbd></button>
            </div>
          ) : (
            <>
              <header className="clue-meta">
                <span>{game.categories[open.ci].title}</span>
                <span className="clue-value">{open.wager ?? game.rowValues[open.ri]}</span>
                {clueAt(open).dailyDouble && <span className="clue-dd">★ Daily Double</span>}
              </header>

              <div className="clue-stage">
                <div className="clue-q"><Show c={clueAt(open).question} /></div>
                {open.revealed ? (
                  <div className="clue-a">
                    <span className="clue-label">Answer</span>
                    <Show c={clueAt(open).answer} />
                  </div>
                ) : (
                  <button className="reveal" onClick={() => setOpen({ ...open, revealed: true })}>
                    Reveal answer <kbd>Space</kbd>
                  </button>
                )}
              </div>

              {open.revealed && (
                <div className="award-row" role="group" aria-label="Award points">
                  {teams.map((t) => (
                    <div key={t.id} className="award-team">
                      <span className="award-name">{t.name}</span>
                      <span className="award-score">{t.score}</span>
                      <div className="award-btns">
                        <button className="plus" onClick={() => adjust(t.id, 1)} aria-label={`Award ${t.name}`}>+{open.wager ?? game.rowValues[open.ri]}</button>
                        <button className="minus" onClick={() => adjust(t.id, -1)} aria-label={`Deduct from ${t.name}`}>−{open.wager ?? game.rowValues[open.ri]}</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <footer className="clue-foot">
                <button className="back" onClick={close}>Back to board <kbd>Esc</kbd></button>
              </footer>
            </>
          )}
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
