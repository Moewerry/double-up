import type { CSSProperties } from "react"
import { cn } from "@/lib/utils"

const colors: Record<number, { background: string; foreground: string }> = {
  2: { background: "var(--tile-2)", foreground: "var(--tile-ink-green)" },
  4: { background: "var(--tile-4)", foreground: "var(--tile-ink-green)" },
  8: { background: "var(--tile-8)", foreground: "var(--tile-ink-warm)" },
  16: { background: "var(--tile-16)", foreground: "var(--tile-ink-coral)" },
  32: { background: "var(--tile-32)", foreground: "var(--tile-ink-coral)" },
  64: { background: "var(--tile-64)", foreground: "var(--tile-ink-deep)" },
  128: { background: "var(--tile-128)", foreground: "var(--tile-ink-warm)" },
  256: { background: "var(--tile-256)", foreground: "var(--tile-ink-green)" },
  512: { background: "var(--tile-512)", foreground: "var(--tile-ink-green)" },
  1024: { background: "var(--tile-1024)", foreground: "var(--tile-ink-green)" },
  2048: { background: "var(--tile-2048)", foreground: "var(--tile-ink-green)" },
}
export function Tile({ value, position, hidden, arriving, ghost, highlighted }: { value: number; position: number; hidden?: boolean; arriving?: boolean; ghost?: boolean; highlighted?: boolean }) {
  const color = colors[value] ?? colors[2048]
  return <div aria-hidden={ghost || undefined} className={cn("game-tile absolute flex items-center justify-center rounded-xl font-numerals font-extrabold leading-none tabular-nums shadow-[var(--tile-shadow)]", value < 100 ? "text-[clamp(1.5rem,8vw,2.5rem)]" : value < 1000 ? "text-[clamp(1.3rem,6vw,2rem)]" : "text-lg", hidden && "opacity-0", arriving && "tile-arriving", ghost && "z-10", highlighted && "ring-2 ring-coral ring-offset-2 ring-offset-card")} style={{ backgroundColor: color.background, color: color.foreground, "--x": position % 4, "--y": Math.floor(position / 4) } as CSSProperties}>{value}</div>
}
