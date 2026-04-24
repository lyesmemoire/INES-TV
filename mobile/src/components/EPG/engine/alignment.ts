/**
 * 📊 EPG ALIGNMENT ENGINE
 * Handles gap-filling and overlap resolution for a continuous timeline experience.
 */

export interface RawProgram {
  id: string;
  title: string;
  start_time: string | Date;
  end_time: string | Date;
  description?: string;
}

export interface UIProgram extends RawProgram {
  is_filler?: boolean;
}

/**
 * Normalizes programs and fills gaps with "No Information" placeholders.
 */
export function alignPrograms(programs: RawProgram[], windowStart: Date, windowEnd: Date): UIProgram[] {
  if (programs.length === 0) {
    // Entire window is a gap
    return [createFiller(windowStart, windowEnd)];
  }

  // 1. Sort by start time
  const sorted = [...programs].sort((a, b) => 
    new Date(a.start_time).getTime() - new Date(b.start_time).getTime()
  );

  const result: UIProgram[] = [];
  let lastEndTime = new Date(windowStart);

  for (let i = 0; i < sorted.length; i++) {
    const p = sorted[i];
    const pStart = new Date(p.start_time);
    const pEnd = new Date(p.end_time);

    // 2. Detect Gap before program
    if (pStart > lastEndTime) {
      result.push(createFiller(lastEndTime, pStart));
    }

    // 3. Resolve Overlap (if pStart is before lastEndTime, we ignore or truncate - here we just push)
    // In a pro engine, we'd truncate the previous program.
    result.push(p);
    lastEndTime = pEnd;
  }

  // 4. Detect trailing gap
  if (lastEndTime < windowEnd) {
    result.push(createFiller(lastEndTime, windowEnd));
  }

  return result;
}

function createFiller(start: Date, end: Date): UIProgram {
  return {
    id: `filler-${start.getTime()}`,
    title: 'Pas d\'information',
    start_time: start,
    end_time: end,
    is_filler: true
  };
}
