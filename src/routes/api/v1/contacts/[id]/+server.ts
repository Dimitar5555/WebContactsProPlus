import { json } from '@sveltejs/kit';
import { database } from '$lib/database';

export async function GET({ params, url }) {
    try {
        const contactId = Number(params.id);
        const userId = Number(url.searchParams.get('userId'));

        if (isNaN(contactId) || !userId || isNaN(userId)) {
            return json({ error: 'Invalid contact ID or missing userId' }, { status: 400 });
        }

        const contact = await database.contacts.findById(contactId, userId);

        if (!contact) {
            return json({ error: 'Contact not found' }, { status: 404 });
        }

        return json(contact, { status: 200 });
    } catch (error) {
        return json({ error: 'Failed to fetch contact' }, { status: 500 });
    }
}

export async function PUT({ params, request }) {
    try {
        const contactId = Number(params.id);
        const body = await request.json();
        const { userId, first_name, last_name, is_favourite, notes } = body;

        if (isNaN(contactId) || !userId || !first_name || !last_name) {
            return json({ error: 'Invalid ID, or missing required fields' }, { status: 400 });
        }

        await database.contacts.update(contactId, userId, {
            first_name,
            last_name,
            is_favourite,
            notes
        });

        return json({ message: 'Contact updated successfully' }, { status: 200 });
    } catch (error) {
        return json({ error: 'Failed to update contact' }, { status: 500 });
    }
}

export async function DELETE({ params, url }) {
    try {
        const contactId = Number(params.id);
        const userId = Number(url.searchParams.get('userId'));

        if (isNaN(contactId) || !userId || isNaN(userId)) {
            return json({ error: 'Invalid contact ID or missing userId' }, { status: 400 });
        }

        await database.contacts.delete(contactId, userId);

        return json({ message: 'Contact deleted successfully' }, { status: 200 });
    } catch (error) {
        return json({ error: 'Failed to delete contact' }, { status: 500 });
    }
}
