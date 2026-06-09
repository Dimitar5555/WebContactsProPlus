import { json, error } from '@sveltejs/kit';
import { database } from '$lib/database';
import { getAuthenticatedUser } from '$lib/server/auth.js';

export async function GET({ locals }) {
    const user = getAuthenticatedUser(locals);
    const contacts = await database.contacts.findMany({ userId: user.id });
    return json({ contacts }, { status: 200 });
}

export async function POST({ request, locals }) {
    const user = getAuthenticatedUser(locals);
    const body = await request.json();
    const { first_name, last_name, notes } = body;

    if(!first_name || !last_name) {
        return error(400, 'api.contacts.missing_fields');
    }

    const newContactId = await database.contacts.create({
        user_id: user.id,
        first_name,
        last_name,
        notes
    });

    const phoneNumbers = body.phone_numbers || [];
    for (const item of phoneNumbers) {
        if(item.phone_number) {
            const { phone_number, label } = item;
            await database.phoneNumbers.create({
                contact_id: newContactId,
                phone_number: phone_number,
                label
            });
        }
    }

    return json(
        {
            message: 'api.contacts.create.success',
            contactId: newContactId
        },
        { status: 201 }
    );
}
