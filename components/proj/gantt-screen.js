import Screen from './screen.js';
import { _ } from '../locale/locale.js';

export default class GanttScreen extends Screen {
  constructor(options = {}) {
    super();
    this.create(options);
  }

  create(options = {}) {
    if (!this.name && !options.name) {
      this.name = _('Gantt');
    }
    
    super.create(options);

    this.element.classList.add('gantt-screen');
  }
}