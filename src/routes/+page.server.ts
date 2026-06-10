import { fail } from '@sveltejs/kit';

export const actions = {
    setLanguage: async ({ request, cookies }) => {
        const formData = await request.formData();
        const locale = formData.get('locale')?.toString();

        if (!locale) {
            return fail(400, { message: 'Locale is required' });
        }

        // Save the locale choice to a cookie that expires in 1 year
        cookies.set('lang', locale, {
            path: '/',
            maxAge: 60 * 60 * 24 * 365,
            httpOnly: import.meta.env.PROD,
            sameSite: 'lax'
        });

        return { success: true };
    }
};