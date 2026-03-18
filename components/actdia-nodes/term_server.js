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

  async setCursor({ col, row, fromLastCol }) {
    let colDelta = 0, rowDelta = 0;
    if (typeof col === 'number') {
      colDelta = col - this.pos;
    } else if (typeof fromLastCol === 'number') {
      colDelta = (this.buffer.length + fromLastCol) - this.pos;
    }

    await this.moveCursor(colDelta, rowDelta);

    //this.pos = col;

    /*if (typeof row === 'number') {
      if (typeof col === 'number') {
        await this.send(`\x1b[${(row + 1)};${col + 1}H`);
      } else {
        await this.send(`\x1b[${(row + 1)}H`);
      }
    } else if (typeof col === 'number') {
      await this.send(`\x1b[${(col + 1)}G`);
    }*/
  }

  async moveCursor(colDelta, rowDelta) {
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

    if (rowDelta) {
      if (rowDelta < 0) {
        if (this.historyIndex > 0) {
          this.historyIndex--;
        } else {
          this.historyIndex = 0;
        }
      } else if (rowDelta > 0) {
        const length = this.history.length;
        if (this.historyIndex < length) {
          this.historyIndex++;
        } else {
          this.historyIndex = length;
        }
      }

      let newBuffer = this.history[this.historyIndex] ?? '';
      
      if (this.pos) {
        command = `\x1b[${this.pos}D`;
      }
      if (this.buffer) {
        command += `\x1b[${this.buffer.length}P`;
      }
      command += newBuffer;
      this.buffer = newBuffer;
      this.pos = newBuffer.length;
    }

    await this.send(command);
  }

  async putCharInBuffer(char) {
    if (this.pos < this.buffer.length) {
      this.buffer = this.buffer.slice(0, this.pos) + char + this.buffer.slice(this.pos + 1);
    } else {
      this.buffer += char;
    }

    this.pos++;
  }

  async clearScreen() {
    this.buffer = '';
    this.pos = 0;
  }

  async clearCurrentLine() {
    this.buffer = '';
    this.pos = 0;
  }

  async saveCursor() {
    this.savedCursor = { pos: this.pos };
  }

  async restoreCursor() {
    if (this.savedCursor) {
      await this.setCursor({ col: this.savedCursor.pos });
    }
  }

  async deleteChar(n) {
    this.buffer = this.buffer.slice(0, this.pos) + this.buffer.slice(this.pos + n);
    await this.send(`\x1b[${n}P`);
  }

  async enter() {
    const command = this.buffer;
    this.buffer = '';
    this.pos = 0;
    this.history.push(command);
    this.historyIndex = this.history.length;

    await this.send('\n');
    await this.send(await this.execCommand(command));
    await this.send(this.prompt);
  }

  async send(data) {
    if (!this.sendHandler) {
      return 'No send handler';
    }

    await this.sendHandler(data);
  }

  async execCommand(command) {
    if (!this.commandHandler) {
      return 'No command handler';
    }

    return await this.commandHandler({ command, terminal: this });
  }
}