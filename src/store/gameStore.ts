import { create } from 'zustand'
import type { Content, Game } from '../model/types'
import { resizeBoard } from '../model/board'

interface State {
  game: Game | null
  past: Game[]
  future: Game[]
  load: (g: Game) => void
  apply: (fn: (g: Game) => Game) => void
  undo: () => void
  redo: () => void
  setTitle: (t: string) => void
  setCategoryTitle: (ci: number, t: string) => void
  setRowValue: (ri: number, v: number) => void
  resize: (rows: number, cols: number) => void
  updateClue: (
    ci: number,
    ri: number,
    patch: { question?: Content; answer?: Content; dailyDouble?: boolean },
  ) => void
}

export const useGameStore = create<State>((set, get) => ({
  game: null,
  past: [],
  future: [],
  load: (game) => set({ game, past: [], future: [] }),
  apply: (fn) => {
    const g = get().game
    if (!g) return
    set({ game: { ...fn(g), updatedAt: Date.now() }, past: [...get().past.slice(-99), g], future: [] })
  },
  undo: () => {
    const { past, game, future } = get()
    if (!past.length || !game) return
    set({ game: past[past.length - 1], past: past.slice(0, -1), future: [game, ...future] })
  },
  redo: () => {
    const { past, game, future } = get()
    if (!future.length || !game) return
    set({ game: future[0], past: [...past, game], future: future.slice(1) })
  },
  setTitle: (title) => get().apply((g) => ({ ...g, title })),
  setCategoryTitle: (ci, title) =>
    get().apply((g) => ({
      ...g,
      categories: g.categories.map((c, i) => (i === ci ? { ...c, title } : c)),
    })),
  setRowValue: (ri, v) =>
    get().apply((g) => ({ ...g, rowValues: g.rowValues.map((x, i) => (i === ri ? v : x)) })),
  resize: (rows, cols) => get().apply((g) => resizeBoard(g, rows, cols)),
  updateClue: (ci, ri, patch) =>
    get().apply((g) => ({
      ...g,
      categories: g.categories.map((c, i) =>
        i !== ci
          ? c
          : { ...c, clues: c.clues.map((cl, j) => (j === ri ? { ...cl, ...patch } : cl)) },
      ),
    })),
}))
