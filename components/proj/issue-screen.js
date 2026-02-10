import Screen from './screen';
import { _ } from '../locale/locale';
import Form from '../form/form';
import Issue from './issue';

export default class IssueScreen extends Screen {
  button = false;

  constructor(options = {}) {
    super();
    this.create(options);
  }

  create(options = {}) {
    if (!this.name && !options.name) {
      this.name = _('Issue');
    }
    
    super.create(options);

    this.element.classList.add('issue-screen');
  }

  render(issue) {
    super.render();

    const form = new Form({
      parent: this.element,
      fields: Issue.items,
      data: issue,
    });
  }
}