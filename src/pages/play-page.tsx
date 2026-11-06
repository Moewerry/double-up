import { useSearchParams } from "react-router-dom"
import { GamePage } from "./game-page"
import { TutorialPage } from "./tutorial-page"

export function PlayPage() {
  const [params] = useSearchParams()
  return params.get("mode") === "tutorial" ? <TutorialPage /> : <GamePage />
}
