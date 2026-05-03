import { json } from '@sveltejs/kit';
import { database } from '$lib/database';

export async function POST({ request }) {
    try {
        const body = await request.json();
        const { username, password, email } = body;

        if (!username || !password || !email) {
            return json({ error: 'Missing required fields' }, { status: 400 });
        }

        const newUserId = await database.users.create({ 
            username, 
            password, 
            email 
        });

        return json({ 
            message: 'User created successfully', 
            userId: newUserId 
        }, { status: 201 });

    } catch (error: any) {
        if (error.message.includes('UNIQUE constraint failed')) {
            return json({ error: 'Username or email already exists' }, { status: 409 });
        }
        return json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
