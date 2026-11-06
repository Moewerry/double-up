import { create } from "zustand"
import { createSession, move, undo } from "@/game/engine"
import { levels } from "@/game/levels"
import type { Direction, Motion, Save } from "@/game/types"
import { loadSave, persist } from "@/lib/storage"

const initial = loadSave()
interface GameStore {
  data: Save
  notice: string
  blocked: boolean
  motions: Motion[]
  revision: number
  gained: number
  move: (direction: Direction) => boolean
  undo: () => void
  restart: () => void
  next: () => void
  toggle: (key: "sound" | "directions") => void
  externalChange: () => void
}
export const useGameStore = create<GameStore>((set, get) => {
  function commit(data: Save, extra: Partial<GameStore> = {}) {
    const saved = persist(data)
    set({ data, notice: saved ? get().notice : "当前进度无法自动保存，请检查浏览器存储设置。", ...extra })
  }
  return {
    ...initial, motions: [], revision: 0, gained: 0,
    move(direction) {
      const state = get()
      if (state.blocked) return false
      const result = move(state.data.session, direction)
      if (result.session === state.data.session) return false
      const records = { ...state.data.records }
      if (result.session.status === "won") {
        const old = records[String(result.session.level)]
        records[String(result.session.level)] = { score: Math.max(old?.score ?? 0, result.session.score), moves: Math.min(old?.moves ?? Infinity, result.session.moves) }
      }
      commit({ ...state.data, session: result.session, records }, { motions: result.motions, revision: state.revision + 1, gained: result.gained })
      return true
    },
    undo() {
      const state = get()
      if (state.blocked) return
      const session = undo(state.data.session)
      if (session !== state.data.session) commit({ ...state.data, session }, { motions: [], revision: state.revision + 1, gained: 0 })
    },
    restart() {
      const state = get()
      if (!state.blocked) commit({ ...state.data, session: createSession(state.data.session.level) }, { motions: [], revision: state.revision + 1, gained: 0 })
    },
    next() {
      const state = get(), session = state.data.session
      if (state.blocked || session.status !== "won" || session.level >= levels.length) return
      commit({ ...state.data, session: createSession(session.level + 1) }, { motions: [], revision: state.revision + 1, gained: 0 })
    },
    toggle(key) {
      const state = get()
      if (!state.blocked) commit({ ...state.data, [key]: !state.data[key] })
    },
    externalChange() { set({ blocked: true, notice: "其他标签页已更改进度。请刷新页面，读取最新存档后继续。" }) },
  }
})
