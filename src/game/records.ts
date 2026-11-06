import type { LevelConfig } from "./level-types"
import type { Save } from "./types"

export function currentRecord(records: Save["records"], level: Pick<LevelConfig, "id" | "version">) {
  const record = records[String(level.id)]
  return record && (record.configVersion ?? 1) === level.version ? record : undefined
}
