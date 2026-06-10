import { json } from '@sveltejs/kit';
import { rethrowAsHttp } from '$lib/server/errors';
import { getAuthenticatedUser } from '$lib/server/auth';
import { tagService } from '$lib/server/services/tag.service';

export async function POST({ params, locals }) {
    const user = getAuthenticatedUser(locals);
    try {
        await tagService.addToContact(Number(params.id), user.id, Number(params.tagId));
        return json({ message: 'api.contact_tags.add.success' }, { status: 200 });
    }
    catch (e) {
        rethrowAsHttp(e);
    }
}

export async function DELETE({ params, locals }) {
    const user = getAuthenticatedUser(locals);
    try {
        await tagService.removeFromContact(Number(params.id), user.id, Number(params.tagId));
        return json({ message: 'api.contact_tags.remove.success' }, { status: 200 });
    }
    catch (e) {
        rethrowAsHttp(e);
    }
}
