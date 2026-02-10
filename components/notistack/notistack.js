import { importCss } from '../utils/import-css.js';

importCss('./notistack.css', import.meta.url);

export let container;

window.addEventListener('DOMContentLoaded', createNotificationContainer);

export function createNotificationContainer(options = {}) {
  if (!container) {
    container = document.getElementById('notistack-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'notistack-container';
      container.className = 'notistack-container';
      options.style && (container.style = options.style);
      document.body.appendChild(container);
    }
  }

  return container;
}

export function pushNotification(message, options = {}) {
  if (typeof options === 'string') {
    options = { variant: options };
  }

  const variant = options.variant;
  switch (variant) {
    case 'warning':
      console.warn(message);
      break;

    case 'error':
      console.error(message);
      break;

    case 'info':
      console.info(message);
      break;

    case 'debug':
      console.debug(message);
      break;

    case 'success':
    default:
      console.log(message);
  }
  
  const notification = document.createElement('div');
  notification.classList.add('notification');
  options.className && notification.classList.add(options.className);
  options.classList?.length && notification.classList.add(...options.classList);
  variant && notification.classList.add(variant);
  options.style && (notification.style = options.style);
  notification.innerText = message;

  notification.addEventListener('click', () => notification.remove());
  setTimeout(() => notification.remove(), options.duration || 5000);

  container.appendChild(notification);
}

