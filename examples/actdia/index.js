import { _, loadLocale } from '@hcc/locale/locale.js';
import { getPath } from '@hcc/utils/string.js';
import '@hcc/actdia-tools/actdia-interactive.js';

window.addEventListener('DOMContentLoaded', async () => {
  await loadLocale(getPath(import.meta.url), 'es');
});
