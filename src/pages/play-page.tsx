import { useSearchParams } from "react-router-dom"
import { useBackgroundMusic } from "@/hooks/use-background-music"
import { GamePage } from "./game-page"
import { TutorialPage } from "./tutorial-page"

export function PlayPage() {
  const [params] = useSearchParams()
  useBackgroundMusic()
  return params.get("mode") === "tutorial" ? <TutorialPage /> : <GamePage />
}
