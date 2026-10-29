<script setup lang="ts">
import { computed, onUnmounted, ref } from 'vue'
import {
  PRESETS,
  chord,
  emptyBoard,
  isWin,
  placeMines,
  remainingMines,
  reveal,
  toggleFlag,
  type Board,
  type Difficulty,
  type GameStatus,
} from './game/engine'
import { loadBest, recordBest, type BestTimes } from './game/bestTimes'

const difficulty = ref<Difficulty>('beginner')
const board = ref<Board>(emptyBoard(9, 9))
const status = ref<GameStatus>('ready')
const seconds = ref(0)
const best = ref<BestTimes>(loadBest())
const pressTimer = ref<number | 0>(0)
const pressCell = ref<[number, number] | null>(null)

let clock: number | 0 = 0

const preset = computed(() => PRESETS[difficulty.value])
const minesLeft = computed(() => remainingMines(board.value, preset.value.mines))

function reset(next: Difficulty = difficulty.value) {
  stopClock()
  difficulty.value = next
  const { rows, cols } = PRESETS[next]
  board.value = emptyBoard(rows, cols)
  status.value = 'ready'
  seconds.value = 0
}

function startClock() {
  if (clock) return
  clock = window.setInterval(() => {
    seconds.value += 1
  }, 1000)
}

function stopClock() {
  if (clock) window.clearInterval(clock)
  clock = 0
}

function ensureMines(r: number, c: number) {
  if (status.value !== 'ready') return
  board.value = placeMines(board.value, preset.value.mines, r, c)
  status.value = 'playing'
  startClock()
}

function afterMove(hitMine: boolean) {
  if (hitMine) {
    status.value = 'lost'
    stopClock()
    return
  }
  if (isWin(board.value)) {
    status.value = 'won'
    stopClock()
    best.value = recordBest(difficulty.value, seconds.value)
  }
}

function openCell(r: number, c: number) {
  if (status.value === 'won' || status.value === 'lost') return
  const cell = board.value[r][c]
  if (cell.flagged) return
  if (cell.revealed) {
    const step = chord(board.value, r, c)
    board.value = step.board
    afterMove(step.hitMine)
    return
  }
  ensureMines(r, c)
  const step = reveal(board.value, r, c)
  board.value = step.board
  afterMove(step.hitMine)
}

function flagCell(r: number, c: number) {
  if (status.value === 'won' || status.value === 'lost') return
  if (status.value === 'ready') return
  board.value = toggleFlag(board.value, r, c)
}

function onContext(event: MouseEvent, r: number, c: number) {
  event.preventDefault()
  flagCell(r, c)
}

function onPointerDown(r: number, c: number) {
  pressCell.value = [r, c]
  pressTimer.value = window.setTimeout(() => {
    flagCell(r, c)
    pressCell.value = null
  }, 420)
}

function onPointerUp(r: number, c: number, event: PointerEvent) {
  if (pressTimer.value) window.clearTimeout(pressTimer.value)
  pressTimer.value = 0
  if (!pressCell.value) return
  pressCell.value = null
  if (event.button === 2) return
  openCell(r, c)
}

function onPointerCancel() {
  if (pressTimer.value) window.clearTimeout(pressTimer.value)
  pressTimer.value = 0
  pressCell.value = null
}

function pad(n: number): string {
  return String(Math.max(0, n)).padStart(3, '0')
}

function bestLabel(d: Difficulty): string {
  const v = best.value[d]
  return v === null ? '—' : `${v}s`
}

onUnmounted(() => {
  stopClock()
  onPointerCancel()
})

reset('beginner')
</script>

<template>
  <div class="shell">
    <header>
      <p class="eyebrow">Oscar Munoz · Vue 3</p>
      <h1>Field Sweep</h1>
      <p class="lede">Clear the grid. First click is always safe.</p>
    </header>

    <div class="hud">
      <div class="meter">
        <span>Mines</span>
        <strong>{{ pad(minesLeft) }}</strong>
      </div>
      <button class="status" type="button" @click="reset(difficulty)">
        {{ status === 'won' ? 'Clear' : status === 'lost' ? 'Boom' : status === 'playing' ? 'Sweep' : 'Ready' }}
      </button>
      <div class="meter">
        <span>Time</span>
        <strong>{{ pad(seconds) }}</strong>
      </div>
    </div>

    <div class="diffs">
      <button
        v-for="d in (['beginner', 'intermediate', 'expert'] as Difficulty[])"
        :key="d"
        type="button"
        :class="{ on: difficulty === d }"
        @click="reset(d)"
      >
        {{ d }}
        <em>best {{ bestLabel(d) }}</em>
      </button>
    </div>

    <div class="board-wrap">
      <div
        class="board"
        :style="{
          gridTemplateColumns: `repeat(${preset.cols}, 28px)`,
        }"
        @contextmenu.prevent
      >
        <button
          v-for="(cell, i) in board.flat()"
          :key="i"
          type="button"
          class="cell"
          :class="{
            open: cell.revealed,
            mine: cell.revealed && cell.mine,
            flag: cell.flagged,
            [`n${cell.adjacent}`]: cell.revealed && !cell.mine && cell.adjacent,
          }"
          :aria-label="`cell ${Math.floor(i / preset.cols) + 1},${(i % preset.cols) + 1}`"
          @contextmenu="onContext($event, Math.floor(i / preset.cols), i % preset.cols)"
          @pointerdown="onPointerDown(Math.floor(i / preset.cols), i % preset.cols)"
          @pointerup="onPointerUp(Math.floor(i / preset.cols), i % preset.cols, $event)"
          @pointerleave="onPointerCancel"
        >
          <template v-if="cell.flagged && !cell.revealed">⚑</template>
          <template v-else-if="cell.revealed && cell.mine">●</template>
          <template v-else-if="cell.revealed && cell.adjacent">{{ cell.adjacent }}</template>
        </button>
      </div>
    </div>

    <p class="hint">Left click opens. Right click or long-press flags. Chord a number when flags match.</p>
  </div>
</template>
