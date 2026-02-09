import { _, loadLocale } from './actdia/locale.js';
import { getPath } from './actdia/utils.js';
import './src/actdia_interactive.js';

window.addEventListener('DOMContentLoaded', async () => {
  await loadLocale(getPath(import.meta.url), 'es');
});
