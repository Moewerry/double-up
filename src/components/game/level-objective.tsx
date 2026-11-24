import { Flag, LockKeyhole, Zap } from "lucide-react"
import type { LevelConfig } from "@/game/level-types"
import type { Session } from "@/game/types"

export function LevelObjective({ level, session }: { level: LevelConfig; session: Session }) {
  const puzzle = level.puzzle
  const text = puzzle?.goal.kind === "doors" ? "打开全部锁门" : puzzle?.goal.kind === "deliver" ? `把 ${level.target} 送到终点` : `合出 ${level.target}`
  const remaining = puzzle?.doors.filter(door => !session.openedDoors?.includes(door.position)).length ?? 0
  return <div className="mb-3 space-y-1.5 text-center">
    <p className="flex items-center justify-center gap-1.5 text-sm font-semibold text-foreground">
      {puzzle?.goal.kind === "deliver" ? <Flag aria-hidden className="size-4" /> : puzzle?.goal.kind === "doors" ? <LockKeyhole aria-hidden className="size-4" /> : null}{text}
    </p>
    <p className="text-xs leading-5 text-muted-foreground">{level.tip}</p>
    {(!!puzzle?.doors.length || !!puzzle?.fragile.length) && <div className="flex flex-wrap justify-center gap-x-4 gap-y-1 text-[11px] text-muted-foreground">
      {!!puzzle?.doors.length && <span className="flex items-center gap-1"><LockKeyhole aria-hidden className="size-3" />{remaining ? `还需开 ${remaining} 扇门 · 消耗相同数字` : "锁门已打开"}</span>}
      {!!puzzle?.fragile.length && <span className="flex items-center gap-1"><Zap aria-hidden className="size-3" />裂纹格离开后坍塌</span>}
    </div>}
  </div>
}
