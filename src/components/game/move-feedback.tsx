import type { Session } from "@/game/types"
import { getLevel } from "@/game/levels"
import { failureReason, remainingMoves } from "@/game/rules"

export function MoveFeedback({ session, message }: { session: Session; message: string }) {
  const level = getLevel(session.level)
  const remaining = remainingMoves(session.moves, level.maxMoves)
  const text = session.status === "won" ? "本关目标已达成。" : failureReason(session, level) === "moves" ? "步数已用完，请重新挑战。" : failureReason(session, level) === "numbers" ? "剩余数字无法完成目标，请重新挑战。" : session.status === "lost" ? "没有可移动的位置，请重新挑战。" : message
  return <div role="status" aria-live="polite" aria-atomic="true" className="sr-only">
    {text}已走 {session.moves} 步，得分 {session.score}。{remaining !== undefined && `剩余 ${remaining} 步。`}
  </div>
}
