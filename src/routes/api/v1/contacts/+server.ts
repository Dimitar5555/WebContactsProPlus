import { json } from '@sveltejs/kit';
import { database } from '$lib/database';

export async function GET({ url }) {
    try {
        const userId = Number(url.searchParams.get('userId'));

        if (!userId || isNaN(userId)) {
            return json({ error: 'Missing or invalid userId parameter' }, { status: 400 });
        }

        const contacts = await database.contacts.findMany({ userId });
        return json(contacts, { status: 200 });
    } catch (error) {
        return json({ error: 'Failed to fetch contacts' }, { status: 500 });
    }
}

export async function POST({ request }) {
    try {
        const body = await request.json();
        const { user_id, first_name, last_name, is_favourite, notes } = body;

        if (!user_id || !first_name || !last_name) {
            return json({ error: 'user_id, first_name, and last_name are required' }, { status: 400 });
        }

        const newContactId = await database.contacts.create({
            user_id,
            first_name,
            last_name,
            is_favourite,
            notes
        });

        return json({ 
            message: 'Contact created successfully', 
            contactId: newContactId 
        }, { status: 201 });

    } catch (error) {
        return json({ error: 'Failed to create contact' }, { status: 500 });
    }
}
