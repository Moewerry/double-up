import { describe, expect, it } from "vitest"
import { createSession } from "./engine"
import { createTutorial, moveTutorial, nextTutorialStep, resetTutorialStep, tutorialComplete, tutorialSteps } from "./tutorial"

function completeGuidedSteps() {
  let state = createTutorial()
  while (tutorialSteps[state.step].direction) {
    state = moveTutorial(state, tutorialSteps[state.step].direction!)
    expect(state.phase).toBe("passed")
    state = nextTutorialStep(state)
  }
  return state
}

describe("交互教程", () => {
  it("没有完成练习不能跳步，错误方向不消耗步数和随机流", () => {
    const initial = createTutorial()
    expect(nextTutorialStep(initial)).toBe(initial)
    const wrong = moveTutorial(initial, "right")
    expect(wrong.session).toBe(initial.session)
    expect(wrong.phase).toBe("playing")
    expect(wrong.feedback).toBe("direction")
    expect(wrong.hint).toBe(1)
  })

  it("前七步必须真实移动或合并，最后进入正式第一关初始局面", () => {
    const state = completeGuidedSteps()
    expect(state.step).toBe(7)
    expect(state.session).toEqual(createSession(1))
    expect(tutorialComplete(state)).toBe(false)
  })

  it("已完成的练习不接受额外操作", () => {
    const passed = moveTutorial(createTutorial(), "left")
    expect(passed.phase).toBe("passed")
    expect(moveTutorial(passed, "left")).toBe(passed)
  })

  it("只合并一次的局面带入下一步，再滑一次才得到 8", () => {
    let state = createTutorial()
    for (let index = 0; index < 5; index++) state = nextTutorialStep(moveTutorial(state, tutorialSteps[state.step].direction!))
    const once = moveTutorial(state, "left")
    expect(once.gained).toBe(4)
    expect([0, 1].every(position => once.session.tiles.some(tile => tile.position === position && tile.value === 4))).toBe(true)
    const again = nextTutorialStep(once)
    expect(again.session).toBe(once.session)
    const doubled = moveTutorial(again, "left")
    expect(doubled.phase).toBe("passed")
    expect(doubled.session.tiles.some(tile => tile.value === 8)).toBe(true)
    const reset = resetTutorialStep(doubled)
    expect(reset.session).toBe(again.checkpoint)
    expect(reset.phase).toBe("playing")
  })

  it("自由练习只有真正达成本关目标才算完成", () => {
    const state = completeGuidedSteps()
    const session = { ...state.session, tiles: [{ id: 1, value: 8, position: 0 }, { id: 2, value: 8, position: 1 }], nextId: 3 }
    const won = moveTutorial({ ...state, session, checkpoint: session }, "left")
    expect(won.session.status).toBe("won")
    expect(tutorialComplete(won)).toBe(true)
    expect(nextTutorialStep(won)).toBe(won)
  })
})
