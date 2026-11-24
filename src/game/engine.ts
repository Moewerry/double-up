import { getLevel } from "./levels"
import { getStatus, remainingMoves } from "./rules"
import { isSeed, randomSeed } from "./random"
import type { Direction, Motion, Session, Snapshot } from "./types"
import { slideTiles } from "./movement"

export { canMove } from "./rules"

function random(state: number): [number, number] {
  let value = state | 0
  value ^= value << 13
  value ^= value >>> 17
  value ^= value << 5
  return [(value >>> 0) / 4294967296, value >>> 0]
}
function spawn(state: Snapshot): Snapshot {
  const empty = Array.from({ length: 16 }, (_, i) => i).filter(i => !state.tiles.some(t => t.position === i))
  if (!empty.length) return state
  const [positionRoll, first] = random(state.random)
  const [valueRoll, second] = random(first)
  return { ...state, random: second, nextId: state.nextId + 1, tiles: [...state.tiles, { id: state.nextId, value: valueRoll < .9 ? 2 : 4, position: empty[Math.floor(positionRoll * empty.length)] }] }
}
export function createSession(level: number, seed?: number): Session {
  const config = getLevel(level)
  seed ??= config.puzzle ? config.seed : randomSeed()
  if (!isSeed(seed)) throw new Error("开局种子必须为非零的 32 位无符号整数。")
  const empty: Snapshot = { tiles: [], score: 0, moves: 0, random: seed, nextId: 1, status: "playing" }
  const state: Snapshot = config.puzzle ? {
    ...empty,
    tiles: config.puzzle.initialTiles.map((tile, index) => ({ ...tile, id: index + 1 })),
    nextId: config.puzzle.initialTiles.length + 1, openedDoors: [], collapsedCells: [],
  } : spawn(spawn(empty))
  return { ...state, level, seed, configVersion: config.version, undoUsed: false, previous: null }
}
export function move(session: Session, direction: Direction): { session: Session; motions: Motion[]; gained: number } {
  const config = getLevel(session.level)
  if (session.status !== "playing" || remainingMoves(session.moves, config.maxMoves) === 0) return { session, motions: [], gained: 0 }
  const result = slideTiles(session, direction, config.puzzle)
  if (!result.changed) return { session, motions: [], gained: 0 }
  const { level: _level, seed: _seed, configVersion: _version, undoUsed: _undo, previous: _previous, ...previous } = session
  const state: Snapshot = { tiles: result.tiles, score: session.score + result.gained, moves: session.moves + 1, random: session.random, nextId: result.nextId, status: "playing" }
  const next = config.puzzle ? { ...state, openedDoors: result.openedDoors, collapsedCells: result.collapsedCells } : spawn(state)
  next.status = getStatus(next, config)
  return { session: { ...next, level: session.level, seed: session.seed, configVersion: config.version, undoUsed: session.undoUsed, previous }, motions: result.motions, gained: result.gained }
}
export function undo(session: Session): Session {
  if (session.undoUsed || !session.previous || session.status === "won") return session
  return { ...session.previous, level: session.level, seed: session.seed, configVersion: session.configVersion, undoUsed: true, previous: null }
}
