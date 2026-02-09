import './dialog.css';
import { _ } from '../actdia/locale.js';

export default class Dialog {
  onClose = null;
  onOk = null;
  onCancel = null;
  onNo = null;
  onYes = null;
  destroyOnClose = true;
  confirmToClose = false;
  onClosed = null;

  constructor(options) {
    this.create(...arguments);
  }

  create(options) {
    Object.assign(this, ...arguments);

    if (!this.element) {
      this.element = document.createElement('div');
      this.element.classList.add('dialog', 'draggable', ...(this.classList ?? []), this.className);
      this.element.style.display = 'flex';
      this.element.style.position = 'fixed';
      this.element.style.flexDirection = 'column';
      this.element.tabIndex = 0;
      this.element.innerHTML = 
        `<div class="header">
          <div class="header-text"></div>
          <button type="button" class="close">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="18" height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="3"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
        <div class="content"></div>
        <div class="footer">
          <div class="actions">
            <button type="button" class="ok">${_('OK')}</button>
            <button type="button" class="yes">${_('Yes')}</button>
            <button type="button" class="no">${_('No')}</button>
            <button type="button" class="cancel">${_('Cancel')}</button>
            <button type="button" class="close">${_('Close')}</button>
          </div>
        </div>`;
    }

    this.headerElement = this.element.querySelector('.header');
    this.headerTextElement = this.element.querySelector('.header-text');
    this.contentElement = this.element.querySelector('.content');
    this.footerElement = this.element.querySelector('.footer');

    this.headerCloseButtonElement = this.headerElement.querySelector('.close');
    this.closeButtonElement = this.footerElement.querySelector('.close');
    this.okButtonElement = this.footerElement.querySelector('.ok');
    this.cancelButtonElement = this.footerElement.querySelector('.cancel');
    this.yesButtonElement = this.footerElement.querySelector('.yes');
    this.noButtonElement = this.footerElement.querySelector('.no');

    this.keydownHandlerBinded = this.keydownHandler.bind(this);
    this.clickHandlerBinded = this.clickHandler.bind(this);

    this.element.addEventListener('keydown', this.keydownHandlerBinded);
    this.element.addEventListener('click', this.clickHandlerBinded);

    if (this.content) {
      this.show(...arguments);
    }
  }

  destroy() {
    this.element.removeEventListener('keydown', this.keydownHandlerBinded);
    this.element.removeEventListener('click', this.clickHandlerBinded);

    this.headerElement = null;
    this.headerTextElement = null;
    this.contentElement = null;
    this.footerElement = null;

    this.headerCloseButtonElement = null;
    this.closeButtonElement = null;
    this.okButtonElement = null;
    this.cancelButtonElement = null;
    this.yesButtonElement = null;
    this.noButtonElement = null;

    this.element.remove();
    this.element = null;
  }

  show(content, options) {
    options ??= {};
    Object.assign(options, [...arguments].slice(2));

    if (typeof content === 'object' && content !== null) {
      options = { ...content, ...options };
    } else {
      options.content = content;
    }

    Object.assign(this, options);

    if (!this.element)
      this.create();
    
    if (!this.element.parentNode || options.container) {
      this.container ??= document.body;
      this.container.appendChild(this.element);
    }

    this.headerTextElement.innerHTML = this.header;

    if (typeof this.content !== 'undefined')
      this.contentElement.innerHTML = this.content;

    this.element.className = 'dialog draggable';
    if (this.className) {
      this.element.classList.add(this.className);
    }

    if (this.closeButton && (!this.cancelButton && !this.noButton)) {
      this.closeButtonElement.style.display = '';
      this.closeButtonElement.innerHTML = 
        typeof this.closeButton === 'string' ? this.closeButton : _('Close');
    } else {
      this.closeButtonElement.style.display = 'none';
    }

    if (this.headerCloseButton !== false) {
      this.headerCloseButtonElement.style.display = '';
    } else {
      this.headerCloseButtonElement.style.display = 'none';
    }

    if (this.okButton || this.onOk) {
      this.okButtonElement.style.display = '';
      this.okButtonElement.innerHTML = 
        typeof this.okButton === 'string' ? this.okButton : _('OK');
    } else {
      this.okButtonElement.style.display = 'none';      
    }

    if (this.cancelButton || this.onCancel) {
      this.cancelButtonElement.style.display = '';
      this.cancelButtonElement.innerHTML = 
        typeof this.cancelButton === 'string' ? this.cancelButton : _('Cancel');
    } else {
      this.cancelButtonElement.style.display = 'none';
    }

    if (this.yesButton || this.onYes) {
      this.yesButtonElement.style.display = '';
      this.yesButtonElement.innerHTML =
        typeof this.yesButton === 'string' ? this.yesButton : _('Yes');
    } else {
      this.yesButtonElement.style.display = 'none';
    }

    if (this.noButton || this.onNo) {
      this.noButtonElement.style.display = '';
      this.noButtonElement.innerHTML =
        typeof this.noButton === 'string' ? this.noButton : _('No');
    } else {
      this.noButtonElement.style.display = 'none';
    }

    this.element.style.display = 'flex';

    if (typeof this.width !== 'undefined')
      this.element.style.width = this.width;
    else {
      this.element.style.width = '';
      const maxWidth = document.body.clientWidth * .8;
      if (this.element.offsetWidth > maxWidth)
        this.element.style.width = maxWidth + 'px';
    }

    if (typeof this.height !== 'undefined')
      this.element.style.height = this.height;
    else {
      this.element.style.height = '';
      const maxHeight = document.body.clientHeight * .8;
      if (this.element.offsetHeight > maxHeight)
        this.element.style.height = maxHeight + 'px';
    }

    this.updatePosition();

    this.element.focus();
  }

