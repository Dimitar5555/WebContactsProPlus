import { json } from '@sveltejs/kit';
import { rethrowAsHttp } from '$lib/server/errors';
import { getAuthenticatedUser } from '$lib/server/auth';
import { tagService } from '$lib/server/services/tag.service';


export async function PUT({ params, request, locals }) {
    const user = getAuthenticatedUser(locals);
    const body = await request.json();
    try {
        const tag = await tagService.rename(Number(params.id), user.id, body);
        return json({ message: 'api.tags.update.success', tag }, { status: 200 });
    }
    catch (e) {
        rethrowAsHttp(e);
    }
}

export async function DELETE({ params, locals }) {
    const user = getAuthenticatedUser(locals);
    try {
        await tagService.delete(Number(params.id), user.id);
        return json({ message: 'api.tags.delete.success' }, { status: 200 });
    }
    catch (e) {
        rethrowAsHttp(e);
    }
}
