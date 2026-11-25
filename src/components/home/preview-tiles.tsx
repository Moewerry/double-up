import { useEffect, useState, type CSSProperties } from "react"
import type { Tile } from "@/game/types"
import { useReducedMotion } from "@/hooks/use-reduced-motion"
import { cn } from "@/lib/utils"
import { AccentMarks } from "./accent-marks"
import { previewSequence, previewSlideDuration } from "./preview-sequence"

function TileLayer({ tiles }: { tiles: Tile[] }) {
  return tiles.map(({ id, value, position }) => {
    const merged = previewSequence.mergedIds.has(id)
    return <span
      key={id}
      className={cn(
        "home-preview-tile",
        merged ? "home-preview-merge home-motion:animate-home-merge-result home-motion:after:animate-home-merge-ring"
          : "home-motion:animate-home-tile-appear",
      )}
      data-value={value}
      style={{ "--home-preview-x": position % 4, "--home-preview-y": Math.floor(position / 4) } as CSSProperties}
    >
      {value}
      {value === 16 && <AccentMarks className="home-accent--board-merge" />}
    </span>
  })
}

function AnimatedTileLayer() {
  const [frameIndex, setFrameIndex] = useState(0)

  useEffect(() => {
    const nextFrame = previewSequence.frames[frameIndex + 1]
    if (!nextFrame) return
    const timer = window.setTimeout(() => setFrameIndex(frameIndex + 1), nextFrame.delay)
    return () => window.clearTimeout(timer)
  }, [frameIndex])

  return <TileLayer tiles={previewSequence.frames[frameIndex].tiles} />
}

export function PreviewTiles() {
  const reduced = useReducedMotion()

  return <div
    className="home-preview-grid"
    style={{ "--home-preview-slide-duration": `${previewSlideDuration}ms` } as CSSProperties}
  >
    {Array.from({ length: 16 }, (_, position) => <div key={position} className="home-preview-cell" />)}
    {reduced ? <TileLayer tiles={previewSequence.finalTiles} /> : <AnimatedTileLayer />}
  </div>
}
