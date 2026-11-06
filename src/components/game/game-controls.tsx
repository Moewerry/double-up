import { RotateCcw, Undo2, Keyboard } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { Session } from "@/game/types"

export function GameControls({ session, disabled, onUndo, onRestart, onDirections, directions }: { session: Session; disabled: boolean; onUndo: () => void; onRestart: () => void; onDirections: () => void; directions: boolean }) {
  return <>
    <div className="mt-6 flex justify-center gap-2">
      <Button className="h-11 flex-1 rounded-xl" variant="outline" onClick={onUndo} disabled={disabled || session.undoUsed || !session.previous || session.status === "won"}><Undo2 />{session.undoUsed ? "撤销已用完" : "撤销 1 次"}</Button>
      <Button className="h-11 flex-1 rounded-xl" variant="outline" onClick={onRestart} disabled={disabled}><RotateCcw />重新开始</Button>
      <Button className="size-11 rounded-xl" variant={directions ? "secondary" : "ghost"} onClick={onDirections} disabled={disabled} aria-label={directions ? "隐藏方向按钮" : "显示方向按钮"} aria-expanded={directions}><Keyboard /></Button>
    </div>
    <p className="mt-3 text-center text-[11px] text-muted-foreground">{session.undoUsed ? "本局撤销机会已使用，重开后恢复。" : !session.previous ? "走出第一步后，可以撤销一次。" : session.status === "won" ? "本关已完成，继续向上吧。" : "每局一次撤销，给灵感多一个机会。"}</p>
  </>
}
