import { Sparkles } from "lucide-react"
import type { Session } from "@/game/types"

export function MoveFeedback({ session, message, tip }: { session: Session; message: string; tip: string }) {
  const text = session.status === "won" ? "目标达成！打开结果，继续向上。" : session.status === "lost" ? "没有可移动的位置，可以撤销或重新挑战。" : message || tip
  return <div role="status" aria-live="polite" aria-atomic="true" className="mt-2 min-h-6 text-center text-xs leading-6 text-muted-foreground">
    <span className="inline-flex items-center justify-center gap-1.5"><Sparkles className="size-3 shrink-0" aria-hidden />{text}</span>
    <span className="sr-only">已走 {session.moves} 步，得分 {session.score}。</span>
  </div>
}
