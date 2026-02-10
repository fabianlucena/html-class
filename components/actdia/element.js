import { getPath } from '../utils/path.js';

const registry = {};

export default class Element {
  static registerClass(classInfo) {
    let elementClass = classInfo.elementClass;
    classInfo = { ...classInfo };
    classInfo._label ??= classInfo.classRef._label
      ?? classInfo.classRef.label
      ?? classInfo.classRef.type
      ?? elementClass;

    if (!classInfo.url) {
      throw new Error(`Element class ${elementClass} must have a url.`);
    }

    classInfo.fqcn = classInfo.fqcn ?? classInfo.url + '/' + elementClass;
    if (registry[classInfo.fqcn]) {
      console.warn(`Element class ${classInfo.fqcn} is already registered`);
      console.trace();
    }
    registry[classInfo.fqcn] = classInfo;

    return classInfo;
  }

  static getRegisteredClassesInfo() {
    return Object.values(registry);
  }

  static async importAsync(creationData, ...urls) {
    const result = await Promise.all(urls.map(url => this.importSingleAsync(creationData, url)));
    return result.flat();
  }

  static async importSingleAsync(creationData, url) {
    const module = await import(/* @vite-ignore */ url);
    const items = Object.values(module);
    return (await Promise.all(items.map(item => this.registerModuleItem(creationData, url, item))))
      .flat()
      .filter(item => item);
  }

  static async registerModuleItem(creationData, url, classRef) {
    if (typeof classRef !== 'function') {
      if (Array.isArray(classRef)) {
        return classRef.map(item => this.registerModuleItem(creationData, url, item))
          .flat()
          .filter(item => item);
      }

      return;
    }

    const isClass = /^class\s/.test(Function.prototype.toString.call(classRef));
    if (!isClass) {
      return this.registerModuleItem(creationData, url, await classRef({ ...creationData, baseUrl: getPath(url), url }));
    }
    
    const elementClass = classRef.name;
    const fqcn = url + '/' + elementClass;
    if (registry[fqcn]) {
      return registry[fqcn];
    }
    
    if (classRef.import) {
      let importUrls = Array.isArray(classRef.import) ?
        classRef.import : [ classRef.import ];

      for (let importUrl of importUrls) {
        if (importUrl.startsWith('.'))
          importUrl = getPath(url) + '/' + importUrl;
        
        await this.importAsync(creationData, importUrl);
      }
    }

    return this.registerClass({
      elementClass,
      classRef,
      url,
      fqcn,
    });
  }

  static async importForDataAsync(data) {
    const allData = {};
    Object.assign(allData, ...arguments);
    const fqcn = allData.fqcn ?? allData.url + '/' + allData.elementClass;
    let classRef = registry[fqcn]?.classRef;
    if (!classRef) {
      if (allData.url) {
        await this.importAsync(allData, allData.url);
      }
    }

    return classRef;
  }

  static getElementClassInfo(fqcn) {
    let classInfo = registry[fqcn];
    if (classInfo) {
      return classInfo;
    }
    
    return null;
  }

  static getElementClassRef(fqcn) {
    const classInfo = this.getElementClassInfo(fqcn);
    return classInfo?.classRef;
  }

  static create(data) {
    const allData = {};
    Object.assign(allData, ...arguments);
    allData.fqcn ??= allData.url + '/' + allData.elementClass;
    const classRef = Element.getElementClassRef(allData.fqcn);

    if (!classRef) {
      throw new Error(`Element class ${allData.fqcn} not found`);
    }

    const obj = new classRef();
    obj.init(...arguments);

    return obj;
  }

  static async loadAndCreateAsync(data) {
    await Element.importForDataAsync(...arguments);
    return Element.create(...arguments);
  }

  static getDefaultObject(fqcn) {
    const classInfo = this.getElementClassInfo(fqcn);
    if (!classInfo.defaultItem) {
      classInfo.defaultItem = new classInfo.classRef();
      classInfo.defaultItem.init();
    }

    return classInfo.defaultItem;
  }

  constructor(options) {
    if (arguments.length) {
      this.init(...arguments);
    }
  }

  init(options) {
    for (let argument of arguments) {
      for (let key in argument) {
        if (key === 'classRef') {
          continue;
        }
        
        this[key] = argument[key];
      }
    }
  }

  getFQCN() {
    return this.fqcn ?? (this.url + '/' + this.constructor.name);
  }

  getElementClass() {
    return this.constructor.name;
  }

  isElementClass(elementClass) {
    return elementClass === this.getElementClass();
  }

  getElementClassInfo() {
    return Element.getElementClassInfo(this.getFQCN());
  }

  getElementClassRef() {
    return this.getElementClassInfo()?.classRef;
  }

  getElementClassUrl() {
    return this.getElementClassInfo()?.url;
  }

  getDefaultObject() {
    return Element.getDefaultObject(this.getFQCN());
  }
}