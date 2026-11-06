import { createSession, move } from "./engine"
import { getLevel } from "./levels"
import type { Direction, Motion, Session } from "./types"

interface PracticeTile { readonly value: number; readonly position: number }
export interface TutorialStep {
  readonly id: string
  readonly prompt: string
  readonly success: string
  readonly kind: "move" | "merge" | "single-merge" | "free"
  readonly direction?: Direction
  readonly tiles?: readonly PracticeTile[]
  readonly highlight: readonly number[]
  readonly carry?: boolean
}

export const tutorialSteps: readonly TutorialStep[] = [
  { id: "slide", prompt: "往左滑", success: "新数字出现了", kind: "move", direction: "left", tiles: [{ value: 2, position: 3 }, { value: 2, position: 11 }], highlight: [3, 11] },
  { id: "merge", prompt: "让 2 碰在一起", success: "2 + 2 = 4", kind: "merge", direction: "left", tiles: [{ value: 2, position: 4 }, { value: 2, position: 7 }], highlight: [4, 7] },
  { id: "up", prompt: "试试向上", success: "2 + 2 = 4", kind: "merge", direction: "up", tiles: [{ value: 2, position: 0 }, { value: 2, position: 12 }], highlight: [0, 12] },
  { id: "right", prompt: "向右合并", success: "4 + 4 = 8", kind: "merge", direction: "right", tiles: [{ value: 4, position: 4 }, { value: 4, position: 7 }], highlight: [4, 7] },
  { id: "down", prompt: "再向下", success: "4 + 4 = 8", kind: "merge", direction: "down", tiles: [{ value: 4, position: 1 }, { value: 4, position: 13 }], highlight: [1, 13] },
  { id: "once", prompt: "每块只合一次", success: "先变成 4 + 4", kind: "single-merge", direction: "left", tiles: [{ value: 2, position: 0 }, { value: 2, position: 1 }, { value: 4, position: 2 }], highlight: [0, 1, 2] },
  { id: "again", prompt: "再滑一次", success: "这次变成 8", kind: "merge", direction: "left", carry: true, highlight: [0, 1] },
  { id: "practice", prompt: "自己合出 16", success: "学会了！", kind: "free", highlight: [] },
]

export interface TutorialState {
  step: number
  session: Session
  checkpoint: Session
  phase: "playing" | "passed" | "lost"
  feedback: "" | "direction" | "blocked"
  hint: number
  motions: Motion[]
  gained: number
  revision: number
}

function practiceSession(step: TutorialStep): Session {
  if (step.kind === "free") return createSession(1)
  const initial = createSession(1, getLevel(1).seed)
  if (!step.tiles) return initial
  return { ...initial, tiles: step.tiles.map((tile, index) => ({ ...tile, id: index + 1 })), nextId: step.tiles.length + 1 }
}

function enterStep(step: number, previous?: Session, revision = 0): TutorialState {
  const lesson = tutorialSteps[step]
  if (!lesson) throw new Error("教程步骤不存在。")
  const session = lesson.carry && previous ? previous : practiceSession(lesson)
  return { step, session, checkpoint: session, phase: "playing", feedback: "", hint: 0, motions: [], gained: 0, revision }
}

export function createTutorial(revision = 0): TutorialState { return enterStep(0, undefined, revision) }
export function tutorialComplete(state: TutorialState) { return state.step === tutorialSteps.length - 1 && state.phase === "passed" }

export function moveTutorial(state: TutorialState, direction: Direction): TutorialState {
  if (state.phase !== "playing") return state
  const lesson = tutorialSteps[state.step]
  if (lesson.direction && direction !== lesson.direction) return { ...state, feedback: "direction", hint: state.hint + 1 }
  const result = move(state.session, direction)
  if (result.session === state.session) return { ...state, feedback: "blocked", hint: state.hint + 1 }
  const passed = lesson.kind === "free" ? result.session.status === "won"
    : lesson.kind === "move" ? true
    : lesson.kind === "single-merge" ? result.gained === 4 && [0, 1].every(position => result.session.tiles.some(tile => tile.position === position && tile.value === 4))
    : result.gained > 0
  return { ...state, session: result.session, phase: passed ? "passed" : result.session.status === "lost" ? "lost" : "playing", feedback: "", motions: result.motions, gained: result.gained, revision: state.revision + 1 }
}

export function nextTutorialStep(state: TutorialState): TutorialState {
  if (state.phase !== "passed" || tutorialComplete(state)) return state
  return enterStep(state.step + 1, state.session, state.revision + 1)
}

export function resetTutorialStep(state: TutorialState): TutorialState {
  const checkpoint = tutorialSteps[state.step].kind === "free" ? createSession(1) : state.checkpoint
  return { ...state, session: checkpoint, checkpoint, phase: "playing", feedback: "", hint: 0, motions: [], gained: 0, revision: state.revision + 1 }
}
