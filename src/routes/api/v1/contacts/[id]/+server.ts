import { json } from '@sveltejs/kit';
import { database } from '$lib/database';

export async function GET({ params, locals }) {
    if(!locals.user) {
        return json({ error: 'Unauthorized' }, { status: 401 });
    }
    const userId = locals.user.id;
    try {
        const contactId = Number(params.id);

        if (isNaN(contactId)) {
            return json({ error: 'Invalid contact ID' }, { status: 400 });
        }

        const contact = await database.contacts.findById(contactId, userId);

        if (!contact || contact.user_id !== userId) {
            return json({ error: 'Contact not found' }, { status: 404 });
        }

        return json(contact, { status: 200 });
    } 
    catch (error) {
        return json({ error: 'Failed to fetch contact' }, { status: 500 });
    }
}

export async function PUT({ params, request, locals }) {
    if(!locals.user) {
        return json({ error: 'Unauthorized' }, { status: 401 });
    }
    const userId = locals.user.id;
    try {
        const contactId = Number(params.id);
        const body = await request.json();
        const { first_name, last_name, notes } = body;

        if (isNaN(contactId) || !first_name || !last_name) {
            return json({ error: 'Invalid ID, or missing required fields' }, { status: 400 });
        }

        const contact = await database.contacts.findById(contactId, userId);

        if (!contact || contact.user_id !== userId) {
            return json({ error: 'Contact not found' }, { status: 404 });
        }

        await database.contacts.update(contactId, userId, {
            first_name,
            last_name,
            notes
        });

        const phoneNumbers = await database.phoneNumbers.findByContactId(contactId);
        const existingPhoneNumberIds = phoneNumbers.map(pn => pn.id);
        const incomingPhoneNumberIds = body.phone_numbers.map(pn => pn.id).filter(id => id !== undefined);


        for (const pn of body.phone_numbers) {
            if (pn.id && existingPhoneNumberIds.includes(pn.id)) {
                await database.phoneNumbers.update(pn.id, {
                    phone_number: pn.phone_number,
                    label: pn.label
                });
            }
            else {
                await database.phoneNumbers.create({
                    contact_id: contactId,
                    phone_number: pn.phone_number,
                    label: pn.label
                });
            }
        }

        for (const existingId of existingPhoneNumberIds) {
            if (!incomingPhoneNumberIds.includes(existingId)) {
                await database.phoneNumbers.delete(existingId);
            }
        }

        return json({ message: 'Contact updated successfully' }, { status: 200 });
    } 
    catch (error) {
        return json({ error: 'Failed to update contact' + error.message }, { status: 500 });
    }
}

export async function DELETE({ params, locals }) {
    if(!locals.user) {
        return json({ error: 'Unauthorized' }, { status: 401 });
    }
    const userId = locals.user.id;
    try {
        const contactId = Number(params.id);

        if (isNaN(contactId)) {
            return json({ error: 'Invalid contact ID or missing userId' }, { status: 400 });
        }

        const contact = await database.contacts.findById(contactId, userId);
        
        if (!contact || contact.user_id !== userId) {
            return json({ error: 'Contact not found' }, { status: 404 });
        }

        await database.contacts.delete(contactId, userId);

        return json({ message: 'Contact deleted successfully' }, { status: 200 });
    } 
    catch (error) {
        return json({ error: 'Failed to delete contact' }, { status: 500 });
    }
}
