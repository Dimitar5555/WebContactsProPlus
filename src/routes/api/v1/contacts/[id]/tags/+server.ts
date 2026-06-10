import { json } from '@sveltejs/kit';
import { rethrowAsHttp } from '$lib/server/errors';
import { getAuthenticatedUser } from '$lib/server/auth';
import { tagService } from '$lib/server/services/tag.service';

export async function GET({ params, locals }) {
    const user = getAuthenticatedUser(locals);
    try {
        const tags = await tagService.listForContact(Number(params.id), user.id);
        return json({ tags }, { status: 200 });
    }
    catch (e) {
        rethrowAsHttp(e);
    }
}

export async function PUT({ params, request, locals }) {
    const user = getAuthenticatedUser(locals);
    const body = await request.json();
    try {
        await tagService.replaceForContact(Number(params.id), user.id, body.tagIds ?? []);
        return json({ message: 'api.contact_tags.update.success' }, { status: 200 });
    }
    catch (e) {
        rethrowAsHttp(e);
    }
}
