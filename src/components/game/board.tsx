import { useLayoutEffect, useRef, useState } from "react"
import type { Direction, Motion, Session } from "@/game/types"
import { Tile } from "./tile"

export function Board({ session, motions, revision, onMove }: { session: Session; motions: Motion[]; revision: number; onMove: (d: Direction) => void }) {
  const [phase, setPhase] = useState<"start" | "moving" | "done">("done")
  const initialRevision = useRef(revision)
  const pointer = useRef<{ id: number; x: number; y: number; cancelled: boolean } | null>(null)
  useLayoutEffect(() => {
    if (!motions.length || revision === initialRevision.current) { setPhase("done"); return }
    setPhase("start")
    let secondFrame = 0
    const frame = requestAnimationFrame(() => { secondFrame = requestAnimationFrame(() => setPhase("moving")) })
    const timer = setTimeout(() => setPhase("done"), 145)
    return () => { cancelAnimationFrame(frame); cancelAnimationFrame(secondFrame); clearTimeout(timer) }
  }, [revision, motions])
  const moving = phase !== "done" && motions.length > 0
  const movingIds = new Set(motions.map(m => m.tile.id))
  return <div id="double-up-board" role="group" aria-label="4 行 4 列数字棋盘" aria-describedby="board-help" tabIndex={0}
    className="game-board relative mx-auto aspect-square w-full max-w-[420px] touch-none select-none rounded-[20px] border border-[#e6d4c1] bg-white shadow-[0_8px_24px_#503c2808] outline-offset-4 focus-visible:outline-2 focus-visible:outline-ring"
    onPointerDown={event => {
      if (!event.isPrimary) { if (pointer.current) pointer.current.cancelled = true; return }
      if (event.pointerType === "mouse" && event.button !== 0) return
      pointer.current = { id: event.pointerId, x: event.clientX, y: event.clientY, cancelled: false }
      event.currentTarget.setPointerCapture(event.pointerId)
    }}
    onPointerCancel={() => { pointer.current = null }}
    onLostPointerCapture={() => { pointer.current = null }}
    onPointerUp={event => {
      const start = pointer.current
      pointer.current = null
      if (!start || start.id !== event.pointerId || start.cancelled) return
      event.currentTarget.focus({ preventScroll: true })
      const x = event.clientX - start.x, y = event.clientY - start.y
      if (Math.max(Math.abs(x), Math.abs(y)) < 18) return
      if (Math.abs(x) >= Math.abs(y) * 1.2) onMove(x > 0 ? "right" : "left")
      else if (Math.abs(y) >= Math.abs(x) * 1.2) onMove(y > 0 ? "down" : "up")
    }}>
    <div className="absolute inset-[var(--gap)] grid grid-cols-4 grid-rows-4 gap-[var(--gap)]" aria-hidden>{Array.from({ length: 16 }, (_, i) => <div key={i} className="rounded-lg border border-[#f0e7de] bg-white" />)}</div>
    {session.tiles.map(tile => <Tile key={tile.id} value={tile.value} position={tile.position} hidden={moving} arriving={!moving && !movingIds.has(tile.id) && motions.length > 0 && revision !== initialRevision.current} />)}
    {moving && motions.map(motion => <Tile key={`source-${motion.tile.id}`} value={motion.tile.value} position={phase === "start" ? motion.tile.position : motion.destination} ghost />)}
  </div>
}
