import { useEffect } from "react"
import type { Direction } from "@/game/types"

const keys = new Map<string, Direction>([["arrowup", "up"], ["arrowdown", "down"], ["arrowleft", "left"], ["arrowright", "right"], ["w", "up"], ["s", "down"], ["a", "left"], ["d", "right"]])

export function useDirectionalKeys(enabled: boolean, onMove: (direction: Direction) => void, onPause: () => void) {
  useEffect(() => {
    if (!enabled) onPause()
    const onKey = (event: KeyboardEvent) => {
      if (!enabled || event.defaultPrevented || event.repeat || event.altKey || event.ctrlKey || event.metaKey) return
      if (event.target instanceof Element && event.target.closest("button,a,input,textarea,select,[contenteditable=true],[role=switch],[role=dialog]")) return
      const direction = keys.get(event.key.toLowerCase())
      if (direction) { event.preventDefault(); onMove(direction) }
    }
    window.addEventListener("keydown", onKey)
    document.addEventListener("visibilitychange", onPause)
    return () => {
      window.removeEventListener("keydown", onKey)
      document.removeEventListener("visibilitychange", onPause)
      onPause()
    }
  }, [enabled, onMove, onPause])
}
