import { Progress } from "@/components/ui/progress"

export function TargetProgress({ maximum, target }: { maximum: number; target: number }) {
  const doubles = Math.max(0, Math.ceil(Math.log2(target / maximum)))
  return <div className="mx-auto mt-4 max-w-[260px]">
    <div className="mb-2 flex items-center justify-between text-[11px] text-muted-foreground">
      <span>当前最大 <strong className="font-semibold text-foreground">{maximum}</strong></span>
      <span>{doubles ? `距离目标 ${doubles} 次翻倍` : "目标达成！"}</span>
    </div>
    <Progress value={Math.min(100, maximum / target * 100)} className="h-1.5" aria-label={`最大方块 ${maximum}，目标 ${target}`} />
  </div>
}
