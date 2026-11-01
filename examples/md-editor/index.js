import { importCss } from '../../components/utils/import-css.js';
import MDEditor from '../../components/md-editor/md-editor.js';
import { loadLanguage } from '../../components/locale/locale.js';
import { getPath } from '../../components/utils/path.js';
import { setBasePath } from '../../components/router/router.js';

importCss('./style.css', import.meta.url);

setBasePath(getPath(import.meta.url));

document.addEventListener('DOMContentLoaded', async () => {
  await loadLanguage();
  init();
});

function init() {
  const mdEditor = new MDEditor({ element: 'md-editor' });
}