import fs from "fs"
import path from "path"
import { fileURLToPath } from "url"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const SOURCES_PATH = path.resolve(__dirname, "../data/sources.json")
const BACKUP_PATH = path.resolve(__dirname, "../data/sources.backup.json")

interface OldSource {
  id: string
  url: string
  priority: number
  maxUsers?: number
  region?: string
}

interface OldFormat {
  [channelId: string]: OldSource[]
}

function extractProvider(url: string): string {
  try {
    return new URL(url).hostname.split(".")[0]
  } catch {
    return "unknown"
  }
}

function migrateSource(channelId: string, sources: OldSource[]) {
  return {
    meta: {
      name: channelId.replace(/_/g, " ").toUpperCase(),
      type: "live",
      plans: ["FREE", "BASIC", "PREMIUM"]
    },
    sources: sources.map((s, i) => ({
      id: s.id || `${channelId}-src-${i + 1}`,
      url: s.url,
      priority: s.priority ?? i + 1,
      healthy: true,
      load: 0,
      provider: extractProvider(s.url)
    }))
  }
}

async function migrate() {
  if (!fs.existsSync(SOURCES_PATH)) {
    console.error("❌ SOURCES_PATH not found at:", SOURCES_PATH)
    return
  }

  // Backup
  const raw = fs.readFileSync(SOURCES_PATH, "utf-8")
  fs.writeFileSync(BACKUP_PATH, raw)
  console.log("✅ Backup created:", BACKUP_PATH)

  const old: OldFormat = JSON.parse(raw)
  const migrated: Record<string, unknown> = {}

  for (const [channelId, sources] of Object.entries(old)) {
    const sourcesArray = Array.isArray(sources) ? sources : [sources]
    migrated[channelId] = migrateSource(channelId, sourcesArray)
    console.log(`✅ Migrated: ${channelId} (${sourcesArray.length} source(s))`)
  }

  fs.writeFileSync(SOURCES_PATH, JSON.stringify(migrated, null, 2))
  console.log("\n✅ Migration complete in server/data/sources.json")
}

migrate().catch(console.error)
