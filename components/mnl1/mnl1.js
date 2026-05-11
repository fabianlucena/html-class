import { importCss } from '../utils/import-css.js';
import Base from '../utils/base.js';
import Score from './score.js';
import * as samples from './samples/piano/piano.js';

importCss('./mnl1.css', import.meta.url);

export default class Mnl1 extends Base {
  #scores = [];
  #defsElement;
  samples = {};

  constructor(options) {
    super();
    this.create(options);
  }

  get defsElement() {
    if (!this.#defsElement) {
      this.#defsElement = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
      this.element.insertBefore(this.#defsElement, this.element.firstChild);
    }
    return this.#defsElement;
  }

  create(options) {
    super.create(options);

    this.clickListener = this.clickHandler.bind(this);

    this.element = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    this.element.setAttribute('viewBox', '0 0 1000 300');
    this.element.setAttribute('width', '100%');
    this.element.setAttribute('height', '100%');
    this.element.addEventListener('click', this.clickListener);

    this.audio = new AudioContext();
  }

  destroy() {
    this.element.removeEventListener('click', this.clickListener);
    super.destroy();
  }

  addSymbol(...symbols) {
    for (const symbol of symbols) {
      const symbolElement = document.createElementNS('http://www.w3.org/2000/svg', 'symbol');
      symbolElement.setAttribute('id', symbol.id);
      if (symbol.viewBox)
        symbolElement.setAttribute('viewBox', symbol.viewBox);
      if (symbol.path)
        symbolElement.innerHTML = `<path d="${symbol.path}"/>`;

      this.defsElement.appendChild(symbolElement);
    }

    return this;
  }

  addSymbolIfNotExists(...symbols) {
    for (const symbol of symbols) {
      if (this.defsElement.querySelector(`#${symbol.id}`))
        continue;

      const symbolElement = document.createElementNS('http://www.w3.org/2000/svg', 'symbol');
      symbolElement.setAttribute('id', symbol.id);
      if (symbol.viewBox)
        symbolElement.setAttribute('viewBox', symbol.viewBox);
      if (symbol.path)
        symbolElement.innerHTML = `<path d="${symbol.path}"/>`;

      this.defsElement.appendChild(symbolElement);
    }

    return this;
  }

  addScore(score) {
    if (!score)
      score = new Score();

    score.parent = this;
    this.#scores.push(score);
    return score;
  }

  update() {
    for (const score of this.#scores) {
      score.update();
    }
  }

  clickHandler(event) {
    const note = event?.target?.getAttribute('note');
    this.play(note);
  }

  async loadSample(note) {
    const response = await fetch(samples[note]);
    const arrayBuffer = await response.arrayBuffer();
    return await this.audio.decodeAudioData(arrayBuffer);
  }

  async play(note) {
    if (!note) {
      return;
    }

    let sample = this.samples[note];
    if (!sample) {
      sample = await this.loadSample(note);
      if (!sample)
        return;

      this.samples[note] = sample;
    }

    if (this.currentPlaySrc) {
      this.currentPlaySrc.stop();
      this.currentPlaySrc = null;
    }

    this.currentPlaySrc = this.audio.createBufferSource();
    this.currentPlaySrc.buffer = sample;
    this.currentPlaySrc.connect(this.audio.destination);
    this.currentPlaySrc.start();
  }
}