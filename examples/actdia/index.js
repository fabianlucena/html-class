import { _, addUrlTranslationsTable } from '@hcc/locale/locale.js';
import '@hcc/actdia-tools/actdia-interactive.js';

addUrlTranslationsTable('/locale', ['es'], { file: import.meta.url });
