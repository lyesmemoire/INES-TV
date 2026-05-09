/**
 * 🔧 Slug Utilities for Match Entities
 * Generates SEO-friendly slugs from match data.
 */

/**
 * Generate a unique slug for a match.
 * Format: "homeTeam-vs-awayTeam-competition-YYYY-MM-DD"
 * Example: "psg-vs-marseille-ligue1-2026-05-05"
 */
export function generateMatchSlug(
  homeTeam: string,
  awayTeam: string,
  competition: string,
  startTime: Date
): string {
  const normalize = (str: string) =>
    str
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "") // Remove diacritics
      .replace(/[^a-z0-9]+/g, "-")     // Replace non-alphanumeric with dashes
      .replace(/^-+|-+$/g, "");        // Trim leading/trailing dashes

  const date = startTime.toISOString().split("T")[0]; // YYYY-MM-DD

  return `${normalize(homeTeam)}-vs-${normalize(awayTeam)}-${normalize(competition)}-${date}`;
}

/**
 * Generate a slug with deduplication suffix.
 * If the base slug already exists, appends -2, -3, etc.
 */
export async function generateUniqueSlug(
  homeTeam: string,
  awayTeam: string,
  competition: string,
  startTime: Date,
  existingSlugs: string[]
): Promise<string> {
  const baseSlug = generateMatchSlug(homeTeam, awayTeam, competition, startTime);

  if (!existingSlugs.includes(baseSlug)) {
    return baseSlug;
  }

  let suffix = 2;
  while (existingSlugs.includes(`${baseSlug}-${suffix}`)) {
    suffix++;
  }

  return `${baseSlug}-${suffix}`;
}
