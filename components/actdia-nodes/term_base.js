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

  recv(data) {
    let result = '';
    for (let i = 0, l = data?.length; i < l; i++) {
      result += this.recvChar(data[i]) ?? '';
    }

    return result;
  }

  recvChar(char) {
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
          this.execEscapeSequence();
          this.escapeSequence = '';
        }
      }

      return;
    }

    switch (char) {
      case '\n':
        this.enter();
        this.moveCursor(0, 1);
        if (this.lmn) {
          this.setCursor({ col: 0 });
        }
        break;

      case '\r':
        this.setCursor({ col: 0 });
        break;

      case '\b':
        this.moveCursor(-1, 0);
        this.deleteChar(1);
        break;

      case '\t':
        this.moveCursor(this.tabSize - (this.pos % this.tabSize), 0);
        break;

      case '\x1B':
        this.escapeSequence = char;
        break;

      default:
        if (char < ' ') {
          return this.controlChar(char);
        }
        
        this.putCharInBuffer(char);
        return char;
    }
  }

  execEscapeSequence() {
    let n;
    switch (this.escapeCommand) {
      case 'A': // Move cursor up
        n = parseInt(this.escapeNumber) || 1;
        this.moveCursor(0, -n);
        break;

      case 'B': // Move cursor down
        n = parseInt(this.escapeNumber) || 1;
        this.moveCursor(0, n);
        break;

      case 'C': // Move cursor to the right
        n = parseInt(this.escapeNumber) || 1;
        this.moveCursor(n, 0);
        break;

      case 'D': // Move cursor to the left
        n = parseInt(this.escapeNumber) || 1;
        this.moveCursor(-n, 0);
        break;

      case 'G': // Move cursor to column
        n = parseInt(this.escapeNumber) || 1;
        this.setCursor({ col: n - 1 });
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
        this.setCursor(newCursor);
        break;

      case 'J': // Clear screen
        if (this.escapeNumber === '2') {
          this.clearScreen();
        }
        break;

      case 'K': // Clear current line
        if (this.escapeNumber === '2') {
          this.clearCurrentLine();
        }
        break;

      case 'P': // Delete characters
        n = parseInt(this.escapeNumber) || 1;
        this.deleteChar(n);
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
        this.saveCursor();
        break;

      case 'u': // Restore cursor position
        this.restoreCursor();
        break;
    
      case '~': // Other commands with numbers
        switch (this.escapeNumber) {
          case '1': // Home key
            this.setCursor({ col: 0 });
            break;

          case '2': // Insert key
            break;

          case '3': // Delete key
            this.deleteChar(1);
            break;

          case '4': // End key
            this.setCursor({ fromLastCol: 0 });
            break;

          case '5': // Page up
            this.moveCursor(0, -this.pageSize);
            break;

          case '6': // Page down
            this.moveCursor(0, this.pageSize);
            break;
        }
        
        break;
    }
  }

  controlChar(char) {
  }

  putCharInBuffer(char) {}

  setCursor({ col, row }) {}

  moveCursor(colDelta, rowDelta) {}

  clearScreen() {}

  clearCurrentLine() {}

  saveCursor() {}

  restoreCursor() {}

  deleteChar(n) {}

  enter() {}
}