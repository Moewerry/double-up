import { Sparkles } from "lucide-react"
import { useGameStore } from "@/stores/use-game-store"

export function ResultRecords({ level }: { level: number }) {
  const record = useGameStore(state => state.data.records[String(level)])
  const feedback = useGameStore(state => state.clearFeedback)
  if (!record) return null

  const achievements = feedback?.firstClear ? ["首次通关"] : [feedback?.bestScore && "刷新最高分", feedback?.fewestMoves && "刷新最少步数"].filter(Boolean)
  return <div className="space-y-2 text-xs">
    {achievements.length > 0 && <p className="flex flex-wrap items-center justify-center gap-2 font-semibold text-[#427355]"><Sparkles className="size-4" aria-hidden />{achievements.join(" · ")}</p>}
    <p className="text-muted-foreground">本关各自最佳：{record.score} 分 · {record.moves} 步</p>
  </div>
}
