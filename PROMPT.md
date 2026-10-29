Build Minesweeper in THIS folder: C:\xampp\htdocs\minesweeper

A recruiter-ready browser Minesweeper. Playable, polished, no backend.

## Game
- Difficulties: Beginner 9x9 / 10 mines, Intermediate 16x16 / 40, Expert 16x30 / 99.
- Left click reveal, right click / long-press flag. Chord: click a numbered revealed cell with matching flags to open neighbors.
- First click is always safe (and preferably opens a region).
- Timer starts on first click. Mine counter. Win when all non-mine cells are open.
- localStorage best times per difficulty.
- Do not use Microsoft/Windows branding.

## UI
- Dark, precise, slightly industrial. Satisfying reveal cascade.
- 390px phone (Beginner fits; Intermediate/Expert scroll the board) and 1280px desktop.

## Tests
- Vitest: first-click never a mine; flag count; win detection; chord opens neighbors.
- `npm test` and `npm run build` must pass.

## GitHub
- Repo: https://github.com/oscarmmi/minesweeper
- Pages: https://oscarmmi.github.io/minesweeper/
- vite base `/minesweeper/`
- Commit: feat: add minesweeper
- gh repo edit --description "Classic Minesweeper in Vue 3 + TypeScript, playable on GitHub Pages." --add-topic vue --add-topic typescript --add-topic game --add-topic minesweeper --add-topic vite
- Stop. Print the repo URL and Pages URL.
