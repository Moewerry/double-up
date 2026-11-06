import { Keyboard } from "lucide-react"
import { Button } from "@/components/ui/button"

export function GameControls({ disabled, onDirections, directions }: { disabled: boolean; onDirections: () => void; directions: boolean }) {
  return <>
    <div className="mt-6 flex justify-center gap-2">
      <Button className="size-11 rounded-xl" variant={directions ? "secondary" : "ghost"} onClick={onDirections} disabled={disabled} aria-label={directions ? "隐藏方向按钮" : "显示方向按钮"} aria-expanded={directions}><Keyboard /></Button>
    </div>
  </>
}
