import { create } from "zustand"
import { createSession, move, undo } from "@/game/engine"
import { getLevel, levels } from "@/game/levels"
import { currentRecord } from "@/game/records"
import type { ClearFeedback, Direction, Motion, Save } from "@/game/types"
import { loadSave, persist } from "@/lib/storage"
import type { SaveStatus } from "@/lib/storage"

const initial = loadSave()
interface GameStore {
  data: Save
  notice: string
  blocked: boolean
  saveStatus: SaveStatus
  motions: Motion[]
  revision: number
  gained: number
  clearFeedback: ClearFeedback | null
  start: () => void
  move: (direction: Direction) => boolean
  undo: () => void
  restart: () => void
  next: () => void
  toggle: (key: "sound" | "directions") => void
  externalChange: () => void
  retrySave: () => void
  dismissNotice: () => void
}
export const useGameStore = create<GameStore>((set, get) => {
  function commit(data: Save, extra: Partial<GameStore> = {}) {
    const saved = persist(data)
    set({ data, saveStatus: saved ? "saved" : "unavailable", ...extra })
  }
  return {
    ...initial, motions: [], revision: 0, gained: 0, clearFeedback: null,
    start() {
      const state = get()
      if (!state.blocked && state.saveStatus !== "saved") commit(state.data)
    },
    move(direction) {
      const state = get()
      if (state.blocked) return false
      const result = move(state.data.session, direction)
      if (result.session === state.data.session) return false
      const records = { ...state.data.records }
      let clearFeedback: ClearFeedback | null = null
      if (result.session.status === "won") {
        const old = currentRecord(records, getLevel(result.session.level))
        clearFeedback = { firstClear: !old, bestScore: !!old && result.session.score > old.score, fewestMoves: !!old && result.session.moves < old.moves }
        records[String(result.session.level)] = { score: Math.max(old?.score ?? 0, result.session.score), moves: Math.min(old?.moves ?? Infinity, result.session.moves), ...(result.session.configVersion === 1 ? {} : { configVersion: result.session.configVersion }) }
      }
      commit({ ...state.data, session: result.session, records }, { motions: result.motions, revision: state.revision + 1, gained: result.gained, clearFeedback })
      return true
    },
    undo() {
      const state = get()
      if (state.blocked) return
      const session = undo(state.data.session)
      if (session !== state.data.session) commit({ ...state.data, session }, { motions: [], revision: state.revision + 1, gained: 0, clearFeedback: null })
    },
    restart() {
      const state = get()
      if (!state.blocked) commit({ ...state.data, session: createSession(state.data.session.level) }, { motions: [], revision: state.revision + 1, gained: 0, clearFeedback: null })
    },
    next() {
      const state = get(), session = state.data.session
      if (state.blocked || session.status !== "won" || session.level >= levels.length) return
      commit({ ...state.data, session: createSession(session.level + 1) }, { motions: [], revision: state.revision + 1, gained: 0, clearFeedback: null })
    },
    toggle(key) {
      const state = get()
      if (!state.blocked) commit({ ...state.data, [key]: !state.data[key] })
    },
    externalChange() { set({ blocked: true, notice: "其他标签页已更改进度。请刷新页面，读取最新存档后继续。" }) },
    retrySave() {
      if (!get().blocked) commit(get().data)
    },
    dismissNotice() {
      if (!get().blocked) set({ notice: "" })
    },
  }
})
