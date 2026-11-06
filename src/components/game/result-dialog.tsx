import { ArrowRight, RotateCcw, Trophy } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { levels, getLevel } from "@/game/levels"
import { failureReason } from "@/game/rules"
import type { Session } from "@/game/types"
import { ResultRecords } from "./result-records"

interface Props {
  session: Session
  open: boolean
  onOpenChange: (open: boolean) => void
  onNext: () => void
  onRestart: () => void
  onHome: () => void
  blocked: boolean
  onRestoreFocus: () => void
}
export function ResultDialog({ session, open, onOpenChange, onNext, onRestart, onHome, blocked, onRestoreFocus }: Props) {
  const won = session.status === "won", final = session.level === levels.length
  const level = getLevel(session.level)
  const exhausted = failureReason(session, level) === "moves"
  return <Dialog open={open} onOpenChange={onOpenChange}><DialogContent className="max-h-[calc(100dvh-2rem)] w-[calc(100%-2rem)] max-w-[400px] overflow-y-auto rounded-[20px] text-center sm:max-w-[400px]" onCloseAutoFocus={event => { event.preventDefault(); onRestoreFocus() }}>
    <div className="mx-auto mt-3 flex size-16 items-center justify-center rounded-2xl bg-[#ecf5e9] text-[#427355]">{won ? <Trophy className="size-8" /> : <RotateCcw className="size-8" />}</div>
    <DialogHeader className="text-center sm:text-center"><DialogTitle className="text-2xl font-bold">{won ? final ? "第一章，完成！" : "又向前了一点！" : exhausted ? "步数用完了" : "差一点，再试试"}</DialogTitle><DialogDescription className="leading-6">{won ? final ? "你已完成预览版的 5 关。后续章节仍在准备中。" : `成功合成 ${level.target}，下一份惊喜就在前面。` : exhausted ? `${level.maxMoves} 步内没能合出 ${level.target}。` : "没有可移动的位置了。整理思路，下一次会更好。"}</DialogDescription></DialogHeader>
    <div className="my-2 grid grid-cols-2 rounded-2xl bg-secondary/60 py-4"><div><p className="text-xs text-muted-foreground">本局得分</p><p className="mt-1 text-2xl font-bold tabular-nums">{session.score}</p></div><div><p className="text-xs text-muted-foreground">有效步数</p><p className="mt-1 text-2xl font-bold tabular-nums">{session.moves}</p></div></div>
    {won && <ResultRecords level={session.level} />}
    <div className="grid gap-2">
      {won && !final && <Button className="h-12" onClick={onNext} disabled={blocked}>继续第 {session.level + 1} 关<ArrowRight /></Button>}
      <Button className="h-12" variant={won && !final ? "outline" : "default"} onClick={onRestart} disabled={blocked}><RotateCcw />{won ? "再玩本关" : "重新挑战"}</Button>
      <Button className="h-11" variant="ghost" onClick={onHome}>返回首页</Button>
    </div>
  </DialogContent></Dialog>
}
