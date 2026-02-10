import { importCss } from '../../components/utils/import-css.js';
import Proj from '../../components/proj/proj.js';
import GanttScreen from '../../components/proj/gantt-screen.js';
import CardsScreen from '../../components/proj/cards-screen.js';
import { loadLanguage } from '../../components/locale/locale.js';

importCss('./style.css', import.meta.url);

document.addEventListener('DOMContentLoaded', async () => {
  await loadLanguage();
  init();
});

function init() {
  const proj = new Proj({ parent: 'app' });
  proj.addScreen(new CardsScreen());
  proj.addScreen(new GanttScreen());

  proj.addIssue({ title: 'Issue 1', description: 'This is the first issue.', labels: ['bug', 'high priority'], dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) });
  proj.addIssue({ title: 'Issue 2', description: 'This is the second issue.' });
}