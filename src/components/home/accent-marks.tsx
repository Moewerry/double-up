import { cn } from "@/lib/utils"

export function AccentMarks({ className }: { className?: string }) {
  return <span aria-hidden className={cn("home-accent home-motion:animate-home-accent-spark home-motion:opacity-75", className)}>
    <i /><i /><i />
  </span>
}
