import { BoardCells } from "@/components/game/board-cells"
import { Tile } from "@/components/game/tile"
import { getLevel } from "@/game/levels"
import type { Session } from "@/game/types"

export function GamePreview({ session }: { session: Session }) {
  const level = getLevel(session.level)
  return <div aria-hidden className="game-board relative aspect-square w-full max-w-[300px] rounded-[20px] border border-border">
    <BoardCells puzzle={level.puzzle} state={session} target={level.target} />
    {session.tiles.map(tile => <Tile key={tile.id} value={tile.value} position={tile.position} />)}
  </div>
}
