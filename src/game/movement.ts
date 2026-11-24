import type { PuzzleConfig } from "./level-types"
import type { Direction, Motion, Snapshot, Tile } from "./types"

export const directions: readonly Direction[] = ["left", "right", "up", "down"]
const offsets: Record<Direction, number> = { left: -1, right: 1, up: -4, down: 4 }

export function neighbor(position: number, direction: Direction): number | null {
  if (direction === "left" && position % 4 === 0 || direction === "right" && position % 4 === 3) return null
  const next = position + offsets[direction]
  return next >= 0 && next < 16 ? next : null
}

/** 只计算一次滑动。门和地板的变化在整次滑动结束后才对其他数字生效。 */
export function slideTiles(state: Snapshot, direction: Direction, puzzle?: PuzzleConfig) {
  const blocked = new Set([...(puzzle?.walls ?? []), ...(state.collapsedCells ?? [])])
  const closedDoors = new Map((puzzle?.doors ?? []).filter(door => !state.openedDoors?.includes(door.position)).map(door => [door.position, door.value]))
  const openedDoors = [...(state.openedDoors ?? [])]
  const collapsedCells = [...(state.collapsedCells ?? [])]
  const tiles: Tile[] = [], motions: Motion[] = []
  const mergedIds = new Set<number>()
  const ordered = [...state.tiles].sort((a, b) => offsets[direction] > 0 ? b.position - a.position : a.position - b.position)
  let gained = 0, nextId = state.nextId

  for (const tile of ordered) {
    let position = tile.position
    let consumed = false, merged = false
    let next = neighbor(position, direction)
    while (next !== null && !blocked.has(next)) {
      const doorValue = closedDoors.get(next)
      if (doorValue !== undefined) {
        if (tile.value === doorValue && !openedDoors.includes(next)) {
          openedDoors.push(next)
          position = next
          consumed = true
        }
        break
      }
      const occupant = tiles.find(settled => settled.position === next)
      if (occupant) {
        if (occupant.value === tile.value && !mergedIds.has(occupant.id)) {
          const result = { id: nextId++, value: tile.value * 2, position: next }
          tiles[tiles.indexOf(occupant)] = result
          mergedIds.add(result.id)
          for (const motion of motions) {
            if (motion.destination === next && !motion.consumed) motion.merged = true
          }
          gained += result.value
          position = next
          merged = true
        }
        break
      }
      position = next
      next = neighbor(position, direction)
    }
    if (!consumed && !merged) tiles.push({ ...tile, position })
    motions.push({ tile, destination: position, merged, ...(consumed ? { consumed: true } : {}) })
  }

  // 包括起点和跨过的地板。仍有数字停留的格子在之后离开时才会坍塌。
  const occupied = new Set(tiles.map(tile => tile.position))
  for (const motion of motions) {
    for (let position = motion.tile.position; position !== motion.destination; position += offsets[direction]) {
      if (puzzle?.fragile.includes(position) && !occupied.has(position) && !collapsedCells.includes(position)) collapsedCells.push(position)
    }
  }
  openedDoors.sort((a, b) => a - b)
  collapsedCells.sort((a, b) => a - b)
  const changed = motions.some(motion => motion.destination !== motion.tile.position || motion.merged || motion.consumed)
  return { tiles, motions, gained, nextId, openedDoors, collapsedCells, changed }
}
