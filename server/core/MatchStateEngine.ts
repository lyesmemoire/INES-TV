/**
 * 📁 /server/core/MatchStateEngine.ts
 * Industrial-grade pressure calculation and engagement pricing.
 * Rules:
 * 1. Composite Pressure Index (Intensity/Time/Score)
 * 2. Data Confidence Factor
 * 3. Tier-based League Weighting
 */
export class MatchStateEngine {
  /**
   * 🧠 CALCULATE PRESSURE (0.0 - 1.0)
   */
  static calculatePressure(match: any): number {
    const minute = this.parseMinute(match.matchTime);
    const scoreDiff = this.calculateGoalDiff(match.score);
    const rawIntensity = match.intensity || 0.5;

    // 1. Time Pressure Factor
    const timeFactor = minute > 85 ? 0.8 : minute > 75 ? 0.5 : 0.2;

    // 2. Score Pressure Factor
    const scoreFactor = scoreDiff === 0 ? 0.6 : scoreDiff === 1 ? 0.9 : 0.2;

    // 3. Composite Calculation
    const rawIndex = (rawIntensity * 0.5) + (timeFactor * 0.3) + (scoreFactor * 0.2);

    // 4. Data Confidence Adjustment
    const confidence = match.matchTime ? 1.0 : 0.6;

    return Math.min(1.0, rawIndex * confidence);
  }

  /**
   * 🏆 TIER WEIGHT SYSTEM
   */
  static getTierWeight(league: string | null): number {
    const l = (league || "").toUpperCase();
    if (l.includes("CHAMPIONS LEAGUE")) return 1.4;
    if (l.includes("PREMIER LEAGUE")) return 1.25;
    return 1.0;
  }

  /**
   * ⏱️ TIME DECAY MULTIPLIER (AdX)
   */
  static getTimeBoost(match: any): number {
    const minute = this.parseMinute(match.matchTime);
    const scoreDiff = this.calculateGoalDiff(match.score);

    if (minute > 85 && scoreDiff <= 1) return 3.0;
    if (minute > 80) return 2.0;
    return 1.0;
  }

  // --- Helpers ---
  private static parseMinute(time: string | null): number {
    if (!time) return 0;
    const match = time.match(/(\d+)/);
    return match ? parseInt(match[0]) : 0;
  }

  private static calculateGoalDiff(score: string | null): number {
    if (!score || !score.includes("-")) return 0;
    const parts = score.split("-").map(p => parseInt(p.trim()));
    if (parts.length !== 2) return 0;
    return Math.abs(parts[0] - parts[1]);
  }
}
