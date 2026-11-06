import type { Direction, Motion, Session } from "@/game/types"
import { useBoardAnimation } from "@/hooks/use-board-animation"
import { useBoardGesture } from "@/hooks/use-board-gesture"
import { Tile } from "./tile"

export function Board({ session, motions, revision, onMove, enabled, highlightedPositions = [] }: { session: Session; motions: Motion[]; revision: number; onMove: (d: Direction) => void; enabled: boolean; highlightedPositions?: readonly number[] }) {
  const { phase, moving, arriving } = useBoardAnimation(revision, motions.length > 0, enabled)
  const gesture = useBoardGesture(onMove, enabled)
  const movingIds = new Set(motions.map(m => m.tile.id))
  return <div id="double-up-board" role="group" aria-label="4 行 4 列数字棋盘" aria-describedby="board-help" tabIndex={0}
    className="game-board relative mx-auto aspect-square w-full max-w-[420px] touch-none select-none rounded-[20px] border border-[#e6d4c1] bg-white shadow-[0_8px_24px_#503c2808] outline-offset-4 focus-visible:outline-2 focus-visible:outline-ring lg:max-w-[480px]"
    {...gesture}>
    <div className="absolute inset-[var(--gap)] grid grid-cols-4 grid-rows-4 gap-[var(--gap)]" aria-hidden>{Array.from({ length: 16 }, (_, i) => <div key={i} className="rounded-lg border border-[#f0e7de] bg-white" />)}</div>
    {session.tiles.map(tile => <Tile key={tile.id} value={tile.value} position={tile.position} hidden={moving} arriving={arriving && !movingIds.has(tile.id)} highlighted={highlightedPositions.includes(tile.position)} />)}
    {moving && motions.map(motion => <Tile key={`source-${motion.tile.id}`} value={motion.tile.value} position={phase === "start" ? motion.tile.position : motion.destination} ghost />)}
  </div>
}
