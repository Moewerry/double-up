import type { CSSProperties } from "react"
import { ArrowLeft, Hand } from "lucide-react"
import type { Direction } from "@/game/types"

const rotation: Record<Direction, number> = { left: 0, up: 90, right: 180, down: -90 }

export function TutorialGesture({ direction, hint }: { direction: Direction; hint: number }) {
  return <div key={hint} aria-hidden className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center">
    <div className="relative h-12 w-32 text-coral" style={{ transform: `rotate(${rotation[direction]}deg)` } as CSSProperties}>
      <span className="absolute left-3 right-3 top-1/2 border-t-2 border-dashed border-coral/50" />
      <ArrowLeft className="absolute left-0 top-1/2 size-7 -translate-y-1/2 rounded-full bg-card/95 p-1" strokeWidth={3} />
      <Hand className="tutorial-hand absolute left-1/2 top-1/2 size-9 rounded-full bg-card/95 p-1.5 shadow-sm" />
    </div>
  </div>
}
