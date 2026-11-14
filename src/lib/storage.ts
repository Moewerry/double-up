import { createSession } from "@/game/engine"
import { getLevel, levels } from "@/game/levels"
import { getStatus } from "@/game/rules"
import { currentRecord } from "@/game/records"
import { isSeed } from "@/game/random"
import type { Save, Session, Snapshot } from "@/game/types"

export const SAVE_KEY = "double-up:save:v1"
export type SaveStatus = "ready" | "saved" | "unavailable"
export interface LoadedSave { data: Save; notice: string; blocked: boolean; saveStatus: SaveStatus }
const integer = (v: unknown, min = 0): v is number => typeof v === "number" && Number.isSafeInteger(v) && v >= min
const object = (v: unknown): v is Record<string, unknown> => typeof v === "object" && v !== null && !Array.isArray(v)
type StoredSession = Omit<Session, "seed"> & { seed?: number }
function validSnapshot(v: unknown): v is Snapshot {
  if (!object(v) || !Array.isArray(v.tiles) || v.tiles.length < 2 || v.tiles.length > 16) return false
  if (!integer(v.score) || !integer(v.moves) || !integer(v.random, 1) || v.random > 0xffffffff || !integer(v.nextId, 1)) return false
  if (v.status !== "playing" && v.status !== "won" && v.status !== "lost") return false
  const ids = new Set<number>(), positions = new Set<number>()
  for (const t of v.tiles) {
    if (!object(t) || !integer(t.id, 1) || t.id >= v.nextId || !integer(t.position) || t.position > 15 || !integer(t.value, 2) || !Number.isInteger(Math.log2(t.value))) return false
    if (ids.has(t.id) || positions.has(t.position)) return false
    ids.add(t.id); positions.add(t.position)
  }
  return true
}
function validSession(v: unknown, current: number): v is StoredSession {
  if (!validSnapshot(v) || !object(v) || !integer(v.level, 1) || typeof v.undoUsed !== "boolean") return false
  if (v.level !== current && v.level !== current - 1) return false
  const level = getLevel(v.level)
  if (v.seed !== undefined && !isSeed(v.seed)) return false
  if (v.configVersion !== level.version || level.maxMoves !== undefined && v.moves > level.maxMoves) return false
  if (v.previous !== null && (!validSnapshot(v.previous) || v.previous.status !== "playing" || v.previous.moves !== v.moves - 1 || v.previous.score > v.score)) return false
  if (v.previous && getStatus(v.previous, level) !== "playing") return false
  return v.status === getStatus(v, level)
}
export function currentLevel(records: Save["records"]) {
  let id = 1
  while (id < levels.length && records[String(id)]) id++
  return id
}
export function emptySave(): Save { return { version: 1, rules: 1, session: createSession(1), records: {}, sound: false, music: false, directions: false } }
export function decodeSave(raw: string | null): LoadedSave {
  try {
    if (raw === null) return { data: emptySave(), notice: "", blocked: false, saveStatus: "ready" }
    const value: unknown = JSON.parse(raw)
    if (!object(value)) throw new Error("invalid")
    if (value.version !== 1 || value.rules !== 1) return { data: emptySave(), notice: "存档版本不兼容。为保护已有进度，已暂停游玩，请使用创建该存档的版本打开。", blocked: true, saveStatus: "ready" }
    const records: Save["records"] = {}
    if (object(value.records)) {
      for (const level of levels) {
        const record = value.records[String(level.id)]
        if (!object(record) || !integer(record.score) || !integer(record.moves, 1) || record.configVersion !== undefined && !integer(record.configVersion, 1)) break
        records[String(level.id)] = { score: record.score, moves: record.moves, ...(record.configVersion === undefined ? {} : { configVersion: record.configVersion }) }
      }
    }
    const current = currentLevel(records)
    let session: Session | null = null
    if (validSession(value.session, current) && (value.session.status !== "won" || !!currentRecord(records, getLevel(value.session.level)))) {
      const stored = value.session
      session = { ...stored, seed: stored.seed ?? getLevel(stored.level).seed }
    }
    return {
      data: { version: 1, rules: 1, records, sound: value.sound === true, music: value.music === true, directions: value.directions === true, session: session ?? createSession(current) },
      notice: session ? "" : "当前局面无法恢复或配置已更新，已准备本关新局，历史通关记录保留。",
      blocked: false,
      saveStatus: session ? "saved" : "ready",
    }
  } catch {
    return { data: emptySave(), notice: "本地存档内容损坏，无法恢复，已准备第一关新局。", blocked: false, saveStatus: "ready" }
  }
}
export function loadSave(): LoadedSave {
  try { return decodeSave(localStorage.getItem(SAVE_KEY)) } catch {
    return { data: emptySave(), notice: "", blocked: false, saveStatus: "unavailable" }
  }
}
export function persist(data: Save): boolean {
  try { localStorage.setItem(SAVE_KEY, JSON.stringify(data)); return true } catch { return false }
}
