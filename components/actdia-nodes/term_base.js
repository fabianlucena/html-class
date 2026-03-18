export default class TermBase {
  escapeSequence = '';
  escapeNumber = '';
  escapeCommand = '';
  lmn = true;
  tabSize = 4;
  pageSize = 10;

  constructor(options) {
    Object.assign(this, options);
  }

  async receive(data) {
    let result = '';
    for (let i = 0, l = data?.length; i < l; i++) {
      result += await this.receiveChar(data[i]) ?? '';
    }
    return result;
  }

  async receiveChar(char) {
    if (this.escapeSequence) {
      if (this.escapeSequence === '\x1B') {
        if (char !== '[') {
          this.escapeSequence = '';
          return;
        } else {
          this.escapeSequence += char;
          this.escapeNumber = '';
          this.escapeCommand = '';
        }
      } else if (this.escapeSequence.startsWith('\x1B[')) {
        if (char >= '0' && char <= '9' || char === ';') {
          this.escapeSequence += char;
          this.escapeNumber += char;
        } else if (char >= '@' && char <= '~') {
          this.escapeSequence += char;
          this.escapeCommand = char;
          await this.execEscapeSequence();
          this.escapeSequence = '';
        }
      }

      return;
    }

    switch (char) {
      case '\n':
        await this.enter();
        await this.moveCursor(0, 1);
        if (this.lmn) {
          await this.setCursor({ col: 0 });
        }
        break;

      case '\r':
        await this.setCursor({ col: 0 });
        break;

      case '\b':
        await this.moveCursor(-1, 0);
        await this.deleteChar(1);
        break;

      case '\t':
        await this.moveCursor(this.tabSize - (this.pos % this.tabSize), 0);
        break;

      case '\x1B':
        this.escapeSequence = char;
        break;

      default:
        await this.putCharInBuffer(char);
        return char;
    }
  }

  async execEscapeSequence() {
    let n;
    switch (this.escapeCommand) {
      case 'A': // Move cursor up
        n = parseInt(this.escapeNumber) || 1;
        await this.moveCursor(0, -n);
        break;

      case 'B': // Move cursor down
        n = parseInt(this.escapeNumber) || 1;
        await this.moveCursor(0, n);
        break;

      case 'C': // Move cursor to the right
        n = parseInt(this.escapeNumber) || 1;
        await this.moveCursor(n, 0);
        break;

      case 'D': // Move cursor to the left
        n = parseInt(this.escapeNumber) || 1;
        await this.moveCursor(-n, 0);
        break;

      case 'G': // Move cursor to column
        n = parseInt(this.escapeNumber) || 1;
        await this.setCursor({ col: n - 1 });
        break;

      case 'H': // Move cursor to home
        const newCursor = { row: 0, col: 0 };
        if (this.escapeNumber) {
          this.escapeNumber.split(';').forEach((n, i) => {
            if (i === 0) {
              newCursor.row = parseInt(n) - 1;
            } else if (i === 1) {
              newCursor.col = parseInt(n) - 1;
            }
          });
        }
        await this.setCursor(newCursor);
        break;

      case 'J': // Clear screen
        if (this.escapeNumber === '2') {
          await this.clearScreen();
        }
        break;

      case 'K': // Clear current line
        if (this.escapeNumber === '2') {
          await this.clearCurrentLine();
        }
        break;

      case 'P': // Delete characters
        n = parseInt(this.escapeNumber) || 1;
        await this.deleteChar(n);
        break;

      case 'h': // Set mode 
        if (this.escapeNumber === '20') {
          this.lmn = true;
        }
        break;

      case 'l': // Reset mode
        if (this.escapeNumber === '20') {
          this.lmn = false;
        }
        break;
    
      case 's': // Save cursor position
        await this.saveCursor();
        break;

      case 'u': // Restore cursor position
        await this.restoreCursor();
        break;
    
      case '~': // Other commands with numbers
        switch (this.escapeNumber) {
          case '1': // Home key
            await this.setCursor({ col: 0 });
            break;

          case '2': // Insert key
            break;

          case '3': // Delete key
            await this.deleteChar(1);
            break;

          case '4': // End key
            await this.setCursor({ fromLastCol: 0 });
            break;

          case '5': // Page up
            await this.moveCursor(0, -this.pageSize);
            break;

          case '6': // Page down
            await this.moveCursor(0, this.pageSize);
            break;
        }
        
        break;
    }
  }

  async setCursor({ col, row }) {}

  async moveCursor(colDelta, rowDelta) {}

  async putCharInBuffer(char) {}

  async clearScreen() {}

  async clearCurrentLine() {}

  async saveCursor() {}

  async restoreCursor() {}

  async deleteChar(n) {}

  async enter() {}
}