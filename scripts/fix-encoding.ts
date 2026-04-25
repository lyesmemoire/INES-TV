import fs from "fs"
import path from "path"
import { glob } from "glob"
import iconv from "iconv-lite"

const ROOT = process.cwd()

// Extensions à traiter (safe uniquement)
const TEXT_EXTENSIONS = [
  ".ts",
  ".tsx",
  ".js",
  ".jsx",
  ".json",
  ".md",
  ".env",
  ".yml",
  ".yaml",
  ".html",
  ".css",
]

// Dossiers à ignorer
const IGNORE = ["node_modules", ".next", ".git", "dist", "build"]

function isTextFile(file: string) {
  return TEXT_EXTENSIONS.includes(path.extname(file))
}

function shouldIgnore(file: string) {
  return IGNORE.some((dir) => file.includes(dir))
}

function isValidUTF8(buffer: Buffer): boolean {
  try {
    const str = buffer.toString("utf8")
    // Check if re-encoding it as UTF-8 gives the same buffer
    return Buffer.from(str, "utf8").equals(buffer)
  } catch {
    return false
  }
}

function fixFile(file: string) {
  const buffer = fs.readFileSync(file)

  if (isValidUTF8(buffer)) {
    return false // déjà OK
  }

  // tentative conversion Windows-1252 → UTF-8
  try {
    const decoded = iconv.decode(buffer, "win1252")
    const reencoded = iconv.encode(decoded, "utf8")

    fs.writeFileSync(file, reencoded)

    console.log(`🔧 FIXED: ${file}`)
    return true
  } catch (err) {
    console.log(`❌ FAILED: ${file}`)
    return false
  }
}

async function run() {
  console.log("🚀 Scanning repo for encoding issues...\n")

  const files = glob.sync("**/*", {
    cwd: ROOT,
    nodir: true,
  })

  let scanned = 0
  let fixed = 0

  for (const file of files) {
    if (shouldIgnore(file)) continue
    if (!isTextFile(file)) continue

    scanned++

    const fullPath = path.join(ROOT, file)

    const wasFixed = fixFile(fullPath)
    if (wasFixed) fixed++
  }

  console.log("\n==============================")
  console.log("📊 ENCODING REPORT")
  console.log("==============================")
  console.log("Files scanned:", scanned)
  console.log("Files fixed:", fixed)
  console.log("==============================")

  if (fixed === 0) {
    console.log("🟢 All files already UTF-8 clean")
  } else {
    console.log("✅ Encoding issues fixed")
  }
}

run()
