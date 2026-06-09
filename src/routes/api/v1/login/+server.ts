import { json, type Cookies } from '@sveltejs/kit';
import { authService } from '$lib/server/services/auth.service';
import { rethrowAsHttp } from '$lib/server/errors';

export async function POST({
    request,
    cookies
}: {
    request: Request;
    cookies: Cookies;
}) {
    const data = await request.json();
    try {
        const { token, maxAge, userId } = await authService.login(data.username, data.password);
        cookies.set('token', token, {
            httpOnly: true,
            secure: import.meta.env.PROD,
            sameSite: 'lax',
            maxAge,
            path: '/'
        });

        const { token: refreshToken, maxAge: refreshMaxAge } = await authService.issueRefreshToken(userId);
        cookies.set('refresh', refreshToken, {
            httpOnly: true,
            secure: import.meta.env.PROD,
            sameSite: 'lax',
            maxAge: refreshMaxAge,
            path: '/api/v1/refresh'
        });

        return json({ message: 'api.login.success' });
    }
    catch (e) {
        rethrowAsHttp(e);
    }
}
