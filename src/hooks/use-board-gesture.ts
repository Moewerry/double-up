import { useEffect, useRef } from "react"
import type { PointerEvent as ReactPointerEvent } from "react"
import type { Direction } from "@/game/types"

export function useBoardGesture(onMove: (direction: Direction) => void, enabled: boolean) {
  const pointer = useRef<{ id: number; x: number; y: number; cancelled: boolean } | null>(null)

  useEffect(() => {
    const clear = () => { pointer.current = null }
    const cancelMultiple = (event: PointerEvent) => {
      if (pointer.current && event.pointerId !== pointer.current.id) pointer.current.cancelled = true
    }
    clear()
    window.addEventListener("pointerdown", cancelMultiple, true)
    document.addEventListener("visibilitychange", clear)
    return () => {
      clear()
      window.removeEventListener("pointerdown", cancelMultiple, true)
      document.removeEventListener("visibilitychange", clear)
    }
  }, [enabled])

  function cancel(event: ReactPointerEvent<HTMLDivElement>) {
    if (pointer.current?.id === event.pointerId) pointer.current = null
  }

  return {
    onPointerDown(event: ReactPointerEvent<HTMLDivElement>) {
      if (!enabled || !event.isPrimary || event.button !== 0) return
      pointer.current = { id: event.pointerId, x: event.clientX, y: event.clientY, cancelled: false }
      event.currentTarget.setPointerCapture(event.pointerId)
    },
    onPointerCancel: cancel,
    onLostPointerCapture: cancel,
    onPointerUp(event: ReactPointerEvent<HTMLDivElement>) {
      const start = pointer.current
      if (!start || start.id !== event.pointerId) return
      pointer.current = null
      if (!enabled || start.cancelled || document.hidden) return
      event.currentTarget.focus({ preventScroll: true })
      const x = event.clientX - start.x, y = event.clientY - start.y
      if (Math.max(Math.abs(x), Math.abs(y)) < 18) return
      if (Math.abs(x) >= Math.abs(y) * 1.2) onMove(x > 0 ? "right" : "left")
      else if (Math.abs(y) >= Math.abs(x) * 1.2) onMove(y > 0 ? "down" : "up")
    },
  }
}
