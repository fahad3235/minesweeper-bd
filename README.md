# Minesweeper BD

A fully offline Minesweeper game for Bangladesh, in English and Bangla.
No account, no server, no network calls -- open `index.html` and play.

## Features

1. **Three difficulties** -- Beginner (9x9, 10 mines), Intermediate (16x16, 40 mines),
   Expert (30x16, 99 mines).
2. **Custom boards** -- 5-30 rows, 5-30 columns, with validated mine counts.
3. **First-click safety** -- mines are placed only after your first click, and that
   cell is never a mine.
4. **Flags and chords** -- right-click (or Flag mode on mobile) to flag; click an
   open number once its flags match to open all remaining neighbours.
5. **Timer and best times** -- a live timer per game; your best time per difficulty
   is saved in your browser only (localStorage).
6. **English / Bangla toggle** -- persisted across visits, with Bangla digits in
   Bangla mode. Works at 390px mobile width.

## How to play

A number on an open cell tells how many mines touch that cell (including
diagonally). Use the numbers to work out where the mines are, flag them, and open
every safe cell to win. Opening a mine ends the game.

## Run it

No build step. Either:

- Open `index.html` directly in a browser, or
- Serve the folder: `python3 -m http.server 8000` and visit
  `http://localhost:8000/`.

## Tests

```sh
node tests/logic.test.js   # 13 pure-logic unit tests (no browser needed)
node tests/smoke.mjs       # 11 headless-Chrome checks via raw CDP
```

The smoke test needs `/opt/meta-chromium/chrome` (or edit the binary path in
`tests/smoke.mjs` to point at your Chromium/Chrome).

## Project layout

| File | Purpose |
|---|---|
| `index.html` | Page structure, HUD, custom-board form |
| `css/style.css` | Dark theme, responsive board |
| `js/logic.js` | Pure game logic (board, flood fill, flags, chords, win check) -- no DOM, unit-tested |
| `js/app.js` | UI wiring, timer, best times, EN/Bangla strings |
| `tests/logic.test.js` | Node unit tests |
| `tests/smoke.mjs` | Headless-Chrome smoke checks |

## Design notes

- The game logic (`js/logic.js`) has no DOM dependency, so the rules are tested
  exactly as shipped, not through a copy.
- Flood fill is iterative (explicit stack), so large empty regions cannot blow
  the call stack.
- All source files are pure ASCII: Bangla strings are written as `\uXXXX`
  escapes. This keeps the files safe for any ASCII-only transport.
- Expert board (30 columns) scrolls horizontally inside its panel on narrow
  screens instead of breaking the layout; the Beginner board fits 390px exactly.

## Limitations

- Best times live in one browser only; clearing site data clears them.
- There is no multiplayer, no leaderboard, and no account system by design.
- Flag placement is your own deduction -- the game never confirms whether a
  flag is on a real mine until you open neighbouring cells.

## Status

Built 2026-10-24 by the MUSE Project Factory (run #125, 14:00 slot).
Tests: 13/13 unit + 11/11 smoke, 0 console errors.
