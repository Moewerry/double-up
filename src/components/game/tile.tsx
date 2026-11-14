import type { CSSProperties } from "react"
import { cn } from "@/lib/utils"

const colors: Record<number, string> = { 2: "#ffe9cf", 4: "#ffdbae", 8: "#ffc58f", 16: "#ffac82", 32: "#fa987b", 64: "#f48171", 128: "#e9c36a", 256: "#d9ba68", 512: "#9acfaa", 1024: "#79bfc7", 2048: "#a5a5e8" }
export function Tile({ value, position, hidden, arriving, ghost, highlighted }: { value: number; position: number; hidden?: boolean; arriving?: boolean; ghost?: boolean; highlighted?: boolean }) {
  return <div aria-hidden={ghost || undefined} className={cn("game-tile absolute flex items-center justify-center rounded-lg font-numerals font-extrabold leading-none tabular-nums text-[#493a30] shadow-[inset_0_-3px_0_#67472a0c]", value < 100 ? "text-[clamp(1.5rem,8vw,2.5rem)]" : value < 1000 ? "text-[clamp(1.3rem,6vw,2rem)]" : "text-lg", hidden && "opacity-0", arriving && "tile-arriving", ghost && "z-10", highlighted && "ring-2 ring-[#ad5234] ring-offset-2 ring-offset-white")} style={{ backgroundColor: colors[value] ?? "#a5a5e8", "--x": position % 4, "--y": Math.floor(position / 4) } as CSSProperties}>{value}</div>
}
