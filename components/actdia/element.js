import { getPath } from '../utils/path.js';
import { isNumber } from '../utils/number.js';

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
    if (registry[classInfo.fqcn] && !classInfo.ignoreAlreadyRegistered) {
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

  static async getElementsOrImportAsync(creationData, ...urls) {
    const urlToImport = [],
      result = [];

    for (const url of urls) {
      const classRef = this.getElementsClassRefForUrl(url);
      if (classRef.length) {
        result.push(...classRef);
      } else {
        urlToImport.push(url);
      }
    }
    
    result.push(...await Promise.all(urlToImport.map(url => this.importSingleAsync(creationData, url, { ignoreAlreadyRegistered: true }))));

    return result.flat();
  }

  static async importSingleAsync(creationData, url, { ignoreAlreadyRegistered = false } = {}) {
    let items;

    this.importedUrls ??= new Map();
    if (this.importedUrls.has(url)) {
      items = this.importedUrls.get(url);
      if (!isNumber(items)) {
        return this.importedUrls.get(url);
      }
    }
    if (isNumber(items) && items > 10) {
      throw new Error(`Too many import attempts for ${url}`);
    }

    this.importedUrls.set(url, (items ?? 0) + 1);

    const module = await import(/* @vite-ignore */ url);
    items = Object.values(module);
    items = (await Promise.all(items.map(item => this.registerModuleItem(creationData, url, item, { ignoreAlreadyRegistered }))))
      .flat()
      .filter(item => item);
    
    this.importedUrls.set(url, items);
    return items;
  }

  static async registerModuleItem(creationData, url, classRef, { ignoreAlreadyRegistered = false } = {}) {
    if (typeof classRef !== 'function') {
      if (Array.isArray(classRef)) {
        return classRef.map(item => this.registerModuleItem(creationData, url, item, { ignoreAlreadyRegistered }))
          .flat()
          .filter(item => item);
      }

      return;
    }

    const isClass = /^class\s/.test(Function.prototype.toString.call(classRef));
    if (!isClass) {
      return this.registerModuleItem(creationData, url, await classRef({ ...creationData, baseUrl: getPath(url), url }), { ignoreAlreadyRegistered });
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
      ignoreAlreadyRegistered,
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

  static getElementsClassRefForUrl(url) {
    return Object.values(registry)
      .filter(classInfo => classInfo.url === url);
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

  isInitializing = 0;

  constructor(options) {
    for (let argument of arguments) {
      for (let key in argument) {
        if (key === 'classRef') {
          continue;
        }
        
        this[key] = argument[key];
      }
    }
  }

  init(options) {
    if (this.isInitializing <= 0) {
      this.isInitializing = 1;
    } else {
      this.isInitializing++;
    }

    for (let argument of arguments) {
      for (let key in argument) {
        if (key === 'classRef') {
          continue;
        }
        
        this[key] = argument[key];
      }
    }

    if (this.isInitializing <= 0) {
      this.isInitializing = 0;
    } else {
      this.isInitializing--;
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