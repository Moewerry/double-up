import { Card, CardContent } from "@/components/ui/card"

export function ScorePanel({ score, moves, best, gained, revision }: { score: number; moves: number; best: number; gained: number; revision: number }) {
  return <div className="my-5 grid grid-cols-3 gap-2.5 lg:mb-0">{[["本局得分", score], ["已走步数", moves], ["通关最高分", best || "—"]].map(([label, value], index) => <Card key={label} className="relative gap-0 rounded-2xl border-border/70 bg-white/75 py-0 shadow-none"><CardContent className="px-2 py-3 text-center"><p className="text-[11px] text-muted-foreground">{label}</p><p className="mt-1 text-xl font-bold tabular-nums">{value}</p>{index === 0 && gained > 0 && <span key={revision} aria-hidden className="score-gain absolute -top-2 right-2 rounded-full bg-[#fff0df] px-2 text-xs font-bold text-[#9b4429]">+{gained}</span>}</CardContent></Card>)}</div>
}
