import { useRef, useState } from "react"
import { Settings2, Volume2, RotateCcw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Switch } from "@/components/ui/switch"
import { useGameStore } from "@/stores/use-game-store"

interface Props { onOpenChange?: (open: boolean) => void; onRestart?: () => void }

export function SettingsDialog({ onOpenChange, onRestart }: Props) {
  const { data, toggle, blocked } = useGameStore()
  const [open, setOpen] = useState(false)
  const openingRestart = useRef(false)
  function changeOpen(value: boolean) { setOpen(value); onOpenChange?.(value) }
  return <Dialog open={open} onOpenChange={changeOpen}>
    <DialogTrigger asChild><Button variant="ghost" size="icon" className="size-11 rounded-full" aria-label="游戏设置"><Settings2 /></Button></DialogTrigger>
    <DialogContent className="max-h-[calc(100dvh-2rem)] w-[calc(100%-2rem)] max-w-[400px] overflow-y-auto rounded-[20px] sm:max-w-[400px]" onCloseAutoFocus={event => {
      if (openingRestart.current) { event.preventDefault(); openingRestart.current = false; return }
      if (onRestart) { event.preventDefault(); document.getElementById("double-up-board")?.focus({ preventScroll: true }) }
    }}>
      <DialogHeader><DialogTitle>设置</DialogTitle><DialogDescription className="sr-only">{onRestart ? "调整音效或重新开始本关。" : "调整游戏设置。"}</DialogDescription></DialogHeader>
      <label className="flex min-h-14 items-center justify-between gap-4"><span className="flex items-center gap-3"><Volume2 className="size-4" />合并音效</span><Switch className="relative before:absolute before:-inset-y-4 before:-inset-x-2" checked={data.sound} disabled={blocked} onCheckedChange={() => toggle("sound")} aria-label="合并音效" /></label>
      {onRestart && <Button variant="outline" className="h-11 w-full" disabled={blocked} onClick={() => { openingRestart.current = true; changeOpen(false); onRestart() }}><RotateCcw />重新开始</Button>}
    </DialogContent>
  </Dialog>
}
