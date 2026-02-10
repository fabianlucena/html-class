import Screen from './screen';
import { _ } from '../locale/locale';
import Form from '../form/form';
import Issue from './issue';

export default class IssueScreen extends Screen {
  button = false;
  #form = null;

  constructor(options = {}) {
    super();
    this.create(options);
  }

  get form() {
    return this.#form;
  }

  create(options = {}) {
    if (!this.name && !options.name) {
      this.name = _('Issue');
    }
    
    super.create(options);

    this.element.classList.add('issue-screen');

    if (!this.#form) {
      this.#form = new Form({
        parent: this.element,
      });
    }
  }

  render(issue) {
    super.render();

    this.form.render({
      fields: Issue.fields,
      data: issue,
    });
  }
}