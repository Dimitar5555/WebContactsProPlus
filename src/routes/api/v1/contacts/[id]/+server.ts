import { json } from '@sveltejs/kit';
import { database } from '$lib/database';
import {$_} from '$lib/server/i18n.js'

export async function GET({ params, locals }) {
    if(!locals.user) {
        return json({ error: $_('api.contacts.unauthorized_user') }, { status: 401 });
    }
    const userId = locals.user.id;
    try {
        const contactId = Number(params.id);

        if (isNaN(contactId)) {
            return json({ error: $_('api.contacts.invalid_id') }, { status: 400 });
        }

        const contact = await database.contacts.findById(contactId, userId);

        if (!contact || contact.user_id !== userId) {
            return json({ error: $_('api.contacts.contact_not_found') }, { status: 404 });
        }

        return json(contact, { status: 200 });
    } 
    catch (error) {
        return json({ error: $_('api.contacts.server_error') }, { status: 500 });
    }
}

export async function PUT({ params, request, locals }: any) {
    if(!locals.user) {
        return json({ error: $_('api.contacts.unauthorized_user') }, { status: 401 });
    }
    const userId = locals.user.id;
    try {
        const contactId = Number(params.id);
        const body: any = await request.json();
        const { first_name, last_name, notes } = body;

        if (isNaN(contactId) || !first_name || !last_name) {
            return json({ error: $_('api.contacts.missing_fields') }, { status: 400 });
        }

        const contact = await database.contacts.findById(contactId, userId);

        if (!contact || contact.user_id !== userId) {
            return json({ error: $_('api.contacts.contact_not_found') }, { status: 404 });
        }

        await database.contacts.update(contactId, userId, {
            first_name,
            last_name,
            notes
        });

        const phoneNumbers: any[] = await database.phoneNumbers.findByContactId(contactId);
        const existingPhoneNumberIds = phoneNumbers.map((pn: any) => pn.id);
        const incomingPhoneNumberIds = (body.phone_numbers || []).map((pn: any) => pn.id).filter((id: any) => id !== undefined);


        for (const pn of (body.phone_numbers || [])) {
            const item: any = pn;
            if (item.id && existingPhoneNumberIds.includes(item.id)) {
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
            if (!incomingPhoneNumberIds.includes(existingId)) {
                await database.phoneNumbers.delete(existingId);
            }
        }

        return json({ message: $_('api.contacts.success_update') }, { status: 200 });
    } 
    catch (error) {
        return json({ error: $_('api.contacts.failed_update') }, { status: 500 });
    }
}

export async function DELETE({ params, locals }) {
    if(!locals.user) {
        return json({ error: $_('api.contacts.unauthorized_user') }, { status: 401 });
    }
    const userId = locals.user.id;
    try {
        const contactId = Number(params.id);

        if (isNaN(contactId)) {
            return json({ error: $_('api.contacts.unauthorized_user') }, { status: 400 });
        }

        const contact = await database.contacts.findById(contactId, userId);
        
        if (!contact || contact.user_id !== userId) {
            return json({ error: $_('api.contacts.contact_not_found') }, { status: 404 });
        }

        await database.contacts.delete(contactId, userId);

        return json({ message: $_('api.contacts.success_delete') }, { status: 200 });
    } 
    catch (error) {
        return json({ error: $_('api.contacts.failed_delete') }, { status: 500 });
    }
}
