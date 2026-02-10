import { _, addLocaleUrl } from '@hcc/locale/locale.js';
import '@hcc/actdia-tools/actdia-interactive.js';

addLocaleUrl('/locale', ['es'], { file: import.meta.url });
