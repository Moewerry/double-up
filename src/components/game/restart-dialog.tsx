import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"

interface Props { open: boolean; onOpenChange: (open: boolean) => void; onRestart: () => void; blocked: boolean }

export function RestartDialog({ open, onOpenChange, onRestart, blocked }: Props) {
  return <Dialog open={open} onOpenChange={onOpenChange}>
    <DialogContent className="max-h-[calc(100dvh-2rem)] w-[calc(100%-2rem)] max-w-[400px] overflow-y-auto rounded-[20px] sm:max-w-[400px]" onCloseAutoFocus={event => { event.preventDefault(); document.getElementById("double-up-board")?.focus({ preventScroll: true }) }}>
      <DialogHeader><DialogTitle>从这一关重新开始？</DialogTitle><DialogDescription>本局分数和步数将重置，已有通关记录会保留。</DialogDescription></DialogHeader>
      <div className="mt-2 flex gap-3">
        <Button className="h-11 flex-1" variant="outline" onClick={() => onOpenChange(false)}>继续这一局</Button>
        <Button className="h-11 flex-1" onClick={onRestart} disabled={blocked}>重新开始</Button>
      </div>
    </DialogContent>
  </Dialog>
}
