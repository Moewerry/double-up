import { Progress } from "@/components/ui/progress"
import { ScorePanel } from "./score-panel"
import { TargetProgress } from "./target-progress"
import { levels } from "@/game/levels"
import { getLevelType } from "@/game/level-types"
import type { LevelConfig } from "@/game/level-types"
import type { RecordEntry, Session } from "@/game/types"

interface Props {
  level: LevelConfig
  session: Session
  record?: RecordEntry
  gained: number
  revision: number
}

export function GameSummary({ level, session, record, gained, revision }: Props) {
  const type = getLevelType(level.type)
  return <section aria-label="关卡目标与成绩" className="flow-root min-w-0 lg:col-start-2 lg:row-start-1">
    <div className="mt-7 flex items-center justify-between text-xs text-muted-foreground lg:mt-0">
      <span className="flex items-center gap-1.5"><span className="size-1.5 rounded-full bg-[#579478]" />初识数字 · {type.label}</span>
      <span className="tabular-nums">{String(session.level).padStart(2, "0")} / {String(levels.length).padStart(2, "0")}</span>
    </div>
    <Progress className="mt-3 h-1" value={(session.level - 1 + (record ? 1 : 0)) / levels.length * 100} aria-label={`当前第 ${session.level} 关`} />
    <div className="mt-7 text-center lg:text-left">
      <p className="text-xs tracking-[.16em] text-muted-foreground">LEVEL {String(session.level).padStart(2, "0")} · {level.title}</p>
      <h1 className="mt-3 flex items-baseline justify-center gap-3 text-2xl font-semibold lg:justify-start">合成<span className="text-5xl font-extrabold tracking-tight text-[#a95233] lg:text-6xl">{level.target}</span></h1>
      <TargetProgress maximum={Math.max(...session.tiles.map(tile => tile.value))} target={level.target} />
    </div>
    <ScorePanel score={session.score} moves={session.moves} best={record?.score ?? 0} gained={gained} revision={revision} />
  </section>
}
