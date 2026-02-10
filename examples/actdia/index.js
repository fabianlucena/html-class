import { importCss } from '../../components/utils/import-css.js';
import { _, addLocaleUrl } from '../../components/locale/locale.js';
import '../../components/actdia-tools/actdia-interactive.js';

importCss('./style.css', import.meta.url);

addLocaleUrl('/locale', ['es'], { file: import.meta.url });
