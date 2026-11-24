import { Flag, LockKeyhole, Unlock, X, Zap } from "lucide-react"
import type { PuzzleConfig } from "@/game/level-types"
import type { Snapshot } from "@/game/types"
import { cn } from "@/lib/utils"

export function BoardCells({ puzzle, state, target }: { puzzle?: PuzzleConfig; state: Snapshot; target: number }) {
  return <div className="absolute inset-[var(--gap)] grid grid-cols-4 grid-rows-4 gap-[var(--gap)]">
    {Array.from({ length: 16 }, (_, position) => {
      const wall = puzzle?.walls.includes(position)
      const collapsed = state.collapsedCells?.includes(position)
      const fragile = puzzle?.fragile.includes(position)
      const door = puzzle?.doors.find(door => door.position === position)
      const opened = state.openedDoors?.includes(position)
      const goal = puzzle?.goal.kind === "deliver" && puzzle.goal.position === position
      const label = wall ? "墙" : collapsed ? "已坍塌，无法经过" : door ? opened ? "已打开的门" : `需要 ${door.value} 的锁门` : goal ? `送入 ${target} 的终点` : fragile ? "离开后坍塌的地板" : ""
      return <div key={position} className={cn(
        "game-cell relative flex items-center justify-center rounded-xl border border-border/60 bg-card/70",
        wall && "game-cell-wall border-wall-edge bg-wall",
        collapsed && "border-dashed border-foreground/30 bg-pit",
        fragile && !collapsed && "border-dashed border-warning-border bg-warning-soft",
        door && !opened && "border-warning-border bg-door",
        door && opened && "border-dashed border-success/35 bg-secondary",
        goal && "border-2 border-success/65 bg-success-soft",
      )}>
        {label && <span className="sr-only">第 {Math.floor(position / 4) + 1} 行第 {position % 4 + 1} 列，{label}。</span>}
        {collapsed ? <X aria-hidden className="size-6 text-card/80" /> : door && !opened ? <div aria-hidden className="flex flex-col items-center gap-0.5 text-warning"><LockKeyhole className="size-4 sm:size-5" /><span className="font-numerals text-xl font-extrabold">{door.value}</span></div> : <>
          {fragile && <Zap aria-hidden className="pointer-events-none absolute bottom-1 left-1 z-20 size-4 text-warning" />}
          {door && opened && <Unlock aria-hidden className="absolute left-1 top-1 size-3 text-success/60" />}
          {goal && <><Flag aria-hidden className="pointer-events-none absolute right-1 top-1 z-20 size-3 text-success sm:size-4" /><span aria-hidden className="font-numerals text-lg font-bold text-success/60">{target}</span></>}
        </>}
      </div>
    })}
  </div>
}
