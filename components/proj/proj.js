import './proj.css';
import Base from '../utils/base';
import Issue from './issue';
import { addUrlTranslationsTable } from '../locale/locale';
import { navigate, registerRouter } from '../router/router';
import IssueScreen from './issue-screen';

addUrlTranslationsTable('/translations', ['es-AR'], { file: import.meta.url });

export default class Proj extends Base {
  #parent = null;
  #navigator = null;
  #body = null;
  #screens = [];
  #issues = [];

  constructor(options = {}) {
    super();
    this.create(options);
    registerRouter(this.router.bind(this));
  }

  router(path) {
    if (!path) {
      return false;
    }

    const screenMatch = path.match(/^\/screen\/(.+)$/);
    if (screenMatch) {
      const screenId = screenMatch[1];
      if (!screenId || !this.screens.find(s => s.id === screenId)) {
        return false;
      }

      this.screens.forEach(s => s.show(s.id === screenId));
      return true;
    }

    const issueMatch = path.match(/^\/issue\/(.+)$/);
    if (issueMatch) {
      const issueId = issueMatch[1];
      if (!issueId) {
        return false;
      }

      const issue = this.issues.find(i => i.id === issueId);
      if (!issue) {
        return false;
      }

      let issueScreen = this.screens.find(s => s instanceof IssueScreen);
      if (!issueScreen) {
        issueScreen = this.addScreen(new IssueScreen());
      }

      this.screens.forEach(s => s.show(s.id === issueScreen.id));
      issueScreen.render(issue);

      return true;
    }

    return false;
  }

  get parent() {
    return this.#parent;
  }

  set parent(value) {
    if (typeof value === 'string')
      value = document.getElementById(value);

    this.#parent = value;
  }

  get navigator() {
    return this.#navigator;
  }

  get body() {
    return this.#body;
  }

  get screens() {
    return this.#screens;
  }

  get issues() {
    return this.#issues;
  }
  
  create(options = {}) {
    super.create(options);
    if (!this.parent)
      this.parent = document.body;
    
    if (!this.element) {
      this.element = document.createElement('div');
      this.parent.appendChild(this.element);
    }

    this.element.className = 'proj';

    this.#navigator = document.createElement('nav');
    this.navigator.className = 'proj-navigator';
    this.element.appendChild(this.navigator);

    this.#body = document.createElement('div');
    this.body.className = 'proj-body';
    this.element.appendChild(this.body);
  }
  
  addScreen(screen) {
    screen.proj = this;
    this.screens.push(screen);
    this.body.appendChild(screen.element);

    if (screen.button !== false) {
      const button = document.createElement('button');
      button.textContent = screen.name;
      this.navigator.appendChild(button);
      button.addEventListener('click', () => this.showScreen(screen.id));

      if (!this.screens.find(s => s.showed())) {
        this.showScreen(screen.id);
      }
    }
    
    screen.render();

    return screen;
  }
  
  addIssue(issue) {
    if (!(issue instanceof Issue))
      issue = new Issue(issue);

    this.issues.push(issue);

    this.screens.forEach(screen => screen.render(issue));

    return issue;
  }

  showScreen(id) {
    navigate(`/screen/${id}`);
  }
}