import TermBase from './term_base.js';

class Cell {
  char = ' ';
  fg = '#fff'
  bg = '#000';
  bold = false;
  underline = false;
  continuation = false;
  dirty = false;
};

export default class Term extends TermBase {
  #rows = 0;
  #cols = 0;
  viewport = [];
  scrollback = [];
  cursor = {
    row: 0,
    col: 0,
    pendingWrap: false,
    originMode: false,
  }

  get rows() {
    return this.#rows;
  }

  set rows(value) {
    this.#rows = value;
    while (this.viewport.length < value) {
      this.viewport.push(new Array(this.#cols).fill().map(() => new Cell()));
    }
    while (this.viewport.length > value) {
      this.viewport.pop();
    }
  }

  get cols() {
    return this.#cols;
  }

  set cols(value) {
    this.#cols = value;
    for (const row of this.viewport) {
      while (row.length < value) {
        row.push(new Cell());
      }
      while (row.length > value) {
        row.pop();
      }
    }
  }

  constructor() {
    super(...arguments);
    
    this.rows = 24;
    this.cols = 80;
  }

  async putCharInBuffer(char) {
    if (this.cursor.pendingWrap) {
      this.cursor.pendingWrap = false;
      await this.moveCursor(0, 1);
    }

    this.viewport[this.cursor.row][this.cursor.col].char = char;
    await this.moveCursor(1, 0);
  }

  async setCursor({ col, row }) {
    if (typeof col === 'number')
      this.cursor.col = col;

    if (typeof row === 'number')
      this.cursor.row = row;

    if (this.cursor.col < 0) {
      this.cursor.col = 0;
    }

    if (this.cursor.col >= this.cols) {
      this.cursor.col = 0;
      this.cursor.row++;
    }

    if (this.cursor.row < 0) {
      this.cursor.row = 0;
    }
    
    if (this.cursor.row >= this.rows) {
      this.cursor.row = this.rows - 1;
      this.scrollback.push(this.viewport.shift());
      this.viewport.push(new Array(this.cols).fill().map(() => new Cell()));
    }
  }

  async moveCursor(dx, dy) {
    await this.setCursor({ col: this.cursor.col + dx, row: this.cursor.row + dy });
  }

  async clearScreen() {
    this.viewport.forEach(row => row.forEach(cell => cell.char = ' '));
  }

  async clearCurrentLine() {
    this.viewport[this.cursor.row].forEach(cell => cell.char = ' ');
  }

  async saveCursor() {
    this.savedCursor = { col: this.cursor.col, row: this.cursor.row };
  }

  async restoreCursor() {
    if (this.savedCursor) {
      await this.setCursor({ col: this.savedCursor.col, row: this.savedCursor.row });
    }
  }

  async deleteChar(n) {
    this.viewport[this.cursor.row].splice(this.cursor.col, n);
    this.viewport[this.cursor.row].push(...new Array(n).fill(new Cell()));
  }
};