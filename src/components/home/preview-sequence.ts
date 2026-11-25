import { slideTiles } from "@/game/movement"
import type { Direction, Snapshot, Tile } from "@/game/types"

export const previewSlideDuration = 400

interface PreviewFrame {
  delay: number
  tiles: Tile[]
}

const turns: readonly { direction: Direction; pause: number; partner?: Omit<Tile, "id"> }[] = [
  { direction: "left", pause: 650 },
  { direction: "up", pause: 640, partner: { value: 4, position: 12 } },
  { direction: "right", pause: 480 },
  { direction: "down", pause: 640, partner: { value: 8, position: 11 } },
]

function createPreviewSequence() {
  let snapshot: Snapshot = {
    tiles: [{ id: 1, value: 2, position: 5 }, { id: 2, value: 2, position: 7 }],
    score: 0, moves: 0, random: 1, nextId: 3, status: "playing",
  }
  const frames: PreviewFrame[] = [{ delay: 0, tiles: [] }, { delay: 740, tiles: snapshot.tiles }]
  const mergedIds = new Set<number>()

  for (const { direction, pause, partner } of turns) {
    if (partner) {
      const tile = { ...partner, id: snapshot.nextId }
      snapshot = { ...snapshot, tiles: [...snapshot.tiles, tile], nextId: snapshot.nextId + 1 }
      frames.push({ delay: 300, tiles: snapshot.tiles })
    }

    const result = slideTiles(snapshot, direction)
    frames.push(
      { delay: pause, tiles: result.motions.map(({ tile, destination }) => ({ ...tile, position: destination })) },
      { delay: previewSlideDuration + 45, tiles: result.tiles },
    )
    for (const tile of result.tiles) {
      if (tile.id >= snapshot.nextId) mergedIds.add(tile.id)
    }
    snapshot = { ...snapshot, tiles: result.tiles, nextId: result.nextId }
  }

  return { frames, finalTiles: snapshot.tiles, mergedIds }
}

export const previewSequence = createPreviewSequence()
