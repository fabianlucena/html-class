import Form from '../form/form.js';
import Dialog from '../dialog/dialog.js';
import { _, addLocaleUrl } from '../locale/locale.js';

addLocaleUrl('/locale', ['es'], { file: import.meta.url });

export default class FormDialog extends Dialog {
  #form = null;

  constructor(options = {}) {
    super({ skipCreation: true });
    this.create(options);
  }

  get form() {
    return this.#form;
  }

  create(options = {}) {
    super.create(options);

    if (!this.form) {
      this.#form = new Form({
        parent: this.contentElement,
        fields: options.fields,
        data: options.data,
      });
    }
  }

  show(options = {}) {
    const renderOptions = {};
    if (options.fields) {
      renderOptions.fields = options.fields;
    }

    if (options.data) {
      renderOptions.data = options.data;
    }

    console.log(this.fields);
    this.#form.render(renderOptions);

    super.show({
      header: options.header || _('Form'),
      ...options,
      okButton: _('Save'),
      cancelButton: true,
      closeButton: false,
    });
  }
}