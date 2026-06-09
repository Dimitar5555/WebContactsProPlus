import { json, error } from '@sveltejs/kit';
import { database } from '$lib/database';
import { getAuthenticatedUser } from '$lib/server/auth.js';
import { deletePhoto } from '$lib/server/photos';

export async function GET({ params, locals }) {
    const user = getAuthenticatedUser(locals);
    const contactId = Number(params.id);

    if(isNaN(contactId)) {
        return error(400, 'api.generic.invalid_id');
    }

    const contact = await database.contacts.findById(contactId);

    if(!contact || contact.user_id !== user.id) {
        return error(404, 'api.generic.not_found');
    }

    return json(contact, { status: 200 });
}

export async function PUT({ params, request, locals }: any) {
    const user = getAuthenticatedUser(locals);
    const contactId = Number(params.id);
    const body: any = await request.json();
    const { first_name, last_name, notes } = body;

    if(isNaN(contactId) || !first_name || !last_name) {
        return error(400, 'api.contacts.missing_fields');
    }

    const contact = await database.contacts.findById(contactId);

    if(!contact || contact.user_id !== user.id) {
        return error(404, 'api.generic.not_found');
    }

    await database.contacts.update(contactId, {
        first_name,
        last_name,
        notes
    });

    const phoneNumbers: any[] =
        await database.phoneNumbers.findByContactId(contactId);
    const existingPhoneNumberIds = phoneNumbers.map((pn: any) => pn.id);
    const incomingPhoneNumberIds = (body.phone_numbers || [])
        .map((pn: any) => pn.id)
        .filter((id: any) => id !== undefined);

    for (const pn of body.phone_numbers || []) {
        const item: any = pn;
        if(item.id && existingPhoneNumberIds.includes(item.id)) {
            await database.phoneNumbers.update(item.id, {
                phone_number: item.phone_number,
                label: item.label
            });
        }
        else {
            await database.phoneNumbers.create({
                contact_id: contactId,
                phone_number: item.phone_number,
                label: item.label
            });
        }
    }

    for (const existingId of existingPhoneNumberIds) {
        if(!incomingPhoneNumberIds.includes(existingId)) {
            await database.phoneNumbers.delete(existingId);
        }
    }

    return json(
        { message: 'api.contacts.update.success' },
        { status: 200 }
    );
}

export async function DELETE({ params, locals }) {
    const user = getAuthenticatedUser(locals);
    const contactId = Number(params.id);

    if(isNaN(contactId)) {
        return error(400, 'api.generic.invalid_id');
    }

    const contact = await database.contacts.findById(contactId);

    if(!contact || contact.user_id !== user.id) {
        return error(404, 'api.generic.not_found');
    }

    if(contact.photo_path) {
        await deletePhoto(contact.photo_path);
    }

    await database.contacts.delete(contactId);

    return json(
        { message: 'api.contacts.delete.success' },
        { status: 200 }
    );
}
