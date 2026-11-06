import { ArrowRight, Check, MoveRight, Sprout } from "lucide-react"
import { Link } from "react-router-dom"
import { Brand } from "@/components/brand"
import { SettingsDialog } from "@/components/settings-dialog"
import { MergeIllustration } from "@/components/home/merge-illustration"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { levels, getLevel } from "@/game/levels"
import { useGameStore } from "@/stores/use-game-store"

export function HomePage() {
  const { data, blocked } = useGameStore()
  const { session, records } = data
  const completed = Object.keys(records).length
  const finished = completed === levels.length
  const label = session.status === "won" ? finished ? "查看通关纪念" : "继续向上闯关" : session.status === "lost" ? `查看第 ${session.level} 关结果` : session.moves > 0 ? `继续第 ${session.level} 关` : completed ? `挑战第 ${session.level} 关` : "开始闯关"
  return <>
    <header className="flex items-center justify-between"><Brand /><SettingsDialog /></header>
    <section className="pb-8 pt-9 text-center sm:pt-14">
      <p className="inline-flex items-center gap-2 rounded-full border border-[#e2d6bd] bg-[#f5f2e5] px-3 py-1.5 text-[11px] tracking-[.12em] text-[#736549]"><Sprout className="size-3.5" />小小数字，大大可能</p>
      <h1 className="mt-6 text-[clamp(2.1rem,9vw,3rem)] font-extrabold leading-[1.35] tracking-tight">一点点，<br />翻倍<span className="relative text-[#ad5234]">向前<span className="absolute -bottom-1 left-0 h-1 w-full -rotate-2 rounded-full bg-[#ffccad]" /></span>。</h1>
      <p className="mt-5 text-sm leading-7 text-muted-foreground">滑动，让相同的数字相遇。<br />从一个小小的 2，合出下一份惊喜。</p>
      <MergeIllustration />
      <Button className="h-14 w-full rounded-xl text-base font-bold shadow-[0_5px_0_#e58b65] transition-transform active:translate-y-1 active:shadow-none" disabled={blocked} asChild={!blocked}>
        {blocked ? <span>请先恢复存档</span> : <Link to="/play">{label}<ArrowRight className="ml-auto size-5" /></Link>}
      </Button>
      <p className="mt-4 text-xs text-muted-foreground">{session.status === "playing" ? `第 ${session.level} 关 · 合成 ${getLevel(session.level).target} · ${session.moves ? `已走 ${session.moves} 步` : "不限步数，慢慢来"}` : "每一步进度，都会自动保存"}</p>
    </section>
    <Card className="gap-0 border-border/80 bg-white/70 py-0 shadow-none"><CardContent className="p-5">
      <div className="flex items-center justify-between text-sm"><span className="font-semibold">你的翻倍旅程</span><span className="text-xs text-muted-foreground">{completed} / {levels.length} 关</span></div>
      <Progress className="my-4 h-1.5 [&_[data-slot=progress-indicator]]:bg-[#579478]" value={completed / levels.length * 100} aria-label={`已完成 ${completed} 关，共 ${levels.length} 关`} />
      <div className="flex items-center justify-between text-xs text-muted-foreground"><span className="flex items-center gap-1.5">{finished ? <Check className="size-3.5" /> : <MoveRight className="size-3.5" />}{finished ? "第一章完成，很棒的一段旅程" : "初识数字 · 一关一关向前"}</span><span className="text-[10px]">开发预览</span></div>
    </CardContent></Card>
    <footer className="pb-4 pt-8 text-center text-[11px] tracking-wide text-muted-foreground">无需登录 · 自动保存 · 随时回来</footer>
  </>
}