  updatePosition() {
    const maxLeft = document.body.clientWidth - this.element.offsetWidth;
    let left = this.x;
    if (isNaN(left))
      left = maxLeft / 2;

    left = Math.max(0, Math.min(maxLeft, left));
    this.element.style.left = left + 'px';

    const maxTop = document.body.clientHeight - this.element.scrollHeight;
    let top = this.y;
    if (isNaN(top))
      top = maxTop / 2;

    top = Math.max(0, Math.min(maxTop, top));
    this.element.style.top = top  + 'px';
  }

  showError(content, options) {
    this.show(
      content,
      {
        className: 'error',
        header: _('Error'),
        okButton: false,
        cancelButton: false,
      }
    );
  }
  
  close() {
    if (this.confirmToClose) {
      new ConfirmDialog({
        container: this.container,
        onYes: () => this.forceClose(),
        onClosed: () => this.element?.focus(),
      });
    } else {
      this.forceClose();
    }
  }

  forceClose() {
    this.element.style.display = 'none';
    this.container.focus();
    if (this.destroyOnClose) {
      this.destroy();
    }

    this.onClosed
      && this.onClosed();
  }

  keydownHandler(evt) {
    if (evt.key === 'Escape') {
      if (this.cancelButtonElement.style.display !== 'none') {
        this.cancelHandler(evt);
        evt.preventDefault();
        evt.stopPropagation();
        return;
      }

      if (this.noButtonElement.style.display !== 'none') {
        this.noHandler(evt);
        evt.preventDefault();
        evt.stopPropagation();
        return;
      }

      if (this.closeButtonElement.style.display !== 'none') {
        this.closeHandler(evt);
        evt.preventDefault();
        evt.stopPropagation();
        return;
      }
    }

    if (evt.key === 'Enter') {
      if (this.okButtonElement.style.display !== 'none') {
        this.okHandler(evt);
        evt.preventDefault();
        evt.stopPropagation();
        return;
      }

      if (this.yesButtonElement.style.display !== 'none') {
        this.yesHandler(evt);
        evt.preventDefault();
        evt.stopPropagation();
        return;
      }
    }
  }

  clickHandler(evt) {
    if (this.onClick
      && this.onClick(evt)
      && evt.defaultPrevented
    )
      return;

    const target = evt.target;
    if (target.closest('.ok')) {
      this.okHandler(evt);
      return;
    }

    if (target.closest('.cancel')) {
      this.cancelHandler(evt);
      return;
    }

    if (target.closest('.close')) {
      this.closeHandler(evt);
      return;
    }

    if (target.closest('.yes')) {
      this.yesHandler(evt);
      return;
    }

    if (target.closest('.no')) {
      this.noHandler(evt);
      return;
    }
  }

  closeHandler(evt) {
    if (this.onClose
      && this.onClose()
      && evt.defaultPrevented
    )
      return;

    evt.preventDefault();
    this.close();
  }

  okHandler(evt) {
    if (this.onOk
      && this.onOk()
      && evt.defaultPrevented
    )
      return;

    evt.preventDefault();
    this.close();
  }

  cancelHandler(evt) {
    if (this.onCancel
      && this.onCancel()
      && evt.defaultPrevented
    )
      return;

    evt.preventDefault();
    this.close();
  }
  
  yesHandler(evt) {
    if (this.onYes
      && this.onYes()
      && evt.defaultPrevented
    )
      return;

    evt.preventDefault();
    this.close();
  }

  noHandler(evt) {
    if (this.onNo
      && this.onNo()
      && evt.defaultPrevented
    )
      return;

    evt.preventDefault();
    this.close();
  }
}

export class ConfirmDialog extends Dialog {
  confirmToClose = false;

  content = _('Are you sure you want to close this dialog? Unsaved changes will be lost.');
  header = _('Confirm Close');

  yesButton = true;
  noButton = true;

  constructor(options) {
    super();
    this.create(...arguments);
  }
}