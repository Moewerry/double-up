import type { Direction } from "./types"

interface LevelDesign {
  readonly title: string
  readonly target: number
  readonly tip: string
  /** # 墙，. 空地，F 一次性地板，K8 数字锁门，G 终点，其余数字为初始方块。 */
  readonly board: readonly [string, string, string, string]
  readonly goal?: "merge" | "doors"
  readonly fragile?: readonly number[]
  readonly solution: readonly Direction[]
  readonly hintDirection?: Direction
}

export const levelDesigns: readonly LevelDesign[] = [
  {
    title: "碰一下", target: 4, tip: "向左滑，让两个 2 碰在一起。", hintDirection: "left",
    board: [". . . .", ". 2 2 .", ". . . .", ". . . ."], solution: ["left"],
  },
  {
    title: "换个方向", target: 8, tip: "上下滑动也能合并相同数字。", hintDirection: "down",
    board: [". 4 . .", ". 4 . .", ". . . .", ". . . ."], solution: ["down"],
  },
  {
    title: "一起动", target: 8, tip: "先合出两个 4，再让它们相遇。",
    board: ["2 2 . .", ". . . .", "2 2 . .", ". . . ."], solution: ["left", "down"],
  },
  {
    title: "隔空相遇", target: 4, tip: "隔着空格，相同数字也能碰在一起。",
    board: [". . . .", "2 . . 2", ". . . .", ". . . ."], solution: ["right"],
  },
  {
    title: "再来一次", target: 8, tip: "每块一次只合并一次，试着再滑一下。",
    board: [". . . .", "2 2 4 .", ". . . .", ". . . ."], solution: ["left", "left"],
  },
  {
    title: "小小路障", target: 4, tip: "墙会挡住数字，沿着空地滑动试试。",
    board: ["# # # #", "2 . 2 #", "# # # #", "# # # #"], solution: ["right"],
  },
  {
    title: "靠墙停好", target: 4, tip: "借助下面的通道，让两个 2 对齐。",
    board: ["2 # . .", ". # . .", ". . 2 .", "# # # #"], solution: ["down", "left"],
  },
  {
    title: "绕个弯", target: 4, tip: "右边留着一条通路。",
    board: ["2 . . .", "# # # .", "2 . . .", "# # # #"], solution: ["right", "down"],
  },
  {
    title: "两边会合", target: 4, tip: "让两边的数字走进同一条通道。",
    board: ["2 # # 2", ". # # .", ". . . .", "# # # #"], solution: ["down", "left"],
  },
  {
    title: "一滑成双", target: 8, tip: "一次滑动，两边一起完成合并。",
    board: ["2 . 2 .", "# # # #", "4 . 4 .", "# # # #"], solution: ["left"],
  },
  {
    title: "送到这里", target: 4, tip: "把 4 送进旗子所在的格子。",
    board: ["# # # #", "4 . . G", "# # # #", "# # # #"], solution: ["right"],
  },
  {
    title: "合好送达", target: 4, tip: "先合成 4，再把它送到终点。",
    board: ["2 # # #", "2 . . G", "# # # #", "# # # #"], solution: ["down", "right"],
  },
  {
    title: "在这里合", target: 4, tip: "让合并后的 4 直接落在终点。",
    board: ["# # # #", "2 . 2 G", "# # # #", "# # # #"], solution: ["right"],
  },
  {
    title: "先往外走", target: 8, tip: "先走右侧通道，再把 8 送回来。",
    board: ["4 . . .", ". . . .", "# # # .", "G . . 4"], solution: ["right", "down", "left"],
  },
  {
    title: "顺路送达", target: 8, tip: "沿着通道，合好再送过去。",
    board: ["2 2 4 .", "# # # .", "G . . .", "# # # #"], solution: ["right", "right", "down", "left"],
  },
  {
    title: "合出钥匙", target: 8, tip: "合出 8 后，再向锁门滑动一次。", goal: "doors",
    board: ["# # # #", "4 4 K8 #", "# # # #", "# # # #"], solution: ["right", "right"],
  },
  {
    title: "门后有终点", target: 4, tip: "8 用来开门，4 用来抵达终点。",
    board: ["# # # #", "8 K8 . G", "4 # # #", "# # # #"], solution: ["right", "up", "right"],
  },
  {
    title: "分头准备", target: 4, tip: "上面合出钥匙，下面合出要送的数字。",
    board: ["# # # #", "4 4 K8 G", "2 2 # #", "# # # #"], solution: ["right", "right", "up", "right"],
  },
  {
    title: "留好通路", target: 4, tip: "先把 4 留在右上方，开门后再送下来。",
    board: ["2 . . 2", "4 4 K8 G", "# # # #", "# # # #"], solution: ["right", "right", "down"],
  },
  {
    title: "接连开门", target: 4, tip: "每个 4 打开一扇门。", goal: "doors",
    board: ["4 K4 # #", "# 4 # #", "# K4 # #", "# # # #"], solution: ["right", "down"],
  },
  {
    title: "脆弱地板", target: 4, tip: "裂纹地板在数字经过并离开后坍塌。",
    board: ["# # # #", "4 F . G", "# # # #", "# # # #"], solution: ["right"],
  },
  {
    title: "最后再过", target: 4, tip: "先在左边合好，再经过裂纹地板。",
    board: ["2 # # #", "2 F . G", "# # # #", "# # # #"], solution: ["down", "right"],
  },
  {
    title: "谁先过去", target: 4, tip: "两个 2 先会合，再一起通过。",
    board: ["2 . # #", ". 2 F G", "# # # #", "# # # #"], solution: ["down", "right"],
  },
  {
    title: "先准备钥匙", target: 4, tip: "先合出 8 开门，再让右下方的 4 出发。",
    board: ["4 # # #", "4 F K8 G", "# # # 4", "# # # #"], solution: ["down", "right", "up"],
  },
  {
    title: "一路到底", target: 8, tip: "合好 8，沿着裂纹通道一路送达。",
    board: ["2 2 4 .", "# # # F", "G . . F", "# # # #"], solution: ["right", "right", "down", "left"],
  },
  {
    title: "两条路", target: 4, tip: "左右都能绕行，先想好在哪里会合。",
    board: ["2 . . 2", "F # # .", ". . . G", "# # # #"], solution: ["right", "down"],
  },
  {
    title: "借墙对齐", target: 4, tip: "先借墙对齐，再经过中间的裂纹地板。",
    board: ["2 # . 2", ". # . .", ". F . G", "# # # #"], solution: ["down", "right"],
  },
  {
    title: "开门留位置", target: 8, tip: "先开门，给上面的两个 4 留出会合位置。",
    board: ["# 4 # 4", "8 K8 . G", "# # # #", "# # # #"], solution: ["right", "down", "right"],
  },
  {
    title: "最后一次合并", target: 8, tip: "两边各合出 4，再向左下方会合。",
    board: ["2 2 # #", ". # # .", ". F 2 2", "G # # #"], solution: ["left", "down"],
  },
  {
    title: "连起来了", target: 8, tip: "合出钥匙，打开通路，再把另一个 8 送到终点。", fragile: [9],
    board: ["# # # #", "4 4 K8 G", "4 4 # #", "# # # #"], solution: ["right", "right", "up", "right"],
  },
]
