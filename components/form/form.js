import './form.css';
import Dialog, { ConfirmDialog } from '../dialog/dialog.js';
import { _ } from '../locale/locale.js';

export default class Form extends Dialog {
  create(options) {
    super.create(...arguments);
    this.inputHandlerBinded = this.inputHandler.bind(this);
    this.contentElement.addEventListener('input', this.inputHandlerBinded);
  }

  destroy() {
    this.contentElement.removeEventListener('input', this.inputHandlerBinded);
    super.destroy();
  }

  show(options) {
    if (!this.formDefinition) {
      this.showError(_('No form definition available.'));
      return;
    }

    const html = this.formDefinition
      .map(field => this.getFieldHtml(field))
      .join('');

    super.show({
      header: options.header || _('Form'),
      content: `<form class="form">${html}</form>`,
      ...options,
      okButton: _('Save'),
      cancelButton: true,
      closeButton: false,
    });
  }

  getValue(field) {
  }

  setValue(field, value) {
  }

  getFieldHtml(field) {
    if (!field.label && field._label)
      field.label = _(field._label);

    field.id ??= field.name ?? crypto.randomUUID();
    field.previousValue = this.getValue(field);

    let fieldHtml = '';

    if (field.nullable)
      fieldHtml = `<input type="checkbox" id="${field.id}_nullifier" name="${field.name}_nullifier" ${this.getValue(field) ? 'checked' : ''} style="flex: 0">`;

    const tag = field.tag?.toLowerCase() || 'input',
      type = field.type?.toLowerCase() || 'text',
      value = this.getValue(field);

    if (tag === 'textarea' || type === 'textarea') {
      fieldHtml += `<textarea
          id="${field.id}"
          name="${field.name}"
          ${field.readOnly ? 'readonly' : ''}
          ${field.disabled ? 'disabled="disabled"' : ''} 
        >${value || ''}</textarea>`;
    } else if (tag === 'select' || type === 'select') {
      fieldHtml += `<select
          id="${field.id}"
          name="${field.name}"
          ${field.readOnly ? 'readonly' : ''}
          ${field.disabled ? 'disabled="disabled"' : ''} 
        >`;
      field.options?.forEach(option => {
        let thisValue, label, attr = '';
        if (typeof option === 'object') {
          thisValue = option.value;
          label = option.label ?? _(option._label || option.value);
          if (option.style) attr += ` style="${option.style}"`;
          if (option.title) attr += ` title="${option.title}"`;
        } else {
          thisValue = option;
          label = _(option);
        }

        fieldHtml += `<option value="${thisValue}" ${value == thisValue ? 'selected="selected"' : ''}${attr}>${label}</option>`;
      });
      fieldHtml += `</select>`;
    } else if (tag === 'list' || type === 'list') {
      fieldHtml += `<ul>
        ${(Array.isArray(value) ? value : []).map((_, index) => `
          <li>
            ${this.getFieldHtml({ name: `${field.name}[${index}]`, ...field.item })}
          </li>
        `).join('')}
        </ul>`;
    } else {
      fieldHtml += `<${tag}
          id="${field.id}"
          name="${field.name}"
          type="${type || 'text'}"
          ${(type === 'checkbox' && value) ? 'checked="checked"' : ''}
          ${typeof field.min !== 'undefined' ? `min="${field.min}"` : ''}
          ${typeof field.max !== 'undefined' ? `max="${field.max}"` : ''}
          ${typeof field.step !== 'undefined' ? `step="${field.step}"` : ''}
          ${field.readOnly ? 'readonly' : ''}
          ${field.disabled ? 'disabled="disabled"' : ''} 
          value="${value || ''}"
        >`;
    }

    if (field.label) {
      fieldHtml = `<label for="${field.id}">${field.label}:</label>
        <span class="field ${field.className ?? ''}">${fieldHtml}</span>`;
    }
    
    if (field.options?.length && (tag !== 'select' && type !== 'select')) {
      fieldHtml += `<div class="options" data-name="${field.name}">`
          + field.options.map(option =>
            `<span
              class="option"
              title="${option.title || ''}"
              data-value="${option.value}"
            >
              ${option.label || option.value}
            </span>`
          ).join('')
        + '</div>';
    }

    return fieldHtml;
  }

  keydownHandler(evt) {
    evt.stopPropagation();
    super.keydownHandler(evt);
  }

  inputHandler(evt) {
    evt.stopPropagation();
    evt.preventDefault();

    const name = evt.target.name;
    let field = this.formDefinition.find(f => f.name === name);
    let value;
    if (field) {
      value = evt.target.type === 'checkbox' ?
        evt.target.checked :
        evt.target.value;

      if (field.nullable) {
        const nullifier = this.element.querySelector('#' + field.id.replace('.', '\\.') + '_nullifier');
        if (nullifier && !nullifier.checked) {
          nullifier.checked = true;
        }
      }
    } else {
      field = this.formDefinition.find(f => (f.name + '_nullifier') === name);
      if (!field) {
        return;
      }

      if (evt.target.checked) {
        var element = this.element.querySelector('#' + field.id.replace('.', '\\.'));
        value = element.type === 'checkbox' ?
          element.checked :
          element.value;
      } else {
        value = undefined;
      }
    }

    this.setValue(field, value);
  }

  clickHandler(evt) {
    const optionElement = evt.target.closest('.option');
    const value = optionElement?.dataset?.value;
    if (typeof value !== 'undefined') {
      const optionsElement = optionElement.closest('.options');
      const name = optionsElement?.dataset?.name;
      if (typeof name !== 'undefined') {
        const field = this.formDefinition.find(f => f.name === name);
        this.setValue(field, value);
        evt.preventDefault();
      }
    }

    super.clickHandler(evt);
  }

  okHandler(evt) {
    const formData = new FormData(this.element.querySelector('form'));
    let value;
    this.formDefinition?.forEach(field => {
      if (field.disabled || field.readOnly)
        return;

      if (field.nullable && formData.get(field.name + '_nullifier') !== 'on') {
        value = undefined;
      } else {
        value = formData.get(field.name);
      }

      this.setValue(field, value);
    });

    super.okHandler(evt);
  }

  cancelHandler(evt) {
    evt.stopPropagation();
    evt.preventDefault();
    
    new ConfirmDialog({
      container: this.container,
      onYes: () => {
        this.formDefinition.forEach(field => this.setValue(field, field.previousValue));
        this.forceClose();
      },
      onClosed: () => this.element?.focus(),
    });
  }
}