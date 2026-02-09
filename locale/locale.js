let l10n = {};
let language;
let locales = {};

export function _(text, ...args) {
  return format(l10n[text] || text, ...args);
}

export function format(formatString, ...args) {
  return formatString.replace(/%s/g, () => args.shift());
}

export function addL10n(newL10n) {
  Object.assign(l10n, newL10n);
}

export async function loadLocale(url, ...languages) {
  if (locales[url])
    return;
  
  if (!language) {
    language = navigator.language || navigator.userLanguage || 'en';
    language = language.toLowerCase().split('-')[0];
  }

  try {
    locales[url] = languages;
    if (languages.includes(language)) {
      const l10n = (await import(`${url}/locale/${language}.js`)).default;
      addL10n(l10n);
    }
  } catch {}
}

export function getLocales() {
  return locales;
}

export async function loadLocales(locales) {
  const promises = [];
  for (let url in locales) {
    promises.push(loadLocale(url, ...locales[url]));
  }

  return Promise.all(promises);
}