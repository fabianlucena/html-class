import { importCss } from '../utils/import-css.js';
import { _, addLocaleUrl } from '../locale/locale.js';
import Base from '../utils/base.js';
import { getValueByPath, setValueByPath, deletePropertyByPath } from '../utils/object.js';
import { newId } from '../utils/id.js';
import Dialog from '../dialog/dialog.js';

importCss('./form.css', import.meta.url);
addLocaleUrl('/locale', ['es'], { file: import.meta.url });

export default class Form extends Base {
  #messageDialog;

  constructor(options = {}) {
    super();
    this.create(options);
  }

  get messageDialog() {
    if (!this.#messageDialog) {
      this.#messageDialog = new Dialog({ container: this.container });
    }
    return this.#messageDialog;
  }
  
  create(options) {
    super.create(options);

    if (!this.element) {
      this.element = document.createElement('form');
    }
    this.element.className = 'form';

    this.inputHandlerBinded = this.inputHandler.bind(this);
    this.element.addEventListener('input', this.inputHandlerBinded);

    if (this.parent) {
      this.parent.appendChild(this.element);
      if (this.fields?.length)
        this.render();
    }
  }

  destroy() {
    this.element.removeEventListener('input', this.inputHandlerBinded);
  }

  render(options) {
    Object.assign(this, options);

    if (!this.fields?.length) {
      console.log(this.fields);
      this.messageDialog.show(_('No form definition available.'));
      return;
    }

    const html = this.fields
      .map(field => this.getFieldHtml(field))
      .join('');

    if (options.parent)
      this.parent.appendChild(this.element);

    this.element.innerHTML = html;
  }

  getValue(field) {
    if (field.get)
      return field.get();

    if (!this.data)
      return;

    if (!field.name)
      return;

    return getValueByPath(this.data, field.name);
  }

  setValue(field, value) {
    if (field.set)
      return field.set(value);

    if (!this.data)
      return;

    if (typeof value === 'undefined') {
      deletePropertyByPath(this.data, field.name);
      return;
    }

    if (field.type === 'number') {
      setValueByPath(this.data, field.name, value ? parseFloat(value) : null);
      return;
    }
    
    if (field.type === 'text' && field.name === 'style.dash') {
      value = value? value
        .split(/[, ]/)
        .map(v => parseFloat(v.trim()))
        .filter(v => !isNaN(v)) : [];

      setValueByPath(this.data, field.name, value);
    }

    setValueByPath(this.data, field.name, value);
  }

  getFieldHtml(field) {
    if (!field.label && field._label)
      field.label = _(field._label);

    field.id ??= field.name ?? newId();
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
          class="field-control field-control-textarea ${field.className ?? ''}"
          ${field.readOnly ? 'readonly' : ''}
          ${field.disabled ? 'disabled="disabled"' : ''} 
        >${value || ''}</textarea>`;
    } else if (tag === 'select' || type === 'select') {
      fieldHtml += `<select
          id="${field.id}"
          name="${field.name}"
          class="field-control field-control-select ${field.className ?? ''}"
          ${field.readOnly ? 'readonly' : ''}
          ${field.disabled ? 'disabled="disabled"' : ''} 
        >`;
      let options;
      if (Array.isArray(field.options)) {
        options = field.options;
      } else if (typeof field.options === 'function') {
        options = field.options();
      } else {
        fieldHtml += `<option selected="selected">${_('Error in options definition')}</option>`;
      }

      options?.forEach(option => {
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
      fieldHtml += `<ul class="field-control field-control-list ${field.className ?? ''}">
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
          class="field-control field-control-input ${field.className ?? ''}"
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
    
    if (field.options?.length && (tag !== 'select' && type !== 'select')) {
      fieldHtml += `<div class="field-options fields-options-select ${field.className ?? ''}" data-name="${field.name}">`
          + field.options.map(option =>
            `<span
              class="field-option"
              title="${option.title || ''}"
              data-value="${option.value}"
            >
              ${option.label || option.value}
            </span>`
          ).join('')
        + '</div>';
    }

    if (field.label) {
      fieldHtml = `<div class="field"><label for="${field.id}">${field.label}:</label>
        <span class="field-label ${field.className ?? ''}">${fieldHtml}</span></div>`;
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
    let field = this.fields.find(f => f.name === name);
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
      field = this.fields.find(f => (f.name + '_nullifier') === name);
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
        const field = this.fields.find(f => f.name === name);
        this.setValue(field, value);
        evt.preventDefault();
      }
    }

    super.clickHandler(evt);
  }

  okHandler(evt) {
    const formData = new FormData(this.element.querySelector('form'));
    let value;
    this.fields?.forEach(field => {
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
        this.fields.forEach(field => this.setValue(field, field.previousValue));
        this.forceClose();
      },
      onClosed: () => this.element?.focus(),
    });
  }
}