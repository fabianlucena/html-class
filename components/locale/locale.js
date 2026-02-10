let translations = {};
let language = (navigator.language || navigator.userLanguage || 'en')
  .split('-')[0]
  .toLowerCase();

const onLanguageLoadedCallbacks = [];
const urlTranslationsTables = [];

export function onLanguageLoaded(callback) {
  onLanguageLoadedCallbacks.push(callback);
  if (Object.keys(translations).length) {
    callback();
  }
}

export function addLocaleUrl(url, languages, options = {}) {
  if (options.file) {
    const fileUrl = new URL(options.file);
    const currentDir = fileUrl.pathname.substring(0, fileUrl.pathname.lastIndexOf('/'));
    url = currentDir + url;
  }
  
  urlTranslationsTables.push({ url, languages });
}

export function _f(text, ...args) {
  return format(text, ...args);
}

export function format(text, ...args) {
  const _args = [...args];
  text = text.replace(/%s/g, () => _args.shift());
  return text.replace(/{(\d+)}/g, (match, number) => typeof args[number] !== 'undefined' ? args[number] : match);
}


export function _(text, ...args) {
  if (typeof text !== 'string') {
    return text;
  }
  
  const _format = translations[text] || text;
  return format(_format, ...args);
}

export function addTranslationTranslations(newTranslations) {
  Object.assign(translations, newTranslations);
}

export async function loadLanguage(newLang) {
  if (newLang)
    language = newLang;

  translations = {};
  for (const { url, languages } of urlTranslationsTables) {
    if (!languages.includes(language)) {
      continue;
    }

    try {
      const importUrl = `${url}/${language}.json`;
      const table = (await import(/* @vite-ignore */ importUrl)).default;
      Object.assign(translations, table);
    } catch (error) {
      console.error(`Error loading translations from ${url}/${language}.json:`, error);
    }
  }

  onLanguageLoadedCallbacks.forEach(callback => callback());
}

export function dateTimeSmallFormatNoSeconds(date) {
  const formatted = new Intl.DateTimeFormat(language, {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  })
    .format(date)
    .replace(',', '');

  return formatted;
}

export function toLocalDatetimeInputValue(date) {
  if (!date)
    return '';

  const pad = n => String(n).padStart(2, '0');

  const year = date.getFullYear();
  const month = pad(date.getMonth() + 1);
  const day = pad(date.getDate());
  const hours = pad(date.getHours());
  const minutes = pad(date.getMinutes());

  return `${year}-${month}-${day}T${hours}:${minutes}`;
}