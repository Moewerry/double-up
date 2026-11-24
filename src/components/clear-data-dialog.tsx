import { useState } from "react"
import { Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useGameStore } from "@/stores/use-game-store"

interface Props { open: boolean; onOpenChange: (open: boolean) => void; onCleared: () => void }

export function ClearDataDialog({ open, onOpenChange, onCleared }: Props) {
  const clearData = useGameStore(state => state.clearData)
  const [error, setError] = useState("")
  function changeOpen(value: boolean) { setError(""); onOpenChange(value) }
  function confirm() {
    if (!clearData()) { setError("清空失败，浏览器暂时无法保存更改，请重试。"); return }
    changeOpen(false)
    onCleared()
  }
  return <Dialog open={open} onOpenChange={changeOpen}>
    <DialogContent className="max-h-[calc(100dvh-2rem)] w-[calc(100%-2rem)] max-w-[400px] overflow-y-auto rounded-[20px] sm:max-w-[400px]">
      <DialogHeader>
        <DialogTitle>清空游戏数据？</DialogTitle>
        <DialogDescription className="leading-6">将清空此浏览器中的闯关进度、历史成绩和游戏设置，回到第一关。清空后无法恢复。</DialogDescription>
      </DialogHeader>
      {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
      <div className="mt-2 flex gap-3">
        <Button autoFocus variant="outline" className="h-11 flex-1" onClick={() => changeOpen(false)}>取消</Button>
        <Button variant="destructive" className="h-11 flex-1" onClick={confirm}><Trash2 className="size-4" />确认清空</Button>
      </div>
    </DialogContent>
  </Dialog>
}
