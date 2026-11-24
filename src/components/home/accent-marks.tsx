import { cn } from "@/lib/utils"

export function AccentMarks({ className }: { className?: string }) {
  return <span aria-hidden className={cn("home-accent", className)}><i /><i /><i /></span>
}
