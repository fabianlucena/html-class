export default class Mutex {
  constructor() {
    this.lock = Promise.resolve();
  }

  async run(fn) {
    const unlock = this.lock;
    let resolveNext;
    this.lock = new Promise(r => resolveNext = r);
    await unlock;
    try {
      return await fn();
    } finally {
      resolveNext();
    }
  }
}