import { Card, CardContent } from "@/components/ui/card"
import { remainingMoves } from "@/game/rules"
import type { Status } from "@/game/types"
import { cn } from "@/lib/utils"

interface Props { score: number; moves: number; best: number; gained: number; revision: number; status: Status; maxMoves?: number }

export function ScorePanel({ score, moves, best, gained, revision, status, maxMoves }: Props) {
  const remaining = remainingMoves(moves, maxMoves)
  const values: [string, number | string][] = [["本局得分", score], [remaining === undefined ? "已走步数" : "剩余步数", remaining ?? moves], ["通关最高分", best || "—"]]
  return <div className="grid grid-cols-3 gap-2.5 lg:grid-cols-1">{values.map(([label, value], index) => {
    const warning = index === 1 && remaining !== undefined && remaining <= 5 && status !== "won"
    return <Card key={label} className={cn("relative gap-0 rounded-2xl border-border/70 bg-white/75 py-0 shadow-none", warning && "border-[#d9996c] bg-[#fff0df]")}><CardContent className="px-2 py-3 text-center">
      <p className="text-[11px] text-muted-foreground">{label}</p>
      <p className={cn("mt-1 text-xl font-bold tabular-nums", warning && "text-destructive")} aria-label={index === 1 && remaining !== undefined ? `剩余 ${remaining} 步，共 ${maxMoves} 步` : undefined}>{value}</p>
      {index === 0 && gained > 0 && <span key={revision} aria-hidden className="score-gain absolute -top-2 right-2 rounded-full bg-[#fff0df] px-2 text-xs font-bold text-[#9b4429]">+{gained}</span>}
    </CardContent></Card>
  })}</div>
}
