export type Direction = "up" | "down" | "left" | "right"
export type Status = "playing" | "won" | "lost"
export interface Tile { id: number; value: number; position: number }
export interface Snapshot {
  tiles: Tile[]
  score: number
  moves: number
  random: number
  nextId: number
  status: Status
}
export interface Session extends Snapshot {
  level: number
  seed: number
  configVersion: number
  undoUsed: boolean
  previous: Snapshot | null
}
export interface RecordEntry { score: number; moves: number; configVersion?: number }
export interface ClearFeedback { firstClear: boolean; bestScore: boolean; fewestMoves: boolean }
export interface Save {
  version: 1
  rules: 1
  session: Session
  records: Record<string, RecordEntry>
  sound: boolean
  music: boolean
  directions: boolean
}
export interface Motion { tile: Tile; destination: number; merged: boolean }
