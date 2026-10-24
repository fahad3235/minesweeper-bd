# Test results -- Minesweeper BD (2026-10-24, 14:00 slot)

## Unit tests -- 13/13 passed (`node tests/logic.test.js`)

- Neighbour counts: corner 3, edge 5, center 8.
- Board generation: exact mine count; safe cell never mined.
- Adjacency: hand-built 3x3, center mine -> all 8 neighbours adj 1.
- Flood fill: empty 5x5 reveals all 25; mine-row barrier reveals exactly the
  10-cell top pocket and nothing below it.
- Mine reveal: hitMine true, exactly 1 cell revealed.
- Flags: set/unset, revealed cells cannot be flagged, flagged cells are skipped
  by flood fill (24/25 revealed).
- Chord: fires when flags match the number (neighbours opened), silent on
  mismatch.
- Win: false until all safe cells revealed, true after.
- Custom validation: rows/cols bounds, mines >= 1, mines <= rows*cols - 9
  (9x9 max 72, rejected 73).
- Expert size: 16x30 board holds exactly 99 mines, safe cell clear.

## Headless-Chrome smoke -- 11/11 passed (`node tests/smoke.mjs`, raw CDP)

- Title, 81 beginner cells, 4 difficulty buttons.
- First click reveals cells (first-click safety + flood fill).
- Flag mode flags exactly 1 cell; mine counter updates.
- EN -> Bangla -> EN subtitle toggle round-trip.
- Custom form rejects rows=3 with a visible error.
- Expert board renders 480 cells.
- Beginner board fits a 390px viewport (scrollWidth <= 391).
- 0 console errors, 0 page exceptions.

## Repairs

- 1 smoke-harness fix only: CDP `Runtime.evaluate` response unwrapping
  (`r.result.value`, not `r.result.result.value`). 0 app bugs found.
- Sources verified pure ASCII (`grep -P '[^\x00-\x7F]'` clean) after replacing
  em dashes with `&#8212;` / `\u2014` escapes.
