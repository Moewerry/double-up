import type { LevelConfig } from "./level-types"
import type { Snapshot, Status, Tile } from "./types"
import { directions, neighbor, slideTiles } from "./movement"

export function canMove(tiles: readonly Tile[]) {
  if (tiles.length < 16) return true
  const values = new Map(tiles.map(tile => [tile.position, tile.value]))
  return tiles.some(tile => (tile.position % 4 < 3 && values.get(tile.position + 1) === tile.value) || (tile.position < 12 && values.get(tile.position + 4) === tile.value))
}

export function remainingMoves(moves: number, limit?: number) {
  return limit === undefined ? undefined : Math.max(0, limit - moves)
}

export function getStatus(state: Pick<Snapshot, "tiles" | "moves" | "openedDoors" | "collapsedCells">, level: Pick<LevelConfig, "target" | "maxMoves" | "puzzle">): Status {
  if (level.puzzle) {
    const { goal, doors } = level.puzzle
    const remainingDoors = doors.filter(door => !state.openedDoors?.includes(door.position))
    const delivered = goal.kind === "deliver" && state.tiles.some(tile => tile.position === goal.position && tile.value === level.target)
    if (goal.kind === "merge" && state.tiles.some(tile => tile.value >= level.target) || goal.kind === "doors" && !remainingDoors.length || delivered && !remainingDoors.length) return "won"
    if (remainingMoves(state.moves, level.maxMoves) === 0) return "lost"
    if (insufficientNumbers(state, level)) return "lost"
    const snapshot: Snapshot = { ...state, score: 0, random: 1, nextId: Math.max(0, ...state.tiles.map(tile => tile.id)) + 1, status: "playing" }
    return directions.some(direction => slideTiles(snapshot, direction, level.puzzle).changed) ? "playing" : "lost"
  }
  // 最后一步同时达标和耗尽步数时，优先通关。
  if (state.tiles.some(tile => tile.value >= level.target)) return "won"
  if (remainingMoves(state.moves, level.maxMoves) === 0) return "lost"
  return canMove(state.tiles) ? "playing" : "lost"
}

export function insufficientNumbers(state: Pick<Snapshot, "tiles" | "openedDoors" | "collapsedCells">, level: Pick<LevelConfig, "target" | "puzzle">) {
  if (!level.puzzle) return false
  const puzzle = level.puzzle
  const blocked = new Set([...puzzle.walls, ...(state.collapsedCells ?? [])])
  if (puzzle.goal.kind === "deliver" && blocked.has(puzzle.goal.position)) return true
  const unvisited = new Set(Array.from({ length: 16 }, (_, position) => position).filter(position => !blocked.has(position)))
  const regions: Set<number>[] = []
  // 把未开门暂按可通过处理，只有永久隔开的数字不足时才提前判负。
  while (unvisited.size) {
    const first = unvisited.values().next().value!
    unvisited.delete(first)
    const queue = [first], region = new Set([first])
    while (queue.length) {
      const position = queue.pop()!
      for (const direction of directions) {
        const next = neighbor(position, direction)
        if (next !== null && unvisited.delete(next)) { region.add(next); queue.push(next) }
      }
    }
    regions.push(region)
  }
  if (puzzle.goal.kind === "merge") {
    return !regions.some(region => state.tiles.filter(tile => region.has(tile.position)).reduce((sum, tile) => sum + tile.value, 0) >= level.target)
  }
  const remainingDoors = puzzle.doors.filter(door => !state.openedDoors?.includes(door.position))
  const goal = puzzle.goal
  return regions.some(region => {
    const costs = remainingDoors.filter(door => region.has(door.position)).map(door => door.value)
    if (goal.kind === "deliver" && region.has(goal.position)) costs.push(level.target)
    const maximumUseful = Math.max(0, ...costs)
    const usable = state.tiles.filter(tile => region.has(tile.position) && tile.value <= maximumUseful).reduce((sum, tile) => sum + tile.value, 0)
    return usable < costs.reduce((sum, value) => sum + value, 0)
  })
}

export function failureReason(state: Pick<Snapshot, "status" | "moves" | "tiles" | "openedDoors" | "collapsedCells">, level: Pick<LevelConfig, "maxMoves" | "target" | "puzzle">) {
  if (state.status !== "lost") return null
  if (remainingMoves(state.moves, level.maxMoves) === 0) return "moves"
  return insufficientNumbers(state, level) ? "numbers" : "blocked"
}
