import { Check, Sparkles } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { tutorialComplete, tutorialSteps } from "@/game/tutorial"
import type { TutorialState } from "@/game/tutorial"
import { cn } from "@/lib/utils"

export function TutorialPanel({ state }: { state: TutorialState }) {
  const lesson = tutorialSteps[state.step]
  const passed = state.phase === "passed"
  const completed = state.step + (passed ? 1 : 0)
  const title = passed ? lesson.success : state.phase === "lost" ? "再试一次" : lesson.prompt
  const feedback = state.feedback === "direction" ? "跟着箭头试试" : state.feedback === "blocked" ? "换个方向试试" : ""
  const Icon = tutorialComplete(state) ? Sparkles : Check
  return <div>
    <div className="flex items-center justify-between gap-3 text-xs text-muted-foreground"><span>新手教程</span><span className="tabular-nums">{state.step + 1} / {tutorialSteps.length}</span></div>
    <Progress className="mt-2 h-1.5" value={completed / tutorialSteps.length * 100} aria-label="教程进度" aria-valuetext={`已完成 ${completed} 个练习，共 ${tutorialSteps.length} 个`} />
    <div className="mt-3 text-center lg:mt-8 lg:text-left" role="status" aria-live="polite" aria-atomic="true">
      <h2 className={cn("flex min-h-9 items-center justify-center gap-2 text-2xl font-extrabold tracking-tight lg:justify-start lg:text-3xl", passed && "text-[#3d7951]")}>{passed && <Icon className="size-6 shrink-0" aria-hidden />}{title}</h2>
      <p key={`${state.step}-${state.hint}`} className="mt-1 min-h-4 text-xs text-[#a95233]">{feedback || <span aria-hidden>&nbsp;</span>}</p>
    </div>
    <Card className="mt-2 gap-0 rounded-2xl border-border/70 bg-white/75 py-0 shadow-none lg:mt-6">
      <CardContent className="px-3 py-2 lg:py-3"><dl className="grid grid-cols-2 divide-x divide-border/70 text-center">
        {([["得分", state.session.score], ["步数", state.session.moves]] as const).map(([label, value]) => <div key={label} className="flex items-center justify-center gap-3 lg:flex-col lg:gap-1"><dt className="text-[11px] text-muted-foreground">{label}</dt><dd className="text-xl font-bold tabular-nums">{value}</dd></div>)}
      </dl></CardContent>
    </Card>
  </div>
}
