import type { LevelConfig } from "./level-types"
import type { Snapshot, Status, Tile } from "./types"

export function canMove(tiles: readonly Tile[]) {
  if (tiles.length < 16) return true
  const values = new Map(tiles.map(tile => [tile.position, tile.value]))
  return tiles.some(tile => (tile.position % 4 < 3 && values.get(tile.position + 1) === tile.value) || (tile.position < 12 && values.get(tile.position + 4) === tile.value))
}

export function remainingMoves(moves: number, limit?: number) {
  return limit === undefined ? undefined : Math.max(0, limit - moves)
}

export function getStatus(state: Pick<Snapshot, "tiles" | "moves">, level: Pick<LevelConfig, "target" | "maxMoves">): Status {
  // 最后一步同时达标和耗尽步数时，优先通关。
  if (state.tiles.some(tile => tile.value >= level.target)) return "won"
  if (remainingMoves(state.moves, level.maxMoves) === 0) return "lost"
  return canMove(state.tiles) ? "playing" : "lost"
}

export function failureReason(state: Pick<Snapshot, "status" | "moves">, level: Pick<LevelConfig, "maxMoves">) {
  if (state.status !== "lost") return null
  return remainingMoves(state.moves, level.maxMoves) === 0 ? "moves" : "blocked"
}
