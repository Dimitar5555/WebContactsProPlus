import { json } from '@sveltejs/kit';
import { database } from '$lib/database';

export async function PUT({ params, request }) {
    try {
        const userId = Number(params.id);
        if (isNaN(userId)) {
            return json({ error: 'Invalid user ID' }, { status: 400 });
        }

        const body = await request.json();
        const { username, password, email } = body;

        await database.users.update(userId, { username, password, email });

        return json({ message: 'User updated successfully' }, { status: 200 });

    } catch (error) {
        return json({ error: 'Failed to update user' }, { status: 500 });
    }
}

export async function DELETE({ params }) {
    try {
        const userId = Number(params.id);

        if (isNaN(userId)) {
            return json({ error: 'Invalid user ID' }, { status: 400 });
        }
        await database.users.delete(userId);

        return json({ message: 'User deleted successfully' }, { status: 200 });

    } catch (error) {
        return json({ error: 'Failed to delete user' }, { status: 500 });
    }
}
