import { useSyncExternalStore } from "react"

const query = "(prefers-reduced-motion: reduce) and (not (any-pointer: coarse))"
function subscribe(listener: () => void) {
  const media = window.matchMedia(query)
  media.addEventListener("change", listener)
  return () => media.removeEventListener("change", listener)
}

export function useReducedMotion() {
  return useSyncExternalStore(subscribe, () => window.matchMedia(query).matches, () => true)
}
