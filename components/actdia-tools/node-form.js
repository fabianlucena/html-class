import FormDialog from '../form-dialog/form-dialog.js';
import { isNode } from '../actdia/type.js';
import { _ } from '../locale/locale.js';
import { getValueByPath, setValueByPath, deletePropertyByPath } from '../utils/object.js';

export default class NodeForm extends FormDialog {
  constructor(options = {}) {
    super(options);
    this.form.afterSetValue ??= this.afterSetValue.bind(this);
  }

  showForNode(node, options) {
    if (!isNode(node)) {
      this.node = null;
      this.messageDialog.show(_('The provided object is not a Node.'));
      return;
    }

    this.node = node;
    this.form.data = node;
    this.updateFields();
    options.header ??= _('Node properties');
    
    super.show(options);
  }

  updateFields() {
    this.form.fields = this.node.getFields?.() || [];
  }

  afterSetValue(field, value, name) {
    this.node.update();
  }
}