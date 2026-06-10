import { json } from '@sveltejs/kit';
import { authService } from '$lib/server/services/auth.service';
import { rethrowAsHttp } from '$lib/server/errors';

export async function POST({ request }: { request: Request }) {
    const data: { username?: string; email?: string; password?: string } = await request.json();
    try {
        await authService.register(data);
        return json({ message: 'api.register.success' }, { status: 201 });
    }
    catch (e) {
        rethrowAsHttp(e);
    }
}
