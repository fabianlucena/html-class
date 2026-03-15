import TermBase from './term_base.js';

export default class TermServer extends TermBase {
  buffer = '';
  pos = 0;
  history = [];
  historyIndex = 0;
  prompt = '> ';

  constructor(options) {
    super(...arguments);
    Object.assign(this, options);
  }

  setCursor({ col, row }) {
    this.pos = col;
    if (typeof row === 'number') {
      if (typeof col === 'number') {
        this.send(`\x1b[${(row + 1)};${col + 1}H`);
      } else {
        this.send(`\x1b[${(row + 1)}H`);
      }
    } else if (typeof col === 'number') {
      this.send(`\x1b[${(col + 1)}G`);
    }
  }

  moveCursor(colDelta, rowDelta) {
    let command = '';

    if (colDelta > 0) {
      let newPos = this.pos + colDelta;
      if (newPos > this.buffer.length) {
        colDelta = this.buffer.length - this.pos;
      }

      if (colDelta) {
        this.pos += colDelta;
        command += '\x1b[' + colDelta + 'C';
      }
    } else if (colDelta < 0) {
      let newPos = this.pos + colDelta;
      if (newPos < 0) {
        colDelta = -this.pos;
      }
      
      if (colDelta) {
        this.pos += colDelta;
        command += '\x1b[' + (-colDelta) + 'D';
      }
    }

    if (rowDelta < 0) {
      if (this.historyIndex > 0) {
        this.historyIndex--;
      } else {
        this.historyIndex = 0;
      }

      if (this.history[this.historyIndex]) {
        command = '\x1b[2K\x1b[1G' + (this.history[this.historyIndex] ?? '');
      }
    } else if (rowDelta > 0) {
      const length = this.history.length;
      if (this.historyIndex < length) {
        this.historyIndex++;
      } else {
        this.historyIndex = length;
      }
      
      if (this.history[this.historyIndex]) {
        command = '\x1b[2K\x1b[1G' + (this.history[this.historyIndex] ?? '');
      }
    }

    this.send(command);
  }

  putCharInBuffer(char) {
    if (this.pos < this.buffer.length) {
      this.buffer = this.buffer.slice(0, this.pos) + char + this.buffer.slice(this.pos + 1);
    } else {
      this.buffer += char;
    }

    this.pos++;
  }

  clearScreen() {
    this.buffer = '';
    this.pos = 0;
  }

  clearCurrentLine() {
    this.buffer = '';
    this.pos = 0;
  }

  saveCursor() {
    this.savedCursor = { pos: this.pos };
  }

  restoreCursor() {
    if (this.savedCursor) {
      this.setCursor({ col: this.savedCursor.pos });
    }
  }

  deleteChar(n) {
    this.buffer = this.buffer.slice(0, this.pos) + this.buffer.slice(this.pos + n);
    this.send(`\x1b[${n}P`);
  }

  enter() {
    const command = this.buffer;
    this.buffer = '';
    this.pos = 0;
    this.history.push(command);
    this.historyIndex = this.history.length;

    const result = '\n' + this.execCommand(command) + this.prompt;
    this.send(result);
  }

  send(data) {
    if (!this.sendHandler) {
      return;
    }

    this.sendHandler(data);
  }

  execCommand(command) {
    if (!this.commandHandler) {
      return 'No command handler';
    }

    return this.commandHandler(command);
  }
}