import { ArrowDown, ArrowLeft, ArrowRight, ArrowUp } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { Direction } from "@/game/types"

export function DirectionControls({ onMove, disabled }: { onMove: (direction: Direction) => void; disabled: boolean }) {
  return <div className="mx-auto mt-5 grid w-fit grid-cols-3 gap-1.5" aria-label="方向操作">
    {([ ["up", ArrowUp, "向上", "col-start-2"], ["left", ArrowLeft, "向左", "col-start-1"], ["down", ArrowDown, "向下", ""], ["right", ArrowRight, "向右", ""] ] as const).map(([direction, Icon, label, position]) => <Button key={direction} variant="outline" className={`size-11 ${position}`} onClick={() => onMove(direction)} disabled={disabled} aria-label={label}><Icon /></Button>)}
  </div>
}
