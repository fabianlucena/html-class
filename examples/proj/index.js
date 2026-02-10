import './style.css';
import Proj from '../../components/proj/proj';
import GanttScreen from '../../components/proj/gantt-screen';
import CardsScreen from '../../components/proj/cards-screen';
import { loadLanguage } from '../../components/locale/locale';

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