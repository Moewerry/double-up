import { ArrowDown, ArrowLeft, ArrowRight, ArrowUp, Keyboard } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Kbd } from "@/components/ui/kbd"

export function KeyboardGuideDialog({ onOpenChange }: { onOpenChange: (open: boolean) => void }) {
  return <Dialog onOpenChange={onOpenChange}>
    <DialogTrigger asChild><Button variant="ghost" size="icon" className="size-11 rounded-full" aria-label="键盘操作指南"><Keyboard /></Button></DialogTrigger>
    <DialogContent className="max-h-[calc(100dvh-2rem)] w-[calc(100%-2rem)] max-w-[440px] overflow-y-auto rounded-[20px] sm:max-w-[440px]" onCloseAutoFocus={event => { event.preventDefault(); document.getElementById("double-up-board")?.focus({ preventScroll: true }) }}>
      <DialogHeader><DialogTitle>键盘操作指南</DialogTitle><DialogDescription>方向键或 WASD 移动，手机上滑动棋盘。</DialogDescription></DialogHeader>
      <div className="grid grid-cols-1 gap-6 py-3 min-[380px]:grid-cols-2">
        <section aria-label="方向键" className="space-y-3 text-center">
          <h2 className="text-sm font-medium">方向键</h2>
          <div className="mx-auto grid w-fit grid-cols-3 gap-1.5">
            {([[ArrowUp, "向上", "col-start-2"], [ArrowLeft, "向左", "col-start-1"], [ArrowDown, "向下", ""], [ArrowRight, "向右", ""]] as const).map(([Icon, label, position]) => <Kbd key={label} className={`size-10 rounded-lg border bg-card text-foreground shadow-sm ${position}`} aria-label={label}><Icon className="size-4" aria-hidden /></Kbd>)}
          </div>
        </section>
        <section aria-label="WASD 按键" className="space-y-3 text-center">
          <h2 className="text-sm font-medium">WASD</h2>
          <div className="mx-auto grid w-fit grid-cols-3 gap-1.5">
            {([ ["W", "向上", "col-start-2"], ["A", "向左", "col-start-1"], ["S", "向下", ""], ["D", "向右", ""] ] as const).map(([key, label, position]) => <Kbd key={key} className={`size-10 rounded-lg border bg-card text-base text-foreground shadow-sm ${position}`} aria-label={`${key}，${label}`}>{key}</Kbd>)}
          </div>
        </section>
      </div>
      <DialogClose asChild><Button className="h-11 w-full">知道了</Button></DialogClose>
    </DialogContent>
  </Dialog>
}
