export type Difficulty = 'beginner' | 'intermediate' | 'expert'

export const PRESETS: Record<Difficulty, { rows: number; cols: number; mines: number }> = {
  beginner: { rows: 9, cols: 9, mines: 10 },
  intermediate: { rows: 16, cols: 16, mines: 40 },
  expert: { rows: 16, cols: 30, mines: 99 },
}

export type Cell = {
  mine: boolean
  revealed: boolean
  flagged: boolean
  adjacent: number
}

export type Board = Cell[][]

export type GameStatus = 'ready' | 'playing' | 'won' | 'lost'

export function emptyBoard(rows: number, cols: number): Board {
  return Array.from({ length: rows }, () =>
    Array.from({ length: cols }, () => ({
      mine: false,
      revealed: false,
      flagged: false,
      adjacent: 0,
    })),
  )
}

export function neighbors(rows: number, cols: number, r: number, c: number): Array<[number, number]> {
  const out: Array<[number, number]> = []
  for (let dr = -1; dr <= 1; dr++) {
    for (let dc = -1; dc <= 1; dc++) {
      if (dr === 0 && dc === 0) continue
      const nr = r + dr
      const nc = c + dc
      if (nr >= 0 && nr < rows && nc >= 0 && nc < cols) out.push([nr, nc])
    }
  }
  return out
}

export function cloneBoard(board: Board): Board {
  return board.map((row) => row.map((cell) => ({ ...cell })))
}

export function placeMines(
  board: Board,
  mines: number,
  safeR: number,
  safeC: number,
  rng: () => number = Math.random,
): Board {
  const next = cloneBoard(board)
  const rows = next.length
  const cols = next[0].length
  const forbidden = new Set<string>([`${safeR},${safeC}`])
  for (const [nr, nc] of neighbors(rows, cols, safeR, safeC)) {
    forbidden.add(`${nr},${nc}`)
  }

  const slots: Array<[number, number]> = []
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (!forbidden.has(`${r},${c}`)) slots.push([r, c])
    }
  }

  const count = Math.min(mines, slots.length)
  for (let i = 0; i < count; i++) {
    const pick = i + Math.floor(rng() * (slots.length - i))
    const tmp = slots[i]
    slots[i] = slots[pick]
    slots[pick] = tmp
    const [r, c] = slots[i]
    next[r][c].mine = true
  }

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (next[r][c].mine) {
        next[r][c].adjacent = 0
        continue
      }
      next[r][c].adjacent = neighbors(rows, cols, r, c).filter(([nr, nc]) => next[nr][nc].mine).length
    }
  }
  return next
}

export function flaggedCount(board: Board): number {
  return board.flat().filter((c) => c.flagged).length
}

export function remainingMines(board: Board, mines: number): number {
  return mines - flaggedCount(board)
}

export function isWin(board: Board): boolean {
  return board.flat().every((c) => c.mine || c.revealed)
}

export function reveal(board: Board, r: number, c: number): { board: Board; hitMine: boolean } {
  const next = cloneBoard(board)
  const cell = next[r][c]
  if (cell.revealed || cell.flagged) return { board: next, hitMine: false }
  if (cell.mine) {
    cell.revealed = true
    for (const other of next.flat()) {
      if (other.mine) other.revealed = true
    }
    return { board: next, hitMine: true }
  }

  const rows = next.length
  const cols = next[0].length
  const stack: Array<[number, number]> = [[r, c]]
  const seen = new Set<string>()
  while (stack.length) {
    const [cr, cc] = stack.pop()!
    const key = `${cr},${cc}`
    if (seen.has(key)) continue
    seen.add(key)
    const cur = next[cr][cc]
    if (cur.flagged || cur.mine) continue
    cur.revealed = true
    if (cur.adjacent === 0) {
      for (const n of neighbors(rows, cols, cr, cc)) stack.push(n)
    }
  }
  return { board: next, hitMine: false }
}

export function toggleFlag(board: Board, r: number, c: number): Board {
  const next = cloneBoard(board)
  const cell = next[r][c]
  if (cell.revealed) return next
  cell.flagged = !cell.flagged
  return next
}

export function chord(board: Board, r: number, c: number): { board: Board; hitMine: boolean } {
  const cell = board[r][c]
  if (!cell.revealed || cell.adjacent === 0) return { board: cloneBoard(board), hitMine: false }
  const rows = board.length
  const cols = board[0].length
  const around = neighbors(rows, cols, r, c)
  const flags = around.filter(([nr, nc]) => board[nr][nc].flagged).length
  if (flags !== cell.adjacent) return { board: cloneBoard(board), hitMine: false }

  let next = cloneBoard(board)
  let hit = false
  for (const [nr, nc] of around) {
    const n = next[nr][nc]
    if (n.flagged || n.revealed) continue
    const step = reveal(next, nr, nc)
    next = step.board
    if (step.hitMine) hit = true
  }
  return { board: next, hitMine: hit }
}
