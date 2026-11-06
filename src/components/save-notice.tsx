import { AlertCircle, RefreshCcw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { useGameStore } from "@/stores/use-game-store"

export function SaveNotice() {
  const { notice, saveStatus, blocked, retrySave, dismissNotice } = useGameStore()
  const unavailable = saveStatus === "unavailable"
  if (!notice && !unavailable) return null

  return <Card role="alert" className="mb-4 gap-0 border-[#d3aa78] bg-[#fff0d7] py-0 text-[#704921] shadow-none">
    <CardContent className="p-3 text-xs leading-6">
      <div className="flex items-start gap-2">
        <AlertCircle className="mt-1 size-4 shrink-0" aria-hidden />
        <div>
          {notice && <p>{notice}</p>}
          {unavailable && <p>当前进度无法自动保存。可以继续本次游玩，但离开页面可能丢失进度。</p>}
        </div>
      </div>
      {!blocked && <div className="mt-2 flex flex-wrap gap-2">
        {unavailable && <Button variant="outline" className="h-11" onClick={retrySave}><RefreshCcw />重试保存</Button>}
        {notice && <Button variant="ghost" className="h-11" onClick={dismissNotice}>知道了</Button>}
      </div>}
    </CardContent>
  </Card>
}
