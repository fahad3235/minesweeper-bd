/* Minesweeper BD - UI wiring. All Bengali strings are \uXXXX escapes so that
   every source file stays pure ASCII (push-safe). */
(function () {
  'use strict';
  var L = window.MinesweeperLogic;

  var I18N = {
    en: {
      title: 'Minesweeper BD', subtitle: 'Dodge the mines, open every safe cell.',
      beginner: 'Beginner', intermediate: 'Intermediate', expert: 'Expert', custom: 'Custom',
      newGame: 'New game', flagMode: 'Flag mode', revealMode: 'Reveal mode',
      mines: 'Mines', time: 'Time', best: 'Best time',
      rows: 'Rows', cols: 'Columns', start: 'Start custom game',
      howTitle: 'How to play',
      how1: 'Click a cell to open it. Right-click (or Flag mode) to place a flag.',
      how2: 'A number tells how many mines touch that cell. Chord: click an open number once its flags match to open the rest.',
      how3: 'Your first click is always safe. On mobile, use Flag mode to place flags.',
      statusPlaying: 'Good luck!', statusWon: 'You win! Time: ',
      statusLost: 'Boom! You hit a mine. Game over.',
      errRows: 'Rows must be 5-30.', errCols: 'Columns must be 5-30.',
      errMinesMin: 'At least 1 mine.', errMinesMax: 'Too many mines for this board.',
      sec: 's', noBest: '\u2014', langBtn: 'BN'
    },
    bn: {
      title: 'Minesweeper BD',
      subtitle: '\u09ae\u09be\u0987\u09a8 \u098f\u09a1\u09bc\u09bf\u09df\u09c7 \u0996\u09c7\u09b2\u09c1\u09a8',
      beginner: '\u09b8\u09b9\u099c', intermediate: '\u09ae\u09be\u099d\u09be\u09b0\u09bf',
      expert: '\u0995\u09a0\u09bf\u09a8', custom: '\u09a8\u09bf\u099c\u09c7\u09b0 \u09ae\u09a4\u09cb',
      newGame: '\u09a8\u09a4\u09c1\u09a8 \u0996\u09c7\u09b2\u09be',
      flagMode: '\u09aa\u09a4\u09be\u0995\u09be \u09ae\u09cb\u09a1',
      revealMode: '\u0996\u09c1\u09b2\u09be\u09b0 \u09ae\u09cb\u09a1',
      mines: '\u09ae\u09be\u0987\u09a8', time: '\u09b8\u09ae\u09df', best: '\u09b8\u09c7\u09b0\u09be \u09b8\u09ae\u09df',
      rows: '\u09b8\u09be\u09b0\u09bf', cols: '\u0995\u09b2\u09be\u09ae', start: '\u09b6\u09c1\u09b0\u09c1 \u0995\u09b0\u09c1\u09a8',
      howTitle: '\u0996\u09c7\u09b2\u09be\u09b0 \u09a8\u09bf\u09df\u09ae',
      how1: '\u0995\u09cd\u09b2\u09bf\u0995 \u0995\u09b0\u09c7 \u0998\u09b0 \u0996\u09c1\u09b2\u09c1\u09a8',
      how2: '\u09a1\u09be\u09a8 \u0995\u09cd\u09b2\u09bf\u0995: \u09aa\u09a4\u09be\u0995\u09be',
      how3: '\u09ae\u09cb\u09ac\u09be\u0987\u09b2\u09c7: \u09aa\u09a4\u09be\u0995\u09be \u09ae\u09cb\u09a1',
      statusPlaying: '\u09b6\u09c1\u09ad \u0995\u09be\u09ae\u09a8\u09be!',
      statusWon: '\u0986\u09aa\u09a8\u09bf \u099c\u09bf\u09a4\u09c7\u099b\u09c7\u09a8! \u09b8\u09ae\u09df: ',
      statusLost: '\u09ae\u09be\u0987\u09a8 \u09ab\u09c7\u099f\u09c7\u099b\u09c7! \u0996\u09c7\u09b2\u09be \u09b6\u09c7\u09b7\u0964',
      errRows: '\u09b8\u09be\u09b0\u09bf \u09eb\u2013\u09e9\u09e6 \u098f\u09b0 \u09ae\u09a7\u09cd\u09af\u09c7 \u09b9\u09a4\u09c7 \u09b9\u09ac\u09c7\u0964',
      errCols: '\u0995\u09b2\u09be\u09ae \u09eb\u2013\u09e9\u09e6 \u098f\u09b0 \u09ae\u09a7\u09cd\u09af\u09c7 \u09b9\u09a4\u09c7 \u09b9\u09ac\u09c7\u0964',
      errMinesMin: '\u0995\u09ae\u09aa\u0995\u09cd\u09b7\u09c7 \u09e7\u099f\u09bf \u09ae\u09be\u0987\u09a8\u0964',
      errMinesMax: '\u098f\u0987 \u09ac\u09cb\u09b0\u09cd\u09a1\u09c7\u09b0 \u099c\u09a8\u09cd\u09af \u09ae\u09be\u0987\u09a8 \u09ac\u09c7\u09b6\u09bf\u0964',
      sec: '\u09b8\u09c7', noBest: '\u2014', langBtn: 'EN'
    }
  };

  var BN_DIGITS = ['\u09e6', '\u09e7', '\u09e8', '\u09e9', '\u09ea', '\u09eb', '\u09ec', '\u09ed', '\u09ee', '\u09ef'];
  function num(n, lang) {
    var s = String(n);
    if (lang !== 'bn') return s;
    return s.replace(/[0-9]/g, function (d) { return BN_DIGITS[+d]; });
  }

  var DIFFS = {
    beginner: { rows: 9, cols: 9, mines: 10 },
    intermediate: { rows: 16, cols: 16, mines: 40 },
    expert: { rows: 16, cols: 30, mines: 99 }
  };

  var lang = localStorage.getItem('msbd-lang') || 'en';
  var best = {};
  try { best = JSON.parse(localStorage.getItem('msbd-best') || '{}'); } catch (e) { best = {}; }

  var state = {
    diff: 'beginner', rows: 9, cols: 9, mines: 10, board: null,
    started: false, over: false, won: false, seconds: 0, timer: null, flagMode: false
  };

  function $(id) { return document.getElementById(id); }
  function t(key) { return I18N[lang][key]; }

  function stopTimer() { if (state.timer) { clearInterval(state.timer); state.timer = null; } }
  function startTimer() {
    if (state.timer) return;
    state.timer = setInterval(function () { state.seconds++; renderHud(); }, 1000);
  }

  function renderHud() {
    var flags = state.board ? L.countFlags(state.board) : 0;
    $('mineCount').textContent = num(state.mines - flags, lang);
    $('timeCount').textContent = num(state.seconds, lang);
    var b = best[state.diff];
    $('bestTime').textContent = (b === undefined ? t('noBest') : num(b, lang) + ' ' + t('sec'));
    $('status').textContent = state.over
      ? (state.won ? t('statusWon') + num(state.seconds, lang) + ' ' + t('sec') : t('statusLost'))
      : t('statusPlaying');
    $('face').textContent = state.over ? (state.won ? '\uD83D\uDE0E' : '\uD83D\uDE35') : '\uD83D\uDE42';
  }

  function renderBoard() {
    var grid = $('board'), b = state.board, i, btn;
    grid.style.setProperty('--cols', state.cols);
    grid.innerHTML = '';
    grid.className = 'board' + (state.cols > 16 ? ' wide' : '');
    for (i = 0; i < state.rows * state.cols; i++) {
      btn = document.createElement('button');
      btn.className = 'cell';
      btn.type = 'button';
      btn.dataset.idx = i;
      btn.setAttribute('aria-label', 'Cell ' + (i + 1));
      if (b) {
        var c = b.cells[i];
        if (c.revealed) {
          btn.classList.add('open');
          if (c.mine) { btn.classList.add('mine'); btn.textContent = '\uD83D\uDCA3'; }
          else if (c.adj > 0) { btn.classList.add('n' + c.adj); btn.textContent = num(c.adj, lang); }
        } else if (c.flagged) { btn.classList.add('flag'); btn.textContent = '\u2691'; }
      }
      grid.appendChild(btn);
    }
  }

  function newGame(diffKey, custom) {
    stopTimer();
    if (custom) {
      state.diff = 'custom'; state.rows = custom.rows; state.cols = custom.cols; state.mines = custom.mines;
    } else {
      state.diff = diffKey;
      var d = DIFFS[diffKey];
      state.rows = d.rows; state.cols = d.cols; state.mines = d.mines;
    }
    state.board = null; state.started = false; state.over = false; state.won = false;
    state.seconds = 0; state.flagMode = false;
    $('modeBtn').textContent = t('revealMode');
    document.querySelectorAll('.diff-btn').forEach(function (el) {
      el.classList.toggle('active', el.dataset.diff === state.diff);
    });
    renderBoard(); renderHud();
  }

  function finish(win) {
    state.over = true; state.won = win; stopTimer();
    if (win) {
      var prev = best[state.diff];
      if (prev === undefined || state.seconds < prev) {
        best[state.diff] = state.seconds;
        localStorage.setItem('msbd-best', JSON.stringify(best));
      }
    }
    renderBoard(); renderHud();
  }

  function afterReveal(res) {
    if (res.hitMine) { L.revealAllMines(state.board); finish(false); return; }
    if (L.checkWin(state.board)) finish(true);
    else { renderBoard(); renderHud(); }
  }

  function handleCell(idx) {
    if (state.over) return;
    if (!state.started) {
      state.board = L.createBoard(state.rows, state.cols, state.mines, idx);
      state.started = true; startTimer();
    }
    if (state.flagMode) {
      if (L.toggleFlag(state.board, idx)) { renderBoard(); renderHud(); }
      return;
    }
    var cell = state.board.cells[idx];
    if (cell.revealed) {
      var ch = L.chord(state.board, idx);
      if (ch) afterReveal(ch);
      return;
    }
    afterReveal(L.reveal(state.board, idx));
  }

  function applyLang() {
    document.querySelectorAll('[data-i18n]').forEach(function (el) {
      el.textContent = t(el.dataset.i18n);
    });
    $('modeBtn').textContent = state.flagMode ? t('flagMode') : t('revealMode');
    document.querySelectorAll('.diff-btn').forEach(function (el) {
      el.textContent = t(el.dataset.diff);
    });
    $('langBtn').textContent = (lang === 'en' ? '\u09ac\u09be\u0982\u09b2\u09be' : 'English');
    document.documentElement.lang = (lang === 'bn' ? 'bn' : 'en');
    localStorage.setItem('msbd-lang', lang);
    renderBoard(); renderHud();
  }

  document.addEventListener('DOMContentLoaded', function () {
    var grid = $('board');
    grid.addEventListener('click', function (ev) {
      var cell = ev.target.closest('.cell');
      if (cell) handleCell(+cell.dataset.idx);
    });
    grid.addEventListener('contextmenu', function (ev) {
      var cell = ev.target.closest('.cell');
      if (!cell) return;
      ev.preventDefault();
      if (state.over || !state.started) return;
      if (L.toggleFlag(state.board, +cell.dataset.idx)) { renderBoard(); renderHud(); }
    });
    function restartCurrent() {
      if (state.diff === 'custom') newGame(null, { rows: state.rows, cols: state.cols, mines: state.mines });
      else newGame(state.diff);
    }
    document.querySelectorAll('.diff-btn').forEach(function (el) {
      el.addEventListener('click', function () {
        if (el.dataset.diff === 'custom') { $('inRows').focus(); return; }
        newGame(el.dataset.diff);
      });
    });
    $('face').addEventListener('click', restartCurrent);
    $('newGameBtn').addEventListener('click', restartCurrent);
    $('modeBtn').addEventListener('click', function () {
      state.flagMode = !state.flagMode;
      $('modeBtn').textContent = state.flagMode ? t('flagMode') : t('revealMode');
      $('modeBtn').classList.toggle('active', state.flagMode);
    });
    $('langBtn').addEventListener('click', function () {
      lang = (lang === 'en' ? 'bn' : 'en');
      applyLang();
    });
    $('customForm').addEventListener('submit', function (ev) {
      ev.preventDefault();
      var rows = parseInt($('inRows').value, 10);
      var cols = parseInt($('inCols').value, 10);
      var mines = parseInt($('inMines').value, 10);
      var err = L.validateCustom(rows, cols, mines);
      var box = $('customError');
      if (err) {
        box.textContent = { rowsRange: t('errRows'), colsRange: t('errCols'), minesMin: t('errMinesMin'), minesMax: t('errMinesMax') }[err];
        return;
      }
      box.textContent = '';
      newGame(null, { rows: rows, cols: cols, mines: mines });
    });
    newGame('beginner');
    applyLang();
  });
})();
