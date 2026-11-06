import { Card, CardContent } from "@/components/ui/card"

export function ScorePanel({ score, moves, best }: { score: number; moves: number; best: number }) {
  return <div className="my-5 grid grid-cols-3 gap-2.5">{[["本局得分", score], ["已走步数", moves], ["通关最高分", best || "—"]].map(([label, value]) => <Card key={label} className="gap-0 rounded-2xl border-border/70 bg-white/75 py-0 shadow-none"><CardContent className="px-2 py-3 text-center"><p className="text-[11px] text-muted-foreground">{label}</p><p className="mt-1 text-xl font-bold tabular-nums">{value}</p></CardContent></Card>)}</div>
}
