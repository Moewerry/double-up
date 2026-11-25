import { slideTiles } from "@/game/movement"
import type { Direction, Snapshot, Tile } from "@/game/types"

export const previewSlideDuration = 400

interface PreviewFrame {
  delay: number
  tiles: Tile[]
}

type PreviewTile = Omit<Tile, "id">

const turns: readonly { direction: Direction; pause: number; arrivals?: readonly PreviewTile[] }[] = [
  { direction: "left", pause: 650 },
  { direction: "up", pause: 640, arrivals: [{ value: 4, position: 12 }] },
  // The edge tiles stop the two 8s one cell short of the corner.
  { direction: "right", pause: 180, arrivals: [{ value: 4, position: 3 }] },
  { direction: "down", pause: 640, arrivals: [{ value: 8, position: 10 }, { value: 2, position: 14 }] },
]

function createPreviewSequence() {
  let snapshot: Snapshot = {
    tiles: [{ id: 1, value: 2, position: 5 }, { id: 2, value: 2, position: 7 }],
    score: 0, moves: 0, random: 1, nextId: 3, status: "playing",
  }
  const frames: PreviewFrame[] = [{ delay: 0, tiles: [] }, { delay: 740, tiles: snapshot.tiles }]
  const mergedIds = new Set<number>()

  for (const { direction, pause, arrivals } of turns) {
    if (arrivals) {
      const addedTiles = arrivals.map((tile, index) => ({ ...tile, id: snapshot.nextId + index }))
      snapshot = { ...snapshot, tiles: [...snapshot.tiles, ...addedTiles], nextId: snapshot.nextId + addedTiles.length }
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

  const finalTiles = [...snapshot.tiles, { id: snapshot.nextId, value: 2, position: 1 }]
  frames.push({ delay: 320, tiles: finalTiles })

  return { frames, finalTiles, mergedIds }
}

export const previewSequence = createPreviewSequence()
