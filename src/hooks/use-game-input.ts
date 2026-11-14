import { useCallback, useRef, useState } from "react"
import type { Direction } from "@/game/types"
import { useGameStore } from "@/stores/use-game-store"
import { playSound } from "@/lib/audio"
import { MOVE_DURATION } from "@/game/animation"
import { useReducedMotion } from "./use-reduced-motion"
import { useDirectionalKeys } from "./use-directional-keys"

export function useGameInput(enabled: boolean) {
  const [feedback, setFeedback] = useState("")
  const reduced = useReducedMotion()
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const pending = useRef<Direction | null>(null)
  const allowed = useRef(enabled)
  allowed.current = enabled
  const clear = useCallback(() => {
    if (timer.current) clearTimeout(timer.current)
    timer.current = null
    pending.current = null
    setFeedback("")
  }, [])
  const submit = useCallback(function submitDirection(direction: Direction) {
    if (!allowed.current || document.hidden) return
    if (timer.current) { pending.current = direction; return }
    const store = useGameStore.getState()
    if (!store.move(direction)) {
      if (!store.blocked && store.data.session.status === "playing") setFeedback("这个方向暂时动不了，换个方向试试。")
      return
    }
    const next = useGameStore.getState()
    setFeedback(next.gained ? `本步合并 +${next.gained} 分` : "移动了一步，找找能合并的相同数字。")
    if (next.data.sound) playSound(next.data.session.status, next.gained)
    if (reduced) return
    timer.current = setTimeout(() => {
      timer.current = null
      const queued = pending.current
      pending.current = null
      if (queued) submitDirection(queued)
    }, MOVE_DURATION)
  }, [reduced])
  useDirectionalKeys(enabled, submit, clear)
  return { submit, clear, feedback }
}
