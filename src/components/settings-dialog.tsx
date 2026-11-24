import { useRef, useState } from "react"
import { Music, Settings, Settings2, Volume2, RotateCcw, Trash2 } from "lucide-react"
import { useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Switch } from "@/components/ui/switch"
import { useGameStore } from "@/stores/use-game-store"
import { ClearDataDialog } from "@/components/clear-data-dialog"

interface Props { onOpenChange?: (open: boolean) => void; onRestart?: () => void; appearance?: "default" | "home" }

export function SettingsDialog({ onOpenChange, onRestart, appearance = "default" }: Props) {
  const { data, toggle, blocked } = useGameStore()
  const [open, setOpen] = useState(false)
  const [clearing, setClearing] = useState(false)
  const navigate = useNavigate()
  const skipRestoreFocus = useRef(false)
  function changeOpen(value: boolean) { setOpen(value); onOpenChange?.(value) }
  return <Dialog open={open} onOpenChange={changeOpen}>
    <DialogTrigger asChild><Button variant={appearance === "home" ? "home-icon" : "ghost"} size="icon" className={appearance === "home" ? undefined : "size-11 rounded-full"} aria-label="游戏设置">{appearance === "home" ? <Settings /> : <Settings2 />}</Button></DialogTrigger>
    <DialogContent className="max-h-[calc(100dvh-2rem)] w-[calc(100%-2rem)] max-w-[400px] overflow-y-auto rounded-[20px] sm:max-w-[400px]" onCloseAutoFocus={event => {
      if (skipRestoreFocus.current) { event.preventDefault(); skipRestoreFocus.current = false; return }
      if (onRestart) { event.preventDefault(); document.getElementById("double-up-board")?.focus({ preventScroll: true }) }
    }}>
      <DialogHeader><DialogTitle>设置</DialogTitle><DialogDescription className="sr-only">{onRestart ? "调整背景音乐、游戏音效，重新开始本关或清空游戏数据。" : "调整背景音乐、游戏音效或清空游戏数据。"}</DialogDescription></DialogHeader>
      <label className="flex min-h-14 items-center justify-between gap-4"><span className="flex items-center gap-3"><Music className="size-4" />背景音乐</span><Switch className="relative before:absolute before:-inset-y-4 before:-inset-x-2" checked={data.music} disabled={blocked} onCheckedChange={() => toggle("music")} aria-label="背景音乐" /></label>
      <label className="flex min-h-14 items-center justify-between gap-4"><span className="flex items-center gap-3"><Volume2 className="size-4" />游戏音效</span><Switch className="relative before:absolute before:-inset-y-4 before:-inset-x-2" checked={data.sound} disabled={blocked} onCheckedChange={() => toggle("sound")} aria-label="游戏音效" /></label>
      {onRestart && <Button variant="outline" className="h-11 w-full" disabled={blocked} onClick={() => { skipRestoreFocus.current = true; changeOpen(false); onRestart() }}><RotateCcw />重新开始</Button>}
      <div className="border-t border-border/70 pt-3">
        <Button variant="ghost" className="h-11 w-full text-destructive hover:bg-destructive/8 hover:text-destructive" onClick={() => setClearing(true)}><Trash2 />清空游戏数据</Button>
      </div>
      <ClearDataDialog open={clearing} onOpenChange={setClearing} onCleared={() => { skipRestoreFocus.current = true; changeOpen(false); navigate("/", { replace: true }) }} />
    </DialogContent>
  </Dialog>
}
