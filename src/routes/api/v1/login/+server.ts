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
        const { token, maxAge } = await authService.login(data.username, data.password);
        cookies.set('token', token, {
            httpOnly: true,
            secure: import.meta.env.PROD,
            sameSite: 'lax',
            maxAge,
            path: '/'
        });
        return json({ message: 'api.login.success' });
    }
    catch (e) {
        rethrowAsHttp(e);
    }
}
