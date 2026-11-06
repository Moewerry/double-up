import type { Session } from "@/game/types"

export function MoveFeedback({ session, message }: { session: Session; message: string }) {
  const text = session.status === "won" ? "本关目标已达成。" : session.status === "lost" ? "没有可移动的位置，请重新挑战。" : message
  return <div role="status" aria-live="polite" aria-atomic="true" className="sr-only">
    {text}已走 {session.moves} 步，得分 {session.score}。
  </div>
}
