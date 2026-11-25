import { AccentMarks } from "./accent-marks"
import { PreviewTiles } from "./preview-tiles"

export function GamePreview() {
  return <div aria-hidden className="home-board-art home-motion:animate-home-enter">
    <span className="home-board-shape home-board-shape--sage" />
    <span className="home-board-shape home-board-shape--peach" />
    <span className="home-board-shape home-board-shape--cream" />
    <div className="home-preview-board">
      <PreviewTiles />
    </div>
    <AccentMarks className="home-accent--board-top" />
    <AccentMarks className="home-accent--board-left" />
  </div>
}
