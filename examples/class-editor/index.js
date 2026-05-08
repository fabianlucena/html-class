import { importCss } from '../../components/utils/import-css.js';
import ClassEditor from '../../components/class-editor/class-editor.js';
import { loadLanguage } from '../../components/locale/locale.js';
import { getPath } from '../../components/utils/path.js';
import { setBasePath } from '../../components/router/router.js';

importCss('./style.css', import.meta.url);

setBasePath(getPath(import.meta.url));

document.addEventListener('DOMContentLoaded', async () => {
  await loadLanguage();
  //init();
});

function init() {
  const classEditor = new ClassEditor({ element: 'class-editor' });
}