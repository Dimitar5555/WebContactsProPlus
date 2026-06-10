import { register, init } from 'svelte-i18n';

export const defaultLocale = 'bg';

register('en', () => import('./../locales/en.json'));
register('bg', () => import('./../locales/bg.json'));

init({
    fallbackLocale: defaultLocale
});
