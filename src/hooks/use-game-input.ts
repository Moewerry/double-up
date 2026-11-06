import { useCallback, useEffect, useRef } from "react"
import type { Direction } from "@/game/types"
import { useGameStore } from "@/stores/use-game-store"
import { playSound } from "@/lib/audio"

export function useGameInput(enabled: boolean) {
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const pending = useRef<Direction | null>(null)
  const allowed = useRef(enabled)
  allowed.current = enabled
  const clear = useCallback(() => {
    if (timer.current) clearTimeout(timer.current)
    timer.current = null
    pending.current = null
  }, [])
  const submit = useCallback(function submitDirection(direction: Direction) {
    if (!allowed.current || document.hidden) return
    if (timer.current) { pending.current = direction; return }
    const store = useGameStore.getState()
    if (!store.move(direction)) return
    const next = useGameStore.getState()
    if (next.data.sound && (next.gained > 0 || next.data.session.status !== "playing")) playSound(next.data.session.status)
    timer.current = setTimeout(() => {
      timer.current = null
      const queued = pending.current
      pending.current = null
      if (queued) submitDirection(queued)
    }, 160)
  }, [])
  useEffect(() => {
    if (!enabled) clear()
    const onKey = (event: KeyboardEvent) => {
      if (!enabled || event.repeat || event.altKey || event.ctrlKey || event.metaKey) return
      if (event.target instanceof Element && event.target.closest("button,a,input,textarea,select,[contenteditable=true],[role=switch],[role=dialog]")) return
      const keys: Record<string, Direction> = { ArrowUp: "up", ArrowDown: "down", ArrowLeft: "left", ArrowRight: "right", w: "up", s: "down", a: "left", d: "right" }
      const direction = keys[event.key] ?? keys[event.key.toLowerCase()]
      if (direction) { event.preventDefault(); submit(direction) }
    }
    window.addEventListener("keydown", onKey)
    document.addEventListener("visibilitychange", clear)
    return () => { window.removeEventListener("keydown", onKey); document.removeEventListener("visibilitychange", clear); clear() }
  }, [enabled, submit, clear])
  return { submit, clear }
}
