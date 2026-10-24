/* Node unit tests for js/logic.js. Run: node tests/logic.test.js */
'use strict';
const assert = require('assert');
const L = require('../js/logic.js');

let pass = 0;
function ok(name, fn) { fn(); pass++; console.log('ok - ' + name); }

// Deterministic RNG: cycles through a fixed sequence.
function seqRng(values) {
  let i = 0;
  return function () { const v = values[i % values.length]; i++; return v; };
}

ok('neighbors: corner has 3, edge has 5, center has 8', function () {
  assert.strictEqual(L.neighbors(0, 9, 9).length, 3);
  assert.strictEqual(L.neighbors(1, 9, 9).length, 5);
  assert.strictEqual(L.neighbors(40, 9, 9).length, 8);
});

ok('createBoard: exact mine count and safe cell never mined', function () {
  const b = L.createBoard(9, 9, 10, 40, seqRng([0.1, 0.9, 0.3, 0.7, 0.5]));
  assert.strictEqual(b.cells.filter(c => c.mine).length, 10);
  assert.strictEqual(b.cells[40].mine, false);
});

ok('adj counts: hand-built 3x3 board, center mine -> all neighbours adj 1', function () {
  // Build via createBoard then force a known layout: only cell 4 mined.
  const b = L.createBoard(3, 3, 0, 0, seqRng([0.5]));
  b.cells.forEach(c => { c.mine = false; c.adj = 0; });
  b.cells[4].mine = true; b.mines = 1;
  // Recompute adj manually with the same rule as the implementation.
  b.cells.forEach((c, i) => {
    if (c.mine) return;
    c.adj = L.neighbors(i, 3, 3).filter(n => b.cells[n].mine).length;
  });
  [0, 1, 2, 3, 5, 6, 7, 8].forEach(i => assert.strictEqual(b.cells[i].adj, 1));
});

ok('reveal flood: empty 5x5 board reveals all 25 cells', function () {
  const b = L.createBoard(5, 5, 0, 12, seqRng([0.5]));
  const r = L.reveal(b, 12);
  assert.strictEqual(r.hitMine, false);
  assert.strictEqual(r.revealed, 25);
  assert.strictEqual(L.checkWin(b), true);
});

ok('reveal stops at numbers: mine ring around a zero pocket', function () {
  const b = L.createBoard(5, 5, 0, 0, seqRng([0.5]));
  b.cells.forEach(c => { c.mine = false; c.adj = 0; });
  // Mines at row 2 (indices 10..14) split the board; top pocket is rows 0-1.
  [10, 11, 12, 13, 14].forEach(i => { b.cells[i].mine = true; });
  b.mines = 5;
  b.cells.forEach((c, i) => {
    if (!c.mine) c.adj = L.neighbors(i, 5, 5).filter(n => b.cells[n].mine).length;
  });
  const r = L.reveal(b, 0);
  assert.strictEqual(r.revealed, 10); // rows 0-1 fully, nothing below the mine row
  assert.strictEqual(b.cells[20].revealed, false);
});

ok('reveal of a mine reports hitMine and reveals only that cell', function () {
  const b = L.createBoard(3, 3, 0, 0, seqRng([0.5]));
  b.cells[4].mine = true; b.mines = 1;
  const r = L.reveal(b, 4);
  assert.strictEqual(r.hitMine, true);
  assert.strictEqual(r.revealed, 1);
});

ok('flag toggle: set, unset, and revealed cells cannot be flagged', function () {
  const b = L.createBoard(3, 3, 0, 0, seqRng([0.5]));
  assert.strictEqual(L.toggleFlag(b, 0), true);
  assert.strictEqual(L.countFlags(b), 1);
  assert.strictEqual(L.toggleFlag(b, 0), true);
  assert.strictEqual(L.countFlags(b), 0);
  L.reveal(b, 1);
  assert.strictEqual(L.toggleFlag(b, 1), false);
});

ok('flagged cells are not revealed by flood fill', function () {
  const b = L.createBoard(5, 5, 0, 12, seqRng([0.5]));
  L.toggleFlag(b, 0);
  L.reveal(b, 12);
  assert.strictEqual(b.cells[0].revealed, false);
  assert.strictEqual(L.countRevealed(b), 24);
});

ok('chord: flags matching the number open the remaining neighbours', function () {
  const b = L.createBoard(3, 3, 0, 0, seqRng([0.5]));
  b.cells[4].mine = true; b.mines = 1;
  b.cells.forEach((c, i) => {
    if (!c.mine) c.adj = L.neighbors(i, 3, 3).filter(n => b.cells[n].mine).length;
  });
  L.reveal(b, 0); // adj 1
  L.toggleFlag(b, 4);
  const ch = L.chord(b, 0);
  assert.ok(ch);
  assert.strictEqual(ch.hitMine, false);
  assert.strictEqual(b.cells[1].revealed, true);
  assert.strictEqual(b.cells[3].revealed, true);
});

ok('chord does not fire when flag count mismatches the number', function () {
  const b = L.createBoard(3, 3, 0, 0, seqRng([0.5]));
  b.cells[4].mine = true; b.mines = 1;
  b.cells.forEach((c, i) => {
    if (!c.mine) c.adj = L.neighbors(i, 3, 3).filter(n => b.cells[n].mine).length;
  });
  L.reveal(b, 0);
  assert.strictEqual(L.chord(b, 0), null);
});

ok('checkWin: false until all safe cells are revealed', function () {
  const b = L.createBoard(3, 3, 0, 0, seqRng([0.5]));
  b.cells[8].mine = true; b.mines = 1;
  b.cells.forEach((c, i) => {
    if (!c.mine) c.adj = L.neighbors(i, 3, 3).filter(n => b.cells[n].mine).length;
  });
  assert.strictEqual(L.checkWin(b), false);
  for (let i = 0; i < 8; i++) L.reveal(b, i);
  assert.strictEqual(L.checkWin(b), true);
});

ok('validateCustom: bounds and mine cap', function () {
  assert.strictEqual(L.validateCustom(4, 9, 10), 'rowsRange');
  assert.strictEqual(L.validateCustom(31, 9, 10), 'rowsRange');
  assert.strictEqual(L.validateCustom(9, 4, 10), 'colsRange');
  assert.strictEqual(L.validateCustom(9, 9, 0), 'minesMin');
  assert.strictEqual(L.validateCustom(9, 9, 73), 'minesMax'); // 81 - 9 = 72 max
  assert.strictEqual(L.validateCustom(9, 9, 72), null);
  assert.strictEqual(L.validateCustom(12, 12, 20), null);
});

ok('expert size: 16x30 board holds exactly 99 mines, safe cell clear', function () {
  const b = L.createBoard(16, 30, 99, 0, seqRng([0.13, 0.77, 0.42, 0.91, 0.05]));
  assert.strictEqual(b.cells.filter(c => c.mine).length, 99);
  assert.strictEqual(b.cells[0].mine, false);
});

console.log('ALL ' + pass + ' TESTS PASSED');
