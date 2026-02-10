import FormDialog from '../form-dialog/form-dialog.js';
import { isNode } from '../actdia/type.js';
import { _ } from '../locale/locale.js';
import { getValueByPath, setValueByPath, deletePropertyByPath } from '../utils/object.js';

export default class NodeForm extends FormDialog {
  showForNode(node, options) {
    if (!isNode(node)) {
      this.node = null;
      this.showError(_('The provided object is not a Node.'));
      return;
    }

    this.node = node;
    this.updateFormDefinition();
    options.header ??= _('Node properties');

    super.show(options);
  }

  updateFormDefinition() {
    this.formDefinition = [
      {
        name: 'class',
        _label: 'Class',
        disabled: true,
        get: () => this.node.constructor.name,
      },
      {
        name: 'id',
        _label: 'ID',
        disabled: true,
      },
      {
        name: 'name',
        _label: 'Name',
      },
      {
        name: 'description',
        _label: 'Description',
      },
      {
        name: 'coords',
        _label: 'Coordinates',
        type: 'text',
        get: () => this.node.getCoords(),
        set: (value) => this.node.setCoords(value),
      },
      {
        name: 'rotation',
        _label: 'Rotation',
        type: 'select',
        options: [
          { value: 0, label: '0°' },
          { value: 90, label: '90°' },
          { value: 180, label: '180°' },
          { value: 270, label: '270°' },
        ],
      },
      {
        name: 'reflection',
        _label: 'Reflection',
        type: 'select',
        options: [
          { value: '[ 1,  1]', _label: 'None' },
          { value: '[ 1, -1]', _label: 'Horizontal' },
          { value: '[-1,  1]', _label: 'Vertical' },
          { value: '[-1, -1]', _label: 'Both' },
        ],
      },
      {
        name: 'style.fill',
        type: 'color',
        _label: 'Fill color',
        nullable: true,
      },
      {
        name: 'style.stroke',
        type: 'color',
        _label: 'Stroke color',
        nullable: true,
      },
      {
        name: 'style.strokeWidth',
        type: 'number',
        _label: 'Line width',
        nullable: true,
      },
      {
        name: 'style.dash',
        type: 'text',
        _label: 'Dash',
        nullable: true,
      },
      ...this.node.formDefinition || []
    ];    
  }

  getValue(field) {
    if (field.get)
      return field.get();

    return getValueByPath(this.node, field.name);
  }

  setValue(field, value) {
    if (typeof value === 'undefined') {
      deletePropertyByPath(this.node, field.name);
      return;
    }

    if (field.type === 'number') {
      setValueByPath(this.node, field.name, value ? parseFloat(value) : null);
      return;
    }
    
    if (field.type === 'text' && field.name === 'style.dash') {
      value = value? value
        .split(/[, ]/)
        .map(v => parseFloat(v.trim()))
        .filter(v => !isNaN(v)) : [];

      setValueByPath(this.node, field.name, value);
    }

    setValueByPath(this.node, field.name, value);
    this.node.update();
  }
}