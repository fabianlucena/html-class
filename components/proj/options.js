import { _, onLanguageLoaded } from '../locale/locale';

onLanguageLoaded(updateTranslations);

const options = {
  assignees: [
    { value: 'alice', _label: 'Alice' },
    { value: 'bob', _label: 'Bob' },
    { value: 'charlie', _label: 'Charlie' },
  ],
  statuses: [
    { value: 'open', _label: 'Open' },
    { value: 'in_progress', _label: 'In progress' },
    { value: 'closed', _label: 'Closed' },
  ],
  priorities: [
    { value: 'low', _label: 'Low' },
    { value: 'medium', _label: 'Medium' },
    { value: 'high', _label: 'High' },
  ],
  reporters: [
    { value: 'dave', _label: 'Dave' },
    { value: 'eve', _label: 'Eve' },
    { value: 'frank', _label: 'Frank' },
  ],
};

function updateTranslations() {
  for (const optionType in options) {
    for (const option of options[optionType]) {
      option._label = _(option._label);
    }
  }
}

export default function getOptions(type) {
  return options[type] || [];
}