import { Settings2, Volume2, Keyboard } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Switch } from "@/components/ui/switch"
import { useGameStore } from "@/stores/use-game-store"

export function SettingsDialog({ onOpenChange }: { onOpenChange?: (open: boolean) => void }) {
  const { data, toggle, blocked } = useGameStore()
  return <Dialog onOpenChange={onOpenChange}>
    <DialogTrigger asChild><Button variant="ghost" size="icon" className="size-11 rounded-full" aria-label="游戏设置"><Settings2 /></Button></DialogTrigger>
    <DialogContent className="max-w-[400px] rounded-[20px]">
      <DialogHeader><DialogTitle>按你的节奏来</DialogTitle><DialogDescription>一点小调整，玩得更顺手。</DialogDescription></DialogHeader>
      <label className="flex min-h-14 items-center justify-between gap-4"><span className="flex items-center gap-3"><Volume2 className="size-4" />合并音效</span><Switch className="relative before:absolute before:-inset-y-4 before:-inset-x-2" checked={data.sound} disabled={blocked} onCheckedChange={() => toggle("sound")} aria-label="合并音效" /></label>
      <label className="flex min-h-14 items-center justify-between gap-4"><span className="flex items-center gap-3"><Keyboard className="size-4" />显示方向按钮</span><Switch className="relative before:absolute before:-inset-y-4 before:-inset-x-2" checked={data.directions} disabled={blocked} onCheckedChange={() => toggle("directions")} aria-label="显示方向按钮" /></label>
      <p className="border-t pt-4 text-xs leading-6 text-muted-foreground">进度仅保存在当前浏览器。清除网站数据或更换设备后，进度不会同步。当前为前 5 关开发预览，尚待试玩验证。</p>
    </DialogContent>
  </Dialog>
}
