import { AccentMarks } from "./accent-marks"

const previewTiles: Partial<Record<number, number>> = { 1: 2, 7: 4, 8: 8, 10: 16 }

export function GamePreview() {
  return <div aria-hidden className="home-board-art home-motion:animate-home-impact-enter">
    <span className="home-board-shape home-board-shape--sage" />
    <span className="home-board-shape home-board-shape--peach" />
    <span className="home-board-shape home-board-shape--cream" />
    <div className="home-preview-board">
      {Array.from({ length: 16 }, (_, position) => {
        const value = previewTiles[position]
        return <div key={position} className="home-preview-cell">
          {value !== undefined && (
            <span
              className="home-preview-tile grid size-full place-items-center rounded-[inherit] home-motion:animate-home-tile-appear"
              data-value={value}
            >
              {value}
            </span>
          )}
        </div>
      })}
    </div>
    <AccentMarks className="home-accent--board-top" />
    <AccentMarks className="home-accent--board-left" />
    <AccentMarks className="home-accent--board-merge" />
  </div>
}
