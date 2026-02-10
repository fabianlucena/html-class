import Form from '../form/form.js';
import Dialog from '../dialog/dialog.js';
import { _, addUrlTranslationsTable } from '../locale/locale.js';

addUrlTranslationsTable('/locale', ['es-AR'], { file: import.meta.url });

export class FormDialog extends Dialog {
  constructor(options = {}) {
    super();
    this.create(options);
  }

  show(options = {}) {
    const form = new Form({
      parent: this.contentElement,
      fields: options.fields,
      data: options.data,
    });

    super.show({
      header: options.header || _('Form'),
      ...options,
      okButton: _('Save'),
      cancelButton: true,
      closeButton: false,
    });
  }
}