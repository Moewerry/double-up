import { useCallback, useEffect, useRef, useState } from "react"
import { MOVE_DURATION } from "@/game/animation"
import { createTutorial, moveTutorial, nextTutorialStep, resetTutorialStep } from "@/game/tutorial"
import type { TutorialState } from "@/game/tutorial"
import type { Direction } from "@/game/types"
import { playSound } from "@/lib/audio"
import { useGameStore } from "@/stores/use-game-store"
import { useDirectionalKeys } from "./use-directional-keys"
import { useReducedMotion } from "./use-reduced-motion"

function focusBoard() { document.getElementById("double-up-board")?.focus({ preventScroll: true }) }

export function useTutorial(enabled: boolean) {
  const [state, setState] = useState(() => createTutorial())
  const [busy, setBusy] = useState(false)
  const current = useRef(state)
  const allowed = useRef(enabled)
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const pending = useRef<Direction | null>(null)
  const reduced = useReducedMotion()
  allowed.current = enabled

  const publish = useCallback((next: TutorialState) => { current.current = next; setState(next) }, [])
  const clear = useCallback(() => {
    if (timer.current !== null) clearTimeout(timer.current)
    timer.current = null
    pending.current = null
    setBusy(false)
  }, [])
  const submit = useCallback(function submitDirection(direction: Direction) {
    if (!allowed.current || document.hidden || current.current.phase !== "playing") return
    if (timer.current !== null) { pending.current = direction; return }
    const previous = current.current
    const next = moveTutorial(previous, direction)
    publish(next)
    if (next.revision === previous.revision) return
    if (useGameStore.getState().data.sound && (next.gained > 0 || next.session.status !== "playing")) playSound(next.session.status)
    if (reduced) return
    setBusy(true)
    timer.current = setTimeout(() => {
      timer.current = null
      setBusy(false)
      const queued = pending.current
      pending.current = null
      if (queued) submitDirection(queued)
    }, MOVE_DURATION)
  }, [publish, reduced])

  const next = useCallback(() => {
    if (timer.current !== null) return
    const nextState = nextTutorialStep(current.current)
    if (nextState === current.current) return
    clear()
    publish(nextState)
    focusBoard()
  }, [clear, publish])
  const reset = useCallback(() => { clear(); publish(resetTutorialStep(current.current)); focusBoard() }, [clear, publish])
  const startOver = useCallback(() => { clear(); publish(createTutorial(current.current.revision + 1)); focusBoard() }, [clear, publish])

  useDirectionalKeys(enabled, submit, clear)
  useEffect(() => {
    const frame = requestAnimationFrame(focusBoard)
    return () => cancelAnimationFrame(frame)
  }, [])
  return { state, busy, submit, clear, next, reset, startOver }
}
