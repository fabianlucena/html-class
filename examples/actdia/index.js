import './style.css';
import { _, addLocaleUrl } from '../../components/locale/locale.js';
import '../../components/actdia-tools/actdia-interactive.js';

addLocaleUrl('/locale', ['es'], { file: import.meta.url });
