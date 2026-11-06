import type { ReactNode } from "react"

interface Props {
  header: ReactNode
  summary: ReactNode
  actions?: ReactNode
  children: ReactNode
  summaryLabel?: string
  boardLabel?: string
  actionsLabel?: string
}

export function GameLayout({ header, summary, actions, children, summaryLabel = "本局成绩", boardLabel = "游戏棋盘", actionsLabel = "游戏结果" }: Props) {
  // 上下轨道等高，桌面左右轨道等宽；棋盘独占中央区域。
  return <div className="mx-auto grid w-full flex-1 grid-cols-1 grid-rows-[minmax(max-content,1fr)_auto_minmax(max-content,1fr)] gap-y-4 pt-[max(0px,calc(var(--page-inset-bottom)_-_var(--page-inset-top)))] pb-[max(0px,calc(var(--page-inset-top)_-_var(--page-inset-bottom)))] lg:grid-cols-[minmax(0,1fr)_minmax(0,480px)_minmax(0,1fr)] lg:gap-x-6">
    <div className="col-start-1 row-start-1 min-w-0 self-start lg:col-span-3">{header}</div>
    <section aria-label={boardLabel} className="col-start-1 row-start-2 mx-auto w-full min-w-0 max-w-[420px] lg:col-start-2 lg:max-w-[480px]">{children}</section>
    <div className="contents lg:col-start-3 lg:row-start-2 lg:flex lg:min-w-0 lg:flex-col lg:justify-center lg:gap-6">
      <section aria-label={summaryLabel} className="col-start-1 row-start-1 mx-auto w-full min-w-0 max-w-[420px] self-end pt-14 lg:max-w-none lg:self-auto lg:pt-0">{summary}</section>
      {actions != null && <section aria-label={actionsLabel} className="col-start-1 row-start-3 mx-auto w-full min-w-0 max-w-[420px] self-start lg:max-w-none lg:self-auto">{actions}</section>}
    </div>
  </div>
}
