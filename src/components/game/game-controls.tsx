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
  </>
}
