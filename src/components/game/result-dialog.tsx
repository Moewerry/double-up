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
  const canContinue = won && !final
  const level = getLevel(session.level)
  const exhausted = failureReason(session, level) === "moves"
  const missingNumbers = failureReason(session, level) === "numbers"
  return <Dialog open={open} onOpenChange={onOpenChange}><DialogContent className="max-h-[calc(100dvh-2rem)] w-[calc(100%-2rem)] max-w-[400px] overflow-y-auto rounded-[20px] text-center sm:max-w-[400px]" onCloseAutoFocus={event => { event.preventDefault(); onRestoreFocus() }}>
    <div className="mx-auto mt-3 flex size-16 items-center justify-center rounded-[1.4rem] border border-success/15 bg-success-soft text-success">{won ? <Trophy className="size-8" /> : <RotateCcw className="size-8" />}</div>
    <DialogHeader className="text-center sm:text-center">
      <DialogTitle className="text-2xl font-bold">{won ? final ? "第一章，完成！" : "又向前了一点！" : exhausted ? "步数用完了" : "差一点，再试试"}</DialogTitle>
      <DialogDescription className={canContinue ? "sr-only" : "leading-6"}>
        {won ? final ? `你已完成第一章的 ${levels.length} 关。` : `已通关第 ${session.level} 关。` : exhausted ? `${level.maxMoves} 步内没能合出 ${level.target}。` : missingNumbers ? "剩下的数字已经无法完成目标。重新开始，换个合并顺序试试。" : "数字被挡住了。重新开始，换条路线试试。"}
      </DialogDescription>
    </DialogHeader>
    <div className="my-2 grid grid-cols-2 rounded-2xl bg-secondary/60 py-4"><div><p className="text-xs text-muted-foreground">本局得分</p><p className="mt-1 text-2xl font-bold tabular-nums">{session.score}</p></div><div><p className="text-xs text-muted-foreground">有效步数</p><p className="mt-1 text-2xl font-bold tabular-nums">{session.moves}</p></div></div>
    {won && <ResultRecords level={session.level} />}
    {canContinue ? (
      <Button className="h-12" onClick={onNext} disabled={blocked}>下一关<ArrowRight /></Button>
    ) : (
      <div className="grid gap-2">
        <Button className="h-12" onClick={onRestart} disabled={blocked}><RotateCcw />{won ? "再玩本关" : "重新挑战"}</Button>
        <Button className="h-11" variant="ghost" onClick={onHome}>返回首页</Button>
      </div>
    )}
  </DialogContent></Dialog>
}
