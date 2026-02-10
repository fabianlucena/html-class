import Screen from './screen';
import { _ } from '../locale';

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