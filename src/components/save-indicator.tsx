import { Check, AlertCircle, Save } from "lucide-react"
import { useGameStore } from "@/stores/use-game-store"
import { cn } from "@/lib/utils"

export function SaveIndicator() {
  const status = useGameStore(state => state.saveStatus)
  const blocked = useGameStore(state => state.blocked)
  const Icon = blocked || status === "unavailable" ? AlertCircle : status === "saved" ? Check : Save
  const label = blocked ? "进度已暂停，请查看上方提示" : status === "saved" ? "已保存到当前浏览器" : status === "unavailable" ? "本次进度尚未保存" : "开始操作后自动保存"
  return <p aria-live="polite" className={cn("flex items-center justify-center gap-1.5 text-[11px]", status === "unavailable" || blocked ? "text-[#9b4429]" : "text-muted-foreground")}>
    <Icon className="size-3" aria-hidden />{label}
  </p>
}
