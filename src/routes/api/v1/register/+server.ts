import { database } from '$lib/database';
import { json, error } from '@sveltejs/kit';
import bcrypt from 'bcrypt';

export async function POST({ request }: { request: Request }) {
    const data = await request.formData();
    const username = data.get('username')?.toString().trim();
    const password = data.get('password')?.toString() ?? '';
    const hashedPassword = bcrypt.hashSync(password, 10);
    const email = data.get('email')?.toString().trim();
    
    if (!username || !password || !email) {
        return error(400, 'api.register.missing_credentials');
    }

    const existingUserByEmail = await database.users.findByEmail(email);
    const existingUserByUsername = await database.users.findByUsername(username);
    if (existingUserByEmail || existingUserByUsername) {
        return error(400, 'api.register.exists');
    }

    await database.users.create({ username, password: hashedPassword, email });
    return json({ message: 'api.register.success_registration' }, { status: 201 });
}
