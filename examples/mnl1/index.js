import { importCss } from '../../components/utils/import-css.js';
import { loadLanguage } from '../../components/locale/locale.js';
import Mnl1 from '../../components/mnl1/mnl1.js';
import Clef from '../../components/mnl1/clef.js';
import Note from '../../components/mnl1/note.js';

importCss('./style.css', import.meta.url);

document.addEventListener('DOMContentLoaded', async () => {
  await loadLanguage();
  init();
});

function init() {
  const mnl1 = new Mnl1({ parent: 'mnl1' });
  const score = mnl1.addScore();
  const staff = score.addStaff();

  staff.addItem(new Clef('G'));
  /*staff.addItem(new Note('a'));
  staff.addItem(new Note('b'));
  staff.addItem(new Note('c'));
  staff.addItem(new Note('d'));
  staff.addItem(new Note('e'));
  staff.addItem(new Note('f'));*/
  //staff.addItem(new Note('g'));
  //staff.addItem(new Note('a'));
  /*staff.addItem(new Note({ note: 'b', octave: 5 }));
  staff.addItem(new Note({ note: 'f', octave: 2 }));
  staff.addItem(new Note({ note: 'c', octave: 5 }));
  staff.addItem(new Note({ note: 'g', octave: 2 }));*/
  staff.addItem(new Note({ rest: true, value: 'w' }));
  staff.addItem(new Note({ rest: true, value: 'h' }));
  staff.addItem(new Note({ rest: true, value: 'q' }));
  staff.addItem(new Note({ rest: true, value: 'e' }));
  staff.addItem(new Note({ rest: true, value: 's' }));
  staff.addItem(new Note({ rest: true, value: 't' }));
  staff.addItem(new Note({ rest: true, value: 'i' }));
  /*staff.addItem(new Note('c'));
  staff.addItem(new Note('d'));
  staff.addItem(new Note('e'));
  staff.addItem(new Note('f'));
  staff.addItem(new Note('g'));*/

  /*staff.addItem(new Clef('F'));
  staff.addItem(new Note('a'));
  staff.addItem(new Note('b'));
  staff.addItem(new Note('c'));
  staff.addItem(new Note('d'));
  staff.addItem(new Note('e'));
  staff.addItem(new Note('f'));
  staff.addItem(new Note('g'));

  staff.addItem(new Clef('C'));
  staff.addItem(new Note('a'));
  staff.addItem(new Note('b'));
  staff.addItem(new Note('c'));
  staff.addItem(new Note('d'));
  staff.addItem(new Note('e'));
  staff.addItem(new Note('f'));
  staff.addItem(new Note('g'));*/

  mnl1.update();
}