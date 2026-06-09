import { json } from '@sveltejs/kit';
import { authService } from '$lib/server/services/auth.service';

export async function GET({ locals, cookies }) {
    const refreshCookie = cookies.get('refresh');
    if(refreshCookie) {
        try {
            await authService.revokeRefreshToken(refreshCookie);
        }
        catch {
            // best-effort revocation; we still clear the cookies below
        }
    }

    if(locals.user) {
        locals.user = null;
    }
    cookies.delete('token', { path: '/' });
    cookies.delete('refresh', { path: '/api/v1/refresh' });

    return json({ message: 'api.logout.success' }, { status: 200 });
}
