import { defaultLocale } from '$lib/i18n';

// Makes the username of the logged-in user available to all pages in the app
export const load = ({ locals, cookies }: any) => {
    return {
        username: (locals.user as any)?.username,
        lang: cookies.get('lang') || defaultLocale
    };
};
