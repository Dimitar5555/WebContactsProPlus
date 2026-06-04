import { json, error } from '@sveltejs/kit';
import { database } from '$lib/database';
import { getAuthenticatedUser } from '$lib/server/auth';

export async function PATCH({ locals, params }) {
    const user = getAuthenticatedUser(locals);
    let newState: boolean;
    let oldState: boolean;
    const contactId = Number(params.id);

    if(isNaN(contactId)) {
        return error(400, 'api.generic.invalid_id');
    }

    const contact = await database.contacts.findById(contactId);

    if(!contact || contact.user_id !== user.id) {
        return error(404, 'api.generic.not_found');
    }
    oldState = Boolean(contact.is_favourite);
    newState = !oldState;

    await database.contacts.toggleFavourite(contactId, newState);
    return json({ oldState, newState, message: newState ? 'api.contacts.favourite.added' : 'api.contacts.favourite.removed' }, { status: 200 });
}
