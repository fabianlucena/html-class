import './cards-screen.css';
import Screen from './screen';
import Issue from './issue';
import { _ } from '../locale/locale';
import { navigate } from '../router/router';

export default class CardsScreen extends Screen {
  #issuesElement = null;

  constructor(options = {}) {
    super();
    this.create(options);
  }

  get issuesElement() {
    return this.#issuesElement;
  }

  create(options = {}) {
    if (!this.name && !options.name) {
      this.name = _('Cards');
    }

    super.create(options);

    this.element.classList.add('cards-screen');

    if (!this.issuesElement) {
      this.#issuesElement = document.createElement('ul');
      this.element.appendChild(this.issuesElement);
    }

    this.issuesElement.className = 'cards-screen-issues';
    this.issuesElement.addEventListener('click', e => {
      e.stopPropagation();
      e.preventDefault();
      const button = e.target.closest('button[data-link]');
      if (button) {
        const issueId = button.getAttribute('data-link').split('/')[1];
        navigate(`/issue/${issueId}`);
      }
    });
  }

  formatLabels(labels) {
    return labels.map(label => `<span class="label">${label}</span>`).join('');
  }

  render() {
    super.render();

    this.issuesElement.innerHTML = '';

    this.proj.issues.forEach(issue => {
      const li = document.createElement('li');
      li.className = 'cards-screen-issue';

      let body = '';
      Issue.fields.forEach(field => {
        if (field.field) {
          let value = issue[field.field];
          if (value) {
            if (field.formater) {
              value = field.formater(value);
            } else if (value instanceof Date) {
              value = value.toLocaleString();
            } else {
              value = String(value);
            }
          } else {
            if (field.showAlways === false) {
              return;
            }

            value = field.defaultValue || '';
          }

          body += `<div class="${field.field}" title="${field.description}"><strong>${field.label}:</strong> ${value}</div>`;
        } else if (field.type === 'button') {
          body += `<button class="edit-issue" data-link="issue/${issue.id}">${field.label}</button>`;
        }
      });
      li.innerHTML = body;
      this.issuesElement.appendChild(li);
    });
  }
}