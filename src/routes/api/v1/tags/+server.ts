import { json } from '@sveltejs/kit';
import { getAuthenticatedUser } from '$lib/server/auth';
import { tagService } from '$lib/server/services/tag.service';
import { rethrowAsHttp } from '$lib/server/errors';

export async function GET({ locals }) {
    const user = getAuthenticatedUser(locals);
    try {
        const tags = await tagService.listForUser(user.id);
        return json({ tags }, { status: 200 });
    }
    catch (e) {
        rethrowAsHttp(e);
    }
}

export async function POST({ request, locals }) {
    const user = getAuthenticatedUser(locals);
    const body = await request.json();
    try {
        const tag = await tagService.create(user.id, body);
        return json({ message: 'api.tags.create.success', tag }, { status: 201 });
    }
    catch (e) {
        rethrowAsHttp(e);
    }
}
