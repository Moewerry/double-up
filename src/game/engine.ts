import { getLevel } from "./levels"
import { getStatus, remainingMoves } from "./rules"
import type { Direction, Motion, Session, Snapshot, Tile } from "./types"

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
export function createSession(level: number): Session {
  const config = getLevel(level)
  const state = spawn(spawn({ tiles: [], score: 0, moves: 0, random: config.seed, nextId: 1, status: "playing" }))
  return { ...state, level, configVersion: config.version, undoUsed: false, previous: null }
}
function linePositions(line: number, direction: Direction) {
  return Array.from({ length: 4 }, (_, offset) => {
    if (direction === "left") return line * 4 + offset
    if (direction === "right") return line * 4 + 3 - offset
    if (direction === "up") return offset * 4 + line
    return (3 - offset) * 4 + line
  })
}
export function move(session: Session, direction: Direction): { session: Session; motions: Motion[]; gained: number } {
  const config = getLevel(session.level)
  if (session.status !== "playing" || remainingMoves(session.moves, config.maxMoves) === 0) return { session, motions: [], gained: 0 }
  const tiles: Tile[] = [], motions: Motion[] = []
  let score = session.score, nextId = session.nextId
  for (let line = 0; line < 4; line++) {
    const positions = linePositions(line, direction)
    const source = positions.flatMap(position => session.tiles.filter(t => t.position === position))
    let destination = 0
    for (let i = 0; i < source.length; i++) {
      const first = source[i], second = source[i + 1], position = positions[destination++]
      if (second && first.value === second.value) {
        tiles.push({ id: nextId++, value: first.value * 2, position })
        score += first.value * 2
        motions.push({ tile: first, destination: position, merged: true }, { tile: second, destination: position, merged: true })
        i++
      } else {
        tiles.push({ ...first, position })
        motions.push({ tile: first, destination: position, merged: false })
      }
    }
  }
  if (tiles.length === session.tiles.length && motions.every(m => m.tile.position === m.destination)) return { session, motions: [], gained: 0 }
  const { level: _level, configVersion: _version, undoUsed: _undo, previous: _previous, ...previous } = session
  const next = spawn({ tiles, score, moves: session.moves + 1, random: session.random, nextId, status: "playing" })
  next.status = getStatus(next, config)
  return { session: { ...next, level: session.level, configVersion: config.version, undoUsed: session.undoUsed, previous }, motions, gained: score - session.score }
}
export function undo(session: Session): Session {
  if (session.undoUsed || !session.previous || session.status === "won") return session
  return { ...session.previous, level: session.level, configVersion: session.configVersion, undoUsed: true, previous: null }
}
