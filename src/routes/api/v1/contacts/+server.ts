import { json } from '@sveltejs/kit';
import { database } from '$lib/database';

export async function GET({ locals }) {
    if(!locals.user) {
        return json({ error: 'Unauthorized' }, { status: 401 });
    }
    const userId = locals.user.id;
    try {
        const contacts = await database.contacts.findMany({ userId });
        return json(contacts, { status: 200 });
    } 
    catch (error) {
        return json({ error: 'Failed to fetch contacts' }, { status: 500 });
    }
}

export async function POST({ request, locals }) {
    if(!locals.user) {
        return json({ error: 'Unauthorized' }, { status: 401 });
    }
    const userId = locals.user.id;
    try {
        const body = await request.json();
        const { first_name, last_name, notes } = body;

        if (!first_name || !last_name) {
            return json({ error: 'first_name and last_name are required' }, { status: 400 });
        }

        const newContactId = await database.contacts.create({
            user_id: userId,
            first_name,
            last_name,
            notes
        });

        const phoneNumbers = body.phone_numbers || [];
        for (const item of phoneNumbers) {
            if (item.phone_number) {
                const { phone_number, label } = item;
                await database.phoneNumbers.create({
                    contact_id: newContactId,
                    phone_number: phone_number,
                    label
                });
            }
        }

        return json({ 
            message: 'Contact created successfully', 
            contactId: newContactId 
        }, { status: 201 });

    }
    catch (error) {
        return json({ error: 'Failed to create contact' }, { status: 500 });
    }
}
