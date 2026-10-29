import { describe, expect, it } from 'vitest'
import {
  PRESETS,
  chord,
  emptyBoard,
  flaggedCount,
  isWin,
  placeMines,
  remainingMines,
  reveal,
  toggleFlag,
} from './engine'

function seqRng(values: number[]): () => number {
  let i = 0
  return () => {
    const v = values[i] ?? 0
    i += 1
    return v
  }
}

describe('first click is safe', () => {
  it('never places a mine on the first cell or its neighbors', () => {
    const { rows, cols, mines } = PRESETS.beginner
    const empty = emptyBoard(rows, cols)
    const board = placeMines(empty, mines, 4, 4, seqRng(Array.from({ length: 80 }, () => 0)))
    expect(board[4][4].mine).toBe(false)
    expect(board[3][3].mine).toBe(false)
    expect(board.flat().filter((c) => c.mine)).toHaveLength(mines)
    const opened = reveal(board, 4, 4)
    expect(opened.hitMine).toBe(false)
    expect(opened.board[4][4].revealed).toBe(true)
  })
})

describe('flags', () => {
  it('counts remaining mines after a flag', () => {
    let board = emptyBoard(2, 2)
    board[0][0].mine = true
    board = toggleFlag(board, 0, 0)
    expect(flaggedCount(board)).toBe(1)
    expect(remainingMines(board, 1)).toBe(0)
    board = toggleFlag(board, 0, 0)
    expect(flaggedCount(board)).toBe(0)
  })
})

describe('win', () => {
  it('wins when every non-mine cell is revealed', () => {
    const board = emptyBoard(2, 2)
    board[0][0].mine = true
    board[0][1].revealed = true
    board[1][0].revealed = true
    board[1][1].revealed = true
    expect(isWin(board)).toBe(true)
  })
})

describe('chord', () => {
  it('opens unflagged neighbors when flag count matches', () => {
    const board = emptyBoard(3, 3)
    board[0][0].mine = true
    board[1][1].adjacent = 1
    board[1][1].revealed = true
    const flagged = toggleFlag(board, 0, 0)
    const opened = chord(flagged, 1, 1)
    expect(opened.hitMine).toBe(false)
    expect(opened.board[0][1].revealed).toBe(true)
    expect(opened.board[1][0].revealed).toBe(true)
    expect(opened.board[0][0].revealed).toBe(false)
  })
})
