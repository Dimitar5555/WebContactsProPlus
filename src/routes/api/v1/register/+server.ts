import { database } from '$lib/database';
import { json, error } from '@sveltejs/kit';
import bcrypt from 'bcrypt';

function validateForm(email: string, username: string, password: string): boolean {
    if(!email || !username || !password) {
        return false;
    }
    if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return false;
    }
    if(password.length < 8) {
        return false;
    }
    if(username.length < 3 || username.length > 20) {
        return false;
    }
    if(/^[a-zA-Z0-9_]+$/.test(username) === false) {
        return false;
    }
    return true;
}

export async function POST({ request, response }: { request: Request, response: Response }) {
    const data = await request.json();
    const username = data.username?.toString().trim();
    const password = data.password?.toString() ?? '';
    const hashedPassword = bcrypt.hashSync(password, 10);
    const email = data.email?.toString().trim();

    if(!validateForm(email, username, password)) {
        return error(400, 'api.register.invalid_email_username_password');
    }

    const existingUserByEmail = await database.users.findByEmail(email);
    const existingUserByUsername =
        await database.users.findByUsername(username);
    if(existingUserByEmail || existingUserByUsername) {
        return error(409, 'api.register.already_exists');
    }

    await database.users.create({ username, password: hashedPassword, email });
    return json(
        { message: 'api.register.success' },
        { status: 201 }
    );
}
