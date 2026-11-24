import { AccentMarks } from "./accent-marks"

const previewTiles: Record<number, number> = { 1: 2, 7: 4, 8: 8, 10: 16 }

export function GamePreview() {
  return <div aria-hidden className="home-board-art">
    <span className="home-board-shape home-board-shape--sage" />
    <span className="home-board-shape home-board-shape--peach" />
    <span className="home-board-shape home-board-shape--cream" />
    <div className="home-preview-board">
      {Array.from({ length: 16 }, (_, position) => <div key={position} className="home-preview-cell" data-value={previewTiles[position]}>{previewTiles[position]}</div>)}
    </div>
    <AccentMarks className="home-accent--board-top" />
    <AccentMarks className="home-accent--board-left" />
    <AccentMarks className="home-accent--board-merge" />
  </div>
}
