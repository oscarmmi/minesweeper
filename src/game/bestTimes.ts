import type { Difficulty } from './engine'

const KEY = 'minesweeper-best-v1'

export type BestTimes = Record<Difficulty, number | null>

export function loadBest(): BestTimes {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return empty()
    const parsed = JSON.parse(raw) as Partial<BestTimes>
    return {
      beginner: num(parsed.beginner),
      intermediate: num(parsed.intermediate),
      expert: num(parsed.expert),
    }
  } catch {
    return empty()
  }
}

export function recordBest(difficulty: Difficulty, seconds: number): BestTimes {
  const best = loadBest()
  const prev = best[difficulty]
  if (prev === null || seconds < prev) best[difficulty] = seconds
  localStorage.setItem(KEY, JSON.stringify(best))
  return best
}

function num(value: unknown): number | null {
  return typeof value === 'number' && Number.isFinite(value) ? value : null
}

function empty(): BestTimes {
  return { beginner: null, intermediate: null, expert: null }
}
