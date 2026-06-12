import { json } from '@sveltejs/kit';
import { contactService } from '$lib/server/services/contact.service';
import { getAuthenticatedUser } from '$lib/server/auth';
import { rethrowAsHttp } from '$lib/server/errors';

export async function GET({ params, locals }) {
    const user = getAuthenticatedUser(locals);
    try {
        const contact = await contactService.getOwned(Number(params.id), user.id);
        return json(contact, { status: 200 });
    }
    catch (e) {
        rethrowAsHttp(e);
    }
}

export async function PUT({ params, request, locals }: any) {
    const user = getAuthenticatedUser(locals);
    const body = await request.formData();
    try {
        await contactService.update(Number(params.id), user.id, body);
        return json({ message: 'api.contacts.update.success' }, { status: 200 });
    }
    catch (e) {
        rethrowAsHttp(e);
    }
}

export async function DELETE({ params, locals }) {
    const user = getAuthenticatedUser(locals);
    try {
        await contactService.delete(Number(params.id), user.id);
        return json({ message: 'api.contacts.delete.success' }, { status: 200 });
    }
    catch (e) {
        rethrowAsHttp(e);
    }
}
