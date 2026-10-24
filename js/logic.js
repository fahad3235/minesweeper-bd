/* Minesweeper BD - pure game logic (no DOM). Works in browser and Node. */
(function (root) {
  'use strict';

  function neighbors(idx, rows, cols) {
    var r = Math.floor(idx / cols), c = idx % cols, out = [], dr, dc, nr, nc;
    for (dr = -1; dr <= 1; dr++) {
      for (dc = -1; dc <= 1; dc++) {
        if (dr === 0 && dc === 0) continue;
        nr = r + dr; nc = c + dc;
        if (nr >= 0 && nr < rows && nc >= 0 && nc < cols) out.push(nr * cols + nc);
      }
    }
    return out;
  }

  function createBoard(rows, cols, mineCount, safeIdx, rng) {
    var total = rows * cols, cells = [], i, pool = [], j, tmp, m;
    rng = rng || Math.random;
    for (i = 0; i < total; i++) cells.push({ mine: false, adj: 0, revealed: false, flagged: false });
    for (i = 0; i < total; i++) if (i !== safeIdx) pool.push(i);
    // Fisher-Yates shuffle of the pool, then take the first mineCount entries.
    for (i = pool.length - 1; i > 0; i--) {
      j = Math.floor(rng() * (i + 1));
      tmp = pool[i]; pool[i] = pool[j]; pool[j] = tmp;
    }
    for (m = 0; m < mineCount; m++) cells[pool[m]].mine = true;
    for (i = 0; i < total; i++) {
      if (cells[i].mine) continue;
      cells[i].adj = neighbors(i, rows, cols).filter(function (n) { return cells[n].mine; }).length;
    }
    return { rows: rows, cols: cols, mines: mineCount, cells: cells };
  }

  // Reveal a cell. Returns { hitMine, revealed } where revealed counts newly
  // revealed cells. Flood-fills through zero-adjacent cells. Flagged or
  // already-revealed cells are untouched (revealed = 0).
  function reveal(board, idx) {
    var cell = board.cells[idx];
    if (!cell || cell.flagged || cell.revealed) return { hitMine: false, revealed: 0 };
    if (cell.mine) { cell.revealed = true; return { hitMine: true, revealed: 1 }; }
    var stack = [idx], count = 0, cur, nbs, k;
    while (stack.length) {
      cur = stack.pop();
      var c = board.cells[cur];
      if (c.revealed || c.flagged) continue;
      c.revealed = true; count++;
      if (c.adj === 0) {
        nbs = neighbors(cur, board.rows, board.cols);
        for (k = 0; k < nbs.length; k++) {
          var n = board.cells[nbs[k]];
          if (!n.revealed && !n.flagged) stack.push(nbs[k]);
        }
      }
    }
    return { hitMine: false, revealed: count };
  }

  function toggleFlag(board, idx) {
    var cell = board.cells[idx];
    if (!cell || cell.revealed) return false;
    cell.flagged = !cell.flagged;
    return true;
  }

  // Chord: click an already-revealed number whose flagged-neighbour count
  // equals its number -> reveal all other neighbours. Returns null when the
  // chord does not apply.
  function chord(board, idx) {
    var cell = board.cells[idx];
    if (!cell || !cell.revealed || cell.adj === 0) return null;
    var nbs = neighbors(idx, board.rows, board.cols);
    var flags = nbs.filter(function (n) { return board.cells[n].flagged; }).length;
    if (flags !== cell.adj) return null;
    var total = 0, hit = false, k, r;
    nbs.forEach(function (n) {
      var nc = board.cells[n];
      if (nc.flagged || nc.revealed) return;
      r = reveal(board, n);
      total += r.revealed;
      if (r.hitMine) hit = true;
    });
    return { hitMine: hit, revealed: total };
  }

  function countFlags(board) {
    return board.cells.filter(function (c) { return c.flagged; }).length;
  }

  function countRevealed(board) {
    return board.cells.filter(function (c) { return c.revealed; }).length;
  }

  function checkWin(board) {
    return countRevealed(board) === board.rows * board.cols - board.mines;
  }

  function revealAllMines(board) {
    board.cells.forEach(function (c) { if (c.mine) c.revealed = true; });
  }

  // Custom-board validation. Returns an error key string, or null when valid.
  function validateCustom(rows, cols, mines) {
    if (!Number.isInteger(rows) || rows < 5 || rows > 30) return 'rowsRange';
    if (!Number.isInteger(cols) || cols < 5 || cols > 30) return 'colsRange';
    if (!Number.isInteger(mines) || mines < 1) return 'minesMin';
    if (mines > rows * cols - 9) return 'minesMax';
    return null;
  }

  var api = {
    neighbors: neighbors, createBoard: createBoard, reveal: reveal,
    toggleFlag: toggleFlag, chord: chord, countFlags: countFlags,
    countRevealed: countRevealed, checkWin: checkWin,
    revealAllMines: revealAllMines, validateCustom: validateCustom
  };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.MinesweeperLogic = api;
})(typeof window !== 'undefined' ? window : this);
