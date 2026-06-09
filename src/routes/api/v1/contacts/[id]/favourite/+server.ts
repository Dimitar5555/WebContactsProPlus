import { json } from '@sveltejs/kit';
import { contactService } from '$lib/server/services/contact.service';
import { getAuthenticatedUser } from '$lib/server/auth';
import { rethrowAsHttp } from '$lib/server/errors';

export async function PATCH({ locals, params }) {
    const user = getAuthenticatedUser(locals);
    try {
        const { oldState, newState, messageKey } =
            await contactService.toggleFavourite(Number(params.id), user.id);
        return json({ oldState, newState, message: messageKey }, { status: 200 });
    }
    catch (e) {
        rethrowAsHttp(e);
    }
}
