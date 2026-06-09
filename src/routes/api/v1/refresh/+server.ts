import { json, type Cookies } from '@sveltejs/kit';
import { authService } from '$lib/server/services/auth.service';

export async function POST({ cookies }: { cookies: Cookies }) {
    const refreshCookie = cookies.get('refresh');
    if(!refreshCookie) {
        return json({ message: 'api.refresh.missing' }, { status: 401 });
    }

    try {
        const {
            accessToken,
            accessMaxAge,
            refreshToken,
            refreshMaxAge
        } = await authService.consumeRefreshToken(refreshCookie);

        cookies.set('token', accessToken, {
            httpOnly: true,
            secure: import.meta.env.PROD,
            sameSite: 'lax',
            maxAge: accessMaxAge,
            path: '/'
        });
        cookies.set('refresh', refreshToken, {
            httpOnly: true,
            secure: import.meta.env.PROD,
            sameSite: 'lax',
            maxAge: refreshMaxAge,
            path: '/api/v1/refresh'
        });

        return json({ message: 'api.refresh.success' });
    }
    catch {
        cookies.delete('token', { path: '/' });
        cookies.delete('refresh', { path: '/api/v1/refresh' });
        return json({ message: 'api.refresh.invalid' }, { status: 401 });
    }
}
