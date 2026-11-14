import { Sparkles } from "lucide-react"
import { useGameStore } from "@/stores/use-game-store"
import { getLevel } from "@/game/levels"
import { currentRecord } from "@/game/records"

export function ResultRecords({ level }: { level: number }) {
  const record = useGameStore(state => currentRecord(state.data.records, getLevel(level)))
  const feedback = useGameStore(state => state.clearFeedback)
  if (!record) return null

  const achievements = feedback?.firstClear ? ["首次通关"] : [feedback?.bestScore && "刷新最高分", feedback?.fewestMoves && "刷新最少步数"].filter(Boolean)
  if (achievements.length === 0) return null

  return <p className="flex flex-wrap items-center justify-center gap-2 text-xs font-semibold text-[#427355]"><Sparkles className="size-4" aria-hidden />{achievements.join(" · ")}</p>
}
