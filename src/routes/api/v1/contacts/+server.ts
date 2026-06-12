import { json } from '@sveltejs/kit';
import { contactService } from '$lib/server/services/contact.service';
import { getAuthenticatedUser } from '$lib/server/auth';
import { rethrowAsHttp } from '$lib/server/errors';

export async function GET({ locals }) {
    const user = getAuthenticatedUser(locals);
    try {
        const contacts = await contactService.listForUser(user.id);
        return json({ contacts }, { status: 200 });
    }
    catch (e) {
        rethrowAsHttp(e);
    }
}

export async function POST({ request, locals }) {
    const user = getAuthenticatedUser(locals);
    const body = await request.formData();
    const photoData = body.get('contact_photo') as Blob | null;
    try {
        const contactId = await contactService.createWithPhoto(user.id, body, photoData);
        return json(
            { message: 'api.contacts.create.success', contactId },
            { status: 201 }
        );
    }
    catch (e) {
        rethrowAsHttp(e);
    }
}
